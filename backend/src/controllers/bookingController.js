const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const QRCode = require('qrcode');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { BOOKING_STATUS, EVENT_STATUS } = require('../config/constants');
const { sendBookingConfirmation, sendBookingCancellation } = require('../services/emailService');
const { logAudit } = require('../utils/audit');
const logger = require('../config/logger');

// @desc    Create new booking checkout session
// @route   POST /api/v1/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  const { eventId, tickets, notes } = req.body; // tickets: [{ tierId, quantity }]

  if (!tickets || tickets.length === 0) {
    const err = new Error('No tickets requested');
    err.statusCode = 400;
    throw err;
  }

  // Find event and check capacity
  const event = await Event.findById(eventId);
  if (!event) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    throw err;
  }

  if (event.status !== EVENT_STATUS.PUBLISHED) {
     const err = new Error('Event is not open for booking');
     err.statusCode = 400;
     throw err;
  }

  let totalPrice = 0;
  let totalQuantity = 0;
  const bookingTickets = [];
  const lineItems = [];

  // Validate and calculate totals
  for (const requestedTicket of tickets) {
    const tier = event.ticketTiers.id(requestedTicket.tierId);
    
    if (!tier) {
      const err = new Error(`Ticket tier invalid: ${requestedTicket.tierId}`);
      err.statusCode = 400;
      throw err;
    }

    if (tier.capacity - tier.sold < requestedTicket.quantity) {
      const err = new Error(`Not enough tickets available for tier: ${tier.name}`);
      err.statusCode = 400;
      throw err;
    }

    const price = tier.price;
    totalPrice += price * requestedTicket.quantity;
    totalQuantity += requestedTicket.quantity;

    bookingTickets.push({
      tierId: tier._id,
      tierName: tier.name,
      quantity: requestedTicket.quantity,
      pricePerTicket: price
    });

    if (price > 0) {
        lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${event.title} - ${tier.name} Ticket`,
                images: event.image ? [event.image] : [],
              },
              unit_amount: Math.round(price * 100), // Stripe expects cents
            },
            quantity: requestedTicket.quantity,
        });
    }
  }

  // Create initial booking record in database
  const booking = await Booking.create({
    user: req.user._id,
    event: event._id,
    tickets: bookingTickets,
    quantity: totalQuantity,
    totalPrice,
    status: totalPrice === 0 ? BOOKING_STATUS.CONFIRMED : BOOKING_STATUS.PENDING,
    paymentStatus: totalPrice === 0 ? 'completed' : 'pending',
    notes
  });

  // Handle Free tickets (skip stripe)
  if (totalPrice === 0) {
      // Update Event Sold Count
      for (const t of bookingTickets) {
         const tier = event.ticketTiers.id(t.tierId);
         tier.sold += t.quantity;
      }
      event.bookingsCount += totalQuantity;
      await event.save();

      // Generate Ticket Codes
      booking.generateTicketCodes();
      await booking.save();

      // Send email
      await sendBookingConfirmation(req.user.email, booking, event);

      return res.status(201).json({
          success: true,
          message: 'Free booking confirmed',
          data: { booking }
      });
  }

  // Handle Paid Tickets with Stripe Checkout
  const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  
  try {
    logger.info('💳 Creating Stripe checkout session...', { bookingId: booking._id });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${frontendUrl}/booking-success?session_id={CHECKOUT_SESSION_ID}&bookingId=${booking._id}`,
      cancel_url: `${frontendUrl}/event/${event._id}?payment=cancelled`,
      client_reference_id: booking._id.toString(),
      customer_email: req.user.email,
      metadata: {
          bookingId: booking._id.toString(),
          userId: req.user._id.toString(),
          eventId: event._id.toString()
      }
    });

    // Save payment intent to booking
    booking.paymentIntentId = session.id;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Redirect to Stripe checkout',
      data: { url: session.url, bookingId: booking._id }
    });
  } catch (stripeErr) {
    logger.error('❌ Stripe checkout failed', stripeErr);
    const err = new Error(`Checkout failed: ${stripeErr.message}`);
    err.statusCode = 400;
    throw err;
  }
};

// @desc    Get all bookings for logged-in user
// @route   GET /api/v1/bookings
// @access  Private
exports.getUserBookings = async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title date location image status')
      .sort({ createdAt: -1 });
  
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
};

// @desc    Get single booking by ID
// @route   GET /api/v1/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
    const booking = await Booking.findById(req.params.id)
        .populate('event', 'title date location venue capacity organizer')
        .populate('user', 'name email');
    
    if (!booking) {
        const err = new Error('Booking not found');
        err.statusCode = 404;
        throw err;
    }

    // Security: Only the attendee, the event organizer, or an admin can view a booking
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isOrganizer = booking.event.organizer?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isOrganizer && !isAdmin) {
        const err = new Error('Not authorized to view this booking');
        err.statusCode = 403;
        throw err;
    }

    res.status(200).json({
        success: true,
        data: booking
    });
};

