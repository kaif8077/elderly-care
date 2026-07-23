const crypto = require('crypto');
const Otp = require('../models/Otp');

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const normalizeIdentifier = (identifier) => String(identifier || '').trim().toLowerCase();

const hashOtp = (identifier, purpose, otp) => crypto
  .createHmac('sha256', process.env.JWT_SECRET)
  .update(`${normalizeIdentifier(identifier)}:${purpose}:${otp}`)
  .digest('hex');

const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

const createOtp = async ({ identifier, purpose }) => {
  const normalized = normalizeIdentifier(identifier);
  const otp = generateOtp();

  await Otp.deleteMany({ identifier: normalized, purpose });
  await Otp.create({
    identifier: normalized,
    purpose,
    otpHash: hashOtp(normalized, purpose, otp),
    expiresAt: new Date(Date.now() + OTP_TTL_MS)
  });

  return otp;
};

const verifyOtp = async ({ identifier, purpose, otp }) => {
  const normalized = normalizeIdentifier(identifier);
  const record = await Otp.findOne({ identifier: normalized, purpose })
    .sort({ createdAt: -1 });

  if (!record || record.expiresAt <= new Date()) {
    if (record) await Otp.deleteOne({ _id: record._id });
    return { valid: false, message: 'Invalid or expired OTP' };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await Otp.deleteOne({ _id: record._id });
    return { valid: false, message: 'Too many incorrect attempts. Request a new OTP.' };
  }

  const expected = Buffer.from(record.otpHash, 'hex');
  const received = Buffer.from(hashOtp(normalized, purpose, String(otp || '')), 'hex');
  const matches = expected.length === received.length && crypto.timingSafeEqual(expected, received);

  if (!matches) {
    record.attempts += 1;
    await record.save();
    return { valid: false, message: 'Invalid or expired OTP' };
  }

  await Otp.deleteOne({ _id: record._id });
  return { valid: true };
};

module.exports = {
  createOtp,
  normalizeIdentifier,
  verifyOtp
};
