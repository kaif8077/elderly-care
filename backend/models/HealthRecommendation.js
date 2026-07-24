const mongoose = require('mongoose');

const healthRecommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  medicalProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalProfile', required: true, index: true },
  content: { type: String, required: true },
  generator: { type: String, enum: ['ai', 'fallback'], default: 'fallback' },
  status: { type: String, enum: ['active', 'archived'], default: 'active', index: true },
  generatedAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

healthRecommendationSchema.index({ userId: 1, generatedAt: -1 });
module.exports = mongoose.model('HealthRecommendation', healthRecommendationSchema);
