import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types';
import { env } from '../config/env';

// Centralized Error Handling Middleware
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
) => {
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details: unknown = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Request validation failed';
    details = err.flatten();
  } else if (err.name === 'SyntaxError') {
    statusCode = 400;
    errorCode = 'INVALID_JSON';
    message = 'Malformed JSON in request body';
  } else {
    // Log unexpected errors
    logger.error('Unhandled Server Error:', {
      name: err.name,
      message: err.message,
      stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: errorCode,
      details: env.NODE_ENV === 'development' ? (details ?? err.message) : details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    },
  });
};
