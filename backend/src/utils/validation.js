// src/utils/validation.js
const Joi = require('joi');
const { ROLES, VALIDATION } = require('../config/constants');

// 🔐 Authentication Schemas
const registerSchema = Joi.object({
  name: Joi.string().trim().max(100).required().messages({
    'any.required': 'Name is required',
    'string.max': 'Name cannot exceed 100 characters'
  }),
  email: Joi.string().email().lowercase().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Please provide a valid email address'
  }),
  password: Joi.string().pattern(VALIDATION.PASSWORD_REGEX).required().messages({
    'any.required': 'Password is required',
    'string.pattern.base': 'Password must contain at least one letter and one number'
  }),
  role: Joi.string().valid(...Object.values(ROLES)).default(ROLES.ATTENDEE)
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required()
});

const emailSchema = Joi.object({
  email: Joi.string().email().lowercase().required()
});

const passwordResetSchema = Joi.object({
  password: Joi.string().pattern(VALIDATION.PASSWORD_REGEX).required().messages({
    'string.pattern.base': 'Password must contain at least one letter and one number'
  })
});

// 📅 Event Management Schemas
const eventSchema = Joi.object({
  title: Joi.string().trim().max(VALIDATION.MAX_TITLE_LENGTH).required(),
  description: Joi.string().trim().max(VALIDATION.MAX_DESCRIPTION_LENGTH).optional(),
  date: Joi.date().greater('now').required().messages({
    'date.greater': 'Event date must be in the future'
  }),
  location: Joi.object({
    venue: Joi.string().required(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    country: Joi.string().optional()
  }).required(),
  category: Joi.string().valid('conference', 'workshop', 'concert', 'seminar', 'social', 'sports', 'other').required(),
  ticketTiers: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    price: Joi.number().min(0).required(),
    capacity: Joi.number().integer().min(1).required()
  })).min(1).required(),
  capacity: Joi.number().integer().min(1).required(),

  tags: Joi.array().items(Joi.string().trim()).max(VALIDATION.MAX_TAGS).default([])
});

// 🎫 Booking Schemas
const bookingSchema = Joi.object({
  eventId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid Event ID format',
    'string.length': 'Invalid Event ID format'
  }),
  tickets: Joi.array().items(Joi.object({
    tierId: Joi.string().hex().length(24).required(),
    quantity: Joi.number().integer().min(1).required()
  })).min(1).required(),
  notes: Joi.string().trim().max(500).optional()

});

module.exports = {
  registerSchema,
  loginSchema,
  emailSchema,
  passwordResetSchema,
  eventSchema,
  bookingSchema,
};