// OWNER: Rajan — situational retrieval "Help me with..." (logic lives in services/retrieveService.js)
const asyncHandler = require('../middleware/asyncHandler');
const { retrieveLessons } = require('../services/retrieveService');
const { sendSuccess, ApiError } = require('../utils/apiResponse');

// POST /api/knowledge/retrieve  body: { problem: "I keep procrastinating on my assignment", limit? }
exports.retrieveForSituation = asyncHandler(async (req, res) => {
  const problem = typeof req.body.problem === 'string' ? req.body.problem.trim() : '';
  if (!problem) {
    throw new ApiError(400, 'Problem description is required in request body');
  }

  const limit = Math.max(1, Math.min(20, parseInt(req.body.limit, 10) || 5));
  const lessons = await retrieveLessons(problem, limit);

  if (!lessons || lessons.length === 0) {
    return sendSuccess(
      res,
      [],
      'No stored lessons directly match your situation. Try different keywords or add more lessons to your library.',
      200
    );
  }

  sendSuccess(
    res,
    lessons,
    `Found ${lessons.length} relevant lesson(s) to help with your situation`,
    200
  );
});
