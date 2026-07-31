const mongoose = require('mongoose');

const medicalDocumentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalProfile', required: true, index: true },
  category: { type: String, enum: ['prescription', 'medical_report', 'insurance_card', 'doctor_note', 'vaccination', 'discharge_summary', 'identification'], required: true },
  displayName: { type: String, required: true, trim: true, maxlength: 120 },
  storageFileId: { type: mongoose.Schema.Types.ObjectId, required: true, select: false },
  contentType: { type: String, enum: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'], required: true },
  bytes: { type: Number, required: true, min: 1, max: 5242880 },
  accessLevel: { type: String, enum: ['emergency_contacts', 'owner_only'], default: 'owner_only' },
  status: { type: String, enum: ['active', 'archived'], default: 'active', index: true },
  archivedAt: { type: Date, default: null }
}, { timestamps: true });

medicalDocumentSchema.index({ userId: 1, createdAt: -1 });
module.exports = mongoose.model('MedicalDocument', medicalDocumentSchema);
