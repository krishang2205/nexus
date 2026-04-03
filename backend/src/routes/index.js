const express = require('express');
const systemRoutes = require('./systemRoutes');
const meetingRoutes = require('./meetingRoutes');
const aiRoutes = require('./aiRoutes');
const streamRoutes = require('./streamRoutes');

const router = express.Router();

router.use(systemRoutes);
router.use(meetingRoutes);
router.use(aiRoutes);
router.use(streamRoutes);

module.exports = router;
