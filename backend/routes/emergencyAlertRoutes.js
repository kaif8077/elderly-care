const express = require('express');
const {
  acknowledgeMyAlert, acknowledgePublicAlert, createPublicAlert, getMyAlert, listMyAlerts
} = require('../controllers/emergencyAlertController');
const simpleRateLimit = require('../middleware/simpleRateLimit');
const authMiddleware = require('../middleware/authmiddleware');

const router = express.Router();
router.post('/public/:token', simpleRateLimit({ windowMs: 60_000, limit: 5, keyPrefix: 'emergency-alert' }), createPublicAlert);
router.patch('/acknowledge/:token', simpleRateLimit({ windowMs: 60_000, limit: 10, keyPrefix: 'alert-ack' }), acknowledgePublicAlert);
router.get('/mine', authMiddleware, listMyAlerts);
router.get('/mine/:id', authMiddleware, getMyAlert);
router.patch('/mine/:id/acknowledge', authMiddleware, simpleRateLimit({ windowMs: 60_000, limit: 20, keyPrefix: 'account-alert-ack' }), acknowledgeMyAlert);

module.exports = router;
