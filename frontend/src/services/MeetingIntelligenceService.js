const ACTION_VERB_PATTERN = /\b(will|needs to|need to|should|must|can you|please|owner|follow up|send|prepare|share|create|finish|deliver|review|update|complete|have to|has to|get done|submit|do|make|build|fix|check|verify|confirm)\b/i;
const DECISION_PATTERN = /\b(decided|decision|agreed|approved|finalize|finalised|confirmed|we will go with|locked|let's|let us|we'll go|we're going|decided to|we plan to)\b/i;
const QUESTION_PATTERN = /\?|\b(what|why|how|when|where|who|which)\b/i;
const RISK_PATTERN = /\b(risk|issue|blocker|delay|problem|concern|bottleneck|dependency|stuck|blocked|difficult|challenge|hard)\b/i;
const IMPORTANT_PATTERN = /\b(important|critical|priority|urgent|key|milestone|deadline|launch|impact|essential|must have|must do|crucial)\b/i;
const DEADLINE_PATTERN = /\b(by\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|next\s+week|next\s+month|end\s+(?:of\s+)?week|end\s+(?:of\s+)?month|eow|eom|this\s+(?:week|month)|today|tomorrow|\d{1,2}[/-]\d{1,2}([/-]\d{2,4})?))\b/i;

const QUICK_PROMPTS = [
  'What decisions were made?',
  'Who is responsible for tasks?',
  'Summarize in 3 bullet points',
  'What risks were discussed?'
];

const MIN_SIGNAL_LINES = 5;
const SMALL_TALK_PATTERN = /^(hi|hello|hey|how are you|good morning|good afternoon|good evening|can you hear me|am i audible|test|testing|ok|okay|alright|yep|yeah|yes|no|nope|what|huh|pardon)$/i;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const splitSentences = (text) =>
  text
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

const toKeyTerms = (query) =>
  query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2);

const isSmallTalkLine = (text) => {
  if (!text) return true;
  const cleaned = text.toLowerCase().replace(/[.!?]/g, '').trim();
  return SMALL_TALK_PATTERN.test(cleaned);
};

export function classifyTranscriptLine(text) {
  if (!text) return 'neutral';

  if (DECISION_PATTERN.test(text)) return 'decision';
  if (RISK_PATTERN.test(text)) return 'risk';
  if (QUESTION_PATTERN.test(text)) return 'question';
  if (ACTION_VERB_PATTERN.test(text)) return 'action';
  if (IMPORTANT_PATTERN.test(text)) return 'important';

  return 'neutral';
}

function extractActionFromSentence(sentence, fallbackOwner) {
  if (!ACTION_VERB_PATTERN.test(sentence)) return null;

  // Try multiple patterns to extract assignee
  let assigneeMatch = sentence.match(/^([A-Z][a-zA-Z0-9_-]{1,20})\s+(will|needs to|should|must)\b/i);
  
  if (!assigneeMatch) {
    assigneeMatch = sentence.match(/(?:need|needs|want|wanted|please|have)\s+([A-Z][a-zA-Z0-9_-]{1,20})\s+to\b/i);
  }
  
  if (!assigneeMatch) {
    assigneeMatch = sentence.match(/([A-Z][a-zA-Z0-9_-]{1,20})\s+(will|needs to|needs|should|must|to)\s+/i);
  }

  const deadlineMatch = sentence.match(DEADLINE_PATTERN);
  const cleanedSentence = sentence.replace(/\s+/g, ' ').trim();

  return {
    task: cleanedSentence,
    assignee: assigneeMatch?.[1] || fallbackOwner || 'Unassigned',
    deadline: deadlineMatch?.[0] || 'No deadline detected',
    status: 'Open'
  };
}

