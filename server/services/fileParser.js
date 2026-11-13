// OWNER: Vansh — parse .txt/.md notes line by line
// Syllabus: Unit 1 — Buffer, fs.createReadStream (Stream), readline
//
// Exports: looksBinary(filePath), parseUploadedFile(filePath, originalName)

const fs = require('fs');
const readline = require('readline');
const path = require('path');
const { ApiError } = require('../utils/apiResponse');

/**
 * looksBinary — read first 512 bytes into a Buffer and scan for 0x00.
 * Rejects binary files and UTF-16 (which has embedded null bytes).
 * Syllabus concept: Buffer.alloc, fileHandle.read
 */
async function looksBinary(filePath) {
  let fh;
  try {
    fh = await fs.promises.open(filePath, 'r');
    const buf = Buffer.alloc(512); // Unit 1: Buffer
    const { bytesRead } = await fh.read(buf, 0, 512, 0);
    for (let i = 0; i < bytesRead; i++) {
      if (buf[i] === 0x00) return true;
    }
    return false;
  } finally {
    if (fh) await fh.close();
  }
}

/**
 * parseUploadedFile — stream a text/markdown file line by line.
 * Syllabus concept: fs.createReadStream (Stream), readline.createInterface
 *
 * Format:
 *   # Title          → title
 *   Source: ...       → source
 *   Category: ...    → category
 *   - lesson text    → lesson  (also * lesson text)
 *
 * Fallbacks: title = filename w/o ext; source = title; category = "uncategorized".
 * Throws ApiError(400) if zero lessons found.
 */
async function parseUploadedFile(filePath, originalName) {
  let title = null;
  let source = null;
  let category = null;
  const lessons = [];

  // Unit 1: fs.createReadStream — memory-efficient streaming read
  const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let isFirstLine = true;
  try {
    for await (let line of rl) {
      // Strip UTF-8 BOM on the very first line
      if (isFirstLine) {
        if (line.charCodeAt(0) === 0xFEFF) line = line.slice(1);
        isFirstLine = false;
      }

      const trimmed = line.trim();

      // Single # heading (not ## or ###) → title
      if (!title) {
        const m = trimmed.match(/^#\s+(.+)$/);
        if (m) { title = m[1].trim(); continue; }
      }

      // Source: line
      if (!source) {
        const m = trimmed.match(/^source:\s*(.+)$/i);
        if (m) { source = m[1].trim(); continue; }
      }

      // Category: line
      if (!category) {
        const m = trimmed.match(/^category:\s*(.+)$/i);
        if (m) { category = m[1].trim().toLowerCase(); continue; }
      }

      // Bullet list items → lessons
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const text = trimmed.slice(2).trim();
        if (text) {
          lessons.push({ lessonText: text.slice(0, 1000) });
        }
      }
    }
  } finally {
    // Close readline and destroy stream so Windows can unlink the file
    rl.close();
    stream.destroy();
  }

  // Fallbacks
  const baseName = path.basename(originalName, path.extname(originalName));
  if (!title) title = baseName;
  if (!source) source = title;
  if (!category) category = 'uncategorized';

  if (lessons.length === 0) {
    throw new ApiError(400, 'No lessons found. Use lines starting with "- " or "* "');
  }

  return { title, source, category, lessons };
}

module.exports = { looksBinary, parseUploadedFile };
