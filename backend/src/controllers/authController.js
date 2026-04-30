// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('../services/emailService');
const logger = require('../config/logger');
const { JWT_SECRET, JWT_EXPIRES_IN = '7d', CLIENT_URL } = process.env;

// 🔑 Helper: Generate JWT
const signToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const err = new Error('User with this email already exists');
    err.statusCode = 409;
    throw err;
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

  const user = await User.create({ 
    name, 
    email, 
    password,
    role,
    isVerified: process.env.NODE_ENV === 'development', // Auto-verify in dev
    verificationToken: hashedVerificationToken,
    verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
  });

  // Send verification email (don't await to avoid slowing down registration)
  if (process.env.NODE_ENV !== 'development') {
    emailService.sendVerificationEmail(user.email, verificationToken)
      .catch(err => logger.error('Failed to send verification email', err));
  }

  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please verify your email.',
    data: { user, token }
  });
};

// @desc    Authenticate user & return JWT
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  if (!user.isVerified) {
    const err = new Error('Please verify your email before logging in');
    err.statusCode = 403;
    throw err;
  }

  const token = signToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user, token }
  });
};

// @desc    Get current logged-in user profile
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
};

// @desc    Verify user email address
// @route   POST /api/v1/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  const { email, token } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    email,
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    const err = new Error('Invalid or expired verification token');
    err.statusCode = 400;
    throw err;
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
    data: { token: signToken(user._id) }
  });
};

// @desc    Request password reset
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Security: Always return 200 to prevent email enumeration
  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.'
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  const resetUrl = `${CLIENT_URL}/reset-password/${resetToken}`;

  emailService.sendPasswordResetEmail(user.email, resetUrl)
    .catch(err => logger.error('Failed to send password reset email', err));

  res.status(200).json({
    success: true,
    message: 'Password reset instructions sent.',
    data: { resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined }
  });
};


// @desc    Reset password using token
// @route   PUT /api/v1/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    const err = new Error('Invalid or expired reset token');
    err.statusCode = 400;
    throw err;
  }

  user.password = req.body.password; // Model pre-save hook will hash it
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successful. You can now log in.',
    data: { token: signToken(user._id) }
  });
};