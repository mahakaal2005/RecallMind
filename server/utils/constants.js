module.exports = {
  SOURCE_TYPES: ['book', 'article', 'podcast', 'video', 'personal', 'other'],
  MOODS: ['inspired', 'neutral', 'struggling', 'proud'],

  PAGINATION: { DEFAULT_LIMIT: 10, MAX_LIMIT: 50 },

  // Recall scoring (used by Rajan's recallEngine)
  RECALL: { REMEMBERED_DELTA: 20, FORGOT_DELTA: -15, MIN: 0, MAX: 100 },

  // Event names — emit with appEvents.emit(EVENTS.X, payload)
  EVENTS: {
    KNOWLEDGE_ADDED: 'knowledge:added',
    FILE_UPLOADED: 'file:uploaded',
    QUIZ_COMPLETED: 'quiz:completed',
    REFLECTION_ADDED: 'reflection:added',
  },
};
