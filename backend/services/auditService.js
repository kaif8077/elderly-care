const crypto = require('crypto');
const AuditLog = require('../models/AuditLog');

const hashIp = (ip) => {
  if (!ip) return null;
  return crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(String(ip))
    .digest('hex');
};

const writeAuditLog = async ({
  req,
  actor = null,
  action,
  resourceType,
  resourceId = null,
  affectedUserId = null,
  description,
  reason = null,
  success = true
}) => {
  try {
    await AuditLog.create({
      actorId: actor?._id || null,
      actorRole: actor?.role || null,
      action,
      resourceType,
      resourceId: resourceId ? String(resourceId) : null,
      affectedUserId,
      description,
      reason,
      metadata: {
        ipHash: hashIp(req?.ip),
        userAgent: String(req?.get?.('user-agent') || '').slice(0, 500),
        success
      }
    });
  } catch (error) {
    console.error('Audit log write failed:', error.message);
  }
};

module.exports = { writeAuditLog };
