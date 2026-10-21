const mongoose = require('mongoose');

const Document = require('../models/Document');
const DocumentChunk = require('../models/DocumentChunk');

const {
  PROCESSING_STATUS,
  VECTOR_DIMENSIONS
} = require('../utils/constants');

const {
  extractPdfText,
  chunkDocument
} = require('./pdfService');

const {
  generateBatchEmbeddings
} = require('./embeddingService');

const {
  deletePdfAsset
} = require('./cloudinaryService');

const logger = require('../utils/logger');

/**
 * Stores chunks and their embeddings in MongoDB.
 */
const storeDocumentChunks = async (
  documentId,
  chunks,
  embeddings
) => {
  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    throw new Error(
      'Invalid document ID while saving chunks.'
    );
  }

  if (
    !Array.isArray(chunks) ||
    chunks.length === 0
  ) {
    throw new Error(
      'No document chunks are available to store.'
    );
  }

  if (
    !Array.isArray(embeddings) ||
    embeddings.length !== chunks.length
  ) {
    throw new Error(
      `Cannot store chunks: ${chunks.length} chunks ` +
      `but ${embeddings?.length || 0} embeddings.`
    );
  }

  const objectId =
    new mongoose.Types.ObjectId(documentId);

  const chunkDocs = chunks.map((chunk, index) => {
    const text =
      typeof chunk?.chunkText === 'string'
        ? chunk.chunkText.trim()
        : '';

    const embedding = embeddings[index];

    if (!text) {
      throw new Error(
        `Chunk ${index + 1} has no text.`
      );
    }

    if (
      !Array.isArray(embedding) ||
      embedding.length !== VECTOR_DIMENSIONS ||
      !embedding.every(Number.isFinite) ||
      embedding.every((value) => value === 0)
    ) {
      throw new Error(
        `Chunk ${index + 1} has an invalid embedding; ` +
        `expected ${VECTOR_DIMENSIONS} non-zero finite values.`
      );
    }

    return {
      documentId: objectId,
      chunkText: text,
      pageNumber: Number(chunk.pageNumber) || 1,

      chunkIndex: Number.isInteger(chunk.chunkIndex)
        ? chunk.chunkIndex
        : index,

      embedding
    };
  });

  await DocumentChunk.insertMany(
    chunkDocs,
    { ordered: true }
  );

  return chunkDocs.length;
};

/**
 * PDF -> text -> chunks -> embeddings -> MongoDB.
 */
const processDocument = async (
  documentId,
  fileBuffer
) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      throw new Error(
        'Invalid document ID while processing PDF.'
      );
    }

    if (
      !Buffer.isBuffer(fileBuffer) ||
      fileBuffer.length === 0
    ) {
      throw new Error(
        'The uploaded PDF is empty or unavailable to the processor.'
      );
    }

    logger.info(
      `Starting PDF processing for document: ${documentId}`
    );

    const processingDocument =
      await Document.findByIdAndUpdate(
        documentId,
        {
          processingStatus: PROCESSING_STATUS.PROCESSING,
          errorMessage: ''
        },
        { new: true }
      );

    if (!processingDocument) {
      throw new Error(
        'Document not found; cannot process the PDF.'
      );
    }

    // 1. Extract PDF text.
    const {
      pages,
      pageCount
    } = await extractPdfText(fileBuffer);

    if (
      !Array.isArray(pages) ||
      pages.length === 0
    ) {
      throw new Error(
        'No readable text could be extracted from this PDF. ' +
        'Scanned/image-only PDFs need OCR.'
      );
    }

    // 2. Create chunks.
    const chunks = chunkDocument(pages);

    if (
      !Array.isArray(chunks) ||
      chunks.length === 0
    ) {
      throw new Error(
        'No readable text chunks were created from this PDF. ' +
        'Scanned/image-only PDFs may need OCR.'
      );
    }

    const chunkTexts = chunks.map(
      (chunk) => chunk.chunkText
    );

    logger.info(
      `Created ${chunks.length} chunks from ${pageCount} pages. ` +
      'Generating embeddings...'
    );

    // 3. Generate Gemini embeddings.
    const embeddings =
      await generateBatchEmbeddings(chunkTexts);

    if (
      !Array.isArray(embeddings) ||
      embeddings.length !== chunks.length
    ) {
      throw new Error(
        `Embedding count mismatch. Chunks: ${chunks.length}; ` +
        `embeddings: ${embeddings?.length || 0}.`
      );
    }

    // 4. Validate all embeddings before saving.
    for (
      let index = 0;
      index < embeddings.length;
      index += 1
    ) {
      const vector = embeddings[index];

      if (
        !Array.isArray(vector) ||
        vector.length !== VECTOR_DIMENSIONS ||
        !vector.every(Number.isFinite) ||
        vector.every((value) => value === 0)
      ) {
        throw new Error(
          `Invalid Gemini embedding for chunk ${index + 1}.`
        );
      }
    }

    // 5. Replace old chunks after generating embeddings.
    const objectId =
      new mongoose.Types.ObjectId(documentId);

    await DocumentChunk.deleteMany({
      documentId: objectId
    });

    const storedCount = await storeDocumentChunks(
      documentId,
      chunks,
      embeddings
    );

    // 6. READY only after successful storage.
    const updatedDocument =
      await Document.findByIdAndUpdate(
        documentId,
        {
          pageCount,
          processingStatus: PROCESSING_STATUS.READY,
          errorMessage: ''
        },
        { new: true }
      );

    if (!updatedDocument) {
      throw new Error(
        'Document record was deleted before processing finished.'
      );
    }

    logger.success(
      `Document ${documentId} is READY: ` +
      `${pageCount} pages, ${storedCount} chunks.`
    );
  } catch (error) {
    logger.error(
      `Error processing document ${documentId}: ${error.message}`
    );

    try {
      await Document.findByIdAndUpdate(
        documentId,
        {
          processingStatus: PROCESSING_STATUS.FAILED,
          errorMessage:
            error.message || 'Failed to process document.'
        }
      );
    } catch (statusError) {
      logger.error(
        `Could not update failed status for document ` +
        `${documentId}: ${statusError.message}`
      );
    }
  }
};

