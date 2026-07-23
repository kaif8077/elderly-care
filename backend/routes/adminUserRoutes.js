const express = require('express');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const { requirePermission, requireRole } = require('../middleware/requirePermission');
const adminUserController = require('../controllers/adminUserController');

const router = express.Router();

router.use(authenticateAdmin, requireRole('admin', 'super_admin'));
router.get('/', requirePermission('users.read'), adminUserController.listUsers);

module.exports = router;
