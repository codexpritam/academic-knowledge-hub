const {
  getGeminiClient
} = require('../config/gemini');

const {
  GEMINI_MODELS
} = require('../utils/constants');

const logger = require('../utils/logger');

/**
 * Gemini generation models.
 *
 * The first configured model is tried first.
 * If it is temporarily unavailable, fallback models
 * are tried automatically.
 */
const GENERATION_MODELS = [
  GEMINI_MODELS.GENERATION,
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite'
].filter(
  (model, index, models) =>
    models.indexOf(model) === index
);

/**
 * Academic answer instructions.
 */
// const ACADEMIC_SYSTEM_INSTRUCTION = `
// You are an expert academic assistant for college students.

// Your task is to answer questions using the provided document context.

// The document can be:
// - a textbook
// - lecture notes
// - study material
// - research paper
// - assignment
// - technical documentation
// - any other academic PDF

// IMPORTANT GROUNDING RULE:

// Use the provided document context as the primary source.

// Do not invent facts, definitions, formulas, examples, conclusions,
// or page numbers that are not supported by the document.

// If the document does not contain enough information to answer the
// question confidently, clearly say that the information is not available
// in the provided document context.

// ANSWER STYLE:

// Write naturally and clearly, like a knowledgeable teacher explaining
// the topic to a college student.

// The answer should be systematic and easy to study.

// Do not make every answer extremely short.

// Do not make every answer unnecessarily long either.

// Choose the answer length according to the question.

// For a simple factual question:
// Give a concise but complete explanation.

// For a conceptual question:
// Give the definition, explanation, important points, and an example
// when useful.

// For "explain in detail":
// Give a thorough explanation using all relevant information available.

// For "what is":
// Start with a clear definition and then explain it.

// For "how":
// Explain the process step by step.

// For comparison questions:
// Explain both concepts and then compare their important differences.

// For advantages/disadvantages questions:
// Explain the important points with short explanations.

// For "summarize":
// Cover the important concepts from the available document context
// without repeating the same information.

// For page-specific questions:
// Use the requested page's content and explain it completely.

// FORMATTING:

// Use simple headings only when they improve readability.

// Use numbered points when explaining steps.

// Use simple bullet points when they genuinely help.

// Do not use excessive headings.

// Do not use nested lists unnecessarily.

// Do not use decorative Markdown.

// Do not use:
// **
// ***
// ###
// or similar decorative symbols.

// Do not mention internal technical details such as:
// - embeddings
// - vector search
// - chunks
// - retrieval pipeline
// - RAG
// - context window

// unless the student explicitly asks about the AI system itself.

// ACADEMIC QUALITY:

// The answer should be useful for:
// - understanding the concept
// - exam preparation
// - revision
// - assignments
// - technical interviews

// Explain technical terms in simple language.

// Where the document contains an example, use it when relevant.

// Do not repeat the same explanation in different words.

// PAGE CITATIONS:

// When page numbers are available in the provided context,
// mention them naturally.

// Never invent a page number.

// If multiple pages support an explanation, mention the relevant
// pages rather than incorrectly attributing everything to one page.
// `;

const ACADEMIC_SYSTEM_INSTRUCTION = `
You are an expert academic assistant for college students.

Your task is to answer questions using the provided document context.

The document can be:
- a textbook
- lecture notes
- study material
- research paper
- assignment
- technical documentation
- any other academic PDF

IMPORTANT GROUNDING RULE:

Use the provided document context as the primary source.

Do not invent facts, definitions, formulas, examples, conclusions, or page numbers that are not supported by the document.

If the document does not contain enough information to answer the question confidently, clearly say that the information is not available in the provided document context.

ANSWER STYLE:

Write naturally and clearly, like a knowledgeable teacher explaining the topic to a college student.

The answer should be systematic, readable, and easy to study.

Use simple English.

Adjust the answer length according to the question:
- Simple factual question: concise but complete.
- Conceptual question: explain the definition, main idea, important points, and example when useful.
- "Explain in detail": provide a thorough explanation.
- "What is": start with a clear definition and then explain it.
- "How": explain the process step by step.
- Comparison question: explain both concepts and then compare their differences.
- Advantages/disadvantages: explain the important points with short explanations.
- Summary question: cover the important concepts without unnecessary repetition.

FORMATTING RULES:

Use clean Markdown formatting.

Start the answer with a simple topic heading.

Use this general structure when it is suitable for the question:

Topic Name

Short introduction or definition.

### How it works

1. Step one.
2. Step two.
3. Step three.

### Important characteristics

- Important point.
- Important point.
- Important point.

### Example

Give a simple example when it helps understanding.

### Summary

Give a short conclusion when useful.

IMPORTANT:

Do not force every section for every question.

Use only the sections that make sense for the question.

Do not use excessive headings.

Do not use unnecessary nested lists.

Do not make every sentence bold.

Do not use bold formatting for every important word or technical term.

Use bold formatting only very rarely when it genuinely improves readability.

Prefer normal text.

Use ### headings for major subsections when they improve readability.

Do not use decorative symbols or excessive Markdown.

Do not repeat the same explanation in different words.

Do not start with phrases such as:
- "Sure!"
- "Of course!"
- "Here is..."
- "Let's understand..."
- "Certainly!"

Start directly with the answer.

ACADEMIC QUALITY:

The answer should be useful for:
- understanding the concept
- exam preparation
- revision
- assignments
- technical interviews

Explain technical terms in simple language.

Where the document contains an example, use it when relevant.

For technical concepts, explain both "why" and "how" when the document provides enough information.

For process questions, explain the steps in logical order.

For detailed questions, provide enough explanation to properly understand the topic.

For simple questions, remain concise.

PAGE CITATIONS:

When page numbers are available in the provided document context, mention them naturally.

Never invent a page number.

If multiple pages support an explanation, mention the relevant pages instead of incorrectly attributing everything to one page.

Do not mention internal technical details such as:
- embeddings
- vector search
- chunks
- retrieval pipeline
- RAG
- context window

unless the student explicitly asks about the AI system itself.

FINAL RULE:

The answer should feel like a clean academic explanation written for a college student.

Prioritize clarity over decorative formatting.
`;

