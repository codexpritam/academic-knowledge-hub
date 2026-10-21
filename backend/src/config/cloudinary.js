const cloudinary = require('cloudinary').v2;
const config = require('./index');
const logger = require('../utils/logger');

if (config.cloudinary.isConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true
  });
  logger.success('Cloudinary initialized successfully.');
} else {
  logger.warn('Cloudinary credentials missing or incomplete. Local disk storage fallback will be used for uploaded files.');
}

module.exports = cloudinary;
