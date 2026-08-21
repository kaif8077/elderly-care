const bcrypt = require('bcrypt');
const User = require('../models/User');
const { writeAuditLog } = require('../services/auditService');
const {
  clearAdminCookie,
  createAdminToken,
  setAdminCookie
} = require('../services/adminSessionService');
const { getPermissions } = require('../middleware/requirePermission');

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const normalizeEmail = (email) =>
  String(email || '')
    .trim()
    .toLowerCase();

const adminResponse = (admin) => ({
  id: admin._id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
  permissions: getPermissions(admin),
  mustChangePassword: admin.mustChangePassword,
  lastLoginAt: admin.lastLoginAt
});

const isStrongPassword = (password) =>
  typeof password === 'string' &&
  password.length >= 12 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

exports.login = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');
  const genericError = { message: 'Invalid admin credentials', code: 'INVALID_ADMIN_CREDENTIALS' };

  try {
    if (!email || !password) return res.status(400).json(genericError);

    const admin = await User.findOne({ email });
    if (!admin || !['admin', 'super_admin'].includes(admin.role)) {
      await writeAuditLog({
        req,
        action: 'ADMIN_LOGIN_FAILED',
        resourceType: 'AdminSession',
        description: 'Failed admin login attempt',
        success: false
      });
      return res.status(401).json(genericError);
    }

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      await writeAuditLog({
        req,
        actor: admin,
        action: 'ADMIN_LOGIN_BLOCKED',
        resourceType: 'AdminSession',
        affectedUserId: admin._id,
        description: 'Admin login blocked by temporary lockout',
        success: false
      });
      return res.status(423).json({
        message: 'Admin account is temporarily locked. Please try again later.',
        code: 'ADMIN_ACCOUNT_LOCKED'
      });
    }

    const passwordMatches = await bcrypt.compare(password, admin.password);
    if (!passwordMatches) {
      admin.failedLoginAttempts += 1;
      if (admin.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        admin.lockedUntil = new Date(Date.now() + LOCKOUT_MS);
        admin.failedLoginAttempts = 0;
      }
      await admin.save();
      await writeAuditLog({
        req,
        actor: admin,
        action: 'ADMIN_LOGIN_FAILED',
        resourceType: 'AdminSession',
        affectedUserId: admin._id,
        description: 'Failed admin login attempt',
        success: false
      });
      return res.status(401).json(genericError);
    }

    if (admin.accountStatus !== 'active' || admin.isDeleted) {
      await writeAuditLog({
        req,
        actor: admin,
        action: 'ADMIN_LOGIN_DISABLED',
        resourceType: 'AdminSession',
        affectedUserId: admin._id,
        description: 'Disabled admin account attempted to log in',
        success: false
      });
      return res.status(403).json({
        message: 'This admin account is not active.',
        code: 'ADMIN_ACCOUNT_DISABLED'
      });
    }

    admin.failedLoginAttempts = 0;
    admin.lockedUntil = null;
    admin.lastLoginAt = new Date();
    await admin.save();

    setAdminCookie(res, createAdminToken(admin));
    await writeAuditLog({
      req,
      actor: admin,
      action: 'ADMIN_LOGIN_SUCCEEDED',
      resourceType: 'AdminSession',
      affectedUserId: admin._id,
      description: 'Admin logged in'
    });

    res.json({ admin: adminResponse(admin) });
  } catch (error) {
    console.error('Admin login error:', error.message);
    res.status(500).json({ message: 'Unable to complete admin login', code: 'ADMIN_LOGIN_ERROR' });
  }
};

exports.me = (req, res) => {
  res.json({ admin: adminResponse(req.admin) });
};

exports.logout = async (req, res) => {
  clearAdminCookie(res);
  await writeAuditLog({
    req,
    actor: req.admin,
    action: 'ADMIN_LOGOUT',
    resourceType: 'AdminSession',
    affectedUserId: req.admin._id,
    description: 'Admin logged out'
  });
  res.json({ message: 'Logged out successfully' });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message:
          'New password must be at least 12 characters and include uppercase, lowercase, number, and special character.',
        code: 'WEAK_ADMIN_PASSWORD'
      });
    }
    if (!(await bcrypt.compare(currentPassword, req.admin.password))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    if (await bcrypt.compare(newPassword, req.admin.password)) {
      return res
        .status(400)
        .json({ message: 'New password must differ from the current password' });
    }

    req.admin.password = await bcrypt.hash(newPassword, 12);
    req.admin.passwordChangedAt = new Date();
    req.admin.mustChangePassword = false;
    req.admin.sessionVersion += 1;
    await req.admin.save();

    clearAdminCookie(res);
    await writeAuditLog({
      req,
      actor: req.admin,
      action: 'ADMIN_PASSWORD_CHANGED',
      resourceType: 'User',
      resourceId: req.admin._id,
      affectedUserId: req.admin._id,
      description: 'Admin changed their password'
    });

    res.json({ message: 'Password changed. Please log in again.' });
  } catch (error) {
    console.error('Admin password change error:', error.message);
    res.status(500).json({ message: 'Unable to change password' });
  }
};

exports.sessionCheck = (req, res) => {
  res.json({ success: true, permission: 'dashboard.read' });
};
