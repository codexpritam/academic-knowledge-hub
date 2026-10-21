const config = require('../src/config');

const {
  getGeminiClient
} = require('../src/config/gemini');

const {
  GEMINI_MODELS,
  VECTOR_DIMENSIONS
} = require('../src/utils/constants');

const main = async () => {
  if (!config.geminiApiKey) {
    console.error(
      'FAIL: GEMINI_API_KEY is missing. Check backend/.env.'
    );

    process.exitCode = 1;
    return;
  }

  const ai = getGeminiClient();

  if (!ai) {
    console.error(
      'FAIL: Gemini client could not initialize. ' +
      'Check the backend startup logs.'
    );

    process.exitCode = 1;
    return;
  }

  let generationOk = false;
  let embeddingOk = false;

  // Test 1: Text generation.
  console.log(
    `Testing generation model: ${GEMINI_MODELS.GENERATION}`
  );

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODELS.GENERATION,

      contents:
        'Reply with exactly: GEMINI_GENERATION_OK',

      config: {
        thinkingConfig: {
          thinkingLevel: 'low'
        }
      }
    });

    const text = response?.text?.trim();

    if (!text) {
      throw new Error(
        'Gemini returned an empty text response.'
      );
    }

    console.log(
      'PASS: generation request worked. Response:',
      text
    );

    generationOk = true;
  } catch (error) {
    console.error(
      'FAIL: generation request:',
      error?.message || error
    );
  }

  // Test 2: Embeddings.
  console.log(
    `Testing embedding model: ${GEMINI_MODELS.EMBEDDING}`
  );

  try {
    const response = await ai.models.embedContent({
      model: GEMINI_MODELS.EMBEDDING,

      contents:
        'Academic knowledge hub embedding test',

      config: {
        taskType: 'RETRIEVAL_QUERY',
        outputDimensionality: VECTOR_DIMENSIONS
      }
    });

    const vector =
      response?.embeddings?.[0]?.values;

    if (
      !Array.isArray(vector) ||
      vector.length !== VECTOR_DIMENSIONS
    ) {
      throw new Error(
        `Expected ${VECTOR_DIMENSIONS} embedding dimensions; ` +
        `received ${
          Array.isArray(vector)
            ? vector.length
            : 'no vector'
        }.`
      );
    }

    console.log(
      `PASS: embedding request worked (${vector.length} dimensions).`
    );

    embeddingOk = true;
  } catch (error) {
    console.error(
      'FAIL: embedding request:',
      error?.message || error
    );
  }

  if (!generationOk || !embeddingOk) {
    console.error(
      'Gemini self-test failed. Use the exact API error above ' +
      'to distinguish model access, quota, or temporary service problems.'
    );

    process.exitCode = 1;
    return;
  }

  console.log(
    'PASS: generation and embedding are both reachable with this API key.'
  );
};

main().catch((error) => {
  console.error(
    'Unexpected Gemini self-test error:',
    error?.message || error
  );

  process.exitCode = 1;
});