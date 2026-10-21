const mongoose = require('mongoose');
const DocumentChunk = require('../models/DocumentChunk');

const {
  VECTOR_INDEX_NAME,
  VECTOR_DIMENSIONS
} = require('../utils/constants');

const logger = require('../utils/logger');

/**
 * Calculate cosine similarity between two vectors.
 */
const calculateCosineSimilarity = (vecA, vecB) => {
  if (
    !Array.isArray(vecA) ||
    !Array.isArray(vecB) ||
    vecA.length === 0 ||
    vecB.length === 0
  ) {
    return 0;
  }

  if (vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i += 1) {
    const a = Number(vecA[i]) || 0;
    const b = Number(vecB[i]) || 0;

    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  const denominator =
    Math.sqrt(normA) * Math.sqrt(normB);

  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
};

/**
 * Remove duplicate chunks.
 */
const removeDuplicateChunks = (chunks) => {
  const seen = new Set();

  return chunks.filter((chunk) => {
    const key = String(chunk._id);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

/**
 * Select relevant chunks while maintaining page diversity.
 *
 * We don't want all retrieved chunks to come
 * from the same page.
 */
const diversifyByPage = (chunks, maxChunks = 12) => {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    return [];
  }

  const result = [];
  const pageCount = new Map();

  // First pass:
  // Prefer one strong chunk from each page.
  for (const chunk of chunks) {
    const page = chunk.pageNumber ?? 'unknown';

    if (!pageCount.has(page)) {
      result.push(chunk);
      pageCount.set(page, 1);
    }

    if (result.length >= maxChunks) {
      break;
    }
  }

  // Second pass:
  // Allow a second chunk from a page.
  if (result.length < maxChunks) {
    for (const chunk of chunks) {
      if (result.length >= maxChunks) {
        break;
      }

      if (result.includes(chunk)) {
        continue;
      }

      const page = chunk.pageNumber ?? 'unknown';
      const count = pageCount.get(page) || 0;

      if (count < 2) {
        result.push(chunk);
        pageCount.set(page, count + 1);
      }
    }
  }

  // Third pass:
  // Fill remaining slots with highest-scoring chunks.
  if (result.length < maxChunks) {
    for (const chunk of chunks) {
      if (result.length >= maxChunks) {
        break;
      }

      if (!result.includes(chunk)) {
        result.push(chunk);
      }
    }
  }

  return result;
};

/**
 * Expand retrieved chunks with neighboring chunks.
 *
 * Example:
 * If chunk 5 is relevant, also retrieve chunk 4 and 6.
 * This gives Gemini enough surrounding context to explain
 * the concept completely.
 */
const expandChunkContext = async (
  chunks,
  documentId
) => {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    return [];
  }

  const conditions = [];

  for (const chunk of chunks) {
    if (
      chunk.pageNumber == null ||
      chunk.chunkIndex == null
    ) {
      continue;
    }

    conditions.push({
      pageNumber: chunk.pageNumber,
      chunkIndex: {
        $in: [
          Math.max(0, chunk.chunkIndex - 1),
          chunk.chunkIndex,
          chunk.chunkIndex + 1
        ]
      }
    });
  }

  if (conditions.length === 0) {
    return chunks;
  }

  const expanded =
    await DocumentChunk.find({
      documentId: new mongoose.Types.ObjectId(documentId),
      $or: conditions
    })
      .select(
        '_id documentId chunkText pageNumber chunkIndex'
      )
      .sort({
        pageNumber: 1,
        chunkIndex: 1
      })
      .lean();

  return removeDuplicateChunks([
    ...chunks,
    ...expanded
  ]);
};

/**
 * Search relevant chunks from the entire document.
 *
 * Strategy:
 *
 * 1. Atlas Vector Search
 * 2. Retrieve more candidates
 * 3. Diversify pages
 * 4. Expand neighboring chunks
 *
 * If Atlas Vector Search is unavailable:
 *
 * 5. Search every chunk using cosine similarity
 * 6. Diversify pages
 * 7. Expand neighboring chunks
 */
const searchRelevantChunks = async (
  queryEmbedding,
  documentId,
  topK = 12
) => {
  if (
    !Array.isArray(queryEmbedding) ||
    queryEmbedding.length !== VECTOR_DIMENSIONS
  ) {
    throw new Error(
      `Invalid query embedding. Expected ${VECTOR_DIMENSIONS} dimensions.`
    );
  }

  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    throw new Error('Invalid document ID');
  }

  const docObjectId =
    new mongoose.Types.ObjectId(documentId);

  // =========================================================
  // 1. MongoDB Atlas Vector Search
  // =========================================================

  try {
    const candidateLimit = Math.max(
      40,
      topK * 4
    );

    const atlasPipeline = [
      {
        $vectorSearch: {
          index: VECTOR_INDEX_NAME,
          path: 'embedding',
          queryVector: queryEmbedding,

          numCandidates: Math.max(
            200,
            candidateLimit * 10
          ),

          limit: candidateLimit,

          filter: {
            documentId: docObjectId
          }
        }
      },

      {
        $project: {
          _id: 1,
          documentId: 1,
          chunkText: 1,
          pageNumber: 1,
          chunkIndex: 1,

          score: {
            $meta: 'vectorSearchScore'
          }
        }
      }
    ];

    const atlasResults =
      await DocumentChunk.aggregate(
        atlasPipeline
      );

    if (
      Array.isArray(atlasResults) &&
      atlasResults.length > 0
    ) {
      logger.info(
        `Atlas Vector Search returned ${atlasResults.length} candidate chunks`
      );

      const diverseChunks =
        diversifyByPage(
          atlasResults,
          topK
        );

      const expandedChunks =
        await expandChunkContext(
          diverseChunks,
          documentId
        );

      logger.info(
        `Final Atlas retrieval context: ${expandedChunks.length} chunks`
      );

      return expandedChunks;
    }

    logger.warn(
      'Atlas Vector Search returned no results. Using cosine fallback.'
    );
  } catch (error) {
    logger.warn(
      `Atlas Vector Search failed: ${error.message}`
    );

    logger.warn(
      'Falling back to cosine similarity.'
    );
  }

  // =========================================================
  // 2. Cosine similarity fallback
  // =========================================================

  try {
    const docChunks =
      await DocumentChunk.find({
        documentId: docObjectId
      })
        .select(
          '_id documentId chunkText pageNumber chunkIndex embedding'
        )
        .lean();

    if (
      !docChunks ||
      docChunks.length === 0
    ) {
      logger.warn(
        `No chunks found for document ${documentId}`
      );

      return [];
    }

    const validChunks =
      docChunks.filter(
        (chunk) =>
          Array.isArray(chunk.embedding) &&
          chunk.embedding.length ===
            VECTOR_DIMENSIONS
      );

    if (validChunks.length === 0) {
      throw new Error(
        'No valid embeddings found for this document'
      );
    }

    /*
     * IMPORTANT:
     * Compare the question against EVERY chunk
     * belonging to this document.
     */
    const scoredChunks =
      validChunks.map((chunk) => ({
        _id: chunk._id,
        documentId: chunk.documentId,
        chunkText: chunk.chunkText,
        pageNumber: chunk.pageNumber,
        chunkIndex: chunk.chunkIndex,

        score:
          calculateCosineSimilarity(
            queryEmbedding,
            chunk.embedding
          )
      }));

    scoredChunks.sort(
      (a, b) => b.score - a.score
    );

    /*
     * Don't immediately take only 5 chunks.
     * First create a larger candidate pool.
     */
    const candidates =
      scoredChunks.slice(
        0,
        Math.max(40, topK * 4)
      );

    /*
     * Prefer relevant information from
     * different pages.
     */
    const diverseChunks =
      diversifyByPage(
        candidates,
        topK
      );

    /*
     * Add neighboring chunks so that a definition,
     * explanation and example are not separated.
     */
    const expandedChunks =
      await expandChunkContext(
        diverseChunks,
        documentId
      );

    logger.info(
      `Cosine fallback searched ${validChunks.length} chunks`
    );

    logger.info(
      `Cosine fallback selected ${diverseChunks.length} relevant chunks`
    );

    logger.info(
      `Cosine fallback expanded context to ${expandedChunks.length} chunks`
    );

    return expandedChunks;
  } catch (error) {
    logger.error(
      `Vector retrieval failed: ${error.message}`
    );

    throw new Error(
      `Failed to retrieve relevant document chunks: ${error.message}`
    );
  }
};

module.exports = {
  searchRelevantChunks,
  calculateCosineSimilarity
};