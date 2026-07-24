const QRCode = require('../models/QRCode');
const User = require('../models/User');
const MedicalProfile = require('../models/MedicalProfile');
const { generateQr } = require('../services/adminIdCardService');

const calculateAge = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday = today.getUTCMonth() < birth.getUTCMonth()
    || (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 && age <= 130 ? age : null;
};

const emergencyProjection = (profile, qr) => ({
  qrId: String(qr._id),
  elderlyCareId: `EC-${String(profile.userId).slice(-8).toUpperCase()}`,
  name: profile.name,
  approximateAge: calculateAge(profile.dob),
  bloodGroup: profile.bloodGroup || 'Unknown',
  severeAllergies: [...(profile.allergies || []), profile.allergiesOther].filter(Boolean),
  majorConditions: [...(profile.medicalHistory || []), profile.medicalHistoryOther].filter(Boolean),
  criticalMedications: [...(profile.medications || []), profile.medicationsOther].filter(Boolean),
  emergencyInstruction: 'Contact the listed guardian and local emergency services when immediate help is needed.',
  emergencyContacts: [{ name: profile.emergencyContact, phone: profile.emergencyPhone, priority: 1 }],
  lastUpdatedAt: profile.updatedAt
});

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
    const qr = await QRCode.findOne({ token: req.params.token }).select('_id userId status').lean();
    if (!qr || qr.status !== 'active') return res.status(410).send('This emergency QR code is invalid or has been revoked.');
    const user = await User.findById(qr.userId).select('accountStatus isDeleted').lean();
    if (!user || user.accountStatus !== 'active' || user.isDeleted) return res.status(410).send('This emergency QR code is no longer active.');
    const frontend = String(process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0].trim().replace(/\/+$/, '');
    return res.redirect(302, `${frontend}/emergency/${encodeURIComponent(req.params.token)}`);
  } catch (error) {
    return res.status(500).send('Unable to validate this emergency QR code.');
  }
};

exports.getPublicEmergencyProfile = async (req, res) => {
  try {
    const qr = await QRCode.findOne({ token: req.params.token }).select('_id userId status updatedAt').lean();
    if (!qr || qr.status !== 'active') return res.status(410).json({ message: 'This emergency QR code is invalid or has been revoked.', code: 'QR_ACCESS_REVOKED' });
    const [user, profile] = await Promise.all([
      User.findById(qr.userId).select('accountStatus isDeleted').lean(),
      MedicalProfile.findOne({ userId: qr.userId }).sort({ createdAt: -1 }).lean()
    ]);
    if (!user || user.accountStatus !== 'active' || user.isDeleted || !profile) return res.status(410).json({ message: 'This emergency profile is no longer available.', code: 'EMERGENCY_PROFILE_INACTIVE' });
    res.set('Cache-Control', 'no-store, private');
    return res.json({ emergencyProfile: emergencyProjection(profile, qr) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load the emergency profile.', code: 'EMERGENCY_PROFILE_ERROR' });
  }
};

exports.calculateAge = calculateAge;
exports.emergencyProjection = emergencyProjection;
