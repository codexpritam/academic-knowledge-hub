const Document = require('../models/Document');
const DocumentChunk = require('../models/DocumentChunk');

const {
  generateQueryEmbedding
} = require('../services/embeddingService');

const {
  searchRelevantChunks
} = require('../services/vectorSearchService');

const {
  generateAnswer
} = require('../services/ragService');

const {
  validateAskQuestion
} = require('../validators/aiValidator');

const {
  sendSuccess,
  sendError
} = require('../utils/apiResponse');

const {
  PROCESSING_STATUS
} = require('../utils/constants');

const logger = require('../utils/logger');

/**
 * Detect an explicitly requested PDF page.
 *
 * Examples:
 * Explain page 10
 * Give information of page number 10
 * Summarize page no. 10
 * Explain p. 10
 * पेज 10 समझाओ
 */
const extractRequestedPage = (question) => {
  const text = String(question || '').trim();

  const patterns = [
    /\bpage\s*(?:number|no\.?)?\s*(?:#|:|-)?\s*(\d{1,4})\b/i,
    /\bp\.?\s*(?:#|:|-)?\s*(\d{1,4})\b/i,
    /पेज\s*(?:नंबर|नं\.?)?\s*(?:#|:|-)?\s*(\d{1,4})/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      const page = Number(match[1]);

      if (
        Number.isSafeInteger(page) &&
        page >= 1
      ) {
        return page;
      }
    }
  }

  return null;
};

/**
 * Ask AI a question about a document.
 */
const askQuestion = async (req, res, next) => {
  try {
    const { id: documentId } = req.params;
    const { question } = req.body;

    // =====================================================
    // 1. Validate question
    // =====================================================

    const validation =
      validateAskQuestion(req.body);

    if (!validation.isValid) {
      return sendError(
        res,
        'Validation error',
        400,
        validation.errors
      );
    }

    // =====================================================
    // 2. Validate document
    // =====================================================

    const document =
      await Document.findById(documentId);

    if (!document) {
      return sendError(
        res,
        'Document not found',
        404
      );
    }

    if (
      document.processingStatus ===
        PROCESSING_STATUS.UPLOADING ||
      document.processingStatus ===
        PROCESSING_STATUS.PROCESSING
    ) {
      return sendError(
        res,
        'This document is still being processed. Please wait.',
        422
      );
    }

    if (
      document.processingStatus ===
      PROCESSING_STATUS.FAILED
    ) {
      return sendError(
        res,
        `Document processing failed: ${
          document.errorMessage ||
          'Unable to extract text'
        }`,
        422
      );
    }

    logger.info(
      `Received question for document ${documentId}: "${question}"`
    );

    let topChunks = [];

    // =====================================================
    // 3. Detect explicit page request
    // =====================================================

    const requestedPage =
      extractRequestedPage(question);

    if (requestedPage !== null) {
      logger.info(
        `Exact-page retrieval requested for PDF page ${requestedPage}.`
      );

      // Check PDF page range.
      if (
        document.pageCount > 0 &&
        requestedPage > document.pageCount
      ) {
        return sendSuccess(
          res,
          'Requested page does not exist',
          {
            answer:
              `This PDF contains ${document.pageCount} pages. ` +
              `Page ${requestedPage} is outside its page range.`,
            sources: []
          }
        );
      }

      // Get ALL chunks from the requested page.
      topChunks =
        await DocumentChunk.find({
          documentId: document._id,
          pageNumber: requestedPage
        })
          .select(
            '_id documentId chunkText pageNumber chunkIndex'
          )
          .sort({
            chunkIndex: 1
          })
          .lean();

      if (topChunks.length === 0) {
        const indexedPages =
          await DocumentChunk.distinct(
            'pageNumber',
            {
              documentId: document._id
            }
          );

        logger.warn(
          `No indexed chunks found for page ${requestedPage}. ` +
          `Available pages: ${indexedPages
            .sort((a, b) => a - b)
            .join(', ')}`
        );

        return sendSuccess(
          res,
          'No text indexed for the requested page',
          {
            answer:
              `I could not find extracted text indexed for PDF page ${requestedPage}. ` +
              'This page may be scanned/image-only, or the document may need reprocessing.',
            sources: []
          }
        );
      }

      logger.info(
        `Exact-page retrieval found ${topChunks.length} chunks from page ${requestedPage}.`
      );
    } else {
      // =====================================================
      // 4. Normal question:
      //    Search the ENTIRE document semantically.
      // =====================================================

      const queryEmbedding =
        await generateQueryEmbedding(
          question.trim()
        );

      topChunks =
        await searchRelevantChunks(
          queryEmbedding,
          documentId,
          12
        );

      logger.info(
        `Whole-document semantic retrieval returned ${topChunks.length} chunks.`
      );
    }

    // =====================================================
    // 5. Don't generate answer without context
    // =====================================================

    if (
      !Array.isArray(topChunks) ||
      topChunks.length === 0
    ) {
      return sendSuccess(
        res,
        'No relevant sections found',
        {
          answer:
            'I could not find enough relevant information in this document to answer confidently.',
          sources: []
        }
      );
    }

    // =====================================================
    // 6. Generate grounded answer
    // =====================================================

    const ragResponse =
      await generateAnswer(
        question,
        topChunks,
        documentId
      );

    return sendSuccess(
      res,
      'Answer generated successfully',
      ragResponse
    );
  } catch (error) {
    logger.error(
      `Error in askQuestion controller: ${error.message}`
    );

    next(error);
  }
};

module.exports = {
  askQuestion
};