const EmergencyAlert = require('../models/EmergencyAlert');
const QRCode = require('../models/QRCode');
const User = require('../models/User');
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
    const alert = await EmergencyAlert.create({
      userId: qr.userId,
      scannedQrId: qr._id,
      ipHash,
      duplicateKey: key,
      notificationChannels: ['email'],
      deliveryStatuses: [{ channel: 'email', status: 'pending' }],
      status: 'sending'
    });

    try {
      const delivery = await sendGenericActivationEmail({
        to: user.email,
        elderlyCareId: `EC-${String(qr.userId).slice(-8).toUpperCase()}`,
        activatedAt
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
