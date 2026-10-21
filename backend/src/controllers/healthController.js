const mongoose = require('mongoose');
const config = require('../config');
const { isConfigured: isGoogleConfigured } = require('../config/googleAuth');
const { getGeminiClient } = require('../config/gemini');
const { sendSuccess } = require('../utils/apiResponse');

const getHealth = (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const geminiStatus = Boolean(getGeminiClient() && config.geminiApiKey) ? 'configured' : 'missing_api_key';
  const cloudinaryStatus = config.cloudinary.isConfigured ? 'configured' : 'local_storage_fallback';
  const googleAuthStatus = isGoogleConfigured() ? 'configured' : 'unconfigured';

  return sendSuccess(res, 'Academic Knowledge Hub API is operational', {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    services: {
      database: dbStatus,
      geminiAI: geminiStatus,
      fileStorage: cloudinaryStatus,
      googleAuth: googleAuthStatus
    },
    version: '1.0.0'
  });
};

module.exports = {
  getHealth
};
