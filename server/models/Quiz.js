const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  entryRef: { type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeEntry', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, required: true }, // _id of the nested lesson
  prompt: String,
  hint: String,
  userAnswer: String,
  remembered: Boolean, // user self-marks after the answer is revealed
});

const quizSchema = new mongoose.Schema(
  {
    category: { type: String },
    questions: [questionSchema],
    score: { type: Number },       // percentage, set on submit
    completedAt: { type: Date },   // null until submitted
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
