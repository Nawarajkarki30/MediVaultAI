import { Request, Response } from 'express';
import { ApiResponse } from '../types';

export const notFoundHandler = (req: Request, res: Response<ApiResponse>) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    error: {
      code: 'ROUTE_NOT_FOUND',
      details: {
        path: req.originalUrl,
        method: req.method,
      },
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    },
  });
};
