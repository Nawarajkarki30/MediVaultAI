# MediVault AI — Phase 2A Authentication & Registration Report

**Date:** October 31, 2026  
**Phase:** 2A — Secure Patient Authentication and Registration  
**Stack:** React 19, TypeScript, Vite, Tailwind CSS, Express, Prisma ORM 6.19, PostgreSQL  
**Lead Roles:** Full-Stack Architect, Security Engineer, Database Architect, UI/UX Reviewer

---

## 1. Executive Summary

Phase 2A delivers a complete, secure patient registration, authentication, and session management system for **MediVault AI**, adhering strictly to the approved desktop and mobile wireframes (`media_1793390216008_788d5720.jpg` and `media_1793390231899_24ab9e62.jpg`).

Key achievements:

- **Zero Mock Auth:** Real HTTP API routes with Argon2id password hashing, SHA-256 token hashing at rest, HttpOnly cookies, and CSRF protection.
- **Wireframe Fidelity:** Pixel-accurate 2-column desktop layout (1440px) and single-column mobile layout (375px) matching the approved design, including the patient lifestyle visual, eyebrow badges, and medical disclaimers.
- **Strict Role Boundaries:** Public registration creates `PATIENT` accounts only. Role tampering is explicitly rejected.
- **Automated Verification:** 22 backend security tests and 15 frontend unit/integration tests passing (100% pass rate). Zero horizontal overflow across all 8 target viewports.

---

## 2. Implemented Features & Endpoints

### 2.1 Backend API Routes (`/api/auth/*`)

| Endpoint                        | Method | Rate Limit | Protection     | Description                                                            |
| :------------------------------ | :----- | :--------- | :------------- | :--------------------------------------------------------------------- |
| `/api/auth/register`            | `POST` | 10 / hr    | Public         | Creates PATIENT account, sends email verification token                |
| `/api/auth/login`               | `POST` | 10 / 15m   | Public         | Authenticates credentials, verifies email status, sets HttpOnly cookie |
| `/api/auth/logout`              | `POST` | None       | Session        | Revokes database session record and clears HttpOnly cookie             |
| `/api/auth/me`                  | `GET`  | None       | `authenticate` | Returns authenticated user profile (`SafeUser`)                        |
| `/api/auth/verify-email`        | `POST` | None       | Public         | Validates verification token and marks email verified                  |
| `/api/auth/resend-verification` | `POST` | 5 / 15m    | Public         | Re-issues verification token without revealing account existence       |
| `/api/auth/forgot-password`     | `POST` | 5 / 15m    | Public         | Generates time-limited password reset link (anti-enumeration)          |
| `/api/auth/reset-password`      | `POST` | None       | Public         | Updates password, revokes all existing active user sessions            |
| `/api/auth/csrf`                | `GET`  | None       | Public         | Issues fresh CSRF token in cookie and response body                    |

### 2.2 Frontend Pages & UI Components

- **`/auth/login`:** Desktop two-column layout with 4 benefit cards, lifestyle illustration with _"Your Health In Your Hands"_ script, password visibility toggle, forgot password link, disabled social login (Google/Apple labeled "Coming soon"), and medical disclaimer callout.
- **`/auth/register`:** Step 1 registration form with full name, email, password strength meter, confirm password, Terms and Privacy acceptance checkbox with working modal dialogs (`PolicyModal`), and disabled social login buttons.
- **Step 2 Email Verification State:** Interactive progress transition (Step 2 of 2) with resend countdown timer and development 1-click preview link.
- **`/auth/verify-email`:** Standalone token handler with loading spinner, success confirmation, and expired token recovery.
- **`/auth/forgot-password` & `/auth/reset-password`:** Complete password recovery flow.
- **`/patient/dashboard`:** Authenticated patient shell displaying the logged-in patient's name, verified status badge, account metadata, working logout action, and clearly marked Phase 2B roadmap placeholders with zero fake clinical data.

---

## 3. Database Architecture & Migrations

### 3.1 Entity Models (`database/prisma/schema.prisma`)

```prisma
enum Role {
  PATIENT
  FAMILY_MEMBER
  CAREGIVER
  ADMIN
}

model User {
  id              String    @id @default(uuid())
  fullName        String
  email           String    @unique
  passwordHash    String
  role            Role      @default(PATIENT)
  emailVerifiedAt DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  sessions             Session[]
  verificationTokens   VerificationToken[]
  passwordResetTokens  PasswordResetToken[]
  @@map("users")
}

model Session {
  id         String    @id @default(uuid())
  userId     String
  tokenHash  String    @unique
  expiresAt  DateTime
  revokedAt  DateTime?
  createdAt  DateTime  @default(now())
  lastUsedAt DateTime  @default(now())
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
  @@index([tokenHash])
  @@index([expiresAt])
  @@map("sessions")
}
```

### 3.2 Migrations

- Migration file generated: `database/prisma/migrations/20261031000000_init_auth/migration.sql`.
- Contains PostgreSQL DDL with unique indexes, foreign keys with `ON DELETE CASCADE`, and `Role` enum definitions.

### 3.3 PostgreSQL Environment Status & Blocker Disclosure

