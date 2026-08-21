const express = require('express');
const adminAuthController = require('../controllers/adminAuthController');
const adminLoginRateLimiter = require('../middleware/adminLoginRateLimiter');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const { requirePermission, requireRole } = require('../middleware/requirePermission');
const { requireTrustedOrigin } = require('../middleware/requireTrustedOrigin');

const router = express.Router();

router.post('/login', requireTrustedOrigin, adminLoginRateLimiter, adminAuthController.login);
router.get('/me', authenticateAdmin, requireRole('admin', 'super_admin'), adminAuthController.me);
router.post('/logout', requireTrustedOrigin, authenticateAdmin, adminAuthController.logout);
router.post(
  '/change-password',
  requireTrustedOrigin,
  authenticateAdmin,
  adminAuthController.changePassword
);
router.get(
  '/session-check',
  authenticateAdmin,
  requireRole('admin', 'super_admin'),
  requirePermission('dashboard.read'),
  adminAuthController.sessionCheck
);

module.exports = router;
