// backend/src/repositories/vault.repository.ts
// MediVault AI — Medical Document & Storage Repository with Pessimistic Quota Locking

import {
  prisma,
  MedicalDocument,
  DocumentStorageMetadata,
  DocumentAuditEvent,
  DocumentCategory,
  DocumentStatus,
  DocumentAuditEventType,
} from '@medivault/database';
import { AppError } from '../utils/appError';
import { env } from '../config/env';

export interface CreateDocumentInput {
  id?: string;
  ownerId: string;
  title: string;
  originalFileName: string;
  mimeType: string;
  category: DocumentCategory;
  fileSize: number;
  documentDate?: Date;
  notes?: string;
  storage: {
    storageKey: string;
    storageVersion?: number;
    keyVersion?: number;
    encryptedDek: string;
    dekNonce: string;
    dekAuthTag: string;
    fileNonce: string;
    fileAuthTag: string;
    sha256Checksum: string;
    ciphertextBytes: number;
  };
  audit: {
    ipAddress?: string;
    userAgent?: string;
    details?: string;
  };
}

export interface ListDocumentsFilters {
  category?: DocumentCategory;
  status?: DocumentStatus;
  limit?: number;
  offset?: number;
}

export type DocumentWithStorage = MedicalDocument & {
  storageMetadata: DocumentStorageMetadata | null;
};

export class VaultRepository {
  /**
   * Pessimistically locks user row, verifies storage quota, and creates document,
   * storage metadata, and audit event atomically in a single transaction.
   */
  async createDocumentWithStorage(input: CreateDocumentInput): Promise<DocumentWithStorage> {
    return prisma.$transaction(async (tx) => {
      // 1. Pessimistic lock on User row to prevent race conditions on storage quota
      await tx.$executeRaw`SELECT id FROM users WHERE id = ${input.ownerId} FOR UPDATE`;

      // 2. Compute current cumulative storage usage for active (non-deleted) documents
      const stats = await tx.medicalDocument.aggregate({
        where: {
          ownerId: input.ownerId,
          deletedAt: null,
        },
        _sum: {
          fileSize: true,
        },
        _count: {
          id: true,
        },
      });

      const currentBytes = stats._sum.fileSize || 0;
      if (currentBytes + input.fileSize > env.PATIENT_QUOTA_BYTES) {
        throw new AppError(
          `Storage quota exceeded: Current usage is ${Math.round(currentBytes / (1024 * 1024))} MB. Maximum allowed is ${Math.round(env.PATIENT_QUOTA_BYTES / (1024 * 1024))} MB.`,
          400,
          'QUOTA_EXCEEDED'
        );
      }

      // 3. Create MedicalDocument with nested StorageMetadata and AuditEvent
      const createdDoc = await tx.medicalDocument.create({
        data: {
          id: input.id,
          ownerId: input.ownerId,
          title: input.title,
          originalFileName: input.originalFileName,
          mimeType: input.mimeType,
          category: input.category,
          fileSize: input.fileSize,
          status: DocumentStatus.ACTIVE,
          notes: input.notes,
          documentDate: input.documentDate,
          storageMetadata: {
            create: {
              storageKey: input.storage.storageKey,
              storageVersion: input.storage.storageVersion || 1,
              keyVersion: input.storage.keyVersion || 1,
              encryptedDek: input.storage.encryptedDek,
              dekNonce: input.storage.dekNonce,
              dekAuthTag: input.storage.dekAuthTag,
              fileNonce: input.storage.fileNonce,
              fileAuthTag: input.storage.fileAuthTag,
              sha256Checksum: input.storage.sha256Checksum,
              ciphertextBytes: input.storage.ciphertextBytes,
            },
          },
          auditEvents: {
            create: {
              userId: input.ownerId,
              eventType: DocumentAuditEventType.DOCUMENT_UPLOADED,
              ipAddress: input.audit.ipAddress,
              userAgent: input.audit.userAgent,
              details: input.audit.details,
            },
          },
        },
        include: {
          storageMetadata: true,
        },
      });

      return createdDoc;
    });
  }

  /**
   * Fetches document by ID with strict ownership verification.
   * If document does not belong to ownerId, returns null (enforcing 404 BOLA defense).
   */
  async findDocumentByIdAndOwner(
    documentId: string,
    ownerId: string
  ): Promise<DocumentWithStorage | null> {
    return prisma.medicalDocument.findFirst({
      where: {
        id: documentId,
        ownerId,
        deletedAt: null,
      },
      include: {
        storageMetadata: true,
      },
    });
  }

  /**
   * Lists active documents owned by the patient.
   */
  async listDocumentsByOwner(
    ownerId: string,
    filters: ListDocumentsFilters = {}
  ): Promise<{ documents: MedicalDocument[]; total: number }> {
    const whereClause: {
      ownerId: string;
      deletedAt: null;
      category?: DocumentCategory;
      status?: DocumentStatus;
    } = {
      ownerId,
      deletedAt: null,
    };

    if (filters.category) {
      whereClause.category = filters.category;
    }
    if (filters.status) {
      whereClause.status = filters.status;
    }

    const [documents, total] = await Promise.all([
      prisma.medicalDocument.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      prisma.medicalDocument.count({
        where: whereClause,
      }),
    ]);

    return { documents, total };
  }

  /**
   * Fetches storage utilization metrics for a patient.
   */
  async getStorageStats(ownerId: string): Promise<{ usedBytes: number; quotaBytes: number; documentCount: number }> {
    const stats = await prisma.medicalDocument.aggregate({
      where: {
        ownerId,
        deletedAt: null,
      },
      _sum: {
        fileSize: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      usedBytes: stats._sum.fileSize || 0,
      quotaBytes: env.PATIENT_QUOTA_BYTES,
      documentCount: stats._count.id || 0,
    };
  }

  /**
   * Updates non-cryptographic document metadata.
   */
  async updateDocument(
    documentId: string,
    ownerId: string,
    data: {
      title?: string;
      category?: DocumentCategory;
      notes?: string;
      documentDate?: Date;
    }
  ): Promise<MedicalDocument | null> {
    const doc = await prisma.medicalDocument.findFirst({
      where: { id: documentId, ownerId, deletedAt: null },
    });
    if (!doc) return null;

    return prisma.medicalDocument.update({
      where: { id: documentId },
      data,
    });
  }

  /**
   * Soft-deletes a document and records the deletion timestamp.
   */
  async softDeleteDocument(documentId: string, ownerId: string): Promise<DocumentWithStorage | null> {
    const doc = await prisma.medicalDocument.findFirst({
      where: { id: documentId, ownerId, deletedAt: null },
      include: { storageMetadata: true },
    });
    if (!doc) return null;

    return prisma.medicalDocument.update({
      where: { id: documentId },
      data: {
        deletedAt: new Date(),
        status: DocumentStatus.DELETED,
      },
      include: {
        storageMetadata: true,
      },
    });
  }

  /**
   * Records a security audit event.
   */
  async logAuditEvent(data: {
    documentId?: string;
    userId: string;
    eventType: DocumentAuditEventType;
    ipAddress?: string;
    userAgent?: string;
    details?: string;
  }): Promise<DocumentAuditEvent> {
    return prisma.documentAuditEvent.create({
      data: {
        documentId: data.documentId,
        userId: data.userId,
        eventType: data.eventType,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        details: data.details,
      },
    });
  }
}

export const vaultRepository = new VaultRepository();
