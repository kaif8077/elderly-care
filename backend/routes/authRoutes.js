const express = require('express');
const { 
    register, 
    login, 
    verifyLoginOTP,
    verifyOTP, 
    completeRegistration,
    forgotPassword,
    verifyResetOTP,
    resetPassword
} = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/complete-registration', completeRegistration);
router.post('/login', login);
router.post('/verify-login-otp', verifyLoginOTP);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
