# MediVault AI — Architecture Specification

## 1. System Overview

**MediVault AI** is a modular, AI-powered personal healthcare information management platform designed to help patients and families store medical records, understand clinical documents through plain-language explanations in English and Nepali, and coordinate care with trusted family members and verified caregivers.

The system is organized as an enterprise-grade monorepo using **npm workspaces**, architected from Day 1 for clean separation of concerns, strict type-safety, and smooth transition from an academic university project to production deployment.

```
+-------------------------------------------------------------------------+
|                                CLIENT LAYER                             |
|                                                                         |
|   React 19 + TypeScript (Vite Bundler, Tailwind CSS, Lucide Icons)      |
|   +-----------------------+  +---------------------------------------+  |
|   | Public Landing Page   |  | Interactive Dashboard Preview (Sim)   |  |
|   +-----------------------+  +---------------------------------------+  |
|   | Auth Prototype State  |  | Role Navigation (Families / Caregiver)|  |
|   +-----------------------+  +---------------------------------------+  |
+-------------------------------------------------------------------------+
                                    |
                            HTTP / REST (JSON)
                                    v
+-------------------------------------------------------------------------+
|                                BACKEND API                              |
|                                                                         |
|   Node.js + Express (TypeScript, Zod Validation, Helmet, CORS)          |
|   +-----------------------------------------------------------------+   |
|   | Security & Guard Rails: Helmet CSP, Restricted Origins CORS     |   |
|   | Logging & Telemetry: Structured Request Logger, AppError        |   |
|   | Centralized Error Handler: Zod, Operational & Internal Errors   |   |
|   | API Router: /api/health (System status, uptime, version)        |   |
|   +-----------------------------------------------------------------+   |
+-------------------------------------------------------------------------+
                                    |
                           Prisma ORM Client
                                    v
+-------------------------------------------------------------------------+
|                              PERSISTENCE LAYER                          |
|                                                                         |
|   PostgreSQL Database                                                   |
|   +-----------------------------------------------------------------+   |
|   | Phase 1: system_health (Health verification & version baseline) |   |
|   | Phase 2A: users, sessions, verification_tokens, reset_tokens     |   |
|   | Phase 2B (Planned): medical_documents, ai_explanations          |   |
|   | Phase 3 (Planned): family_permissions, caregivers, audit_logs   |   |
|   +-----------------------------------------------------------------+   |
+-------------------------------------------------------------------------+
```

---

## 2. Monorepo Organization & Workspace Boundaries

```
medivault-ai/
├── frontend/    -> Presentation tier: React 19, Tailwind CSS, React Router, Auth Context
├── backend/     -> Application tier: Node.js, Express, Argon2id, Zod, Helmet, TypeScript
├── database/    -> Persistence tier: Prisma ORM, migrations, PostgreSQL schema
└── docs/        -> Engineering, architecture, and security specifications
```

### 2.1 Workspace Isolation Rules

- **Loose Coupling:** The `frontend` communicates with the `backend` strictly over standard HTTP REST APIs with JSON serialization. No direct backend imports or internal data leakages are permitted in frontend code.
- **Data Encapsulation:** The `database` workspace manages Prisma client generation, migrations, and schema definitions. The backend imports the generated Prisma client for database transactions.
- **Shared Contracts:** In future phases, shared TypeScript interfaces (DTOs, domain models) will reside in a shared `@medivault/types` package.

---

## 3. Frontend Architecture

### 3.1 Technology Stack

- **Framework:** React 19 with strict TypeScript
- **Build Tool:** Vite 6 with instant HMR and optimized tree-shaking
- **Styling:** Tailwind CSS with standardized design tokens matching the approved wireframe:
  - Primary Blue: `#2675F5`
  - Dark Navy: `#0B1B49`
  - Canvas Background: `#F8FBFF`
  - Card Border: `#E2EAF8`
  - Text Muted: `#526482`
- **Routing:** React Router v7 with declarative route definitions
- **Icons:** Lucide React for consistent, accessible iconography
- **Testing:** Vitest + React Testing Library + jsdom

### 3.2 Component Hierarchy & Responsibilities

- **`components/common/`:**
  - `Logo`: Scalable SVG emblem combining healthcare cross and rounded shield with brand typography.
  - `Button`: Accessible interactive control with 4 distinct visual variants (`primary`, `secondary`, `outline`, `ghost`), support for internal routing (`to`), external links (`href`), or standard triggers.
  - `Badge`: Status and categorization indicators (e.g. "Explained", "Interactive Preview").
  - `Card`: Standardized container with elevation, borders, and hover micro-interactions.
