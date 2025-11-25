const express = require('express');
const { 
    register, 
    login, 
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
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

module.exports = router;