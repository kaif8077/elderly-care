const crypto = require('crypto');
const mongoose = require('mongoose');
const QRCodeGenerator = require('qrcode');
const User = require('../models/User');
const MedicalProfile = require('../models/MedicalProfile');
const QRCode = require('../models/QRCode');

const findManagedUser = (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;
  return User.findOne({ _id: userId, role: { $nin: ['admin', 'super_admin'] } });
};

const getCard = async (userId) => {
  const userQuery = findManagedUser(userId);
  if (!userQuery) return null;
  const user = await userQuery
    .select('name email accountStatus isDeleted createdAt updatedAt')
    .lean();
  if (!user) return null;

  const [profile, qr] = await Promise.all([
    MedicalProfile.findOne({ userId }).sort({ createdAt: -1 }).lean(),
    QRCode.findOne({ userId, status: 'active', token: { $exists: true, $ne: null } })
      .sort({ createdAt: -1 })
      .select('_id data status createdAt updatedAt token')
      .lean()
  ]);
  const primaryEmergency = profile?.emergencyContacts?.[0];

  return {
    user: {
      id: user._id,
      name: profile?.name || user.name,
      email: user.email,
      accountStatus: user.accountStatus,
      isDeleted: user.isDeleted
    },
    card: profile
      ? {
          elderlyCareId: profile.elderlyCareId || `EC-${String(user._id).slice(-8).toUpperCase()}`,
          name: profile.name,
          dob: profile.dob,
          bloodGroup: profile.bloodGroup || 'Unknown',
          emergencyContact: profile.emergencyContact || primaryEmergency?.name,
          emergencyPhone: profile.emergencyPhone || primaryEmergency?.phone,
          allergyWarning:
            [...(profile.allergies || []), profile.allergiesOther].filter(Boolean).join(', ') ||
            'None reported',
          preferredLanguage:
            [...(profile.preferredLanguage || []), profile.otherLanguage]
              .filter(Boolean)
              .join(', ') || 'Not provided',
          hasPhoto: Boolean(profile.profilePhoto?.fileId),
          status: user.accountStatus === 'active' && !user.isDeleted ? 'active' : 'inactive',
          lastUpdatedAt: profile.updatedAt,
          qr: qr
            ? {
                id: qr._id,
                image: qr.data,
                status: qr.status,
                generatedAt: qr.createdAt
              }
            : null
        }
      : null
  };
};

const revokeQr = async ({ userId, adminId }) => {
  const user = await findManagedUser(userId);
  if (!user) return null;

  const result = await QRCode.updateMany(
    { userId, status: { $ne: 'revoked' } },
    { $set: { status: 'revoked', revokedAt: new Date(), revokedBy: adminId } }
  );
  await MedicalProfile.updateMany({ userId }, { $set: { qrCodeImage: null } });
  return { user, revokedCount: result.modifiedCount };
};

const generateQr = async ({ userId, adminId }) => {
  const user = await findManagedUser(userId);
  if (!user) return null;
  if (user.accountStatus !== 'active' || user.isDeleted) {
    const error = new Error('QR codes can only be generated for active accounts');
    error.code = 'ACCOUNT_NOT_ACTIVE';
    throw error;
  }

  const profile = await MedicalProfile.findOne({ userId }).sort({ createdAt: -1 });
  if (!profile) {
    const error = new Error('A medical profile is required before generating an ID card');
    error.code = 'PROFILE_REQUIRED';
    throw error;
  }

  await QRCode.updateMany(
    { userId, status: { $ne: 'revoked' } },
    { $set: { status: 'revoked', revokedAt: new Date(), revokedBy: adminId } }
  );

  const token = crypto.randomBytes(32).toString('base64url');
  const frontendUrl = String(process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')[0]
    .trim()
    .replace(/\/+$/, '');
  const profileUrl = `${frontendUrl}/emergency/${token}`;
  const data = await QRCodeGenerator.toDataURL(profileUrl, {
    errorCorrectionLevel: 'H',
    width: 640,
    margin: 3
  });
  const qr = await QRCode.create({
    userId,
    data,
    token,
    profileUrl,
    status: 'active',
    generatedBy: adminId
  });

  profile.qrCodeImage = data;
  await profile.save();
  return { user, qr };
};

const updateAccountStatus = async ({ userId, status, adminId }) => {
  const user = await findManagedUser(userId);
  if (!user) return null;
  if (!['active', 'inactive', 'suspended'].includes(status)) {
    const error = new Error('Invalid account status');
    error.code = 'INVALID_ACCOUNT_STATUS';
    throw error;
  }

  const previousStatus = user.accountStatus;
  user.accountStatus = status;
  user.sessionVersion += 1;
  await user.save();

  let revokedCount = 0;
  if (status !== 'active') {
    const revoked = await revokeQr({ userId, adminId });
    revokedCount = revoked?.revokedCount || 0;
  }
  return { user, previousStatus, revokedCount };
};

module.exports = { generateQr, getCard, revokeQr, updateAccountStatus };
