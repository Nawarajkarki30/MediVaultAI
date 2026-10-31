# MediVault AI — Phase 2C.2 Architecture Decision Records (ADRs)

**Document Version:** 1.0.0  
**Status:** Approved for Implementation Planning  
**Classification:** Security & Architecture Records  

---

## ADR-001: Local Encrypted Filesystem Storage with Host-Bound Docker Volume Mounts

### Context
MediVault AI requires persistent storage for uploaded medical documents. The platform is initially developed as a final-year university capstone project with Docker Desktop on Windows/Linux, designed for future migration to HIPAA-compliant cloud storage.

### Decision
Implement **Option A + B Hybrid**: A private encrypted local filesystem mounted into the Node.js backend container via a dedicated named Docker volume (`medivault_vault_data` at `/var/lib/medivault/storage`).
- Files are organized with 2-level hexadecimal sharding (`active/xx/yy/[uuid].enc`).
- POSIX permissions are locked to `0700` (directories) and `0600` (files).
- Files are completely inaccessible to web server public static routes.

### Consequences
- **Positive:** Zero external cloud costs, 100% offline development, zero memory overhead compared to MinIO, simple backup and recovery via standard Docker commands.
- **Negative:** Storage capacity is bounded by the local host disk; horizontal scaling requires migrating to S3 in enterprise production.

---

## ADR-002: Envelope Encryption using AES-256-GCM with Unique Per-Document DEKs

### Context
Medical documents contain sensitive Protected Health Information (PHI). Storing plaintext files exposes patient data in the event of volume theft, improper container mounts, or developer disk inspection.

### Decision
Implement **AES-256-GCM Envelope Encryption**:
1. Every document is encrypted using a unique, cryptographically random 256-bit Data Encryption Key (DEK).
2. The DEK is encrypted (wrapped) under a persistent 256-bit Master Key Encryption Key (KEK) and stored in PostgreSQL.
3. Cryptographic context binding via Additional Authenticated Data (AAD): `documentId || ownerId || storageVersion`.
4. Stored files contain raw ciphertext only; keys, nonces, and authentication tags reside in PostgreSQL.

### Consequences
- **Positive:** Compromise of an individual document DEK does not compromise any other document. Rotating the Master KEK requires re-encrypting only small database keys rather than gigabytes of file blobs.
- **Negative:** CPU overhead during encryption/decryption streaming (mitigated by AES-NI hardware acceleration and streaming chunks).

---

## ADR-003: Isolated Quarantine Staging & Fail-Closed Malware Scanning Policy

### Context
Medical uploads (PDFs, images) can be leveraged to deliver malicious binaries, polyglot payloads, or embedded scripts. If a malware scanner is offline or encounters an error, a decision must be made whether to accept or reject the file.

### Decision
1. Uploaded files stream directly to an isolated quarantine directory (`/storage/vault/quarantine/`).
2. Files are evaluated for magic byte signatures, extension validity, and scanned via ClamAV daemon.
3. **Fail-Closed Policy:** If the ClamAV daemon is unreachable, offline, or returns an error, the pipeline **must fail closed**. The file is immediately shredded, and HTTP `503 Service Unavailable` is returned. A file is never marked `AVAILABLE` without passing scan verification.

### Consequences
- **Positive:** Guarantees no unscanned file can enter the patient vault or trigger downstream processing.
- **Negative:** If the scanning service is down, uploads are temporarily blocked until service restoration.

---

## 4. ADR-004: Two-Tier Storage Metadata & Audit Logging Schema in PostgreSQL via Prisma

### Context
The relational database must track document clinical metadata, storage locations, cryptographic envelopes, and an immutable trail of patient interactions without violating data minimization.

### Decision
Create three distinct, normalized Prisma models:
1. `MedicalDocument`: Clinical & operational metadata (title, category, documentDate, status, ownerId, storageKey).
2. `DocumentStorageMetadata`: Cryptographic envelope (encryptedDek, dekNonce, dekAuthTag, fileNonce, fileAuthTag, sha256Checksum).
3. `DocumentAuditEvent`: Immutable audit trail (documentId, actorId, action, outcome, timestamp, ipAddress, userAgent).

### Consequences
- **Positive:** Clear separation of concerns; clinical queries do not needlessly load cryptographic keys into memory. Audit trails satisfy healthcare accountability standards.
- **Negative:** Requires multi-table transactions (`prisma.$transaction`) during upload and deletion.

