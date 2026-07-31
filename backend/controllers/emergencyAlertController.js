const EmergencyAlert = require('../models/EmergencyAlert');
const QRCode = require('../models/QRCode');
const User = require('../models/User');
const MedicalProfile = require('../models/MedicalProfile');
const QrAccessLog = require('../models/QrAccessLog');
const crypto = require('crypto');
const {
  duplicateKey, hashIp, sendGenericActivationEmail
} = require('../services/emergencyAlertService');

const DUPLICATE_WINDOW_MS = 2 * 60 * 1000;

exports.createPublicAlert = async (req, res) => {
  try {
    const qr = await QRCode.findOne({ token: req.params.token, status: 'active' }).select('_id userId').lean();
    if (!qr) return res.status(410).json({ message: 'This QR code is unavailable.', code: 'QR_ACCESS_REVOKED' });
    const user = await User.findOne({
      _id: qr.userId, accountStatus: 'active', isDeleted: false, isVerified: true
    }).select('email').lean();
    if (!user) return res.status(410).json({ message: 'This emergency profile is inactive.', code: 'EMERGENCY_PROFILE_INACTIVE' });

    const ipHash = hashIp(req.ip);
    const key = duplicateKey({ qrId: qr._id, ipHash });
    const recent = await EmergencyAlert.findOne({
      duplicateKey: key,
      createdAt: { $gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) }
    }).select('_id status createdAt').lean();
    if (recent) return res.status(429).json({
      message: 'An alert was already submitted recently. Please call the emergency contact for immediate assistance.',
      code: 'DUPLICATE_ALERT',
      alert: recent
    });

    const activatedAt = new Date();
    const profile = await MedicalProfile.findOne({ userId: qr.userId }).sort({ createdAt: -1 }).lean();
    const body = req.body || {};
    const emergencyType = ['person_found', 'medical_emergency', 'fall', 'lost_confused', 'accident', 'other'].includes(body.emergencyType) ? body.emergencyType : 'medical_emergency';
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    const hasLocation = Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
    const mapUrl = hasLocation ? `https://maps.google.com/?q=${latitude},${longitude}` : null;
    const acknowledgementToken = crypto.randomBytes(32).toString('base64url');
    const acknowledgementTokenHash = crypto.createHash('sha256').update(acknowledgementToken).digest('hex');
    const alert = await EmergencyAlert.create({
      userId: qr.userId,
      scannedQrId: qr._id,
      ipHash,
      duplicateKey: key,
      emergencyType,
      responderName: String(body.responderName || '').trim().slice(0, 80) || null,
      responderPhone: String(body.responderPhone || '').trim().slice(0, 30) || null,
      responderMessage: String(body.responderMessage || '').trim().slice(0, 500) || null,
      location: hasLocation ? { latitude, longitude, accuracy: Number(body.locationAccuracy) || null, mapUrl } : undefined,
      acknowledgementTokenHash,
      notificationChannels: ['email'],
      deliveryStatuses: [{ channel: 'email', status: 'pending' }],
      status: 'sending'
    });

    try {
      const verifiedRecipients = (profile?.emergencyContacts || [])
        .filter((contact) => contact.email && contact.canReceiveAlerts !== false && contact.verificationStatus === 'verified')
        .map((contact) => contact.email);
      const recipients = [...new Set([user.email, ...verifiedRecipients])];
      const frontend = String(process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0].trim().replace(/\/+$/, '');
      const delivery = await sendGenericActivationEmail({
        to: recipients,
        elderlyCareId: profile?.elderlyCareId || `EC-${String(qr.userId).slice(-8).toUpperCase()}`,
        activatedAt, emergencyType, responderMessage: body.responderMessage, mapUrl,
        acknowledgementUrl: `${frontend}/alert-acknowledge/${acknowledgementToken}`
      });
      alert.deliveryStatuses = [{ channel: 'email', status: 'sent', providerId: delivery?.id || null }];
      alert.status = 'sent';
    } catch (error) {
      alert.deliveryStatuses = [{
        channel: 'email', status: 'failed', error: String(error.message).slice(0, 200)
      }];
      alert.status = 'failed';
    }
    await alert.save();
    QrAccessLog.create({ qrId: qr._id, userId: qr.userId, event: 'alert_created', ipHash, userAgentFamily: String(req.get('user-agent') || 'Unknown').slice(0, 80) }).catch(() => {});

    return res.status(201).json({
      message: alert.status === 'sent'
        ? 'The account owner was notified.'
        : 'The alert was recorded, but email delivery failed. Please call the emergency contact.',
      alert: { id: alert._id, status: alert.status, createdAt: alert.createdAt }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create the emergency alert.', code: 'ALERT_CREATE_FAILED' });
  }
};

exports.acknowledgePublicAlert = async (req, res) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(String(req.params.token || '')).digest('hex');
    const action = ['received', 'calling', 'going_to_location', 'services_contacted', 'resolved'].includes(req.body.action) ? req.body.action : null;
    if (!action) return res.status(400).json({ message: 'Choose a valid acknowledgement action' });
    const alert = await EmergencyAlert.findOne({ acknowledgementTokenHash: tokenHash }).select('+acknowledgementTokenHash');
    if (!alert) return res.status(404).json({ message: 'Alert acknowledgement link is invalid' });
    alert.acknowledgementAction = action;
    alert.acknowledgedAt = new Date();
    alert.status = action === 'resolved' ? 'resolved' : 'acknowledged';
    if (action === 'resolved') alert.resolvedAt = new Date();
    await alert.save();
    return res.json({ message: action === 'resolved' ? 'Alert marked as resolved' : 'Alert acknowledgement saved', status: alert.status });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to acknowledge this alert' });
  }
};
