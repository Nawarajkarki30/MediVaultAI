// backend/tests/vault.test.ts
// MediVault AI — Medical Vault & Security Integration Suite (Milestones 4 & 5)

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'fs/promises';
import { createApp } from '../src/app';
import { prisma, Role, DocumentCategory, DocumentStatus } from '@medivault/database';
import { setAuthRepository, PrismaAuthRepository } from '../src/repositories/auth.repository';
import { hashPassword } from '../src/utils/security';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '../src/middleware/csrf';
import { vaultStorageService } from '../src/services/storage.service';
import { ClamAvService } from '../src/services/clamav.service';

describe('MediVault AI — Phase 2C.3 Medical Vault & Security Suite', () => {
  let app: ReturnType<typeof createApp>;
  let patientA: { id: string; email: string; cookie: string; csrfToken: string };
  let patientB: { id: string; email: string; cookie: string; csrfToken: string };

  // Synthetic PDF buffer with valid %PDF-1.4 header
  const syntheticPdfBuffer = Buffer.from(
    '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000118 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n193\n%%EOF\nSYNTHETIC BLOOD REPORT: Normal Hemoglobin 14.5 g/dL'
  );

  // Synthetic PNG buffer with valid PNG magic bytes
  const syntheticPngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89,
  ]);

  // Safe standard EICAR test string
  const eicarBuffer = Buffer.from(
    'WDVPIVAlQEFQWzRcUFpYNTQoUF4pN0NDKTd9JEVJQ0FSLVNUQU5EQVJELUFOVElWSVJVUy1URVNULUZJTEUhJEgrSCo=',
    'base64'
  );

  beforeAll(async () => {
    setAuthRepository(new PrismaAuthRepository());
    app = createApp();

    const timestamp = Date.now();
    const passwordHash = await hashPassword('VaultSecurePass123!');

    // Create Patient A
    const userA = await prisma.user.create({
      data: {
        fullName: 'Patient Alpha (Synthetic)',
        email: `patient.alpha.${timestamp}@example.com`,
        passwordHash,
        role: Role.PATIENT,
        emailVerifiedAt: new Date(),
      },
    });

    // Create Patient B
    const userB = await prisma.user.create({
      data: {
        fullName: 'Patient Beta (Synthetic)',
        email: `patient.beta.${timestamp}@example.com`,
        passwordHash,
        role: Role.PATIENT,
        emailVerifiedAt: new Date(),
      },
    });

    // Login Patient A
    const loginResA = await request(app).post('/api/auth/login').send({
      email: userA.email,
      password: 'VaultSecurePass123!',
    });
    const cookiesA = loginResA.headers['set-cookie'] as unknown as string[];
    const sessionCookieA = cookiesA.find((c: string) => c.startsWith('medivault_session='))!;
    const csrfCookieA = cookiesA.find((c: string) => c.startsWith(`${CSRF_COOKIE_NAME}=`))!;
    const csrfTokenA = csrfCookieA.split(';')[0].split('=')[1];

    patientA = {
      id: userA.id,
      email: userA.email,
      cookie: sessionCookieA,
      csrfToken: csrfTokenA,
    };

    // Login Patient B
    const loginResB = await request(app).post('/api/auth/login').send({
      email: userB.email,
      password: 'VaultSecurePass123!',
    });
    const cookiesB = loginResB.headers['set-cookie'] as unknown as string[];
    const sessionCookieB = cookiesB.find((c: string) => c.startsWith('medivault_session='))!;
    const csrfCookieB = cookiesB.find((c: string) => c.startsWith(`${CSRF_COOKIE_NAME}=`))!;
    const csrfTokenB = csrfCookieB.split(';')[0].split('=')[1];

    patientB = {
      id: userB.id,
      email: userB.email,
      cookie: sessionCookieB,
      csrfToken: csrfTokenB,
    };
  });

  afterAll(async () => {
    // Cascade deletion of test users (cleans up documents and storage metadata)
    try {
      if (patientA?.id) {
        await prisma.user.delete({ where: { id: patientA.id } });
      }
      if (patientB?.id) {
        await prisma.user.delete({ where: { id: patientB.id } });
      }
    } catch {
      // Ignore cleanup error if already deleted
    } finally {
      await prisma.$disconnect();
    }
  });

  // 1. Unauthenticated upload rejection
  it('1. should reject unauthenticated upload with HTTP 401', async () => {
    const res = await request(app)
      .post('/api/vault/upload')
      .attach('file', syntheticPdfBuffer, 'report.pdf');

    expect(res.status).toBe(401);
  });

  // 2. CSRF rejection when session cookie is provided without CSRF header
  it('2. should reject upload with HTTP 403 when CSRF header is missing', async () => {
    const res = await request(app)
      .post('/api/vault/upload')
      .set('Cookie', patientA.cookie)
      .attach('file', syntheticPdfBuffer, 'report.pdf');

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('CSRF');
  });

  // 3. Successful authenticated document upload
  let uploadedDocId: string;
  it('3. should successfully upload, scan, encrypt, and store a synthetic PDF document', async () => {
    const res = await request(app)
      .post('/api/vault/upload')
      .set('Cookie', [patientA.cookie, `${CSRF_COOKIE_NAME}=${patientA.csrfToken}`])
      .set(CSRF_HEADER_NAME, patientA.csrfToken)
      .field('title', 'Blood Panel Results')
      .field('category', DocumentCategory.LABORATORY_REPORT)
      .field('notes', 'Routine checkup - synthetic values')
      .field('documentDate', '2026-10-31')
      .attach('file', syntheticPdfBuffer, 'blood_report.pdf');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.document).toBeDefined();
    expect(res.body.document.id).toBeDefined();
    expect(res.body.document.title).toBe('Blood Panel Results');
    expect(res.body.document.category).toBe(DocumentCategory.LABORATORY_REPORT);
    expect(res.body.document.fileSize).toBe(syntheticPdfBuffer.length);
    expect(res.body.document.status).toBe(DocumentStatus.ACTIVE);

    // Verify secrets are NOT leaked in response DTO
    expect(res.body.document.storageKey).toBeUndefined();
    expect(res.body.document.encryptedDek).toBeUndefined();
    expect(res.body.document.fileNonce).toBeUndefined();
    expect(res.body.document.fileAuthTag).toBeUndefined();

    uploadedDocId = res.body.document.id;

    // Verify storage file on disk is encrypted (ciphertext != plaintext)
    const storageMeta = await prisma.documentStorageMetadata.findUnique({
      where: { documentId: uploadedDocId },
    });
    expect(storageMeta).toBeDefined();
    expect(storageMeta?.storageKey).toBeDefined();

    const exists = await vaultStorageService.blobExists(storageMeta!.storageKey);
    expect(exists).toBe(true);

    const onDiskCiphertext = await vaultStorageService.readEncryptedBlob(storageMeta!.storageKey);
    expect(onDiskCiphertext.equals(syntheticPdfBuffer)).toBe(false);
  });

  // 4. Document listing and quota calculation
  it('4. should list active documents and return accurate patient quota metrics', async () => {
    const res = await request(app).get('/api/vault/documents').set('Cookie', patientA.cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.documents.length).toBeGreaterThanOrEqual(1);
    expect(res.body.stats).toBeDefined();
    expect(res.body.stats.documentCount).toBeGreaterThanOrEqual(1);
    expect(res.body.stats.usedBytes).toBeGreaterThanOrEqual(syntheticPdfBuffer.length);
    expect(res.body.stats.quotaBytes).toBe(104857600); // 100MB
  });

  // 5. Single document retrieval
  it('5. should fetch document metadata for authorized patient', async () => {
    const res = await request(app)
      .get(`/api/vault/documents/${uploadedDocId}`)
      .set('Cookie', patientA.cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.document.id).toBe(uploadedDocId);
    expect(res.body.document.title).toBe('Blood Panel Results');
  });

  // 6. Verified authenticated download
  it('6. should download and decrypt document with verify-before-release and secure headers', async () => {
    const res = await request(app)
      .get(`/api/vault/documents/${uploadedDocId}/download`)
      .set('Cookie', patientA.cookie);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['cache-control']).toContain('no-store');

    // Plaintext content must match exactly
    expect(Buffer.from(res.body).equals(syntheticPdfBuffer)).toBe(true);
  });

  // 7. BOLA defense: Patient B cannot access Patient A's document
  it('7. should return HTTP 404 Not Found when Patient B tries to access Patient A document (BOLA defense)', async () => {
    // Read attempt
    const readRes = await request(app)
      .get(`/api/vault/documents/${uploadedDocId}`)
      .set('Cookie', patientB.cookie);
    expect(readRes.status).toBe(404);

    // Download attempt
    const downloadRes = await request(app)
      .get(`/api/vault/documents/${uploadedDocId}/download`)
      .set('Cookie', patientB.cookie);
    expect(downloadRes.status).toBe(404);

    // Update attempt
    const updateRes = await request(app)
      .patch(`/api/vault/documents/${uploadedDocId}`)
      .set('Cookie', [patientB.cookie, `${CSRF_COOKIE_NAME}=${patientB.csrfToken}`])
      .set(CSRF_HEADER_NAME, patientB.csrfToken)
      .send({ title: 'Hacked Title' });
    expect(updateRes.status).toBe(404);

    // Delete attempt
    const deleteRes = await request(app)
      .delete(`/api/vault/documents/${uploadedDocId}`)
      .set('Cookie', [patientB.cookie, `${CSRF_COOKIE_NAME}=${patientB.csrfToken}`])
      .set(CSRF_HEADER_NAME, patientB.csrfToken);
    expect(deleteRes.status).toBe(404);
  });

  // 8. Rejection of spoofed file extensions (magic byte mismatch)
  it('8. should reject file with mismatched extension and magic bytes (fake PDF)', async () => {
    const fakePdfBuffer = Buffer.from('NOT A PDF FILE JUST PLAIN TEXT CONTENT');

    const res = await request(app)
      .post('/api/vault/upload')
      .set('Cookie', [patientA.cookie, `${CSRF_COOKIE_NAME}=${patientA.csrfToken}`])
      .set(CSRF_HEADER_NAME, patientA.csrfToken)
      .attach('file', fakePdfBuffer, 'fake.pdf');

    expect(res.status).toBe(415);
    expect(res.body.message).toContain('Unsupported file type');
  });

  // 9. Rejection of malware file using safe EICAR test signature embedded in valid PDF stream
  it('9. should reject file containing EICAR malware signature with HTTP 400', async () => {
    const eicarAscii = eicarBuffer.toString('ascii');
    const eicarPdf = Buffer.from(
      `%PDF-1.4\n1 0 obj\n<< /Length ${eicarAscii.length} >>\nstream\n${eicarAscii}\nendstream\nendobj\nxref\n0 2\n0000000000 65535 f \n0000000009 00000 n \ntrailer\n<< /Size 2 >>\nstartxref\n120\n%%EOF`
    );

    const res = await request(app)
      .post('/api/vault/upload')
      .set('Cookie', [patientA.cookie, `${CSRF_COOKIE_NAME}=${patientA.csrfToken}`])
      .set(CSRF_HEADER_NAME, patientA.csrfToken)
      .attach('file', eicarPdf, 'infected.pdf');

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Malware detected');

    // Confirm MALWARE_DETECTED audit event logged in DB
    const auditEvent = await prisma.documentAuditEvent.findFirst({
      where: {
        userId: patientA.id,
        eventType: 'MALWARE_DETECTED',
      },
    });
    expect(auditEvent).toBeDefined();
  });

  // 10. Fail-closed scanner behavior when ClamAV is offline
  it('10. should fail-closed with HTTP 503 if ClamAV daemon is unreachable', async () => {
    const offlineClamAv = new ClamAvService('127.0.0.1', 59999, 1000); // Dead port

    await expect(offlineClamAv.scanBuffer(syntheticPdfBuffer)).rejects.toThrowError(/unavailable/);
  });

  // 11. Update document metadata
  it('11. should update document title and category for authorized patient', async () => {
    const res = await request(app)
      .patch(`/api/vault/documents/${uploadedDocId}`)
      .set('Cookie', [patientA.cookie, `${CSRF_COOKIE_NAME}=${patientA.csrfToken}`])
      .set(CSRF_HEADER_NAME, patientA.csrfToken)
      .send({
        title: 'Updated Blood Panel Title',
        category: DocumentCategory.LABORATORY_REPORT,
        notes: 'Updated doctor consultation notes',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.document.title).toBe('Updated Blood Panel Title');
  });

  // 12. Soft-delete document
  it('12. should soft-delete document and move physical blob to tombstone storage', async () => {
    const res = await request(app)
      .delete(`/api/vault/documents/${uploadedDocId}`)
      .set('Cookie', [patientA.cookie, `${CSRF_COOKIE_NAME}=${patientA.csrfToken}`])
      .set(CSRF_HEADER_NAME, patientA.csrfToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify document marked deleted in DB
    const docInDb = await prisma.medicalDocument.findUnique({
      where: { id: uploadedDocId },
    });
    expect(docInDb?.deletedAt).not.toBeNull();
    expect(docInDb?.status).toBe(DocumentStatus.DELETED);

    // Subsequent get should return 404
    const getRes = await request(app)
      .get(`/api/vault/documents/${uploadedDocId}`)
      .set('Cookie', patientA.cookie);
    expect(getRes.status).toBe(404);
  });
});
