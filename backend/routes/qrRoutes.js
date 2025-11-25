const express = require('express');
const { 
    createQRCode, 
    getQRCode,
    sendScannerOtp,
    verifyScannerOtp 
} = require('../controllers/qrController');
const authMiddleware = require('../middleware/authmiddleware');

const router = express.Router();

// Existing routes
router.get('/:userId', getQRCode);
router.post('/', authMiddleware, createQRCode);

// New scanner authentication routes
router.post('/send-otp', sendScannerOtp);
router.post('/verify-otp', verifyScannerOtp);

module.exports = router;

