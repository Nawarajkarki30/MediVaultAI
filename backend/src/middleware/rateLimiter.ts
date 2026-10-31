import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

export type RateLimiterMiddleware = ((req: Request, res: Response, next: NextFunction) => void) & {
  reset: () => void;
};

const allRateLimiters: RateLimiterMiddleware[] = [];

export function resetAllRateLimiters(): void {
  for (const limiter of allRateLimiters) {
    limiter.reset();
  }
}

export function createRateLimiter(options: RateLimiterOptions): RateLimiterMiddleware {
  const store = new Map<string, RateLimitRecord>();
  const windowMs = options.windowMs;
  const max = options.max;
  const message = options.message || 'Too many attempts from this IP. Please try again later.';

  // Cleanup expired entries periodically
  const cleanupInterval = setInterval(
    () => {
      const now = Date.now();
      for (const [key, record] of store.entries()) {
        if (now > record.resetTime) {
          store.delete(key);
        }
      }
    },
    Math.max(windowMs, 60000)
  );

  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  const middleware = ((req: Request, res: Response, next: NextFunction): void => {
    const key = options.keyGenerator
      ? options.keyGenerator(req)
      : (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown-client';

    const now = Date.now();
    const existing = store.get(key);

    if (!existing || now > existing.resetTime) {
      store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      res.setHeader('RateLimit-Limit', max);
      res.setHeader('RateLimit-Remaining', max - 1);
      return next();
    }

    if (existing.count >= max) {
      const retryAfterSeconds = Math.ceil((existing.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      res.setHeader('RateLimit-Limit', max);
      res.setHeader('RateLimit-Remaining', 0);
      return next(new AppError(message, 429, 'RATE_LIMIT_EXCEEDED'));
    }

    existing.count += 1;
    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', Math.max(0, max - existing.count));
    next();
  }) as RateLimiterMiddleware;

  middleware.reset = () => {
    store.clear();
  };

  allRateLimiters.push(middleware);
  return middleware;
}

// Pre-configured rate limiters
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts. Please wait 15 minutes before trying again.',
});

export const registrationRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Registration rate limit exceeded. Please try again later.',
});

export const tokenRequestRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many verification or reset requests. Please wait before trying again.',
});