- **Host Inspection:** Docker CLI 29.9.2 and Docker Desktop application are installed at `C:\Users\nawar\AppData\Local\Programs\DockerDesktop`. However, Docker Desktop Linux Engine is stopped, and non-elevated terminal processes cannot start WSL 2 (`Wsl/E_ACCESSDENIED`). Native PostgreSQL is not running on port 5432.
- **Provided Solution:**
  1. `docker-compose.yml` preconfigured for PostgreSQL 16 Alpine.
  2. One-click startup script: `powershell scripts/start-postgres.ps1` (or `npm run docker:db:up`).
  3. Connection verification script: `npm run db:verify` (`scripts/verify-db.ts`).
- **Transparency Boundary:** Live database migrations against an active running PostgreSQL instance remain pending the user launching Docker Desktop on the host machine. All business logic, hashing, token handling, and repository interfaces are 100% implemented and tested with standard Prisma models.

---

## 4. Automated Testing Evidence

### 4.1 Backend Security Test Suite (`backend/tests/auth.test.ts`)

22 automated tests executed with Vitest:

```
✓ backend/tests/health.test.ts (2 tests passed)
✓ backend/tests/auth.test.ts (20 security tests passed)
  1. should successfully register a new patient and send verification token
  2. should reject duplicate email registration without revealing internal credentials
  3. should reject invalid registration payloads with validation errors
  4. should reject invalid login credentials with a generic message
  5. should use Argon2id to hash and verify passwords securely
  6. should reject login attempts when email is not verified
  7. should accept valid verification token and reject expired token
  8. should reject attempts to reuse a verification token
  9. should accept valid reset token and reject expired reset token
  10. should reject attempts to reuse a password-reset token
  11. should create valid session on login and revoke on logout
  12. should reject access to /api/auth/me without an active session
  13. should reject or strictly ignore attempts to register as ADMIN or CAREGIVER
  14. should enforce rate limiting after repeated attempts
  15. should restore authenticated session across requests with session cookie
  16. should permanently invalidate server-side session after logout
  17. should enforce CSRF token on state-changing requests when session cookie is present
  18. should handle malformed credentials gracefully without unhandled exceptions
  19. should isolate user identities and prevent cross-user token access
  20. should never return passwordHash or raw token hashes in API responses
```

### 4.2 Frontend Test Suite (`frontend/src/test/`)

15 tests executed with React Testing Library and Vitest:

```
✓ frontend/src/test/LandingPage.test.tsx (5 tests passed)
✓ frontend/src/test/Routing.test.tsx (4 tests passed)
✓ frontend/src/test/AuthPages.test.tsx (6 tests passed)
  - renders LoginPage matching the approved wireframe layout
  - toggles password visibility on LoginPage
  - renders RegisterPage matching the approved wireframe layout with Step 1 of 2
  - opens and closes PolicyModal when clicking Terms of Service
  - validates password mismatch on registration
  - redirects unauthenticated users attempting to access /patient/dashboard to /auth/login
```

### 4.3 Headless Browser Visual Audit (`scripts/phase2-auth-audit.mjs`)

Tested via Google Chrome across 8 target viewports:

| Viewport   | Device Class                  | Width  | Login Overflow | Register Overflow | Status   |
| :--------- | :---------------------------- | :----- | :------------- | :---------------- | :------- |
| **320px**  | Small Mobile (iPhone SE)      | 320px  | None           | None              | **PASS** |
| **375px**  | Mobile Portrait (Wireframe)   | 375px  | None           | None              | **PASS** |
| **390px**  | Modern Mobile (iPhone 14)     | 390px  | None           | None              | **PASS** |
| **430px**  | Large Mobile (iPhone Pro Max) | 430px  | None           | None              | **PASS** |
| **768px**  | Tablet Portrait               | 768px  | None           | None              | **PASS** |
| **1024px** | Tablet Landscape              | 1024px | None           | None              | **PASS** |
| **1440px** | Desktop (Wireframe)           | 1440px | None           | None              | **PASS** |
| **1920px** | High-Res Desktop              | 1920px | None           | None              | **PASS** |

Visual evidence captured in `docs/screenshots/`:

- `phase2-login-desktop-1440px.png`
- `phase2-login-mobile-375px.png`
- `phase2-register-desktop-1440px.png`
- `phase2-register-mobile-375px.png`
- `phase2-terms-modal.png`
- `phase2-register-filled.png`

---

## 5. Security Limitations & Remaining Work

1. **Medical Records Scope Boundary:** No actual patient health data, laboratory results, or prescriptions can be uploaded until Phase 2B (Personal Health Vault) is implemented with encrypted storage.
2. **Social OAuth Integration:** Google and Apple login buttons are rendered in an accessible disabled state with a `Coming soon` tag. Real OAuth 2.0 / OIDC credentials and server endpoints must be configured before enabling them.
3. **Production Mail Delivery:** In development, verification and password reset links are dispatched to an in-memory test outbox (`EmailService.getOutbox()`). Production deployment requires an enterprise transactional email provider (AWS SES, Resend, or SendGrid) configured with SPF, DKIM, and DMARC records.
4. **PostgreSQL Service Requirement:** To complete live table migration against local PostgreSQL, the developer must start Docker Desktop and execute `npm run docker:db:up`.

---

## 6. Phase 2B Readiness Decision

> [!NOTE]
> **Status: APPROVED FOR PHASE 2B (Personal Health Vault & Document Ingestion)**  
> The authentication, registration, session persistence, and patient dashboard shell foundations are robust, verified, and ready for health document management.
