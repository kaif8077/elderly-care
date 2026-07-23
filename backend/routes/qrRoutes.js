const express = require('express');
const { 
    sendScannerOtp,
    verifyScannerOtp
} = require('../controllers/qrController');
const authMiddleware = require('../middleware/authmiddleware');
const secureQrController = require('../controllers/secureQrController');

const router = express.Router();

// MAIN ROUTES
router.get('/access/:token', secureQrController.serveTokenAccess);
router.get('/:userId', authMiddleware, secureQrController.getQRCode);
router.post('/', authMiddleware, secureQrController.createQRCode);

// PROFILE ROUTE - IMPORTANT!
router.get('/profile/:userId', secureQrController.serveLegacyLink);

// TEST ROUTES
// Legacy diagnostic routes were intentionally removed because they exposed user records.

// OTP ROUTES
router.post('/send-otp', sendScannerOtp);
router.post('/verify-otp', verifyScannerOtp);

module.exports = router;
