const documentService = require('../services/documentService');
const { uploadPdfBuffer } = require('../services/cloudinaryService');
const Document = require('../models/Document');
const { validateDocumentUpload, validateDocumentUpdate } = require('../validators/documentValidator');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { PROCESSING_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Get all documents with search, filters, pagination
 */
const getDocuments = async (req, res, next) => {
  try {
    const { search, subject, semester, resourceType, sort, page, limit } = req.query;
    const result = await documentService.getDocuments({
      search,
      subject,
      semester,
      resourceType,
      sort,
      page,
      limit
    });

    return sendSuccess(res, 'Documents retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single document by ID
 */
const getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await documentService.getDocumentById(id);

    if (!document) {
      return sendError(res, 'Document not found', 404);
    }

    return sendSuccess(res, 'Document retrieved successfully', { document });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload a new PDF document resource
 */
const uploadDocument = async (req, res, next) => {
  try {
    const validation = validateDocumentUpload(req.body, req.file);
    if (!validation.isValid) {
      return sendError(res, 'Validation error', 400, validation.errors);
    }

    const { title, description, subject, semester, resourceType } = req.body;
    const file = req.file;

    // 1. Upload to Cloudinary or local disk fallback
    const { fileUrl, publicId } = await uploadPdfBuffer(
      file.buffer,
      file.originalname,
      file.mimetype
    );

    // 2. Create Document record in MongoDB with status UPLOADING
    const newDoc = await Document.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      subject: subject.trim(),
      semester: Number(semester),
      resourceType,
      fileUrl,
      cloudinaryPublicId: publicId,
      uploadedBy: req.user._id,
      processingStatus: PROCESSING_STATUS.UPLOADING,
      fileSize: file.size
    });

    // 3. Kick off async PDF processing in background
    setImmediate(() => {
      documentService
        .processDocument(newDoc._id, file.buffer)
        .catch((err) => {
          logger.error(`Background processing error for doc ${newDoc._id}: ${err.message}`);
        });
    });

    return sendSuccess(
      res,
      'Document uploaded successfully. Background processing started.',
      { document: newDoc },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update document metadata
 */
const updateDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validation = validateDocumentUpdate(req.body);
    if (!validation.isValid) {
      return sendError(res, 'Validation error', 400, validation.errors);
    }

    const updated = await documentService.updateDocument(id, req.user._id, req.body);
    return sendSuccess(res, 'Document updated successfully', { document: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete document and all associated assets
 */
const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    await documentService.deleteDocument(id, req.user._id);
    return sendSuccess(res, 'Document and associated vector data deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get distinct subject list
 */
const getDistinctSubjects = async (req, res, next) => {
  try {
    const subjects = await documentService.getDistinctSubjects();
    return sendSuccess(res, 'Subjects list retrieved', { subjects });
  } catch (error) {
    next(error);
  }
};

/**
 * Get system statistics
 */
const getSystemStats = async (req, res, next) => {
  try {
    const stats = await documentService.getSystemStats();
    return sendSuccess(res, 'System statistics retrieved', { stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDocuments,
  getDocumentById,
  uploadDocument,
  updateDocument,
  deleteDocument,
  getDistinctSubjects,
  getSystemStats
};
