const { PAGINATION } = require('./constants');

// Reads ?page=&limit= from the query string. Default 10 per page, max 50.
const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT, 1),
    PAGINATION.MAX_LIMIT
  );
  return { page, limit, skip: (page - 1) * limit };
};

// Builds the meta block returned alongside paginated data
const paginationMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

module.exports = { getPagination, paginationMeta };
