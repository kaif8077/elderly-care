const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../services/emailService');
const { createOtp, normalizeIdentifier, verifyOtp } = require('../services/otpService');
const { normalizeSessionVersion } = require('../services/userSessionService');

const signUserToken = (user) => jwt.sign(
  { id: user._id, sessionVersion: normalizeSessionVersion(user.sessionVersion) },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

const publicUser = (user) => ({
  _id: user._id,
  email: user.email,
  name: user.name
});

const sendPurposeOtp = async (email, purpose) => {
  const otp = await createOtp({ identifier: email, purpose });
  await sendOtpEmail({ to: email, otp, purpose });
};

exports.register = async (req, res) => {
  const email = normalizeIdentifier(req.body.email);

  try {
    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (await User.exists({ email })) {
      return res.status(400).json({ message: 'User already exists' });
    }

    await sendPurposeOtp(email, 'registration');
    res.json({ message: 'OTP sent to email', email, nextStep: 'verify' });
  } catch (error) {
    console.error('Registration OTP error:', error.message);
    res.status(500).json({ message: 'Unable to send verification email' });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const result = await verifyOtp({
      identifier: req.body.email,
      purpose: 'registration',
      otp: req.body.otp
    });
    if (!result.valid) return res.status(400).json({ message: result.message });

    const registrationToken = jwt.sign(
      { email: normalizeIdentifier(req.body.email), purpose: 'registration' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      message: 'Email verified successfully',
      registrationToken,
      nextStep: 'complete-registration'
    });
  } catch (error) {
    console.error('Registration verification error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.completeRegistration = async (req, res) => {
  const { name, password, registrationToken } = req.body;

  try {
    const decoded = jwt.verify(registrationToken, process.env.JWT_SECRET);
    if (decoded.purpose !== 'registration') throw new Error('Invalid token purpose');

    const email = normalizeIdentifier(decoded.email);
    if (await User.exists({ email })) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (!name || !password || password.length < 8) {
      return res.status(400).json({ message: 'Name and a password of at least 8 characters are required' });
    }

    const user = await User.create({
      name: String(name).trim(),
      email,
      password: await bcrypt.hash(password, 10),
      isVerified: true
    });

    res.status(201).json({
      token: signUserToken(user),
      user: publicUser(user),
      message: 'Registration completed successfully'
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Registration verification expired. Request a new OTP.' });
    }
    console.error('Complete registration error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const email = normalizeIdentifier(req.body.email);

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (user.accountStatus !== 'active' || user.isDeleted) {
      return res.status(403).json({ message: 'This account is not active' });
    }
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Email is not verified' });
    }

    user.lastLoginAt = new Date();
    await user.save();
    res.json({ token: signUserToken(user), user: publicUser(user), message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Unable to log in' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('_id email name').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user: publicUser(user) });
  } catch (error) {
    console.error('User session restore error:', error.message);
    return res.status(500).json({ message: 'Unable to restore account session' });
  }
};

exports.verifyLoginOTP = async (req, res) => {
  const email = normalizeIdentifier(req.body.email);

  try {
    const result = await verifyOtp({ identifier: email, purpose: 'login', otp: req.body.otp });
    if (!result.valid) return res.status(400).json({ message: result.message });

    const user = await User.findOne({ email });
    if (!user || user.accountStatus !== 'active' || user.isDeleted) {
      return res.status(403).json({ message: 'This account is not active' });
    }

    res.json({ token: signUserToken(user), user: publicUser(user) });
  } catch (error) {
    console.error('Login verification error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  const email = normalizeIdentifier(req.body.email);

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    await sendPurposeOtp(email, 'password_reset');
    res.json({ message: 'OTP sent to email', email, nextStep: 'verify-reset-otp' });
  } catch (error) {
    console.error('Password reset OTP error:', error.message);
    res.status(500).json({ message: 'Unable to send password reset email' });
  }
};

exports.verifyResetOTP = async (req, res) => {
  const email = normalizeIdentifier(req.body.email);

  try {
    const result = await verifyOtp({
      identifier: email,
      purpose: 'password_reset',
      otp: req.body.otp
    });
    if (!result.valid) return res.status(400).json({ message: result.message });

    const tempToken = jwt.sign(
      { email, purpose: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    res.json({ message: 'OTP verified successfully', tempToken, nextStep: 'reset-password' });
  } catch (error) {
    console.error('Reset verification error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const decoded = jwt.verify(req.body.tempToken, process.env.JWT_SECRET);
    if (decoded.purpose !== 'password_reset') throw new Error('Invalid token purpose');
    if (!req.body.newPassword || req.body.newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const user = await User.findOne({ email: normalizeIdentifier(decoded.email) });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = await bcrypt.hash(req.body.newPassword, 10);
    await user.save();
    res.json({ message: 'Password reset successfully', nextStep: 'login' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Password reset verification is invalid or expired' });
    }
    console.error('Password reset error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
