const express = require('express');
const { getOrganiserStats, getAdminStats } = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect);

router.get('/organiser', authorize(ROLES.ORGANISER, ROLES.ADMIN), getOrganiserStats);
router.get('/admin', authorize(ROLES.ADMIN), getAdminStats);

module.exports = router;
