import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logInfo = {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      ip: req.ip,
    };

    if (res.statusCode >= 400) {
      logger.warn(`Incoming Request ${req.method} ${req.originalUrl}`, logInfo);
    } else {
      logger.info(`Incoming Request ${req.method} ${req.originalUrl}`, logInfo);
    }
  });

  next();
};
