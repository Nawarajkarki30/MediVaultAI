// backend/src/middleware/requestTimeout.ts
// MediVault AI — Request Timeout & Coordinated Cancellation Guard

import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      abortController?: AbortController;
      abortSignal?: AbortSignal;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

export function requestTimeout(timeoutMs = env.UPLOAD_REQUEST_TIMEOUT_MS) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const controller = new AbortController();
    req.abortController = controller;
    req.abortSignal = controller.signal;

    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort(new AppError('Request timed out while processing', 408, 'REQUEST_TIMEOUT'));
      if (!res.headersSent) {
        next(new AppError('Request timed out while processing', 408, 'REQUEST_TIMEOUT'));
      }
    }, timeoutMs);

    // If client closes connection early (aborts/disconnects), abort downstream processing
    const onClose = () => {
      clearTimeout(timer);
      if (!res.writableEnded && !timedOut) {
        controller.abort(
          new AppError('Client disconnected prematurely', 499, 'CLIENT_DISCONNECTED')
        );
      }
    };

    res.on('finish', () => clearTimeout(timer));
    res.on('close', onClose);

    next();
  };
}
