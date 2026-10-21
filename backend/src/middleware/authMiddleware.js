const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const { sendError } = require('../utils/apiResponse');

/**
 * Authentication middleware verifying JWT from HttpOnly cookie or Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HttpOnly cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Check Authorization Bearer header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Authentication required. Please log in.', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Fetch user
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return sendError(res, 'User session has expired or user no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Your session has expired. Please log in again.', 401);
    }
    return sendError(res, 'Invalid authentication token. Please log in.', 401);
  }
};

/**
 * Optional authentication middleware for routes that can adapt if user is logged in
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (user) {
        req.user = user;
      }
    }
  } catch {
    // Silently continue without user
  }
  next();
};

module.exports = {
  authenticate,
  optionalAuth
};
