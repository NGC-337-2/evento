// src/services/jwtService.js
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

// 🔐 Load & validate JWT configuration
const {
  JWT_SECRET,
  JWT_EXPIRES_IN = '7d',
  JWT_REFRESH_SECRET = process.env.JWT_SECRET, // Fallback if not explicitly set
  JWT_REFRESH_EXPIRES_IN = '30d'
} = process.env;

if (!JWT_SECRET) {
  logger.error('❌ JWT_SECRET is missing in environment variables');
  process.exit(1);
}

// 🎫 Generate Access Token (short-lived, for API requests)
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256',
  });
};

// 🔄 Generate Refresh Token (long-lived, for token rotation)
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    algorithm: 'HS256',
  });
};

// ✅ Verify Access Token
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    const err = new Error(`Invalid access token: ${error.message}`);
    err.name = error.name; // JsonWebTokenError or TokenExpiredError
    err.statusCode = error.name === 'TokenExpiredError' ? 401 : 403;
    throw err;
  }
};

// ✅ Verify Refresh Token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    const err = new Error(`Invalid refresh token: ${error.message}`);
    err.name = error.name;
    err.statusCode = error.name === 'TokenExpiredError' ? 401 : 403;
    throw err;
  }
};

// 🔍 Decode Token without verification (useful for debugging/logging)
const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true, json: true });
  } catch (error) {
    logger.warn('⚠️ Failed to decode token', error.message);
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
};