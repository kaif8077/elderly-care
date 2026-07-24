const express = require('express');
const { 
    register, 
    login, 
    verifyOTP, 
    completeRegistration,
    me,
    forgotPassword,
    verifyResetOTP,
    resetPassword
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authmiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/complete-registration', completeRegistration);
router.post('/login', login);
router.get('/me', authMiddleware, me);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
