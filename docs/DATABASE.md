# MediVault AI — Database Architecture & Schema Specification

## 1. Overview & Strategy

MediVault AI utilizes **PostgreSQL** as its relational database management system, paired with **Prisma ORM** for type-safe database queries, declarative schema definitions, and automated database migrations.

In accordance with Phase 1 requirements:

- The active schema is kept strictly minimal (`SystemHealth` baseline), establishing connection integrity and migration readiness without premature speculation on unverified tables.
- All proposed future entities for **Phase 2 & Phase 3** are exhaustively specified in this document with their columns, constraints, foreign keys, and indexes.

---

## 2. Phase 1 Schema (Current Implementation)

The active Prisma schema is located at `database/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

/// Baseline system health and version audit model.
model SystemHealth {
  id        String   @id @default(uuid())
  service   String   @unique @default("medivault-backend")
  status    String   @default("HEALTHY")
  version   String   @default("0.1.0")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("system_health")
}
```

---

## 3. Planned Future Entities (Phase 2 & Phase 3)

The following relational models will be introduced during the next development phases.

### 3.1 Entity Relationship Diagram (Proposed)

```mermaid
erDiagram
    USERS ||--o{ MEDICAL_DOCUMENTS : owns
    USERS ||--o{ FAMILY_PERMISSIONS : "grants/receives"
    USERS ||--o| CAREGIVERS : "profile (optional)"
    USERS ||--o{ AUDIT_LOGS : performs
    MEDICAL_DOCUMENTS ||--o{ AI_EXPLANATIONS : has
    MEDICAL_DOCUMENTS ||--o{ FAMILY_PERMISSIONS : targets
    CAREGIVERS ||--o{ AUDIT_LOGS : logs

    USERS {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        string role "PATIENT | FAMILY | CAREGIVER | ADMIN"
        string language_preference "en | ne"
        timestamp created_at
        timestamp updated_at
    }

    MEDICAL_DOCUMENTS {
        uuid id PK
        uuid user_id FK
        string title
        string category "LAB_REPORT | PRESCRIPTION | RADIOLOGY | DISCHARGE"
        string file_url
        string mime_type
        int file_size_bytes
        string ocr_raw_text
        jsonb parsed_data
        string processing_status "PENDING | PROCESSED | FAILED"
        timestamp document_date
        timestamp created_at
        timestamp updated_at
    }

    AI_EXPLANATIONS {
        uuid id PK
        uuid document_id FK
        string language "en | ne"
        text summary_text
        jsonb key_markers
        text lifestyle_notes
        text disclaimer
        string model_version
        timestamp created_at
    }

    FAMILY_PERMISSIONS {
        uuid id PK
        uuid owner_id FK
        uuid shared_with_user_id FK
        uuid document_id FK "nullable for global grant"
        string permission_level "READ_SUMMARY | READ_FULL | FULL_MANAGEMENT"
        timestamp expires_at
        boolean is_active
        timestamp created_at
    }

    CAREGIVERS {
        uuid id PK
        uuid user_id FK UK
        string verification_status "PENDING | VERIFIED | REJECTED"
        string[] qualifications
        jsonb vetting_metadata
        decimal rating
        boolean is_available
        timestamp verified_at
        timestamp created_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid actor_id FK
        string target_entity "DOCUMENT | PERMISSION | USER"
        uuid target_id
        string action "READ | WRITE | SHARE | REVOKE | DELETE"
        string ip_address
        string user_agent
        timestamp created_at
    }
```

---

## 4. Entity Field Details

### 4.1 `users`

Represents individual account holders.

- `id` (UUID, Primary Key): Unique identifier.
- `email` (VARCHAR(255), Unique, Indexed): Case-insensitive user email.
- `password_hash` (TEXT): Argon2id hashed secret.
- `full_name` (VARCHAR(150)): Display name.
- `role` (ENUM): User authorization scope (`PATIENT`, `FAMILY_MEMBER`, `CAREGIVER`, `ADMIN`).
- `language_preference` (VARCHAR(5)): Default language for explanations (`en` or `ne`).
- `is_email_verified` (BOOLEAN): Email confirmation status.
- `created_at`, `updated_at`: Standard audit timestamps.

### 4.2 `medical_documents`

Represents uploaded health records, scans, prescriptions, and test results.

