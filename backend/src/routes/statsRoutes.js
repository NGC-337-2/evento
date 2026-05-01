// src/routes/statsRoutes.js
const express = require('express');
const router = express.Router();

// Controller & Middleware Imports
const statsController = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/auth');

// ─── Protected Routes (Requires Authentication) ───────────────────────────────

// @route   GET /api/v1/stats/dashboard
// @desc    Get global dashboard statistics (Revenue, Bookings, Users)
// @access  Private/Admin
router.get('/dashboard', protect, authorize('admin'), statsController.getDashboardStats);

// @route   GET /api/v1/stats/organizer
// @desc    Get performance stats for the logged-in organizer
// @access  Private/Organizer
router.get('/organizer', protect, authorize('organizer', 'admin'), statsController.getOrganizerStats);


// @route   GET /api/v1/stats/events/:id
// @desc    Get detailed analytics for a specific event
// @access  Private (Organizer/Admin)
router.get('/events/:id', protect, statsController.getEventStats);

module.exports = router;