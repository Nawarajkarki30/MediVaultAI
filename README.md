# MediVault AI

> **Your Health. Clearer. Safer. Together.**
>
> An AI-powered personal healthcare assistance platform, initially developed as a final-year university capstone project and architected for scalable real-world deployment.

---

## 1. Project Overview & Scope

**MediVault AI** addresses one of the most stressful aspects of modern healthcare: navigating complex, jargon-heavy medical reports and coordinating care across families and caregivers.

Patients routinely face fragmented paper records, laboratory tests with intimidating clinical acronyms, and no safe way to share select medical information with family members or home caregivers. MediVault AI solves this by providing:

1. **Secure Document Organization:** A centralized, organized digital health vault.
2. **Bilingual AI Explanations:** Clear, readable explanations in plain English and Nepali (नेपाली), designed to educate rather than diagnose.
3. **Family Sharing Circle:** Granular, revocable permissions so loved ones stay informed.
4. **Verified Caregiver Assistance:** Scoped non-medical support for elderly and recovering patients.

### Phase Status

- **Phase 1: Foundation & Landing Page:** Completed & Audited.
- **Phase 2A: Secure Patient Authentication & Registration:** Completed & Audited.
  - Full-stack patient authentication with Argon2id hashing and SHA-256 tokens at rest.
  - HttpOnly cookie sessions, Double-Submit CSRF protection, and rate limiting.
  - Desktop & mobile wireframe-matching `/auth/login` and `/auth/register` pages.
  - Email verification workflow and password recovery screens (`/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`).
  - Authenticated patient dashboard shell (`/patient/dashboard`) with zero fake clinical data.
- **Phase 2B: Personal Health Vault & Ingestion:** Next scheduled phase.

---

## 2. Technology Stack

### Frontend

- **Framework:** React 19 with strict TypeScript
- **Bundler:** Vite 6
- **Styling:** Tailwind CSS (current stable) with customized brand design tokens
- **Routing:** React Router v7
- **Icons:** Lucide React
- **Testing:** Vitest, React Testing Library, jsdom

### Backend

- **Runtime:** Node.js (LTS v20+)
- **Framework:** Express
- **Language:** TypeScript 5.7+
- **Validation:** Zod for environment and request payload validation
- **Security:** Helmet headers and origin-restricted CORS
- **Testing:** Vitest, Supertest

### Database

- **Engine:** PostgreSQL
- **ORM:** Prisma ORM with version-controlled migrations
- **Configuration:** Documented configuration in `database/prisma/schema.prisma` and `database/prisma.config.ts`

### Toolchain & Quality

- npm workspaces monorepo
- ESLint & Prettier
- Strict TypeScript configuration

---

## 3. Directory Structure

```
medivault-ai/
├── frontend/
│   ├── public/
│   │   └── assets/
│   │       └── favicon.svg
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/             # Reusable UI controls (Button, Logo, Badge, Card)
│   │   │   ├── layout/             # Navbar, Footer
│   │   │   └── landing/            # Hero, DashboardPreview, KeyBenefits, HowItWorks, etc.
│   │   ├── pages/                  # HomePage, AuthPlaceholderPage, NotFoundPage
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── lib/                    # Constants and mock demo fixtures
│   │   ├── services/               # API clients and health checker
│   │   ├── styles/                 # Tailwind globals and typography
│   │   ├── test/                   # Vitest & RTL test suites
│   │   ├── types/                  # TypeScript interface contracts
│   │   ├── App.tsx                 # Route mapping
│   │   └── main.tsx                # Application bootstrap
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── config/                 # Environment validation via Zod
│   │   ├── controllers/            # HealthController
│   │   ├── middleware/             # CORS, Helmet, Logger, Error Handler, 404
│   │   ├── routes/                 # Express API routers
│   │   ├── services/               # HealthService telemetry
│   │   ├── utils/                  # AppError and structured logger
│   │   ├── types/                  # API response types
│   │   ├── app.ts                  # Express app factory
│   │   └── server.ts               # HTTP server bootstrap
│   ├── tests/                      # Supertest API test suites
│   ├── package.json
│   └── tsconfig.json
│
├── database/
│   ├── prisma/
│   │   ├── schema.prisma           # Foundational PostgreSQL schema
│   │   └── migrations/             # Version-controlled migrations
│   ├── src/                        # Prisma client singleton export
│   ├── prisma.config.ts            # Prisma runtime paths
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   ├── ARCHITECTURE.md             # System design, boundaries, and security
│   ├── FEATURES.md                 # Implemented, planned, and out-of-scope matrix
│   ├── DATABASE.md                 # Current schema & planned Phase 2/3 entities
│   └── DEVELOPMENT.md              # Local workflow, commands, and conventions
│
├── .gitignore
├── .env.example
├── package.json
└── README.md
```

