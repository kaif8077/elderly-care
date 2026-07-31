const mongoose = require('mongoose');
const MedicalDocument = require('../models/MedicalDocument');
const MedicalProfile = require('../models/MedicalProfile');
const { bucket, detectContentType, store } = require('../services/medicalDocumentService');
const categories = ['prescription', 'medical_report', 'insurance_card', 'doctor_note', 'vaccination', 'discharge_summary', 'identification'];

exports.list = async (req, res) => {
  const documents = await MedicalDocument.find({ userId: req.user.id, status: 'active' }).select('-storageFileId').sort({ createdAt: -1 }).lean();
  return res.json({ documents });
};
exports.upload = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Choose a PDF or supported image up to 5 MB' });
  const detected = detectContentType(req.file.buffer);
  if (!detected || detected !== req.file.mimetype) return res.status(400).json({ message: 'File content does not match an allowed document type' });
  if (!categories.includes(req.body.category)) return res.status(400).json({ message: 'Choose a valid document category' });
  const displayName = String(req.body.displayName || req.file.originalname).trim().slice(0, 120);
  if (!displayName) return res.status(400).json({ message: 'Document name is required' });
  const profile = await MedicalProfile.findOne({ userId: req.user.id }).sort({ createdAt: -1 }).select('_id').lean();
  if (!profile) return res.status(409).json({ message: 'Create a medical profile before uploading documents' });
  const storageFileId = await store({ buffer: req.file.buffer, contentType: detected, userId: req.user.id });
  const document = await MedicalDocument.create({ userId: req.user.id, profileId: profile._id, category: req.body.category, displayName, storageFileId, contentType: detected, bytes: req.file.size, accessLevel: 'owner_only' });
  return res.status(201).json({ message: 'Medical document uploaded securely', document: { ...document.toObject(), storageFileId: undefined } });
};
exports.download = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Medical document not found' });
  const document = await MedicalDocument.findOne({ _id: req.params.id, userId: req.user.id, status: 'active' }).select('+storageFileId').lean();
  if (!document) return res.status(404).json({ message: 'Medical document not found' });
  res.set({ 'Content-Type': document.contentType, 'Content-Length': String(document.bytes), 'Content-Disposition': `attachment; filename="${document.displayName.replace(/["\r\n]/g, '')}"`, 'Cache-Control': 'private, no-store' });
  return bucket().openDownloadStream(new mongoose.Types.ObjectId(document.storageFileId)).on('error', () => res.destroy()).pipe(res);
};
exports.archive = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Medical document not found' });
  const document = await MedicalDocument.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { $set: { status: 'archived', archivedAt: new Date() } }, { new: true });
  if (!document) return res.status(404).json({ message: 'Medical document not found' });
  return res.json({ message: 'Medical document archived' });
};