---

## ADR-005: Application-Layer Ownership Enforcement with Prepared RLS Defense-in-Depth

### Context
PostgreSQL Row-Level Security (RLS) can enforce row filtering at the database layer. However, Prisma utilizes a persistent connection pool as a single database superuser, making session variable propagation (`SET LOCAL app.current_user_id`) complex and prone to connection recycling identity leaks if misconfigured.

### Decision
1. **Primary Enforcement:** Application-Layer Repository Isolation. Every database operation requires `ownerId: req.user.id` derived strictly from the verified HttpOnly session cookie.
2. **Error Masking:** Unauthorized attempts return HTTP `404 Not Found` rather than `403 Forbidden` to prevent document ID enumeration.
3. **RLS Strategy:** Document RLS SQL policies for enterprise production, but leave RLS disabled during local university capstone development to guarantee connection pool stability.

### Consequences
- **Positive:** Maximum reliability and performance with Prisma; zero risk of session variable bleed across pooled connections.
- **Negative:** Relies on backend developers strictly including `ownerId` in repository methods (enforced via automated integration tests).

---

## ADR-006: Temporary Decryption in Memory with Strict Streaming HTTP Headers

### Context
When a patient views or downloads a document, the ciphertext must be decrypted. Writing decrypted plaintext back to disk temporarily creates an unencrypted footprint and risk of residual data leakage.

### Decision
1. Files are decrypted **in memory on-the-fly** as a Node.js `Transform` stream directly to the HTTP response.
2. Plaintext is never written to temporary files on disk during viewing or downloading.
3. Download/Preview responses set strict headers:
   - `Content-Type`: Strictly detected MIME type (`application/pdf`, `image/jpeg`).
   - `Content-Disposition`: `attachment; filename="sanitized.pdf"` for downloads; `inline` with sandbox for previews.
   - `X-Content-Type-Options: nosniff`.
   - `Cache-Control: private, no-store, max-age=0, must-revalidate`.
   - `Pragma: no-cache`.

### Consequences
- **Positive:** Zero plaintext residue on the host filesystem or swap partition. Browser caches are instructed not to persist medical records to disk.
- **Negative:** Slightly higher transient RAM usage during concurrent multi-megabyte streams.

---

## ADR-007: Safe File Previews via Sandboxed Blob URLs and CSP Directive Hardening

### Context
Rendering PDFs and images in the browser presents Cross-Site Scripting (XSS) risks if files contain embedded HTML/JS or exploit browser rendering engine vulnerabilities.

### Decision
1. The frontend creates ephemeral, client-side Object URLs (`URL.createObjectURL(blob)`) that are revoked immediately upon modal closure (`URL.revokeObjectURL`).
2. PDF preview rendering occurs inside an `<iframe>` configured with strict HTML5 sandboxing:
   ```html
   <iframe sandbox="allow-same-origin" src="..." />
   ```
   (Note: `allow-scripts` is strictly omitted to prevent execution of embedded PDF JavaScript).
3. Production Helmet CSP directives enforce `default-src 'self'` and prohibit inline script evaluation.

### Consequences
- **Positive:** Complete neutralization of weaponized PDF JavaScript payloads in the browser.
- **Negative:** Interactive PDF form-filling features are disabled in preview mode (acceptable for medical reports).

---

## ADR-008: Air-Gapped AI Document Intelligence Ingestion Boundary (Phase 2D Pre-requisite)

### Context
Phase 2C is strictly focused on storage. Phase 2D will introduce medical document understanding (evaluating models such as PaddleOCR-VL and vision-language architectures). Clear architectural boundaries must be established now to protect patient privacy during future AI processing.

### Decision
1. **Air-Gapped Processing Staging:** AI processing will operate as an asynchronous worker consuming from a local background queue.
2. **Explicit Consent & Audit:** Documents will not be passed to AI workers without an explicit patient opt-in record in `DocumentAuditEvent`.
3. **No External Cloud AI APIs:** All initial Phase 2D models must run locally or on private university infrastructure. No patient documents will be transmitted to third-party public AI APIs (such as OpenAI or Google public endpoints) without explicit institutional review and anonymization filters.

### Consequences
- **Positive:** Uncompromised patient privacy; full control over medical document data flows.
- **Negative:** Requires local compute resources (GPU/RAM) when implementing Phase 2D.
