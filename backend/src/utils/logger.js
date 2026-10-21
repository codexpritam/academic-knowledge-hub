/**
 * Professional structured logger
 */

const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const metaStr = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
};

const logger = {
  info: (message, meta) => {
    console.log('\x1b[36m%s\x1b[0m', formatMessage('info', message, meta));
  },
  warn: (message, meta) => {
    console.warn('\x1b[33m%s\x1b[0m', formatMessage('warn', message, meta));
  },
  error: (message, meta) => {
    console.error('\x1b[31m%s\x1b[0m', formatMessage('error', message, meta));
  },
  success: (message, meta) => {
    console.log('\x1b[32m%s\x1b[0m', formatMessage('success', message, meta));
  },
  debug: (message, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('\x1b[90m%s\x1b[0m', formatMessage('debug', message, meta));
    }
  }
};

module.exports = logger;
