// src/controllers/statsController.js
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { BOOKING_STATUS } = require('../config/constants');
const logger = require('../config/logger');

// @desc    Get global dashboard statistics (Admin only)
// @route   GET /api/v1/stats/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        // Run independent queries concurrently
        const [totalUsers, totalEvents, totalBookings, revenueAgg] = await Promise.all([
            User.countDocuments({}),
            Event.countDocuments({}),
            Booking.countDocuments({}),
            Booking.aggregate([
                { $match: { paymentStatus: 'completed' } },
                { $group: { _id: null, total: { $sum: '$totalPrice' }, currency: { $first: '$currency' } } }
            ])
        ]);

        // Activity from last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const [recentBookings, recentEvents] = await Promise.all([
            Booking.countDocuments({ createdAt: { $gte: weekAgo } }),
            Event.countDocuments({ createdAt: { $gte: weekAgo } })
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalEvents,
                totalBookings,
                totalRevenue: revenueAgg[0]?.total || 0,
                currency: revenueAgg[0]?.currency || 'USD',
                recentActivity: {
                    bookingsLast7Days: recentBookings,
                    eventsCreatedLast7Days: recentEvents
                }
            }
        });
    } catch (error) {
        logger.error('❌ Failed to fetch dashboard stats', error);
        throw error; // express-async-errors handles this
    }
};

// @desc    Get detailed analytics for a specific event
// @route   GET /api/v1/stats/events/:id
// @access  Private (Organizer/Admin)
exports.getEventStats = async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) {
        const err = new Error('Event not found');
        err.statusCode = 404;
        throw err;
    }

    // Authorization: Only owner or admin can view stats
    const isOwner = event.organizer.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
        const err = new Error('Not authorized to view analytics for this event');
        err.statusCode = 403;
        throw err;
    }

    // Fetch only non-cancelled bookings for this event
    const bookings = await Booking.find({
        event: event._id,
        status: { $ne: BOOKING_STATUS.CANCELLED }
    }).select('quantity totalPrice status createdAt').sort({ createdAt: -1 });

    const ticketsSold = bookings.reduce((sum, b) => sum + b.quantity, 0);
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const capacityUsed = event.bookingsCount || ticketsSold;
    const conversionRate = event.capacity > 0 ? ((capacityUsed / event.capacity) * 100).toFixed(1) : 0;

    res.status(200).json({
        success: true,
        data: {
            event: { id: event._id, title: event.title, date: event.date, capacity: event.capacity },
            ticketsSold,
            availableSlots: Math.max(0, event.capacity - capacityUsed),
            conversionRate: `${conversionRate}%`,
            totalRevenue,
            currency: event.currency,
            recentBookings: bookings.slice(0, 5).map(b => ({
                id: b._id,
                quantity: b.quantity,
                totalPrice: b.totalPrice,
                status: b.status,
                bookedAt: b.createdAt
            }))
        }
    });
};

// @desc    Get dashboard statistics for the logged-in organizer
// @route   GET /api/v1/stats/organiser
// @access  Private/Organizer
exports.getOrganizerStats = async (req, res) => {
    try {
        const events = await Event.find({ organizer: req.user._id }).lean();
        const eventIds = events.map(e => e._id);

        const bookings = await Booking.find({
            event: { $in: eventIds },
            status: { $ne: 'cancelled' }
        }).lean();

        // Summary counts
        const totalTickets = bookings.reduce((sum, b) => sum + (b.quantity || 0), 0);
        const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

        // Chart data (last 30 days)
        const chartData = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            
            const dayRevenue = bookings
                .filter(b => b.createdAt.toISOString().split('T')[0] === dateStr)
                .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

            chartData.push({ date: dateStr, revenue: dayRevenue });
        }

        // Event performance
        const eventPerformance = events.map(e => {
            const eventBookings = bookings.filter(b => b.event.toString() === e._id.toString());
            return {
                _id: e._id,
                title: e.title,
                totalSold: eventBookings.reduce((sum, b) => sum + (b.quantity || 0), 0),
                totalCapacity: e.capacity,
                revenue: eventBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
            };
        });

        res.status(200).json({
            success: true,
            data: {
                summary: { totalTickets, totalRevenue, totalEvents: events.length },
                chartData,
                events: eventPerformance
            }
        });
    } catch (error) {
        logger.error('❌ Failed to fetch organizer stats', error);
        throw error;
    }
};