const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Stricter rate limit for admin endpoints
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

router.use(protect);
router.use(authorize('admin'));
router.use(adminLimiter);

router.get('/audit-logs', adminController.getAuditLogs);
router.get('/metrics', adminController.getPlatformMetrics);

module.exports = router;
