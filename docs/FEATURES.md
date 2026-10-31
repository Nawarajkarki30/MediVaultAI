# MediVault AI — Feature Matrix & Roadmap

This document provides a clear breakdown of features currently implemented in **Phase 1**, features scheduled for future delivery (**Phase 2 & Phase 3**), and features explicitly designated as **out of scope**.

---

## 1. Phase 1: Foundation & Landing Page (Current Phase)

### ✅ Implemented Capabilities

#### 1.1 Responsive Landing Page (Approved Wireframe Implementation)

- **Header Navigation:**
  - Original MediVault AI health cross & shield brand logo.
  - Centered navigation links (`Home`, `Features`, `How It Works`, `For Families`, `Caregivers`, `About`) with smooth anchor scrolling.
  - Action buttons (`Log In`, `Sign Up`) leading to labeled nonfunctional prototype states.
  - Mobile slide-out navigation drawer with touch handling, ESC key dismissal, and backdrop blur.
  - Sticky navbar with scroll-based frosted-glass visual treatment.
- **Hero Section:**
  - Eyebrow pill: `"Your Health. Clearer. Safer. Together."` with medical checkmark badge.
  - Main headline: `"Your Personal Health Information, Made Simple with AI"` with `"Made Simple with AI"` in `#2675F5`.
  - Approved descriptive copy explaining report organization, plain language, and caregiver collaboration.
  - Dual call-to-actions: Primary `"Get Started ->"` button and secondary `"Learn More"` smooth-scroll trigger.
- **Interactive Dashboard Preview Component:**
  - Built purely in React, HTML, and CSS (no flat image or static screenshot).
  - macOS window chrome header with status dots (`red`, `yellow`, `green`) and prototype pill.
  - Left navigation sidebar with MediVault AI logo and navigation items.
  - Welcome banner with user profile indicator.
  - 3 metric overview cards: `5 Medical Reports`, `3 Family Members`, `2 Caregivers`.
  - Synthetic Recent Reports list (`Blood Test Report`, `X-Ray Report`, `Prescription`) with emerald `"Explained"` badges.
  - Interactive report click handler opening a simulated AI explanation modal in both English and Nepali.
- **Section C: Key Benefits (4 Cards):**
  - `Secure Storage`: "Keep your medical documents organized in one place."
  - `AI Explanations`: "Understand complex medical reports in simple English or Nepali."
  - `Family Sharing`: "Choose what information to share with trusted family members."
  - `Verified Caregivers`: "Explore non-medical assistance from verified caregivers."
- **Section D: How MediVault AI Works (3 Sequential Steps):**
  - `Step 1: Upload Your Reports`: Organize medical reports, prescriptions, and supporting documents.
  - `Step 2: Get AI Explanations`: Review extracted information and receive understandable explanations in English or Nepali.
  - `Step 3: Manage and Share`: Maintain your health information and control selected sharing permissions.
  - Desktop horizontal connecting arrows and mobile vertical stacked orientation.
  - Informational medical disclaimer callout: `"Planned AI explanations are informational only and do not replace medical advice."`
- **Extended Sections:**
  - `For Families`: Details granular report sharing and revocable access controls.
  - `Caregivers`: Details non-medical assistance boundaries and vetting requirements.
  - `About Project`: Capstone university origins and architectural scalability.
  - `CTA Banner`: Conversion banner leading to registration placeholder.
  - `Professional Footer`: Complete with sitemap, architectural documentation links, and disclaimer.
- **Auth Placeholder Pages:**
  - Dedicated routes `/auth/login` and `/auth/register` displaying a clear "Phase 1 Prototype — Coming Soon" state with disabled mock inputs and explicit nonfunctional labeling.

#### 1.2 Full-Stack Architecture & Backend Foundation

- Express server configured with TypeScript and structured architecture (`routes/`, `controllers/`, `services/`, `middleware/`, `utils/`, `config/`).
- `GET /api/health` endpoint returning system uptime, status, version, and environment without exposing secrets.
- Environment validation powered by Zod.
- Security headers enforced with Helmet.
- Restricted CORS configuration.
- Centralized error-handling middleware.
- Structured request logging middleware.

#### 1.3 Database Foundation

- Prisma ORM configured with PostgreSQL provider inside `database/prisma/schema.prisma`.
- Foundational `SystemHealth` schema table.
- Documented migration strategy in `database/prisma.config.ts`.

#### 1.4 Quality Assurance & Tooling

- npm workspaces monorepo structure.
- Vitest unit & integration tests for both frontend and backend.
- Supertest API tests for `/api/health` and 404 handler.
- React Testing Library tests for landing page rendering and wireframe compliance.
- Prettier and ESLint configuration.

