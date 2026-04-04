const { v4: uuidv4 } = require('uuid');
const {
  saveTranscript,
  getMeetingTranscripts: fetchMeetingTranscripts,
  getLatestMeetingInsight,
} = require('../services/meetingService');

function generateMeetingId(req, res) {
  const meetingId = uuidv4().substring(0, 8);
  return res.json({ meetingId });
}

async function saveTranscriptEntry(req, res) {
  try {
    const {
      meetingId,
      transcriptId,
      userId,
      speakerName,
      text,
      source,
      timestamp,
      isFinal,
    } = req.body || {};

    if (!meetingId || !text) {
      return res.status(400).json({ error: 'meetingId and text are required' });
    }

    const storage = await saveTranscript({
      meetingId,
      transcriptId,
      userId,
      speakerName,
      text,
      source: source || 'browser-stt',
      createdAt: timestamp || new Date().toISOString(),
      isFinal: Boolean(isFinal),
    });

    if (!storage.saved) {
      return res.status(500).json({ success: false, error: storage.reason || 'failed-to-save-transcript' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Transcript save error:', error);
    return res.status(500).json({ error: 'Failed to save transcript', details: error.message });
  }
}

async function getMeetingTranscripts(req, res) {
  try {
    const { meetingId } = req.params;
    const { since, limit } = req.query;

    const parsedLimit = Number(limit);
    const options = {
      since: typeof since === 'string' && since ? since : null,
      limit: Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, 500)
        : 200,
    };

    const result = await fetchMeetingTranscripts(meetingId, options);
    if (!result.success) {
      return res.status(400).json({ error: result.error || 'Failed to fetch transcripts' });
    }

    return res.json({
      success: true,
      transcripts: result.transcripts,
      latestCursor: result.latestCursor,
      source: result.source,
    });
  } catch (error) {
    console.error('Transcript fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch transcripts', details: error.message });
  }
}

async function getLatestIntelligence(req, res) {
  try {
    const meetingId = req.params.meetingId;
    const result = await getLatestMeetingInsight(meetingId);

    if (result.error) {
      const message = result.error === 'No insights found for this meeting' || result.error === 'meetingId is required'
        ? result.error
        : 'Failed to fetch latest insights';
      return res.status(result.status).json({ error: message, details: message === result.error ? undefined : result.error });
    }

    return res.json(result.data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch latest insights', details: error.message });
  }
}

module.exports = {
  generateMeetingId,
  saveTranscriptEntry,
  getMeetingTranscripts,
  getLatestIntelligence,
};
