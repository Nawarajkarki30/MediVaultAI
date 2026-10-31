# MediVault AI — Phase 2C.2: Secure Document Storage Architecture

**Document Version:** 1.0.0  
**Phase:** Phase 2C.2 — Architecture, Threat Modeling & Planning  
**Classification:** Confidential / System Architecture  
**Target Milestone:** Phase 2C.3 (Upload & Storage Engine Implementation)  

---

## 1. Executive Summary & Purpose

MediVault AI is a privacy-first personal healthcare platform designed initially as a university capstone project and architected for future real-world healthcare compliance. Medical documents—including laboratory panels, radiographs, prescriptions, and discharge summaries—represent **Protected Health Information (PHI)** and **Sensitive Personal Data (SPD)**.

This document establishes the official storage architecture for MediVault AI before any physical upload pipelines are implemented. In accordance with the project security principles:
1. **Patient data is private by default.**
2. **Medical files are strictly isolated from public web directories.**
3. **Application-level envelope encryption protects files at rest.**
4. **All read, write, and deletion access is mediated and authorized by the Express backend.**

This phase delivers **architecture, threat modeling, and implementation specifications only**. No code changes, schema migrations, or cloud infrastructure are deployed during Phase 2C.2.

---

## 2. Evaluation of Storage Architecture Options

