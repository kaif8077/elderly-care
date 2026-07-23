const { listUsers } = require('../services/adminUserQueryService');
const { getAdminUserDetail } = require('../services/adminUserDetailService');
const { writeAuditLog } = require('../services/auditService');

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
