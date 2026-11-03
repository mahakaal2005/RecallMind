const mongoose = require('mongoose');
const { MOODS } = require('../utils/constants');

const reflectionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    linkedLessons: [
      {
        knowledgeEntryId: { type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeEntry' },
        lessonId: { type: mongoose.Schema.Types.ObjectId },
      },
    ],
    mood: { type: String, enum: MOODS, default: 'neutral' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reflection', reflectionSchema);
