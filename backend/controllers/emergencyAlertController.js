const EmergencyAlert = require('../models/EmergencyAlert');
const QRCode = require('../models/QRCode');
const User = require('../models/User');
const MedicalProfile = require('../models/MedicalProfile');
const QrAccessLog = require('../models/QrAccessLog');
const CareRelationship = require('../models/CareRelationship');
const crypto = require('crypto');
const mongoose = require('mongoose');
const {
  duplicateKey,
  hashIp,
  sendGenericActivationEmail
} = require('../services/emergencyAlertService');

const DUPLICATE_WINDOW_MS = 2 * 60 * 1000;
const ACKNOWLEDGEMENT_ACTIONS = [
  'received',
  'calling',
  'going_to_location',
  'services_contacted',
  'resolved'
];
const ALERT_STATUSES = [
  'created',
  'sending',
  'sent',
  'partially_sent',
  'failed',
  'acknowledged',
  'resolved',
  'false_alarm'
];

// Resolves the elder profiles that the signed-in owner or caregiver may access.
const accessibleElderIds = async (userId) => {
  const relationships = await CareRelationship.find({
    memberUserId: userId,
    status: 'active',
    permissions: 'alerts.receive'
  })
    .select('elderUserId')
    .lean();
  return [userId, ...relationships.map(({ elderUserId }) => elderUserId)];
};

// Limits an alert response to responder and delivery fields safe for the UI.
const safeAlert = (alert) => ({
  id: alert._id,
  elderlyPerson:
    alert.userId && typeof alert.userId === 'object'
      ? { id: alert.userId._id, name: alert.userId.name }
      : { id: alert.userId },
  emergencyType: alert.emergencyType,
  responderName: alert.responderName,
  responderPhone: alert.responderPhone,
  responderMessage: alert.responderMessage,
  location: alert.location,
  notificationChannels: alert.notificationChannels,
  deliveryStatuses: alert.deliveryStatuses,
  status: alert.status,
  acknowledgementAction: alert.acknowledgementAction,
  acknowledgedBy: alert.acknowledgedBy,
  acknowledgedAt: alert.acknowledgedAt,
  acknowledgementHistory: alert.acknowledgementHistory || [],
  resolvedAt: alert.resolvedAt,
  createdAt: alert.createdAt,
  updatedAt: alert.updatedAt
});

const saveAcknowledgement = async ({
  alert,
  action,
  actorType,
  actorId = null,
  actorName = null
}) => {
  if (alert.status === 'resolved' && action !== 'resolved') return false;
  const now = new Date();
  alert.acknowledgementAction = action;
  alert.acknowledgedAt = now;
  alert.acknowledgedBy = actorId;
  alert.status = action === 'resolved' ? 'resolved' : 'acknowledged';
  if (action === 'resolved') {
    alert.resolvedAt = now;
    alert.acknowledgementTokenHash = null;
    alert.acknowledgementTokenExpiresAt = null;
  }
  alert.acknowledgementHistory.push({ action, actorType, actorId, actorName, createdAt: now });
  await alert.save();
  return true;
};

