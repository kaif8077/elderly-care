const mongoose = require('mongoose');
const MedicalProfile = require('../models/MedicalProfile');
const MedicalReport = require('../models/MedicalReport');

const DEFAULT_VISIBLE = ['critical', 'personal', 'medical', 'emergencyContacts'];
const DEFAULT_HIDDEN = ['insurance'];

const snapshotProfile = (profile) => ({
  profileId: profile._id,
  personal: {
    name: profile.name,
    dob: profile.dob,
    gender: profile.gender,
    bloodGroup: profile.bloodGroup,
    height: profile.height,
    weight: profile.weight,
    dietPreference: profile.dietPreference
  },
  contact: { phone: profile.phone, address: profile.address },
  emergencyContacts: [
    { name: profile.emergencyContact, phone: profile.emergencyPhone, priority: 1 }
  ],
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
  sourceUpdatedAt: profile.updatedAt
});

const createReport = async ({ userId, generatedBy }) => {
  const profile = await MedicalProfile.findOne({ userId }).sort({ createdAt: -1 }).lean();
  if (!profile) {
    const error = new Error('A medical profile is required before generating a report');
    error.code = 'PROFILE_REQUIRED';
    throw error;
  }
  const previous = await MedicalReport.findOne({ elderProfileId: profile._id })
    .sort({ reportVersion: -1 })
    .select('reportVersion')
    .lean();
  const report = await MedicalReport.create({
    userId,
    elderProfileId: profile._id,
    reportVersion: (previous?.reportVersion || 0) + 1,
    snapshotData: snapshotProfile(profile),
    visibleSections: DEFAULT_VISIBLE,
    hiddenSections: DEFAULT_HIDDEN,
    generatedBy
  });
  await MedicalReport.updateMany(
    { userId, _id: { $ne: report._id }, isLatest: true },
    { $set: { isLatest: false } }
  );
  return report;
};

const parsePage = (page, limit) => ({
  page: Math.max(Number.parseInt(page, 10) || 1, 1),
  limit: Math.min(Math.max(Number.parseInt(limit, 10) || 10, 5), 50)
});

const listReports = async ({ match, page, limit, includeSnapshot = false }) => {
  const parsed = parsePage(page, limit);
  const query = MedicalReport.find(match)
    .sort({ reportVersion: -1, createdAt: -1 })
    .skip((parsed.page - 1) * parsed.limit)
    .limit(parsed.limit);
  if (!includeSnapshot) query.select('-snapshotData -pdfUrl');
  const [reports, total] = await Promise.all([query.lean(), MedicalReport.countDocuments(match)]);
  return {
    reports,
    pagination: { ...parsed, total, pages: Math.max(Math.ceil(total / parsed.limit), 1) }
  };
};

const getReport = async ({ reportId, userId = null }) => {
  if (!mongoose.Types.ObjectId.isValid(reportId)) return null;
  const match = { _id: reportId };
  if (userId) match.userId = userId;
  return MedicalReport.findOne(match).lean();
};

module.exports = { createReport, getReport, listReports, parsePage, snapshotProfile };
