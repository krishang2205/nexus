const express = require('express');
const {
  generateMeetingId,
  saveTranscriptEntry,
  getMeetingTranscripts,
  getLatestIntelligence,
} = require('../controllers/meetingController');

const router = express.Router();

router.get('/api/generate-meeting-id', generateMeetingId);
router.post('/api/transcripts', saveTranscriptEntry);
router.get('/api/meetings/:meetingId/transcripts', getMeetingTranscripts);
router.get('/api/meetings/:meetingId/intelligence/latest', getLatestIntelligence);

module.exports = router;