// Creates a rate-limited public emergency alert from a valid QR token.
exports.createPublicAlert = async (req, res) => {
  try {
    const qr = await QRCode.findOne({ token: req.params.token, status: 'active' })
      .select('_id userId')
      .lean();
    if (!qr)
      return res
        .status(410)
        .json({ message: 'This QR code is unavailable.', code: 'QR_ACCESS_REVOKED' });
    const user = await User.findOne({
      _id: qr.userId,
      accountStatus: 'active',
      isDeleted: false,
      isVerified: true
    })
      .select('email')
      .lean();
    if (!user)
      return res.status(410).json({
        message: 'This emergency profile is inactive.',
        code: 'EMERGENCY_PROFILE_INACTIVE'
      });

    const ipHash = hashIp(req.ip);
    const key = duplicateKey({ qrId: qr._id, ipHash });
    const recent = await EmergencyAlert.findOne({
      duplicateKey: key,
      createdAt: { $gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) }
    })
      .select('_id status createdAt')
      .lean();
    if (recent)
      return res.status(429).json({
        message:
          'An alert was already submitted recently. Please call the emergency contact for immediate assistance.',
        code: 'DUPLICATE_ALERT',
        alert: recent
      });

    const activatedAt = new Date();
    const profile = await MedicalProfile.findOne({ userId: qr.userId })
      .sort({ createdAt: -1 })
      .lean();
    const body = req.body || {};
    const emergencyType = [
      'person_found',
      'medical_emergency',
      'fall',
      'lost_confused',
      'accident',
      'other'
    ].includes(body.emergencyType)
      ? body.emergencyType
      : 'medical_emergency';
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    const hasLocation =
      Number.isFinite(latitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      Number.isFinite(longitude) &&
      longitude >= -180 &&
      longitude <= 180;
    const mapUrl = hasLocation ? `https://maps.google.com/?q=${latitude},${longitude}` : null;
    const acknowledgementToken = crypto.randomBytes(32).toString('base64url');
    const acknowledgementTokenHash = crypto
      .createHash('sha256')
      .update(acknowledgementToken)
      .digest('hex');
    const alert = await EmergencyAlert.create({
      userId: qr.userId,
      scannedQrId: qr._id,
      ipHash,
      duplicateKey: key,
      emergencyType,
      responderName:
        String(body.responderName || '')
          .trim()
          .slice(0, 80) || null,
      responderPhone:
        String(body.responderPhone || '')
          .trim()
          .slice(0, 30) || null,
      responderMessage:
        String(body.responderMessage || '')
          .trim()
          .slice(0, 500) || null,
      location: hasLocation
        ? { latitude, longitude, accuracy: Number(body.locationAccuracy) || null, mapUrl }
        : undefined,
      acknowledgementTokenHash,
      acknowledgementTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      notificationChannels: ['email'],
      deliveryStatuses: [{ channel: 'email', status: 'pending' }],
      status: 'sending'
    });

    try {
      const verifiedRecipients = (profile?.emergencyContacts || [])
        .filter(
          (contact) =>
            contact.email &&
            contact.canReceiveAlerts !== false &&
            contact.verificationStatus === 'verified'
        )
        .map((contact) => contact.email);
      const recipients = [...new Set([user.email, ...verifiedRecipients])];
      const frontend = String(process.env.FRONTEND_URL || 'http://localhost:3000')
        .split(',')[0]
        .trim()
        .replace(/\/+$/, '');
      const delivery = await sendGenericActivationEmail({
        to: recipients,
        elderlyCareId: profile?.elderlyCareId || `EC-${String(qr.userId).slice(-8).toUpperCase()}`,
        activatedAt,
        emergencyType,
        responderMessage: body.responderMessage,
        mapUrl,
        locationAccuracy: hasLocation ? Number(body.locationAccuracy) || null : null,
        acknowledgementUrl: `${frontend}/alert-acknowledge/${acknowledgementToken}`
      });
      alert.deliveryStatuses = [
        { channel: 'email', status: 'sent', providerId: delivery?.id || null }
      ];
      alert.status = 'sent';
    } catch (error) {
      alert.deliveryStatuses = [
        {
          channel: 'email',
          status: 'failed',
          error: String(error.message).slice(0, 200)
        }
      ];
      alert.status = 'failed';
    }
    await alert.save();
    QrAccessLog.create({
      qrId: qr._id,
      userId: qr.userId,
      event: 'alert_created',
      ipHash,
      userAgentFamily: String(req.get('user-agent') || 'Unknown').slice(0, 80)
    }).catch(() => {});

    return res.status(201).json({
      message:
        alert.status === 'sent'
          ? 'The account owner was notified.'
          : 'The alert was recorded, but email delivery failed. Please call the emergency contact.',
      alert: { id: alert._id, status: alert.status, createdAt: alert.createdAt }
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Unable to create the emergency alert.', code: 'ALERT_CREATE_FAILED' });
  }
};

// Records an emergency contact's response through a single-use public token.
exports.acknowledgePublicAlert = async (req, res) => {
  try {
    const tokenHash = crypto
      .createHash('sha256')
      .update(String(req.params.token || ''))
      .digest('hex');
    const action = ACKNOWLEDGEMENT_ACTIONS.includes(req.body.action) ? req.body.action : null;
    if (!action) return res.status(400).json({ message: 'Choose a valid acknowledgement action' });
    const alert = await EmergencyAlert.findOne({
      acknowledgementTokenHash: tokenHash,
      acknowledgementTokenExpiresAt: { $gt: new Date() }
    }).select('+acknowledgementTokenHash +acknowledgementTokenExpiresAt');
    if (!alert)
      return res.status(404).json({ message: 'Alert acknowledgement link is invalid or expired' });
    const saved = await saveAcknowledgement({ alert, action, actorType: 'public_link' });
    if (!saved) return res.status(409).json({ message: 'This alert is already resolved' });
    return res.json({
      message: action === 'resolved' ? 'Alert marked as resolved' : 'Alert acknowledgement saved',
      status: alert.status
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to acknowledge this alert' });
  }
};

// Lists emergency alerts accessible to the signed-in member.
exports.listMyAlerts = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 5), 50);
    const elderIds = await accessibleElderIds(req.user.id);
    const match = { userId: { $in: elderIds } };
    if (req.query.status === 'open') match.status = { $nin: ['resolved', 'false_alarm'] };
    else if (ALERT_STATUSES.includes(req.query.status)) match.status = req.query.status;
    const [alerts, total] = await Promise.all([
      EmergencyAlert.find(match)
        .populate('userId', 'name')
        .populate('acknowledgedBy', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      EmergencyAlert.countDocuments(match)
    ]);
    return res.json({
      alerts: alerts.map(safeAlert),
      pagination: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load emergency alerts' });
  }
};

// Returns one authorized alert with its acknowledgement timeline.
exports.getMyAlert = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: 'Invalid emergency alert ID' });
    const elderIds = await accessibleElderIds(req.user.id);
    const alert = await EmergencyAlert.findOne({ _id: req.params.id, userId: { $in: elderIds } })
      .populate('userId', 'name')
      .populate('acknowledgedBy', 'name')
      .populate('acknowledgementHistory.actorId', 'name')
      .lean();
    if (!alert) return res.status(404).json({ message: 'Emergency alert not found' });
    return res.json({ alert: safeAlert(alert) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load this emergency alert' });
  }
};

// Saves the signed-in member's acknowledgement action for an alert.
exports.acknowledgeMyAlert = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: 'Invalid emergency alert ID' });
    const action = ACKNOWLEDGEMENT_ACTIONS.includes(req.body.action) ? req.body.action : null;
    if (!action) return res.status(400).json({ message: 'Choose a valid acknowledgement action' });
    const elderIds = await accessibleElderIds(req.user.id);
    const [alert, actor] = await Promise.all([
      EmergencyAlert.findOne({ _id: req.params.id, userId: { $in: elderIds } }),
      User.findById(req.user.id).select('name').lean()
    ]);
    if (!alert) return res.status(404).json({ message: 'Emergency alert not found' });
    const saved = await saveAcknowledgement({
      alert,
      action,
      actorType: 'account',
      actorId: req.user.id,
      actorName: actor?.name || 'Care team member'
    });
    if (!saved) return res.status(409).json({ message: 'This alert is already resolved' });
    return res.json({
      message: action === 'resolved' ? 'Alert marked as resolved' : 'Acknowledgement saved',
      alert: safeAlert(alert)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to acknowledge this emergency alert' });
  }
};

exports.ACKNOWLEDGEMENT_ACTIONS = ACKNOWLEDGEMENT_ACTIONS;
