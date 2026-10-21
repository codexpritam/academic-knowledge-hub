const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cloudinary = require('../config/cloudinary');
const config = require('../config');
const logger = require('../utils/logger');

// Ensure local uploads directory exists for fallback
const localUploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

/**
 * Uploads a file buffer either to Cloudinary or local disk fallback
 * @param {Buffer} fileBuffer 
 * @param {string} originalName 
 * @param {string} mimeType 
 * @returns {Promise<{ fileUrl: string, publicId: string }>}
 */
const uploadPdfBuffer = async (fileBuffer, originalName = 'document.pdf', mimeType = 'application/pdf') => {
  if (config.cloudinary.isConfigured) {
    try {
      return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            folder: 'academic_knowledge_hub',
            public_id: `doc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
          },
          (error, result) => {
            if (error) {
              logger.error(`Cloudinary upload failed: ${error.message}`);
              return reject(error);
            }
            resolve({
              fileUrl: result.secure_url,
              publicId: result.public_id
            });
          }
        );

        uploadStream.end(fileBuffer);
      });
    } catch (err) {
      logger.warn(`Cloudinary upload exception, falling back to local disk storage: ${err.message}`);
    }
  }

  // Local fallback storage
  const safeFilename = `doc_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.pdf`;
  const targetPath = path.join(localUploadsDir, safeFilename);
  fs.writeFileSync(targetPath, fileBuffer);

  const localFileUrl = `/uploads/${safeFilename}`;
  logger.info(`Saved file to local storage fallback: ${localFileUrl}`);

  return {
    fileUrl: localFileUrl,
    publicId: safeFilename
  };
};

/**
 * Deletes an uploaded asset from Cloudinary or local disk
 * @param {string} publicId 
 * @param {string} fileUrl 
 */
const deletePdfAsset = async (publicId, fileUrl) => {
  if (!publicId && !fileUrl) return;

  if (config.cloudinary.isConfigured && publicId && !publicId.endsWith('.pdf')) {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      logger.info(`Deleted asset from Cloudinary: ${publicId}`);
      return;
    } catch (err) {
      logger.warn(`Error deleting asset from Cloudinary: ${err.message}`);
    }
  }

  // Local file cleanup
  try {
    const filename = publicId || (fileUrl ? path.basename(fileUrl) : null);
    if (filename) {
      const localPath = path.join(localUploadsDir, filename);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        logger.info(`Deleted local file: ${localPath}`);
      }
    }
  } catch (err) {
    logger.warn(`Error deleting local file: ${err.message}`);
  }
};

module.exports = {
  uploadPdfBuffer,
  deletePdfAsset
};
