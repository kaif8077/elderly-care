const express = require('express');
const { createPublicAlert } = require('../controllers/emergencyAlertController');

const router = express.Router();
router.post('/public/:token', createPublicAlert);

module.exports = router;
