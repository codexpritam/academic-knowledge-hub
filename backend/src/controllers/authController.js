const authService = require('../services/authService');
const googleAuth = require('../config/googleAuth');
const config = require('../config');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Register a new student account
 */
const register = async (req, res, next) => {
  try {
    const validation = validateRegister(req.body);
    if (!validation.isValid) {
      return sendError(res, 'Validation error', 400, validation.errors);
    }

    const { name, email, password } = req.body;
    const { user, token } = await authService.registerUser({ name, email, password });

    authService.setAuthCookie(res, token);

    return sendSuccess(
      res,
      'Registration successful. Welcome to Academic Knowledge Hub!',
      { user },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Log in with email and password
 */
const login = async (req, res, next) => {
  try {
    const validation = validateLogin(req.body);
    if (!validation.isValid) {
      return sendError(res, 'Validation error', 400, validation.errors);
    }

    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });

    authService.setAuthCookie(res, token);

    return sendSuccess(res, 'Login successful', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Log out and clear HttpOnly cookie
 */
const logout = async (req, res) => {
  authService.clearAuthCookie(res);
  return sendSuccess(res, 'Logged out successfully');
};

/**
 * Get current authenticated user profile
 */
const getMe = async (req, res) => {
  return sendSuccess(res, 'Authenticated user profile', { user: req.user });
};

/**
 * Get Google OAuth consent URL for redirect flow
 */
const getGoogleAuthUrl = (req, res) => {
  if (!googleAuth.isConfigured()) {
    return sendError(res, 'Google OAuth credentials are not configured on the server.', 503);
  }

  try {
    const url = googleAuth.getGoogleAuthUrl();
    return sendSuccess(res, 'Google OAuth URL generated', { url });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Handle Google OAuth redirect callback
 */
const googleCallback = async (req, res, next) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${config.frontendUrl}/login?error=Google authentication was cancelled or failed.`);
    }

    const payload = await googleAuth.getGoogleUserFromCode(code);
    const { user, token } = await authService.handleGoogleUser({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    });

    authService.setAuthCookie(res, token);

    // Redirect to frontend dashboard
    return res.redirect(`${config.frontendUrl}/dashboard?auth=success`);
  } catch (error) {
    logger.error(`Google callback failed: ${error.message}`);
    return res.redirect(`${config.frontendUrl}/login?error=${encodeURIComponent(error.message)}`);
  }
};

/**
 * Direct Google token verification endpoint (for Google Identity Services one-click button)
 */
const googleVerifyToken = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return sendError(res, 'Google ID token credential is required.', 400);
    }

    const payload = await googleAuth.verifyGoogleIdToken(credential);
    const { user, token } = await authService.handleGoogleUser({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    });

    authService.setAuthCookie(res, token);

    return sendSuccess(res, 'Google authentication successful', { user});
  } catch (error) {
    logger.error(`Google token verification failed: ${error.message}`);
    return sendError(res, error.message || 'Google authentication failed', 400);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  getGoogleAuthUrl,
  googleCallback,
  googleVerifyToken
};

 