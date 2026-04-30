/**
 * Application-wide constants for EventO
 */

// User roles
const ROLES = Object.freeze({
  ATTENDEE: 'attendee',
  ORGANISER: 'organiser',
  ADMIN: 'admin',
});

// Event status lifecycle
const EVENT_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  POSTPONED: 'postponed',
});

// Ticket tier types
const TICKET_TIER = Object.freeze({
  FREE: 'free',
  GENERAL: 'general',
  VIP: 'vip',
  EARLY_BIRD: 'early_bird',
});

// Booking status lifecycle
const BOOKING_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  USED: 'used',
});

// Event categories
const EVENT_CATEGORIES = Object.freeze([
  'music',
  'sports',
  'technology',
  'arts',
  'business',
  'food',
  'health',
  'education',
  'comedy',
  'film',
  'fashion',
  'charity',
  'networking',
  'other',
]);

// Pagination defaults
const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
});

// JWT
const JWT = Object.freeze({
  ACCESS_EXPIRES: process.env.JWT_EXPIRES_IN || '15m',
  REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// Sorting options for event list
const SORT_OPTIONS = Object.freeze([
  'upcoming',
  'newest',
  'oldest',
  'price-low',
  'price-high',
  'popular',
]);

const MAX_RESULTS_PER_PAGE = 50;

module.exports = {
  ROLES,
  EVENT_STATUS,
  TICKET_TIER,
  BOOKING_STATUS,
  EVENT_CATEGORIES,
  PAGINATION,
  SORT_OPTIONS,
  MAX_RESULTS_PER_PAGE,
  JWT,
};
