const AuditLog = require('../models/AuditLog');
const logger = require('../config/logger');

/**
 * Log an administrative action to the AuditLog collection
 * @param {Object} req - Express request object
 * @param {String} action - Action identifier (from AuditLog enum)
 * @param {String} targetType - Type of target ('User', 'Event', etc.)
 * @param {String} targetId - ID of the target object
 * @param {Object} details - Additional details about the action
 */
const logAudit = async (req, action, targetType, targetId, details = {}) => {
  try {
    await AuditLog.create({
      admin: req.user._id,
      action,
      targetType,
      targetId,
      details,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    logger.info(`📋 Audit Log: ${action} by ${req.user.email} on ${targetType} ${targetId}`);
  } catch (error) {
    logger.error('❌ Failed to create audit log', error);
  }
};

module.exports = { logAudit };
