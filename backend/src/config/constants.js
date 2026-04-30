// src/config/constants.js
module.exports = {
  // 👤 User Roles & Permissions
  ROLES: {
    ADMIN: 'admin',
    ORGANIZER: 'organizer',
    ATTENDEE: 'attendee',
  },

  // 🎫 Booking Statuses
  BOOKING_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
  },

  // 📅 Event Statuses
  EVENT_STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ONGOING: 'ongoing',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },

  // 📄 Pagination & Query Limits
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // 🔍 Validation Constraints
  VALIDATION: {
    PASSWORD_REGEX: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
    MAX_TITLE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 2000,
    MAX_TAGS: 5,
    MIN_PASSWORD_LENGTH: 8,
  },

  // ⚙️ Environment & App Config
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  BASE_API_URL: process.env.NODE_ENV === 'production'
    ? process.env.PROD_API_URL
    : `http://localhost:${process.env.PORT || 5000}`,
  
  // 🌐 Email Templates/Subjects (placeholder structure)
  EMAIL_SUBJECTS: {
    WELCOME: 'Welcome to EventO!',
    BOOKING_CONFIRMED: 'Your Booking is Confirmed ✅',
    BOOKING_CANCELLED: 'Booking Cancelled ❌',
    PASSWORD_RESET: 'Reset Your EventO Password 🔑',
    EVENT_UPDATED: 'Event Update: {{eventTitle}} 📢',
  },
};