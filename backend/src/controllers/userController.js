const User = require('../models/User');
const Document = require('../models/Document');
const DocumentChunk = require('../models/DocumentChunk');
const { deletePdfAsset } = require('../services/cloudinaryService');
const { clearAuthCookie } = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Get all documents uploaded by the currently authenticated user
 */
const getMyDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, 'My uploaded documents', { documents });
  } catch (error) {
    next(error);
  }
};

/**
 * Get profile information and statistics for the current user
 */
const getMyProfile = async (req, res, next) => {
  try {
    const documentCount = await Document.countDocuments({ uploadedBy: req.user._id });
    const user = await User.findById(req.user._id).select('-passwordHash');

    return sendSuccess(res, 'User profile', {
      user,
      stats: {
        uploadedResources: documentCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update authenticated user's profile
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const { name, bio, college, branch, semester, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (name && typeof name === 'string' && name.trim().length >= 2) {
      user.name = name.trim();
    }
    if (bio !== undefined) user.bio = String(bio).trim();
    if (college !== undefined) user.college = String(college).trim();
    if (branch !== undefined) user.branch = String(branch).trim();
    if (avatar !== undefined) user.avatar = String(avatar).trim();

    if (semester !== undefined) {
      const semNum = Number(semester);
      if (!isNaN(semNum) && semNum >= 1 && semNum <= 8) {
        user.semester = semNum;
      }
    }

    await user.save();
    return sendSuccess(res, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete account and all uploaded resources permanently
 */
const deleteMyAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Fetch all user's documents
    const documents = await Document.find({ uploadedBy: userId });

    // 2. Clean up each document's chunks and cloud assets
    for (const doc of documents) {
      await DocumentChunk.deleteMany({ documentId: doc._id });
      await deletePdfAsset(doc.cloudinaryPublicId, doc.fileUrl);
    }

    // 3. Delete document records
    await Document.deleteMany({ uploadedBy: userId });

    // 4. Delete user record
    await User.findByIdAndDelete(userId);

    // 5. Clear cookie
    clearAuthCookie(res);

    logger.info(`User account and resources permanently deleted: ${userId}`);
    return sendSuccess(res, 'Your account and all associated resources have been permanently deleted.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyDocuments,
  getMyProfile,
  updateMyProfile,
  deleteMyAccount
};