To determine the optimal storage strategy for MediVault AI's local development and production evolution, four architectures were systematically analyzed:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                STORAGE CANDIDATES                                      │
├─────────────────────┬─────────────────────┬─────────────────────┬──────────────────────┤
│      Option A       │      Option B       │      Option C       │       Option D       │
│   Local Private     │   Docker-Managed    │  Self-Hosted S3     │  Private Cloud       │
│ Encrypted Filesystem│   Storage Volume    │  (e.g., MinIO)      │  (AWS S3 / GCP GCS)  │
└─────────────────────┴─────────────────────┴─────────────────────┴──────────────────────┘
```

### 2.1 Comparative Analysis Matrix

| Evaluation Dimension | Option A: Local Private Encrypted Filesystem | Option B: Docker-Managed Private Volume | Option C: Self-Hosted S3 (MinIO) | Option D: Private Cloud Object Storage |
|---|---|---|---|---|
| **Privacy & Boundary Control** | **High:** Local process isolation; files live strictly outside web root. | **High:** Contained within Docker container boundary; isolated from host users. | **Medium-High:** Isolated S3 API; requires credentials and port exposure. | **High:** Cloud IAM, SSE-KMS, audit logs; subject to cloud jurisdiction. |
| **Security Boundaries** | OS POSIX permissions (`0600`/`0700`); inaccessible to browser. | Docker daemon boundary; access restricted to application containers. | S3 IAM policies, bucket policies, access keys, signature v4. | IAM roles, bucket policies, KMS key policies, VPC endpoints. |
| **Development Complexity** | **Low:** Native Node.js `fs/promises` and `stream` APIs. | **Low:** Standard Docker compose volume mapping. | **Medium-High:** MinIO service orchestration, bucket init scripts, S3 SDK. | **High:** Cloud account setup, IAM, SDK config, internet dependency. |
| **Operating Cost** | **$0.00:** Local disk storage. | **$0.00:** Local disk storage. | **$0.00:** Free open-source local container. | **Variable:** Storage costs, egress fees, KMS request charges. |
| **Docker Compatibility** | High (mounts directly into container). | Native (first-class Docker volume driver). | High (runs as separate Docker service). | Independent (external network dependency). |
| **Backup & Recovery** | High (file copy, rsync, volume snapshots). | High (Docker volume tar/rsync exports). | Medium (MinIO mc mirror, bucket sync). | High (Automated bucket versioning & cross-region replication). |
| **Portability** | High (cross-platform Node.js filesystem). | High (standard Docker Compose setup). | High (S3 API portability across providers). | Low (vendor lock-in to AWS/GCP/Azure primitives). |
| **Migration Requirements** | Low (abstracted through storage service interface). | Low (same storage interface as Option A). | None if migrating to cloud S3. | Target state for production deployment. |
| **Suitability for Capstone (FYP)** | **Highest:** Zero friction, 100% offline, zero cloud bills. | **Highest:** Integrates cleanly with existing Postgres Docker setup. | **Low-Medium:** Adds memory overhead (1-2 GB RAM) and failure points. | **Unsuitable for Dev:** Unnecessary cloud dependencies during grading/dev. |

---

### 2.2 Recommended Architecture: Hybrid Option A + Option B

**Selected Approach:** **Private Encrypted Local Filesystem mounted via a Dedicated Named Docker Volume (`Option A + B`).**

#### Rationale:
1. **Zero External Overhead:** Requires no additional background daemons (like MinIO), preserving system memory and CPU on the development machine.
2. **Absolute Privacy:** Files never leave the local development environment. There is zero risk of accidental internet exposure or leaked cloud access keys.
3. **Container Isolation:** Files are mounted into a restricted directory inside the backend container (`/var/lib/medivault/storage`) with strict POSIX permissions (`chmod 0700`).
4. **Clean Abstraction:** All file I/O is routed through a TypeScript interface (`IStorageService`). When transitioning to cloud storage in a future enterprise phase, an `S3StorageService` can be swapped in without modifying business logic.

---

## 3. System Architecture & Component Boundaries

The storage architecture enforces strict component segregation between unauthenticated clients, web application servers, isolated quarantine processing, encrypted storage, and database metadata.

```mermaid
flowchart TD
    Client["Patient Web Client (React 19)"]
    
    subgraph Boundary["MediVault AI Security Perimeter"]
        API["Express Backend API (:5000)"]
        AuthMiddleware["Auth & Session Guard (HttpOnly Cookie)"]
        CSRFMiddleware["CSRF Double-Submit Validator"]
        OwnerCheck["Server-Side Ownership Validator"]
        
        subgraph Pipeline["Processing Pipeline"]
            UploadHandler["Busboy Streaming Parser (10MB Cap)"]
            QuarantineDir["Isolated Quarantine Space (/storage/vault/quarantine)"]
            Validator["Signature & Magic Byte Inspector"]
            Scanner["ClamAV Malware Daemon (Fail-Closed)"]
            Sanitizer["PDF & Image Sanitizer (Metadata Stripping)"]
            EncEngine["AES-256-GCM Encryption Engine"]
        end
        
        subgraph Persistence["Storage & Data Layer"]
            DB[("PostgreSQL 16 (Docker)\nMetadata, DEK Envelopes & Audit")]
            StorageVol[("Docker Volume: medivault_vault_data\nEncrypted Blobs (/storage/vault/active)")]
        end
    end
    
    Client -->|1. Multipart Upload (Encrypted HTTPS)| API
    API --> AuthMiddleware
    AuthMiddleware --> CSRFMiddleware
    CSRFMiddleware --> UploadHandler
    UploadHandler -->|2. Write Raw Temp Stream| QuarantineDir
    QuarantineDir -->|3. Validate Magic Bytes| Validator
    Validator -->|4. Scan Payload| Scanner
    Scanner -->|5. Sanitize Content| Sanitizer
    Sanitizer -->|6. Envelope Encrypt| EncEngine
    EncEngine -->|7. Write .enc Blob (chmod 0600)| StorageVol
    EncEngine -->|8. Store Metadata & Wrapped DEK| DB
    EncEngine -.->|9. Atomic Unlink Temp File| QuarantineDir
    OwnerCheck -->|Authorize View/Download| DB
