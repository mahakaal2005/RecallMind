// OWNER: Vansh — file upload + quick capture
// uploadFile: req.file comes from multer -> parse with services/fileParser.js (streams)
//             -> create KnowledgeEntry (importedFromFile: true) -> delete temp file -> emit events.
// quickCapture: body { lessonText, source, category? } -> one entry with one lesson.

const notImplemented = require('../utils/notImplemented');

// POST /api/knowledge/upload  (multipart/form-data, field name "file")
exports.uploadFile = notImplemented('Vansh');

// POST /api/knowledge/quick
exports.quickCapture = notImplemented('Vansh');
