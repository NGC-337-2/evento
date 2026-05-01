const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'DELETE_USER', 'UPDATE_USER_ROLE', 'SUSPEND_USER',
      'DELETE_EVENT', 'APPROVE_EVENT', 'REJECT_EVENT',
      'CANCEL_BOOKING', 'SYSTEM_CONFIG_CHANGE'
    ]
  },
  targetType: {
    type: String,
    required: true,
    enum: ['User', 'Event', 'Booking', 'System']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Might be null for system changes
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Indexes for faster filtering
auditLogSchema.index({ admin: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
