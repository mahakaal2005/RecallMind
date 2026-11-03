// OWNER: Atul — Knowledge CRUD
const asyncHandler = require('../middleware/asyncHandler');
const KnowledgeEntry = require('../models/KnowledgeEntry');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const { getPagination, paginationMeta } = require('../utils/pagination');
const appEvents = require('../events/appEvents');
const { EVENTS } = require('../utils/constants');

const SORTABLE = ['createdAt', 'updatedAt', 'title', 'source', 'category'];
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Whitelist fields so clients can't set recall stats or importedFromFile directly.
const pickEntry = (body) => {
  const out = {};
  for (const k of ['title', 'source', 'sourceType', 'category', 'tags']) {
    if (body[k] !== undefined) out[k] = body[k];
  }
  return out;
};
const pickLesson = (l) => ({ lessonText: l.lessonText, context: l.context, pageNumber: l.pageNumber });

// POST /api/knowledge
exports.createEntry = asyncHandler(async (req, res) => {
  const entry = await KnowledgeEntry.create({
    ...pickEntry(req.body),
    lessons: (req.body.lessons || []).map(pickLesson),
  });
  appEvents.emit(EVENTS.KNOWLEDGE_ADDED, { id: entry._id, title: entry.title, source: entry.source });
  sendSuccess(res, entry, 'Entry created', 201);
});

// GET /api/knowledge?page=&limit=&sortBy=&order=&source=&category=&tags=
exports.getAllEntries = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { source, category, tags, sortBy, order } = req.query;

  const filter = {};
  if (typeof category === 'string' && category) filter.category = category.trim().toLowerCase();
  if (typeof source === 'string' && source) filter.source = new RegExp(escapeRegex(source), 'i');
  if (typeof tags === 'string' && tags) {
    filter.tags = { $in: tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean) };
  }

  const sortField = SORTABLE.includes(sortBy) ? sortBy : 'createdAt';
  const sortDir = order === 'asc' ? 1 : -1;

  const [entries, total] = await Promise.all([
    KnowledgeEntry.find(filter).sort({ [sortField]: sortDir }).skip(skip).limit(limit),
    KnowledgeEntry.countDocuments(filter),
  ]);
  sendSuccess(res, entries, 'Entries fetched', 200, { pagination: paginationMeta(page, limit, total) });
});

// GET /api/knowledge/:id
exports.getEntryById = asyncHandler(async (req, res) => {
  const entry = await KnowledgeEntry.findById(req.params.id);
  if (!entry) throw new ApiError(404, 'Entry not found');
  sendSuccess(res, entry);
});

// PUT /api/knowledge/:id
// Lessons sent with their _id keep their recall stats; lessons without one are new;
// existing lessons left out of the array are removed.
exports.updateEntry = asyncHandler(async (req, res) => {
  const existing = await KnowledgeEntry.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Entry not found');

  const update = pickEntry(req.body);
  if (req.body.lessons) {
    update.lessons = req.body.lessons.map((l) => {
      const old = l._id && existing.lessons.id(l._id);
      return old ? { ...old.toObject(), ...pickLesson(l) } : pickLesson(l);
    });
  }

  const entry = await KnowledgeEntry.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  sendSuccess(res, entry, 'Entry updated');
});

// DELETE /api/knowledge/:id
exports.deleteEntry = asyncHandler(async (req, res) => {
  const entry = await KnowledgeEntry.findByIdAndDelete(req.params.id);
  if (!entry) throw new ApiError(404, 'Entry not found');
  sendSuccess(res, null, 'Entry deleted');
});
