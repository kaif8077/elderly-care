const mongoose = require('mongoose');

const recommendationCacheSchema = new mongoose.Schema({
    cacheKey: {
        type: String,
        required: true,
        unique: true
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
        default: Date.now,
        expires: 86400 // 24 hours in seconds
    }
});

// Create index for faster queries
recommendationCacheSchema.index({ cacheKey: 1 });
recommendationCacheSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('RecommendationCache', recommendationCacheSchema);