---

## 4. Prerequisites

Before running the application locally, ensure you have:

- **Node.js:** v20.0.0 or later (verified with Node v23 / LTS v20 / v22)
- **npm:** v10.0.0 or later
- **PostgreSQL (Optional for Phase 1 preview, required for database migrations):** v15+

---

## 5. Installation & Setup

### 5.1 Clone Repository and Prepare Environment

```bash
# Clone the repository
git clone <repository-url>
cd medivault-ai

# Copy environment variable template
cp .env.example .env
```

### 5.2 Install Monorepo Dependencies

From the repository root:

```bash
npm install
```

This automatically links all three workspaces: `@medivault/frontend`, `@medivault/backend`, and `@medivault/database`.

---

## 6. Running the Application

### 6.1 Start Frontend & Backend Concurrently

```bash
npm run dev
```

### 6.2 Start Services Independently

- **Backend API:**

  ```bash
  npm run dev:backend
  ```

  API will be available at: `http://localhost:5000/api`
  Health check: `http://localhost:5000/api/health`

- **Frontend Application:**
  ```bash
  npm run dev:frontend
  ```
  Vite dev server will start at: `http://localhost:5173`

---

## 7. Database & Prisma Configuration

### 7.1 Environment Variable

Configure your PostgreSQL connection in `.env`:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/medivault_dev?schema=public
```

### 7.2 Generating the Prisma Client

```bash
npm run prisma:generate
```

### 7.3 Applying Migrations

When your PostgreSQL instance is running:

```bash
npm run prisma:migrate
```

### 7.4 Prisma Studio

To inspect tables in a visual database browser:

```bash
npm run studio --workspace=@medivault/database
```

---

## 8. Running Automated Tests

Run all unit, integration, and UI tests across all workspaces:

```bash
npm run test
```

### Specific Workspace Tests

- **Frontend UI & Component Tests (Vitest + React Testing Library):**
  ```bash
  npm run test --workspace=@medivault/frontend
  ```
- **Backend API Tests (Vitest + Supertest):**
  ```bash
  npm run test --workspace=@medivault/backend
  ```

### Disaster Recovery & Vault Integrity Verification

```bash
# Run full disaster recovery verification (PostgreSQL dump + restore to disposable DB + decryption)
npm run vault:disaster-recovery:test

# Run storage blob & database metadata reconciliation check
npm run vault:reconcile

# Run manifest-driven backup & restoration test
npm run vault:backup:test
```

### Linting & Formatting

```bash
# Typecheck TypeScript across all workspaces
npm run typecheck

# Check code formatting
npm run format:check