/**
 * Sleep helper.
 */
const sleep = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );

/**
 * Extract HTTP status code from Gemini error.
 */
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
      Number.isInteger(code) &&
      code >= 100 &&
      code <= 599
    ) {
      return code;
    }
  }

  const message =
    String(error?.message || '');

  const match =
    message.match(
      /"(?:code|status)"\s*:\s*(\d{3})/
    );

  if (match) {
    return Number(match[1]);
  }

  return null;
};

/**
 * Determine whether an error is temporary.
 */
const isTemporaryError = (error) => {
  const status =
    getStatusCode(error);

  const message =
    String(
      error?.message || ''
    ).toLowerCase();

  return (
    [408, 429, 500, 502, 503, 504].includes(
      status
    ) ||
    message.includes(
      'high demand'
    ) ||
    message.includes(
      'temporarily unavailable'
    ) ||
    message.includes(
      'service unavailable'
    ) ||
    message.includes(
      'unavailable'
    )
  );
};

/**
 * Determine whether configured model is unavailable.
 */
const isModelUnavailable = (error) => {
  const status =
    getStatusCode(error);

  const message =
    String(
      error?.message || ''
    ).toLowerCase();

  return (
    status === 404 ||
    message.includes(
      'model not found'
    ) ||
    message.includes(
      'unknown model'
    ) ||
    message.includes(
      'not supported'
    )
  );
};

/**
 * Convert Gemini error into user-friendly error.
 */
const getUserErrorMessage = (error) => {
  const status =
    getStatusCode(error);

  const rawMessage =
    String(
      error?.message ||
        'Unknown Gemini error'
    );

  const lowerMessage =
    rawMessage.toLowerCase();

  if (
    status === 401 ||
    status === 403 ||
    lowerMessage.includes(
      'api key'
    )
  ) {
    return (
      'Gemini API authentication failed. ' +
      'Check your API key and permissions.'
    );
  }

  if (
    status === 429 ||
    lowerMessage.includes(
      'resource_exhausted'
    ) ||
    lowerMessage.includes(
      'quota'
    )
  ) {
    return (
      'Gemini API quota or rate limit reached. ' +
      'Check your API quota and try again later.'
    );
  }

  if (
    isTemporaryError(error)
  ) {
    return (
      'Gemini is temporarily unavailable. ' +
      'All configured models failed. Please try again shortly.'
    );
  }

  return rawMessage;
};

/**
 * Build document context for Gemini.
 *
 * Chunks are sorted by page and chunk index
 * so Gemini receives logically ordered information.
 */
const buildContext = (chunks) => {
  if (
    !Array.isArray(chunks) ||
    chunks.length === 0
  ) {
    return (
      'No relevant document content was retrieved.'
    );
  }

  const sortedChunks =
    [...chunks].sort((a, b) => {
      const pageA =
        Number(a.pageNumber) || 0;

      const pageB =
        Number(b.pageNumber) || 0;

      if (pageA !== pageB) {
        return pageA - pageB;
      }

      return (
        (Number(a.chunkIndex) || 0) -
        (Number(b.chunkIndex) || 0)
      );
    });

  return sortedChunks
    .map((chunk, index) => {
      return [
        `--- DOCUMENT SECTION ${index + 1} ---`,
        `Page: ${chunk.pageNumber ?? 'unknown'}`,
        `Section: ${chunk.chunkIndex ?? 'unknown'}`,
        '',
        chunk.chunkText || '',
        `--- END DOCUMENT SECTION ${index + 1} ---`
      ].join('\n');
    })
    .join('\n\n');
};

/**
 * Generate a grounded academic answer.
 */
