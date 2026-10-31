// backend/tests/securityHardening.test.ts
// MediVault AI — Phase 2C.4 Targeted Security Hardening Suite

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma, Role, DocumentCategory } from '@medivault/database';
import { setAuthRepository, PrismaAuthRepository } from '../src/repositories/auth.repository';
import { hashPassword } from '../src/utils/security';
import {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  generateSessionBoundToken,
  verifyTokenSignature,
} from '../src/middleware/csrf';
import { resetAllRateLimiters, getClientIp } from '../src/middleware/rateLimiter';
import { vaultService } from '../src/services/vault.service';
import { Request } from 'express';

describe('MediVault AI — Phase 2C.4 Targeted Security Hardening Suite', () => {
  let app: ReturnType<typeof createApp>;
  let patientA: {
    id: string;
    email: string;
    sessionCookie: string;
    csrfCookie: string;
    csrfToken: string;
  };
  let patientB: {
    id: string;
    email: string;
    sessionCookie: string;
    csrfCookie: string;
    csrfToken: string;
  };

  const syntheticPdfBuffer = Buffer.from(
    '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000118 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n193\n%%EOF\nSYNTHETIC BLOOD REPORT'
  );

  beforeAll(async () => {
    setAuthRepository(new PrismaAuthRepository());
    app = createApp();

    const timestamp = Date.now();
    const passwordHash = await hashPassword('HardenedVaultPass123!');

    // Create Patient A
    const userA = await prisma.user.create({
      data: {
        fullName: 'Hardened Alpha',
        email: `hardened.alpha.${timestamp}@example.com`,
        passwordHash,
        role: Role.PATIENT,
        emailVerifiedAt: new Date(),
      },
    });

    // Create Patient B
    const userB = await prisma.user.create({
      data: {
        fullName: 'Hardened Beta',
        email: `hardened.beta.${timestamp}@example.com`,
        passwordHash,
        role: Role.PATIENT,
        emailVerifiedAt: new Date(),
      },
    });

    // Login Patient A
    const loginResA = await request(app).post('/api/auth/login').send({
      email: userA.email,
      password: 'HardenedVaultPass123!',
    });
    const cookiesA = loginResA.headers['set-cookie'] as unknown as string[];
    const sessionCookieA = cookiesA.find((c: string) => c.startsWith('medivault_session='))!;
    const csrfCookieA = cookiesA.find((c: string) => c.startsWith(`${CSRF_COOKIE_NAME}=`))!;
    const csrfTokenA = loginResA.body.data.csrfToken;

    patientA = {
      id: userA.id,
      email: userA.email,
      sessionCookie: sessionCookieA,
      csrfCookie: csrfCookieA,
      csrfToken: csrfTokenA,
    };

    // Login Patient B
    const loginResB = await request(app).post('/api/auth/login').send({
      email: userB.email,
      password: 'HardenedVaultPass123!',
    });
    const cookiesB = loginResB.headers['set-cookie'] as unknown as string[];
    const sessionCookieB = cookiesB.find((c: string) => c.startsWith('medivault_session='))!;
    const csrfCookieB = cookiesB.find((c: string) => c.startsWith(`${CSRF_COOKIE_NAME}=`))!;
    const csrfTokenB = loginResB.body.data.csrfToken;

    patientB = {
      id: userB.id,
      email: userB.email,
      sessionCookie: sessionCookieB,
      csrfCookie: csrfCookieB,
      csrfToken: csrfTokenB,
    };
  });

  afterAll(async () => {
    try {
      if (patientA?.id) {
        await prisma.user.delete({ where: { id: patientA.id } });
      }
      if (patientB?.id) {
        await prisma.user.delete({ where: { id: patientB.id } });
      }
    } catch {
      // Ignore
    }
    await prisma.$disconnect();
  });

  beforeEach(() => {
    resetAllRateLimiters();
  });

  // ============================================================================
  // SECTION 1: UPLOAD RATE LIMITING & ABUSE CONTROL
  // ============================================================================
  describe('1. Upload Rate Limiting & Account Abuse Control', () => {
    it('should allow uploads under the rate limit and set standard RateLimit headers', async () => {
      const res = await request(app)
        .post('/api/vault/upload')
        .set('Cookie', [patientA.sessionCookie, patientA.csrfCookie])
        .set(CSRF_HEADER_NAME, patientA.csrfToken)
        .field('title', 'Normal Rate Limit Test Doc')
        .field('category', DocumentCategory.LABORATORY_REPORT)
        .attach('file', syntheticPdfBuffer, 'test.pdf');

      expect(res.status).toBe(201);
      expect(res.headers['ratelimit-limit']).toBeDefined();
      expect(res.headers['ratelimit-remaining']).toBeDefined();
    });

    it('should return HTTP 429 with Retry-After header when account upload limit is exceeded', async () => {
      // Consume up to limit (10 attempts max)
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/vault/upload')
          .set('Cookie', [patientA.sessionCookie, patientA.csrfCookie])
          .set(CSRF_HEADER_NAME, patientA.csrfToken);
      }

      // 11th upload must trigger 429
      const overLimitRes = await request(app)
        .post('/api/vault/upload')
        .set('Cookie', [patientA.sessionCookie, patientA.csrfCookie])
        .set(CSRF_HEADER_NAME, patientA.csrfToken);

      expect(overLimitRes.status).toBe(429);
      expect(overLimitRes.headers['retry-after']).toBeDefined();
      expect(overLimitRes.body.success).toBe(false);
      expect(overLimitRes.body.error.code).toBe('UPLOAD_RATE_LIMIT_EXCEEDED');

      // Crucial privacy rule: Response must NEVER leak patient ID or email
      const rawBody = JSON.stringify(overLimitRes.body);
      expect(rawBody).not.toContain(patientA.id);
      expect(rawBody).not.toContain(patientA.email);
    });

    it('should not block a different patient when one patient reaches their account upload limit', async () => {
      // Patient B has independent account quota
      const resB = await request(app)
        .post('/api/vault/upload')
        .set('Cookie', [patientB.sessionCookie, patientB.csrfCookie])
        .set(CSRF_HEADER_NAME, patientB.csrfToken)
        .field('title', 'Patient B Independent Quota')
        .field('category', DocumentCategory.LABORATORY_REPORT)
        .attach('file', syntheticPdfBuffer, 'patientB.pdf');

      expect(resB.status).toBe(201);
      expect(resB.body.success).toBe(true);
    });
  });

  // ============================================================================
  // SECTION 2: ANTI-SPOOFING & CLIENT IP EXTRACTION
  // ============================================================================
  describe('2. Anti-Spoofing & Trusted Proxy Enforcement', () => {
    it('should not allow spoofed X-Forwarded-For headers to bypass rate limits when TRUST_PROXY is false', () => {
      const mockReq = {
        headers: { 'x-forwarded-for': '198.51.100.99, 10.0.0.1' },
        socket: { remoteAddress: '127.0.0.1' },
        ip: '198.51.100.99',
      } as unknown as Request;

      const extractedIp = getClientIp(mockReq);
      // With TRUST_PROXY=false by default, remoteAddress is strictly favored over forwarded header
      expect(extractedIp).toBe('127.0.0.1');
    });

    it('should normalize IPv6-mapped IPv4 loopback address (::ffff:127.0.0.1 to 127.0.0.1)', () => {
      const mockReq = {
        headers: {},
        socket: { remoteAddress: '::ffff:127.0.0.1' },
      } as unknown as Request;

      const extractedIp = getClientIp(mockReq);
      expect(extractedIp).toBe('127.0.0.1');
    });
  });

  // ============================================================================
  // SECTION 3: MULTIPART RESOURCE LIMITS & FIELD SANITIZATION
  // ============================================================================
  describe('3. Multipart Resource Limits & Form Field Sanitization', () => {
    it('should reject requests with unexpected/unrecognized form fields with HTTP 400', async () => {
      const res = await request(app)
        .post('/api/vault/upload')
        .set('Cookie', [patientA.sessionCookie, patientA.csrfCookie])
        .set(CSRF_HEADER_NAME, patientA.csrfToken)
        .field('title', 'Valid Title')
        .field('malicious_admin_escalation', 'true')
        .attach('file', syntheticPdfBuffer, 'unexpected-field.pdf');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_MULTIPART_FIELDS');
      expect(res.body.message).toContain("Unexpected form field: 'malicious_admin_escalation'");
    });

    it('should reject requests that exceed maximum permitted form field count (10 fields)', async () => {
      let reqChain = request(app)
        .post('/api/vault/upload')
        .set('Cookie', [patientA.sessionCookie, patientA.csrfCookie])
        .set(CSRF_HEADER_NAME, patientA.csrfToken);

      // Add 12 fields (exceeds limit of 10)
      for (let i = 0; i < 12; i++) {
        reqChain = reqChain.field(`field_${i}`, `value_${i}`);
      }
      reqChain = reqChain.attach('file', syntheticPdfBuffer, 'excessive-fields.pdf');

      const res = await reqChain;
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject requests attempting to attach multiple files in a single upload', async () => {
      const res = await request(app)
        .post('/api/vault/upload')
        .set('Cookie', [patientA.sessionCookie, patientA.csrfCookie])
        .set(CSRF_HEADER_NAME, patientA.csrfToken)
        .field('title', 'Multiple Files Test')
        .attach('file', syntheticPdfBuffer, 'file1.pdf')
        .attach('file2', syntheticPdfBuffer, 'file2.pdf');

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('TOO_MANY_FILES');
    });

    it('should reject requests where file size exceeds MAX_FILE_SIZE_BYTES (10 MB)', async () => {
      // Allocate an 11 MB buffer
      const oversizedBuffer = Buffer.alloc(11 * 1024 * 1024, 0x41);

      const res = await request(app)
        .post('/api/vault/upload')
        .set('Cookie', [patientA.sessionCookie, patientA.csrfCookie])
        .set(CSRF_HEADER_NAME, patientA.csrfToken)
        .field('title', 'Oversized File Test')
        .attach('file', oversizedBuffer, 'oversized.pdf');

      expect(res.status).toBe(413);
      expect(res.body.error.code).toBe('FILE_TOO_LARGE');
    });
  });

  // ============================================================================
  // SECTION 4: REQUEST TIMEOUT & COORDINATED CANCELLATION
  // ============================================================================
  describe('4. Request Timeout & Coordinated Cancellation', () => {
    it('should abort upload pipeline immediately if AbortSignal is pre-triggered', async () => {
      const controller = new AbortController();
      controller.abort();

      const testBuffer = Buffer.from(syntheticPdfBuffer);

      await expect(
        vaultService.uploadDocument({
          ownerId: patientA.id,
          fileBuffer: testBuffer,
          originalFileName: 'aborted.pdf',
          signal: controller.signal,
        })
      ).rejects.toThrow('Upload aborted by client or request timeout');

      // Verify memory scrubbing on cancellation
      expect(testBuffer[0]).toBe(0);
    });
  });

  // ============================================================================
  // SECTION 5: SESSION-BOUND CRYPTOGRAPHIC CSRF PROTECTION
  // ============================================================================
  describe('5. Session-Bound Cryptographic Anti-CSRF Protection', () => {
    it('should reject state-changing request when session cookie is attached but CSRF token is missing', async () => {
      const res = await request(app)
        .post('/api/vault/upload')
        .set('Cookie', patientA.sessionCookie) // No CSRF cookie or header
        .field('title', 'Missing CSRF Test')
        .attach('file', syntheticPdfBuffer, 'no-csrf.pdf');

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('CSRF_MISSING');
    });

    it('should reject request when CSRF token was issued for guest but used with authenticated session', async () => {
      // Generate token bound to 'guest'
      const guestToken = generateSessionBoundToken('guest');

      const res = await request(app)
        .post('/api/vault/upload')
        .set('Cookie', [patientA.sessionCookie, `${CSRF_COOKIE_NAME}=${guestToken}`])
        .set(CSRF_HEADER_NAME, guestToken)
        .field('title', 'Guest Token Replay Test')
        .attach('file', syntheticPdfBuffer, 'guest-token.pdf');

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('CSRF_UNBOUND');
      expect(res.body.message).toContain('not bound to the active authenticated session');
    });

    it("should reject request when Patient B attempts to use their CSRF token with Patient A's session", async () => {
      // Patient B's token is cryptographically bound to Patient B's session hash
      const res = await request(app)
        .post('/api/vault/upload')
        .set('Cookie', [patientA.sessionCookie, patientB.csrfCookie])
        .set(CSRF_HEADER_NAME, patientB.csrfToken)
        .field('title', 'Cross-User CSRF Token Replay')
        .attach('file', syntheticPdfBuffer, 'cross-csrf.pdf');

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('CSRF_UNBOUND');
    });

    it('should reject CSRF token if HMAC signature is tampered with', async () => {
      const [nonce] = patientA.csrfToken.split('.');
      const tamperedToken = `${nonce}.0000000000000000000000000000000000000000000000000000000000000000`;

      const res = await request(app)
        .post('/api/vault/upload')
        .set('Cookie', [patientA.sessionCookie, `${CSRF_COOKIE_NAME}=${tamperedToken}`])
        .set(CSRF_HEADER_NAME, tamperedToken)
        .field('title', 'Tampered Token Test')
        .attach('file', syntheticPdfBuffer, 'tampered.pdf');

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('CSRF_UNBOUND');
    });

    it('should enforce CSRF validation on /api/auth/logout when session cookie is attached', async () => {
      // Calling logout with session cookie but without CSRF token must fail with 403
      const badLogoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', patientA.sessionCookie);

      expect(badLogoutRes.status).toBe(403);
      expect(badLogoutRes.body.error.code).toBe('CSRF_MISSING');
    });

    it('should rotate CSRF token to a fresh session-bound token upon successful login', async () => {
      // Pre-login: Fetch guest CSRF token
      const guestCsrfRes = await request(app).get('/api/auth/csrf');
      const guestToken = guestCsrfRes.body.data.csrfToken;
      expect(verifyTokenSignature(guestToken, 'guest')).toBe(true);

      // Perform login with pre-existing guest CSRF cookie
      const loginRes = await request(app)
        .post('/api/auth/login')
        .set('Cookie', `${CSRF_COOKIE_NAME}=${guestToken}`)
        .send({
          email: patientB.email,
          password: 'HardenedVaultPass123!',
        });

      expect(loginRes.status).toBe(200);
      const postLoginCsrfToken = loginRes.body.data.csrfToken;

      // Token MUST have rotated away from guest token
      expect(postLoginCsrfToken).not.toBe(guestToken);
      expect(verifyTokenSignature(postLoginCsrfToken, 'guest')).toBe(false);

      // Clean up test session
      const cookies = loginRes.headers['set-cookie'] as unknown as string[];
      const sessionCookie = cookies.find((c: string) => c.startsWith('medivault_session='));
      const csrfCookie = cookies.find((c: string) => c.startsWith(`${CSRF_COOKIE_NAME}=`));

      await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [sessionCookie!, csrfCookie!])
        .set(CSRF_HEADER_NAME, postLoginCsrfToken);
    });
  });
});