function buildSummaryBullets(finalTranscripts) {
  const candidateLines = finalTranscripts
    .map((item) => item.text.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .slice(0, 12);

  const strong = candidateLines.filter(
    (line) => IMPORTANT_PATTERN.test(line) || DECISION_PATTERN.test(line) || ACTION_VERB_PATTERN.test(line)
  );

  const source = strong.length > 0 ? strong : candidateLines;

  return source.slice(0, 3).map((line) => line.replace(/\s+/g, ' '));
}

function buildSpeakerStats(finalTranscripts) {
  const bySpeaker = {};

  finalTranscripts.forEach((item) => {
    const speaker = item.speakerName || 'Unknown';
    const wordCount = item.text.trim().split(/\s+/).filter(Boolean).length;

    if (!bySpeaker[speaker]) {
      bySpeaker[speaker] = { speaker, words: 0, messages: 0 };
    }

    bySpeaker[speaker].words += wordCount;
    bySpeaker[speaker].messages += 1;
  });

  const list = Object.values(bySpeaker).sort((a, b) => b.words - a.words);
  const totalWords = list.reduce((sum, item) => sum + item.words, 0);

  return {
    speakers: list.map((item) => ({
      ...item,
      ratio: totalWords > 0 ? Math.round((item.words / totalWords) * 100) : 0
    })),
    totalWords
  };
}

export function buildMeetingIntelligence(transcripts = []) {
  const finalTranscripts = transcripts.filter((item) => item?.isFinal && item.text?.trim());
  const meaningfulTranscripts = finalTranscripts.filter(
    (item) => !isSmallTalkLine(item.text) && item.text.trim().length >= 8
  );

  const actionItems = [];
  const decisions = [];
  const risks = [];
  const questions = [];
  const highlights = [];

  meaningfulTranscripts.forEach((item) => {
    const lineType = classifyTranscriptLine(item.text);
    const sentences = splitSentences(item.text);
    
    // Also try to split by common connecting words for better granularity
    const expandedSentences = [];
    sentences.forEach(s => {
      const parts = s.split(/\s+(and|plus|also|additionally|furthermore)\s+/i);
      expandedSentences.push(...parts.filter(p => p.trim().length > 0));
    });

    if (lineType === 'decision') {
      decisions.push({
        speaker: item.speakerName,
        text: item.text,
        time: item.startTime
      });
    }

    if (lineType === 'risk') {
      risks.push({
        speaker: item.speakerName,
        text: item.text,
        time: item.startTime
      });
    }

    if (lineType === 'question') {
      questions.push({
        speaker: item.speakerName,
        text: item.text,
        time: item.startTime
      });
    }

    if (lineType !== 'neutral') {
      highlights.push({
        type: lineType,
        speaker: item.speakerName,
        text: item.text,
        time: item.startTime
      });
    }

    expandedSentences.forEach((sentence) => {
      const trimmed = sentence.trim();
      if (trimmed.length > 0) {
        const action = extractActionFromSentence(trimmed, item.speakerName);
        if (action) {
          actionItems.push({
            ...action,
            sourceSpeaker: item.speakerName,
            time: item.startTime
          });
        }
      }
    });
  });

  const uniqueActionItems = actionItems.filter(
    (item, index, list) =>
      list.findIndex((other) => other.task.toLowerCase() === item.task.toLowerCase()) === index
  );

  const speakerStats = buildSpeakerStats(meaningfulTranscripts);
  const topSpeakerRatio = speakerStats.speakers[0]?.ratio || 0;
  const participationBalance = clamp(100 - Math.max(0, topSpeakerRatio - 45) * 2, 40, 100);

  const hasEnoughSignal = meaningfulTranscripts.length >= MIN_SIGNAL_LINES;

  const productivityScore = clamp(
    Math.round(
      35 +
        uniqueActionItems.length * 8 +
        decisions.length * 7 +
        Math.min(questions.length, 8) * 2 +
        (participationBalance - 40) * 0.35 -
        Math.max(0, risks.length - 1) * 4
    ),
    0,
    100
  );

  const safeScore = hasEnoughSignal ? productivityScore : null;

  return {
    summaryBullets: buildSummaryBullets(meaningfulTranscripts),
    actionItems: uniqueActionItems.slice(0, 12),
    decisions: decisions.slice(0, 10),
    risks: risks.slice(0, 10),
    questions: questions.slice(0, 10),
    highlights: highlights.slice(0, 18),
    speakerStats,
    metrics: {
      productivityScore: safeScore,
      participationBalance,
      totalTranscriptLines: finalTranscripts.length,
      meaningfulTranscriptLines: meaningfulTranscripts.length,
      totalActionItems: uniqueActionItems.length,
      totalDecisions: decisions.length,
      totalRisks: risks.length,
      hasEnoughSignal,
      signalLinesRequired: MIN_SIGNAL_LINES
    }
  };
}

function formatList(items, formatter, emptyText) {
  if (!items || items.length === 0) return emptyText;
  return items.slice(0, 5).map(formatter).join('\n');
}

export function answerMeetingQuestion(question, intelligence) {
  const query = (question || '').trim().toLowerCase();

  const hasEnoughSignal = Boolean(intelligence?.metrics?.hasEnoughSignal);
  const currentSignalLines = intelligence?.metrics?.meaningfulTranscriptLines || 0;
  const requiredSignalLines = intelligence?.metrics?.signalLinesRequired || MIN_SIGNAL_LINES;
  const lowSignalPrefix = hasEnoughSignal
    ? ''
    : `Low confidence (${currentSignalLines}/${requiredSignalLines} meaningful lines). `;

  if (!query) {
    return 'Ask a question about decisions, tasks, risks, summary, or speaker contribution.';
  }

  if (query.includes('decision')) {
    const response = formatList(
      intelligence.decisions,
      (item, i) => `${i + 1}. ${item.text}`,
      'No clear decisions were detected yet.'
    );
    return `${lowSignalPrefix}${response}`;
  }

  if (query.includes('task') || query.includes('action') || query.includes('responsible') || query.includes('owner')) {
    const response = formatList(
      intelligence.actionItems,
      (item, i) => `${i + 1}. ${item.task} | Owner: ${item.assignee} | Deadline: ${item.deadline}`,
      'No action items were detected yet.'
    );
    return `${lowSignalPrefix}${response}`;
  }

  if (query.includes('risk') || query.includes('blocker') || query.includes('issue')) {
    const response = formatList(
      intelligence.risks,
      (item, i) => `${i + 1}. ${item.text}`,
      'No explicit risks were detected in the current transcript.'
    );
    return `${lowSignalPrefix}${response}`;
  }

  if (query.includes('summary') || query.includes('bullet')) {
    if (intelligence.summaryBullets.length === 0) return `${lowSignalPrefix}Not enough transcript data for summary yet.`;
    return `${lowSignalPrefix}${intelligence.summaryBullets.map((item, i) => `${i + 1}. ${item}`).join('\n')}`;
  }

  if (query.includes('who spoke most') || query.includes('talk ratio') || query.includes('speak most')) {
    const response = formatList(
      intelligence.speakerStats.speakers,
      (item, i) => `${i + 1}. ${item.speaker}: ${item.ratio}% talk share`,
      'Speaker ratio is not available yet.'
    );
    return `${lowSignalPrefix}${response}`;
  }

  const terms = toKeyTerms(query);
  if (terms.length === 0) {
    return 'Try a more specific question like: What decisions were made? or What risks were discussed?';
  }

  const matches = intelligence.highlights.filter((item) => {
    const text = item.text.toLowerCase();
    return terms.some((term) => text.includes(term));
  });

  if (matches.length > 0) {
    return `${lowSignalPrefix}${matches.slice(0, 4).map((item, i) => `${i + 1}. ${item.text}`).join('\n')}`;
  }

  return `${lowSignalPrefix}I could not find a direct match in the transcript yet. Try asking about decisions, tasks, summary, risks, or speaker ratio.`;
}

export function getQuickPrompts() {
  return QUICK_PROMPTS;
}
