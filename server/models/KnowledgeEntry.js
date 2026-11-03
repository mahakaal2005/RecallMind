const mongoose = require('mongoose');
const { SOURCE_TYPES } = require('../utils/constants');

// Lessons are nested sub-documents: each gets its own _id (used as lessonId)
const lessonSchema = new mongoose.Schema({
  lessonText: { type: String, required: true, trim: true },
  context: { type: String },                 // why this lesson matters
  pageNumber: { type: Number },
  recallScore: { type: Number, default: 0, min: 0, max: 100 },
  lastTestedAt: { type: Date },
  timesRecalled: { type: Number, default: 0 },
  timesForgotten: { type: Number, default: 0 },
});

const knowledgeEntrySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    source: { type: String, required: true, trim: true }, // book/article/podcast name
    sourceType: { type: String, enum: SOURCE_TYPES, default: 'book' },
    category: { type: String, required: true, trim: true, lowercase: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    lessons: [lessonSchema],
    importedFromFile: { type: Boolean, default: false },
  },
  { timestamps: true } // adds createdAt + updatedAt automatically
);

// Text index for /search and /retrieve
knowledgeEntrySchema.index(
  { title: 'text', source: 'text', 'lessons.lessonText': 'text', 'lessons.context': 'text' },
  { weights: { 'lessons.lessonText': 5, title: 3, 'lessons.context': 2, source: 1 } }
);

module.exports = mongoose.model('KnowledgeEntry', knowledgeEntrySchema);
