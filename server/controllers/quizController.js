// OWNER: Rajan — quiz generation, submission, history, stats
const asyncHandler = require('../middleware/asyncHandler');
const Quiz = require('../models/Quiz');
const KnowledgeEntry = require('../models/KnowledgeEntry');
const { selectLessonsForQuiz, calculateNewScore } = require('../services/recallEngine');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const { getPagination, paginationMeta } = require('../utils/pagination');
const appEvents = require('../events/appEvents');
const { EVENTS } = require('../utils/constants');

// GET /api/quiz/generate?category=&count=5
exports.generateQuiz = asyncHandler(async (req, res) => {
  const count = Math.max(1, Math.min(20, parseInt(req.query.count, 10) || 5));
  const category = req.query.category || null;

  const chosen = await selectLessonsForQuiz(count, category);
  if (!chosen || chosen.length === 0) {
    throw new ApiError(404, 'No lessons available to generate a quiz');
  }

  const questions = chosen.map((item) => {
    const lesson = item.lesson;
    const prompt = `From "${item.title}" (${item.source}), recall this lesson:`;
    const hint = lesson.context
      ? `Context: ${lesson.context}`
      : item.tags && item.tags.length
        ? `Tags: ${item.tags.join(', ')}`
        : `Category: ${item.category}`;

    return {
      entryRef: item._id,
      lessonId: lesson._id,
      prompt,
      hint,
    };
  });

  const quiz = await Quiz.create({
    category: category ? category.trim().toLowerCase() : undefined,
    questions,
    score: null,
    completedAt: null,
  });

  // Return questions without the answer text
  const safeQuestions = quiz.questions.map((q) => ({
    questionId: q._id,
    _id: q._id,
    entryRef: q.entryRef,
    lessonId: q.lessonId,
    prompt: q.prompt,
    hint: q.hint,
  }));

  sendSuccess(
    res,
    {
      quizId: quiz._id,
      _id: quiz._id,
      category: quiz.category,
      questions: safeQuestions,
      createdAt: quiz.createdAt,
    },
    'Quiz generated successfully',
    201
  );
});

// POST /api/quiz/:quizId/submit  body: { answers: [{ questionId, userAnswer, remembered }] }
exports.submitQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { answers } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    throw new ApiError(400, 'Answers array is required');
  }

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new ApiError(404, 'Quiz not found');
  }

  if (quiz.completedAt) {
    throw new ApiError(400, 'Quiz has already been submitted');
  }

  // Map answers by questionId or lessonId
  const answerMap = new Map();
  for (const ans of answers) {
    const key = String(ans.questionId || ans._id || ans.lessonId);
    answerMap.set(key, ans);
  }

  const now = new Date();
  let rememberedCount = 0;
  const revealedQuestions = [];

  for (const q of quiz.questions) {
    const ans =
      answerMap.get(String(q._id)) ||
      answerMap.get(String(q.lessonId)) ||
      {};

    const userAnswer = typeof ans.userAnswer === 'string' ? ans.userAnswer.trim() : '';
    const remembered = Boolean(ans.remembered);

    q.userAnswer = userAnswer;
    q.remembered = remembered;
    if (remembered) rememberedCount++;

    // Fetch the entry to read current recallScore and real lesson text
    const entry = await KnowledgeEntry.findById(q.entryRef);
    let realLesson = null;
    if (entry && entry.lessons) {
      realLesson = entry.lessons.id(q.lessonId);
    }

    const currentScore = realLesson ? realLesson.recallScore : 0;
    const newScore = calculateNewScore(currentScore, remembered);

    // Positional update using KnowledgeEntry.updateOne with $set and $inc
    await KnowledgeEntry.updateOne(
      { _id: q.entryRef, 'lessons._id': q.lessonId },
      {
        $set: {
          'lessons.$.recallScore': newScore,
          'lessons.$.lastTestedAt': now,
        },
        $inc: {
          [remembered ? 'lessons.$.timesRecalled' : 'lessons.$.timesForgotten']: 1,
        },
      }
    );

    revealedQuestions.push({
      questionId: q._id,
      entryRef: q.entryRef,
      lessonId: q.lessonId,
      prompt: q.prompt,
      hint: q.hint,
      userAnswer,
      remembered,
      lessonText: realLesson ? realLesson.lessonText : '(Lesson text unavailable)',
      context: realLesson ? realLesson.context : '',
      title: entry ? entry.title : '',
      source: entry ? entry.source : '',
      newRecallScore: newScore,
    });
  }

  const total = quiz.questions.length;
  const finalScore = total > 0 ? Math.round((rememberedCount / total) * 100) : 0;

  quiz.score = finalScore;
  quiz.completedAt = now;
  await quiz.save();

  // Emit event for activity logging
  appEvents.emit(EVENTS.QUIZ_COMPLETED, {
    quizId: quiz._id,
    score: finalScore,
    total,
  });

  sendSuccess(
    res,
    {
      quizId: quiz._id,
      score: finalScore,
      total,
      rememberedCount,
      completedAt: quiz.completedAt,
      questions: revealedQuestions,
    },
    'Quiz submitted successfully'
  );
});

