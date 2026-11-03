// OWNER: Vansh — reflection journal

const notImplemented = require('../utils/notImplemented');

// POST /api/reflections  body: { text, mood, linkedLessons: [{ knowledgeEntryId, lessonId }] }
exports.createReflection = notImplemented('Vansh');

// GET /api/reflections?page=&limit=&mood=&order=
exports.getReflections = notImplemented('Vansh');

// GET /api/reflections/by-lesson/:lessonId
exports.getReflectionsByLesson = notImplemented('Vansh');

// DELETE /api/reflections/:id
exports.deleteReflection = notImplemented('Vansh');
