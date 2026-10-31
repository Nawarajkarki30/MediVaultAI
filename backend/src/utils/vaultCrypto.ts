// backend/src/utils/vaultCrypto.ts
// MediVault AI — AES-256-GCM Envelope Encryption Engine & Verify-Before-Release Decryptor

import crypto from 'crypto';
import { env } from '../config/env';
import { AppError } from './appError';

export interface WrappedDekResult {
  encryptedDek: string; // Base64
  dekNonce: string; // Base64 (12 bytes)
  dekAuthTag: string; // Base64 (16 bytes)
}

export interface EncryptDocumentResult {
  ciphertext: Buffer;
  fileNonce: string; // Base64 (12 bytes)
  fileAuthTag: string; // Base64 (16 bytes)
  sha256Checksum: string;
  wrappedDek: WrappedDekResult;
}

export interface DecryptDocumentParams {
  ciphertextBuffer: Buffer;
  fileNonceB64: string;
  fileAuthTagB64: string;
  encryptedDekB64: string;
  dekNonceB64: string;
  dekAuthTagB64: string;
  documentId: string;
  ownerId: string;
  masterKek: Buffer;
  expectedSha256: string;
  storageVersion?: number;
}

/**
 * Validates and retrieves the 256-bit Master Key Encryption Key (KEK) from environment.
 * Never stores or logs raw key bytes.
 */
export function getMasterKek(): Buffer {
  const hexKey = env.VAULT_MASTER_KEY;
  if (!hexKey || hexKey.length !== 64) {
    throw new AppError(
      'VAULT_MASTER_KEY configuration is missing or invalid. Must be a 64-character hex string (32 bytes).',
      500,
      'CRYPTO_KEY_ERROR'
    );
  }
  return Buffer.from(hexKey, 'hex');
}

/**
 * Computes deterministic, length-prefixed canonical Additional Authenticated Data (AAD).
 * Prevents delimiter injection and binds ciphertext cryptographically to documentId, ownerId, and storageVersion.
 */
export function computeCanonicalAAD(
  documentId: string,
  ownerId: string,
  storageVersion = 1
): Buffer {
  const docIdBuf = Buffer.from(documentId, 'utf8');
  const ownerIdBuf = Buffer.from(ownerId, 'utf8');
  const header = Buffer.from(`MEDIVAULT:V${storageVersion}:`, 'utf8');

  return Buffer.concat([
    header,
    Buffer.from([docIdBuf.length]),
    docIdBuf,
    Buffer.from([ownerIdBuf.length]),
    ownerIdBuf,
  ]);
}

/**
 * Wraps (encrypts) an ephemeral per-document Data Encryption Key (DEK) under the Master KEK using AES-256-GCM.
 */
export function wrapDek(dek: Buffer, masterKek: Buffer): WrappedDekResult {
  if (masterKek.length !== 32) {
    throw new AppError('Master KEK must be exactly 32 bytes (256 bits)', 500, 'CRYPTO_KEY_ERROR');
  }
  if (dek.length !== 32) {
    throw new AppError('DEK must be exactly 32 bytes (256 bits)', 500, 'CRYPTO_KEY_ERROR');
  }

  const dekNonce = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', masterKek, dekNonce, { authTagLength: 16 });
  cipher.setAAD(Buffer.from('MEDIVAULT:DEK_WRAP:V1', 'utf8'));

  const encryptedDek = Buffer.concat([cipher.update(dek), cipher.final()]);
  const dekAuthTag = cipher.getAuthTag();

  return {
    encryptedDek: encryptedDek.toString('base64'),
    dekNonce: dekNonce.toString('base64'),
    dekAuthTag: dekAuthTag.toString('base64'),
  };
}

/**
 * Unwraps (decrypts) a wrapped DEK using the Master KEK.
 * Throws immediately if key or authentication tag does not verify.
 */
export function unwrapDek(
  encryptedDekB64: string,
  dekNonceB64: string,
  dekAuthTagB64: string,
  masterKek: Buffer
): Buffer {
  if (masterKek.length !== 32) {
    throw new AppError('Master KEK must be exactly 32 bytes (256 bits)', 500, 'CRYPTO_KEY_ERROR');
  }

  const encryptedDek = Buffer.from(encryptedDekB64, 'base64');
  const dekNonce = Buffer.from(dekNonceB64, 'base64');
  const dekAuthTag = Buffer.from(dekAuthTagB64, 'base64');

  if (dekNonce.length !== 12) {
    throw new AppError('Invalid DEK nonce length (must be 12 bytes)', 500, 'CRYPTO_PAYLOAD_ERROR');
  }
  if (dekAuthTag.length !== 16) {
    throw new AppError(
      'Invalid DEK auth tag length (must be 16 bytes)',
      500,
      'CRYPTO_PAYLOAD_ERROR'
    );
  }

  const decipher = crypto.createDecipheriv('aes-256-gcm', masterKek, dekNonce, {
    authTagLength: 16,
  });
  decipher.setAAD(Buffer.from('MEDIVAULT:DEK_WRAP:V1', 'utf8'));
  decipher.setAuthTag(dekAuthTag);

  try {
    return Buffer.concat([decipher.update(encryptedDek), decipher.final()]);
  } catch {
    throw new AppError(
      'Failed to unwrap DEK: Master key mismatch or corrupted auth tag',
      500,
      'CRYPTO_AUTH_FAILED'
    );
  }
}

/**
 * Encrypts an in-memory document buffer using a fresh ephemeral 256-bit DEK,
 * binds canonical AAD, wraps the DEK under the Master KEK, and computes the unencrypted SHA-256 hash.
 */