```

---

## 4. Storage Directory Layout & Sharding Strategy

To prevent filesystem bottlenecks and directory entry limits on Linux/ext4 filesystems, stored files are organized using **two-level two-character hexadecimal directory sharding** based on the opaque storage identifier.

### 4.1 Directory Hierarchy

```
/var/lib/medivault/storage/                  [0700 - medivault:medivault]
├── quarantine/                              [0700 - Isolated temporary staging]
│   └── q_f47ac10b-58cc-4372-a567-0e02b2c3d479.tmp
├── active/                                  [0700 - Encrypted active documents]
│   ├── 4f/
│   │   └── 7a/
│   │       └── 4f7ac10b-58cc-4372-a567-0e02b2c3d479.enc
│   ├── a1/
│   │   └── c3/
│   │       └── a1c3f90e-12bb-4122-8901-7fa11c2b5589.enc
│   └── ...
└── deleted/                                 [0700 - Soft-deleted holding / tombstone]
    └── 4f/
        └── 7a/
            └── 4f7ac10b-58cc-4372-a567-0e02b2c3d479.tombstone
```

### 4.2 Storage Key Generation Algorithm
1. The backend generates a cryptographically secure UUIDv4: `4f7ac10b-58cc-4372-a567-0e02b2c3d479`.
2. Extract shard levels: `shard1 = id[0..1]` (`4f`), `shard2 = id[2..3]` (`7a`).
3. Construct absolute storage path:
   `ACTIVE_VAULT_ROOT/4f/7a/4f7ac10b-58cc-4372-a567-0e02b2c3d479.enc`.
4. **Security Property:** Original user filenames (`Blood_Test_Report_Final.pdf`) are **never** used in storage paths. Filename exposure via filesystem enumeration or directory traversal is mathematically impossible.

---

## 5. Storage Service Interface (`IStorageService`)

To maintain modularity and allow future cloud migration, all storage operations implement a strict interface:

```typescript
export interface StoredFileResult {
  storageKey: string;
  byteSize: number;
  sha256Checksum: string;
}

export interface IStorageService {
  /**
   * Writes an encrypted data stream to permanent sharded storage.
   */
  writeEncryptedBlob(
    storageKey: string,
    dataStream: NodeJS.ReadableStream
  ): Promise<StoredFileResult>;

  /**
   * Reads an encrypted data stream from permanent storage.
   */
  readEncryptedBlob(storageKey: string): Promise<NodeJS.ReadableStream>;

  /**
   * Moves an active file to the tombstoned deletion directory.
   */
  tombstoneBlob(storageKey: string): Promise<void>;

  /**
   * Permanently unlinks an encrypted file from disk (hard purge).
   */
  purgeBlob(storageKey: string): Promise<void>;

  /**
   * Checks if an encrypted blob exists on disk.
   */
  blobExists(storageKey: string): Promise<boolean>;
}
```

---

## 6. Segregation of Encrypted Blobs and Cryptographic Metadata

Under no circumstances is cryptographic key material stored alongside encrypted file payloads on the filesystem.

- **Filesystem Storage (`.enc` blob):**
  - Contains **only** raw AES-256-GCM ciphertext.
  - Zero plaintext headers, zero patient identifiers, zero encryption keys.
  - An unauthorized attacker who acquires the storage volume acquires only pseudorandom byte streams with zero clinical meaning.
- **Database Storage (`DocumentStorageMetadata` & `MedicalDocument`):**
  - Contains the **Wrapped DEK** (encrypted under the Master Key Encryption Key).
  - Contains the 12-byte initialization vector (nonce).
  - Contains the 16-byte GCM authentication tag.
  - Contains the SHA-256 payload checksum.
- **Master Key (`KEK`):**
  - Resides exclusively in memory, loaded from protected environment variables (`VAULT_MASTER_KEY`) or secret mounts. Never stored in PostgreSQL, never committed to Git.

---

## 7. Operational & Technical Requirements for Phase 2C.3

1. **Dedicated Docker Volume:**
   Add named volume `medivault_vault_data` to `docker-compose.yml` mounted at `/var/lib/medivault/storage`.
2. **POSIX Permissions:**
   Ensure the directory is owned by the node runtime user with `0700` directory permissions and `0600` file permissions.
3. **Storage Quotas:**
   Enforce a maximum storage quota per patient ($100\text{ MB}$ default for university demo) to prevent disk exhaustion attacks.
4. **Atomic Operations:**
   Writes must use temp files and atomic renames (`fs.rename`) to ensure partial or interrupted uploads never result in corrupted storage blobs.
