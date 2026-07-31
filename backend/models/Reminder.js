const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['medication', 'appointment', 'profile_review', 'insurance_expiry', 'contact_verification'], required: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  notes: { type: String, trim: true, maxlength: 500, default: null },
  scheduledFor: { type: Date, required: true, index: true },
  recurrence: { type: String, enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'], default: 'none' },
  channels: [{ type: String, enum: ['email', 'push', 'telegram'] }],
  status: { type: String, enum: ['active', 'completed', 'dismissed'], default: 'active', index: true },
  completedAt: { type: Date, default: null }
}, { timestamps: true });

reminderSchema.index({ userId: 1, status: 1, scheduledFor: 1 });
module.exports = mongoose.model('Reminder', reminderSchema);
