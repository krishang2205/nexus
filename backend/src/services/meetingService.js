const { supabaseAdmin } = require('../config/clients');

const meetingTranscripts = new Map();
const meetingInsights = new Map();
const meetingChats = new Map();

function normalizeTranscriptRow(row) {
  return {
    id: row.transcript_id,
    meetingId: row.meeting_id,
    speakerId: row.user_id,
    speakerName: row.speaker_name,
    text: row.transcript_text,
    source: row.source,
    isFinal: Boolean(row.is_final),
    timestamp: row.updated_at || row.created_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function upsertInMemoryTranscript(entry) {
  if (!meetingTranscripts.has(entry.meeting_id)) {
    meetingTranscripts.set(entry.meeting_id, []);
  }

  const transcripts = meetingTranscripts.get(entry.meeting_id);
  const existingIndex = transcripts.findIndex(item => item.transcript_id === entry.transcript_id);

  if (existingIndex >= 0) {
    transcripts[existingIndex] = {
      ...transcripts[existingIndex],
      ...entry,
      updated_at: entry.updated_at || new Date().toISOString(),
    };
  } else {
    transcripts.push(entry);
  }

  if (transcripts.length > 2000) {
    transcripts.splice(0, transcripts.length - 2000);
  }
}

async function saveTranscript({
  meetingId,
  transcriptId,
  userId,
  speakerName,
  text,
  source = 'browser-stt',
  createdAt,
  isFinal = false,
}) {
  if (!meetingId || !text) {
    return { saved: false, reason: 'missing-required-fields' };
  }

  const nowIso = new Date().toISOString();
  const entry = {
    transcript_id: transcriptId || `${meetingId}-${userId || 'speaker'}-${Date.now()}`,
    meeting_id: meetingId,
    user_id: userId || null,
    speaker_name: speakerName || 'Unknown',
    transcript_text: text,
    source,
    is_final: Boolean(isFinal),
    created_at: createdAt || nowIso,
    updated_at: nowIso,
  };

  if (supabaseAdmin) {
    const { data: updatedRows, error: updateError } = await supabaseAdmin
      .from('meeting_transcripts')
      .update({
        meeting_id: entry.meeting_id,
        user_id: entry.user_id,
        speaker_name: entry.speaker_name,
        transcript_text: entry.transcript_text,
        source: entry.source,
        is_final: entry.is_final,
        updated_at: entry.updated_at,
      })
      .eq('transcript_id', entry.transcript_id)
      .select('transcript_id');

    if (updateError) {
      console.error('Supabase transcript update failed, falling back to memory:', updateError.message);
      upsertInMemoryTranscript(entry);
      return { saved: true, source: 'memory-fallback', error: updateError.message };
    }

    if (!updatedRows || updatedRows.length === 0) {
      const { error: insertError } = await supabaseAdmin
        .from('meeting_transcripts')
        .insert(entry);

      if (insertError) {
        console.error('Supabase transcript insert failed, falling back to memory:', insertError.message);
        upsertInMemoryTranscript(entry);
        return { saved: true, source: 'memory-fallback', error: insertError.message };
      }
    }

    upsertInMemoryTranscript(entry);
    return { saved: true, source: 'supabase' };
  }

  upsertInMemoryTranscript(entry);
  return { saved: true, source: 'memory' };
}

async function getMeetingTranscripts(meetingId, options = {}) {
  if (!meetingId) {
    return { success: false, error: 'meetingId is required' };
  }

  const since = options.since || null;
  const limit = Number.isFinite(options.limit) ? options.limit : 200;

  if (supabaseAdmin) {
    let query = supabaseAdmin
      .from('meeting_transcripts')
      .select('transcript_id,meeting_id,user_id,speaker_name,transcript_text,source,is_final,created_at,updated_at')
      .eq('meeting_id', meetingId)
      .order('updated_at', { ascending: true })
      .limit(limit);

    if (since) {
      query = query.gt('updated_at', since);
    }

    const { data, error } = await query;
    if (!error) {
      const transcripts = (data || []).map(normalizeTranscriptRow);
      const latestCursor = transcripts.length > 0
        ? transcripts[transcripts.length - 1].updatedAt
        : since;

      return {
        success: true,
        transcripts,
        latestCursor,
        source: 'supabase',
      };
    }

    console.error('Supabase transcript fetch failed, falling back to memory:', error.message);
  }

  const rows = (meetingTranscripts.get(meetingId) || [])
    .filter(row => !since || row.updated_at > since)
    .sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at))
    .slice(-limit);

  const transcripts = rows.map(normalizeTranscriptRow);
  const latestCursor = transcripts.length > 0
    ? transcripts[transcripts.length - 1].updatedAt
    : since;

  return {
    success: true,
    transcripts,
    latestCursor,
    source: 'memory',
  };
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

  if (meetingId) {
    const liveRows = await getMeetingTranscripts(meetingId, { limit: 2000 });
    if (liveRows.success && liveRows.transcripts.length > 0) {
      return liveRows.transcripts
        .map(row => `${row.speakerName || 'Speaker'}: ${row.text}`)
        .join('\n');
    }
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
  getMeetingTranscripts,
  getMeetingTranscriptContext,
  saveInsight,
  saveChat,
  getLatestMeetingInsight,
};
