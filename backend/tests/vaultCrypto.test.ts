// backend/tests/vaultCrypto.test.ts
// MediVault AI — Cryptographic Engine Verification Suite

import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import {
  computeCanonicalAAD,
  wrapDek,
  unwrapDek,
  encryptDocument,
  decryptDocumentVerified,
  getMasterKek,
  CryptoSemaphore,
} from '../src/utils/vaultCrypto';
import { AppError } from '../src/utils/appError';

describe('MediVault AI — Phase 2C.3 Cryptographic Engine Suite', () => {
  const masterKek = getMasterKek();
  const testOwnerId = 'patient-uuid-1234';
  const testDocId = 'doc-uuid-5678';
  const samplePlaintext = Buffer.from('SYNTHETIC MEDICAL REPORT DATA: Glucose 95 mg/dL, Normal.');

  it('1. should compute deterministic canonical length-prefixed AAD', () => {
    const aad1 = computeCanonicalAAD(testDocId, testOwnerId, 1);
    const aad2 = computeCanonicalAAD(testDocId, testOwnerId, 1);
    expect(aad1.equals(aad2)).toBe(true);

    // Context changes should produce distinct AAD
    const aadOtherOwner = computeCanonicalAAD(testDocId, 'different-patient', 1);
    expect(aad1.equals(aadOtherOwner)).toBe(false);

    const aadOtherDoc = computeCanonicalAAD('different-doc', testOwnerId, 1);
    expect(aad1.equals(aadOtherDoc)).toBe(false);
  });

  it('2. should wrap and unwrap a 256-bit DEK under the Master KEK', () => {
    const originalDek = crypto.randomBytes(32);
    const wrapped = wrapDek(originalDek, masterKek);

    expect(wrapped.encryptedDek).toBeDefined();
    expect(wrapped.dekNonce).toBeDefined();
    expect(wrapped.dekAuthTag).toBeDefined();

    const unwrappedDek = unwrapDek(
      wrapped.encryptedDek,
      wrapped.dekNonce,
      wrapped.dekAuthTag,
      masterKek
    );

    expect(unwrappedDek.equals(originalDek)).toBe(true);
  });

  it('3. should reject unwrapping DEK with wrong Master KEK', () => {
    const originalDek = crypto.randomBytes(32);
    const wrapped = wrapDek(originalDek, masterKek);
    const wrongKek = crypto.randomBytes(32);

    expect(() =>
      unwrapDek(wrapped.encryptedDek, wrapped.dekNonce, wrapped.dekAuthTag, wrongKek)
    ).toThrowError(AppError);
  });

  it('4. should successfully encrypt and decrypt a document using verify-before-release', () => {
    const encResult = encryptDocument(samplePlaintext, testDocId, testOwnerId, masterKek);

    expect(encResult.ciphertext).toBeDefined();
    expect(encResult.fileNonce).toBeDefined();
    expect(encResult.fileAuthTag).toBeDefined();
    expect(encResult.sha256Checksum).toBe(
      crypto.createHash('sha256').update(samplePlaintext).digest('hex')
    );

    const decrypted = decryptDocumentVerified({
      ciphertextBuffer: encResult.ciphertext,
      fileNonceB64: encResult.fileNonce,
      fileAuthTagB64: encResult.fileAuthTag,
      encryptedDekB64: encResult.wrappedDek.encryptedDek,
      dekNonceB64: encResult.wrappedDek.dekNonce,
      dekAuthTagB64: encResult.wrappedDek.dekAuthTag,
      documentId: testDocId,
      ownerId: testOwnerId,
      masterKek,
      expectedSha256: encResult.sha256Checksum,
    });

    expect(decrypted.equals(samplePlaintext)).toBe(true);
  });

  it('5. should reject decryption if 1 byte of ciphertext is tampered (AES-GCM integrity check)', () => {
    const encResult = encryptDocument(samplePlaintext, testDocId, testOwnerId, masterKek);

    // Tamper with one single byte of the ciphertext buffer
    const tamperedCiphertext = Buffer.from(encResult.ciphertext);
    tamperedCiphertext[0] = tamperedCiphertext[0] ^ 0xff;

    expect(() =>
      decryptDocumentVerified({
        ciphertextBuffer: tamperedCiphertext,
        fileNonceB64: encResult.fileNonce,
        fileAuthTagB64: encResult.fileAuthTag,
        encryptedDekB64: encResult.wrappedDek.encryptedDek,
        dekNonceB64: encResult.wrappedDek.dekNonce,
        dekAuthTagB64: encResult.wrappedDek.dekAuthTag,
        documentId: testDocId,
        ownerId: testOwnerId,
        masterKek,
        expectedSha256: encResult.sha256Checksum,
      })
    ).toThrowError(/Cryptographic verification failed/);
  });

  it('6. should reject decryption if AAD context is modified (transplant attack prevention)', () => {
    const encResult = encryptDocument(samplePlaintext, testDocId, testOwnerId, masterKek);

    // Attempt to decrypt with another patient's ownerId
    expect(() =>
      decryptDocumentVerified({
        ciphertextBuffer: encResult.ciphertext,
        fileNonceB64: encResult.fileNonce,
        fileAuthTagB64: encResult.fileAuthTag,
        encryptedDekB64: encResult.wrappedDek.encryptedDek,
        dekNonceB64: encResult.wrappedDek.dekNonce,
        dekAuthTagB64: encResult.wrappedDek.dekAuthTag,
        documentId: testDocId,
        ownerId: 'attacker-patient-id', // Swapped owner
        masterKek,
        expectedSha256: encResult.sha256Checksum,
      })
    ).toThrowError(/Cryptographic verification failed/);
  });

  it('7. should enforce concurrency limit in CryptoSemaphore', async () => {
    const semaphore = new CryptoSemaphore(2);

    expect(semaphore.active).toBe(0);
    const release1 = await semaphore.acquire();
    expect(semaphore.active).toBe(1);

    const release2 = await semaphore.acquire();
    expect(semaphore.active).toBe(2);

    // Third acquire must wait in queue
    let acquired3 = false;
    const promise3 = semaphore.acquire().then((rel) => {
      acquired3 = true;
      return rel;
    });

    expect(acquired3).toBe(false);
    expect(semaphore.queued).toBe(1);

    // Release 1 should allow 3 to acquire
    release1();
    const release3 = await promise3;
    expect(acquired3).toBe(true);
    expect(semaphore.active).toBe(2);

    release2();
    release3();
    expect(semaphore.active).toBe(0);
  });
});
