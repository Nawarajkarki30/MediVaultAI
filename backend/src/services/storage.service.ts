// backend/src/services/storage.service.ts
// MediVault AI — Private Sharded Filesystem Storage Service

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

export interface StoredFileResult {
  storageKey: string;
  ciphertextBytes: number;
  filePath: string;
}

export interface IStorageService {
  writeEncryptedBlob(storageKey: string, encryptedData: Buffer): Promise<StoredFileResult>;
  readEncryptedBlob(storageKey: string): Promise<Buffer>;
  tombstoneBlob(storageKey: string): Promise<void>;
  restoreTombstoneBlob(storageKey: string): Promise<void>;
  purgeBlob(storageKey: string): Promise<void>;
  blobExists(storageKey: string): Promise<boolean>;
  reconcileStorage(activeKeys: Set<string>): Promise<{ orphaned: string[]; missing: string[] }>;
}

export class LocalVaultStorageService implements IStorageService {
  private readonly storageRoot: string;

  constructor(customRoot?: string) {
    this.storageRoot = path.resolve(customRoot || env.VAULT_STORAGE_ROOT);
    this.ensureBaseDirectories();
  }

  private ensureBaseDirectories(): void {
    const dirs = ['active', 'deleted', 'staging', 'orphans', 'backups'];
    for (const d of dirs) {
      const fullPath = path.join(this.storageRoot, d);
      if (!fsSync.existsSync(fullPath)) {
        fsSync.mkdirSync(fullPath, { recursive: true });
      }
    }
  }

  /**
   * Derives 2-level 2-character hexadecimal sharding paths to prevent flat directory bottlenecks.
   */
  private getShardRelativePath(storageKey: string): { shard1: string; shard2: string } {
    const cleanKey = storageKey.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const shard1 = cleanKey.length >= 2 ? cleanKey.substring(0, 2) : '00';
    const shard2 = cleanKey.length >= 4 ? cleanKey.substring(2, 4) : '00';
    return { shard1, shard2 };
  }

  private getActiveFilePath(storageKey: string): string {
    const { shard1, shard2 } = this.getShardRelativePath(storageKey);
    return path.join(this.storageRoot, 'active', shard1, shard2, `${storageKey}.enc`);
  }

  private getTombstoneFilePath(storageKey: string): string {
    const { shard1, shard2 } = this.getShardRelativePath(storageKey);
    return path.join(this.storageRoot, 'deleted', shard1, shard2, `${storageKey}.tombstone`);
  }

  private getStagingFilePath(storageKey: string): string {
    return path.join(this.storageRoot, 'staging', `tmp_${storageKey}_${Date.now()}.tmp`);
  }

  /**
   * Atomically writes an encrypted buffer to sharded storage.
   * Writes to staging/<tmp>.tmp, flushes to disk, and atomically renames to active/<shard>/<key>.enc.
   */
  async writeEncryptedBlob(storageKey: string, encryptedData: Buffer): Promise<StoredFileResult> {
    const stagingPath = this.getStagingFilePath(storageKey);
    const destinationPath = this.getActiveFilePath(storageKey);

    try {
      // 1. Ensure staging directory exists
      await fs.mkdir(path.dirname(stagingPath), { recursive: true });

      // 2. Write to staging
      await fs.writeFile(stagingPath, encryptedData);

      // 3. Ensure destination shard directory exists
      await fs.mkdir(path.dirname(destinationPath), { recursive: true });

      // 4. Atomic rename (promotion to active)
      await fs.rename(stagingPath, destinationPath);

      return {
        storageKey,
        ciphertextBytes: encryptedData.length,
        filePath: destinationPath,
      };
    } catch (error) {
      // Clean up staging file if present
      try {
        await fs.unlink(stagingPath);
      } catch {
        // Ignore staging cleanup error
      }
      throw new AppError(
        `Failed to write encrypted blob: ${(error as Error).message}`,
        500,
        'STORAGE_WRITE_ERROR'
      );
    }
  }

