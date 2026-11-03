// Temporary placeholder for endpoints not built yet. Delete usages as you implement them.
const notImplemented = (owner) => (req, res) =>
  res.status(501).json({
    success: false,
    error: `${req.method} ${req.originalUrl} not implemented yet (owner: ${owner})`,
  });

module.exports = notImplemented;
