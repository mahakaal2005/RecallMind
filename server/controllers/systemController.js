const mongoose = require('mongoose');
const { sendSuccess } = require('../utils/apiResponse');
const notImplemented = require('../utils/notImplemented');

const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

// GET /api/health
exports.getHealth = (req, res) => {
  sendSuccess(res, {
    status: 'ok',
    db: DB_STATES[mongoose.connection.readyState] || 'unknown',
    uptimeSeconds: Math.round(process.uptime()),
  });
};

// GET /api/system/info — OWNER: Vansh (use the os module, see PRD §8.4)
exports.getSystemInfo = notImplemented('Vansh');
