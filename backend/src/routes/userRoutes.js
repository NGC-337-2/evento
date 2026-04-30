// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();

// Controller & Middleware Imports
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// ─── Protected Routes (Requires Authentication) ───────────────────────────────

// @route   GET /api/v1/users/:id
// @desc    Get user profile by ID (Admin or self)
// @access  Private
router.get('/:id', protect, userController.getUserById);

// @route   PUT /api/v1/users/:id
// @desc    Update user profile details
// @access  Private
router.put('/:id', protect, userController.updateUser);

// @route   PUT /api/v1/users/:id/password
// @desc    Update user password
// @access  Private
router.put('/:id/password', protect, userController.updatePassword);

// @route   DELETE /api/v1/users/:id
// @desc    Delete user account (Admin or self)
// @access  Private
router.delete('/:id', protect, userController.deleteUser);

// ─── Admin-Only Routes ────────────────────────────────────────────────────────

// @route   GET /api/v1/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), userController.getAllUsers);

module.exports = router;