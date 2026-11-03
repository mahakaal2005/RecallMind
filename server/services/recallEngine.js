// OWNER: Rajan — spaced-repetition logic (PRD §8.3)
// selectLessonsForQuiz(count, category): aggregate -> $unwind lessons -> sort by recallScore asc,
//   lastTestedAt asc (never-tested first) -> $limit.
// applyResult(lesson, remembered): use RECALL constants from utils/constants.js, clamp 0-100,
//   bump timesRecalled / timesForgotten, set lastTestedAt.

module.exports = {};
