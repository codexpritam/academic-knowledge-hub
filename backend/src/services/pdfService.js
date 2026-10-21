const pdf = require('pdf-parse');
const logger = require('../utils/logger');

/**
 * Clean extracted PDF text.
 *
 * We keep the text readable for Gemini/RAG instead of
 * aggressively removing useful structure.
 */
const cleanText = (text) => {
  if (!text) return '';

  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

/**
 * Extract PDF text page-by-page.
 *
 * Important:
 * Every page remains associated with its original
 * PDF page number.
 */
const extractPdfText = async (buffer) => {
  try {
    if (!Buffer.isBuffer(buffer)) {
      throw new Error('Invalid PDF buffer.');
    }

    const pages = [];

    const options = {
      pagerender: async (pageData) => {
        try {
          const textContent =
            await pageData.getTextContent();

          const rawText = textContent.items
            .map((item) => item.str || '')
            .join(' ');

          const cleanedText = cleanText(rawText);

          pages.push({
            pageNumber: pageData.pageIndex + 1,
            text: cleanedText
          });

          return cleanedText;
        } catch (error) {
          logger.warn(
            `Failed to extract page ${
              pageData.pageIndex + 1
            }: ${error.message}`
          );

          pages.push({
            pageNumber: pageData.pageIndex + 1,
            text: ''
          });

          return '';
        }
      }
    };

    const data = await pdf(buffer, options);

    pages.sort(
      (a, b) => a.pageNumber - b.pageNumber
    );

    const pageCount =
      data.numpages || pages.length;

    logger.info(
      `Extracted text from ${pageCount} PDF pages.`
    );

    const pagesWithText = pages.filter(
      (page) => page.text.length > 0
    ).length;

    logger.info(
      `${pagesWithText}/${pageCount} pages contain extractable text.`
    );

    return {
      pages,
      pageCount
    };
  } catch (error) {
    logger.error(
      `PDF extraction error: ${error.message}`
    );

    throw new Error(
      `Failed to extract text from PDF: ${error.message}`
    );
  }
};

/**
 * Find a good semantic boundary inside text.
 */
const findBreakPoint = (
  text,
  startIndex,
  preferredEnd
) => {
  const minimumPosition =
    startIndex + Math.floor(
      (preferredEnd - startIndex) * 0.55
    );

  const boundaries = [
    '. ',
    '? ',
    '! ',
    '; ',
    ': ',
    '\n',
    ' '
  ];

  for (const boundary of boundaries) {
    const position = text.lastIndexOf(
      boundary,
      preferredEnd
    );

    if (position >= minimumPosition) {
      return position + boundary.length;
    }
  }

  return preferredEnd;
};

/**
 * Create chunks while preserving page information.
 *
 * We do NOT mix different PDF pages into one chunk.
 * This makes page citations reliable.
 */
const chunkDocument = (
  pages,
  options = {}
) => {
  const chunkSize =
    options.chunkSize || 1200;

  const chunkOverlap =
    options.chunkOverlap || 200;

  const chunks = [];

  let chunkIndex = 0;

  for (const page of pages) {
    const pageText =
      typeof page.text === 'string'
        ? page.text.trim()
        : '';

    if (!pageText || pageText.length < 15) {
      continue;
    }

    /*
     * Small page:
     * Keep the complete page as one chunk.
     */
    if (pageText.length <= chunkSize) {
      chunks.push({
        chunkText: pageText,
        pageNumber: page.pageNumber,
        chunkIndex: chunkIndex++
      });

      continue;
    }

    /*
     * Large page:
     * Split into overlapping chunks.
     */
    let startIndex = 0;

    while (
      startIndex < pageText.length
    ) {
      const preferredEnd = Math.min(
        startIndex + chunkSize,
        pageText.length
      );

      if (
        preferredEnd >= pageText.length
      ) {
        const remainingText =
          pageText
            .slice(startIndex)
            .trim();

        if (remainingText.length > 20) {
          chunks.push({
            chunkText: remainingText,
            pageNumber: page.pageNumber,
            chunkIndex: chunkIndex++
          });
        }

        break;
      }

      const breakPoint =
        findBreakPoint(
          pageText,
          startIndex,
          preferredEnd
        );

      const segment =
        pageText
          .slice(startIndex, breakPoint)
          .trim();

      if (segment.length > 20) {
        chunks.push({
          chunkText: segment,
          pageNumber: page.pageNumber,
          chunkIndex: chunkIndex++
        });
      }

      /*
       * Move forward while keeping a small overlap.
       */
      const nextStart =
        breakPoint - chunkOverlap;

      startIndex = Math.max(
        startIndex + 1,
        nextStart
      );
    }
  }

  logger.info(
    `Generated ${chunks.length} page-aware chunks.`
  );

  return chunks;
};

module.exports = {
  extractPdfText,
  chunkDocument,
  cleanText
};