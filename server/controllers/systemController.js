// OWNER: Vansh (getSystemInfo only; getHealth is shared)
// Syllabus: Unit 1 — OS module

const os = require('os');
const mongoose = require('mongoose');
const { sendSuccess } = require('../utils/apiResponse');

const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

// GET /api/health (shared — do not modify)
exports.getHealth = (req, res) => {
  sendSuccess(res, {
    status: 'ok',
    db: DB_STATES[mongoose.connection.readyState] || 'unknown',
    uptimeSeconds: Math.round(process.uptime()),
  });
};

// GET /api/system/info — Unit 1: os module
exports.getSystemInfo = (req, res) => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const cpus = os.cpus();

  sendSuccess(res, {
    platform: os.platform(),
    architecture: os.arch(),
    release: os.release(),
    totalMemory: `${(totalMem / (1024 ** 3)).toFixed(2)} GB`,
    freeMemory: `${(freeMem / (1024 ** 3)).toFixed(2)} GB`,
    usedMemoryPercent: `${(((totalMem - freeMem) / totalMem) * 100).toFixed(1)}%`,
    uptime: `${(os.uptime() / 3600).toFixed(2)} hours`,
    cpus: cpus.length,
    cpuModel: cpus[0]?.model || 'N/A',
    hostname: os.hostname(),
    nodeVersion: process.version,
  });
};
