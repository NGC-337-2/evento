// src/middleware/validate.js
const logger = require('../config/logger');

/**
 * Express middleware factory for request validation
 * @param {Joi.ObjectSchema} schema - Joi validation schema
 * @param {string} source - Request property to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[source], {
      abortEarly: false,     // Collect all validation errors
      stripUnknown: true,    // Remove unrecognized fields automatically
      convert: true,         // Type coercion (e.g., "123" → 123 for numbers)
    });

    if (error) {
      // Format into a clean, readable string
      const message = error.details.map(detail => detail.message).join(', ');

      // Attach metadata for the global error handler
      const validationError = new Error(message);
      validationError.statusCode = 400;
      validationError.name = 'ValidationError';
      validationError.details = error.details;

      // Log structured warning for debugging
      logger.warn('🚫 Request validation failed', {
        path: req.originalUrl,
        method: req.method,
        source,
        errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message })),
        requestId: req.id,
      });

      return next(validationError);
    }

    next();
  };
};

module.exports = validate;