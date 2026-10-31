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

## 9. Current Features (Phase 1)

- 🎨 **Approved Homepage Wireframe Implementation:**
  - Premium healthcare SaaS visual identity with exact design tokens (`#2675F5`, `#0B1B49`, `#F8FBFF`, `#526482`).
  - Responsive header with mobile drawer, accessible ESC/focus management, and smooth navigation.
  - Hero section with approved headline, eyebrow pill, and primary/secondary CTAs.
  - Interactive **Dashboard Preview** with synthetic metrics, recent reports, and bilingual (English/Nepali) explanation modal.
  - **Section C: 4 Key Benefits** cards with clean Lucide icons.
  - **Section D: 3-step How It Works** sequential cards with desktop connector arrows.
  - Deep-dive sections for **Family Sharing** and **Caregiver Network**.
  - Informational medical disclaimer prominently displayed.
  - Labeled nonfunctional prototype pages for `/auth/login` and `/auth/register`.
- ⚡ **Express Backend Foundation:**
  - Hardened `/api/health` endpoint returning system uptime and version without exposing secrets.
  - Centralized error-handling middleware catching Zod errors, operational errors, and HTTP exceptions.
  - Strict Helmet CSP and CORS restricted to configured development origins.
- 🗄️ **Database Baseline:**
  - PostgreSQL Prisma schema with `SystemHealth` model.
  - Full Phase 2/3 entity relationship architecture documented in `docs/DATABASE.md`.

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
