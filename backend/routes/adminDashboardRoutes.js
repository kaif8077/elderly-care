const express = require('express');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const { requirePermission, requireRole } = require('../middleware/requirePermission');
const adminDashboardController = require('../controllers/adminDashboardController');

const router = express.Router();

router.use(authenticateAdmin, requireRole('admin', 'super_admin'));
router.get('/', requirePermission('dashboard.read'), adminDashboardController.getOverview);

module.exports = router;
