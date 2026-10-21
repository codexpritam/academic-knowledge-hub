const { OAuth2Client } = require('google-auth-library');
const config = require('./index');
const logger = require('../utils/logger');

let oauth2Client = null;

if (config.google.isConfigured) {
  try {
    oauth2Client = new OAuth2Client(
      config.google.clientId,
      config.google.clientSecret,
      config.google.callbackUrl
    );
    logger.success('Google OAuth2 client initialized.');
  } catch (err) {
    logger.error(`Error initializing Google OAuth client: ${err.message}`);
  }
} else {
  logger.warn('Google OAuth credentials not configured in .env. Standard email/password authentication will be active.');
}

const verifyGoogleIdToken = async (idToken) => {
  if (!oauth2Client) {
    throw new Error('Google OAuth is not configured on this server.');
  }

  const ticket = await oauth2Client.verifyIdToken({
    idToken,
    audience: config.google.clientId
  });

  return ticket.getPayload();
};

const getGoogleAuthUrl = () => {
  if (!oauth2Client) {
    throw new Error('Google OAuth is not configured on this server.');
  }

  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes
  });
};

const getGoogleUserFromCode = async (code) => {
  if (!oauth2Client) {
    throw new Error('Google OAuth is not configured on this server.');
  }

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const ticket = await oauth2Client.verifyIdToken({
    idToken: tokens.id_token,
    audience: config.google.clientId
  });

  return ticket.getPayload();
};

module.exports = {
  verifyGoogleIdToken,
  getGoogleAuthUrl,
  getGoogleUserFromCode,
  isConfigured: () => Boolean(oauth2Client)
};
