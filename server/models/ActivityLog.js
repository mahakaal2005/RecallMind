const mongoose = require('mongoose');

// Primary log is the file logs/activity.log (EventEmitter + fs.appendFile).
// This collection stores the same events so /api/activity/summary can aggregate them.
const activityLogSchema = new mongoose.Schema({
  eventType: { type: String, required: true },
  description: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
