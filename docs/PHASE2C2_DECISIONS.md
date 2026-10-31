# MediVault AI — Phase 2C.2 Architecture Decision Records (ADRs - Revised)

**Document Version:** 2.0.0 (Post-Security Review Revisions)  
**Status:** Approved for Implementation Planning  
**Classification:** Security & Architecture Records

---

## ADR-001: Local Encrypted Filesystem Storage with Host-Bound Runtime

### Context

Inspection of the MediVault AI environment confirmed the Express backend runs natively on Windows 11 (Node v23.9.0) with PostgreSQL 16 containerized via Docker Desktop. Linux POSIX permissions (`chmod 0700/0600`) do not function on Windows NTFS.

### Decision

Implement an environment-aware storage path via `VAULT_STORAGE_ROOT`:

- **Development (Windows Host):** Resolves to `<repo_root>/storage_vault` outside web roots, ignored by Git. Security relies on non-static routing and application isolation.
- **Production (Linux Container):** Mounts named Docker volume `medivault_vault_data` at `/var/lib/medivault/storage` with POSIX `0700` directory and `0600` file permissions.

---

## ADR-002: In-Memory Authenticated Decryption (Verify-Before-Release)

### Context

Streaming AES-GCM ciphertext directly to the HTTP response releases unauthenticated plaintext chunks before `decipher.final()` validates the authentication tag. If ciphertext is tampered with, client state is poisoned.

### Decision

Implement **Verify-Before-Release**:

1. For files under the 10 MB limit, read the complete encrypted blob into memory.
2. Complete `decipher.final()`, verifying both the GCM authentication tag and the Additional Authenticated Data (AAD) _before_ sending any bytes over HTTP.
3. If verification fails, throw error immediately and transmit zero plaintext bytes.
4. Bound concurrency to a maximum of 5 simultaneous decryptions via an in-memory semaphore to prevent V8 heap exhaustion. Scrub decrypted buffers via `buffer.fill(0)` after transmission.

---

## ADR-003: In-Memory Quarantine Staging & ClamAV TCP Streaming

### Context

Writing unencrypted uploads to temporary disk files leaves plaintext remnants on SSD flash blocks that resist standard deletion (`fs.unlink`) due to wear-leveling algorithms.

### Decision

1. Eliminate persistent disk quarantine. Stream incoming files (max 10 MB) directly into memory buffers.
2. Stream memory buffers to the local ClamAV daemon over TCP (`INSTREAM` command). Zero unencrypted patient files are written to physical disk.
3. **Fail-Closed Policy:** If ClamAV daemon is unreachable or offline, reject the upload immediately with HTTP 503. Zero unscanned files are ever marked `AVAILABLE`.

---

## ADR-004: Safe PDF Delivery via Attachment Download and Isolated Previews

### Context

Naive keyword stripping of PDF binary streams (`/JavaScript`, `/Launch`) is easily bypassed by compressed object streams, hex encodings, and font exploits.

### Decision

1. **Primary Delivery:** Safe download-only by default: `Content-Disposition: attachment; filename="sanitized.pdf"` with `X-Content-Type-Options: nosniff`.
2. **Inline Preview Architecture:**
   - **Recommended:** Server-side page rasterization into inert PNG images via an isolated worker (browser only ever receives static PNGs).
   - **Alternative:** Sandboxed PDF.js mounted inside an `<iframe>` with `sandbox="allow-scripts"` and `sandbox="allow-same-origin"` strictly omitted (giving it a `null` origin), with `enableScripting: false`.

---

## ADR-005: Quiesced Manifest Backup Protocol & Reconciliation

### Context

Running `pg_dump` and `tar` simultaneously does not guarantee transactional synchronization between relational metadata and physical files.

### Decision

1. Put vault in read-only maintenance mode (`VAULT_MAINTENANCE_MODE = true`) during backup.
2. Export a ground-truth manifest (`manifest.csv`) inside a PostgreSQL repeatable-read transaction.
3. The archive utility archives **strictly the files enumerated in the manifest**.
4. Implement an automated reconciliation utility (`npm run vault:reconcile`) to identify and isolate orphaned or missing blobs.

---

## ADR-006: Pessimistic Quota Locking & Cryptographic Shredding

### Context

Concurrent multi-tab uploads can bypass the 100 MB quota before previous transactions commit. Standard file unlinking does not physically wipe data from modern SSDs.

### Decision

1. Enforce pessimistic locking inside Prisma transactions: `SELECT id FROM users WHERE id = :userId FOR UPDATE`.
2. Rely on **Cryptographic Shredding**: Stored files on disk are always ciphertext. Destroying the 32-byte wrapped DEK in PostgreSQL mathematically renders the ciphertext permanently unrecoverable across all flash sectors and historical backups.
