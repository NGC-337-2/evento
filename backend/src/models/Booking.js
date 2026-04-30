const mongoose = require('mongoose');
const { BOOKING_STATUS } = require('../config/constants');

const bookingTicketSchema = new mongoose.Schema({
  tierId: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  tierName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  pricePerTicket: {
    type: Number,
    required: true,
  },
});

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.ObjectId,
      ref: 'Event',
      required: true,
    },
    tickets: [bookingTicketSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    paymentIntentId: {
      type: String,
    },
    qrCode: {
      type: String, // String representation of QR code or URL to image
    },
    checkInStatus: {
      type: Boolean,
      default: false,
    },
    checkInTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly find a user's bookings for an event
bookingSchema.index({ user: 1, event: 1 });
bookingSchema.index({ status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
