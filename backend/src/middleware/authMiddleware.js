const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes: verify JWT from either HttpOnly cookie or Authorization header
 * Derives user identity strictly from verified token (never trusts frontend userId)
 */
const protect = async (req, res, next) => {
  try {
    let token = req.cookies && req.cookies.token;

    // Fallback: Authorization header (Bearer <token>)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied: No authentication token provided',
      });
    }

    const secret = process.env.JWT_SECRET || 'skillsprint_development_jwt_secret_key_2026';
    const decoded = jwt.verify(token, secret);

    // Verify user exists in database
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied: User account no longer exists',
      });
    }

    // Attach verified user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired: Please log in again',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Access denied: Invalid authentication token',
    });
  }
};

module.exports = { protect };
