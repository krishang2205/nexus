const express = require('express');
const { upload } = require('../config/clients');
const {
	transcribeWhisper,
	getAiInsights,
	getAiChatAnswer,
	getMeetingBrief,
} = require('../controllers/aiController');

const router = express.Router();

router.post('/api/transcribe-whisper', upload.single('audio'), transcribeWhisper);
router.post('/api/ai-insights', getAiInsights);
router.post('/api/ai-chat', getAiChatAnswer);
router.post('/api/ai-brief', getMeetingBrief);

module.exports = router;
