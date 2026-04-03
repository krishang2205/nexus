const { toFile } = require('openai/uploads');
const { openai, gemini } = require('../config/clients');
const { OPENAI_CHAT_MODEL, OPENAI_TRANSCRIBE_MODEL, GEMINI_MODEL } = require('../config/env');
const { parseJsonFromText } = require('../utils/json');
const {
  saveTranscript,
  getMeetingTranscriptContext,
  saveInsight,
  saveChat,
} = require('./meetingService');

const hasAnyAiProvider = () => Boolean(openai || gemini);

async function generateTextWithGemini(systemPrompt, userPrompt) {
  if (!gemini) return null;

  const model = gemini.getGenerativeModel({ model: GEMINI_MODEL });
  const response = await model.generateContent([
    { text: systemPrompt },
    { text: userPrompt },
  ]);

  return response?.response?.text?.() || '';
}

async function generateTextWithOpenAi(systemPrompt, userPrompt, temperature = 0.2) {
  if (!openai) return null;

  const completion = await openai.chat.completions.create({
    model: OPENAI_CHAT_MODEL,
    temperature,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  return completion.choices?.[0]?.message?.content || '';
}

async function generateJsonWithProvider(systemPrompt, userPrompt, temperature = 0.2) {
  if (openai) {
    const raw = await generateTextWithOpenAi(systemPrompt, userPrompt, temperature);
    return { raw, parsed: parseJsonFromText(raw), provider: 'openai' };
  }

  if (gemini) {
    const raw = await generateTextWithGemini(systemPrompt, userPrompt);
    return { raw, parsed: parseJsonFromText(raw), provider: 'gemini' };
  }

  return { raw: '', parsed: null, provider: null };
}

async function generateAnswerWithProvider(systemPrompt, userPrompt) {
  if (openai) {
    const text = await generateTextWithOpenAi(systemPrompt, userPrompt, 0.2);
    return { text: (text || '').trim(), provider: 'openai' };
  }

  if (gemini) {
    const text = await generateTextWithGemini(systemPrompt, userPrompt);
    return { text: (text || '').trim(), provider: 'gemini' };
  }

  return { text: '', provider: null };
}

async function transcribeAudioChunk(req) {
  if (!openai) {
    return { status: 500, payload: { error: 'OPENAI_API_KEY is not configured' } };
  }

  if (!req.file || !req.file.buffer) {
    return { status: 400, payload: { error: 'Missing audio file' } };
  }

  const startedAt = Date.now();
  const meetingId = req.body.meetingId || null;
  const userId = req.body.userId || null;
  const speakerName = req.body.speakerName || 'Unknown';

  const audioFile = await toFile(req.file.buffer, req.file.originalname || 'meeting-audio.webm');
  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: OPENAI_TRANSCRIBE_MODEL,
    language: req.body.language || undefined,
  });

  const text = (transcription && transcription.text ? transcription.text : '').trim();
  let storage = { saved: false, reason: 'no-transcript-text' };

  if (text) {
    storage = await saveTranscript({
      meetingId,
      userId,
      speakerName,
      text,
      source: 'whisper-api',
      createdAt: req.body.timestamp || new Date().toISOString(),
    });
  }

  return {
    status: 200,
    payload: {
      text,
      model: OPENAI_TRANSCRIBE_MODEL,
      latencyMs: Date.now() - startedAt,
      storage,
    },
  };
}

