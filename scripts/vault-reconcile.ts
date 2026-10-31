// scripts/vault-reconcile.ts
// MediVault AI — Storage Vault & Metadata Reconciliation Utility

import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '@medivault/database';
import { vaultStorageService } from '../backend/src/services/storage.service';

async function main() {
  console.log('=== MediVault AI Vault Storage Reconciliation ===');

  try {
    // 1. Fetch all active storage keys from database
    const activeRecords = await prisma.documentStorageMetadata.findMany({
      where: {
        document: {
          deletedAt: null,
        },
      },
      select: {
        storageKey: true,
        documentId: true,
        document: {
          select: {
            title: true,
            ownerId: true,
          },
        },
      },
    });

    const activeKeySet = new Set<string>(activeRecords.map((r) => r.storageKey));
    console.log(`Active documents in PostgreSQL: ${activeRecords.length}`);

    // 2. Reconcile against physical storage files on disk
    const { orphaned, missing } = await vaultStorageService.reconcileStorage(activeKeySet);

    console.log(`Physical files matching database: ${activeRecords.length - missing.length}`);
    console.log(`Missing files (in DB, absent on disk): ${missing.length}`);
    console.log(`Orphaned files (on disk, unreferenced in DB): ${orphaned.length}`);

    if (missing.length > 0) {
      console.error('\n✖ CRITICAL: The following storage keys are registered in DB but missing from disk:');
      for (const key of missing) {
        console.error(`  - ${key}`);
      }
    }

    if (orphaned.length > 0) {
      console.warn('\n⚠ WARNING: The following files exist on disk but are unreferenced by active database records:');
      for (const key of orphaned) {
        console.warn(`  - ${key}.enc`);
      }

      // Check if --quarantine or --fix flag is passed
      const shouldFix = process.argv.includes('--fix');
      if (shouldFix) {
        console.log('\n[Action] Moving orphaned files to storage_vault/orphans/ ...');
        const orphansDir = path.resolve(process.env.VAULT_STORAGE_ROOT || './storage_vault', 'orphans');
        await fs.mkdir(orphansDir, { recursive: true });

        for (const orphanKey of orphaned) {
          const cleanKey = orphanKey.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          const shard1 = cleanKey.length >= 2 ? cleanKey.substring(0, 2) : '00';
          const shard2 = cleanKey.length >= 4 ? cleanKey.substring(2, 4) : '00';
          const src = path.resolve(
            process.env.VAULT_STORAGE_ROOT || './storage_vault',
            'active',
            shard1,
            shard2,
            `${orphanKey}.enc`
          );
          const dest = path.join(orphansDir, `${orphanKey}.enc`);
          await fs.rename(src, dest);
          console.log(`  -> Quarantined orphan: ${orphanKey}.enc`);
        }
        console.log('✔ All orphaned files safely quarantined.');
      } else {
        console.log('\nTip: Run with --fix to automatically move orphaned files to storage_vault/orphans/');
      }
    }

    if (missing.length === 0 && orphaned.length === 0) {
      console.log('\n✔ STORAGE CONSISTENCY CONFIRMED: 100% synchronization between database and disk.');
      process.exit(0);
    } else if (missing.length === 0 && process.argv.includes('--fix')) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('Reconciliation failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
