// src/routes/eventRoutes.js
const express = require('express');
const router = express.Router();

// Controller & Middleware Imports
const eventController = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { upload } = require('../utils/cloudinary');
const { eventSchema } = require('../utils/validation');

// ─── Public Routes ────────────────────────────────────────────────────────────

// @route   GET /api/v1/events/featured
// @desc    Get featured events (must be before /:id to avoid route collision)
router.get('/featured', eventController.getFeaturedEvents);

// @route   GET /api/v1/events/user/my-events
// @desc    Get events created by the logged-in user
router.get('/user/my-events', protect, eventController.getMyEvents);

// @route   GET /api/v1/events
// @desc    Get all events with filtering, pagination & full-text search
router.get('/', eventController.getEvents);

// @route   GET /api/v1/events/:id
// @desc    Get single event by ID
router.get('/:id', eventController.getEventById);

// Helper to parse JSON strings from FormData (required for file uploads)
const parseEventData = (req, res, next) => {
  if (typeof req.body.location === 'string') {
    try { req.body.location = JSON.parse(req.body.location); } catch (e) {}
  }
  if (typeof req.body.ticketTiers === 'string') {
    try { req.body.ticketTiers = JSON.parse(req.body.ticketTiers); } catch (e) {}
  }
  if (typeof req.body.tags === 'string') {
    try { req.body.tags = JSON.parse(req.body.tags); } catch (e) {}
  }
  if (req.body.capacity) {
    req.body.capacity = parseInt(req.body.capacity, 10);
  }
  next();
};

// ─── Protected Routes (Requires Authentication) ───────────────────────────────

// @route   POST /api/v1/events
// @desc    Create a new event
router.post(
  '/',
  protect,
  authorize('organizer', 'admin'),
  upload.single('image'),
  parseEventData,
  validate(eventSchema),
  eventController.createEvent
);

// @route   PUT /api/v1/events/:id
// @desc    Update event details (ownership verified in controller)
router.put(
  '/:id',
  protect,
  upload.single('image'),
  parseEventData,
  validate(eventSchema),
  eventController.updateEvent
);

// @route   DELETE /api/v1/events/:id
// @desc    Delete event (ownership verified in controller)
router.delete('/:id', protect, eventController.deleteEvent);

// @route   PATCH /api/v1/events/:id/cancel
// @desc    Cancel event (ownership verified in controller)
router.patch('/:id/cancel', protect, authorize('organizer', 'admin'), eventController.cancelEvent);

module.exports = router;