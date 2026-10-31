# MediVault AI — Medical Data Storage & Upload Threat Model (Revised)

**Document Version:** 2.0.0 (Post-Security Review Revisions)  
**Methodology:** OWASP Top 10, OWASP ASVS v4.0 (File Upload & Cryptography), STRIDE  
**Status:** Approved for Implementation Planning  
**Classification:** Medical Security Specification

---

## 1. Scope & Security Objectives

This threat model identifies, analyzes, and establishes verifiable countermeasures for security threats targeting medical document ingestion, storage, processing, and retrieval in MediVault AI.

### Core Security Objectives:

1. **Patient Data Isolation:** Zero unauthorized cross-tenant or cross-patient document inspection or modification.
2. **Execution Neutralization:** Medical files (PDFs, images) must remain inert data blobs; active code must never execute in the backend runtime or patient browser.
3. **Cryptographic Integrity:** Plaintext is never released before the AES-GCM authentication tag is verified.
4. **Zero Persistent Plaintext:** Ingestion and quarantine staging occur in memory; plaintext is never left on persistent disk.

---

## 2. Threat Actor Profiles

| Threat Actor                          | Capabilities & Motivation                                                                                         | Attack Vectors                                                              |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Malicious Authenticated Patient**   | Valid session token; attempts to access or tamper with other patients' medical records or flood server storage.   | BOLA/IDOR, path traversal, oversized file flooding, concurrent quota races. |
| **Unauthenticated External Attacker** | Network access to public ports; attempts to exploit exposed endpoints, bypass authentication, or upload exploits. | Unauthenticated endpoint probing, CSRF, brute force, DDoS.                  |
| **Host / Infrastructure Intruder**    | Access to host filesystem, Docker daemon, or database backups.                                                    | Reading plaintext volumes, stealing unencrypted database dumps.             |

---

## 3. Comprehensive Threat Analysis Matrix (Revised)

The following matrix documents key threats, assessing **Impact (C-I-A)**, **Likelihood (Low/Med/High)**, **Existing Controls**, **Required Controls (Phase 2C.3)**, **Residual Risk**, and **Testable Verification Scenarios**.

---

### Threat 1: Streaming Unauthenticated AES-GCM Plaintext (Critical Cryptographic Flaw)

- **Description:** Decrypting an AES-GCM ciphertext stream directly to the HTTP response releases plaintext chunks to the user before `decipher.final()` verifies the authentication tag. If ciphertext is tampered with or truncated, unauthenticated plaintext has already escaped to the client.
- **Impact:** Confidentiality: High (potential padding/plaintext leak), Integrity: Critical (client consumes tampered data).
- **Likelihood:** High if streaming decryption is used.
- **Existing Controls:** Identified and halted in Security Architecture Review.
- **Required Controls:** In-memory Verify-Before-Release: Read entire encrypted blob (max 10 MB) into memory, compute `decipher.final()`, verify authentication tag and AAD. **Only after verification succeeds is plaintext written to the HTTP response.** If verification fails, throw error and send zero plaintext bytes.
- **Residual Risk:** Negligible.
- **Verification Test:** Tamper with a single byte in an encrypted `.enc` file. Request download. Assert backend returns HTTP `500 Internal Server Error`, logs `DECRYPTION_AUTH_TAG_MISMATCH`, and transmits zero bytes of file content.

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

### Threat 3: Malicious PDFs Evading Naive Keyword Sanitization

- **Description:** An attacker uploads a weaponized PDF containing embedded JavaScript obfuscated via object stream compression (`/ObjStm`), hex encoding (`/Java#53cript`), or type-confusion font exploits that bypass naive string-matching filters.
- **Impact:** Confidentiality: High (DOM XSS upon in-browser viewing), Integrity: High.
- **Likelihood:** High.
- **Existing Controls:** None.
- **Required Controls:**
  1. Default to safe download-only: `Content-Disposition: attachment; filename="sanitized.pdf"` with `X-Content-Type-Options: nosniff`.
  2. For inline preview: Server-side rasterization to static PNG pages (preferred) OR sandboxed PDF.js in an `<iframe>` with `sandbox="allow-scripts"` and `sandbox="allow-same-origin"` strictly omitted (null origin), with `enableScripting: false`.
- **Residual Risk:** Low.
- **Verification Test:** Upload a PDF with an obfuscated JavaScript alert. Verify downloading forces attachment save; verify inline preview executes zero client-side scripts.

---

### Threat 4: Plaintext Artifacts on Persistent Disk (SSD Forensics)

- **Description:** Uploading files to a temporary disk quarantine directory leaves plaintext remnants on SSD flash sectors that persist after `fs.unlink()` due to wear-leveling algorithms.
- **Impact:** Confidentiality: High (forensic recovery from physical host).
- **Likelihood:** Medium.
- **Existing Controls:** None.
- **Required Controls:**
  1. In-memory upload quarantine: Files under 10 MB are streamed directly into Node.js memory buffers.
  2. TCP ClamAV streaming: Memory buffer streamed over TCP socket (`INSTREAM`) to ClamAV container; zero physical disk writes.
  3. Cryptographic shredding: Stored files on disk are always ciphertext; destroying the 32-byte wrapped DEK in PostgreSQL mathematically shreds the file across all flash blocks.
- **Residual Risk:** Low.
- **Verification Test:** Monitor host disk I/O during upload; confirm zero unencrypted files are created in the filesystem during staging or scanning.

---

### Threat 5: Concurrent Storage Quota Race Conditions

- **Description:** An attacker initiates 10 simultaneous 10 MB uploads across multiple browser tabs to exceed the 100 MB quota before previous uploads have committed.
- **Impact:** Availability: Medium (storage exhaustion).
- **Likelihood:** High.
- **Existing Controls:** None.
- **Required Controls:** Pessimistic locking inside Prisma transaction:
  `SELECT id FROM users WHERE id = :userId FOR UPDATE;`
  Serializes upload quota verification across concurrent threads.
- **Residual Risk:** None.
- **Verification Test:** Fire 5 simultaneous 10 MB uploads on an account with 80 MB existing usage. Verify exactly two succeed and three are rejected with `400 Quota Exceeded`.

---

### Threat 6: Database/Filesystem Inconsistency (Orphaned Files)

- **Description:** The encrypted file is written to disk, but the database transaction fails (or power is lost), leaving an unreferenced file on disk (or vice versa).
- **Impact:** Integrity: Medium, Availability: Low.
- **Likelihood:** Medium.
- **Existing Controls:** None.
- **Required Controls:**
  1. Atomic staging: Write to `.tmp` in staging directory, then atomically rename to `.enc`.
  2. Compensating rollback: On DB commit failure, backend unlinks the `.enc` file.
  3. Periodic reconciler: `npm run vault:reconcile` quarantines unreferenced blobs.
- **Residual Risk:** Low.
- **Verification Test:** Mock a database failure immediately after file write. Verify the storage service automatically unlinks the orphaned `.enc` blob.

---

### Threat 7: Backup Transactional Desynchronization

- **Description:** A database dump and filesystem archive executed simultaneously capture different document sets, leading to corrupt or missing files upon restore.
- **Impact:** Availability: Critical (failed disaster recovery).
- **Likelihood:** Medium.
- **Existing Controls:** None.
- **Required Controls:** Quiesced manifest protocol: System enters read-only maintenance mode; exact list of active storage keys exported from a consistent database transaction into a manifest; `tar` archives strictly the files in the manifest.
- **Residual Risk:** Negligible.
- **Verification Test:** Initiate backup while triggering concurrent uploads. Verify backup completes with manifest perfectly matching database state.
