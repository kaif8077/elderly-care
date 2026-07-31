const crypto = require('crypto');
const CareRelationship = require('../models/CareRelationship');
const MedicalProfile = require('../models/MedicalProfile');
const NotificationPreference = require('../models/NotificationPreference');
const QrAccessLog = require('../models/QrAccessLog');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');

const PRIVACY_LEVELS = ['public_emergency', 'emergency_contacts', 'owner_only', 'hidden'];
const PRIVACY_FIELDS = ['name', 'approximateAge', 'bloodGroup', 'allergies', 'medicalHistory', 'medications', 'mobilityStatus', 'preferredLanguage', 'phone', 'address', 'insurance'];
const CARE_PERMISSIONS = ['profile.read', 'profile.update', 'alerts.receive', 'reminders.manage'];

const profileCompletion = (profile) => {
  if (!profile) return { percent: 0, missing: ['profile'] };
  const primary = profile.emergencyContacts?.[0];
  const required = {
    profilePhoto: profile.profilePhoto?.fileId,
    name: profile.name, dob: profile.dob, gender: profile.gender, bloodGroup: profile.bloodGroup,
    height: profile.height, weight: profile.weight, dietPreference: profile.dietPreference,
    phone: profile.phone, address: profile.address,
    emergencyContact: profile.emergencyContact || primary?.name,
    emergencyPhone: profile.emergencyPhone || primary?.phone
  };
  const missing = Object.entries(required).filter(([, value]) => value === null || value === undefined || value === '').map(([key]) => key);
  return { percent: Math.round(((Object.keys(required).length - missing.length) / Object.keys(required).length) * 100), missing };
};

exports.getOverview = async (req, res) => {
  const [profile, preferences, careTeam, reminders, qrHistory] = await Promise.all([
    MedicalProfile.findOne({ userId: req.user.id }).sort({ createdAt: -1 }).lean(),
    NotificationPreference.findOne({ userId: req.user.id }).select('-telegramChatId -pushSubscriptions').lean(),
    CareRelationship.find({ elderUserId: req.user.id, status: { $ne: 'revoked' } }).select('-invitationTokenHash').sort({ createdAt: -1 }).lean(),
    Reminder.find({ userId: req.user.id, status: 'active' }).sort({ scheduledFor: 1 }).limit(20).lean(),
    QrAccessLog.find({ userId: req.user.id }).select('event userAgentFamily occurredAt').sort({ occurredAt: -1 }).limit(20).lean()
  ]);
  return res.json({
    completion: profileCompletion(profile),
    privacy: profile?.visibilitySettings || {},
    consent: profile?.consent || {},
    emergencyContacts: (profile?.emergencyContacts || []).map((contact) => ({
      id: contact._id, name: contact.name, email: contact.email, phone: contact.phone,
      relationship: contact.relationship, priority: contact.priority, isPrimary: contact.isPrimary,
      canReceiveAlerts: contact.canReceiveAlerts, verificationStatus: contact.verificationStatus
    })),
    preferences: preferences || { email: true, push: false, telegram: false, emergencyAlerts: true, reminders: true, profileReview: true },
    careTeam,
    reminders,
    qrHistory
  });
};

exports.updatePrivacy = async (req, res) => {
  const updates = {};
  Object.entries(req.body.visibility || {}).forEach(([field, level]) => {
    if (PRIVACY_FIELDS.includes(field) && PRIVACY_LEVELS.includes(level)) updates[`visibilitySettings.${field}`] = level;
  });
  if (req.body.consent && typeof req.body.consent === 'object') {
    ['emergencySharing', 'recommendationGeneration', 'qrAccessLogging'].forEach((field) => {
      if (typeof req.body.consent[field] === 'boolean') updates[`consent.${field}`] = req.body.consent[field];
    });
    updates['consent.acceptedAt'] = new Date();
  }
  const profile = await MedicalProfile.findOneAndUpdate({ userId: req.user.id }, { $set: updates }, { new: true, runValidators: true });
  if (!profile) return res.status(404).json({ message: 'Medical profile not found' });
  return res.json({ message: 'Privacy settings saved', visibility: profile.visibilitySettings, consent: profile.consent });
};

exports.updatePreferences = async (req, res) => {
  const allowed = ['email', 'push', 'telegram', 'emergencyAlerts', 'reminders', 'profileReview'];
  const values = {};
  allowed.forEach((field) => { if (typeof req.body[field] === 'boolean') values[field] = req.body[field]; });
  const preferences = await NotificationPreference.findOneAndUpdate(
    { userId: req.user.id }, { $set: values }, { upsert: true, new: true, runValidators: true }
  ).select('-telegramChatId -pushSubscriptions');
  return res.json({ message: 'Notification preferences saved', preferences });
};

exports.createReminder = async (req, res) => {
  const { type, title, notes, scheduledFor, recurrence, channels } = req.body;
  if (!type || !title || !scheduledFor || Number.isNaN(new Date(scheduledFor).getTime())) {
    return res.status(400).json({ message: 'Type, title and a valid schedule are required' });
  }
  const reminder = await Reminder.create({ userId: req.user.id, type, title, notes, scheduledFor, recurrence, channels });
  return res.status(201).json({ message: 'Reminder created', reminder });
};

