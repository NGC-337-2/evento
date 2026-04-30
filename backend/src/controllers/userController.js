// src/controllers/userController.js
const User = require('../models/User');
const { ROLES } = require('../config/constants');
const logger = require('../config/logger');

// @desc    Get user profile by ID
// @route   GET /api/v1/users/:id
// @access  Private (Self or Admin)
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).lean();

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  // Authorization: Only the user themselves or an admin can view
  if (req.user._id.toString() !== user._id.toString() && req.user.role !== ROLES.ADMIN) {
    const err = new Error('Not authorized to view this profile');
    err.statusCode = 403;
    throw err;
  }

  res.status(200).json({ success: true, data: user });
};

// @desc    Update user profile details
// @route   PUT /api/v1/users/:id
// @access  Private (Self)
exports.updateUser = async (req, res) => {
  if (req.user._id.toString() !== req.params.id) {
    const err = new Error('Not authorized to update this profile');
    err.statusCode = 403;
    throw err;
  }

  // Whitelist allowed fields to prevent role/status tampering
  const allowedUpdates = ['name', 'profileImage', 'location', 'bio'];
  const updates = {};
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  ).lean();

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  res.status(200).json({ success: true, message: 'Profile updated successfully', data: user });
};

// @desc    Update user password
// @route   PUT /api/v1/users/:id/password
// @access  Private (Self)
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (req.user._id.toString() !== req.params.id) {
    const err = new Error('Not authorized to update this password');
    err.statusCode = 403;
    throw err;
  }

  // Fetch user WITH password for comparison
  const user = await User.findById(req.params.id).select('+password');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    const err = new Error('Current password is incorrect');
    err.statusCode = 400;
    throw err;
  }

  // Assign new password; model's pre('save') hook will hash it automatically
  user.password = newPassword;
  await user.save();

  logger.info(`✅ Password updated for user ${user._id}`);
  res.status(200).json({ success: true, message: 'Password updated successfully' });
};

// @desc    Delete user account (Soft delete for self, hard delete for admin)
// @route   DELETE /api/v1/users/:id
// @access  Private (Self or Admin)
exports.deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  if (req.user._id.toString() !== user._id.toString() && req.user.role !== ROLES.ADMIN) {
    const err = new Error('Not authorized to delete this account');
    err.statusCode = 403;
    throw err;
  }

  if (req.user.role !== ROLES.ADMIN) {
    // Regular users: Soft delete by updating status
    user.status = 'deleted';
    await user.save();
  } else {
    // Admins: Hard delete
    await user.deleteOne();
  }

  res.status(200).json({ success: true, message: 'Account deleted successfully' });
};

// @desc    Get all users with pagination (Admin only)
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;

  const users = await User.find({})
    .select('-password -resetPasswordToken -verificationToken')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  const total = await User.countDocuments({});

  res.status(200).json({
    success: true,
    count: users.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data: users,
  });
};