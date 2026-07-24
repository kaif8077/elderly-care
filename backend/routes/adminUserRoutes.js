const express = require('express');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const { requirePermission, requireRole } = require('../middleware/requirePermission');
const adminUserController = require('../controllers/adminUserController');
const { requireTrustedOrigin } = require('../middleware/requireTrustedOrigin');

const router = express.Router();

router.use(authenticateAdmin, requireRole('admin', 'super_admin'));
router.get('/', requirePermission('users.read'), adminUserController.listUsers);
router.get('/:userId', requirePermission('profiles.read'), adminUserController.getUser);
router.patch('/:userId/status', requireTrustedOrigin, requirePermission('users.update'), adminUserController.updateStatus);
router.delete('/:userId', requireTrustedOrigin, requirePermission('users.archive'), adminUserController.archive);
router.post('/:userId/restore', requireTrustedOrigin, requirePermission('users.restore'), adminUserController.restore);

module.exports = router;
