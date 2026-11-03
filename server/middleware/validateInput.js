// Input validation middleware — runs before the controller
// OWNER: Atul (extend validateKnowledgeEntry). Others add their own validators here.
const { SOURCE_TYPES } = require('../utils/constants');

const fail = (res, error) => res.status(400).json({ success: false, error });
const isText = (v) => typeof v === 'string' && v.trim() !== '';

// Shared checks. On create (partial = false) title/source/category are required;
// on update (partial = true) they are only checked when present.
const validateBody = (partial) => (req, res, next) => {
  const { title, source, category, sourceType, tags, lessons } = req.body || {};

  for (const [name, value] of Object.entries({ title, source, category })) {
    if (value === undefined ? !partial : !isText(value)) {
      return fail(res, 'Title, source, and category are required');
    }
  }

  if (sourceType !== undefined && !SOURCE_TYPES.includes(sourceType)) {
    return fail(res, `sourceType must be one of: ${SOURCE_TYPES.join(', ')}`);
  }

  if (tags !== undefined && !(Array.isArray(tags) && tags.every((t) => typeof t === 'string'))) {
    return fail(res, 'Tags must be an array of strings');
  }

  if (lessons !== undefined) {
    if (!Array.isArray(lessons)) return fail(res, 'Lessons must be an array');
    if (lessons.some((l) => !l || !isText(l.lessonText))) {
      return fail(res, 'Every lesson needs a non-empty lessonText');
    }
  }

  next();
};

module.exports = {
  validateKnowledgeEntry: validateBody(false),
  validateKnowledgeUpdate: validateBody(true),
};
