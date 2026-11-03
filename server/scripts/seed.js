// Seeds the DB with sample knowledge so quiz/search/reflections can be built before the CRUD UI exists.
// Run: npm run seed   (WARNING: clears all collections first)
require('dotenv').config();
const mongoose = require('mongoose');
const KnowledgeEntry = require('../models/KnowledgeEntry');
const Quiz = require('../models/Quiz');
const Reflection = require('../models/Reflection');
const ActivityLog = require('../models/ActivityLog');

const entries = [
  {
    title: 'The Power of Habit',
    source: 'Atomic Habits by James Clear',
    sourceType: 'book',
    category: 'productivity',
    tags: ['habits', 'motivation', 'behavior-change'],
    lessons: [
      { lessonText: 'Every habit follows a cue-craving-response-reward loop', context: 'Understanding the loop helps you design new habits intentionally', pageNumber: 47 },
      { lessonText: 'Make the habit obvious, attractive, easy, and satisfying', context: 'The four laws of behavior change', pageNumber: 53 },
      { lessonText: 'Use the two-minute rule: scale a new habit down until it takes two minutes', context: 'Starting is the hardest part; beats procrastination', pageNumber: 162 },
      { lessonText: 'Habit stacking: after I do my current habit, I will do my new habit', context: 'Anchor new habits to existing ones', pageNumber: 74 },
    ],
  },
  {
    title: 'Focus in a Distracted World',
    source: 'Deep Work by Cal Newport',
    sourceType: 'book',
    category: 'productivity',
    tags: ['focus', 'deep-work', 'distraction'],
    lessons: [
      { lessonText: 'Schedule deep work in fixed time blocks and protect them', context: 'Willpower is limited; rituals remove decisions', pageNumber: 100 },
      { lessonText: 'Embrace boredom instead of reaching for your phone', context: 'Constant distraction weakens the ability to concentrate', pageNumber: 155 },
      { lessonText: 'Shutdown ritual: end the workday with a fixed routine', context: 'Lets your mind rest and stops work anxiety', pageNumber: 150 },
    ],
  },
  {
    title: 'Two Systems of Thinking',
    source: 'Thinking, Fast and Slow by Daniel Kahneman',
    sourceType: 'book',
    category: 'psychology',
    tags: ['decision-making', 'bias'],
    lessons: [
      { lessonText: 'System 1 is fast and intuitive, System 2 is slow and deliberate', context: 'Know which system is making your decision', pageNumber: 20 },
      { lessonText: 'Loss aversion: losses feel about twice as strong as equal gains', context: 'Explains why we avoid risks that are worth taking', pageNumber: 284 },
      { lessonText: 'Anchoring: the first number you see biases your estimate', context: 'Be careful in negotiations and pricing', pageNumber: 119 },
    ],
  },
  {
    title: 'Stoic Calm',
    source: 'Meditations by Marcus Aurelius',
    sourceType: 'book',
    category: 'mindset',
    tags: ['stoicism', 'stress', 'anxiety'],
    lessons: [
      { lessonText: 'Focus only on what is within your control', context: 'Reduces stress and anxiety about outcomes', pageNumber: 12 },
      { lessonText: 'Obstacles are the way: the impediment to action advances action', context: 'Reframe problems as training', pageNumber: 60 },
    ],
  },
  {
    title: 'How to Learn Anything',
    source: 'Huberman Lab Podcast',
    sourceType: 'podcast',
    category: 'learning',
    tags: ['memory', 'study', 'sleep'],
    lessons: [
      { lessonText: 'Active recall beats re-reading for long-term memory', context: 'Testing yourself strengthens memory traces' },
      { lessonText: 'Spaced repetition: review just before you are about to forget', context: 'Spacing reviews multiplies retention' },
      { lessonText: 'Sleep consolidates what you learned during the day', context: 'Do not sacrifice sleep before exams' },
    ],
  },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Promise.all([
      KnowledgeEntry.deleteMany({}),
      Quiz.deleteMany({}),
      Reflection.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);
    const created = await KnowledgeEntry.insertMany(entries);
    await KnowledgeEntry.syncIndexes(); // make sure the text index exists
    const lessonCount = created.reduce((sum, e) => sum + e.lessons.length, 0);
    console.log(`Seeded ${created.length} entries with ${lessonCount} lessons.`);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
