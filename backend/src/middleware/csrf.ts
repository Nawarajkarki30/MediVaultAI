import { Request, Response, NextFunction } from 'express';
import { generateCsrfToken, timingSafeEqual } from '../utils/security';
import { AppError } from '../utils/appError';
import { env } from '../config/env';

export const CSRF_COOKIE_NAME = 'medivault_csrf_token';
export const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Controller/middleware to issue or refresh a CSRF token.
 */
export function issueCsrfToken(req: Request, res: Response): string {
  let token = req.cookies?.[CSRF_COOKIE_NAME];
  if (!token) {
    token = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false, // Must be readable by client JS to send in X-CSRF-Token header
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400 * 1000, // 24 hours
    });
  }
  return token;
}

/**
 * Middleware ensuring state-changing operations submit a valid CSRF token
 * when authenticated via cookies.
 */
export function csrfProtection(req: Request, _res: Response, next: NextFunction): void {
  // Safe HTTP methods do not mutate state
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Check if session cookie is attached
  const sessionCookie = req.cookies?.medivault_session;
  const csrfCookie = req.cookies?.[CSRF_COOKIE_NAME];
  const csrfHeader = (req.headers[CSRF_HEADER_NAME] || req.headers['x-xsrf-token']) as
    string | undefined;

  // If a session cookie is present, CSRF verification is strictly required
  if (sessionCookie) {
    if (!csrfCookie || !csrfHeader) {
      return next(
        new AppError('CSRF token missing. Please refresh and include the X-CSRF-Token header.', 403)
      );
    }

    if (!timingSafeEqual(csrfCookie, csrfHeader)) {
      return next(new AppError('Invalid CSRF token.', 403));
    }
  }

  next();
}