export function encryptDocument(
  plaintextBuffer: Buffer,
  documentId: string,
  ownerId: string,
  masterKek: Buffer,
  storageVersion = 1
): EncryptDocumentResult {
  // 1. Generate unique 256-bit DEK & 96-bit nonce
  const dek = crypto.randomBytes(32);
  const fileNonce = crypto.randomBytes(12);

  try {
    // 2. Compute SHA-256 checksum of original unencrypted plaintext
    const sha256Checksum = crypto.createHash('sha256').update(plaintextBuffer).digest('hex');

    // 3. Compute canonical AAD
    const aad = computeCanonicalAAD(documentId, ownerId, storageVersion);

    // 4. Encrypt document with DEK
    const cipher = crypto.createCipheriv('aes-256-gcm', dek, fileNonce, { authTagLength: 16 });
    cipher.setAAD(aad);

    const ciphertext = Buffer.concat([cipher.update(plaintextBuffer), cipher.final()]);
    const fileAuthTag = cipher.getAuthTag();

    // 5. Wrap DEK under Master KEK
    const wrappedDek = wrapDek(dek, masterKek);

    return {
      ciphertext,
      fileNonce: fileNonce.toString('base64'),
      fileAuthTag: fileAuthTag.toString('base64'),
      sha256Checksum,
      wrappedDek,
    };
  } finally {
    // Best-effort in-memory scrubbing of ephemeral DEK
    dek.fill(0);
  }
}

/**
 * Verify-Before-Release Authenticated Decryption.
 * Decrypts the complete ciphertext buffer in memory, validates the GCM authentication tag
 * and canonical AAD, verifies the SHA-256 integrity hash, and ONLY returns plaintext if 100% verified.
 * Never streams or exposes unverified bytes.
 */
export function decryptDocumentVerified(params: DecryptDocumentParams): Buffer {
  const {
    ciphertextBuffer,
    fileNonceB64,
    fileAuthTagB64,
    encryptedDekB64,
    dekNonceB64,
    dekAuthTagB64,
    documentId,
    ownerId,
    masterKek,
    expectedSha256,
    storageVersion = 1,
  } = params;

  // 1. Unwrap DEK
  const dek = unwrapDek(encryptedDekB64, dekNonceB64, dekAuthTagB64, masterKek);

  const fileNonce = Buffer.from(fileNonceB64, 'base64');
  const fileAuthTag = Buffer.from(fileAuthTagB64, 'base64');

  if (fileNonce.length !== 12) {
    dek.fill(0);
    throw new AppError('Invalid file nonce length (must be 12 bytes)', 500, 'CRYPTO_PAYLOAD_ERROR');
  }
  if (fileAuthTag.length !== 16) {
    dek.fill(0);
    throw new AppError(
      'Invalid file auth tag length (must be 16 bytes)',
      500,
      'CRYPTO_PAYLOAD_ERROR'
    );
  }

  // 2. Compute canonical AAD
  const aad = computeCanonicalAAD(documentId, ownerId, storageVersion);

  // 3. Initialize Decipher
  const decipher = crypto.createDecipheriv('aes-256-gcm', dek, fileNonce, { authTagLength: 16 });
  decipher.setAAD(aad);
  decipher.setAuthTag(fileAuthTag);

  let plaintext: Buffer;
  try {
    // Complete in-memory verify-before-release: final() verifies auth tag before releasing buffer
    plaintext = Buffer.concat([decipher.update(ciphertextBuffer), decipher.final()]);
  } catch {
    dek.fill(0);
    throw new AppError(
      'Cryptographic verification failed: Ciphertext has been tampered with or AAD context mismatch',
      500,
      'CRYPTO_AUTH_FAILED'
    );
  } finally {
    // Best-effort in-memory scrubbing of ephemeral DEK
    dek.fill(0);
  }

  // 4. Verify SHA-256 checksum of recovered plaintext
  const actualSha256 = crypto.createHash('sha256').update(plaintext).digest('hex');
  if (actualSha256 !== expectedSha256) {
    plaintext.fill(0);
    throw new AppError(
      'Plaintext integrity check failed: SHA-256 checksum mismatch after decryption',
      500,
      'CRYPTO_INTEGRITY_FAILED'
    );
  }

  return plaintext;
}

/**
 * Concurrency semaphore to constrain concurrent in-memory encryption/decryption operations.
 * Prevents memory exhaustion attacks and bounded heap spikes under concurrent requests.
 */
export class CryptoSemaphore {
  private activeCount = 0;
  private readonly maxConcurrent: number;
  private queue: Array<() => void> = [];

  constructor(maxConcurrent = 5) {
    this.maxConcurrent = Math.max(1, maxConcurrent);
  }

  async acquire(): Promise<() => void> {
    if (this.activeCount < this.maxConcurrent) {
      this.activeCount++;
      let released = false;
      return () => {
        if (!released) {
          released = true;
          this.release();
        }
      };
    }

    return new Promise((resolve) => {
      this.queue.push(() => {
        this.activeCount++;
        let released = false;
        resolve(() => {
          if (!released) {
            released = true;
            this.release();
          }
        });
      });
    });
  }

  private release(): void {
    this.activeCount--;
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) next();
    }
  }

  get active(): number {
    return this.activeCount;
  }

  get queued(): number {
    return this.queue.length;
  }
}

export const vaultCryptoSemaphore = new CryptoSemaphore(env.MAX_CONCURRENT_CRYPTO_OPS);