---

## 2. Phase 2A: Secure Patient Authentication & Registration (Completed)

### ✅ Implemented Capabilities

#### 2.1 Backend Authentication API

- `POST /api/auth/register`: Public PATIENT registration with Argon2id hashing, input sanitization, and verification token generation.
- `POST /api/auth/login`: Credential validation, email verification restriction check, and HttpOnly session cookie issuance.
- `POST /api/auth/logout`: Server-side session revocation and cookie clearance.
- `GET /api/auth/me`: Authenticated user profile retrieval with session touch.
- `POST /api/auth/verify-email`: One-time token verification activating patient accounts.
- `POST /api/auth/resend-verification`: Rate-limited token resend with anti-enumeration response.
- `POST /api/auth/forgot-password` & `POST /api/auth/reset-password`: Time-limited password recovery with automatic session revocation.
- `GET /api/auth/csrf`: Double-submit CSRF cookie issuance.

#### 2.2 Responsive UI & Wireframe Fidelity

- **Login Page (`/auth/login`):** Two-column desktop and single-column mobile layouts matching approved wireframe with 4 value propositions, patient illustration with script callout, password toggle, disabled social logins, and medical disclaimer.
- **Registration Page (`/auth/register`):** Step 1 (form with password strength meter, confirm password, Terms/Privacy acceptance modal) and Step 2 (email verification notice with countdown and dev 1-click preview).
- **Patient Dashboard Shell (`/patient/dashboard`):** Minimal authenticated dashboard shell with verified status badge, account metadata, working logout, and Phase 2B roadmap cards with zero fake clinical data.
- **Access Guarding:** `<ProtectedRoute>` component protecting authenticated routes and ensuring email verification before vault access.

---

## 3. Phase 2B: Complete Patient Dashboard Frontend (Completed)

### ✅ Implemented Capabilities

- **Desktop & Mobile Wireframe Fidelity (1440px & 375px):**
  - Two-column desktop dashboard canvas and dedicated mobile bottom navigation layout.
  - Sticky left sidebar with 7 navigation items, authenticated patient card, and real session logout.
  - Top header with global search (`Ctrl K` shortcut), notification badge with interactive popover, bilingual language selector, and patient profile dropdown.
  - Dynamic time-appropriate welcome hero ("Good morning / afternoon / evening") with authenticated patient's actual name and custom health illustration.
  - Summary metric cards with trend badges and explicit demonstration indicators.
  - Recent medical reports table on desktop and responsive card list on mobile with category filter pills (`All`, `Blood Tests`, `X-Ray`, `Prescription`, `Health Checkup`) and live search filtering.
  - Dual-language AI explanation preview card with instant English/Nepali toggling and prominent medical disclaimer.
  - Family sharing overview card with relative avatars, permission status badges, and invitation CTA.
  - 5 Quick Action cards with accessible feedback.
  - Mobile bottom navigation bar (5 tabs: `Home`, `Vault`, `AI`, `Family`, `More`) with slide-up sheet and safe-area padding.
- **Bilingual Interface Support:**
  - Full dictionary in `frontend/src/lib/translations.ts` providing seamless UI label translations between English and Nepali.
- **Accessible Interactive Modals:**
  - `DemoReportModal`: Interactive preview of synthetic clinical documents with simplified findings and medical disclaimer.
  - `DemoUploadModal`: Drag-and-drop document upload simulation with clear Phase 2C notice.
  - `InviteFamilyModal`: Family invitation dialog simulation.
  - `ComingSoonModal`: Roadmap notification dialog for future capabilities.

---

## 4. Phase 2C.1: Personal Health Vault Frontend (Current Phase - Completed)

### ✅ Implemented Capabilities

- **Wireframe Fidelity & Vault Architecture (`/patient/vault`):**
  - Header with security badge (`Private. Organized. In Your Control.`), bilingual title/subtitle, upload CTA, and dismissible demo disclaimer banner.
  - 7 category filter chips with live document count badges matching wireframe counts: `All (12)`, `Laboratory Reports (4)`, `Prescriptions (2)`, `Imaging Reports (2)`, `Discharge Summaries (2)`, `Consultation Notes (1)`, `Other (1)`.
  - Comprehensive filter toolbar: live multi-attribute search (title, facility, keywords), file type dropdown (`PDF`, `JPG / JPEG`, `PNG`), processing status dropdown (`Uploaded`, `Pending Review`, `Reviewed`, `Extraction Not Available`), and sorting options.
  - Responsive Grid and List/Table view presentation toggle with saved session view preference.
  - Mobile filter drawer slide-up sheet with complete filter options and date range selectors.
