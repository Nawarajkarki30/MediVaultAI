import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 MediVault AI Backend running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  logger.info(
    `🏥 Health Check endpoint available at http://localhost:${env.PORT}${env.API_PREFIX}/health`
  );
});

const handleShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default server;
