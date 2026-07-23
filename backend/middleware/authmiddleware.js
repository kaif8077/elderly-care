// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
        const sessionIsCurrent = decoded.sessionVersion === undefined
            || decoded.sessionVersion === user?.sessionVersion;

        if (!user || user.accountStatus !== 'active' || user.isDeleted || !sessionIsCurrent) {
            return res.status(401).json({ message: 'Account session is no longer active' });
        }

        req.user = { id: String(user._id), role: user.role };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = authMiddleware;