// GET /api/quiz/history?page=&limit=
exports.getQuizHistory = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = { completedAt: { $ne: null } };
  const [quizzes, total] = await Promise.all([
    Quiz.find(filter)
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('questions.entryRef', 'title source category'),
    Quiz.countDocuments(filter),
  ]);

  sendSuccess(res, quizzes, 'Quiz history retrieved', 200, {
    pagination: paginationMeta(page, limit, total),
  });
});

// GET /api/quiz/stats
exports.getStats = asyncHandler(async (req, res) => {
  // Aggregate overall lesson stats
  const [overallStats] = await KnowledgeEntry.aggregate([
    { $unwind: '$lessons' },
    {
      $group: {
        _id: null,
        totalLessons: { $sum: 1 },
        avgRecall: { $avg: '$lessons.recallScore' },
        neverTestedCount: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $not: ['$lessons.lastTestedAt'] },
                  { $eq: ['$lessons.lastTestedAt', null] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  // Aggregate weakest 3 categories by average recall
  const weakestCategories = await KnowledgeEntry.aggregate([
    { $unwind: '$lessons' },
    {
      $group: {
        _id: '$category',
        avgRecall: { $avg: '$lessons.recallScore' },
        lessonCount: { $sum: 1 },
      },
    },
    { $sort: { avgRecall: 1, _id: 1 } },
    { $limit: 3 },
    {
      $project: {
        _id: 0,
        category: '$_id',
        avgRecall: { $round: ['$avgRecall', 1] },
        lessonCount: 1,
      },
    },
  ]);

  // Streak & completed quizzes calculation
  const completedQuizzes = await Quiz.find({ completedAt: { $ne: null } })
    .select('completedAt score')
    .sort({ completedAt: -1 });

  const totalQuizzesCompleted = completedQuizzes.length;

  const uniqueDateStrings = new Set(
    completedQuizzes.map((q) => new Date(q.completedAt).toISOString().split('T')[0])
  );

  let streak = 0;
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let checkDate = null;
  if (uniqueDateStrings.has(todayStr)) {
    checkDate = new Date(now);
  } else if (uniqueDateStrings.has(yesterdayStr)) {
    checkDate = yesterday;
  }

  if (checkDate) {
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (uniqueDateStrings.has(dateStr)) {
        streak++;
        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
      } else {
        break;
      }
    }
  }

  const data = {
    totalLessons: overallStats ? overallStats.totalLessons : 0,
    averageRecall: overallStats ? Math.round(overallStats.avgRecall || 0) : 0,
    neverTestedCount: overallStats ? overallStats.neverTestedCount : 0,
    weakestCategories: weakestCategories || [],
    streak,
    totalQuizzesCompleted,
  };

  sendSuccess(res, data, 'Quiz stats retrieved');
});
