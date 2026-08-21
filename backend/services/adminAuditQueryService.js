const AuditLog = require('../models/AuditLog');

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseAuditQuery = (query) => ({
  page: Math.max(Number.parseInt(query.page, 10) || 1, 1),
  limit: Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 5), 100)
});

const listAuditLogs = async (query) => {
  const { page, limit } = parseAuditQuery(query);
  const match = {};
  if (query.action?.trim()) match.action = query.action.trim();
  if (query.resourceType?.trim()) match.resourceType = query.resourceType.trim();
  if (query.success === 'true') match['metadata.success'] = true;
  if (query.success === 'false') match['metadata.success'] = false;
  if (query.search?.trim()) {
    const expression = new RegExp(escapeRegex(query.search.trim()), 'i');
    match.$or = [
      { action: expression },
      { resourceType: expression },
      { description: expression },
      { reason: expression }
    ];
  }

  const [rows, total] = await Promise.all([
    AuditLog.find(match)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        'actorId actorRole action resourceType resourceId affectedUserId description reason metadata.success metadata.ipHash metadata.userAgent createdAt'
      )
      .populate('actorId', 'name email')
      .populate('affectedUserId', 'name email')
      .lean(),
    AuditLog.countDocuments(match)
  ]);

  return {
    logs: rows.map((log) => ({
      id: log._id,
      actor: log.actorId
        ? { id: log.actorId._id, name: log.actorId.name, email: log.actorId.email }
        : null,
      actorRole: log.actorRole,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      affectedUser: log.affectedUserId
        ? {
            id: log.affectedUserId._id,
            name: log.affectedUserId.name,
            email: log.affectedUserId.email
          }
        : null,
      description: log.description,
      reason: log.reason,
      success: log.metadata?.success !== false,
      ipReference: log.metadata?.ipHash ? log.metadata.ipHash.slice(0, 12) : null,
      userAgent: log.metadata?.userAgent || null,
      createdAt: log.createdAt
    })),
    pagination: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) }
  };
};

module.exports = { listAuditLogs, parseAuditQuery };
