const { GoogleGenAI } = require('@google/genai');
const config = require('./index');
const logger = require('../utils/logger');

let genAI = null;

if (config.geminiApiKey) {
  try {
    genAI = new GoogleGenAI({
      apiKey: config.geminiApiKey
    });

    logger.success('Google Gemini API client initialized.');
  } catch (err) {
    logger.error(`Error initializing Gemini client: ${err.message}`);
  }
} else {
  logger.warn(
    'GEMINI_API_KEY is not set. AI features will require an API key in .env.'
  );
}

const getGeminiClient = () => genAI;

module.exports = {
  getGeminiClient
};