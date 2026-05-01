// src/models/Event.js
const mongoose = require('mongoose');
const { EVENT_STATUS } = require('../config/constants');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(v) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Allow any time today
        return v >= today;
      },
      message: 'Event date must be today or in the future'
    }
  },
  location: {
    venue: { type: String, required: [true, 'Venue is required'] },
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer reference is required']
  },
  ticketTiers: [{
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    sold: { type: Number, default: 0 }
  }],
  capacity: {
    type: Number,
    required: [true, 'Total capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  bookingsCount: {
    type: Number,
    default: 0,
    min: [0, 'Bookings cannot be negative']
  },

  status: {
    type: String,
    enum: Object.values(EVENT_STATUS),
    default: EVENT_STATUS.DRAFT
  },
  image: {
    type: String, // URL from Cloudinary
    default: null
  },
  tags: [{ type: String, trim: true }],
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 📍 Indexes for performance
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ title: 'text', description: 'text' }); // Full-text search

// 🎫 Virtual: Calculate available slots
eventSchema.virtual('availableSlots').get(function() {
  return Math.max(0, this.capacity - this.bookingsCount);
});

// 🔒 Method: Check if event is sold out
eventSchema.methods.isFull = function() {
  return this.bookingsCount >= this.capacity;
};

// 📅 Method: Check if event is active/published
eventSchema.methods.isActive = function() {
  return [EVENT_STATUS.PUBLISHED, EVENT_STATUS.ONGOING].includes(this.status);
};

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;