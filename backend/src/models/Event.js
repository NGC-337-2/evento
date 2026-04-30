const mongoose = require('mongoose');
const { EVENT_STATUS, EVENT_CATEGORIES, TICKET_TIER } = require('../config/constants');

const ticketTierSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: Object.values(TICKET_TIER),
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
  },
  sold: {
    type: Number,
    default: 0,
  },
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an event title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: EVENT_CATEGORIES,
    },
    location: {
      address: {
        type: String,
        required: [true, 'Please add an address'],
      },
      city: String,
      country: String,
      coordinates: {
        type: [Number], // longitude, latitude
        index: '2dsphere',
      },
    },
    date: {
      start: {
        type: Date,
        required: [true, 'Please add a start date'],
      },
      end: {
        type: Date,
        required: [true, 'Please add an end date'],
      },
    },
    organiser: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    ticketTiers: [ticketTierSchema],
    totalCapacity: {
      type: Number,
      required: true,
    },
    totalSold: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(EVENT_STATUS),
      default: EVENT_STATUS.DRAFT,
    },
    image: {
      type: String,
      default: 'no-photo.jpg',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

eventSchema.index({ status: 1 });
eventSchema.index({ 'date.start': 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
