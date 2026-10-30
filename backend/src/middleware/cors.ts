import cors, { CorsOptions } from 'cors';
import { env } from '../config/env';

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, or same-server tests)
    if (!origin) {
      return callback(null, true);
    }

    if (env.ALLOWED_ORIGINS.includes(origin) || env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS policy`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

export const corsMiddleware = cors(corsOptions);
