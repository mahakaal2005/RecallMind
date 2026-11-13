// OWNER: Rajan — spaced-repetition logic (PRD §8.3)
const KnowledgeEntry = require('../models/KnowledgeEntry');
const { RECALL } = require('../utils/constants');

/**
 * selectLessonsForQuiz — selects candidate lessons based on low recall score
 * and least recently tested (or never tested). Adds a slight shuffle from the top pool.
 */
async function selectLessonsForQuiz(count = 5, category = null) {
  const matchStage = {};
  if (category && typeof category === 'string' && category.trim()) {
    matchStage.category = category.trim().toLowerCase();
  }

  // Aggregate: match -> unwind lessons -> sort by recallScore asc, lastTestedAt asc
  const candidates = await KnowledgeEntry.aggregate([
    { $match: matchStage },
    { $unwind: '$lessons' },
    {
      $sort: {
        'lessons.recallScore': 1,
        'lessons.lastTestedAt': 1,
      },
    },
    // Pool top count * 2 to introduce slight randomness
    { $limit: Math.max(count * 2, 10) },
    {
      $project: {
        _id: 1,
        title: 1,
        source: 1,
        sourceType: 1,
        category: 1,
        tags: 1,
        lesson: '$lessons',
      },
    },
  ]);

  if (!candidates || candidates.length === 0) {
    return [];
  }

  // Shuffle candidate pool (Fisher-Yates) and pick count
  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

/**
 * calculateNewScore — calculates clamped recall score based on whether user remembered
 */
function calculateNewScore(currentScore = 0, remembered = false) {
  const delta = remembered ? RECALL.REMEMBERED_DELTA : RECALL.FORGOT_DELTA;
  const raw = (currentScore ?? 0) + delta;
  return Math.max(RECALL.MIN, Math.min(RECALL.MAX, raw));
}

module.exports = {
  selectLessonsForQuiz,
  calculateNewScore,
};
