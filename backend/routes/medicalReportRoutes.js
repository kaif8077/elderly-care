const express = require('express');
const authMiddleware = require('../middleware/authmiddleware');
const controller = require('../controllers/medicalReportController');
const downloadController = require('../controllers/medicalReportDownloadController');

const router = express.Router();
router.use(authMiddleware);
router.post('/', controller.create);
router.get('/', controller.list);
router.get('/latest', controller.latest);
router.get('/:reportId/download', downloadController.userDownload);
router.get('/:reportId', controller.getOne);

module.exports = router;
