const express = require('express');
const { 
  getEvents, 
  getEventById, 
  createEvent, 
  updateEvent, 
  deleteEvent 
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');
const { upload } = require('../utils/cloudinary');

const router = express.Router();

router.route('/')
  .get(getEvents)
  .post(protect, authorize(ROLES.ORGANISER, ROLES.ADMIN), upload.single('image'), createEvent);

router.route('/:id')
  .get(getEventById)
  .put(protect, authorize(ROLES.ORGANISER, ROLES.ADMIN), upload.single('image'), updateEvent)
  .delete(protect, authorize(ROLES.ORGANISER, ROLES.ADMIN), deleteEvent);

module.exports = router;
