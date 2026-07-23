const { listUsers } = require('../services/adminUserQueryService');

exports.listUsers = async (req, res) => {
  try {
    res.json(await listUsers(req.query));
  } catch (error) {
    console.error('Admin user list error:', error.message);
    res.status(500).json({ message: 'Unable to load users' });
  }
};
