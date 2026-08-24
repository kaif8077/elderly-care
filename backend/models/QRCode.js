const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    data: { type: String, required: true },
    token: { type: String, unique: true, sparse: true, index: true },
    status: { type: String, enum: ['active', 'revoked'], default: 'active', index: true },
    profileUrl: { type: String, default: null },
    revokedAt: { type: Date, default: null },
    revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

qrCodeSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('QRCode', qrCodeSchema);
