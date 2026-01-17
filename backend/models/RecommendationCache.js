const mongoose = require('mongoose');

const recommendationCacheSchema = new mongoose.Schema({
  cacheKey: {
    type: String,
    required: true,
    unique: true   // auto index
  },
  value: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['health', 'firstaid'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// TTL index (only one index here)
recommendationCacheSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 86400 }
);

module.exports = mongoose.model(
  'RecommendationCache',
  recommendationCacheSchema
);
