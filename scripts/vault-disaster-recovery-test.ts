// scripts/vault-disaster-recovery-test.ts
// MediVault AI — Complete Disaster Recovery & Restoration Verification Test
// Performs a full PostgreSQL dump + encrypted file archive, restores into a disposable
// test database (medivault_restore_test) and scratch storage root, verifies cryptographic
// integrity and ownership against original fixtures, and completely cleans up.
// NEVER resets or alters medivault_dev.

import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PrismaClient, Role, DocumentCategory, DocumentStatus } from '@medivault/database';
import {
  encryptDocument,
  decryptDocumentVerified,
  getMasterKek,
} from '../backend/src/utils/vaultCrypto';
import { vaultStorageService } from '../backend/src/services/storage.service';

const execAsync = promisify(exec);

const DEV_DB_NAME = 'medivault_dev';
const RESTORE_TEST_DB_NAME = 'medivault_restore_test';
const CONTAINER_NAME = 'medivault-postgres';

async function runDisasterRecoveryTest(): Promise<void> {
  console.log('================================================================');
  console.log('MediVault AI — Phase 2C.4 Full Disaster Recovery Test');
  console.log('================================================================');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const storageRoot = path.resolve(process.env.VAULT_STORAGE_ROOT || './storage_vault');
  const backupDir = path.join(storageRoot, 'backups', `dr_backup_${timestamp}`);
  const backupBlobsDir = path.join(backupDir, 'blobs');
  const restoreScratchDir = path.join(storageRoot, 'backups', `dr_scratch_${timestamp}`);
  const dumpSqlPath = path.join(backupDir, 'database_dump.sql');

  const devPrisma = new PrismaClient({
    datasources: {
      db: {
        url:
          process.env.DATABASE_URL ||
          'postgresql://postgres:postgres@localhost:5434/medivault_dev?schema=public',
      },
    },
  });

  let testUserId: string | null = null;
  let testDocId: string | null = null;
  let testStorageKey: string | null = null;
  const testPlaintextContent = 'SYNTHETIC DISASTER RECOVERY FIXTURE REPORT — CONFIDENTIAL PHI TEST';

  try {
    const masterKek = getMasterKek();

    // -------------------------------------------------------------
    // Step 1: Ensure at least one verified fixture exists in dev DB
    // -------------------------------------------------------------
    console.log(
      '\n[Step 1/5] Verifying existing data baseline or seeding synthetic test fixture...'
    );
    const existingCount = await devPrisma.medicalDocument.count({ where: { deletedAt: null } });

    if (existingCount === 0) {
      console.log(
        '  No existing documents found. Seeding synthetic test patient and document in medivault_dev...'
      );
      const testUser = await devPrisma.user.create({
        data: {
          fullName: 'DR Synthetic Patient',
          email: `dr.patient.${Date.now()}@example.com`,
          passwordHash: 'dummyArgon2idHashForTest',
          role: Role.PATIENT,
        },
      });
      testUserId = testUser.id;
      testDocId = crypto.randomUUID();
      testStorageKey = crypto.randomUUID();

      const enc = encryptDocument(
        Buffer.from(testPlaintextContent, 'utf8'),
        testDocId,
        testUserId,
        masterKek,
        1
      );

      await vaultStorageService.writeEncryptedBlob(testStorageKey, enc.ciphertext);

      await devPrisma.medicalDocument.create({
        data: {
          id: testDocId,
          ownerId: testUserId,
          title: 'Disaster Recovery Synthetic Report',
          originalFileName: 'dr-report.pdf',
          mimeType: 'application/pdf',
          category: DocumentCategory.LABORATORY_REPORT,
          fileSize: Buffer.byteLength(testPlaintextContent),
          status: DocumentStatus.ACTIVE,
          storageMetadata: {
            create: {
              storageKey: testStorageKey,
              storageVersion: 1,
              keyVersion: 1,
              encryptedDek: enc.wrappedDek.encryptedDek,
              dekNonce: enc.wrappedDek.dekNonce,
              dekAuthTag: enc.wrappedDek.dekAuthTag,
              fileNonce: enc.fileNonce,
              fileAuthTag: enc.fileAuthTag,
              sha256Checksum: enc.sha256Checksum,
              ciphertextBytes: enc.ciphertext.length,
            },
          },
        },
      });
      console.log(`  ✔ Seeded synthetic test document (${testDocId}) for patient ${testUserId}`);
    } else {
      console.log(`  ✔ Found ${existingCount} existing active document(s) in medivault_dev.`);
    }

    // -------------------------------------------------------------
    // Step 2: Full PostgreSQL dump and encrypted blob snapshot
    // -------------------------------------------------------------
    console.log('\n[Step 2/5] Creating complete database dump and encrypted file archive...');
    await fs.mkdir(backupBlobsDir, { recursive: true });

    // Execute pg_dump from Docker container
    const dumpCmd = `docker exec -e PGPASSWORD=postgres ${CONTAINER_NAME} pg_dump -U postgres ${DEV_DB_NAME} --clean --if-exists`;
    const { stdout: dumpSql, stderr: dumpErr } = await execAsync(dumpCmd, {
      maxBuffer: 50 * 1024 * 1024,
    });
    if (dumpErr && !dumpErr.includes('NOTICE')) {
      console.warn('  pg_dump notices:', dumpErr);
    }
    await fs.writeFile(dumpSqlPath, dumpSql, 'utf8');
    console.log(`  ✔ PostgreSQL schema & data dumped to: ${dumpSqlPath} (${dumpSql.length} bytes)`);

    // Snapshot all active blobs
    const activeDocs = await devPrisma.medicalDocument.findMany({
      where: { deletedAt: null },
      include: { storageMetadata: true },
    });

    const manifestItems = [];
    let totalArchiveBytes = 0;

    for (const doc of activeDocs) {
      if (!doc.storageMetadata) continue;
      const meta = doc.storageMetadata;
      const ciphertext = await vaultStorageService.readEncryptedBlob(meta.storageKey);
      totalArchiveBytes += ciphertext.length;

      const blobDest = path.join(backupBlobsDir, `${meta.storageKey}.enc`);
      await fs.writeFile(blobDest, ciphertext);

      manifestItems.push({
        documentId: doc.id,
        ownerId: doc.ownerId,
        title: doc.title,
        storageKey: meta.storageKey,
        ciphertextBytes: meta.ciphertextBytes,
        sha256Checksum: meta.sha256Checksum,
        fileNonce: meta.fileNonce,
        fileAuthTag: meta.fileAuthTag,
        encryptedDek: meta.encryptedDek,
        dekNonce: meta.dekNonce,
        dekAuthTag: meta.dekAuthTag,
        storageVersion: meta.storageVersion,
      });
    }

    const manifest = {
      timestamp: new Date().toISOString(),
      sourceDatabase: DEV_DB_NAME,
      masterKeyVersion: 1,
      totalDocuments: manifestItems.length,
      totalArchiveBytes,
      documents: manifestItems,
    };

    const manifestPath = path.join(backupDir, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(
      `  ✔ Manifest saved with ${manifestItems.length} documents (${totalArchiveBytes} bytes)`
    );

    // -------------------------------------------------------------
    // Step 3: Restore into disposable database (medivault_restore_test)
    // -------------------------------------------------------------
    console.log(
      `\n[Step 3/5] Restoring database into isolated database '${RESTORE_TEST_DB_NAME}'...`
    );

    // Reset disposable test database
    await execAsync(
      `docker exec -e PGPASSWORD=postgres ${CONTAINER_NAME} psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS ${RESTORE_TEST_DB_NAME};"`
    );
    await execAsync(
      `docker exec -e PGPASSWORD=postgres ${CONTAINER_NAME} psql -U postgres -d postgres -c "CREATE DATABASE ${RESTORE_TEST_DB_NAME};"`
    );

    // Restore pg_dump into test database
    const restoreCmd = `docker exec -i -e PGPASSWORD=postgres ${CONTAINER_NAME} psql -U postgres -d ${RESTORE_TEST_DB_NAME}`;
    await new Promise<void>((resolve, reject) => {
      const psqlProc = exec(restoreCmd, (error, _stdout, stderr) => {
        if (error) {
          reject(new Error(`psql restore failed: ${error.message}\n${stderr}`));
        } else {
          resolve();
        }
      });
      psqlProc.stdin?.write(dumpSql);
      psqlProc.stdin?.end();
    });

    console.log(`  ✔ Database restored successfully into '${RESTORE_TEST_DB_NAME}'`);

    // Restore encrypted blobs into separate scratch storage root
    console.log(
      `  Restoring ${manifestItems.length} blobs into scratch directory: ${restoreScratchDir}...`
    );
    await fs.mkdir(restoreScratchDir, { recursive: true });
    for (const item of manifestItems) {
      const srcBlob = path.join(backupBlobsDir, `${item.storageKey}.enc`);
      const destBlob = path.join(restoreScratchDir, `${item.storageKey}.enc`);
      const data = await fs.readFile(srcBlob);
      await fs.writeFile(destBlob, data);
    }
    console.log('  ✔ Encrypted blobs restored to scratch storage');

    // -------------------------------------------------------------
    // Step 4: Cryptographic & Database Verification
    // -------------------------------------------------------------
    console.log(
      '\n[Step 4/5] Connecting to restored test database and cryptographically verifying all records...'
    );

    const restorePrisma = new PrismaClient({
      datasources: {
        db: {
          url: `postgresql://postgres:postgres@localhost:5434/${RESTORE_TEST_DB_NAME}?schema=public`,
        },
      },
    });

    try {
      const restoredDocs = await restorePrisma.medicalDocument.findMany({
        where: { deletedAt: null },
        include: { storageMetadata: true },
      });

      if (restoredDocs.length !== manifestItems.length) {
        throw new Error(
          `Document count mismatch in restored DB: Expected ${manifestItems.length}, got ${restoredDocs.length}`
        );
      }
      console.log(
        `  ✔ Restored database contains expected ${restoredDocs.length} active documents.`
      );

      let verifiedFiles = 0;

      for (const doc of restoredDocs) {
        const meta = doc.storageMetadata;
        if (!meta) throw new Error(`Missing storage metadata for restored document ${doc.id}`);

        const blobPath = path.join(restoreScratchDir, `${meta.storageKey}.enc`);
        const ciphertext = await fs.readFile(blobPath);

        if (ciphertext.length !== meta.ciphertextBytes) {
          throw new Error(
            `Restored blob size mismatch for ${meta.storageKey}: expected ${meta.ciphertextBytes}, got ${ciphertext.length}`
          );
        }

        // Authenticated verify-before-release decryption
        const plaintext = decryptDocumentVerified({
          ciphertextBuffer: ciphertext,
          fileNonceB64: meta.fileNonce,
          fileAuthTagB64: meta.fileAuthTag,
          encryptedDekB64: meta.encryptedDek,
          dekNonceB64: meta.dekNonce,
          dekAuthTagB64: meta.dekAuthTag,
          documentId: doc.id,
          ownerId: doc.ownerId,
          masterKek,
          expectedSha256: meta.sha256Checksum,
          storageVersion: meta.storageVersion,
        });

        const actualSha256 = crypto.createHash('sha256').update(plaintext).digest('hex');
        if (actualSha256 !== meta.sha256Checksum) {
          throw new Error(`SHA-256 verification failed on restored document ${doc.id}`);
        }

        // If this is our synthetic test doc, verify exact plaintext contents
        if (testDocId && doc.id === testDocId) {
          const restoredText = plaintext.toString('utf8');
          if (restoredText !== testPlaintextContent) {
            throw new Error('Synthetic fixture plaintext content mismatch after restore');
          }
          console.log('  ✔ Synthetic test document content verified byte-for-byte.');
        }

        plaintext.fill(0); // Memory scrub
        verifiedFiles++;
      }

      console.log(
        `  ✔ Cryptographically decrypted and verified ${verifiedFiles}/${manifestItems.length} documents.`
      );
    } finally {
      await restorePrisma.$disconnect();
    }

    // -------------------------------------------------------------
    // Step 5: Clean up disposable test database and scratch files
    // -------------------------------------------------------------
    console.log('\n[Step 5/5] Cleaning up disposable test environment...');
    await execAsync(
      `docker exec -e PGPASSWORD=postgres ${CONTAINER_NAME} psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS ${RESTORE_TEST_DB_NAME};"`
    );
    console.log(`  ✔ Dropped disposable test database '${RESTORE_TEST_DB_NAME}'`);

    await fs.rm(restoreScratchDir, { recursive: true, force: true });
    console.log('  ✔ Removed scratch restore directory');

    // Clean synthetic fixture from medivault_dev if we seeded it
    if (testUserId) {
      await devPrisma.user.delete({ where: { id: testUserId } });
      if (testStorageKey) {
        await vaultStorageService.purgeBlob(testStorageKey);
      }
      console.log('  ✔ Cleaned synthetic test patient from medivault_dev');
    }

    console.log('\n================================================================');
    console.log('✔ FULL DISASTER RECOVERY & INTEGRITY TEST: 100% SUCCESSFUL');
    console.log('================================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n✖ DISASTER RECOVERY TEST FAILED:', err);
    try {
      await execAsync(
        `docker exec -e PGPASSWORD=postgres ${CONTAINER_NAME} psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS ${RESTORE_TEST_DB_NAME};"`
      );
    } catch {
      // Ignore
    }
    try {
      await fs.rm(restoreScratchDir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
    if (testUserId) {
      try {
        await devPrisma.user.delete({ where: { id: testUserId } });
      } catch {
        // Ignore
      }
      if (testStorageKey) {
        try {
          await vaultStorageService.purgeBlob(testStorageKey);
        } catch {
          // Ignore
        }
      }
    }
    process.exit(1);
  } finally {
    await devPrisma.$disconnect();
  }
}

runDisasterRecoveryTest();