const generateAnswer = async (
  question,
  chunks,
  documentId
) => {
  const genAI =
    getGeminiClient();

  if (!genAI) {
    throw new Error(
      'Gemini API client is unavailable. Check GEMINI_API_KEY.'
    );
  }

  if (
    typeof question !== 'string' ||
    !question.trim()
  ) {
    throw new Error(
      'Question cannot be empty.'
    );
  }

  if (
    !Array.isArray(chunks) ||
    chunks.length === 0
  ) {
    return {
      answer:
        'I could not find relevant information in this document.',
      sources: []
    };
  }

  const documentContext =
    buildContext(chunks);

  const prompt = `
DOCUMENT CONTENT:

${documentContext}

STUDENT QUESTION:

${question.trim()}

TASK:

Answer the student's question using the document content above.

Before writing the answer, consider ALL provided document sections,
not only the first section.

If the information needed to answer the question is spread across
multiple pages, combine those sections into one coherent explanation.

Do not assume that the first page or first retrieved section is the
only relevant information.

ANSWER REQUIREMENTS:

Start directly with the answer.

Use simple English.

Make the explanation clear enough for a college student to understand.

For conceptual questions, use a structured academic format when appropriate.

Prefer this order:

Topic heading

Short introduction or definition.

### Explanation

Explain the concept clearly.

### Important points

List the important characteristics, properties, formulas, or facts.

### Example

Give an example when useful.

### Summary

Give a short conclusion when useful.

Do not force sections that are not relevant to the question.

For technical concepts, explain the "why" and "how" when the document
provides enough information.

For comparison questions, clearly explain the differences.

For process questions, explain the steps in logical order.

For detailed questions, provide a thorough answer instead of reducing
the response to only 2-3 sentences.

For simple questions, remain concise.

Use only information supported by the document.

If the document does not contain enough information, say that clearly.

PAGE REFERENCES:

Use page numbers from the document sections when they support the answer.

Do not invent page numbers.

Do not mention internal retrieval terminology.
`;

  let lastError = null;
  let answer = null;
  let successfulModel = null;

  // =========================================================
  // Try configured models
  // =========================================================

  for (
    const model of GENERATION_MODELS
  ) {
    let modelFinished = false;

    // Two attempts per model.
    for (
      let attempt = 1;
      attempt <= 2;
      attempt += 1
    ) {
      try {
        logger.info(
          `Gemini model ${model}: attempt ${attempt}/2`
        );

        const result =
          await genAI.models.generateContent({
            model,

            contents: prompt,

            config: {
              systemInstruction:
                ACADEMIC_SYSTEM_INSTRUCTION,

              temperature: 0.2
            }
          });

        const responseText =
          result?.text?.trim();

        if (!responseText) {
          throw new Error(
            `Gemini model ${model} returned an empty response.`
          );
        }

        answer = responseText;
        successfulModel = model;
        modelFinished = true;

        break;
      } catch (error) {
        lastError = error;

        const status =
          getStatusCode(error);

        logger.warn(
          `Gemini ${model} failed` +
            `${
              status
                ? ` (HTTP ${status})`
                : ''
            }: ${error.message}`
        );

        // Non-temporary error.
        if (
          !isTemporaryError(error) &&
          !isModelUnavailable(error)
        ) {
          throw new Error(
            getUserErrorMessage(error)
          );
        }

        // Model unavailable.
        if (
          isModelUnavailable(error)
        ) {
          break;
        }

        // Retry temporary error.
        if (
          attempt < 2
        ) {
          const delay =
            1500 *
              (2 ** (attempt - 1)) +
            Math.floor(
              Math.random() * 500
            );

          logger.warn(
            `Retrying ${model} after ${delay}ms`
          );

          await sleep(delay);
        }
      }
    }

    if (answer) {
      break;
    }

    if (!modelFinished) {
      logger.warn(
        `Moving to next Gemini model after failure of ${model}.`
      );
    }
  }

  // =========================================================
  // All models failed
  // =========================================================

  if (!answer) {
    const error =
      new Error(
        getUserErrorMessage(
          lastError ||
            new Error(
              'No model returned an answer'
            )
        )
      );

    error.statusCode =
      getStatusCode(
        lastError
      ) || 503;

    logger.error(
      `All Gemini models failed: ${error.message}`
    );

    throw error;
  }

  // =========================================================
  // Build page citations
  // =========================================================

  const pageNumbers = [
    ...new Set(
      chunks
        .map(
          (chunk) =>
            chunk.pageNumber
        )
        .filter(
          (page) =>
            page !== undefined &&
            page !== null
        )
    )
  ].sort(
    (a, b) => a - b
  );

  const sources =
    pageNumbers.map(
      (pageNumber) => ({
        documentId,
        pageNumber
      })
    );

  logger.success(
    `Answer generated successfully with ${successfulModel}.`
  );

  return {
    answer,
    sources
  };
};

module.exports = {
  generateAnswer,
  buildContext,
  ACADEMIC_SYSTEM_INSTRUCTION
};