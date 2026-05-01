// src/models/Booking.js
const mongoose = require('mongoose');
const { BOOKING_STATUS } = require('../config/constants');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event reference is required']
  },
  status: {
    type: String,
    enum: Object.values(BOOKING_STATUS),
    default: BOOKING_STATUS.PENDING
  },
  quantity: {
    type: Number,
    required: [true, 'Ticket quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  tickets: [{
    tierId: { type: mongoose.Schema.Types.ObjectId },
    tierName: String,
    quantity: { type: Number, required: true },
    pricePerTicket: { type: Number, required: true }
  }],

  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentIntentId: {
    type: String, // Stripe Payment Intent ID
    default: null
  },
  ticketCodes: [String],
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  checkedIn: {
    type: Boolean,
    default: false
  },
  checkedInAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🔍 Indexes for query performance
bookingSchema.index({ user: 1, event: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ ticketCodes: 1 }, { unique: true, sparse: true });

// 🎟️ Virtual: Format booking date
bookingSchema.virtual('createdAtFormatted').get(function () {
  return this.createdAt.toLocaleString();
});

// 🎫 Method: Generate unique ticket codes
bookingSchema.methods.generateTicketCodes = function () {
  const codes = [];
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const shortId = this._id.toString().slice(-6).toUpperCase();

  for (let i = 0; i < this.quantity; i++) {
    const randomPart = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
    codes.push(`EVT-${dateStr}-${randomPart}-${shortId}-${i + 1}`);
  }

  this.ticketCodes = codes;
  return codes;
};

// 🛡️ Pre-save hook to ensure ticket codes exist
bookingSchema.pre('save', function (next) {
  if (this.isNew && (!this.ticketCodes || this.ticketCodes.length === 0)) {
    this.generateTicketCodes();
  }
  next();
});

// ✅ Method: Check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function () {
  return [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED].includes(this.status) &&
    this.paymentStatus === 'completed';
};

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;