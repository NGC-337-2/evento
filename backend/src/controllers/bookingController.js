const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const QRCode = require('qrcode');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { BOOKING_STATUS, EVENT_STATUS } = require('../config/constants');
const { sendBookingConfirmation } = require('../services/emailService');

// @desc    Create new booking checkout session
// @route   POST /api/v1/bookings
// @access  Private/Attendee
const createBooking = async (req, res) => {
  const { eventId, tickets } = req.body; // tickets: [{ tierId, quantity }]

  if (!tickets || tickets.length === 0) {
    res.status(400);
    throw new Error('No tickets requested');
  }

  // Find event and check capacity
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  if (event.status !== EVENT_STATUS.PUBLISHED) {
     res.status(400);
     throw new Error('Event is not open for booking');
  }

  let totalAmount = 0;
  const bookingTickets = [];
  const lineItems = [];

  // Validate and calculate totals
  for (const requestedTicket of tickets) {
    const tier = event.ticketTiers.id(requestedTicket.tierId);
    
    if (!tier) {
      res.status(400);
      throw new Error(`Ticket tier invalid: ${requestedTicket.tierId}`);
    }

    if (tier.capacity - tier.sold < requestedTicket.quantity) {
      res.status(400);
      throw new Error(`Not enough tickets available for tier: ${tier.name}`);
    }

    const price = tier.price;
    totalAmount += price * requestedTicket.quantity;

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
                images: [event.image],
              },
              unit_amount: Math.round(price * 100), // Stripe expects cents
            },
            quantity: requestedTicket.quantity,
        });
    }
  }

  // Create initial booking record in database
  const booking = await Booking.create({
    user: req.user.id,
    event: event._id,
    tickets: bookingTickets,
    totalAmount,
    status: totalAmount === 0 ? BOOKING_STATUS.CONFIRMED : BOOKING_STATUS.PENDING
  });

  // Handle Free tickets (skip stripe)
  if (totalAmount === 0) {
      // Update Event Sold Count
      for (const t of bookingTickets) {
         const tier = event.ticketTiers.id(t.tierId);
         tier.sold += t.quantity;
      }
      event.totalSold += bookingTickets.reduce((acc, t) => acc + t.quantity, 0);
      await event.save();

      // Generate QR Code
      const qrData = JSON.stringify({ bookingId: booking._id, user: req.user.id, event: event._id });
      booking.qrCode = await QRCode.toDataURL(qrData);
      await booking.save();

      // Send email
      await sendBookingConfirmation(req.user, booking, event);

      return res.status(201).json({
          success: true,
          message: 'Free booking confirmed',
          booking
      });
  }

  // Handle Paid Tickets with Stripe Checkout
  const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${frontendUrl}/dashboard?payment=success&bookingId=${booking._id}`,
    cancel_url: `${frontendUrl}/event/${event._id}?payment=cancelled`,
    client_reference_id: booking._id.toString(),
    customer_email: req.user.email,
    metadata: {
        bookingId: booking._id.toString()
    }
  });

  // Save payment intent to booking
  booking.paymentIntentId = session.id;
  await booking.save();

  res.status(200).json({
    success: true,
    url: session.url
  });
};

// @desc    Stripe webhook endpoint for async fulfillment
// @route   POST /api/v1/bookings/webhook
// @access  Public (webhook)
const stripeWebhook = async (req, res) => {
    // This needs raw body parsing in server.js before this controller hits.
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body, // Assuming this is raw body buffers
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const bookingId = session.metadata.bookingId;

        const booking = await Booking.findById(bookingId).populate('user').populate('event');
        if (booking) {
            booking.status = BOOKING_STATUS.CONFIRMED;

            // Update ticket counts in event
            const populatedEvent = await Event.findById(booking.event._id);
            for (const t of booking.tickets) {
                const tier = populatedEvent.ticketTiers.id(t.tierId);
                tier.sold += t.quantity;
            }
            populatedEvent.totalSold += booking.tickets.reduce((acc, t) => acc + t.quantity, 0);
            await populatedEvent.save();

            // Generate QR Code
            const qrData = JSON.stringify({ bookingId: booking._id, user: booking.user._id, event: booking.event._id });
            booking.qrCode = await QRCode.toDataURL(qrData);
            await booking.save();

            // Send Confirmation
            await sendBookingConfirmation(booking.user, booking, populatedEvent);
        }
    }

    res.json({ received: true });
};

// @desc    Get bookings for logged in user
// @route   GET /api/v1/bookings/my-bookings
// @access  Private/Attendee
const getMyBookings = async (req, res) => {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('event', 'title date location image')
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
const getBookingById = async (req, res) => {
    const booking = await Booking.findById(req.params.id)
        .populate('event', 'title date location image organiser')
        .populate('user', 'name email');
    
    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    // Security: Only the attendee, the event organizer, or an admin can view a booking
    if (
        booking.user._id.toString() !== req.user.id && 
        booking.event.organiser.toString() !== req.user.id && 
        req.user.role !== 'admin'
    ) {
        res.status(403);
        throw new Error('Not authorized to view this booking');
    }

    res.status(200).json({
        success: true,
        data: booking
    });
};

// @desc    Cancel booking
// @route   PUT /api/v1/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate('event');
    
    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to cancel this booking');
    }

    if (booking.status === BOOKING_STATUS.CANCELLED) {
        res.status(400);
        throw new Error('Booking is already cancelled');
    }

    // Basic refund logic - in production this would trigger Stripe refund
    booking.status = BOOKING_STATUS.CANCELLED;
    
    // Update Event Sold Count
    const event = await Event.findById(booking.event._id);
    for (const t of booking.tickets) {
        const tier = event.ticketTiers.id(t.tierId);
        tier.sold -= t.quantity;
    }
    event.totalSold -= booking.tickets.reduce((acc, t) => acc + t.quantity, 0);
    
    await event.save();
    await booking.save();

    res.status(200).json({
        success: true,
        data: booking
    });
};

module.exports = {
  createBooking,
  stripeWebhook,
  getMyBookings,
  getBookingById,
  cancelBooking
};
