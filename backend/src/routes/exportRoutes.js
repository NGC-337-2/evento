const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/bookings/:eventId', protect, authorize('organizer', 'admin'), exportController.exportBookings);
router.get('/events', protect, authorize('organizer', 'admin'), exportController.exportEvents);

module.exports = router;
