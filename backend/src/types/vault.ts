// backend/src/types/vault.ts
// MediVault AI — Vault Types & Safe DTOs

import { DocumentCategory, DocumentStatus } from '@medivault/database';

export interface DocumentDTO {
  id: string;
  title: string;
  originalFileName: string;
  mimeType: string;
  category: DocumentCategory;
  fileSize: number;
  status: DocumentStatus;
  notes: string | null;
  documentDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StorageStatsDTO {
  usedBytes: number;
  quotaBytes: number;
  documentCount: number;
  usedPercentage: number;
}
