const mongoose = require('mongoose');

const qrAccessLogSchema = new mongoose.Schema(
  {
    qrId: { type: mongoose.Schema.Types.ObjectId, ref: 'QRCode', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    event: {
      type: String,
      enum: ['viewed', 'alert_created', 'revoked', 'regenerated'],
      required: true
    },
    ipHash: { type: String, required: true, select: false },
    userAgentFamily: { type: String, maxlength: 80, default: null },
    occurredAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

qrAccessLogSchema.index({ userId: 1, occurredAt: -1 });
qrAccessLogSchema.index({ occurredAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 });
module.exports = mongoose.model('QrAccessLog', qrAccessLogSchema);
