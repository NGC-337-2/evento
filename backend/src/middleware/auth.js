// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

/**
 * Protect routes: Verify JWT & attach user to request
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Extract token from Bearer header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Fallback to httpOnly cookie
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // 3. Reject if no token
  if (!token) {
    const err = new Error('Not authorized to access this route');
    err.statusCode = 401;
    err.name = 'UnauthorizedError';
    throw err;
  }

  try {
    // 4. Verify token signature & expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Fetch user from DB (exclude password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      const err = new Error('User associated with this token no longer exists');
      err.statusCode = 401;
      err.name = 'UnauthorizedError';
      throw err;
    }

    // 6. Attach to request for downstream controllers
    req.user = user;
    next();
  } catch (error) {
    // Normalize JWT errors for global handler
    if (error.name === 'JsonWebTokenError') {
      error.statusCode = 401;
      error.message = 'Invalid or malformed token';
    } else if (error.name === 'TokenExpiredError') {
      error.statusCode = 401;
      error.message = 'Session expired. Please log in again.';
    } else {
      error.statusCode = error.statusCode || 500;
    }
    error.name = error.name || 'AuthError';
    throw error;
  }
};

/**
 * Authorize routes: Restrict access to specific roles
 * Usage: router.get('/admin', protect, authorize('admin'), controller);
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      const err = new Error('Authentication required');
      err.statusCode = 401;
      err.name = 'UnauthorizedError';
      throw err;
    }

    if (!allowedRoles.includes(req.user.role)) {
      const err = new Error(`Role '${req.user.role}' is not authorized to access this resource`);
      err.statusCode = 403;
      err.name = 'ForbiddenError';
      throw err;
    }

    next();
  };
};

module.exports = { protect, authorize };