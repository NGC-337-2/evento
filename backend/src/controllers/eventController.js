// src/controllers/eventController.js
const Event = require('../models/Event');
const { EVENT_STATUS, SORT_OPTIONS, MAX_RESULTS_PER_PAGE, ROLES } = require('../config/constants');
const {
  validateEventInput,
  sanitizeSearchInput,
  parseFormDataFields
} = require('../utils/validation');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const logger = require('../config/logger');

// ─── Helper: Standardized API Response ──────────────────────────────────────
const apiResponse = (req, res, statusCode, data, meta = {}) => {
  return res.status(statusCode).json({
    success: statusCode < 400,
    timestamp: new Date().toISOString(),
    requestId: req?.id, // From request ID middleware
    ...meta,
    data,
  });
};

// ─── Helper: Authorization Check ────────────────────────────────────────────
const canManageEvent = (event, user) => {
  return user?.role === 'admin' || event?.organiser?.toString() === user?.id;
};

// ─── GET /api/v1/events — List events with filtering, search, pagination ────
exports.getEvents = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      status,
      sortBy = 'upcoming',
      limit = 12,
      page = 1,
      location,
      minPrice,
      maxPrice,
      startDate,
      endDate
    } = req.query;

    // ⚠️ Sanitize search input to prevent regex injection
    const sanitizedKeyword = sanitizeSearchInput(keyword);

    // Build query with role-based visibility
    let query = {};

    // Public users only see published events; organizers/admins see all
    if (!req.user || req.user.role === ROLES.ATTENDEE) {
      query.status = EVENT_STATUS.PUBLISHED;
    } else if (status && ['draft', 'published', 'cancelled', 'completed'].includes(status)) {
      query.status = status;
    }

    // Search filters
    if (sanitizedKeyword) {
      query.$or = [
        { title: { $regex: sanitizedKeyword, $options: 'i' } },
        { description: { $regex: sanitizedKeyword, $options: 'i' } },
        { 'location.city': { $regex: sanitizedKeyword, $options: 'i' } },
      ];
    }

    if (category) query.category = category;
    if (location) query['location.city'] = { $regex: location, $options: 'i' };

    // Price filter (for paid events)
    if (minPrice || maxPrice) {
      query['ticketTiers'] = { $elemMatch: {} };
      if (minPrice) query['ticketTiers.$elemMatch.price'] = { $gte: Number(minPrice) };
      if (maxPrice) query['ticketTiers.$elemMatch.price'] = {
        ...query['ticketTiers.$elemMatch.price'],
        $lte: Number(maxPrice)
      };
    }

    // Date range filter
    if (startDate || endDate) {
      query['date.start'] = {};
      if (startDate) query['date.start'].$gte = new Date(startDate);
      if (endDate) query['date.start'].$lte = new Date(endDate);
    }

    // Pagination with safety caps
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(
      MAX_RESULTS_PER_PAGE,
      Math.max(1, parseInt(limit, 10))
    );
    const skip = (pageNum - 1) * limitNum;

    // Sorting with whitelist validation
    const sortMap = {
      upcoming: { 'date.start': 1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'price-low': { 'ticketTiers.price': 1 },
      'price-high': { 'ticketTiers.price': -1 },
      popular: { totalSold: -1 },
    };
    const sortOption = SORT_OPTIONS.includes(sortBy) ? sortBy : 'upcoming';

    // Execute query with performance optimizations
    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('organiser', 'name avatar email')
        .select('-__v -updatedAt') // Exclude heavy fields
        .lean() // Return plain JS objects for faster serialization
        .sort(sortMap[sortOption])
        .skip(skip)
        .limit(limitNum),

      Event.countDocuments(query)
    ]);

    // Log search analytics (optional)
    if (sanitizedKeyword) {
      logger.info('🔍 Event search performed', {
        keyword: sanitizedKeyword,
        results: events.length,
        userId: req.user?.id,
        requestId: req.id,
      });
    }

    return apiResponse(req, res, 200, events, {
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
        hasNext: skip + events.length < total,
        hasPrev: pageNum > 1,
      },
      filters: { category, location, sortBy: sortOption },
    });

  } catch (error) {
    next(error); // Pass to global errorHandler
  }
};

// ─── GET /api/v1/events/:id — Get single event by ID ────────────────────────
exports.getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Build query: public users only see published; owners see all
    const query = { _id: id };
    if (!req.user || req.user.role === ROLES.ATTENDEE) {
      query.status = EVENT_STATUS.PUBLISHED;
    }

    const event = await Event.findOne(query)
      .populate('organiser', 'name avatar email bio')
      .lean();

    if (!event) {
      return apiResponse(req, res, 404, null, { message: 'Event not found or not published' });
    }

    // Increment view count for analytics (non-blocking)
    Event.findByIdAndUpdate(id, { $inc: { views: 1 } })
      .catch(err => logger.warn('⚠️ Failed to increment view count', { eventId: id, error: err.message }));

    return apiResponse(req, res, 200, event);

  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/events — Create new event ─────────────────────────────────
const { upload, uploadToCloudinary } = require('../utils/cloudinary');

// ... inside your route handler
exports.createEvent = [
  upload.single('image'), // 1. Parse file into req.file (buffer)
  async (req, res, next) => {
    try {
      let imageUrl = '';
      
      // 2. If file exists, upload to Cloudinary v2 manually
      if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer, 'evento/events');
        imageUrl = result.secure_url;
      }

      // 3. Create Event in DB
      const event = await Event.create({
        ...req.body,
        image: imageUrl,
        organiser: req.user.id,
        // ... parse other fields like location/date if needed
      });

      res.status(201).json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  },
];

