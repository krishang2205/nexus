const meetingTranscripts = new Map();
const meetingInsights = new Map();
const meetingChats = new Map();

async function saveTranscript({ meetingId, userId, speakerName, text, source = 'browser-stt', createdAt }) {
  if (!meetingId || !text) {
    return { saved: false, reason: 'missing-required-fields' };
  }

  const entry = {
    meeting_id: meetingId,
    user_id: userId || null,
    speaker_name: speakerName || 'Unknown',
    transcript_text: text,
    source,
    created_at: createdAt || new Date().toISOString(),
  };

  if (!meetingTranscripts.has(meetingId)) {
    meetingTranscripts.set(meetingId, []);
  }

  const transcripts = meetingTranscripts.get(meetingId);
  transcripts.push(entry);

  if (transcripts.length > 1000) {
    transcripts.shift();
  }

  return { saved: true };
}

async function getMeetingTranscriptContext(meetingId, fallbackTranscripts = []) {
  if (!meetingId && (!fallbackTranscripts || fallbackTranscripts.length === 0)) {
    return '';
  }

  if (fallbackTranscripts && fallbackTranscripts.length > 0) {
    return fallbackTranscripts
      .filter(item => item && item.text)
      .map(item => `${item.speakerName || 'Speaker'}: ${item.text}`)
      .join('\n');
  }

  if (!meetingId || !meetingTranscripts.has(meetingId)) {
    return '';
  }

  return meetingTranscripts
    .get(meetingId)
    .map(row => `${row.speaker_name || 'Speaker'}: ${row.transcript_text}`)
    .join('\n');
}

async function saveInsight(meetingId, payload) {
  if (!meetingId || !payload) return;

  meetingInsights.set(meetingId, {
    meeting_id: meetingId,
    payload,
    created_at: new Date().toISOString(),
  });
}

async function saveChat(meetingId, question, answer) {
  if (!meetingId) return;

  if (!meetingChats.has(meetingId)) {
    meetingChats.set(meetingId, []);
  }

  meetingChats.get(meetingId).push({
    meeting_id: meetingId,
    question,
    answer,
    created_at: new Date().toISOString(),
  });
}

async function getLatestMeetingInsight(meetingId) {
  if (!meetingId) {
    return { error: 'meetingId is required', status: 400 };
  }

  const insight = meetingInsights.get(meetingId);
  if (!insight) {
    return { error: 'No insights found for this meeting', status: 404 };
  }

  return { data: insight, status: 200 };
}

module.exports = {
  saveTranscript,
  getMeetingTranscriptContext,
  saveInsight,
  saveChat,
  getLatestMeetingInsight,
};