# Format files
npm run format
```

---

## 9. Current Features (Phases 1, 2A, 2B, 2C.1 - 2C.4 Completed)

- 🎨 **Approved Homepage & Dashboard Visual Identity:**
  - Premium healthcare SaaS visual identity with exact design tokens (`#2675F5`, `#0B1B49`, `#F8FBFF`, `#526482`).
  - Responsive header with mobile drawer, accessible ESC/focus management, and smooth navigation.
  - Interactive **Dashboard Preview** with synthetic metrics, recent reports, and bilingual (English/Nepali) preview modal.
  - Full **Patient Dashboard** (`/patient/dashboard`) with dynamic time-based greeting, live stats cards, report filtering, and family quick actions.
  - Full **Personal Health Vault** (`/patient/vault` & `/patient/vault/:documentId`) with grid/list views, categories, search, attachment preview, and metadata editing.
- 🔐 **Hardened Patient Authentication (Phase 2A & 2C.4):**
  - Argon2id password hashing (64MB memory, 3 iterations, 4 threads).
  - Secure HttpOnly session cookies with SHA-256 hash-at-rest token storage.
  - Email verification and password recovery token lifecycle.
  - **Cryptographically session-bound anti-CSRF** (`HMAC-SHA256` token signature, timing-safe equality, token rotation on login, cookie clear on logout, and `/logout` protection).
- 🛡️ **Secure Medical Vault & Storage Architecture (Phase 2C.3 & 2C.4):**
  - **AES-256-GCM Envelope Encryption:** Ephemeral per-document 256-bit DEK wrapped by 256-bit Master KEK.
  - **Cryptographic AAD Binding:** Binds canonical JSON `{ documentId, ownerId, storageVersion, keyVersion }` into the GCM cipher.
  - **ClamAV In-Memory Malware Screening:** Streams buffer over TCP `zINSTREAM` with fail-closed behavior and cooperative `AbortSignal` cancellation.
  - **Dedicated Upload Rate Limiting:** Dual tracking (10 uploads/15 min per user, 30/15 min per IP fallback) with `Retry-After` header and zero patient identity leak.
  - **Strict Multipart Parsing:** Enforces Busboy limits (10MB file, 1 file, 10 fields, 50 chars fieldName, 2 KB fieldSize, 15 parts) and unexpected field whitelisting.
  - **Anti-Spoofing Client IP Resolution:** Ignores spoofed `X-Forwarded-For` when `TRUST_PROXY=false`, falling back strictly to socket remote address.
  - **Full Automated Disaster Recovery Test:** `npm run vault:disaster-recovery:test` dumps PostgreSQL, restores into disposable database `medivault_restore_test`, decrypts restored blobs, and verifies byte-for-byte matching without touching `medivault_dev`.
- 🗄️ **Database & Infrastructure:**
  - Local Docker PostgreSQL 16 Alpine running with persistent named volume.
  - ClamAV antivirus daemon container with health checks.
  - Prisma 6.19 migrations for Users, Sessions, Tokens, MedicalDocuments, StorageMetadata, and AuditEvents.

---

## 10. Planned Future Features (Phase 2 & Phase 3)

- **Phase 2:**
  - User authentication (JWT + HTTP-only cookies, argon2 password hashing).
  - Encrypted medical document upload (PDF, JPEG, PNG) to cloud object storage.
  - OCR pipeline for scanned prescriptions and laboratory slips.
  - Bilingual Generative AI medical explanation engine (English and Nepali).
- **Phase 3:**
  - Granular family member sharing permissions with time-based access limits.
  - Verified non-medical caregiver discovery and booking network.
  - Immutable audit logs for compliance and privacy tracking.

---

## 11. Known Limitations & Safety Boundaries

- **Informational Notice:** Phase 1 is an interface and architectural demonstration. It does not perform active medical record uploads or real OCR processing.
- **Safety Boundary:** MediVault AI provides informational summaries only. It **does not provide medical diagnoses, alter prescriptions, or replace consultation with a licensed physician**.
- **Authentication State:** Log In and Sign Up buttons lead to clearly labeled prototype placeholder pages (`/auth/login` and `/auth/register`) and do not accept live credentials.

---

## 12. License

Academic Capstone Project & Open Prototype. Developed for education and healthcare accessibility.
