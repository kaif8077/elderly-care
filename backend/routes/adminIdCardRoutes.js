const express = require('express');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const { requirePermission, requireRole } = require('../middleware/requirePermission');
const controller = require('../controllers/adminIdCardController');
const requireTrustedOrigin = require('../middleware/requireTrustedOrigin');

const router = express.Router();
router.use(authenticateAdmin, requireRole('admin', 'super_admin'));
router.get('/:userId', requirePermission('idCards.read'), controller.getCard);
router.post('/:userId/regenerate', requireTrustedOrigin, requirePermission('qr.regenerate'), controller.regenerateQr);
router.post('/:userId/revoke', requireTrustedOrigin, requirePermission('qr.revoke'), controller.revokeQr);

module.exports = router;
