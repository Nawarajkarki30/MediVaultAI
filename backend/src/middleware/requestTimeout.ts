// backend/src/middleware/requestTimeout.ts
// MediVault AI — Request Timeout Guard

import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

export function requestTimeout(timeoutMs = env.UPLOAD_REQUEST_TIMEOUT_MS) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        next(new AppError('Request timed out while processing', 408, 'REQUEST_TIMEOUT'));
      }
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
}
