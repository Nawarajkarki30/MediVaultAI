# MediVault AI — Local PostgreSQL Operations Guide

**Scope:** Docker Desktop & PostgreSQL 16 Operations, Migrations, Backup, and Recovery  
**Target Database:** PostgreSQL 16 Alpine (`medivault-postgres`)  
**Network Isolation:** Bound strictly to `127.0.0.1:5434` (local machine only)

---

## 1. Container Architecture & Configuration

| Parameter             | Configuration Value                                                         | Reason                                                                                                                                                                  |
| :-------------------- | :-------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Docker Image**      | `postgres:16-alpine`                                                        | Lightweight, secure PostgreSQL 16 LTS engine                                                                                                                            |
| **Container Name**    | `medivault-postgres`                                                        | Deterministic container naming                                                                                                                                          |
| **Host Port Mapping** | `127.0.0.1:5434:5432`                                                       | Bound strictly to loopback (`127.0.0.1`) to prevent LAN exposure; port `5434` avoids collisions with other host projects (e.g. `dhago` on 5432, `cricketverse` on 5433) |
| **Named Volume**      | `medivault_postgres_data`                                                   | Persistent named Docker volume stored on Windows Docker VM                                                                                                              |
| **Database Name**     | `medivault_dev`                                                             | Isolated development database                                                                                                                                           |
| **Dev Credentials**   | `postgres:postgres`                                                         | Development-only default credentials (in `.env`, never in code)                                                                                                         |
| **Prisma Datasource** | `postgresql://postgres:postgres@localhost:5434/medivault_dev?schema=public` | Defined in `.env`                                                                                                                                                       |

---

## 2. Daily Database Operations

### 2.1 Starting PostgreSQL

Ensure Docker Desktop is open and the Linux Engine is active, then run:

```bash
# Option A: npm script
npm run docker:db:up

# Option B: Docker Compose directly
docker compose up -d
```

### 2.2 Verifying Container Health & Connectivity

```bash
# Check Docker container status (should show 'healthy')
docker ps --filter "name=medivault-postgres"

# Verify connection via Prisma query
npm run db:verify

# Run full end-to-end authentication lifecycle against PostgreSQL
npx tsx scripts/test-live-auth.ts
```

### 2.3 Stopping PostgreSQL (Safe Shutdown)

To stop the container without deleting any data or named volumes:

```bash
# Option A: npm script
npm run docker:db:down

# Option B: Docker Compose directly
docker compose down
```

> [!NOTE]
> `docker compose down` stops the container and network while preserving the `medivault_postgres_data` volume completely. Never run `docker compose down -v` unless you intentionally want to wipe all local database records.

---

## 3. Database Migrations

### 3.1 Applying Migrations in Development

Migrations are version-controlled inside `database/prisma/migrations/`:

```bash
# Deploy pending migrations to PostgreSQL
npx prisma migrate deploy --schema=database/prisma/schema.prisma
```

### 3.2 Generating Prisma Client

Whenever the schema changes:

```bash
npm run prisma:generate
```

### 3.3 Inspecting Tables with Prisma Studio

To browse and inspect records visually in your browser:

```bash
npx prisma studio --schema=database/prisma/schema.prisma
# Opens http://localhost:5555
```

---

## 4. Backup & Disaster Recovery Procedures

### 4.1 Creating a Database Backup (`pg_dump`)

To create an immediate SQL dump of the `medivault_dev` database:

```powershell
# PowerShell / CMD
docker exec -t medivault-postgres pg_dump -U postgres medivault_dev > medivault_dev_backup.sql
```

For compressed custom format (`.dump`):

```powershell
docker exec -t medivault-postgres pg_dump -U postgres -F c medivault_dev > medivault_dev_backup.dump
```

### 4.2 Restoring from a Backup (`psql`)

To restore your development database from an existing SQL backup file:

```powershell
# Plain SQL restore:
docker exec -i medivault-postgres psql -U postgres -d medivault_dev < medivault_dev_backup.sql

# Compressed custom dump restore:
docker exec -i medivault-postgres pg_restore -U postgres -d medivault_dev medivault_dev_backup.dump
```

---

## 5. Multi-Project Port Isolation

During audit inspection, multiple projects were identified in Docker Desktop on this development machine:

- `dhago-db-1`: PostgreSQL listening on host port `5432`
- `cricketverse-postgres`: PostgreSQL listening on host port `5433`
- `gt-audit-pg`: PostgreSQL mapped to host port `55432`
- `medivault-postgres`: PostgreSQL listening on host port `5434` (Strictly `127.0.0.1`)

By mapping `medivault-postgres` to host port `5434` and binding strictly to `127.0.0.1`:

1. All local Docker projects run concurrently without port binding conflicts.
2. PostgreSQL is inaccessible from other devices on your local Wi-Fi or LAN.
3. No foreign project containers or existing volumes are disrupted or modified.
