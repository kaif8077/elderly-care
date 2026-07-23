const mongoose = require('mongoose');
const User = require('../models/User');
const { revokeQr } = require('./adminIdCardService');

const DELETION_REASONS = [
  'Duplicate account',
  'User request',
  'Test account',
  'Incorrect data',
  'Inactive account',
  'Privacy request',
  'Other'
];

const validateArchiveRequest = ({ reason, confirmation }) => {
  if (confirmation !== 'DELETE') return 'Type DELETE exactly to confirm';
  if (typeof reason !== 'string' || reason.trim().length < 3 || reason.trim().length > 500) {
    return 'A deletion reason between 3 and 500 characters is required';
  }
  return null;
};

const findManagedUser = (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;
  return User.findOne({ _id: userId, role: { $nin: ['admin', 'super_admin'] } });
};

const archiveUser = async ({ userId, adminId, reason, confirmation }) => {
  const validationError = validateArchiveRequest({ reason, confirmation });
  if (validationError) {
    const error = new Error(validationError);
    error.code = 'INVALID_ARCHIVE_REQUEST';
    throw error;
  }

  const query = findManagedUser(userId);
  if (!query) return null;
  const user = await query;
  if (!user) return null;
  if (user.isDeleted || user.accountStatus === 'archived') {
    const error = new Error('This account is already archived');
    error.code = 'ALREADY_ARCHIVED';
    throw error;
  }

  user.accountStatus = 'archived';
  user.isDeleted = true;
  user.deletedAt = new Date();
  user.deletedBy = adminId;
  user.deletionReason = reason.trim();
  user.sessionVersion += 1;
  await user.save();
  const qrResult = await revokeQr({ userId, adminId });
  return { user, revokedCount: qrResult?.revokedCount || 0 };
};

const restoreUser = async ({ userId }) => {
  const query = findManagedUser(userId);
  if (!query) return null;
  const user = await query;
  if (!user) return null;
  if (!user.isDeleted && user.accountStatus !== 'archived') {
    const error = new Error('Only archived accounts can be restored');
    error.code = 'NOT_ARCHIVED';
    throw error;
  }

  user.accountStatus = 'active';
  user.isDeleted = false;
  user.deletedAt = null;
  user.deletedBy = null;
  user.deletionReason = null;
  user.sessionVersion += 1;
  await user.save();
  return user;
};

module.exports = { DELETION_REASONS, archiveUser, restoreUser, validateArchiveRequest };
