const app = require('./app');
const config = require('./config');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

const startServer = async () => {
  // Connect to database
  await connectDB();

  const server = app.listen(config.port, () => {
    logger.success(`Academic Knowledge Hub Backend listening on port ${config.port} [${config.env}]`);
    logger.info(`API Base URL: http://localhost:${config.port}/api`);
    logger.info(`Health check: http://localhost:${config.port}/api/health`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection:', { reason: reason?.message || reason });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', { message: error.message, stack: error.stack });
    process.exit(1);
  });

  // Graceful shutdown
  const gracefulShutdown = () => {
    logger.info('Shutting down server gracefully...');
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
};

startServer();
