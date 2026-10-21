const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const config = require('../config');
const { USER_ROLES } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Generate application JWT token
 * @param {object} user
 * @returns {string}
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn
    }
  );
};

/**
 * Configure and set HttpOnly auth cookie
 * @param {object} res
 * @param {string} token
 */
const setAuthCookie = (res, token) => {
  const isProduction = config.env === 'production';

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: config.cookieMaxAge,
    path: '/'
  });
};

/**
 * Clear auth cookie
 * @param {object} res
 */
const clearAuthCookie = (res) => {
  const isProduction = config.env === 'production';

  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
  });
};

/**
 * Register a new student user
 */
const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    const error = new Error(
      'An account with this email address already exists'
    );
    error.statusCode = 400;
    throw error;
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: USER_ROLES.STUDENT,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      name.trim()
    )}`
  });

  const token = generateToken(newUser);

  return {
    user: newUser,
    token
  };
};

/**
 * Login user with email and password
 */
const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail
  });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (!user.passwordHash) {
    const error = new Error(
      'This account was created using Google. Please log in with Google.'
    );
    error.statusCode = 400;
    throw error;
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  return {
    user,
    token
  };
};

/**
 * Handle Google authentication payload
 * from ID token or OAuth callback
 */
const handleGoogleUser = async ({
  googleId,
  email,
  name,
  picture
}) => {
  const normalizedEmail = email.toLowerCase().trim();

  let user = await User.findOne({
    $or: [
      { googleId },
      { email: normalizedEmail }
    ]
  });

  if (user) {
    // If user existed with email, link googleId and avatar if missing
    let updated = false;

    if (!user.googleId) {
      user.googleId = googleId;
      updated = true;
    }

    if (!user.avatar && picture) {
      user.avatar = picture;
      updated = true;
    }

    if (updated) {
      await user.save();
    }
  } else {
    // Create new user from Google profile
    user = await User.create({
      name: name || 'Student User',
      email: normalizedEmail,
      googleId,
      avatar:
        picture ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          name || 'S'
        )}`,
      role: USER_ROLES.STUDENT
    });

    logger.info(
      `Created new user via Google Sign-In: ${user.email}`
    );
  }

  const token = generateToken(user);

  return {
    user,
    token
  };
};

module.exports = {
  generateToken,
  setAuthCookie,
  clearAuthCookie,
  registerUser,
  loginUser,
  handleGoogleUser
};