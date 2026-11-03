// OWNER: Atul — Knowledge CRUD
// Use asyncHandler + sendSuccess + ApiError. Emit EVENTS.KNOWLEDGE_ADDED after create.
//
// const asyncHandler = require('../middleware/asyncHandler');
// const KnowledgeEntry = require('../models/KnowledgeEntry');
// const { sendSuccess, ApiError } = require('../utils/apiResponse');
// const { getPagination, paginationMeta } = require('../utils/pagination');
// const appEvents = require('../events/appEvents');
// const { EVENTS } = require('../utils/constants');

const notImplemented = require('../utils/notImplemented');

// POST /api/knowledge
exports.createEntry = notImplemented('Atul');

// GET /api/knowledge?page=&limit=&sortBy=&order=&source=&category=&tags=
exports.getAllEntries = notImplemented('Atul');

// GET /api/knowledge/:id
exports.getEntryById = notImplemented('Atul');

// PUT /api/knowledge/:id
exports.updateEntry = notImplemented('Atul');

// DELETE /api/knowledge/:id
exports.deleteEntry = notImplemented('Atul');
