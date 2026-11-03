const express = require('express');
const knowledge = require('../controllers/knowledgeController'); // Atul
const ingest = require('../controllers/uploadController');      // Vansh
const search = require('../controllers/searchController');      // Atul
const retrieve = require('../controllers/retrieveController');  // Rajan
const { validateKnowledgeEntry } = require('../middleware/validateInput');
const upload = require('../middleware/upload');

const router = express.Router();

// NOTE: specific paths must come BEFORE '/:id', otherwise "search" is treated as an id
router.get('/search', search.searchKnowledge);
router.post('/retrieve', retrieve.retrieveForSituation);
router.post('/upload', upload.single('file'), ingest.uploadFile);
router.post('/quick', ingest.quickCapture);

router.route('/')
  .get(knowledge.getAllEntries)
  .post(validateKnowledgeEntry, knowledge.createEntry);

router.route('/:id')
  .get(knowledge.getEntryById)
  .put(knowledge.updateEntry)
  .delete(knowledge.deleteEntry);

module.exports = router;