- `id` (UUID, Primary Key): Unique identifier.
- `user_id` (UUID, Foreign Key -> `users.id`, Indexed): The patient owning the record.
- `title` (VARCHAR(255)): Human-readable label (e.g. "Annual Complete Blood Count").
- `category` (ENUM): Document classification (`LAB_REPORT`, `PRESCRIPTION`, `RADIOLOGY`, `DISCHARGE_SUMMARY`, `OTHER`).
- `file_url` (TEXT): Encrypted cloud object storage key/URL.
- `mime_type` (VARCHAR(100)): MIME type (e.g., `application/pdf`, `image/jpeg`).
- `ocr_raw_text` (TEXT, Nullable): Plain text extracted by OCR engine.
- `parsed_data` (JSONB, Nullable): Structured JSON representing biomarkers, units, and ranges.
- `processing_status` (ENUM): `PENDING_OCR`, `PROCESSING_AI`, `EXPLAINED`, `FAILED`.
- `document_date` (TIMESTAMP, Indexed): Date the clinical test or consultation took place.

### 4.3 `ai_explanations`

Stores generated plain-language summaries in English or Nepali.

- `id` (UUID, Primary Key): Unique explanation identifier.
- `document_id` (UUID, Foreign Key -> `medical_documents.id`, Indexed): Document being explained.
- `language` (VARCHAR(5)): `en` for English, `ne` for Nepali (नेपाली).
- `summary_text` (TEXT): Non-jargon narrative explanation.
- `key_markers` (JSONB): Highlighted biomarker badges (e.g., `[{"name": "Hemoglobin", "status": "NORMAL"}]`).
- `disclaimer` (TEXT): Mandatory informational medical disclaimer.
- `model_version` (VARCHAR(100)): Identifier of LLM prompt and engine for reproducibility.

### 4.4 `family_permissions`

Manages granular sharing between a patient and family members.

- `id` (UUID, Primary Key): Permission grant ID.
- `owner_id` (UUID, Foreign Key -> `users.id`): Patient owner of the records.
- `shared_with_user_id` (UUID, Foreign Key -> `users.id`): Receiving family member.
- `document_id` (UUID, Nullable, Foreign Key -> `medical_documents.id`): Specific document target. If NULL, applies to all current documents marked family-visible.
- `permission_level` (ENUM): `READ_SUMMARY_ONLY`, `READ_FULL_DOCUMENT`, `MANAGE_APPOINTMENTS`.
- `expires_at` (TIMESTAMP, Nullable): Optional automatic revocation date.
- `is_active` (BOOLEAN): Fast revocation toggle.

### 4.5 `caregivers`

Profiles for trained, verified non-medical assistance companions.

- `id` (UUID, Primary Key): Caregiver profile ID.
- `user_id` (UUID, Foreign Key -> `users.id`, Unique): Associated user account.
- `verification_status` (ENUM): `UNVERIFIED`, `IN_REVIEW`, `VERIFIED`, `SUSPENDED`.
- `vetting_metadata` (JSONB): References to verified national ID and certification documents.
- `rating` (DECIMAL(3, 2)): Community review rating.
- `is_available` (BOOLEAN): Current availability for service requests.

### 4.6 `audit_logs`

Immutable compliance and privacy log.

- `id` (UUID, Primary Key): Log identifier.
- `actor_id` (UUID, Foreign Key -> `users.id`, Indexed): User who accessed or modified the resource.
- `target_entity` (VARCHAR(50)): Resource type (`DOCUMENT`, `PERMISSION`, `EXPLANATION`).
- `target_id` (UUID): Identifier of the affected entity.
- `action` (VARCHAR(50)): Event name (`VIEW`, `DOWNLOAD`, `SHARE_REVOKED`, `EXPLANATION_GENERATED`).
- `ip_address` (VARCHAR(45)): Client IP for security audits.
- `user_agent` (TEXT): Browser / client string.
- `created_at` (TIMESTAMP, Indexed): Timestamp of event occurrence.

---

## 5. PostgreSQL Setup & Local Execution Guide

### 5.1 Environment Configuration

Define your database connection string in your local `.env` file:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/medivault_dev?schema=public
```

### 5.2 Prisma Commands

From the project root:

```bash
# Generate the Prisma Client
npm run prisma:generate

# Apply pending migrations or create a new development migration
npm run prisma:migrate

# Inspect the database visually in Prisma Studio
npm run studio --workspace=@medivault/database
```
