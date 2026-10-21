const mongoose = require('mongoose');

const documentChunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true
    },
    chunkText: {
      type: String,
      required: true,
      trim: true
    },
    pageNumber: {
      type: Number,
      required: true
    },
    chunkIndex: {
      type: Number,
      required: true
    },
    embedding: {
      type: [Number],
      required: true,
      default: []
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

// Compound indexes for fast document-scoped lookups
documentChunkSchema.index({ documentId: 1, chunkIndex: 1 });
documentChunkSchema.index({ documentId: 1, pageNumber: 1 });

const DocumentChunk = mongoose.model('DocumentChunk', documentChunkSchema);

module.exports = DocumentChunk;
