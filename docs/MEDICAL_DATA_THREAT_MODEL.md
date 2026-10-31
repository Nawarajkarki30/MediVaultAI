# MediVault AI — Medical Data Storage & Upload Threat Model

**Document Version:** 1.0.0  
**Methodology:** OWASP Top 10, OWASP ASVS v4.0 (File Upload & Cryptography), STRIDE  
**Status:** Approved for Implementation Planning  
**Classification:** Medical Security Specification  

---

## 1. Scope & Security Objectives

This threat model identifies, analyzes, and establishes verifiable countermeasures for security threats targeting medical document ingestion, storage, processing, and retrieval in MediVault AI. 

### Core Security Objectives:
1. **Patient Data Isolation:** Zero unauthorized cross-tenant or cross-patient document inspection or modification.
2. **Execution Neutralization:** Medical files (PDFs, images) must remain inert data blobs; embedded scripts or active code must never execute in the backend runtime or patient browser.
3. **Availability & Resilience:** Prevent Denial of Service (DoS), storage flooding, and resource exhaustion against the local application.
4. **Cryptographic Assurance:** Stored payloads must remain unreadable without authorized decryption keys even upon physical disk theft.

---

## 2. Threat Actor Profiles

| Threat Actor | Capabilities & Motivation | Attack Vectors |
|---|---|---|
| **Malicious Authenticated Patient** | Valid session token; attempts to access or tamper with other patients' medical records or flood server storage. | BOLA/IDOR, path traversal, oversized file flooding, polyglot uploads. |
| **Unauthenticated External Attacker** | Network access to public ports; attempts to exploit exposed endpoints, bypass authentication, or upload exploits. | Unauthenticated endpoint probing, CSRF, brute force, DDoS. |
| **Compromised Trusted Relative / Caregiver** | Limited authorized token; attempts privilege escalation to view clinical documents beyond authorized scope. | Scope manipulation, token manipulation, API parameter tampering. |
| **Host / Infrastructure Intruder** | Access to host filesystem, Docker daemon, or database backups. | Reading plaintext volumes, stealing unencrypted database dumps. |

---

## 3. Comprehensive Threat Analysis Matrix

The following matrix documents each threat, assessing **Impact (C-I-A)**, **Likelihood (Low/Med/High)**, **Existing Controls (Phase 2A/2B)**, **Required Controls (Phase 2C.3)**, **Residual Risk**, and **Testable Verification Scenarios**.

---

### Threat 1: Unauthorized Document Uploads
- **Description:** An unauthenticated visitor or suspended user attempts to POST a file to the upload endpoint.
- **Impact:** Confidentiality: None, Integrity: High (untrusted records in database), Availability: Med (storage consumption).
- **Likelihood:** High.
- **Existing Controls:** Express routes use `authenticate` middleware checking the `medivault_session` HttpOnly cookie.
- **Required Controls:** Strict `authenticate` and `requireRole(Role.PATIENT)` guard on `POST /api/vault/upload`. Rejection of unverified email accounts.
- **Residual Risk:** Low (standard session token theft only).
- **Verification Test:** Send `POST /api/vault/upload` with no cookie, with an invalid cookie, and with an unverified account. Assert HTTP `401 Unauthorized` or `403 Forbidden`.

---

### Threat 2: Cross-Patient Document Access (BOLA / IDOR)
- **Description:** Patient A replaces `documentId` in `GET /api/vault/documents/:id` with Patient B's document ID.
- **Impact:** Confidentiality: Critical (unauthorized disclosure of sensitive clinical records).
- **Likelihood:** High (common API vulnerability).
- **Existing Controls:** Phase 2C.1 uses synthetic records only; real APIs not yet implemented.
- **Required Controls:** Backend queries must enforce: `WHERE id = :documentId AND ownerId = :sessionUserId`. Return `404 Not Found` (not `403`) to prevent document existence enumeration.
- **Residual Risk:** Negligible.
- **Verification Test:** Register Patient A and Patient B. Upload a document as Patient B. Attempt to fetch, download, or delete Patient B's document using Patient A's active session. Assert HTTP `404 Not Found`.

