// Listeners for app events. Loaded once from server.js.
// OWNER: Vansh — write each event to logs/activity.log (fs.appendFile) + ActivityLog collection.
//
// Payload contract (emitters must send these fields):
//   knowledge:added   { id, title, source }                  — emitted by Atul (create) / Vansh (upload, quick)
//   file:uploaded     { fileName, size, lessonsParsed }      — emitted by Vansh
//   quiz:completed    { quizId, score, total }               — emitted by Rajan
//   reflection:added  { id, mood, linkedCount }              — emitted by Vansh

const appEvents = require('./appEvents');
const { EVENTS } = require('../utils/constants');

appEvents.on(EVENTS.KNOWLEDGE_ADDED, (data) => {
  // TODO (Vansh)
  console.log('[event] knowledge:added', data.title);
});

// TODO (Vansh): handlers for FILE_UPLOADED, QUIZ_COMPLETED, REFLECTION_ADDED
