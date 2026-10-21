const mongoose = require('mongoose');
const { PROCESSING_STATUS, RESOURCE_TYPES } = require('../utils/constants');

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a document title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: ''
    },
    subject: {
      type: String,
      required: [true, 'Please specify the academic subject'],
      trim: true,
      maxlength: [100, 'Subject cannot exceed 100 characters']
    },
    semester: {
      type: Number,
      required: [true, 'Please specify the semester (1-8)'],
      min: [1, 'Semester must be between 1 and 8'],
      max: [8, 'Semester must be between 1 and 8']
    },
    resourceType: {
      type: String,
      required: [true, 'Please select a resource type'],
      enum: Object.values(RESOURCE_TYPES),
      default: RESOURCE_TYPES.NOTES
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required']
    },
    cloudinaryPublicId: {
      type: String,
      default: ''
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    processingStatus: {
      type: String,
      enum: Object.values(PROCESSING_STATUS),
      default: PROCESSING_STATUS.UPLOADING,
      index: true
    },
    pageCount: {
      type: Number,
      default: 0
    },
    fileSize: {
      type: Number,
      default: 0
    },
    errorMessage: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound and text indexes for fast search and filter queries
documentSchema.index({ title: 'text', description: 'text', subject: 'text' });
documentSchema.index({ subject: 1, semester: 1, resourceType: 1 });
documentSchema.index({ createdAt: -1 });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