// @desc    Cancel a booking
// @route   PUT /api/v1/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate('event');
    
    if (!booking) {
        const err = new Error('Booking not found');
        err.statusCode = 404;
        throw err;
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        const err = new Error('Not authorized to cancel this booking');
        err.statusCode = 403;
        throw err;
    }

    if (booking.status === BOOKING_STATUS.CANCELLED) {
        const err = new Error('Booking is already cancelled');
        err.statusCode = 400;
        throw err;
    }

    const event = await Event.findById(booking.event._id);

    // Update Event counts ONLY if the booking was confirmed/paid (meaning counts were incremented)
    if (booking.status === BOOKING_STATUS.CONFIRMED && event) {
        for (const t of booking.tickets) {
            const tier = event.ticketTiers.id(t.tierId);
            if (tier) {
                tier.sold = Math.max(0, tier.sold - t.quantity);
            }
        }
        event.bookingsCount = Math.max(0, event.bookingsCount - booking.quantity);
        await event.save();
    }

    // Update status to cancelled
    booking.status = BOOKING_STATUS.CANCELLED;
    booking.cancelledAt = new Date();
    booking.cancelledBy = req.user._id;
    booking.paymentStatus = 'refunded';
    
    await booking.save();

    // Log audit if cancelled by admin
    if (req.user.role === 'admin') {
        await logAudit(req, 'CANCEL_BOOKING', 'Booking', booking._id, { eventTitle: event?.title || 'Unknown Event' });
    }

    // Send Cancellation Email
    if (event) {
        await sendBookingCancellation(req.user.email, event);
    }

    res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking
    });
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/v1/bookings/admin/all
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  const bookings = await Booking.find()
    .populate('event', 'title date location image')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: bookings.length, data: bookings });
};

// @desc    Get all attendees for a specific event (Organizer/Admin)
// @route   GET /api/v1/bookings/event/:eventId
// @access  Private (Owner/Admin)
exports.getEventAttendees = async (req, res) => {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
        const err = new Error('Event not found');
        err.statusCode = 404;
        throw err;
    }

    // Authorization
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        const err = new Error('Not authorized to view bookings for this event');
        err.statusCode = 403;
        throw err;
    }

    const bookings = await Booking.find({ event: req.params.eventId })
        .populate('user', 'name email profileImage')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings
    });
};

// @desc    Check-in attendee (Manual or QR)
// @route   PATCH /api/v1/bookings/:id/check-in
// @access  Private (Organizer/Admin)
exports.checkInAttendee = async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate('event');
    if (!booking) {
        const err = new Error('Booking not found');
        err.statusCode = 404;
        throw err;
    }

    // Authorization
    if (booking.event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        const err = new Error('Not authorized to perform check-in');
        err.statusCode = 403;
        throw err;
    }

    if (booking.status !== BOOKING_STATUS.CONFIRMED) {
        const err = new Error(`Cannot check-in booking with status: ${booking.status}`);
        err.statusCode = 400;
        throw err;
    }

    // Update check-in status (assume model has checkedIn field, if not we add it)
    booking.checkedIn = true;
    booking.checkedInAt = new Date();
    await booking.save();

    res.status(200).json({
        success: true,
        message: 'Attendee checked in successfully',
        data: booking
    });
};

// @desc    Verify a ticket code (QR Scan)
// @route   GET /api/v1/bookings/verify/:code
// @access  Private (Organizer/Admin)
exports.verifyTicket = async (req, res) => {
    const { code } = req.params;

    const booking = await Booking.findOne({ ticketCodes: code })
        .populate('event', 'title date location venue organizer')
        .populate('user', 'name email');

    if (!booking) {
        const err = new Error('Invalid ticket code');
        err.statusCode = 404;
        throw err;
    }

    // Authorization: Only the organizer of the event or an admin can verify the code
    if (booking.event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        const err = new Error('Not authorized to verify tickets for this event');
        err.statusCode = 403;
        throw err;
    }

    res.status(200).json({
        success: true,
        message: 'Ticket verified successfully',
        data: {
            bookingId: booking._id,
            attendeeName: booking.user.name,
            attendeeEmail: booking.user.email,
            eventTitle: booking.event.title,
            status: booking.status,
            checkedIn: booking.checkedIn,
            checkedInAt: booking.checkedInAt
        }
    });
};

// @desc    Stripe Webhook Handler
// @route   POST /api/v1/bookings/webhook
exports.stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        logger.error(`❌ Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const bookingId = session.metadata.bookingId;

        const booking = await Booking.findById(bookingId).populate('user');
        if (booking) {
            booking.status = BOOKING_STATUS.CONFIRMED;
            booking.paymentStatus = 'completed';
            booking.generateTicketCodes();
            await booking.save();

            // Update Event Sold Counts
            const populatedEvent = await Event.findById(booking.event);
            for (const t of booking.tickets) {
                const tier = populatedEvent.ticketTiers.id(t.tierId);
                if (tier) tier.sold += t.quantity;
            }
            populatedEvent.bookingsCount += booking.quantity;
            await populatedEvent.save();

            logger.info(`✅ Payment confirmed for booking: ${booking._id}`);
            
            // Send Confirmation Email
            await sendBookingConfirmation(booking.user.email, booking, populatedEvent);
        }
    }

    res.json({ received: true });
};