const mongoose = require('mongoose');

const USER_ROLES = ['user', 'guardian', 'caregiver', 'doctor', 'admin', 'super_admin'];
const ACCOUNT_STATUSES = ['active', 'inactive', 'suspended', 'archived'];

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: USER_ROLES, default: 'user', index: true },
    permissions: [{ type: String }],
    accountStatus: {
      type: String,
      enum: ACCOUNT_STATUSES,
      default: 'active',
      index: true
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    deletionReason: { type: String, default: null },
    lastLoginAt: { type: Date, default: null },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
    mustChangePassword: { type: Boolean, default: false },
    sessionVersion: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
module.exports.USER_ROLES = USER_ROLES;
module.exports.ACCOUNT_STATUSES = ACCOUNT_STATUSES;
