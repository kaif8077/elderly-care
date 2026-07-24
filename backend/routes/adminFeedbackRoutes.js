const express = require('express');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const { requirePermission, requireRole } = require('../middleware/requirePermission');
const controller = require('../controllers/adminSubmissionController');

const router = express.Router();
router.use(authenticateAdmin, requireRole('admin', 'super_admin'));
router.get('/', requirePermission('auditLogs.read'), controller.feedback);

module.exports = router;
