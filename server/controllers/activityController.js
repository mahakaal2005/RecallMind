// OWNER: Vansh — read logs/activity.log (fs.readFile) and aggregate the ActivityLog collection
// Syllabus: Unit 1 (fs.readFile), Unit 4 (aggregation pipeline, $facet)

const fs = require('fs');
const path = require('path');
const asyncHandler = require('../middleware/asyncHandler');
const ActivityLog = require('../models/ActivityLog');
const { sendSuccess } = require('../utils/apiResponse');

const LOG_FILE = path.join(__dirname, '../logs/activity.log');

// GET /api/activity/log?lines=50
exports.getActivityLog = asyncHandler(async (req, res) => {
  let lines = parseInt(req.query.lines, 10);
  if (!Number.isFinite(lines) || lines < 1) lines = 50;
  if (lines > 500) lines = 500;

  let content = '';
  try {
    // Unit 1: fs.promises.readFile
    content = await fs.promises.readFile(LOG_FILE, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      return sendSuccess(res, { lines: [] });
    }
    throw err;
  }

  const allLines = content.split('\n').filter(Boolean);
  // newest first
  const result = allLines.slice(-lines).reverse();

  sendSuccess(res, { lines: result });
});

// GET /api/activity/summary
exports.getActivitySummary = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Unit 4: $facet aggregation — run multiple pipelines in one query
  const [result] = await ActivityLog.aggregate([
    {
      $facet: {
        byType: [
          { $group: { _id: '$eventType', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $project: { _id: 0, eventType: '$_id', count: 1 } },
        ],
        byDay: [
          { $match: { timestamp: { $gte: sevenDaysAgo } } },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$timestamp',
                  timezone: 'Asia/Kolkata',
                },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
          { $project: { _id: 0, date: '$_id', count: 1 } },
        ],
        total: [{ $count: 'total' }],
      },
    },
  ]);

  const totalEvents = result.total.length > 0 ? result.total[0].total : 0;

  // Zero-fill byDay to exactly the last 7 calendar days (Asia/Kolkata)
  const dayMap = new Map(result.byDay.map((d) => [d.date, d.count]));
  const byDay = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    byDay.push({ date: dateStr, count: dayMap.get(dateStr) || 0 });
  }

  sendSuccess(res, { totalEvents, byType: result.byType, byDay });
});
