require('dotenv').config({ override: true });
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/User');
const { DEFAULT_ADMIN_PERMISSIONS } = require('../middleware/requirePermission');

const normalizeEmail = (email) =>
  String(email || '')
    .trim()
    .toLowerCase();
const isStrongPassword = (password) =>
  password.length >= 12 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

const seedAdmin = async () => {
  const email = normalizeEmail(process.env.ADMIN_EMAIL);
  const password = process.env.ADMIN_PASSWORD;

  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error('A valid ADMIN_EMAIL is required');
  if (!password || password.length < 8)
    throw new Error('ADMIN_PASSWORD must be at least 8 characters');
  if (process.env.NODE_ENV === 'production' && !isStrongPassword(password)) {
    throw new Error('ADMIN_PASSWORD does not meet production password requirements');
  }

  await mongoose.connect(process.env.MONGO_URI);
  const existing = await User.findOne({ email });

  if (existing) {
    if (!['admin', 'super_admin'].includes(existing.role)) {
      throw new Error(
        'An existing non-admin account uses ADMIN_EMAIL; refusing privilege escalation'
      );
    }
    console.log('Admin account already exists. No changes were made.');
    return;
  }

  await User.create({
    name: 'ElderlyCare Administrator',
    email,
    password: await bcrypt.hash(password, 12),
    isVerified: true,
    role: 'admin',
    permissions: DEFAULT_ADMIN_PERMISSIONS,
    accountStatus: 'active',
    mustChangePassword: process.env.ADMIN_FORCE_PASSWORD_CHANGE === 'true',
    passwordChangedAt: new Date()
  });

  console.log('Admin account created successfully.');
  if (process.env.ADMIN_FORCE_PASSWORD_CHANGE === 'true') {
    console.log('Security warning: change the development admin password before production.');
  }
};

seedAdmin()
  .catch((error) => {
    console.error(`Admin seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
