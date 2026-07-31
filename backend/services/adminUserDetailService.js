const mongoose = require('mongoose');
const User = require('../models/User');
const MedicalProfile = require('../models/MedicalProfile');
const QRCode = require('../models/QRCode');
const MedicalReport = require('../models/MedicalReport');
const { calculateCompletion, isProfileComplete } = require('./adminUserQueryService');

const publicUserFields = 'name email role accountStatus isDeleted isVerified createdAt updatedAt lastLoginAt deletedAt deletionReason';

const getAdminUserDetail = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;

  const user = await User.findOne({
    _id: userId,
    role: { $nin: ['admin', 'super_admin'] }
  }).select(publicUserFields).lean();

  if (!user) return null;

  const [profile, qrCount, revokedQrCount, latestQr, reports] = await Promise.all([
    MedicalProfile.findOne({ userId }).sort({ createdAt: -1 }).lean(),
    QRCode.countDocuments({ userId }),
    QRCode.countDocuments({ userId, status: 'revoked' }),
    QRCode.findOne({ userId, status: 'active', token: { $exists: true, $ne: null } })
      .sort({ createdAt: -1 }).select('_id createdAt updatedAt').lean(),
    MedicalReport.find({ userId }).sort({ reportVersion: -1 })
      .select('-snapshotData -pdfUrl').limit(20).lean()
  ]);
  const primaryEmergency = profile?.emergencyContacts?.[0];

  return {
    user: {
      id: user._id,
      elderlyCareId: profile?.elderlyCareId || null,
      name: profile?.name || user.name,
      accountName: user.name,
      email: user.email,
      role: user.role,
      accountStatus: user.accountStatus,
      isDeleted: user.isDeleted,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: profile?.updatedAt || user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      deletedAt: user.deletedAt,
      deletionReason: user.deletionReason,
      profileCompletion: calculateCompletion(profile),
      profileStatus: isProfileComplete(profile) ? 'complete' : 'incomplete'
    },
    profile: profile ? {
      id: profile._id,
      personal: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        name: profile.name,
        dob: profile.dob,
        gender: profile.gender,
        bloodGroup: profile.bloodGroup,
        height: profile.height,
        weight: profile.weight,
        dietPreference: profile.dietPreference,
        preferredLanguage: profile.preferredLanguage || [],
        otherLanguage: profile.otherLanguage || null,
        maritalStatus: profile.maritalStatus || null,
        mobilityStatus: profile.mobilityStatus || null,
        hasPhoto: Boolean(profile.profilePhoto?.fileId)
      },
      contact: {
        phone: profile.phone,
        address: profile.address
      },
      emergencyContact: {
        name: profile.emergencyContact || primaryEmergency?.name,
        phone: profile.emergencyPhone || primaryEmergency?.phone,
        relationship: profile.emergencyRelationship || primaryEmergency?.relationship
      },
      emergencyContacts: profile.emergencyContacts || [],
      medical: {
        medicalHistory: profile.medicalHistory || [],
        medicalHistoryOther: profile.medicalHistoryOther || null,
        allergies: profile.allergies || [],
        allergiesOther: profile.allergiesOther || null,
        medications: profile.medications || [],
        medicationsOther: profile.medicationsOther || null,
        currentSymptoms: profile.currentSymptoms || [],
        currentSymptomsOther: profile.currentSymptomsOther || null
      },
      insurance: {
        hasInsurance: profile.hasInsurance,
        provider: profile.insuranceProvider || null,
        providerOther: profile.insuranceProviderOther || null,
        policyNumber: profile.policyNumber || null
      },
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    } : null,
    qr: {
      status: latestQr ? 'active' : (revokedQrCount ? 'revoked' : 'missing'),
      totalRecords: qrCount,
      revokedRecords: revokedQrCount,
      latestId: latestQr?._id || null,
      generatedAt: latestQr?.createdAt || null,
      updatedAt: latestQr?.updatedAt || null,
      revocationSupported: false
    },
    reports: {
      available: reports.length > 0,
      latest: reports.find((report) => report.isLatest && !report.isArchived) || null,
      history: reports,
      message: reports.length ? null : 'No saved medical reports have been generated.'
    }
  };
};

module.exports = { getAdminUserDetail };