---

### Threat 3: Insecure Direct Object References (IDOR) via Client Owner Overrides
- **Description:** A client sends `{ ownerId: "victim-uuid" }` in the upload multipart form body to assign documents to another user.
- **Impact:** Integrity: High (inserting falsified records into another patient's vault).
- **Likelihood:** Medium.
- **Existing Controls:** None (upload API not implemented).
- **Required Controls:** Ignore any client-submitted `ownerId`. The backend must strictly derive document ownership from `req.user.id` populated by the verified session.
- **Residual Risk:** None.
- **Verification Test:** Submit upload with body `ownerId: "another-patient-id"`. Verify in the database that `ownerId` matches the authenticated caller's ID.

---

### Threat 4: Path Traversal (`../`, Null Bytes, Absolute Paths)
- **Description:** An attacker supplies malicious filenames (e.g., `../../../../etc/passwd` or `C:\Windows\System32\cmd.exe`) to overwrite critical system files or read host files.
- **Impact:** Integrity: Critical (system compromise), Confidentiality: Critical.
- **Likelihood:** Medium.
- **Existing Controls:** None.
- **Required Controls:** Never use user-supplied filenames in storage paths. Generate random UUIDv4 storage keys. Sanitize original filename strictly for display purposes using regex `[^a-zA-Z0-9._-]`.
- **Residual Risk:** None.
- **Verification Test:** Upload a file named `../../../../payload.pdf`. Confirm the file on disk is stored at `/storage/vault/active/xx/yy/[uuid].enc` and no directory escaping occurs.

---

### Threat 5: Malicious PDFs (Active Content, Launch Actions, Embedded Scripts)
- **Description:** Uploading weaponized PDF files containing embedded JavaScript (`/JS`, `/JavaScript`), executable Launch commands (`/Launch`), external URI actions (`/URI`), or infinite object loops.
- **Impact:** Confidentiality: High (DOM XSS upon viewing), Integrity: High.
- **Likelihood:** High.
- **Existing Controls:** None.
- **Required Controls:**
  1. PDF structural analysis: Parse PDF cross-reference table and reject or strip files containing `/JavaScript`, `/JS`, `/Launch`, `/EmbeddedFiles`.
  2. Display PDFs in isolated sandboxed `<iframe>` with CSP: `sandbox="allow-scripts=none"`.
  3. Header enforcement: `Content-Disposition: attachment` for raw downloads.
- **Residual Risk:** Low.
- **Verification Test:** Upload test PDF containing a benign JavaScript alert (`app.alert('XSS')`). Verify the upload pipeline rejects the file or completely strips the `/JavaScript` action before storage.

---

### Threat 6: Malicious Image Files (Polyglots, EXIF XSS, Pixel Flood)
- **Description:** Uploading an image with an HTML/JS payload disguised in EXIF metadata, or a decompression bomb image (1x1 pixel image with declared dimensions of 100,000 x 100,000 pixels).
- **Impact:** Availability: High (server memory exhaustion), Confidentiality: Medium (stored XSS).
- **Likelihood:** Medium.
- **Existing Controls:** Frontend checks file extension and 10 MB file size limit only.
- **Required Controls:**
  1. Inspect image dimensions using metadata header inspection; reject images exceeding 8,000 x 8,000 pixels.
  2. Strip all EXIF, XMP, and IPTC metadata before saving.
  3. Re-encode images using `sharp` to a standardized clean format, neutralizing polyglots.
- **Residual Risk:** Low.
- **Verification Test:** Upload an image containing embedded HTML in EXIF `ImageDescription`. Verify the saved image has empty EXIF tags and no executable code.

---

### Threat 7: Spoofed MIME Types vs. Magic Byte Signatures
- **Description:** An attacker renames `malware.exe` to `lab_report.pdf` and sets `Content-Type: application/pdf` in the HTTP header.
- **Impact:** Integrity: High (hosting malicious binaries), Availability: Medium.
- **Likelihood:** High.
- **Existing Controls:** Frontend validates MIME and extension in browser only.
- **Required Controls:** Server-side file signature inspection via `file-type` reading the first 4,100 bytes (magic numbers). Match magic bytes against strictly allowed signatures (`%PDF-`, `\x89PNG\r\n\x1a\n`, `\xff\xd8\xff`). Discard client `Content-Type` headers.
- **Residual Risk:** Negligible.
- **Verification Test:** Rename an executable file to `report.pdf`. Submit to upload endpoint. Verify backend rejects with HTTP `415 Unsupported Media Type`.

---

### Threat 8: Double-Extension Filenames (`payload.php.pdf`, `test.exe.jpg`)
- **Description:** Filenames crafted with multiple extensions to trick web server execution handlers or client desktop operating systems upon download.
- **Impact:** Integrity: High (potential client-side execution upon download).
- **Likelihood:** Medium.
- **Existing Controls:** None.
- **Required Controls:** Parse filename and extract extension using strict rsplit. Reject filenames containing multiple periods (e.g., `*.php.pdf`) or normalize the original name to a safe canonical string `[base]_[uuid].[ext]`.
- **Residual Risk:** Negligible.
- **Verification Test:** Upload `prescription.exe.pdf`. Confirm the system rejects the double extension or strips the inner dangerous extension.

---

### Threat 9: Oversized Files & Storage Flooding (DoS)
- **Description:** An attacker attempts to upload gigabyte-sized files to consume backend bandwidth, crash Node.js memory, or fill up server storage.
- **Impact:** Availability: Critical (service downtime).
- **Likelihood:** High.
- **Existing Controls:** Express JSON parser has `limit: '1mb'`. Frontend prototype checks 10 MB limit.
- **Required Controls:**
  1. Multipart stream limit: Configure `busboy` / `multer` with hard limit `limits: { fileSize: 10 * 1024 * 1024 }` (10 MB).
  2. Terminate stream immediately when byte count exceeds 10 MB; abort write and unlink partial temp file.
  3. Enforce per-patient total storage quota ($100\text{ MB}$).
- **Residual Risk:** Low.
- **Verification Test:** Stream a 25 MB file to upload endpoint. Verify the connection is terminated at exactly 10 MB with HTTP `413 Payload Too Large`, and zero bytes are retained on disk.

---

### Threat 10: Decompression Bombs & Container Explosions
- **Description:** Uploading highly compressed files (e.g., zip bombs or gzip-compressed PDF objects) that expand exponentially upon parsing.
- **Impact:** Availability: High (CPU/RAM exhaustion).
- **Likelihood:** Low-Medium.
- **Existing Controls:** Zip files are not accepted.
- **Required Controls:** Strict exclusion of archive extensions (`.zip`, `.tar`, `.gz`, `.7z`). Configure PDF parser with decompression ratio limits (e.g., maximum uncompressed object expansion 10x).
- **Residual Risk:** Low.
- **Verification Test:** Submit a gzip-compressed payload disguised as a PDF. Verify parser terminates processing if expansion exceeds limit.

---

### Threat 11: Embedded Active Content (SVG Scripts, Flash, ActiveX)
- **Description:** Using SVG image format (which supports XML and `<script>` tags) to execute client-side JavaScript.
- **Impact:** Confidentiality: High (session cookie theft or UI redress), Integrity: High.
- **Likelihood:** High if SVG were permitted.
- **Existing Controls:** Phase 2C.1 explicitly allows only `.pdf`, `.png`, `.jpg`, `.jpeg`.
- **Required Controls:** Strictly forbid SVG uploads (`image/svg+xml`). Do not include SVG in allowed MIME types or extension lists.
- **Residual Risk:** None.
- **Verification Test:** Attempt to upload an image with extension `.svg` or magic bytes `<?xml` / `<svg`. Verify immediate rejection with HTTP `415 Unsupported Media Type`.

---

### Threat 12: Malware & Virus Payloads
- **Description:** Uploading files infected with known trojans, ransomware, or clinical document exploits.
- **Impact:** Confidentiality: Critical, Integrity: Critical, Availability: High.
- **Likelihood:** Medium.
- **Existing Controls:** None.
- **Required Controls:**
  1. File saved initially in isolated quarantine directory (`/storage/vault/quarantine/`).
  2. ClamAV malware daemon scans file stream.
  3. **Fail-Closed Policy:** If ClamAV daemon is unreachable, the file status remains `QUARANTINED` and cannot be decrypted or accessed.
  4. Detected malware causes immediate atomic file shredding, state update to `REJECTED`, and security audit logging.
- **Residual Risk:** Low (zero-day malware not in antivirus signatures).
- **Verification Test:** Upload standard benign EICAR test string (`X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR...`). Verify ClamAV flags the payload, sets status to `REJECTED`, and deletes the quarantine file.

---

### Threat 13: Cross-Site Scripting (XSS) via Document Previews
- **Description:** An uploaded document is served with `Content-Type: text/html` or without restrictive headers, enabling attacker JavaScript to execute in the patient's authenticated session context.
- **Impact:** Confidentiality: Critical (session hijacking), Integrity: High.
- **Likelihood:** High.
- **Existing Controls:** Helmet middleware sets security headers in production.
- **Required Controls:**
  1. Preview endpoint returns strict headers:
     - `Content-Type: application/pdf` or `image/jpeg` (explicitly detected, never client-controlled).
     - `X-Content-Type-Options: nosniff`.
     - `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox`.
  2. Previews rendered inside sandboxed iframes.
- **Residual Risk:** Negligible.
- **Verification Test:** Attempt to serve an HTML payload disguised as PDF. Verify browser receives `X-Content-Type-Options: nosniff` and refuses to interpret as HTML.

---

### Threat 14: Cross-Site Request Forgery (CSRF) on Upload & Delete
- **Description:** An external malicious site tricks an authenticated patient into submitting an upload or deleting documents via auto-submitting forms.
- **Impact:** Integrity: High (unauthorized document deletion or forged uploads).
- **Likelihood:** Medium.
- **Existing Controls:** `csrfProtection` middleware validates `medivault_csrf_token` cookie against `X-CSRF-Token` header.
- **Required Controls:** Ensure all state-changing endpoints (`POST /api/vault/upload`, `PATCH /api/vault/:id`, `DELETE /api/vault/:id`) execute `csrfProtection` middleware.
- **Residual Risk:** Low.
- **Verification Test:** Submit a `POST` or `DELETE` request with an authenticated session cookie but missing or invalid `X-CSRF-Token` header. Assert HTTP `403 Forbidden`.

---

### Threat 15: Resource Exhaustion during Encryption / Decryption
- **Description:** Uploading files that cause high CPU spikes during cryptographic operations, degrading server performance for all users.
- **Impact:** Availability: Medium.
- **Likelihood:** Low-Medium.
- **Existing Controls:** Rate limiter middleware exists in backend (`rateLimiter.ts`).
- **Required Controls:**
  1. Stream-based encryption using Node.js `crypto.createCipheriv` with small chunk buffers (64 KB). Avoid loading entire 10 MB files into contiguous V8 memory buffers.
  2. Concurrency limiting: Maximum 2 concurrent encryption/decryption operations per user.
- **Residual Risk:** Low.
- **Verification Test:** Initiate 10 simultaneous uploads from a single account. Verify rate limiter or queue throttles execution to protect system stability.

---

### Threat 16: Storage Flooding & Disk Exhaustion
- **Description:** Creating multiple patient accounts to fill up the host volume with valid 10 MB files.
- **Impact:** Availability: High (disk full condition halts PostgreSQL and Express).
- **Likelihood:** Medium.
- **Existing Controls:** Rate limiting on auth endpoints.
- **Required Controls:**
  1. Require email verification before upload privileges are granted.
  2. Enforce global disk space monitoring; fail closed when host storage drops below 1 GB.
  3. Patient storage quota: maximum 10 documents or 100 MB per account for local development.
- **Residual Risk:** Low.
- **Verification Test:** Fill an account to 100 MB. Attempt to upload an additional document. Verify backend rejects with `400 Bad Request` ("Storage quota exceeded").

---

### Threat 17: Unsafe Temporary Files & Plaintext Remnants
- **Description:** Plaintext upload chunks or decrypted files remain in `/tmp` or swap space after processing.
- **Impact:** Confidentiality: High (data exposure to other host processes or forensic recovery).
- **Likelihood:** Medium.
- **Existing Controls:** None.
- **Required Controls:**
  1. Quarantine directory located on the same secure volume as active storage.
  2. Guaranteed cleanup inside `finally` blocks for all temp files.
  3. Overwrite temp file buffers with zeros prior to unlinking when feasible (`crypto.randomFillSync`).
- **Residual Risk:** Low.
- **Verification Test:** Trigger an upload error midway through parsing. Inspect quarantine directory; verify zero orphaned files remain.

---

### Threat 18: Metadata Leakage in Headers, Filenames, or Query Params
- **Description:** Patient names, diagnoses, or clinical identifiers leaked in URL parameters or HTTP response headers (e.g. `X-Powered-By`, server error traces).
- **Impact:** Confidentiality: Medium.
- **Likelihood:** Medium.
- **Existing Controls:** Helmet removes `X-Powered-By`. Centralized `errorHandler` hides stack traces in non-development modes.
- **Required Controls:** Document download URLs use opaque UUIDs only (`/api/vault/documents/4f7ac10b-.../download`). Content-Disposition header quotes sanitized filename.
- **Residual Risk:** Negligible.
- **Verification Test:** Inspect all response headers on upload, preview, and download. Confirm no server version, host path, or patient PHI appears in headers.

---

### Threat 19: Sensitive Information in Server Logs
- **Description:** Backend logs recording document contents, decrypted clinical text, session tokens, or patient medical terms.
- **Impact:** Confidentiality: High (log leakage via monitoring tools or developer terminals).
- **Likelihood:** High (common developer oversight).
- **Existing Controls:** `requestLogger.ts` logs HTTP method, status, path, and duration only.
- **Required Controls:** Never log request bodies of upload endpoints. Never log encryption keys, nonces, or auth tags. Audit logs record document UUID and action outcome only.
- **Residual Risk:** Negligible.
- **Verification Test:** Execute an upload and view server stdout/log files. Assert zero cryptographic keys, tokens, or document binary data are logged.

---

### Threat 20: Accidental Public File Exposure
- **Description:** File storage directory mistakenly exposed via Express static file serving (`express.static`).
- **Impact:** Confidentiality: Critical (unauthenticated world access to medical files).
- **Likelihood:** Low with strict review; catastrophic impact.
- **Existing Controls:** `app.ts` does NOT mount any `express.static` on storage directories.
- **Required Controls:** Storage directory must reside outside `public/` and `src/`. Prohibit any `express.static` serving of the storage directory. Every file download must pass through an authorized controller.
- **Residual Risk:** None.
- **Verification Test:** Request `http://localhost:5000/storage/...` or `http://localhost:5000/vault/...`. Verify Express returns `404 Not Found`.

---

### Threat 21: Race Conditions during File Upload (TOCTOU)
- **Description:** A client initiates concurrent requests to overwrite or read a document while it is in the middle of being validated and encrypted.
- **Impact:** Integrity: Medium, Availability: Medium.
- **Likelihood:** Low.
- **Existing Controls:** None.
- **Required Controls:** Uploads write to unique quarantine file keys. Database records created with status `RECEIVED` and updated atomically in a Prisma `$transaction` once encrypted.
- **Residual Risk:** Negligible.
- **Verification Test:** Send simultaneous requests to update a document while upload is completing. Verify Prisma transactional lock maintains consistency.

---

### Threat 22: Interrupted or Truncated Upload Operations
- **Description:** Client network disconnects after transmitting 3 MB of a 7 MB PDF.
- **Impact:** Integrity: Low (corrupt files in storage), Availability: Low (wasted disk space).
- **Likelihood:** High (real-world network instability).
- **Existing Controls:** None.
- **Required Controls:** Listen to request `aborted` and `close` events. Immediately terminate writable file stream, delete partial quarantine file, and refrain from creating database record.
- **Residual Risk:** None.
- **Verification Test:** Kill client connection mid-stream during upload. Verify quarantine temp file is unlinked and zero orphan records exist in database.

---

### Threat 23: Database and Storage Inconsistencies (Orphaned Files)
- **Description:** The encrypted file is written to disk, but the database transaction fails, leaving an unreferenced file on disk (or vice versa).
- **Impact:** Integrity: Medium, Availability: Low.
- **Likelihood:** Medium.
- **Existing Controls:** None.
- **Required Controls:** Two-phase commit pattern: Write encrypted blob -> Execute Prisma transaction -> On DB failure, execute compensating rollback unlinking the encrypted blob.
- **Residual Risk:** Low.
- **Verification Test:** Simulate database failure during document insertion. Verify storage service deletes the orphaned `.enc` file.

---

### Threat 24: Backup Theft & Plaintext Exposure
- **Description:** An attacker steals a PostgreSQL backup file or storage volume snapshot.
- **Impact:** Confidentiality: Critical.
- **Likelihood:** Low-Medium.
- **Existing Controls:** None.
- **Required Controls:** Files are envelope-encrypted with AES-256-GCM. PostgreSQL contains only wrapped DEKs (encrypted under KEK). Without the Master KEK (stored outside database), stolen backups contain only ciphertext.
- **Residual Risk:** Low.
- **Verification Test:** Extract a raw database dump and storage volume snapshot. Attempt to decrypt without Master Key. Confirm data remains cryptographically inaccessible.

---

### Threat 25: Master Encryption Key Compromise
- **Description:** The master key (`VAULT_MASTER_KEY`) is leaked or exposed.
- **Impact:** Confidentiality: Critical (all encrypted documents decryptable).
- **Likelihood:** Low with proper environment isolation.
- **Existing Controls:** Key never committed to Git (`.gitignore` protects `.env`).
- **Required Controls:**
  1. Envelope encryption limits re-encryption overhead: rotating the KEK requires re-encrypting only the wrapped DEKs in the database, without re-encrypting gigabytes of file blobs.
  2. Support key versions (`keyVersion: 1, 2...`).
- **Residual Risk:** Low.
- **Verification Test:** Execute key rotation script on test dataset; verify documents decrypt successfully with new Master KEK.

---

### Threat 26: Accidental Document Deletion by Patient
- **Description:** A patient accidentally clicks delete on a critical medical report.
- **Impact:** Availability: High (loss of medical history).
- **Likelihood:** Medium.
- **Existing Controls:** Phase 2C.1 frontend includes a confirmation modal before deletion.
- **Required Controls:** Soft deletion strategy: Set `deletedAt: now()` and move file to `deleted/` tombstone directory. Retain for 30-day recovery window before permanent hard purge.
- **Residual Risk:** Low.
- **Verification Test:** Delete a document via API. Verify record has `deletedAt` populated and active list excludes it, while file remains in tombstone storage until purge.

---

### Threat 27: Insider / Developer Unauthorized Access on Host Machine
- **Description:** A developer or university lab administrator inspecting the Docker container browses the filesystem.
- **Impact:** Confidentiality: Critical.
- **Likelihood:** Medium.
- **Existing Controls:** None.
- **Required Controls:** All stored documents are encrypted with AES-256-GCM. The filesystem contains no plaintext. Production designs require Hardware Security Module (HSM) or cloud KMS.
- **Residual Risk:** Accepted for local FYP development; documented limitation.
- **Verification Test:** Inspect contents of `/storage/vault/active/` via bash shell. Confirm all file contents are high-entropy binary ciphertext.
