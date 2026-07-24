const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  elderProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalProfile', required: true, index: true },
  reportVersion: { type: Number, required: true, min: 1 },
  snapshotData: { type: mongoose.Schema.Types.Mixed, required: true, immutable: true },
  visibleSections: [{ type: String }],
  hiddenSections: [{ type: String }],
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  generatedAt: { type: Date, default: Date.now, immutable: true },
  reportStatus: { type: String, enum: ['final', 'archived'], default: 'final', index: true },
  reportType: { type: String, enum: ['emergency_summary'], default: 'emergency_summary' },
  pdfUrl: { type: String, default: null },
  isLatest: { type: Boolean, default: true, index: true },
  isArchived: { type: Boolean, default: false, index: true },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'verified', 'needs_correction'],
    default: 'unverified',
    index: true
  },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  verifiedAt: { type: Date, default: null }
}, { timestamps: true });

medicalReportSchema.index({ elderProfileId: 1, reportVersion: 1 }, { unique: true });
medicalReportSchema.index({ userId: 1, isLatest: 1, createdAt: -1 });

module.exports = mongoose.model('MedicalReport', medicalReportSchema);
