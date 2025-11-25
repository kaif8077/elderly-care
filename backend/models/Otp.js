const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        index: true
    },
    otp: {
        type: String,  // Store as String to avoid number comparison issues
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: '15m' }  // Auto-delete after 15 minutes
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true  // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Otp', otpSchema);