/**
 * Query documents with search, filters, pagination and sorting.
 */
const getDocuments = async ({
  search = '',
  subject = '',
  semester = '',
  resourceType = '',
  sort = 'newest',
  page = 1,
  limit = 12
}) => {
  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } }
    ];
  }

  if (subject) {
    query.subject = {
      $regex: new RegExp(`^${subject}$`, 'i')
    };
  }

  if (semester) {
    query.semester = Number(semester);
  }

  if (resourceType) {
    query.resourceType = resourceType;
  }

  const sortOptions = {};

  if (sort === 'oldest') {
    sortOptions.createdAt = 1;
  } else {
    sortOptions.createdAt = -1;
  }

  const pageNum = Math.max(
    1,
    parseInt(page, 10) || 1
  );

  const limitNum = Math.max(
    1,
    Math.min(100, parseInt(limit, 10) || 12)
  );

  const skip = (pageNum - 1) * limitNum;

  const [documents, total] = await Promise.all([
    Document.find(query)
      .populate('uploadedBy', 'name email avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean(),

    Document.countDocuments(query)
  ]);

  return {
    documents,

    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    }
  };
};

/**
 * Get a single document by ID.
 */
const getDocumentById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  return Document.findById(id)
    .populate('uploadedBy', 'name email avatar')
    .lean();
};

/**
 * Update allowed document metadata.
 */
const updateDocument = async (
  id,
  userId,
  updateData
) => {
  const document = await Document.findById(id);

  if (!document) {
    const error = new Error('Document not found');
    error.statusCode = 404;
    throw error;
  }

  if (
    document.uploadedBy.toString() !== userId.toString()
  ) {
    const error = new Error(
      'You are not authorized to update this resource'
    );

    error.statusCode = 403;
    throw error;
  }

  const allowedFields = [
    'title',
    'description',
    'subject',
    'semester',
    'resourceType'
  ];

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      document[field] = updateData[field];
    }
  }

  await document.save();

  return document;
};

/**
 * Delete a document, its chunks, and its stored PDF asset.
 */
const deleteDocument = async (id, userId) => {
  const document = await Document.findById(id);

  if (!document) {
    const error = new Error('Document not found');
    error.statusCode = 404;
    throw error;
  }

  if (
    document.uploadedBy.toString() !== userId.toString()
  ) {
    const error = new Error(
      'You are not authorized to delete this resource'
    );

    error.statusCode = 403;
    throw error;
  }

  // Delete associated chunks.
  await DocumentChunk.deleteMany({
    documentId: document._id
  });

  // Delete the PDF asset.
  await deletePdfAsset(
    document.cloudinaryPublicId,
    document.fileUrl
  );

  // Delete the document record.
  await Document.findByIdAndDelete(id);

  logger.info(
    `Deleted document ${id} and all its chunks.`
  );

  return true;
};

/**
 * Get distinct subjects for filter dropdowns.
 */
const getDistinctSubjects = async () => {
  return Document.distinct('subject');
};

/**
 * Get system statistics.
 */
const getSystemStats = async () => {
  const [
    totalDocuments,
    totalChunks,
    subjects
  ] = await Promise.all([
    Document.countDocuments(),
    DocumentChunk.countDocuments(),
    Document.distinct('subject')
  ]);

  return {
    totalDocuments,
    totalChunks,
    totalSubjects: subjects.length
  };
};

module.exports = {
  processDocument,
  storeDocumentChunks,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDistinctSubjects,
  getSystemStats
};