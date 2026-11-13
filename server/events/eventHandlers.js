// OWNER: Vansh — write each event to logs/activity.log (fs.appendFile) + ActivityLog collection.
// Syllabus: Unit 1 — EventEmitter, fs.appendFile, fs.mkdirSync
//
// Payload contract (emitters must send these fields):
//   knowledge:added   { id, title, source }                  — emitted by Atul (create) / Vansh (upload, quick)
//   file:uploaded     { fileName, size, lessonsParsed }      — emitted by Vansh
//   quiz:completed    { quizId, score, total }               — emitted by Rajan
//   reflection:added  { id, mood, linkedCount }              — emitted by Vansh

const fs = require('fs');
const path = require('path');
const appEvents = require('./appEvents');
const { EVENTS } = require('../utils/constants');
const ActivityLog = require('../models/ActivityLog');

const LOG_DIR = path.join(__dirname, '../logs');
const LOG_FILE = path.join(LOG_DIR, 'activity.log');

// Ensure logs directory exists once at startup (Unit 1: fs.mkdirSync)
fs.mkdirSync(LOG_DIR, { recursive: true });

// Map raw event name to uppercase label for the log file
const labelOf = (eventType) => eventType.replace(/:/g, '_').toUpperCase();

/**
 * record — centralised logging helper.
 * Writes to the log file (Unit 1: fs.appendFile) and to the ActivityLog
 * MongoDB collection (Unit 4). A logging failure must NEVER crash a request
 * or cause an unhandled rejection (async listener rejections crash Node).
 */
function record(eventType, description, metadata) {
  const line = `[${new Date().toISOString()}] ${labelOf(eventType)}: ${description}\n`;

  // Unit 1: fs.appendFile — non-blocking file append
  fs.appendFile(LOG_FILE, line, () => {});

  // Unit 4: persist to MongoDB for aggregation queries (try/catch — never throw)
  try {
    ActivityLog.create({ eventType, description, metadata }).catch(() => {});
  } catch (_) {
    // swallow synchronous errors (e.g. disconnected DB)
  }
}

// --- Listeners (defensive reads — payloads may be incomplete) ---

appEvents.on(EVENTS.KNOWLEDGE_ADDED, (data) => {
  const d = data || {};
  record(EVENTS.KNOWLEDGE_ADDED,
    `Added "${d.title || '?'}" from "${d.source || '?'}"`,
    { id: String(d.id || ''), title: d.title, source: d.source });
});

appEvents.on(EVENTS.FILE_UPLOADED, (data) => {
  const d = data || {};
  record(EVENTS.FILE_UPLOADED,
    `Uploaded ${d.fileName || '?'} (${d.size ?? '?'} bytes, ${d.lessonsParsed ?? '?'} lessons)`,
    { fileName: d.fileName, size: d.size, lessonsParsed: d.lessonsParsed });
});

appEvents.on(EVENTS.QUIZ_COMPLETED, (data) => {
  const d = data || {};
  record(EVENTS.QUIZ_COMPLETED,
    `Quiz ${d.quizId || '?'} scored ${d.score ?? '?'}% (${d.total ?? '?'} questions)`,
    { quizId: String(d.quizId || ''), score: d.score, total: d.total });
});

appEvents.on(EVENTS.REFLECTION_ADDED, (data) => {
  const d = data || {};
  record(EVENTS.REFLECTION_ADDED,
    `Reflection (${d.mood || '?'}), ${d.linkedCount ?? 0} linked lesson(s)`,
    { id: String(d.id || ''), mood: d.mood, linkedCount: d.linkedCount });
});
