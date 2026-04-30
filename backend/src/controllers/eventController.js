const Event = require('../models/Event');
const { EVENT_STATUS, ROLES, PAGINATION } = require('../config/constants');
const { uploadToCloudinary } = require('../utils/cloudinary');
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
  let imageUrl = null;
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'evento/events');
    imageUrl = result.secure_url;
  }

  // Handle nested JSON strings from FormData
  const body = { ...req.body };
  if (typeof body.location === 'string') body.location = JSON.parse(body.location);
  if (typeof body.ticketTiers === 'string') body.ticketTiers = JSON.parse(body.ticketTiers);
  
  const event = await Event.create({
    ...body,
    organizer: req.user._id,
    image: imageUrl,
  });

  res.status(201).json({ success: true, data: event });
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

  // Handle nested JSON strings from FormData if present
  const body = { ...req.body };
  if (typeof body.location === 'string') body.location = JSON.parse(body.location);
  if (typeof body.ticketTiers === 'string') body.ticketTiers = JSON.parse(body.ticketTiers);

  const updatedEvent = await Event.findByIdAndUpdate(
    req.params.id,
    { $set: body },
    { new: true, runValidators: true }
  ).lean();

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

  // If hard delete is preferred
  await event.deleteOne();
  
  res.status(200).json({ success: true, message: 'Event deleted successfully' });
};