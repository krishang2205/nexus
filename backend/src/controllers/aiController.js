const {
  transcribeAudioChunk,
  generateInsights,
  answerQuestion,
  generateMeetingBrief,
} = require('../services/aiService');

async function transcribeWhisper(req, res) {
  try {
    const result = await transcribeAudioChunk(req);
    return res.status(result.status).json(result.payload);
  } catch (error) {
    console.error('Whisper transcription error:', error);
    return res.status(500).json({ error: 'Failed to transcribe audio chunk', details: error.message });
  }
}

async function getAiInsights(req, res) {
  try {
    const result = await generateInsights(req.body || {});
    return res.status(result.status).json(result.payload);
  } catch (error) {
    console.error('AI insight error:', error);
    return res.status(500).json({ error: 'Failed to generate AI insights', details: error.message });
  }
}

async function getAiChatAnswer(req, res) {
  try {
    const result = await answerQuestion(req.body || {});
    return res.status(result.status).json(result.payload);
  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(500).json({ error: 'Failed to answer meeting question', details: error.message });
  }
}

async function getMeetingBrief(req, res) {
  try {
    const result = await generateMeetingBrief(req.body || {});
    return res.status(result.status).json(result.payload);
  } catch (error) {
    console.error('AI meeting brief error:', error);
    return res.status(500).json({ error: 'Failed to generate meeting brief', details: error.message });
  }
}

module.exports = {
  transcribeWhisper,
  getAiInsights,
  getAiChatAnswer,
  getMeetingBrief,
};
