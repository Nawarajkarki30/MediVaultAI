# MediVault AI — Local Development & Contribution Guide

## 1. Prerequisites

Ensure your development machine meets the following minimum requirements:

- **Node.js:** `>= 20.0.0 LTS` (Recommended: Node 22.x or 20.x)
- **npm:** `>= 10.0.0`
- **PostgreSQL (Optional for Phase 1, Required for Phase 2):** `>= 15.0`
- **Git:** `>= 2.30`

---

## 2. Quickstart Instructions

### 2.1 Clone & Setup Environment

```bash
# Clone the repository
git clone <repo-url>
cd medivault-ai

# Copy environment template
cp .env.example .env
```

### 2.2 Install Dependencies

This project uses **npm workspaces** to manage packages across `frontend`, `backend`, and `database` from the repository root:

```bash
npm install
```

### 2.3 Database Setup (PostgreSQL)

Launch PostgreSQL using Docker or local service:

```bash
# Launch PostgreSQL 16 container with Docker Compose
npm run docker:db:up

# Verify connection to PostgreSQL
npm run db:verify

# Generate Prisma client and apply migrations
npm run prisma:generate
npm run prisma:migrate
```

If Docker Desktop is not running, start Docker Desktop from your Windows applications menu first, then execute `npm run docker:db:up`.

### 2.4 Start Development Servers

Run both backend and frontend concurrently:

```bash
npm run dev
```

Or start each service independently in separate terminals:

```bash
# Start backend API (http://localhost:5000)
npm run dev:backend

# Start frontend application (http://localhost:5173)
npm run dev:frontend
```

---

## 3. Development Scripts Reference

| Command                   | Workspace       | Description                                                    |
| :------------------------ | :-------------- | :------------------------------------------------------------- |
| `npm run dev`             | Root            | Concurrently launches backend (`:5000`) and frontend (`:5173`) |
| `npm run dev:frontend`    | Root / Frontend | Launches Vite frontend development server with HMR             |
| `npm run dev:backend`     | Root / Backend  | Launches Express API with tsx file-watcher                     |
| `npm run build`           | All             | Builds all packages (`frontend`, `backend`, `database`)        |
| `npm run test`            | All             | Runs Vitest test suites for frontend and backend               |
| `npm run typecheck`       | All             | Executes TypeScript compiler check without emitting output     |
| `npm run lint`            | All             | Executes ESLint across workspaces                              |
| `npm run format`          | Root            | Formats all files with Prettier                                |
| `npm run format:check`    | Root            | Checks code formatting without modifying files                 |
| `npm run prisma:generate` | Database        | Generates Prisma client types from `schema.prisma`             |
| `npm run prisma:migrate`  | Database        | Runs Prisma development migrations against local PostgreSQL    |

---

## 4. Coding Conventions & Standards

### 4.1 TypeScript Standards

- **Strict Mode Enabled:** Never use `any` without an explicit, documented reason.
- **Explicit Interfaces:** Name props interfaces clearly (e.g. `ButtonProps`, `NavItem`).
- **Module Resolution:** Bundler mode for frontend (`@/*` alias resolves to `frontend/src/*`), Node mode for backend.

### 4.2 Styling & Design Tokens

- Always use the approved Tailwind tokens:
  - Primary Blue: `text-brand-500` or `bg-brand-500` (`#2675F5`)
  - Navy Headline: `text-brand-navy` (`#0B1B49`)
  - Subtle Surface: `bg-[#F8FBFF]` or `bg-brand-bg`
  - Supporting Muted: `text-brand-muted` (`#526482`)
  - Subtle Borders: `border-brand-border` (`#E2EAF8`)
- Avoid heavy drop shadows or oversized glows. Use `shadow-subtle` and `shadow-card`.

### 4.3 Git Commit Conventions

Follow the Conventional Commits specification:

- `feat: add bilingual toggle to dashboard explanation preview`
- `fix: resolve mobile drawer focus trapping on escape`
- `docs: update architecture specification with database ERD`
- `test: add Supertest suite for backend health endpoint`
