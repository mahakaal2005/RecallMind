// OWNER: Vansh — file upload + quick capture
// Syllabus: Unit 1 (fs, streams, Buffer), Unit 2 (multer, REST), Unit 4 (Mongoose create)

const fs = require('fs');
const asyncHandler = require('../middleware/asyncHandler');
const KnowledgeEntry = require('../models/KnowledgeEntry');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const { EVENTS, SOURCE_TYPES } = require('../utils/constants');
const appEvents = require('../events/appEvents');
const { looksBinary, parseUploadedFile } = require('../services/fileParser');

const isText = (v) => typeof v === 'string' && v.trim() !== '';

// POST /api/knowledge/upload  (multipart/form-data, field name "file")
exports.uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'File is required');

  let entry;
  try {
    // Unit 1: Buffer — inspect first bytes to reject binary/UTF-16 files
    if (await looksBinary(req.file.path)) {
      throw new ApiError(400, 'File looks binary or UTF-16; save it as UTF-8 text');
    }

    // Unit 1: Stream + readline — parse the uploaded file
    const parsed = await parseUploadedFile(req.file.path, req.file.originalname);

    // Unit 4: Mongoose create
    entry = await KnowledgeEntry.create({
      title: parsed.title,
      source: parsed.source,
      category: parsed.category,
      sourceType: 'other',
      lessons: parsed.lessons,
      importedFromFile: true,
    });
  } finally {
    // Always delete temp file — even if parsing or DB insert fails
    await fs.promises.unlink(req.file.path).catch(() => {});
  }

  // Unit 1: EventEmitter — emit events for activity logging
  appEvents.emit(EVENTS.FILE_UPLOADED, {
    fileName: req.file.originalname,
    size: req.file.size,
    lessonsParsed: entry.lessons.length,
  });
  appEvents.emit(EVENTS.KNOWLEDGE_ADDED, {
    id: entry._id.toString(),
    title: entry.title,
    source: entry.source,
  });

  sendSuccess(res, entry, 'File uploaded and parsed successfully', 201);
});

// POST /api/knowledge/quick
exports.quickCapture = asyncHandler(async (req, res) => {
  const { lessonText, source, category, sourceType } = req.body || {};

  if (!isText(lessonText)) throw new ApiError(400, 'lessonText is required');
  if (lessonText.trim().length > 1000) throw new ApiError(400, 'lessonText must be 1000 characters or fewer');
  if (!isText(source)) throw new ApiError(400, 'source is required');

  // Optional sourceType must be valid if provided
  if (sourceType !== undefined && !SOURCE_TYPES.includes(sourceType)) {
    throw new ApiError(400, `sourceType must be one of: ${SOURCE_TYPES.join(', ')}`);
  }

  const text = lessonText.trim();
  const title = text.length > 60 ? text.slice(0, 60) + '…' : text;

  const entry = await KnowledgeEntry.create({
    title,
    source: source.trim(),
    category: isText(category) ? category.trim().toLowerCase() : 'uncategorized',
    sourceType: sourceType || 'other',
    lessons: [{ lessonText: text }],
    importedFromFile: false,
  });

  appEvents.emit(EVENTS.KNOWLEDGE_ADDED, {
    id: entry._id.toString(),
    title: entry.title,
    source: entry.source,
  });

  sendSuccess(res, entry, 'Quick capture created', 201);
});
