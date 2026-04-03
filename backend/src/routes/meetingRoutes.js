const express = require('express');
const {
  generateMeetingId,
  saveTranscriptEntry,
  getLatestIntelligence,
} = require('../controllers/meetingController');

const router = express.Router();

router.get('/api/generate-meeting-id', generateMeetingId);
router.post('/api/transcripts', saveTranscriptEntry);
router.get('/api/meetings/:meetingId/intelligence/latest', getLatestIntelligence);

module.exports = router;
