// OWNER: Atul — keyword search
const KnowledgeEntry = require('../models/KnowledgeEntry');

// Ranked $text search; each result carries its relevance as `score`.
async function searchEntries(q, { skip, limit }) {
  const filter = { $text: { $search: q } };
  const rank = { score: { $meta: 'textScore' } };
  const [entries, total] = await Promise.all([
    KnowledgeEntry.find(filter, rank).sort(rank).skip(skip).limit(limit),
    KnowledgeEntry.countDocuments(filter),
  ]);
  return { entries, total };
}

module.exports = { searchEntries };
