const User = require('../models/User');
const {
  ADMIN_COOKIE_NAME,
  clearAdminCookie,
  readCookie,
  verifyAdminToken
} = require('../services/adminSessionService');

const authenticateAdmin = async (req, res, next) => {
  const token = readCookie(req, ADMIN_COOKIE_NAME);
  if (!token) {
    return res.status(401).json({ message: 'Admin authentication required', code: 'ADMIN_AUTH_REQUIRED' });
  }

  try {
    const decoded = verifyAdminToken(token);
    if (decoded.purpose !== 'admin_session') throw new Error('Invalid token purpose');

    const admin = await User.findById(decoded.sub);
    const hasAdminRole = admin && ['admin', 'super_admin'].includes(admin.role);
    const sessionIsCurrent = admin && admin.sessionVersion === decoded.sessionVersion;
    const accountIsActive = admin && admin.accountStatus === 'active' && !admin.isDeleted;

    if (!hasAdminRole || !sessionIsCurrent || !accountIsActive) {
      clearAdminCookie(res);
      return res.status(403).json({ message: 'Admin access denied', code: 'ADMIN_ACCESS_DENIED' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    clearAdminCookie(res);
    return res.status(401).json({ message: 'Admin session expired', code: 'ADMIN_SESSION_EXPIRED' });
  }
};

module.exports = authenticateAdmin;
