const jwt = require('jsonwebtoken');

/**
 * Generate JWT token and set HttpOnly cookie on the response
 * @param {Object} res - Express response object
 * @param {string} userId - User ID to encode
 * @returns {string} token - Signed JWT token
 */
const generateTokenAndSetCookie = (res, userId) => {
  const secret = process.env.JWT_SECRET || 'skillsprint_development_jwt_secret_key_2026';
  const token = jwt.sign({ id: userId }, secret, {
    expiresIn: '7d',
  });

  const isProduction = process.env.NODE_ENV === 'production';

  // Secure HttpOnly cookie configuration
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  return token;
};

/**
 * Clear the authentication cookie upon logout
 * @param {Object} res - Express response object
 */
const clearTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0),
    path: '/',
  });
};

module.exports = {
  generateTokenAndSetCookie,
  clearTokenCookie,
};
