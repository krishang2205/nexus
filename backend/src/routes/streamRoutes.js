const express = require('express');
const { getStreamToken } = require('../controllers/streamController');

const router = express.Router();

router.get('/api/stream-token', getStreamToken);

module.exports = router;
