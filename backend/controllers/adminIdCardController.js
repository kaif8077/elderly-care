const { generateQr, getCard, revokeQr } = require('../services/adminIdCardService');
const { writeAuditLog } = require('../services/auditService');

exports.getCard = async (req, res) => {
  try {
    const result = await getCard(req.params.userId);
    if (!result) return res.status(404).json({ message: 'User not found' });
    res.json(result);
  } catch (error) {
    console.error('Admin ID card load error:', error.message);
    res.status(500).json({ message: 'Unable to load ID card' });
  }
};

exports.regenerateQr = async (req, res) => {
  try {
    const result = await generateQr({ userId: req.params.userId, adminId: req.admin._id });
    if (!result) return res.status(404).json({ message: 'User not found' });
    await writeAuditLog({
      req, actor: req.admin, action: 'ADMIN_QR_REGENERATED', resourceType: 'QRCode',
      resourceId: result.qr._id, affectedUserId: result.user._id,
      description: 'Admin generated a new opaque emergency QR token'
    });
    res.status(201).json({ message: 'QR code generated', qrStatus: 'active' });
  } catch (error) {
    if (error.code === 'PROFILE_REQUIRED' || error.code === 'ACCOUNT_NOT_ACTIVE') {
      return res.status(409).json({ message: error.message, code: error.code });
    }
    console.error('Admin QR generation error:', error.message);
    res.status(500).json({ message: 'Unable to generate QR code' });
  }
};

exports.revokeQr = async (req, res) => {
  try {
    const result = await revokeQr({ userId: req.params.userId, adminId: req.admin._id });
    if (!result) return res.status(404).json({ message: 'User not found' });
    await writeAuditLog({
      req, actor: req.admin, action: 'ADMIN_QR_REVOKED', resourceType: 'QRCode',
      affectedUserId: result.user._id, description: 'Admin revoked active QR access'
    });
    res.json({ message: 'QR access revoked', revokedCount: result.revokedCount });
  } catch (error) {
    console.error('Admin QR revocation error:', error.message);
    res.status(500).json({ message: 'Unable to revoke QR access' });
  }
};
