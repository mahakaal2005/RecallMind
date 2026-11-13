// OWNER: Vansh — multer middleware with file-type filter and size limit
// Syllabus: Unit 2 — middleware, error handling
//
// Export shape: { single(fieldName) } so routes can call upload.single('file')
// without changing the pre-wired route files.

const multer = require('multer');
const path = require('path');
const { ApiError } = require('../utils/apiResponse');

const ALLOWED_EXT = new Set(['.txt', '.md']);
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (_req, file, cb) => {
    // Unique name to avoid collisions
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const m = multer({
  storage,
  limits: { fileSize: MAX_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    // Check extension only (never trust mimetype) — case-insensitive
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return cb(new ApiError(400, 'Only .txt and .md files are allowed'));
    }
    cb(null, true);
  },
});

/**
 * Wraps multer's single() to convert MulterError codes into ApiError(400)
 * so the global errorHandler returns a clean JSON 400 instead of a 500.
 */
module.exports = {
  single(field) {
    const mw = m.single(field);
    return (req, res, next) => {
      mw(req, res, (err) => {
        if (!err) return next();
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new ApiError(400, 'File too large (max 2 MB)'));
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return next(new ApiError(400, "Send exactly one file in field 'file'"));
          }
          return next(new ApiError(400, `Upload failed: ${err.message}`));
        }
        // Our own ApiError (from fileFilter) or any other error
        return next(err);
      });
    };
  },
};
