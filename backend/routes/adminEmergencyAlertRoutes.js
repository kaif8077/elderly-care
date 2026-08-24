const express = require('express');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const { requirePermission, requireRole } = require('../middleware/requirePermission');
const controller = require('../controllers/adminEmergencyAlertController');

const router = express.Router();
router.use(
  authenticateAdmin,
  requireRole('admin', 'super_admin'),
  requirePermission('alerts.read')
);
router.get('/', controller.list);
router.get('/:id', controller.getOne);

module.exports = router;
