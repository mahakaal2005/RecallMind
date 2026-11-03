// Standard response shape: { success, message, data } or { success, error }

const sendSuccess = (res, data, message = 'OK', statusCode = 200, extra = {}) =>
  res.status(statusCode).json({ success: true, message, data, ...extra });

const sendError = (res, error, statusCode = 400) =>
  res.status(statusCode).json({ success: false, error });

// Throw this from controllers: throw new ApiError(404, 'Entry not found')
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { sendSuccess, sendError, ApiError };