- **High-Fidelity Document Presentation & Visual Emblems:**
  - Custom SVG radiological and clinical thumbnails: PA Chest X-Ray radiograph, Axial Brain MRI scan, tabular lab reports, Rx emblem.
  - Standardized clinical status badges (`Reviewed`, `Pending Review`, `Uploaded`, `Extraction Not Available`).
- **Interactive Document Action Menu & Modals:**
  - `View Document`: Dedicated routing to document detail view.
  - `Edit Title (Demo)`: In-memory document renaming modal.
  - `Change Category (Demo)`: Category reclassification modal with dynamic count updates.
  - `Download`: Client-side synthetic clinical report file download.
  - `Delete Document (Demo)`: Destructive confirmation modal with empty state fallback and 1-click demo restoration button.
  - `Share with Family` & `Explain with AI`: Accessible "Coming Soon" roadmap modals.
- **Client-Side Upload Prototype Modal:**
  - Drag-and-drop canvas with file input fallback.
  - Client-side validation: format check (`.pdf`, `.png`, `.jpg`, `.jpeg`) and $10\text{ MB}$ size enforcement.
  - Selected file card with computed file size and remove action.
  - Explicit prototype notices confirming zero server transmission or persistence in this phase.
- **Document Detail View (`/patient/vault/:documentId`):**
  - Simulated interactive PDF/image viewer with zoom, print, download, and multi-page layout.
  - Realistic medical findings preview: Analyte lab tables, radiographic annotations, and Rx dosage regimens.
  - Honest unavailable state for handwritten documents requiring clinical transcription.
  - Comprehensive metadata grid (facility, physician, document date, added date, size, type).
  - Highlighted extracted clinical findings callout in English and Nepali.
  - Patient personal notes textarea with session save and confirmation feedback.
- **Privacy Safeguards Panel:**
  - Dedicated architecture callout explaining Private by Default, Granular Sharing, and Revocable Access.

---

## 5. Planned Phase 2C.2 & 2D: Document Storage & AI Extraction Engine

These features are planned and architected, but **not yet active** in Phase 2C.1:

- **Medical Document Ingestion & Storage (Phase 2C.2):**
  - Prisma database schema for `MedicalDocument`, `DocumentCategory`, and `DocumentNote`.
  - Multi-file multipart uploader supporting PDF, JPEG, PNG, HEIC.
  - Virus scanning, metadata sanitization, and MIME sniffing.
  - S3-compatible cloud object storage with server-side encryption (SSE-S3 or SSE-KMS).
- **OCR Extraction & VLM Pipeline (Phase 2D):**
  - High-accuracy optical character recognition and visual language model extraction.
  - Research evaluation target: $\ge 95\%$ verified field extraction accuracy on supported structured report types.
  - Tabular laboratory result parsing (analyte name, observed value, unit, reference range).
- **Bilingual Generative AI Explanation Engine:**
  - Medically guardrailed prompts converting clinical terminology into readable grade-6 explanations.
  - Native dual-language output: English and Nepali (देवनागरी).
  - Highlighting out-of-range lab markers with neutral, non-alarmist summaries.
  - Mandatory clinical disclaimer injection on every generated summary.

---

## 6. Planned Phase 3: Family Sharing & Caregiver Network

- **Family Permission Center:**
  - Inviting family members via secure invitation tokens.
  - Document-level permission toggles (`VIEW_ALL`, `VIEW_SPECIFIC`, `VIEW_SUMMARY_ONLY`).
  - Time-limited access expiry (e.g., share with sibling for 7 days).
- **Caregiver Assistance Network:**
  - Non-medical caregiver registration portal.
  - Verification badge pipeline (national ID check, background qualification verification).
  - Scoped caregiver dashboard: View medication reminders and schedule notes only (no access to clinical records).
- **Audit Logging & Transparency:**
  - Immutable audit trail recording every document view, share, or download by family members or caregivers.

---

## 4. Explicitly Out of Scope (Safety Boundaries)

To maintain absolute ethical and clinical safety, the following capabilities are **explicitly out of scope**:

- ❌ **Direct Medical Diagnosis:** MediVault AI will never provide a definitive diagnosis or replace clinical judgment.
- ❌ **Prescription Changes or Medication Alteration:** The platform will never suggest changing dosage, stopping medications, or initiating treatments.
- ❌ **Emergency Telemedicine or Triage:** The platform is not an emergency response dispatch service.
- ❌ **Unverified Medical Advice:** AI models are strictly constrained via safety system prompts to decline queries requesting diagnosis for urgent medical emergencies.
