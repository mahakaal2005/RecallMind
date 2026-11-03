const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../logs/requests.log');

// Logs every request (method, path, status, duration) to logs/requests.log
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms\n`;

    fs.appendFile(LOG_FILE, log, (err) => {
      if (err) console.error('Log write failed:', err);
    });
  });

  next();
};

module.exports = requestLogger;
