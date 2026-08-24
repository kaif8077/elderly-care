const { sendOtpEmail } = require('../services/emailService');
const { createOtp, normalizeIdentifier, verifyOtp } = require('../services/otpService');

// Sends a short-lived email OTP used by the scanner verification flow.
exports.sendScannerOtp = async (req, res) => {
  try {
    const email = normalizeIdentifier(req.body.email);
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'A valid email is required' });
    }

    const otp = await createOtp({ identifier: email, purpose: 'scanner' });
    await sendOtpEmail({ to: email, otp, purpose: 'scanner' });

    return res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Scanner OTP delivery failed:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

// Verifies a scanner OTP without returning the OTP or verification internals.
exports.verifyScannerOtp = async (req, res) => {
  try {
    const result = await verifyOtp({
      identifier: req.body.email,
      purpose: 'scanner',
      otp: req.body.otp
    });

    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    return res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Scanner OTP verification failed:', error.message);
    return res.status(500).json({ success: false, message: 'Error during verification' });
  }
};
