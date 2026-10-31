import express, { Application } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { corsMiddleware } from './middleware/cors';
import { requestLogger } from './middleware/requestLogger';
import { notFoundHandler } from './middleware/notFoundHandler';
import { errorHandler } from './middleware/errorHandler';
import { apiRouter } from './routes';

export const createApp = (): Application => {
  const app = express();

  // Explicit trusted proxy configuration (anti-spoofing)
  app.set('trust proxy', env.TRUST_PROXY);

  // Security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS restricted to configured origins
  app.use(corsMiddleware);

  // Cookie parser for reading HttpOnly session & CSRF tokens
  app.use(cookieParser(env.SESSION_SECRET));

  // Body parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Request logger
  if (env.NODE_ENV !== 'test') {
    app.use(requestLogger);
  }

  // Mount API Router
  app.use(env.API_PREFIX, apiRouter);

  // 404 Handler for unmatched routes
  app.use(notFoundHandler);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
