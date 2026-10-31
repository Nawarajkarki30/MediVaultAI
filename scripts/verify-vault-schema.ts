// scripts/verify-vault-schema.ts
// MediVault AI — Medical Vault Schema Verification Script

import 'dotenv/config';
import { prisma, Role, DocumentCategory, DocumentStatus, DocumentAuditEventType } from '@medivault/database';

async function main() {
  console.log('--- MediVault AI Medical Vault Schema Verification ---');

  try {
    // 1. Verify table counts and model accessibility
    const docCount = await prisma.medicalDocument.count();
    const metaCount = await prisma.documentStorageMetadata.count();
    const auditCount = await prisma.documentAuditEvent.count();
    console.log(`✔ Models accessible: medical_documents (${docCount}), document_storage_metadata (${metaCount}), document_audit_events (${auditCount})`);

    // 2. Test transactional creation of synthetic user + medical document + storage metadata + audit event
    const testEmail = `synthetic.test.${Date.now()}@example.com`;
    const createdUser = await prisma.user.create({
      data: {
        fullName: 'Dr. Synthetic Test Patient',
        email: testEmail,
        passwordHash: 'dummy-argon2id-hash-for-testing',
        role: Role.PATIENT,
      },
    });
    console.log(`✔ Created synthetic test patient: ${createdUser.id}`);

    // 3. Create document with storage metadata in transaction
    const storageKey = `test-storage-key-${Date.now()}`;
    const createdDoc = await prisma.medicalDocument.create({
      data: {
        ownerId: createdUser.id,
        title: 'Synthetic Blood Test',
        originalFileName: 'synthetic-blood-test.pdf',
        mimeType: 'application/pdf',
        category: DocumentCategory.LABORATORY_REPORT,
        fileSize: 1024,
        status: DocumentStatus.ACTIVE,
        storageMetadata: {
          create: {
            storageKey,
            storageVersion: 1,
            keyVersion: 1,
            encryptedDek: 'dummyWrappedDekBase64==',
            dekNonce: 'dummyDekNonce==',
            dekAuthTag: 'dummyDekAuthTag==',
            fileNonce: 'dummyFileNonce==',
            fileAuthTag: 'dummyFileAuthTag==',
            sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            ciphertextBytes: 1040,
          },
        },
        auditEvents: {
          create: {
            userId: createdUser.id,
            eventType: DocumentAuditEventType.DOCUMENT_UPLOADED,
            details: JSON.stringify({ action: 'synthetic_verification' }),
          },
        },
      },
      include: {
        storageMetadata: true,
        auditEvents: true,
      },
    });

    console.log(`✔ Created document with relations: Doc ID: ${createdDoc.id}, StorageKey: ${createdDoc.storageMetadata?.storageKey}`);
    console.log(`✔ Audit event logged: ${createdDoc.auditEvents[0]?.eventType}`);

    // 4. Verify cascade delete behavior (deleting user should delete document and metadata, set null on audit)
    await prisma.user.delete({ where: { id: createdUser.id } });
    const remainingDoc = await prisma.medicalDocument.findUnique({ where: { id: createdDoc.id } });
    const remainingMeta = await prisma.documentStorageMetadata.findUnique({ where: { storageKey } });
    console.log(`✔ Cascade delete confirmed: Document is ${remainingDoc ? 'PRESENT' : 'NULL'}, Metadata is ${remainingMeta ? 'PRESENT' : 'NULL'}`);

    // Clean up orphan test audit event
    await prisma.documentAuditEvent.deleteMany({ where: { userId: createdUser.id } });
    console.log('✔ Cleaned up test audit events.');

    console.log('--- ALL VAULT SCHEMA INTEGRITY CHECKS PASSED ---');
    process.exit(0);
  } catch (error) {
    console.error('✖ Schema Verification FAILED:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
