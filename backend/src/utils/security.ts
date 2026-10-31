import argon2 from 'argon2';
import crypto from 'crypto';

/**
 * Hash a plain password using Argon2id with OWASP-recommended parameters.
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  });
}

/**
 * Verify a plain password against an Argon2id hash.
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

/**
 * Generate a cryptographically random, unguessable token string.
 * This raw token is sent to the user (via email link or HttpOnly cookie).
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Compute SHA-256 digest of a token string.
 * Only the hash is stored in the database, protecting sessions and recovery links
 * even in the event of database snapshot exposure.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a random CSRF protection token.
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