exports.updateReminder = async (req, res) => {
  const allowed = ['title', 'notes', 'scheduledFor', 'recurrence', 'channels', 'status'];
  const updates = {};
  allowed.forEach((field) => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });
  if (updates.status === 'completed') updates.completedAt = new Date();
  const reminder = await Reminder.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { $set: updates }, { new: true, runValidators: true });
  if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
  return res.json({ message: 'Reminder updated', reminder });
};

exports.inviteCareMember = async (req, res) => {
  const { email, role, permissions = [] } = req.body;
  if (!/^\S+@\S+\.\S+$/.test(String(email || '')) || !['guardian', 'caregiver', 'doctor'].includes(role)) {
    return res.status(400).json({ message: 'A valid email and care-team role are required' });
  }
  const safePermissions = permissions.filter((permission) => CARE_PERMISSIONS.includes(permission));
  const token = crypto.randomBytes(32).toString('base64url');
  const invitationTokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const relationship = await CareRelationship.findOneAndUpdate(
    { elderUserId: req.user.id, invitedEmail: String(email).toLowerCase(), role },
    { $set: { permissions: safePermissions, status: 'pending', invitationTokenHash, invitedAt: new Date(), revokedAt: null } },
    { upsert: true, new: true, runValidators: true }
  );
  const frontend = String(process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0].trim().replace(/\/+$/, '');
  sendEmail({
    to: email,
    subject: 'ElderlyCare care-team invitation',
    text: `You were invited as a ${role}. Sign in and accept: ${frontend}/care-invitation/${token}`,
    html: `<p>You were invited to an ElderlyCare care team as a <strong>${role}</strong>.</p><p><a href="${frontend}/care-invitation/${token}">Review invitation</a></p>`
  }).catch((error) => console.error('Care invitation email error:', error.message));
  return res.status(201).json({ message: 'Care-team invitation created', relationship: { ...relationship.toObject(), invitationTokenHash: undefined } });
};

exports.acceptCareInvitation = async (req, res) => {
  const hash = crypto.createHash('sha256').update(String(req.params.token || '')).digest('hex');
  const user = await User.findById(req.user.id).select('email').lean();
  const relationship = await CareRelationship.findOne({ invitationTokenHash: hash, status: 'pending' }).select('+invitationTokenHash');
  if (!relationship || relationship.invitedEmail !== user?.email) return res.status(404).json({ message: 'Invitation is invalid or belongs to another account' });
  relationship.memberUserId = req.user.id;
  relationship.status = 'active';
  relationship.acceptedAt = new Date();
  relationship.invitationTokenHash = null;
  await relationship.save();
  return res.json({ message: 'Care-team invitation accepted' });
};

exports.revokeCareMember = async (req, res) => {
  const relationship = await CareRelationship.findOneAndUpdate(
    { _id: req.params.id, elderUserId: req.user.id },
    { $set: { status: 'revoked', revokedAt: new Date(), invitationTokenHash: null } }, { new: true }
  );
  if (!relationship) return res.status(404).json({ message: 'Care-team member not found' });
  return res.json({ message: 'Care-team access revoked' });
};

exports.requestContactVerification = async (req, res) => {
  const profile = await MedicalProfile.findOne({ userId: req.user.id });
  const contact = profile?.emergencyContacts?.id(req.params.contactId);
  if (!contact) return res.status(404).json({ message: 'Emergency contact not found' });
  if (!contact.email) return res.status(400).json({ message: 'Add an email address before verification' });
  const token = crypto.randomBytes(32).toString('base64url');
  contact.verificationTokenHash = crypto.createHash('sha256').update(token).digest('hex');
  contact.verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  contact.verificationStatus = 'pending';
  await profile.save();
  const frontend = String(process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0].trim().replace(/\/+$/, '');
  sendEmail({
    to: contact.email,
    subject: 'Verify your ElderlyCare emergency contact role',
    text: `Confirm that you agree to be an emergency contact: ${frontend}/verify-emergency-contact/${token}`,
    html: `<p>You were listed as an ElderlyCare emergency contact.</p><p><a href="${frontend}/verify-emergency-contact/${token}">Confirm emergency contact</a></p>`
  }).catch((error) => console.error('Emergency contact verification email error:', error.message));
  return res.json({ message: 'Verification email sent' });
};

exports.verifyEmergencyContact = async (req, res) => {
  const hash = crypto.createHash('sha256').update(String(req.params.token || '')).digest('hex');
  const profile = await MedicalProfile.findOneAndUpdate(
    { emergencyContacts: { $elemMatch: { verificationTokenHash: hash, verificationExpiresAt: { $gt: new Date() } } } },
    {
      $set: {
        'emergencyContacts.$.verificationStatus': 'verified',
        'emergencyContacts.$.verifiedAt': new Date(),
        'emergencyContacts.$.verificationTokenHash': null,
        'emergencyContacts.$.verificationExpiresAt': null
      }
    },
    { new: true }
  );
  if (!profile) return res.status(404).json({ message: 'Verification link is invalid or expired' });
  return res.json({ message: 'Emergency contact verified successfully' });
};

exports.profileCompletion = profileCompletion;
exports.PRIVACY_FIELDS = PRIVACY_FIELDS;
