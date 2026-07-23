const { listAuditLogs } = require('../services/adminAuditQueryService');

exports.list = async (req, res) => {
  try {
    res.json(await listAuditLogs(req.query));
  } catch (error) {
    console.error('Admin audit log query error:', error.message);
    res.status(500).json({ message: 'Unable to load audit logs' });
  }
};
