// backend/src/middleware/csrf.ts
// MediVault AI — Cryptographically Bound Anti-CSRF Middleware

import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { timingSafeEqual, hashToken } from '../utils/security';
import { AppError } from '../utils/appError';
import { env } from '../config/env';

export const CSRF_COOKIE_NAME = 'medivault_csrf_token';
export const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Derives a canonical session binding identifier:
 * - If an authenticated session cookie or token is present: SHA-256 hash of the session token.
 * - Otherwise: 'guest'
 */
export function getSessionIdentifier(req: Request): string {
  const sessionToken = req.cookies?.medivault_session || req.sessionToken;
  if (sessionToken) {
    return hashToken(sessionToken);
  }
  return 'guest';
}

/**
 * Creates a cryptographically bound token: <16-byte-hex-nonce>.<HMAC-SHA256(nonce:sessionIdentifier)>
 */
export function generateSessionBoundToken(sessionIdentifier: string): string {
  const nonce = crypto.randomBytes(16).toString('hex');
  const signature = crypto
    .createHmac('sha256', env.CSRF_SECRET)
    .update(`${nonce}:${sessionIdentifier}`)
    .digest('hex');
  return `${nonce}.${signature}`;
}

/**
 * Verifies whether a token's HMAC-SHA256 signature is valid for a given session identifier
 * using constant-time comparison to prevent timing attacks.
 */
export function verifyTokenSignature(token: string, sessionIdentifier: string): boolean {
  if (typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [nonce, signature] = parts;
  if (!nonce || !signature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', env.CSRF_SECRET)
    .update(`${nonce}:${sessionIdentifier}`)
    .digest('hex');

  return timingSafeEqual(signature, expectedSignature);
}

/**
 * Controller/middleware helper to issue or refresh a CSRF token.
 * If forceRotate is true or the existing token is not bound to the current session,
 * a fresh session-bound token is issued and set in the cookie.
 */
export function issueCsrfToken(req: Request, res: Response, forceRotate = false): string {
  const sessionIdentifier = getSessionIdentifier(req);
  let token = req.cookies?.[CSRF_COOKIE_NAME];

  if (!token || forceRotate || !verifyTokenSignature(token, sessionIdentifier)) {
    token = generateSessionBoundToken(sessionIdentifier);
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
 * Clears the CSRF cookie on logout or session invalidation.
 */
export function clearCsrfToken(res: Response): void {
  res.clearCookie(CSRF_COOKIE_NAME, {
    httpOnly: false,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * Middleware ensuring state-changing operations submit a valid, session-bound CSRF token
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

  // If a session cookie is present, CSRF verification is strictly required and bound to session
  if (sessionCookie) {
    if (!csrfCookie || !csrfHeader) {
      return next(
        new AppError(
          'CSRF token missing. Please refresh and include the X-CSRF-Token header.',
          403,
          'CSRF_MISSING'
        )
      );
    }

    if (!timingSafeEqual(csrfCookie, csrfHeader)) {
      return next(new AppError('Invalid CSRF token.', 403, 'CSRF_INVALID'));
    }

    const sessionIdentifier = hashToken(sessionCookie);
    if (!verifyTokenSignature(csrfCookie, sessionIdentifier)) {
      return next(
        new AppError(
          'CSRF token is not bound to the active authenticated session.',
          403,
          'CSRF_UNBOUND'
        )
      );
    }
  }

  next();
}