- **`components/layout/`:**
  - `Navbar`: Sticky header with scroll-aware glassmorphism, responsive navigation drawer, accessible ESC-key traps, and mobile screen support.
  - `Footer`: Comprehensive site footer containing product navigation, architectural links, legal notices, and clinical disclaimer.
- **`components/landing/`:**
  - `HeroSection`: Prominent value proposition, eyebrow pill, primary CTAs, and dashboard preview container.
  - `DashboardPreview`: Pure React + CSS representation of the approved wireframe dashboard featuring macOS window chrome, collapsible navigation, summary stats, synthetic recent reports, and an interactive bilingual explanation modal (English/Nepali).
  - `KeyBenefits`: 4-card grid highlighting core platform value propositions.
  - `HowItWorks`: 3-step sequential workflow featuring desktop connecting arrows and medical disclaimer callout.
  - `FamilyAndCaregivers`: Dedicated breakdowns of family sharing boundaries and verified caregiver scoping.
  - `AboutSection`: Capstone project background and long-term vision.
  - `CtaSection`: Final conversion banner.

---

## 4. Backend Architecture

### 4.1 Technology Stack

- **Runtime:** Node.js (LTS v20+)
- **Server Framework:** Express
- **Language:** TypeScript 5.7+
- **Validation:** Zod for runtime environment parsing and request payload validation
- **Security Middleware:** Helmet for security headers, CORS restricted to configured frontend origins
- **Testing:** Vitest + Supertest

### 4.2 Layered Architecture

1. **Entrypoint (`server.ts`):** Handles process lifecycle, environment bootstrapping, port binding, and graceful shutdown on SIGTERM / SIGINT signals.
2. **App Factory (`app.ts`):** Configures security middleware, body parsers, logging pipeline, API routing, 404 handler, and error-handling middleware.
3. **Configuration (`config/env.ts`):** Validates required environment variables at boot time using a strict Zod schema. If variables are missing or misconfigured, the process exits with descriptive errors.
4. **Middleware:**
   - `cors.ts`: Enforces strict CORS policy allowing only authorized origin domains.
   - `requestLogger.ts`: Logs HTTP verb, path, response status, and latency duration in milliseconds.
   - `notFoundHandler.ts`: Emits structured 404 JSON payloads for unmatched routes.
   - `errorHandler.ts`: Central error trap separating operational `AppError`, Zod validation errors, and unexpected internal crashes.
5. **Controllers & Services:**
   - `HealthController` -> `HealthService`: Generates system telemetry (uptime, service name, status, timestamp) without exposing underlying passwords or connection strings.

---

## 5. Security & Privacy Architecture (Foundational Principles)

Although full patient data storage and authentication are scheduled for Phase 2, the architectural foundation enforces:

1. **Least Privilege & Zero-Trust Defaults:** No endpoint exposes database internals, credentials, or arbitrary file system paths.
2. **Defense in Depth:** Helmet headers disable frame sniffing, force content security standards, and mitigate clickjacking.
3. **Scoped Origins:** Cross-Origin Resource Sharing (CORS) is explicitly bounded to localhost development origins and configured production domains.
4. **Planned Encryption Architecture (Phase 2):**
   - At-rest encryption using AES-256-GCM for medical file blobs stored in object storage (e.g., S3/Cloud Storage).
   - In-transit encryption using TLS 1.3 for all client-to-API and API-to-Database traffic.
   - Field-level encryption for sensitive Personal Health Information (PHI) identifiers.
5. **Planned Audit Pipeline (Phase 3):**
   - Read and write events on medical reports will emit append-only audit entries to `audit_logs`.

---

## 6. Bilingual NLP Pipeline (Proposed Architecture for Phase 2)

```
[ Uploaded Medical Document (PDF / Image) ]
                   │
                   ▼
       [ Secure Ingestion API ]
                   │
                   ▼
      [ Pre-processing & OCR Engine ]
  (Tesseract.js / AWS Textract / Google Cloud Vision)
                   │
                   ▼
       [ Extracted Text & Data Blocks ]
                   │
                   ▼
     [ Medically Guardrailed LLM Prompt ]
   (Gemini 1.5 Pro / GPT-4o with Medical Safety Filter)
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
[ English Explanation ]  [ Nepali Explanation ]
(Simple vocabulary,     (सरल नेपाली भाषामा सारांश,
 normal ranges)           पारिवारिक बुझाइ)
```
