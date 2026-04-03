const express = require('express');
const { getRoot, getStatus } = require('../controllers/systemController');

const router = express.Router();

router.get('/', getRoot);
router.get('/api/status', getStatus);

module.exports = router;
