const express = require('express');
const { createBooking, getMyBookings, getBookingById } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');
const router = express.Router();

// NOTE: Webhook is mounted in server.js directly due to raw body requirement
// app.post('/api/v1/bookings/webhook', express.raw({type: 'application/json'}), stripeWebhook);

router.use(protect);

// @desc    Get all bookings (Admin only)
// @route   GET /api/v1/bookings
// @access  Private/Admin
router.get('/', authorize(ROLES.ADMIN), (req, res) => {
  res.status(200).json({ success: true, message: 'Get all bookings stub' });
});

router.route('/')
  .post(createBooking);

router.route('/my-bookings')
  .get(getMyBookings);

router.route('/:id')
  .get(getBookingById);

// @desc    Cancel booking
// @route   PUT /api/v1/bookings/:id/cancel
// @access  Private
router.put('/:id/cancel', (req, res) => {
  res.status(200).json({ success: true, message: `Cancel booking ${req.params.id} stub` });
});

module.exports = router;
