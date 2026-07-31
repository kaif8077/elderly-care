const express = require('express');
const authMiddleware = require('../middleware/authmiddleware');
const upload = require('../middleware/medicalDocumentUpload');
const controller = require('../controllers/medicalDocumentController');
const router = express.Router();
const safe = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch((error) => { console.error('Medical document error:', error.message); if (!res.headersSent) res.status(500).json({ message: 'Unable to complete document request' }); });
const safeUpload = (req, res, next) => upload(req, res, (error) => {
  if (!error) return next();
  const message = error.code === 'LIMIT_FILE_SIZE'
    ? 'Document must be 5 MB or smaller'
    : 'Upload a PDF, JPEG, PNG, or WebP document';
  return res.status(400).json({ message });
});
router.use(authMiddleware);
router.get('/', safe(controller.list));
router.post('/', safeUpload, safe(controller.upload));
router.get('/:id/download', safe(controller.download));
router.delete('/:id', safe(controller.archive));
module.exports = router;
