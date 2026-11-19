require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
require('./events/eventHandlers'); // registers listeners on appEvents

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Global middleware ----------
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Serverless (Vercel imports this file instead of running it): connect on first request and reuse the connection.
const isMain = require.main === module;
let dbReady;
if (!isMain) {
  app.use((_req, _res, next) => {
    dbReady = dbReady || connectDB();
    dbReady.then(() => next(), (err) => { dbReady = null; next(err); });
  });
}

// ---------- Routes ----------
app.use('/api', require('./routes/systemRoutes'));
app.use('/api/knowledge', require('./routes/knowledgeRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));
app.use('/api/reflections', require('./routes/reflectionRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Error handler must be registered last
app.use(errorHandler);

if (isMain) {
  connectDB()
    .then(() => app.listen(PORT, () => console.log(`RecallMind API running on http://localhost:${PORT}`)))
    .catch((err) => {
      console.error('MongoDB connection failed:', err.message);
      process.exit(1);
    });
}

module.exports = app;
