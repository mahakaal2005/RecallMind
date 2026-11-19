const os = require('os');
const path = require('path');
const fs = require('fs');

// Vercel functions have a read-only filesystem except os.tmpdir(); everywhere else use the project folders.
const base = process.env.VERCEL ? os.tmpdir() : path.join(__dirname, '..');

const LOG_DIR = path.join(base, 'logs');
const UPLOAD_DIR = path.join(base, 'uploads');

fs.mkdirSync(LOG_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

module.exports = { LOG_DIR, UPLOAD_DIR };
