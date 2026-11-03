const express = require('express');
const activity = require('../controllers/activityController');

const router = express.Router();

router.get('/log', activity.getActivityLog);
router.get('/summary', activity.getActivitySummary);

module.exports = router;
