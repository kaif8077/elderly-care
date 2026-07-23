const { listUsers } = require('../services/adminUserQueryService');
const { getAdminUserDetail } = require('../services/adminUserDetailService');
const { writeAuditLog } = require('../services/auditService');
const { updateAccountStatus } = require('../services/adminIdCardService');
const { archiveUser, restoreUser } = require('../services/adminUserLifecycleService');

exports.listUsers = async (req, res) => {
  try {
    res.json(await listUsers(req.query));
  } catch (error) {
    console.error('Admin user list error:', error.message);
    res.status(500).json({ message: 'Unable to load users' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const detail = await getAdminUserDetail(req.params.userId);
    if (!detail) {
      return res.status(404).json({ message: 'User not found', code: 'ADMIN_USER_NOT_FOUND' });
    }

    await writeAuditLog({
      req,
      actor: req.admin,
      action: 'ADMIN_USER_PROFILE_OPENED',
      resourceType: 'User',
      resourceId: detail.user.id,
      affectedUserId: detail.user.id,
      description: 'Admin opened a user profile'
    });

    res.json(detail);
  } catch (error) {
    console.error('Admin user detail error:', error.message);
    res.status(500).json({ message: 'Unable to load user details' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const result = await updateAccountStatus({
      userId: req.params.userId,
      status: req.body.status,
      adminId: req.admin._id
    });
    if (!result) return res.status(404).json({ message: 'User not found' });

    await writeAuditLog({
      req,
      actor: req.admin,
      action: result.user.accountStatus === 'active' ? 'ADMIN_USER_ACTIVATED' : 'ADMIN_USER_DEACTIVATED',
      resourceType: 'User',
      resourceId: result.user._id,
      affectedUserId: result.user._id,
      description: `Admin changed account status from ${result.previousStatus} to ${result.user.accountStatus}`
    });

    res.json({
      message: 'Account status updated',
      accountStatus: result.user.accountStatus,
      revokedQrCodes: result.revokedCount
    });
  } catch (error) {
    if (error.code === 'INVALID_ACCOUNT_STATUS') {
      return res.status(400).json({ message: error.message, code: error.code });
    }
    console.error('Admin account status error:', error.message);
    res.status(500).json({ message: 'Unable to update account status' });
  }
};

exports.archive = async (req, res) => {
  try {
    const result = await archiveUser({
      userId: req.params.userId,
      adminId: req.admin._id,
      reason: req.body.reason,
      confirmation: req.body.confirmation
    });
    if (!result) return res.status(404).json({ message: 'User not found' });

    await writeAuditLog({
      req,
      actor: req.admin,
      action: 'ADMIN_USER_ARCHIVED',
      resourceType: 'User',
      resourceId: result.user._id,
      affectedUserId: result.user._id,
      description: 'Admin archived a user account and revoked active access',
      reason: result.user.deletionReason
    });
    res.json({ message: 'User account archived', revokedQrCodes: result.revokedCount });
  } catch (error) {
    if (['INVALID_ARCHIVE_REQUEST', 'ALREADY_ARCHIVED'].includes(error.code)) {
      return res.status(error.code === 'ALREADY_ARCHIVED' ? 409 : 400).json({ message: error.message, code: error.code });
    }
    console.error('Admin archive error:', error.message);
    res.status(500).json({ message: 'Unable to archive user' });
  }
};

exports.restore = async (req, res) => {
  try {
    const user = await restoreUser({ userId: req.params.userId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    await writeAuditLog({
      req,
      actor: req.admin,
      action: 'ADMIN_USER_RESTORED',
      resourceType: 'User',
      resourceId: user._id,
      affectedUserId: user._id,
      description: 'Admin restored an archived user account'
    });
    res.json({ message: 'User account restored', accountStatus: user.accountStatus });
  } catch (error) {
    if (error.code === 'NOT_ARCHIVED') return res.status(409).json({ message: error.message, code: error.code });
    console.error('Admin restore error:', error.message);
    res.status(500).json({ message: 'Unable to restore user' });
  }
};
