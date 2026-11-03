const multer = require('multer');
const path = require('path');

// OWNER: Vansh
// Saves uploaded files into server/uploads/. TODO: fileFilter (.txt/.md only), size limit (e.g. 2MB).
const upload = multer({
  dest: path.join(__dirname, '../uploads'),
});

module.exports = upload;
