import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { env } from '../config/env';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message?: string;
  code?: string;
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

/**
 * Extracts client IP securely without blindly trusting spoofed X-Forwarded-For headers.
 * Respects express trust proxy configuration: If TRUST_PROXY is false, falls back strictly
 * to the socket's direct remote address.
 */
export function getClientIp(req: Request): string {
  let ip: string;
  if (env.TRUST_PROXY) {
    ip = req.ip || req.socket?.remoteAddress || '127.0.0.1';
  } else {
    ip = req.socket?.remoteAddress || req.ip || '127.0.0.1';
  }

  // Normalize IPv6-mapped IPv4 addresses (e.g., ::ffff:127.0.0.1 -> 127.0.0.1)
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  return ip;
}

export function createRateLimiter(options: RateLimiterOptions): RateLimiterMiddleware {
  const store = new Map<string, RateLimitRecord>();
  const windowMs = options.windowMs;
  const max = options.max;
  const message = options.message || 'Too many attempts. Please try again later.';
  const code = options.code || 'RATE_LIMIT_EXCEEDED';

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
    const key = options.keyGenerator ? options.keyGenerator(req) : getClientIp(req);

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
      return next(new AppError(message, 429, code));
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
  code: 'LOGIN_RATE_LIMIT_EXCEEDED',
});

export const registrationRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Registration rate limit exceeded. Please try again later.',
  code: 'REGISTRATION_RATE_LIMIT_EXCEEDED',
});

export const tokenRequestRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many verification or reset requests. Please wait before trying again.',
  code: 'TOKEN_RATE_LIMIT_EXCEEDED',
});

/**
 * Dedicated upload rate limiter enforcing dual controls:
 * 1. Account-level quota (per authenticated user) to prevent storage and crypto exhaustion.
 * 2. IP-level fallback to mitigate unauthenticated or distributed abuse.
 * Never leaks patient identifiers in errors or logs.
 */
export function createUploadRateLimiter(): RateLimiterMiddleware {
  const userStore = new Map<string, RateLimitRecord>();
  const ipStore = new Map<string, RateLimitRecord>();

  const windowMs = env.UPLOAD_RATE_LIMIT_WINDOW_MS;
  const userMax = env.UPLOAD_RATE_LIMIT_USER_MAX;
  const ipMax = env.UPLOAD_RATE_LIMIT_IP_MAX;

  // Cleanup expired entries periodically
  const cleanupInterval = setInterval(
    () => {
      const now = Date.now();
      for (const [key, record] of userStore.entries()) {
        if (now > record.resetTime) userStore.delete(key);
      }
      for (const [key, record] of ipStore.entries()) {
        if (now > record.resetTime) ipStore.delete(key);
      }
    },
    Math.max(windowMs, 60000)
  );

  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  const middleware = ((req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const clientIp = getClientIp(req);
    const userId = req.user?.id;

    // 1. IP-level check
    const ipRecord = ipStore.get(clientIp);
    if (ipRecord && now <= ipRecord.resetTime && ipRecord.count >= ipMax) {
      const retryAfter = Math.ceil((ipRecord.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      res.setHeader('RateLimit-Limit', ipMax);
      res.setHeader('RateLimit-Remaining', 0);
      return next(
        new AppError(
          'Upload rate limit exceeded. Please wait before uploading more documents.',
          429,
          'UPLOAD_RATE_LIMIT_EXCEEDED'
        )
      );
    }

    // 2. User account-level check (if authenticated)
    if (userId) {
      const userRecord = userStore.get(userId);
      if (userRecord && now <= userRecord.resetTime && userRecord.count >= userMax) {
        const retryAfter = Math.ceil((userRecord.resetTime - now) / 1000);
        res.setHeader('Retry-After', retryAfter);
        res.setHeader('RateLimit-Limit', userMax);
        res.setHeader('RateLimit-Remaining', 0);
        return next(
          new AppError(
            'Upload rate limit exceeded. Please wait before uploading more documents.',
            429,
            'UPLOAD_RATE_LIMIT_EXCEEDED'
          )
        );
      }
    }

    // Update IP record
    if (!ipRecord || now > ipRecord.resetTime) {
      ipStore.set(clientIp, { count: 1, resetTime: now + windowMs });
    } else {
      ipRecord.count += 1;
    }

    // Update User record
    if (userId) {
      const userRecord = userStore.get(userId);
      if (!userRecord || now > userRecord.resetTime) {
        userStore.set(userId, { count: 1, resetTime: now + windowMs });
      } else {
        userRecord.count += 1;
      }
      res.setHeader('RateLimit-Limit', userMax);
      res.setHeader(
        'RateLimit-Remaining',
        Math.max(0, userMax - (userStore.get(userId)?.count || 1))
      );
    } else {
      res.setHeader('RateLimit-Limit', ipMax);
      res.setHeader(
        'RateLimit-Remaining',
        Math.max(0, ipMax - (ipStore.get(clientIp)?.count || 1))
      );
    }

    next();
  }) as RateLimiterMiddleware;

  middleware.reset = () => {
    userStore.clear();
    ipStore.clear();
  };

  allRateLimiters.push(middleware);
  return middleware;
}

export const uploadRateLimiter = createUploadRateLimiter();
