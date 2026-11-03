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

connectDB().then(() => {
  app.listen(PORT, () => console.log(`RecallMind API running on http://localhost:${PORT}`));
});
