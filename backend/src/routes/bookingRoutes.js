// src/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();

// Controller & Middleware Imports
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { bookingSchema } = require('../utils/validation');

// ─── Protected Routes (Requires Authentication) ───────────────────────────────

// @route   POST /api/v1/bookings
// @desc    Create a new booking for an event
// @access  Private
router.post(
  '/',
  protect,
  validate(bookingSchema),
  bookingController.createBooking
);

// @route   GET /api/v1/bookings
// @desc    Get all bookings for the logged-in user
// @access  Private
router.get('/', protect, bookingController.getUserBookings);

// @route   GET /api/v1/bookings/:id
// @desc    Get single booking details by ID
// @access  Private
router.get('/:id', protect, bookingController.getBookingById);

// @route   PUT /api/v1/bookings/:id/cancel
// @desc    Cancel an existing booking
// @access  Private
router.put('/:id/cancel', protect, bookingController.cancelBooking);

// ─── Admin-Only Routes ────────────────────────────────────────────────────────

// @route   GET /api/v1/bookings/admin/all
// @desc    Get all bookings (Admin only)
// @access  Private/Admin
const { authorize } = require('../middleware/auth');
router.get('/admin/all', protect, authorize('admin'), bookingController.getAllBookings);

// ─── Organizer Routes ────────────────────────────────────────────────────────

// @route   GET /api/v1/bookings/event/:eventId
// @desc    Get all attendees for a specific event
// @access  Private/Organizer/Admin
router.get('/event/:eventId', protect, authorize('organizer', 'admin'), bookingController.getEventAttendees);

// @route   PATCH /api/v1/bookings/:id/check-in
// @desc    Check-in attendee
// @access  Private/Organizer/Admin
router.patch('/:id/check-in', protect, authorize('organizer', 'admin'), bookingController.checkInAttendee);

// ⚠️ Note: Stripe webhook route is registered directly in server.js
// at '/api/v1/bookings/webhook' to use raw body parsing & verify signatures.

module.exports = router;