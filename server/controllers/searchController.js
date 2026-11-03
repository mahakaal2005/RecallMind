// OWNER: Atul — keyword search (logic lives in services/searchService.js)
const asyncHandler = require('../middleware/asyncHandler');
const { searchEntries } = require('../services/searchService');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const { getPagination, paginationMeta } = require('../utils/pagination');

// GET /api/knowledge/search?q=procrastination
exports.searchKnowledge = asyncHandler(async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!q) throw new ApiError(400, 'Query parameter "q" is required');

  const { page, limit, skip } = getPagination(req.query);
  const { entries, total } = await searchEntries(q, { skip, limit });

  sendSuccess(res, entries, `${total} result(s) for "${q}"`, 200, {
    pagination: paginationMeta(page, limit, total),
  });
});
