// OWNER: Rajan — situational retrieval "Help me with..."
const KnowledgeEntry = require('../models/KnowledgeEntry');

/**
 * retrieveLessons — finds stored lessons that best address a user's real-life problem.
 * Uses MongoDB text index and word frequency scoring, ranking lessons by relevance.
 */
async function retrieveLessons(problem, limit = 5) {
  if (!problem || typeof problem !== 'string' || !problem.trim()) {
    return [];
  }

  const cleanProblem = problem.trim();
  const words = cleanProblem
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  let candidates = [];

  try {
    // Stage 1: Text search aggregation pipeline with textScore
    candidates = await KnowledgeEntry.aggregate([
      { $match: { $text: { $search: cleanProblem } } },
      { $addFields: { score: { $meta: 'textScore' } } },
      { $unwind: '$lessons' },
      {
        $project: {
          _id: 0,
          entryId: '$_id',
          lessonId: '$lessons._id',
          title: 1,
          source: 1,
          category: 1,
          score: 1,
          lessonText: '$lessons.lessonText',
          context: '$lessons.context',
          recallScore: '$lessons.recallScore',
        },
      },
    ]);
  } catch (err) {
    // If text index search fails or throws, fallback to regex search
    candidates = [];
  }

  // Fallback: If text index found 0 items and we have words, match via regex
  if ((!candidates || candidates.length === 0) && words.length > 0) {
    const regexList = words.map((w) => new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    candidates = await KnowledgeEntry.aggregate([
      {
        $match: {
          $or: [
            { 'lessons.lessonText': { $in: regexList } },
            { 'lessons.context': { $in: regexList } },
            { title: { $in: regexList } },
            { tags: { $in: words } },
          ],
        },
      },
      { $unwind: '$lessons' },
      {
        $project: {
          _id: 0,
          entryId: '$_id',
          lessonId: '$lessons._id',
          title: 1,
          source: 1,
          category: 1,
          score: { $literal: 1 },
          lessonText: '$lessons.lessonText',
          context: '$lessons.context',
          recallScore: '$lessons.recallScore',
        },
      },
    ]);
  }

  if (!candidates || candidates.length === 0) {
    return [];
  }

  // Rank each candidate lesson by combining textScore and keyword overlap
  const ranked = candidates.map((item) => {
    const hayStack = `${item.lessonText || ''} ${item.context || ''} ${item.title || ''} ${item.category || ''}`.toLowerCase();
    let wordMatches = 0;
    for (const w of words) {
      if (hayStack.includes(w)) {
        wordMatches++;
      }
    }
    const combinedScore = (item.score || 1) * 2 + wordMatches * 3;
    return {
      ...item,
      relevanceScore: Number(combinedScore.toFixed(2)),
    };
  });

  // Sort descending by relevance score, then recallScore
  ranked.sort((a, b) => b.relevanceScore - a.relevanceScore || (b.score || 0) - (a.score || 0));

  return ranked.slice(0, Math.max(1, limit));
}

module.exports = {
  retrieveLessons,
};
