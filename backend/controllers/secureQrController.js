const QRCode = require('../models/QRCode');
const User = require('../models/User');
const { generateQr } = require('../services/adminIdCardService');

exports.createQRCode = async (req, res) => {
  const userId = req.body.userId;
  try {
    if (String(req.user.id) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'You can only generate your own QR code' });
    }
    const result = await generateQr({ userId, adminId: null });
    return res.status(201).json({
      success: true,
      qrCode: { data: result.qr.data, status: result.qr.status, createdAt: result.qr.createdAt },
      message: 'Secure QR code generated successfully'
    });
  } catch (error) {
    if (error.code === 'PROFILE_REQUIRED' || error.code === 'ACCOUNT_NOT_ACTIVE') {
      return res.status(409).json({ success: false, message: error.message, code: error.code });
    }
    console.error('Secure QR generation error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to generate QR code' });
  }
};

exports.getQRCode = async (req, res) => {
  if (String(req.user.id) !== String(req.params.userId)) {
    return res.status(403).json({ success: false, message: 'Unauthorized QR access' });
  }
  try {
    const qrCode = await QRCode.findOne({ userId: req.params.userId, status: 'active' })
      .sort({ createdAt: -1 })
      .select('data status createdAt updatedAt')
      .lean();
    if (!qrCode) return res.status(404).json({ success: false, message: 'Active QR code not found' });
    return res.json({ success: true, qrCode });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load QR code' });
  }
};

exports.serveLegacyLink = (req, res) => {
  res.status(410).send('This legacy QR link has been retired. Ask the account owner to generate a new secure QR code.');
};

exports.serveTokenAccess = async (req, res) => {
  try {
    const qr = await QRCode.findOne({ token: req.params.token }).select('userId status').lean();
    if (!qr || qr.status !== 'active') {
      return res.status(410).send('This emergency QR code is invalid or has been revoked.');
    }
    const user = await User.findById(qr.userId).select('accountStatus isDeleted').lean();
    if (!user || user.accountStatus !== 'active' || user.isDeleted) {
      return res.status(410).send('This emergency QR code is no longer active.');
    }
    return res.status(503).send('Secure emergency profile access is being upgraded. Please use the emergency contact printed on the card.');
  } catch (error) {
    return res.status(500).send('Unable to validate this emergency QR code.');
  }
};
