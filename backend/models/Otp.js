const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true,
        index: true
    },
    purpose: {
        type: String,
        enum: ['registration', 'login', 'password_reset', 'scanner'],
        required: true,
        index: true
    },
    otpHash: {
        type: String,
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: '15m' }
    }
}, {
    timestamps: true
});

otpSchema.index({ identifier: 1, purpose: 1 });

module.exports = mongoose.model('Otp', otpSchema);
