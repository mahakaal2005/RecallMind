// OWNER: Rajan — quiz generation, submission, history, stats
// Lesson selection + score updates live in services/recallEngine.js.

const notImplemented = require('../utils/notImplemented');

// GET /api/quiz/generate?category=&count=5
exports.generateQuiz = notImplemented('Rajan');

// POST /api/quiz/:quizId/submit  body: { answers: [{ questionId, userAnswer, remembered }] }
exports.submitQuiz = notImplemented('Rajan');

// GET /api/quiz/history?page=&limit=
exports.getQuizHistory = notImplemented('Rajan');

// GET /api/quiz/stats
exports.getStats = notImplemented('Rajan');
