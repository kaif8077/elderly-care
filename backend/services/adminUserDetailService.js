const mongoose = require('mongoose');
const User = require('../models/User');
const MedicalProfile = require('../models/MedicalProfile');
const QRCode = require('../models/QRCode');
const { calculateCompletion, isProfileComplete } = require('./adminUserQueryService');

const publicUserFields = 'name email role accountStatus isDeleted isVerified createdAt updatedAt lastLoginAt';

const getAdminUserDetail = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;

  const user = await User.findOne({
    _id: userId,
    role: { $nin: ['admin', 'super_admin'] }
  }).select(publicUserFields).lean();

  if (!user) return null;

  const [profile, qrCount, latestQr] = await Promise.all([
    MedicalProfile.findOne({ userId }).sort({ createdAt: -1 }).lean(),
    QRCode.countDocuments({ userId }),
    QRCode.findOne({ userId }).sort({ createdAt: -1 }).select('_id createdAt updatedAt').lean()
  ]);

  return {
    user: {
      id: user._id,
      elderlyCareId: null,
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
      profileCompletion: calculateCompletion(profile),
      profileStatus: isProfileComplete(profile) ? 'complete' : 'incomplete'
    },
    profile: profile ? {
      id: profile._id,
      personal: {
        name: profile.name,
        dob: profile.dob,
        gender: profile.gender,
        bloodGroup: profile.bloodGroup,
        height: profile.height,
        weight: profile.weight,
        dietPreference: profile.dietPreference
      },
      contact: {
        phone: profile.phone,
        address: profile.address
      },
      emergencyContact: {
        name: profile.emergencyContact,
        phone: profile.emergencyPhone
      },
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
      status: latestQr ? 'generated' : 'missing',
      totalRecords: qrCount,
      latestId: latestQr?._id || null,
      generatedAt: latestQr?.createdAt || null,
      updatedAt: latestQr?.updatedAt || null,
      revocationSupported: false
    },
    reports: {
      available: false,
      latest: null,
      history: [],
      message: 'Saved medical reports are not implemented in the current repository.'
    }
  };
};

module.exports = { getAdminUserDetail };
