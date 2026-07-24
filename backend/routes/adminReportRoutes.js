const express = require('express');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const { requirePermission, requireRole } = require('../middleware/requirePermission');
const { requireTrustedOrigin } = require('../middleware/requireTrustedOrigin');
const controller = require('../controllers/adminReportController');

const router = express.Router();
router.use(authenticateAdmin, requireRole('admin', 'super_admin'));
router.get('/', requirePermission('reports.read'), controller.list);
router.get('/:reportId', requirePermission('reports.read'), controller.getOne);
router.patch('/:reportId/verification', requireTrustedOrigin, requirePermission('reports.verify'), controller.verify);

module.exports = router;
