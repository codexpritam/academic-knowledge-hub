const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/apiResponse');

const standardLimiterResponse = (message) => (req, res) => {
  return sendError(res, message, 429);
};

// Auth rate limiter (login / register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: standardLimiterResponse('Too many authentication attempts from this IP, please try again after 15 minutes.')
});

// AI Document Q&A rate limiter
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: standardLimiterResponse('AI query rate limit reached. Please wait a moment before asking another question.')
});

// Document upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // 25 uploads per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: standardLimiterResponse('Upload limit reached. Please wait before uploading more documents.')
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 400, // 400 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: standardLimiterResponse('Too many requests from this IP, please try again later.')
});

module.exports = {
  authLimiter,
  aiLimiter,
  uploadLimiter,
  apiLimiter
};
