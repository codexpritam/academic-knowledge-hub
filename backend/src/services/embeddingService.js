const { getGeminiClient } = require('../config/gemini');

const {
  GEMINI_MODELS,
  VECTOR_DIMENSIONS
} = require('../utils/constants');

const logger = require('../utils/logger');

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getStatusCode = (error) => {
  const candidates = [
    error?.status,
    error?.statusCode,
    error?.response?.status,
    error?.error?.code
  ];

  for (const value of candidates) {
    const code = Number(value);

    if (
      Number.isFinite(code) &&
      code >= 100 &&
      code <= 599
    ) {
      return code;
    }
  }

  const match = String(error?.message || '')
    .match(/\b(500|502|503|504)\b/);

  return match ? Number(match[1]) : null;
};

const isRetryable = (error) => {
  const status = getStatusCode(error);

  const message = String(
    error?.message || ''
  ).toLowerCase();

  return (
    [500, 502, 503, 504].includes(status) ||
    message.includes('temporarily unavailable') ||
    message.includes('high demand') ||
    message.includes('service unavailable') ||
    message.includes('unavailable')
  );
};

const safeErrorMessage = (error) => {
  const status = getStatusCode(error);

  const message = String(
    error?.message || 'Unknown Gemini API error'
  );

  const lower = message.toLowerCase();

  if (
    status === 429 ||
    lower.includes('resource_exhausted') ||
    lower.includes('quota')
  ) {
    return (
      'Gemini embedding quota/rate limit reached. ' +
      'Wait and try again, or check the quota for this ' +
      'API key in Google AI Studio.'
    );
  }

  if (
    status === 401 ||
    status === 403 ||
    /api key|permission denied|unauthorized/i.test(message)
  ) {
    return (
      'Gemini embedding request was rejected. ' +
      'Check GEMINI_API_KEY and the API key permissions.'
    );
  }

  if (
    status === 404 ||
    /not found|not supported for generatecontent|unknown model/i
      .test(message)
  ) {
    return (
      `The configured Gemini embedding model ` +
      `(${GEMINI_MODELS.EMBEDDING}) is not available ` +
      'to this API key. Check the model list for this key.'
    );
  }

  if (isRetryable(error)) {
    return (
      'Gemini embedding service is temporarily unavailable ' +
      `after retries. Details: ${message}`
    );
  }

  return message;
};

/**
 * Generate one embedding.
 *
 * RETRIEVAL_DOCUMENT is used for document text.
 * RETRIEVAL_QUERY is used for user questions.
 */
const generateEmbedding = async (
  text,
  taskType = 'RETRIEVAL_DOCUMENT'
) => {
  const genAI = getGeminiClient();

  if (!genAI) {
    throw new Error(
      'Gemini API is not configured. Add GEMINI_API_KEY ' +
      'to backend/.env and restart the backend.'
    );
  }

  if (
    typeof text !== 'string' ||
    !text.trim()
  ) {
    throw new Error(
      'Cannot generate an embedding for empty text.'
    );
  }

  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const result = await genAI.models.embedContent({
        model: GEMINI_MODELS.EMBEDDING,

        contents: text.trim(),

        config: {
          taskType,
          outputDimensionality: VECTOR_DIMENSIONS
        }
      });

      const values =
        result?.embeddings?.[0]?.values;

      if (
        !Array.isArray(values) ||
        values.length !== VECTOR_DIMENSIONS
      ) {
        throw new Error(
          `Gemini returned an invalid embedding. ` +
          `Expected ${VECTOR_DIMENSIONS} dimensions, ` +
          `received ${
            Array.isArray(values)
              ? values.length
              : 'no vector'
          }.`
        );
      }

      if (
        !values.every(Number.isFinite) ||
        values.every((value) => value === 0)
      ) {
        throw new Error(
          'Gemini returned an invalid or all-zero embedding vector.'
        );
      }

      return values;
    } catch (error) {
      lastError = error;

      logger.warn(
        `Embedding request attempt ${attempt}/3 failed: ` +
        error.message
      );

      if (
        !isRetryable(error) ||
        attempt === 3
      ) {
        break;
      }

      const delay = 1500 * (2 ** (attempt - 1));

      logger.warn(
        `Retrying Gemini embedding in ${delay}ms.`
      );

      await sleep(delay);
    }
  }

  const message = safeErrorMessage(lastError);

  logger.error(
    `Embedding generation failed: ${message}`
  );

  throw new Error(message);
};

/**
 * Generate an embedding for a user question.
 */
const generateQueryEmbedding = async (query) => {
  return generateEmbedding(
    query,
    'RETRIEVAL_QUERY'
  );
};

/**
 * Generate document embeddings sequentially
 * to reduce sudden API request spikes.
 */
const generateBatchEmbeddings = async (textList) => {
  if (
    !Array.isArray(textList) ||
    textList.length === 0
  ) {
    return [];
  }

  const embeddings = [];

  for (
    let index = 0;
    index < textList.length;
    index += 1
  ) {
    logger.info(
      `Generating embedding ${index + 1}/${textList.length}`
    );

    const embedding = await generateEmbedding(
      textList[index],
      'RETRIEVAL_DOCUMENT'
    );

    embeddings.push(embedding);

    if (index + 1 < textList.length) {
      await sleep(250);
    }
  }

  return embeddings;
};

module.exports = {
  generateEmbedding,
  generateQueryEmbedding,
  generateBatchEmbeddings
};