async function generateInsights({ meetingId, transcripts = [] }) {
  if (!hasAnyAiProvider()) {
    return { status: 500, payload: { error: 'No AI provider configured (OPENAI_API_KEY or GEMINI_API_KEY)' } };
  }

  const transcriptContext = await getMeetingTranscriptContext(meetingId, transcripts);

  if (!transcriptContext || transcriptContext.length < 20) {
    return {
      status: 200,
      payload: {
        summaryBullets: [],
        actionItems: [],
        decisions: [],
        risks: [],
        questions: [],
        score: null,
        status: 'insufficient-context',
      },
    };
  }

  const systemPrompt = 'You are an enterprise meeting intelligence engine. Return strict JSON only with keys: summaryBullets(string[]), actionItems(array of {task,assignee,deadline,status}), decisions(string[]), risks(string[]), questions(string[]), score(number 0-100).';
  const userPrompt = `Analyze this meeting transcript and extract decision-grade insights:\n\n${transcriptContext}`;
  const { raw, parsed, provider } = await generateJsonWithProvider(systemPrompt, userPrompt, 0.2);

  if (!parsed) {
    return { status: 502, payload: { error: 'LLM returned non-JSON response', raw } };
  }

  await saveInsight(meetingId, parsed);
  return { status: 200, payload: { ...parsed, status: 'ok', provider } };
}

async function answerQuestion({ meetingId, question, transcripts = [] }) {
  if (!hasAnyAiProvider()) {
    return { status: 500, payload: { error: 'No AI provider configured (OPENAI_API_KEY or GEMINI_API_KEY)' } };
  }

  if (!question) {
    return { status: 400, payload: { error: 'question is required' } };
  }

  const transcriptContext = await getMeetingTranscriptContext(meetingId, transcripts);

  const systemPrompt = 'Answer only from transcript evidence. If data is missing, say what is missing and ask for clearer details.';
  const userPrompt = `Transcript:\n${transcriptContext || 'No transcript available'}\n\nQuestion: ${question}`;
  const { text, provider } = await generateAnswerWithProvider(systemPrompt, userPrompt);
  const answer = text || 'No answer generated.';

  await saveChat(meetingId, question, answer);
  return {
    status: 200,
    payload: {
      answer,
      model: provider === 'openai' ? OPENAI_CHAT_MODEL : GEMINI_MODEL,
      provider,
    },
  };
}

async function generateMeetingBrief({ title, goal, context }) {
  if (!hasAnyAiProvider()) {
    return {
      status: 200,
      payload: {
        agenda: [
          `Align on objective: ${goal || title || 'Meeting objective'}`,
          'Review current status and blockers',
          'Assign owners and deadlines',
        ],
        keyQuestions: [
          'What decision must be finalized today?',
          'Who owns the next step?',
          'What is the deadline and success metric?',
        ],
        successCriteria: [
          'At least one clear decision',
          'Every action item has owner + date',
          'Top risk documented with mitigation',
        ],
        riskChecks: ['Scope creep', 'Unclear ownership', 'No hard deadline'],
        openingScript: `Today we will align on ${goal || title || 'the meeting objective'} and leave with clear owners and deadlines.`,
        source: 'fallback-template',
      },
    };
  }

  const systemPrompt = 'You are a meeting strategist. Return strict JSON only with keys: agenda(string[]), keyQuestions(string[]), successCriteria(string[]), riskChecks(string[]), openingScript(string). Keep each bullet concise and practical.';
  const userPrompt = `Create a pre-meeting brief. Title: ${title || 'Untitled meeting'}. Goal: ${goal || 'No explicit goal provided'}. Extra context: ${context || 'none'}.`;
  const { raw, parsed, provider } = await generateJsonWithProvider(systemPrompt, userPrompt, 0.3);

  if (!parsed) {
    return { status: 502, payload: { error: 'LLM returned non-JSON response', raw } };
  }

  return {
    status: 200,
    payload: {
      agenda: Array.isArray(parsed.agenda) ? parsed.agenda : [],
      keyQuestions: Array.isArray(parsed.keyQuestions) ? parsed.keyQuestions : [],
      successCriteria: Array.isArray(parsed.successCriteria) ? parsed.successCriteria : [],
      riskChecks: Array.isArray(parsed.riskChecks) ? parsed.riskChecks : [],
      openingScript: typeof parsed.openingScript === 'string' ? parsed.openingScript : '',
      source: provider,
    },
  };
}

module.exports = {
  transcribeAudioChunk,
  generateInsights,
  answerQuestion,
  generateMeetingBrief,
};
