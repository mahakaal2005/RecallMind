// OWNER: Vansh — read logs/activity.log (fs.readFile) and aggregate the ActivityLog collection

const notImplemented = require('../utils/notImplemented');

// GET /api/activity/log?lines=50
exports.getActivityLog = notImplemented('Vansh');

// GET /api/activity/summary  (aggregation: count per eventType, per day)
exports.getActivitySummary = notImplemented('Vansh');
