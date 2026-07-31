const mongoose = require('mongoose');

const emergencyAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  scannedQrId: { type: mongoose.Schema.Types.ObjectId, ref: 'QRCode', required: true, index: true },
  notificationChannels: [{ type: String, enum: ['email', 'push', 'telegram'] }],
  deliveryStatuses: [{
    channel: { type: String, enum: ['email', 'push', 'telegram'], required: true },
    status: { type: String, enum: ['pending', 'sent', 'failed'], required: true },
    providerId: { type: String, default: null },
    error: { type: String, default: null, maxlength: 200 }
  }],
  status: {
    type: String,
    enum: ['created', 'sending', 'sent', 'partially_sent', 'failed', 'acknowledged', 'resolved', 'false_alarm'],
    default: 'created',
    index: true
  },
  ipHash: { type: String, required: true, select: false },
  duplicateKey: { type: String, required: true, index: true },
  emergencyType: { type: String, enum: ['person_found', 'medical_emergency', 'fall', 'lost_confused', 'accident', 'other'], default: 'medical_emergency' },
  responderName: { type: String, trim: true, maxlength: 80, default: null },
  responderPhone: { type: String, trim: true, maxlength: 30, default: null },
  responderMessage: { type: String, trim: true, maxlength: 500, default: null },
  location: {
    latitude: { type: Number, min: -90, max: 90, default: null },
    longitude: { type: Number, min: -180, max: 180, default: null },
    accuracy: { type: Number, min: 0, max: 100000, default: null },
    mapUrl: { type: String, default: null }
  },
  acknowledgementTokenHash: { type: String, select: false, default: null },
  acknowledgementAction: { type: String, enum: ['received', 'calling', 'going_to_location', 'services_contacted', 'resolved', null], default: null },
  acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  acknowledgedAt: { type: Date, default: null },
  resolvedAt: { type: Date, default: null }
}, { timestamps: true });

emergencyAlertSchema.index({ duplicateKey: 1, createdAt: -1 });
emergencyAlertSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);
