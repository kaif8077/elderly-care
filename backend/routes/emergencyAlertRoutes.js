const express = require('express');
const { acknowledgePublicAlert, createPublicAlert } = require('../controllers/emergencyAlertController');
const simpleRateLimit = require('../middleware/simpleRateLimit');

const router = express.Router();
router.post('/public/:token', simpleRateLimit({ windowMs: 60_000, limit: 5, keyPrefix: 'emergency-alert' }), createPublicAlert);
router.patch('/acknowledge/:token', simpleRateLimit({ windowMs: 60_000, limit: 10, keyPrefix: 'alert-ack' }), acknowledgePublicAlert);

module.exports = router;
