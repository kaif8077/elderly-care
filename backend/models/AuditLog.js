const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    actorRole: { type: String, default: null },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String, default: null },
    affectedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    description: { type: String, required: true },
    reason: { type: String, default: null },
    metadata: {
      ipHash: { type: String, default: null },
      userAgent: { type: String, default: null },
      success: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ affectedUserId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
