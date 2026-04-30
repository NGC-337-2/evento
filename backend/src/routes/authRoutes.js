// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();

// Controller import
const authController = require('../controllers/authController');

// Middleware imports
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

// Validation schema imports
const { 
  registerSchema, 
  loginSchema, 
  emailSchema, 
  passwordResetSchema 
} = require('../utils/validation');

// ─── Public Routes (No Auth Required) ────────────────────────────────────────

// @route   POST /api/v1/auth/register
// @desc    Register a new user
router.post('/register', validate(registerSchema), authController.register);

// @route   POST /api/v1/auth/login
// @desc    Authenticate user and return JWT
router.post('/login', validate(loginSchema), authController.login);

// @route   POST /api/v1/auth/verify-email
// @desc    Verify user email
router.post('/verify-email', validate(emailSchema), authController.verifyEmail);

// @route   POST /api/v1/auth/forgot-password
// @desc    Request password reset token
router.post('/forgot-password', validate(emailSchema), authController.forgotPassword);

// @route   PUT /api/v1/auth/reset-password/:token
// @desc    Reset password using token
router.put('/reset-password/:token', validate(passwordResetSchema), authController.resetPassword);

// ─── Private Routes (Requires Auth) ──────────────────────────────────────────

// @route   GET /api/v1/auth/me
// @desc    Get current logged-in user profile
router.get('/me', protect, authController.getMe);

module.exports = router;