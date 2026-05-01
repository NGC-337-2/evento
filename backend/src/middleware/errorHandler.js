// src/middleware/errorHandler.js
const logger = require('../config/logger');

// 🚧 404 Not Found Handler
// Must be placed after all routes. Passes control to errorHandler.
const notFound = (req, res, next) => {
  const err = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(err);
};

// 🛡️ Global Error Handler
// Express requires 4 arguments for error middleware: (err, req, res, next)
const errorHandler = (err, req, res, next) => {
  // Log structured error for monitoring/debugging
  logger.error(`❌ ${err.message}`, {
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.originalUrl,
    method: req.method,
    requestId: req.id,
    statusCode: err.statusCode || res.statusCode,
    user: req.user?._id || 'anonymous',
  });

  // Default fallback
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'Internal Server Error';

  // 📦 Mongoose: Invalid ObjectId format
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = `Invalid resource ID format: ${err.value}`;
  }

  // 📦 Mongoose: Unique constraint violation (Duplicate Key)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue).join(', ');
    message = `Duplicate value for field: ${field}`;
  }

  // 📦 Mongoose: Schema validation failed
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  // 🔑 JWT: Invalid or malformed token
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid or malformed token. Please log in again.';
  }

  // ⏱️ JWT: Expired token
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired. Please log in again.';
  }

  // 💳 Stripe/Webhook signature mismatch (if applicable)
  if (err.type === 'StripeSignatureVerificationError') {
    statusCode = 400;
    message = 'Invalid webhook signature';
  }

  // 📤 Send consistent JSON response
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    requestId: req.id, // Helps frontend correlate errors with network requests
  });
};

module.exports = { notFound, errorHandler };