// ─── PUT /api/v1/events/:id — Update event ──────────────────────────────────
exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find event first for authorization check
    const event = await Event.findById(id);
    if (!event) {
      return apiResponse(req, res, 404, null, { message: 'Event not found' });
    }

    // 🔐 Authorization: only owner or admin can update
    if (!canManageEvent(event, req.user)) {
      logger.warn('🚫 Unauthorized update attempt', {
        eventId: id,
        userId: req.user?.id,
        eventOrganiser: event.organiser,
        requestId: req.id,
      });
      return apiResponse(req, res, 403, null, { message: 'Not authorized to update this event' });
    }

    // Validate update payload (partial validation allowed)
    const validation = await validateEventInput(req.body, { partial: true });
    if (!validation.success) {
      return apiResponse(res, 400, null, {
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const parsedBody = parseFormDataFields(req.body, ['location', 'date', 'ticketTiers']);

    // Handle image replacement
    if (req.file || req.cloudinary?.url) {
      // Delete old image if exists
      if (event.imagePublicId) {
        await deleteFromCloudinary(event.imagePublicId).catch(err =>
          logger.warn('⚠️ Failed to delete old event image', {
            publicId: event.imagePublicId,
            error: err.message
          })
        );
      }

      // Set new image
      const imageUrl = req.cloudinary?.url || req.file?.path;
      const imagePublicId = req.cloudinary?.publicId;

      parsedBody.image = imageUrl;
      parsedBody.imagePublicId = imagePublicId;
    }

    // Recalculate capacity if ticket tiers changed
    if (parsedBody.ticketTiers) {
      parsedBody.totalCapacity = parsedBody.ticketTiers.reduce(
        (acc, tier) => acc + Number(tier.capacity), 0
      );
    }

    // Update with validation and return fresh document
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: parsedBody },
      {
        new: true,
        runValidators: true,
        context: 'query' // Ensure custom validators run
      }
    ).populate('organiser', 'name avatar').lean();

    logger.info('✏️ Event updated successfully', {
      eventId: id,
      updatedBy: req.user.id,
      changes: Object.keys(parsedBody),
      requestId: req.id,
    });

    return apiResponse(req, res, 200, updatedEvent);

  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/events/:id — Delete event (soft delete preferred) ───────
exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return apiResponse(req, res, 404, null, { message: 'Event not found' });
    }

    // 🔐 Authorization check
    if (!canManageEvent(event, req.user)) {
      return apiResponse(req, res, 403, null, { message: 'Not authorized to delete this event' });
    }

    // 🚫 Business rule: prevent deletion if tickets sold (use cancellation instead)
    if (event.totalSold > 0) {
      return apiResponse(req, res, 400, null, { 
        message: 'Cannot delete event with existing ticket sales. Use cancellation instead.',
        suggestion: `PATCH /api/v1/events/${id} with { status: "cancelled" }`
      });
    }

    // 💡 Preferred: Soft delete via status update (preserves analytics/history)
    // If hard delete is required, uncomment below and comment out soft delete
    /*
    // Hard delete: cleanup Cloudinary image first
    if (event.imagePublicId) {
      await deleteFromCloudinary(event.imagePublicId);
    }
    await Event.findByIdAndDelete(id);
    */

    // Soft delete: update status to cancelled + add deletion metadata
    const deletedEvent = await Event.findByIdAndUpdate(
      id,
      {
        $set: {
          status: EVENT_STATUS.CANCELLED,
          deletedAt: new Date(),
          deletedBy: req.user.id,
          cancellationReason: req.body.reason || 'Deleted by organiser'
        }
      },
      { new: true }
    ).populate('organiser', 'name avatar').lean();

    // Cleanup Cloudinary image asynchronously (non-blocking)
    if (event.imagePublicId) {
      deleteFromCloudinary(event.imagePublicId)
        .catch(err => logger.warn('⚠️ Async Cloudinary cleanup failed', {
          publicId: event.imagePublicId,
          error: err.message
        }));
    }

    logger.info('🗑️ Event deleted (soft)', {
      eventId: id,
      deletedBy: req.user.id,
      reason: req.body.reason,
      requestId: req.id,
    });

    return apiResponse(req, res, 200, { 
      message: 'Event successfully cancelled',
      event: deletedEvent 
    });

  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/v1/events/:id/publish — Publish draft event ─────────────────
exports.publishEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return apiResponse(req, res, 404, null, { message: 'Event not found' });
    }

    if (!canManageEvent(event, req.user)) {
      return apiResponse(req, res, 403, null, { message: 'Not authorized' });
    }

    if (event.status !== EVENT_STATUS.DRAFT) {
      return apiResponse(req, res, 400, null, { 
        message: `Cannot publish event with status: ${event.status}` 
      });
    }

    // Validate event is complete enough to publish
    const requiredFields = ['title', 'description', 'date', 'location', 'ticketTiers', 'image'];
    const missing = requiredFields.filter(field => !event[field]);

    if (missing.length > 0) {
      return apiResponse(req, res, 400, null, {
        message: 'Event incomplete',
        missingFields: missing,
      });
    }

    const publishedEvent = await Event.findByIdAndUpdate(
      id,
      {
        $set: {
          status: EVENT_STATUS.PUBLISHED,
          publishedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    ).populate('organiser', 'name avatar').lean();

    logger.info('📢 Event published', {
      eventId: id,
      publishedBy: req.user.id,
      requestId: req.id,
    });

    return apiResponse(req, res, 200, publishedEvent);

  } catch (error) {
    next(error);
  }
};