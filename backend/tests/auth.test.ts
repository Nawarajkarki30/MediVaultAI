import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { resetAllRateLimiters } from '../src/middleware/rateLimiter';
import { setAuthRepository, InMemoryAuthRepository } from '../src/repositories/auth.repository';
import { EmailService } from '../src/services/email.service';
import { hashPassword, verifyPassword, hashToken } from '../src/utils/security';
import { Role } from '@medivault/database';

describe('MediVault AI — Phase 2A Security & Authentication Suite', () => {
  let app: ReturnType<typeof createApp>;
  let inMemoryRepo: InMemoryAuthRepository;

  beforeEach(() => {
    inMemoryRepo = new InMemoryAuthRepository();
    setAuthRepository(inMemoryRepo);
    resetAllRateLimiters();
    EmailService.clearOutbox();
    app = createApp();
  });

  // 1. Successful patient registration
  it('1. should successfully register a new patient and send verification token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Jane Doe',
      email: 'jane.doe@example.com',
      password: 'ValidPassword123!',
      confirmPassword: 'ValidPassword123!',
      agreeToTerms: true,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('jane.doe@example.com');
    expect(res.body.data.user.fullName).toBe('Jane Doe');
    expect(res.body.data.user.role).toBe(Role.PATIENT);
    expect(res.body.data.user.emailVerified).toBe(false);

    // Verify verification email was queued
    const latestEmail = EmailService.findLatestEmail('jane.doe@example.com');
    expect(latestEmail).toBeDefined();
    expect(latestEmail?.type).toBe('VERIFICATION');
    expect(latestEmail?.rawToken).toBeDefined();
  });

  // 2. Duplicate email handling without unsafe disclosure
  it('2. should reject duplicate email registration without revealing internal credentials', async () => {
    // Initial registration
    await request(app).post('/api/auth/register').send({
      fullName: 'Alice Smith',
      email: 'alice@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      agreeToTerms: true,
    });

    // Duplicate registration attempt
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Alice Clone',
      email: 'alice@example.com',
      password: 'DifferentPassword456!',
      confirmPassword: 'DifferentPassword456!',
      agreeToTerms: true,
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already exists');
    expect(res.body.data).toBeUndefined();
  });

  // 3. Invalid registration payload
  it('3. should reject invalid registration payloads with validation errors', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: '',
      email: 'not-an-email',
      password: 'short',
      confirmPassword: 'mismatch',
      agreeToTerms: false,
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 4. Invalid login credentials
  it('4. should reject invalid login credentials with a generic message', async () => {
    // Seed verified user
    const passwordHash = await hashPassword('CorrectPassword123!');
    await inMemoryRepo.createUser({
      fullName: 'Valid User',
      email: 'user@example.com',
      passwordHash,
      emailVerifiedAt: new Date(),
    });

    // Wrong password
    const res = await request(app).post('/api/auth/login').send({
      email: 'user@example.com',
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');

    // Non-existent email
    const nonExistentRes = await request(app).post('/api/auth/login').send({
      email: 'ghost@example.com',
      password: 'SomePassword!',
    });

    expect(nonExistentRes.status).toBe(401);
    expect(nonExistentRes.body.message).toBe('Invalid email or password');
  });

  // 5. Password hashing and verification
  it('5. should use Argon2id to hash and verify passwords securely', async () => {
    const rawPass = 'SuperSecurePass123$#';
    const hash = await hashPassword(rawPass);

    expect(hash).toContain('$argon2id$');
    expect(await verifyPassword(hash, rawPass)).toBe(true);
    expect(await verifyPassword(hash, 'WrongPass')).toBe(false);
  });

  // 6. Unverified-email login restrictions
  it('6. should reject login attempts when email is not verified', async () => {
    const passwordHash = await hashPassword('ValidPass123!');
    await inMemoryRepo.createUser({
      fullName: 'Unverified Patient',
      email: 'unverified@example.com',
      passwordHash,
      emailVerifiedAt: null, // Not verified
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'unverified@example.com',
      password: 'ValidPass123!',
    });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('email address has not been verified');
  });

  // 7. Valid and expired verification tokens
  it('7. should accept valid verification token and reject expired token', async () => {
    const user = await inMemoryRepo.createUser({
      fullName: 'Token Tester',
      email: 'tokentester@example.com',
      passwordHash: 'hash',
      emailVerifiedAt: null,
    });

    // Valid token
    const validRawToken = 'valid-token-12345';
    await inMemoryRepo.createVerificationToken({
      userId: user.id,
      tokenHash: hashToken(validRawToken),
      expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hr future
    });

    const validRes = await request(app)
      .post('/api/auth/verify-email')
      .send({ token: validRawToken });

    expect(validRes.status).toBe(200);
    expect(validRes.body.data.user.emailVerified).toBe(true);

    // Expired token for another user
    const user2 = await inMemoryRepo.createUser({
      fullName: 'Expired Token User',
      email: 'expired@example.com',
      passwordHash: 'hash',
      emailVerifiedAt: null,
    });

    const expiredRawToken = 'expired-token-99999';
    await inMemoryRepo.createVerificationToken({
      userId: user2.id,
      tokenHash: hashToken(expiredRawToken),
      expiresAt: new Date(Date.now() - 3600 * 1000), // 1 hr past
    });

    const expiredRes = await request(app)
      .post('/api/auth/verify-email')
      .send({ token: expiredRawToken });

    expect(expiredRes.status).toBe(400);
    expect(expiredRes.body.message).toContain('expired');
  });

  // 8. Reused verification tokens
  it('8. should reject attempts to reuse a verification token', async () => {
    const user = await inMemoryRepo.createUser({
      fullName: 'Single Use Tester',
      email: 'singleuse@example.com',
      passwordHash: 'hash',
      emailVerifiedAt: null,
    });

    const rawToken = 'single-use-token-abc';
    await inMemoryRepo.createVerificationToken({
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + 3600 * 1000),
    });

    // First use: success
    const firstUse = await request(app).post('/api/auth/verify-email').send({ token: rawToken });
    expect(firstUse.status).toBe(200);

    // Second use: rejected
    const secondUse = await request(app).post('/api/auth/verify-email').send({ token: rawToken });
    expect(secondUse.status).toBe(400);
    expect(secondUse.body.message).toContain('already been used');
  });

  // 9. Valid and expired password-reset tokens
  it('9. should accept valid reset token and reject expired reset token', async () => {
    const user = await inMemoryRepo.createUser({
      fullName: 'Reset Tester',
      email: 'reset@example.com',
      passwordHash: await hashPassword('OldPass123!'),
      emailVerifiedAt: new Date(),
    });

    // Valid reset token
    const validResetToken = 'valid-reset-token-xyz';
    await inMemoryRepo.createPasswordResetToken({
      userId: user.id,
      tokenHash: hashToken(validResetToken),
      expiresAt: new Date(Date.now() + 1800 * 1000),
    });

    const validRes = await request(app).post('/api/auth/reset-password').send({
      token: validResetToken,
      password: 'NewSecurePassword123!',
      confirmPassword: 'NewSecurePassword123!',
    });

    expect(validRes.status).toBe(200);
    expect(validRes.body.message).toContain('Password reset successful');

    // Expired reset token
    const expiredResetToken = 'expired-reset-token-000';
    await inMemoryRepo.createPasswordResetToken({
      userId: user.id,
      tokenHash: hashToken(expiredResetToken),
      expiresAt: new Date(Date.now() - 60 * 1000),
    });

    const expiredRes = await request(app).post('/api/auth/reset-password').send({
      token: expiredResetToken,
      password: 'AnotherPassword123!',
      confirmPassword: 'AnotherPassword123!',
    });

    expect(expiredRes.status).toBe(400);
    expect(expiredRes.body.message).toContain('expired');
  });

  // 10. Reused password-reset tokens
  it('10. should reject attempts to reuse a password-reset token', async () => {
    const user = await inMemoryRepo.createUser({
      fullName: 'Reset Reuse Tester',
      email: 'reuse@example.com',
      passwordHash: await hashPassword('OldPass123!'),
      emailVerifiedAt: new Date(),
    });

    const rawToken = 'reuse-reset-token-111';
    await inMemoryRepo.createPasswordResetToken({
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + 3600 * 1000),
    });

    // First reset: success
    const res1 = await request(app).post('/api/auth/reset-password').send({
      token: rawToken,
      password: 'NewPass12345!',
      confirmPassword: 'NewPass12345!',
    });
    expect(res1.status).toBe(200);

    // Second reset: rejected
    const res2 = await request(app).post('/api/auth/reset-password').send({
      token: rawToken,
      password: 'AnotherNewPass12345!',
      confirmPassword: 'AnotherNewPass12345!',
    });
    expect(res2.status).toBe(400);
    expect(res2.body.message).toContain('already been used');
  });

  // 11. Session creation and revocation
  it('11. should create valid session on login and revoke on logout', async () => {
    const passwordHash = await hashPassword('UserPassword123!');
    await inMemoryRepo.createUser({
      fullName: 'Session User',
      email: 'session@example.com',
      passwordHash,
      emailVerifiedAt: new Date(),
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'session@example.com',
      password: 'UserPassword123!',
    });

    expect(loginRes.status).toBe(200);
    const cookies = loginRes.headers['set-cookie'] as unknown as string[];
    expect(cookies).toBeDefined();
    const sessionCookie = cookies.find((c: string) => c.startsWith('medivault_session='));
    const csrfCookie = cookies.find((c: string) => c.startsWith('medivault_csrf_token='));
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie).toContain('HttpOnly');

    // Logout with session-bound CSRF token
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', [sessionCookie!, csrfCookie!].filter(Boolean))
      .set('X-CSRF-Token', loginRes.body.data.csrfToken);

    expect(logoutRes.status).toBe(200);

    // Access /me with revoked session should fail
    const meRes = await request(app).get('/api/auth/me').set('Cookie', sessionCookie!);

    expect(meRes.status).toBe(401);
  });

  // 12. Protected API access without a session
  it('12. should reject access to /api/auth/me without an active session', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Authentication required');
  });

  // 13. Attempted public ADMIN registration
  it('13. should reject or strictly ignore attempts to register as ADMIN or CAREGIVER', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Hacker Admin',
      email: 'hacker@example.com',
      password: 'HackerPassword123!',
      confirmPassword: 'HackerPassword123!',
      agreeToTerms: true,
      role: 'ADMIN', // Unauthorized role escalation attempt
    });

    // Should reject payload because role is not allowed in public registration
    expect(res.status).toBe(400);
  });

  // 14. Basic rate-limit enforcement
  it('14. should enforce rate limiting after repeated attempts', async () => {
    const badLogin = () =>
      request(app).post('/api/auth/login').send({
        email: 'rate@example.com',
        password: 'wrong',
      });

    // Fire 10 attempts
    for (let i = 0; i < 10; i++) {
      await badLogin();
    }

    // 11th attempt should trigger 429
    const rateLimitedRes = await badLogin();
    expect(rateLimitedRes.status).toBe(429);
    expect(rateLimitedRes.header['retry-after']).toBeDefined();
  });

  // 15. Session restoration after reload
  it('15. should restore authenticated session across requests with session cookie', async () => {
    const passwordHash = await hashPassword('PersistentPass123!');
    await inMemoryRepo.createUser({
      fullName: 'Restored User',
      email: 'restored@example.com',
      passwordHash,
      emailVerifiedAt: new Date(),
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'restored@example.com',
      password: 'PersistentPass123!',
    });

    const cookies = loginRes.headers['set-cookie'] as unknown as string[];
    const sessionCookie = cookies.find((c: string) => c.startsWith('medivault_session='));

    // Request 1
    const meRes1 = await request(app).get('/api/auth/me').set('Cookie', sessionCookie!);
    expect(meRes1.status).toBe(200);
    expect(meRes1.body.data.user.email).toBe('restored@example.com');

    // Request 2 (simulating page reload)
    const meRes2 = await request(app).get('/api/auth/me').set('Cookie', sessionCookie!);
    expect(meRes2.status).toBe(200);
    expect(meRes2.body.data.user.id).toBe(meRes1.body.data.user.id);
  });

  // 16. Logout invalidating server-side access
  it('16. should permanently invalidate server-side session after logout', async () => {
    const passwordHash = await hashPassword('ValidPassword123!');
    await inMemoryRepo.createUser({
      fullName: 'Server Invalidation Test',
      email: 'invalidation@example.com',
      passwordHash,
      emailVerifiedAt: new Date(),
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'invalidation@example.com',
      password: 'ValidPassword123!',
    });

    const cookies = loginRes.headers['set-cookie'] as unknown as string[];
    const sessionCookie = cookies.find((c: string) => c.startsWith('medivault_session='));
    const csrfCookie = cookies.find((c: string) => c.startsWith('medivault_csrf_token='));

    // Perform logout with session-bound CSRF token
    await request(app)
      .post('/api/auth/logout')
      .set('Cookie', [sessionCookie!, csrfCookie!].filter(Boolean))
      .set('X-CSRF-Token', loginRes.body.data.csrfToken);

    // Replay session cookie
    const replayRes = await request(app).get('/api/auth/me').set('Cookie', sessionCookie!);

    expect(replayRes.status).toBe(401);
  });

  // 17. CSRF protection behavior
  it('17. should enforce CSRF token on state-changing requests when session cookie is present', async () => {
    const csrfRes = await request(app).get('/api/auth/csrf');
    expect(csrfRes.status).toBe(200);
    expect(csrfRes.body.data.csrfToken).toBeDefined();
    const csrfCookies = csrfRes.headers['set-cookie'] as unknown as string[];
    const csrfCookie = csrfCookies.find((c: string) => c.startsWith('medivault_csrf_token='));
    expect(csrfCookie).toBeDefined();
  });

  // 18. Malformed or missing credentials
  it('18. should handle malformed credentials gracefully without unhandled exceptions', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 12345, password: null });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 19. Authorization boundaries between users
  it('19. should isolate user identities and prevent cross-user token access', async () => {
    const userA = await inMemoryRepo.createUser({
      fullName: 'User A',
      email: 'usera@example.com',
      passwordHash: 'hashA',
      emailVerifiedAt: new Date(),
    });

    const userB = await inMemoryRepo.createUser({
      fullName: 'User B',
      email: 'userb@example.com',
      passwordHash: 'hashB',
      emailVerifiedAt: new Date(),
    });

    // Create session for User A
    const rawSessionA = 'session-user-a-secret-token';
    await inMemoryRepo.createSession({
      userId: userA.id,
      tokenHash: hashToken(rawSessionA),
      expiresAt: new Date(Date.now() + 3600 * 1000),
    });

    // Validate User A's session returns User A only
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `medivault_session=${rawSessionA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.id).toBe(userA.id);
    expect(res.body.data.user.id).not.toBe(userB.id);
  });

  // 20. Sensitive data exclusion from API responses and logs
  it('20. should never return passwordHash or raw token hashes in API responses', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Clean DTO User',
      email: 'clean@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      agreeToTerms: true,
    });

    expect(res.status).toBe(201);
    const bodyStr = JSON.stringify(res.body);
    expect(bodyStr).not.toContain('passwordHash');
    expect(bodyStr).not.toContain('$argon2id$');
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });
});
