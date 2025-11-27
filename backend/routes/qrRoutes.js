const express = require('express');
const { 
    createQRCode, 
    getQRCode,
    sendScannerOtp,
    verifyScannerOtp,
    serveProfilePage,
    testAllUsers,
    testSpecificUser
} = require('../controllers/qrController');
const authMiddleware = require('../middleware/authmiddleware');

const router = express.Router();

// MAIN ROUTES
router.get('/:userId', getQRCode);
router.post('/', authMiddleware, createQRCode);

// PROFILE ROUTE - IMPORTANT!
router.get('/profile/:userId', serveProfilePage);

// TEST ROUTES
router.get('/test-all-users', testAllUsers);
router.get('/check-user/:userId', testSpecificUser);

// OTP ROUTES
router.post('/send-otp', sendScannerOtp);
router.post('/verify-otp', verifyScannerOtp);

module.exports = router;
