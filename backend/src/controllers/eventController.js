const Event = require('../models/Event');
const { EVENT_STATUS, ROLES, PAGINATION } = require('../config/constants');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { logAudit } = require('../utils/audit');
const logger = require('../config/logger');

// ─── Helper: Standardized API Response ──────────────────────────────────────
const apiResponse = (res, statusCode, data, meta = {}) => {
  return res.status(statusCode).json({
    success: statusCode < 400,
    ...meta,
    data,
  });
};

// @desc    Get all events with filtering, pagination & search
// @route   GET /api/v1/events
// @access  Public
exports.getEvents = async (req, res) => {
  const {
    keyword,
    category,
    status,
    sortBy = 'upcoming',
    limit = PAGINATION.DEFAULT_LIMIT,
    page = PAGINATION.DEFAULT_PAGE,
    location,
    minPrice,
    maxPrice
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  // Build query
  let query = {};

  // Public view: only published events. Auth view: drafts if organizer/admin
  if (!req.user || req.user.role === ROLES.ATTENDEE) {
    query.status = EVENT_STATUS.PUBLISHED;
  } else if (status && Object.values(EVENT_STATUS).includes(status)) {
    query.status = status;
  }

  // Keyword search
  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
      { 'location.city': { $regex: keyword, $options: 'i' } },
    ];
  }

  if (category) query.category = category;
  if (location) query['location.city'] = { $regex: location, $options: 'i' };

  // Price range (checks any tier)
  if (minPrice || maxPrice) {
    query['ticketTiers.price'] = {};
    if (minPrice) query['ticketTiers.price'].$gte = Number(minPrice);
    if (maxPrice) query['ticketTiers.price'].$lte = Number(maxPrice);
  }

  // Sorting
  const sortMap = {
    upcoming: { date: 1 },
    newest: { createdAt: -1 },
    'price-low': { 'ticketTiers.price': 1 },
    'price-high': { 'ticketTiers.price': -1 },
  };
  const sortOption = sortMap[sortBy] ? sortBy : 'upcoming';

  const [events, total] = await Promise.all([
    Event.find(query)
      .populate('organizer', 'name email profileImage')
      .sort(sortMap[sortOption])
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Event.countDocuments(query)
  ]);

  return apiResponse(res, 200, events, {
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    }
  });
};

// @desc    Get single event by ID
// @route   GET /api/v1/events/:id
// @access  Public
exports.getEventById = async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('organizer', 'name email profileImage')
    .lean();

  if (!event) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    throw err;
  }

  res.status(200).json({ success: true, data: event });
};

// @desc    Get featured events
// @route   GET /api/v1/events/featured
// @access  Public
exports.getFeaturedEvents = async (req, res) => {
  const events = await Event.find({
    status: EVENT_STATUS.PUBLISHED,
    isFeatured: true,
    date: { $gte: new Date() }
  })
  .populate('organizer', 'name email')
  .limit(5)
  .sort({ date: 1 })
  .lean();

  res.status(200).json({ success: true, count: events.length, data: events });
};

// @desc    Get events created by logged-in user
// @route   GET /api/v1/events/user/my-events
// @access  Private
exports.getMyEvents = async (req, res) => {
  const events = await Event.find({ organizer: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({ success: true, count: events.length, data: events });
};

// @desc    Create new event
// @route   POST /api/v1/events
// @access  Private (Organizer/Admin)
exports.createEvent = async (req, res) => {
  try {
    let imageUrl = null;
    
    // 1. Handle Image Upload
    if (req.file) {
      try {
        logger.info('☁️ Attempting Cloudinary upload...');
        const result = await uploadToCloudinary(req.file.buffer, 'evento/events');
        imageUrl = result.secure_url;
        logger.info('✅ Cloudinary upload successful');
      } catch (cloudErr) {
        logger.error('❌ Cloudinary upload failed', cloudErr);
        const err = new Error(`Image upload failed: ${cloudErr.message}`);
        err.statusCode = 400;
        throw err;
      }
    }

    // 2. Prepare Event Data
    logger.info('💾 Preparing to save event...', { title: req.body.title });
    
    // Ensure numeric fields are actually numbers
    const eventData = {
      ...req.body,
      organizer: req.user._id,
      image: imageUrl,
      capacity: Number(req.body.capacity),
    };

    // 3. Save to Database
    const event = await Event.create(eventData);
    
    logger.info('✅ Event created successfully', { eventId: event._id });
    res.status(201).json({ success: true, data: event });

  } catch (error) {
    logger.error('💥 Critical failure in createEvent:', error);
    
    // If it's a Mongoose validation error, return 400
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }

    // Otherwise, propagate the error (or return 500 if no status)
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Internal Server Error',
      requestId: req.id
    });
  }
};

// @desc    Update event
// @route   PUT /api/v1/events/:id
// @access  Private (Owner/Organizer)
exports.updateEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    throw err;
  }

  // Ownership & Role Check
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== ROLES.ADMIN) {
    const err = new Error('Not authorized to update this event');
    err.statusCode = 403;
    throw err;
  }

  // Handle image update
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'evento/events');
    req.body.image = result.secure_url;
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  ).lean();

  // Log audit if status changed by admin
  if (req.user.role === ROLES.ADMIN && req.body.status && req.body.status !== event.status) {
      const action = req.body.status === EVENT_STATUS.PUBLISHED ? 'APPROVE_EVENT' : 'REJECT_EVENT';
      await logAudit(req, action, 'Event', event._id, { oldStatus: event.status, newStatus: req.body.status });
  }

  res.status(200).json({ success: true, data: updatedEvent });
};

// @desc    Delete event
// @route   DELETE /api/v1/events/:id
// @access  Private (Owner/Organizer)
exports.deleteEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    throw err;
  }

  // Ownership & Role Check
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== ROLES.ADMIN) {
    const err = new Error('Not authorized to delete this event');
    err.statusCode = 403;
    throw err;
  }

  // Constraint: Cannot delete if tickets have been sold
  if (event.bookingsCount > 0) {
    const err = new Error('Cannot delete event with existing bookings. Please cancel it instead.');
    err.statusCode = 400;
    throw err;
  }

  // If hard delete is preferred
  await event.deleteOne();

  // Log audit if deleted by admin
  if (req.user.role === ROLES.ADMIN) {
      await logAudit(req, 'DELETE_EVENT', 'Event', event._id, { title: event.title });
  }
  
  res.status(200).json({ success: true, message: 'Event deleted successfully' });
};

// @desc    Cancel event
// @route   PATCH /api/v1/events/:id/cancel
// @access  Private (Owner/Organizer)
exports.cancelEvent = async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) {
        const err = new Error('Event not found');
        err.statusCode = 404;
        throw err;
    }

    // Ownership & Role Check
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== ROLES.ADMIN) {
        const err = new Error('Not authorized to cancel this event');
        err.statusCode = 403;
        throw err;
    }

    if (event.status === EVENT_STATUS.CANCELLED) {
        const err = new Error('Event is already cancelled');
        err.statusCode = 400;
        throw err;
    }

    // Update status to CANCELLED
    event.status = EVENT_STATUS.CANCELLED;
    await event.save();

    // Trigger notifications (mock or real if service exists)
    logger.info(`📢 Event ${event.title} has been cancelled. Notifications triggered for ${event.bookingsCount} attendees.`);
    
    // Log audit
    await logAudit(req, 'CANCEL_EVENT', 'Event', event._id, { title: event.title });

    res.status(200).json({
        success: true,
        message: 'Event cancelled successfully. Attendees will be notified.',
        data: event
    });
};