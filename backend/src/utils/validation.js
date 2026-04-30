// src/utils/validation.js
const { z } = require('zod');

/**
 * Sanitize search keyword to prevent regex injection and clean whitespace
 */
const sanitizeSearchInput = (keyword) => {
  if (!keyword || typeof keyword !== 'string') return '';
  // Escape special regex characters
  return keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Parse FormData fields that may be stringified JSON
 * @param {Object} body - Request body
 * @param {Array} fields - Fields to parse
 */
const parseFormDataFields = (body, fields = []) => {
  const result = { ...body };
  fields.forEach(field => {
    if (body[field] && typeof body[field] === 'string') {
      try {
        result[field] = JSON.parse(body[field]);
      } catch (e) {
        // Fallback or leave as string if not valid JSON
      }
    }
  });
  return result;
};

/**
 * Validate event input using Zod
 */
const validateEventInput = async (data, options = { partial: false }) => {
  const eventSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(2000),
    category: z.string(),
    location: z.object({
      address: z.string(),
      city: z.string().optional(),
      country: z.string().optional(),
    }),
    date: z.object({
      start: z.string().or(z.date()),
      end: z.string().or(z.date()),
    }),
    ticketTiers: z.array(z.object({
      name: z.string(),
      price: z.number().min(0),
      capacity: z.number().min(1),
    })).min(1),
  });

  try {
    const schema = options.partial ? eventSchema.partial() : eventSchema;
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    return { 
      success: false, 
      errors: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }))
    };
  }
};

module.exports = {
  sanitizeSearchInput,
  parseFormDataFields,
  validateEventInput
};
