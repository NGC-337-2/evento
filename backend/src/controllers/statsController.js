const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { BOOKING_STATUS } = require('../config/constants');
const mongoose = require('mongoose');

// @desc    Get stats for a specific organiser
// @route   GET /api/v1/stats/organiser
// @access  Private/Organiser
const getOrganiserStats = async (req, res) => {
    // 1. Get total revenue for all events of this organiser
    const revenueData = await Booking.aggregate([
        {
            $lookup: {
                from: 'events',
                localField: 'event',
                foreignField: '_id',
                as: 'eventData'
            }
        },
        { $unwind: '$eventData' },
        { $match: { 'eventData.organiser': new mongoose.Types.ObjectId(req.user.id), status: BOOKING_STATUS.CONFIRMED } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalTickets: { $sum: 1 } } }
    ]);

    // 2. Get event performance (tickets sold per event)
    const eventStats = await Event.find({ organiser: req.user.id })
        .select('title totalSold totalCapacity createdAt')
        .sort({ createdAt: -1 });

    // 3. Simple daily revenue chart data
    const chartData = await Booking.aggregate([
        {
            $lookup: {
                from: 'events',
                localField: 'event',
                foreignField: '_id',
                as: 'eventData'
            }
        },
        { $unwind: '$eventData' },
        { 
            $match: { 
                'eventData.organiser': new mongoose.Types.ObjectId(req.user.id), 
                status: BOOKING_STATUS.CONFIRMED,
                createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) } // last 30 days
            } 
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                revenue: { $sum: "$totalAmount" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
        success: true,
        data: {
            summary: revenueData[0] || { totalRevenue: 0, totalTickets: 0 },
            events: eventStats,
            chartData: chartData.map(d => ({ date: d._id, revenue: d.revenue }))
        }
    });
};

// @desc    Get global admin stats
// @route   GET /api/v1/stats/admin
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalBookings = await Booking.countDocuments({ status: BOOKING_STATUS.CONFIRMED });
    
    const revenueData = await Booking.aggregate([
        { $match: { status: BOOKING_STATUS.CONFIRMED } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);

    res.status(200).json({
        success: true,
        data: {
            totalUsers,
            totalEvents,
            totalBookings,
            totalRevenue: revenueData[0]?.totalRevenue || 0
        }
    });
};

module.exports = {
    getOrganiserStats,
    getAdminStats
};
