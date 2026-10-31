// backend/src/services/vault.service.ts
// MediVault AI — Secure Medical Vault Service

import crypto from 'crypto';
import { DocumentCategory, DocumentAuditEventType } from '@medivault/database';
import { vaultRepository, VaultRepository } from '../repositories/vault.repository';
import { vaultStorageService, IStorageService } from './storage.service';
import { clamAvService, IClamAvService } from './clamav.service';
import {
  encryptDocument,
  decryptDocumentVerified,
  getMasterKek,
  vaultCryptoSemaphore,
} from '../utils/vaultCrypto';
import { validateFileSignature } from '../utils/fileValidation';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';
import { DocumentDTO, StorageStatsDTO } from '../types/vault';

export interface UploadDocumentParams {
  ownerId: string;
  fileBuffer: Buffer;
  originalFileName: string;
  title?: string;
  category?: DocumentCategory;
  documentDate?: Date;
  notes?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class VaultService {
  constructor(
    private readonly repository: VaultRepository = vaultRepository,
    private readonly storage: IStorageService = vaultStorageService,
    private readonly clamAv: IClamAvService = clamAvService
  ) {}

  /**
   * Secure upload pipeline:
   * 1. Magic byte & extension validation
   * 2. Local ClamAV TCP INSTREAM scan (fail-closed)
   * 3. Ephemeral DEK generation & AES-256-GCM envelope encryption
   * 4. Atomic encrypted file staging & sharding
   * 5. Database transaction with pessimistic quota lock
   * 6. Memory scrubbing of plaintext buffers
   * 7. Compensating rollback on failure
   */
  async uploadDocument(params: UploadDocumentParams): Promise<DocumentDTO> {
    const { ownerId, fileBuffer, originalFileName, title, category, documentDate, notes, ipAddress, userAgent } = params;

    // 1. Validate file signature & extension
    const validated = validateFileSignature(fileBuffer, originalFileName);

    // 2. Scan in-memory buffer with ClamAV over TCP
    const scanResult = await this.clamAv.scanBuffer(fileBuffer);
    if (!scanResult.isClean) {
      await this.repository.logAuditEvent({
        userId: ownerId,
        eventType: DocumentAuditEventType.MALWARE_DETECTED,
        ipAddress,
        userAgent,
        details: JSON.stringify({ virusName: scanResult.virusName, fileName: validated.sanitizedFileName }),
      });

      // Scrub memory buffer immediately
      fileBuffer.fill(0);

      throw new AppError(
        `Malware detected: File infected with ${scanResult.virusName}. Upload rejected.`,
        400,
        'MALWARE_DETECTED'
      );
    }

    // 3. Cryptographic envelope preparation
    const docId = crypto.randomUUID();
    const storageKey = crypto.randomUUID();
    const masterKek = getMasterKek();

    // Acquire crypto concurrency semaphore
    const releaseSemaphore = await vaultCryptoSemaphore.acquire();
    let encResult;
    try {
      encResult = encryptDocument(fileBuffer, docId, ownerId, masterKek, 1);
    } finally {
      releaseSemaphore();
      // Best-effort plaintext memory scrubbing
      fileBuffer.fill(0);
    }

    // 4. Atomic physical file write
    let storedFile;
    try {
      storedFile = await this.storage.writeEncryptedBlob(storageKey, encResult.ciphertext);
    } catch (storageErr) {
      logger.error('Physical storage write failed', { error: (storageErr as Error).message });
      throw storageErr;
    }

    // 5. Database record creation under pessimistic quota lock
    try {
      const created = await this.repository.createDocumentWithStorage({
        id: docId,
        ownerId,
        title: title || originalFileName,
        originalFileName: validated.sanitizedFileName,
        mimeType: validated.mimeType,
        category: category || DocumentCategory.OTHER,
        fileSize: fileBuffer.length,
        documentDate,
        notes,
        storage: {
          storageKey,
          storageVersion: 1,
          keyVersion: 1,
          encryptedDek: encResult.wrappedDek.encryptedDek,
          dekNonce: encResult.wrappedDek.dekNonce,
          dekAuthTag: encResult.wrappedDek.dekAuthTag,
          fileNonce: encResult.fileNonce,
          fileAuthTag: encResult.fileAuthTag,
          sha256Checksum: encResult.sha256Checksum,
          ciphertextBytes: storedFile.ciphertextBytes,
        },
        audit: {
          ipAddress,
          userAgent,
          details: JSON.stringify({ action: 'DOCUMENT_UPLOADED', size: fileBuffer.length }),
        },
      });

      return this.toDTO(created);
    } catch (dbErr) {
      // Compensating rollback: Unlink physical file to avoid orphan blobs
      logger.error('Database transaction failed during upload. Executing compensating rollback', {
        storageKey,
        error: (dbErr as Error).message,
      });
      await this.storage.purgeBlob(storageKey);
      throw dbErr;
    }
  }

  /**
   * Authenticated document download with verify-before-release decryption:
   * 1. Check ownership (throws 404 if not found or unauthorized)
   * 2. Read encrypted ciphertext blob from disk
   * 3. Unwrap DEK and decrypt with full tag & AAD verification
   * 4. Log audit event
   */
  async downloadDocument(
    documentId: string,
    ownerId: string,
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ plaintextBuffer: Buffer; originalFileName: string; mimeType: string }> {
    const doc = await this.repository.findDocumentByIdAndOwner(documentId, ownerId);
    if (!doc || !doc.storageMetadata) {
      await this.repository.logAuditEvent({
        documentId,
        userId: ownerId,
        eventType: DocumentAuditEventType.DOCUMENT_ACCESS_DENIED,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      });
      throw new AppError('Document not found', 404, 'NOT_FOUND');
    }

    const { storageMetadata } = doc;
    const ciphertext = await this.storage.readEncryptedBlob(storageMetadata.storageKey);
    const masterKek = getMasterKek();

    const releaseSemaphore = await vaultCryptoSemaphore.acquire();
    let plaintextBuffer: Buffer;
    try {
      plaintextBuffer = decryptDocumentVerified({
        ciphertextBuffer: ciphertext,
        fileNonceB64: storageMetadata.fileNonce,
        fileAuthTagB64: storageMetadata.fileAuthTag,
        encryptedDekB64: storageMetadata.encryptedDek,
        dekNonceB64: storageMetadata.dekNonce,
        dekAuthTagB64: storageMetadata.dekAuthTag,
        documentId: doc.id,
        ownerId: doc.ownerId,
        masterKek,
        expectedSha256: storageMetadata.sha256Checksum,
        storageVersion: storageMetadata.storageVersion,
      });
    } finally {
      releaseSemaphore();
    }

    await this.repository.logAuditEvent({
      documentId: doc.id,
      userId: ownerId,
      eventType: DocumentAuditEventType.DOCUMENT_DOWNLOADED,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return {
      plaintextBuffer,
      originalFileName: doc.originalFileName,
      mimeType: doc.mimeType,
    };
  }

  /**
   * Fetches document metadata with BOLA defense (returns 404 on unowned).
   */
  async getDocument(
    documentId: string,
    ownerId: string,
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<DocumentDTO> {
    const doc = await this.repository.findDocumentByIdAndOwner(documentId, ownerId);
    if (!doc) {
      await this.repository.logAuditEvent({
        documentId,
        userId: ownerId,
        eventType: DocumentAuditEventType.DOCUMENT_ACCESS_DENIED,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      });
      throw new AppError('Document not found', 404, 'NOT_FOUND');
    }

    await this.repository.logAuditEvent({
      documentId: doc.id,
      userId: ownerId,
      eventType: DocumentAuditEventType.DOCUMENT_VIEWED,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return this.toDTO(doc);
  }

  /**
   * Lists active documents for the authenticated patient.
   */
  async listDocuments(
    ownerId: string,
    category?: DocumentCategory
  ): Promise<{ documents: DocumentDTO[]; stats: StorageStatsDTO }> {
    const [{ documents, total: _total }, stats] = await Promise.all([
      this.repository.listDocumentsByOwner(ownerId, { category }),
      this.repository.getStorageStats(ownerId),
    ]);

    const usedPercentage = Math.min(
      100,
      Math.round((stats.usedBytes / stats.quotaBytes) * 100)
    );

    return {
      documents: documents.map((d) => this.toDTO(d)),
      stats: {
        ...stats,
        usedPercentage,
      },
    };
  }

  /**
   * Updates non-sensitive metadata (title, category, notes, date).
   */
  async updateDocument(
    documentId: string,
    ownerId: string,
    updates: {
      title?: string;
      category?: DocumentCategory;
      notes?: string;
      documentDate?: Date;
    },
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<DocumentDTO> {
    const updated = await this.repository.updateDocument(documentId, ownerId, updates);
    if (!updated) {
      throw new AppError('Document not found', 404, 'NOT_FOUND');
    }

    await this.repository.logAuditEvent({
      documentId,
      userId: ownerId,
      eventType: DocumentAuditEventType.DOCUMENT_METADATA_UPDATED,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
      details: JSON.stringify(updates),
    });

    return this.toDTO(updated);
  }

  /**
   * Soft-deletes a document and moves its physical blob to tombstone storage.
   */
  async softDeleteDocument(
    documentId: string,
    ownerId: string,
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    const deleted = await this.repository.softDeleteDocument(documentId, ownerId);
    if (!deleted) {
      throw new AppError('Document not found', 404, 'NOT_FOUND');
    }

    if (deleted.storageMetadata) {
      await this.storage.tombstoneBlob(deleted.storageMetadata.storageKey);
    }

    await this.repository.logAuditEvent({
      documentId,
      userId: ownerId,
      eventType: DocumentAuditEventType.DOCUMENT_SOFT_DELETED,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });
  }

  /**
   * Converts database entity to safe client DTO (never reveals storageKey, DEKs, or nonces).
   */
  private toDTO(doc: {
    id: string;
    title: string;
    originalFileName: string;
    mimeType: string;
    category: DocumentCategory;
    fileSize: number;
    status: any;
    notes: string | null;
    documentDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): DocumentDTO {
    return {
      id: doc.id,
      title: doc.title,
      originalFileName: doc.originalFileName,
      mimeType: doc.mimeType,
      category: doc.category,
      fileSize: doc.fileSize,
      status: doc.status,
      notes: doc.notes,
      documentDate: doc.documentDate ? doc.documentDate.toISOString() : null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}

export const vaultService = new VaultService();
