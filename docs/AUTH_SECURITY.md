# MediVault AI — Phase 2A Authentication & Security Architecture

**Author:** Full-Stack & Security Engineering  
**Scope:** Phase 2A Patient Authentication, Identity Verification, and Session Security  
**Compliance Standards:** OWASP ASVS v4.0, HIPAA Technical Safeguards (Security Controls Baseline)

---

## 1. Threat Model & Security Boundaries

MediVault AI handles personal health documentation. While Phase 2A focuses strictly on authentication and registration before patient health records are accepted, all security controls are architected from day one to enforce zero-trust boundaries:

1. **Patient Data Confidentiality:** No medical records, summaries, or protected health information (PHI) are accepted or stored in Phase 2A.
2. **Credential Theft Defense:** Access tokens are never stored in browser `localStorage` or `sessionStorage` where malicious third-party scripts or XSS vulnerabilities could exfiltrate them.
3. **Database Compromise Resistance:** Raw session tokens, email verification tokens, and password reset tokens are never stored in plaintext in the database. Only their SHA-256 digests (`tokenHash`) are persisted.
4. **Account Enumeration Prevention:** Public authentication endpoints (login, forgot password, resend verification) return uniform timing and generic error messages to prevent attackers from determining which email addresses are registered on the platform.

---

## 2. Cryptographic Architecture

### 2.1 Password Hashing with Argon2id

Passwords are hashed using **Argon2id**, the winner of the Password Hashing Competition (PHC) and OWASP's recommended primary hashing algorithm:

- **Algorithm:** Argon2id (hybrid data-dependent and data-independent memory access)
- **Memory Cost (`m`):** `65536 KB` (64 MB)
- **Time Cost (`t`):** `3 iterations`
- **Parallelism (`p`):** `4 threads`
- **Salt:** Cryptographically secure random 16-byte salt generated per hash by Argon2.

```ts
await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
});
```

### 2.2 Token Generation & Hash-at-Rest

All stateful security tokens (sessions, verification links, and password recovery tokens) follow a dual-token design:

1. **Raw Token:** 256 bits of entropy generated using `crypto.randomBytes(32).toString('hex')`.
2. **Transmitted Value:** Sent to the user via HttpOnly cookie or secure one-time URL.
3. **Stored Value (`tokenHash`):** SHA-256 hex digest (`crypto.createHash('sha256').update(rawToken).digest('hex')`).

Even in the hypothetical event of an unauthorized read snapshot of the `sessions` or `verification_tokens` tables, attackers cannot impersonate active user sessions or use recovery links.

---

## 3. Session Management & Cookie Hardening

### 3.1 Cookie Directives

Sessions are established via an encrypted/signed HttpOnly cookie:

```ts
res.cookie('medivault_session', sessionToken, {
  httpOnly: true, // Inaccessible to document.cookie / XSS
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax', // Defends against cross-site request forgery
  path: '/', // Available across whole domain
  expires: expiresAt, // 72 hours TTL
});
```

### 3.2 Server-Side Revocation

- **Logout:** Explicitly marks the database session record as `revokedAt = NOW()`, immediately terminating server-side validity regardless of cookie expiration.
- **Password Reset:** When a user resets their password, `revokeAllUserSessions(userId)` immediately terminates all active sessions across all devices.

---

## 4. Cross-Site Request Forgery (CSRF) Protection

MediVault AI implements **Cryptographically Session-Bound Anti-CSRF Protection** (Hardened in Phase 2C.4):

1. **Session Binding & HMAC-SHA256:**
   - CSRF tokens follow the format `<nonce>.<signature>`.
   - The signature is calculated as `HMAC-SHA256(nonce + ':' + sessionIdentifier, CSRF_SECRET)`.
   - For authenticated users, `sessionIdentifier` is the SHA-256 hash of their session token (`hashToken(sessionCookie)`).
   - For guests, `sessionIdentifier` is `'guest'`.
2. **Double-Submit Header & Cookie:**
   - The server sets a readable `medivault_csrf_token` cookie (`SameSite=Lax`, `Secure` in prod).
   - The frontend SPA reads this token and injects it into the `X-CSRF-Token` header for all state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`).
3. **Constant-Time Verification (`csrfProtection`):**
   - The server verifies both double-submit equality (`timingSafeEqual(csrfCookie, csrfHeader)`) AND signature authenticity for the active session.
   - Any attempt to use a guest CSRF token or a token issued for another user session is rejected with HTTP 403 `CSRF_UNBOUND`.
4. **Token Rotation & Lifecycle:**
   - Upon `POST /api/auth/login`, any previous guest CSRF token is rotated to a fresh session-bound token.
   - Upon `POST /api/auth/logout`, the CSRF cookie is cleared. `POST /api/auth/logout` is strictly protected by `csrfProtection` to prevent forced cross-site logouts.

---

## 5. Rate Limiting & Anti-Brute-Force Defenses

In-memory rate limiters protect public and vault endpoints against automated attacks, using sanitized client IP resolution (`getClientIp()` ignoring spoofed `X-Forwarded-For` when `TRUST_PROXY=false`):

| Endpoint                             | Window     | Max Attempts        | Keying Strategy            | Behavior on Exceeded                              |
| :----------------------------------- | :--------- | :------------------ | :------------------------- | :------------------------------------------------ |
| `POST /api/auth/login`               | 15 minutes | 10 per IP           | Client IP                  | HTTP 429 Too Many Requests (`Retry-After` header) |
| `POST /api/auth/register`            | 60 minutes | 10 per IP           | Client IP                  | HTTP 429 Too Many Requests                        |
| `POST /api/auth/resend-verification` | 15 minutes | 5 per IP            | Client IP                  | HTTP 429 Too Many Requests                        |
| `POST /api/auth/forgot-password`     | 15 minutes | 5 per IP            | Client IP                  | HTTP 429 Too Many Requests                        |
| `POST /api/vault/upload`             | 15 minutes | 10 (User) / 30 (IP) | User Account ID & Fallback | HTTP 429 Too Many Requests (`Retry-After` header) |

---

## 6. Access Control & Role Enforcement (RBAC)

The system defines four system roles:

```prisma
enum Role {
  PATIENT
  FAMILY_MEMBER
  CAREGIVER
  ADMIN
}
```

- **Strict Registration Policy:** The registration endpoint strictly rejects or strips any role assignment parameter from public registration requests. All public registrations default to `PATIENT`.
- **Email Verification Guard:** Unverified accounts cannot log in (returns HTTP 403 `EMAIL_NOT_VERIFIED`).
- **Protected Route Guards:** Both server-side middleware (`authenticate`, `requireRole`) and client-side guards (`<ProtectedRoute>`) verify session validity and verification status before granting access to `/patient/dashboard`.
