const Event = require('../models/Event');
const Booking = require('../models/Booking');
const logger = require('../config/logger');

// Helper to convert objects to CSV string
const convertToCSV = (data, fields) => {
    const header = fields.join(',');
    const rows = data.map(item => {
        return fields.map(field => {
            let value = item[field] || '';
            // Handle nested fields or formatting
            if (field === 'date' && value) value = new Date(value).toISOString();
            if (typeof value === 'string') value = `"${value.replace(/"/g, '""')}"`;
            return value;
        }).join(',');
    });
    return [header, ...rows].join('\n');
};

// @desc    Export bookings for an event (Organizer/Admin)
// @route   GET /api/v1/export/bookings/:eventId
exports.exportBookings = async (req, res) => {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
        const err = new Error('Event not found');
        err.statusCode = 404;
        throw err;
    }

    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
        const err = new Error('Not authorized to export data for this event');
        err.statusCode = 403;
        throw err;
    }

    const bookings = await Booking.find({ event: event._id }).populate('user', 'name email');
    
    const fields = ['_id', 'userName', 'userEmail', 'quantity', 'totalPrice', 'status', 'createdAt'];
    const csvData = bookings.map(b => ({
        _id: b._id,
        userName: b.user?.name,
        userEmail: b.user?.email,
        quantity: b.quantity,
        totalPrice: b.totalPrice,
        status: b.status,
        createdAt: b.createdAt
    }));

    const csv = convertToCSV(csvData, fields);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=bookings-${event.title.replace(/ /g, '_')}.csv`);
    res.status(200).send(csv);
};

// @desc    Export all events for an organizer
// @route   GET /api/v1/export/events
exports.exportEvents = async (req, res) => {
    const events = await Event.find({ organizer: req.user._id });
    
    const fields = ['_id', 'title', 'category', 'status', 'capacity', 'bookingsCount', 'date', 'createdAt'];
    const csv = convertToCSV(events, fields);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=my-events.csv');
    res.status(200).send(csv);
};
