const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');
const router = express.Router();

// Setup protection for all user routes
router.use(protect);

// @desc    Get all users (Admin only stub)
// @route   GET /api/v1/users
// @access  Private/Admin
router.get('/', authorize(ROLES.ADMIN), (req, res) => {
  res.status(200).json({ success: true, message: 'Get all users stub' });
});

// @desc    Get user by ID
// @route   GET /api/v1/users/:id
// @access  Private/Admin
router.get('/:id', authorize(ROLES.ADMIN), (req, res) => {
  res.status(200).json({ success: true, message: `Get user ${req.params.id} stub` });
});

module.exports = router;
