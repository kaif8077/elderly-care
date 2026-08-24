const DEFAULT_ADMIN_PERMISSIONS = [
  'dashboard.read',
  'users.read',
  'users.update',
  'users.archive',
  'users.restore',
  'profiles.read',
  'reports.read',
  'reports.download',
  'reports.verify',
  'idCards.read',
  'idCards.download',
  'qr.revoke',
  'qr.regenerate',
  'alerts.read',
  'documents.read',
  'auditLogs.read'
];

const getPermissions = (admin) => {
  if (admin.role === 'super_admin') return ['*'];
  return admin.permissions?.length ? admin.permissions : DEFAULT_ADMIN_PERMISSIONS;
};

const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({ message: 'Admin role required', code: 'ADMIN_ROLE_REQUIRED' });
    }
    next();
  };

const requirePermission = (permission) => (req, res, next) => {
  const permissions = getPermissions(req.admin);
  if (!permissions.includes('*') && !permissions.includes(permission)) {
    return res.status(403).json({ message: 'Permission denied', code: 'ADMIN_PERMISSION_DENIED' });
  }
  next();
};

module.exports = {
  DEFAULT_ADMIN_PERMISSIONS,
  getPermissions,
  requirePermission,
  requireRole
};
