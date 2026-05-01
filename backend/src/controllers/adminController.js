const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const logger = require('../config/logger');

// @desc    Get all audit logs
// @route   GET /api/v1/admin/audit-logs
// @access  Private/Admin
exports.getAuditLogs = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find()
        .populate('admin', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await AuditLog.countDocuments();

    res.status(200).json({
        success: true,
        count: logs.length,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        data: logs
    });
};

// @desc    Get advanced platform metrics
// @route   GET /api/v1/admin/metrics
// @access  Private/Admin
exports.getPlatformMetrics = async (req, res) => {
    // 1. Revenue trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueTrend = await Booking.aggregate([
        { $match: { paymentStatus: 'completed', createdAt: { $gte: sixMonthsAgo } } },
        {
            $group: {
                _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                revenue: { $sum: "$totalPrice" }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // 2. User growth (by role)
    const userGrowth = await User.aggregate([
        {
            $group: {
                _id: "$role",
                count: { $sum: 1 }
            }
        }
    ]);

    // 3. Event categories popularity
    const categoryPopularity = await Event.aggregate([
        {
            $group: {
                _id: "$category",
                count: { $sum: 1 },
                totalBookings: { $sum: "$bookingsCount" }
            }
        },
        { $sort: { totalBookings: -1 } }
    ]);

    res.status(200).json({
        success: true,
        data: {
            revenueTrend: revenueTrend.map(r => ({
                label: `${r._id.month}/${r._id.year}`,
                revenue: r.revenue
            })),
            userGrowth,
            categoryPopularity
        }
    });
};
