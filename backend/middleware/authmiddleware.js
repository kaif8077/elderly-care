// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sessionMatches } = require('../services/userSessionService');

const authMiddleware = async (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
      .select('_id role accountStatus isDeleted sessionVersion')
      .lean();
    const sessionIsCurrent = user && sessionMatches(decoded.sessionVersion, user.sessionVersion);

    if (!user || user.accountStatus !== 'active' || user.isDeleted) {
      return res
        .status(401)
        .json({ message: 'Account is no longer active', code: 'ACCOUNT_NOT_ACTIVE' });
    }
    if (!sessionIsCurrent) {
      return res
        .status(401)
        .json({ message: 'Account session is no longer active', code: 'SESSION_REVOKED' });
    }

    req.user = { id: String(user._id), role: user.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = authMiddleware;