  /**
   * Reads the full encrypted blob into memory for authenticated decryption.
   * Throws 404 if file does not exist on disk.
   */
  async readEncryptedBlob(storageKey: string): Promise<Buffer> {
    const filePath = this.getActiveFilePath(storageKey);

    try {
      return await fs.readFile(filePath);
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ENOENT') {
        throw new AppError('Encrypted storage blob not found on disk', 404, 'STORAGE_NOT_FOUND');
      }
      throw new AppError(`Failed to read storage blob: ${err.message}`, 500, 'STORAGE_READ_ERROR');
    }
  }

  /**
   * Soft-deletes a blob by moving it atomically from active/ to deleted/ (tombstone).
   */
  async tombstoneBlob(storageKey: string): Promise<void> {
    const activePath = this.getActiveFilePath(storageKey);
    const tombstonePath = this.getTombstoneFilePath(storageKey);

    try {
      await fs.mkdir(path.dirname(tombstonePath), { recursive: true });
      await fs.rename(activePath, tombstonePath);
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code !== 'ENOENT') {
        throw new AppError(`Failed to tombstone blob: ${err.message}`, 500, 'STORAGE_ERROR');
      }
    }
  }

  /**
   * Restores a soft-deleted tombstone blob back to active storage.
   */
  async restoreTombstoneBlob(storageKey: string): Promise<void> {
    const activePath = this.getActiveFilePath(storageKey);
    const tombstonePath = this.getTombstoneFilePath(storageKey);

    try {
      await fs.mkdir(path.dirname(activePath), { recursive: true });
      await fs.rename(tombstonePath, activePath);
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ENOENT') {
        throw new AppError('Tombstone blob not found for restoration', 404, 'STORAGE_NOT_FOUND');
      }
      throw new AppError(`Failed to restore tombstone blob: ${err.message}`, 500, 'STORAGE_ERROR');
    }
  }

  /**
   * Permanently unlinks a blob from both active and deleted storage (hard purge).
   */
  async purgeBlob(storageKey: string): Promise<void> {
    const activePath = this.getActiveFilePath(storageKey);
    const tombstonePath = this.getTombstoneFilePath(storageKey);

    try {
      await fs.unlink(activePath);
    } catch {
      // Ignore if not in active
    }

    try {
      await fs.unlink(tombstonePath);
    } catch {
      // Ignore if not in deleted
    }
  }

  /**
   * Checks if an active encrypted blob exists on disk.
   */
  async blobExists(storageKey: string): Promise<boolean> {
    const filePath = this.getActiveFilePath(storageKey);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Reconciles physical files on disk against a set of expected storage keys from database.
   */
  async reconcileStorage(
    activeKeys: Set<string>
  ): Promise<{ orphaned: string[]; missing: string[] }> {
    const activeDir = path.join(this.storageRoot, 'active');
    const physicalKeys: string[] = [];

    async function walk(dir: string): Promise<void> {
      let entries: string[];
      try {
        entries = await fs.readdir(dir);
      } catch {
        return;
      }

      for (const entry of entries) {
        const full = path.join(dir, entry);
        const stat = await fs.stat(full);
        if (stat.isDirectory()) {
          await walk(full);
        } else if (entry.endsWith('.enc')) {
          physicalKeys.push(path.basename(entry, '.enc'));
        }
      }
    }

    await walk(activeDir);

    const physicalSet = new Set(physicalKeys);
    const orphaned: string[] = [];
    const missing: string[] = [];

    for (const pKey of physicalKeys) {
      if (!activeKeys.has(pKey)) {
        orphaned.push(pKey);
      }
    }

    for (const aKey of activeKeys) {
      if (!physicalSet.has(aKey)) {
        missing.push(aKey);
      }
    }

    return { orphaned, missing };
  }
}

export const vaultStorageService = new LocalVaultStorageService();
