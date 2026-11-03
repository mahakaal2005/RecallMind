// OWNER: Rajan — situational retrieval
// retrieveLessons(problem, limit): $match $text -> $addFields { score: { $meta: 'textScore' } } ->
//   $unwind lessons -> rank each lesson (words of `problem` found in lessonText + context, plus score) ->
//   top N with entryId, lessonId, title, source.

module.exports = {};
