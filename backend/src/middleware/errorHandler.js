const logger = require('../utils/logger');
const { sendError } = require('../utils/apiResponse');

/**
 * Centralized express error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Multer file upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size limit exceeded. Maximum allowed size is 25MB.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field in upload request.';
    } else {
      message = `File upload error: ${err.message}`;
    }
  }

  // Mongoose bad ObjectId / CastError
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found with the requested identifier.';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((val) => val.message);
  }

  // Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `A record with this ${field} already exists.`;
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired.';
  }

  // Log non-404 / 500 errors
  if (statusCode >= 500) {
    logger.error(`Server Error [${req.method} ${req.originalUrl}]: ${err.stack || err.message}`);
  } else {
    logger.warn(`Client Error [${req.method} ${req.originalUrl}] ${statusCode}: ${message}`);
  }

  return sendError(res, message, statusCode, errors);
};

module.exports = errorHandler;
