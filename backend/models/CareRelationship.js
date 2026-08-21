const mongoose = require('mongoose');

const careRelationshipSchema = new mongoose.Schema(
  {
    elderUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    memberUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    invitedEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    role: { type: String, enum: ['guardian', 'caregiver', 'doctor'], required: true },
    permissions: [
      {
        type: String,
        enum: ['profile.read', 'profile.update', 'alerts.receive', 'reminders.manage']
      }
    ],
    status: {
      type: String,
      enum: ['pending', 'active', 'revoked'],
      default: 'pending',
      index: true
    },
    invitationTokenHash: { type: String, select: false, default: null },
    invitedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

careRelationshipSchema.index({ elderUserId: 1, invitedEmail: 1, role: 1 }, { unique: true });
module.exports = mongoose.model('CareRelationship', careRelationshipSchema);
