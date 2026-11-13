// OWNER: Vansh — reflection journal
// Syllabus: Unit 2 (REST CRUD), Unit 3 (document references vs embedding),
//           Unit 4 (populate, Mongoose queries)

const asyncHandler = require('../middleware/asyncHandler');
const Reflection = require('../models/Reflection');
const KnowledgeEntry = require('../models/KnowledgeEntry');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const { getPagination, paginationMeta } = require('../utils/pagination');
const { EVENTS, MOODS } = require('../utils/constants');
const appEvents = require('../events/appEvents');

const ID_RE = /^[a-f\d]{24}$/i;
const MAX_LINKS = 10;
const MAX_TEXT = 2000;

// POST /api/reflections
exports.createReflection = asyncHandler(async (req, res) => {
  const { text, mood, linkedLessons } = req.body || {};

  // Validate text
  if (typeof text !== 'string' || !text.trim()) {
    throw new ApiError(400, 'text is required');
  }
  if (text.trim().length > MAX_TEXT) {
    throw new ApiError(400, `text must be ${MAX_TEXT} characters or fewer`);
  }

  // Validate mood
  const finalMood = mood || 'neutral';
  if (!MOODS.includes(finalMood)) {
    throw new ApiError(400, `mood must be one of: ${MOODS.join(', ')}`);
  }

  // Validate and dedupe linkedLessons
  let uniqueLinks = [];
  if (linkedLessons !== undefined) {
    if (!Array.isArray(linkedLessons)) {
      throw new ApiError(400, 'linkedLessons must be an array');
    }
    if (linkedLessons.length > MAX_LINKS) {
      throw new ApiError(400, `linkedLessons may have at most ${MAX_LINKS} entries`);
    }

    // Dedupe by "entryId|lessonId"
    const seen = new Set();
    for (const link of linkedLessons) {
      if (!link || !ID_RE.test(link.knowledgeEntryId) || !ID_RE.test(link.lessonId)) {
        throw new ApiError(400, 'Each linked lesson needs valid knowledgeEntryId and lessonId (24-hex)');
      }
      const key = `${link.knowledgeEntryId}|${link.lessonId}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueLinks.push({ knowledgeEntryId: link.knowledgeEntryId, lessonId: link.lessonId });
      }
    }

    // Verify each pair exists in the DB (Unit 3: references, not embedding)
    for (const link of uniqueLinks) {
      const exists = await KnowledgeEntry.exists({
        _id: link.knowledgeEntryId,
        'lessons._id': link.lessonId,
      });
      if (!exists) {
        throw new ApiError(400,
          `Linked lesson not found: entry ${link.knowledgeEntryId}, lesson ${link.lessonId}`);
      }
    }
  }

  const reflection = await Reflection.create({
    text: text.trim(),
    mood: finalMood,
    linkedLessons: uniqueLinks,
  });

  // Unit 1: EventEmitter
  appEvents.emit(EVENTS.REFLECTION_ADDED, {
    id: reflection._id.toString(),
    mood: reflection.mood,
    linkedCount: uniqueLinks.length,
  });

  sendSuccess(res, reflection, 'Reflection saved', 201);
});

// GET /api/reflections?page=&limit=&mood=&order=
exports.getReflections = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { mood, order } = req.query;

  const filter = {};
  if (mood) {
    if (!MOODS.includes(mood)) {
      throw new ApiError(400, `mood must be one of: ${MOODS.join(', ')}`);
    }
    filter.mood = mood;
  }

  const sortDir = order === 'asc' ? 1 : -1;

  const [docs, total] = await Promise.all([
    Reflection.find(filter)
      .sort({ createdAt: sortDir })
      .skip(skip)
      .limit(limit)
      // Unit 4: populate — resolve document references
      .populate('linkedLessons.knowledgeEntryId', 'title source lessons._id lessons.lessonText'),
    Reflection.countDocuments(filter),
  ]);

  // Transform to a safe shape (handles deleted entries/lessons gracefully)
  const data = docs.map((r) => {
    const linked = (r.linkedLessons || []).map((ll) => {
      const entry = ll.knowledgeEntryId; // populated or null if deleted
      if (!entry) return { lessonId: ll.lessonId.toString(), deleted: true };

      const lesson = (entry.lessons || []).find(
        (l) => l._id.toString() === ll.lessonId.toString()
      );
      if (!lesson) return { lessonId: ll.lessonId.toString(), deleted: true };

      return {
        entryId: entry._id.toString(),
        title: entry.title,
        source: entry.source,
        lessonId: ll.lessonId.toString(),
        lessonText: lesson.lessonText,
      };
    });

    return {
      _id: r._id,
      text: r.text,
      mood: r.mood,
      createdAt: r.createdAt,
      linked,
    };
  });

  sendSuccess(res, data, 'Reflections fetched', 200, {
    pagination: paginationMeta(page, limit, total),
  });
});

// GET /api/reflections/by-lesson/:lessonId
// Contract with Atul's EntryDetail.jsx: returns a plain array of { _id, mood, text }
exports.getReflectionsByLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  if (!ID_RE.test(lessonId)) throw new ApiError(400, 'Invalid lessonId');

  const items = await Reflection.find({ 'linkedLessons.lessonId': lessonId })
    .sort({ createdAt: -1 })
    .lean();

  const data = items.map((r) => ({ _id: r._id, mood: r.mood, text: r.text }));
  sendSuccess(res, data);
});

// DELETE /api/reflections/:id
exports.deleteReflection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!ID_RE.test(id)) throw new ApiError(400, 'Invalid reflection id');

  const deleted = await Reflection.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, 'Reflection not found');

  sendSuccess(res, null, 'Reflection deleted');
});
