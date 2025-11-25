const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const Otp = require('../models/Otp'); // Reusing the same OTP model
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Generate random OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const otp = generateOTP();
        otpStore.set(email, { otp, verified: false });

        const msg = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: 'Verify Your Email',
            text: `Your verification OTP is: ${otp}`,
            html: `<p>Your verification OTP is: <strong>${otp}</strong></p>`,
        };

        await sgMail.send(msg);

        res.status(200).json({ 
            message: 'OTP sent to email', 
            email,
            nextStep: 'verify' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const storedData = otpStore.get(email);
        
        if (!storedData || storedData.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        otpStore.set(email, { ...storedData, verified: true });

        res.status(200).json({ 
            message: 'Email verified successfully',
            email,
            nextStep: 'complete-registration' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.completeRegistration = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const storedData = otpStore.get(email);
        
        if (!storedData || !storedData.verified) {
            return res.status(400).json({ message: 'Email not verified' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            isVerified: true
        });

        await user.save();

        otpStore.delete(email);

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.status(201).json({ 
            token, 
            user: { _id: user._id, email: user.email, name: user.name },
            message: 'Registration completed successfully' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: 'Email not verified. Please verify your email first.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ token, user: { _id: user._id, email: user.email } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Store OTP in database instead of memory
        const otp = generateOTP();
        await Otp.create({
            phone: email, // Reusing phone field for email
            otp,
            expiresAt: new Date(Date.now() + 15*60000)
        });

        const msg = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: 'Password Reset OTP',
            text: `Your password reset OTP is: ${otp}`,
            html: `<p>Your password reset OTP is: <strong>${otp}</strong></p>`,
        };

        await sgMail.send(msg);

        res.status(200).json({ 
            message: 'OTP sent to email', 
            email,
            nextStep: 'verify-reset-otp' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verifyResetOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const otpRecord = await Otp.findOne({ 
            phone: email,
            otp,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Mark as verified by creating a temporary token
        const tempToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
        
        // Delete the OTP
        await Otp.deleteMany({ phone: email });

        res.status(200).json({ 
            message: 'OTP verified successfully',
            email,
            tempToken,
            nextStep: 'reset-password' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body; // Remove tempToken from params

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ 
            message: 'Password reset successfully',
            nextStep: 'login' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};