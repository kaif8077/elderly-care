const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: false },
    telegram: { type: Boolean, default: false },
    emergencyAlerts: { type: Boolean, default: true },
    reminders: { type: Boolean, default: true },
    profileReview: { type: Boolean, default: true },
    telegramChatId: { type: String, select: false, default: null },
    pushSubscriptions: [
      { endpointHash: String, subscription: { type: mongoose.Schema.Types.Mixed, select: false } }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);
