// Input validation middleware — runs before the controller
// OWNER: Atul (extend validateKnowledgeEntry). Others add their own validators here.

const validateKnowledgeEntry = (req, res, next) => {
  const { title, source, category, lessons } = req.body;

  if (!title || !source || !category) {
    return res.status(400).json({
      success: false,
      error: 'Title, source, and category are required',
    });
  }

  if (lessons && !Array.isArray(lessons)) {
    return res.status(400).json({
      success: false,
      error: 'Lessons must be an array',
    });
  }

  // TODO (Atul): check every lesson has lessonText, sourceType is in SOURCE_TYPES, etc.

  next();
};

module.exports = { validateKnowledgeEntry };
