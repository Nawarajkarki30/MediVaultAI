// frontend/src/services/vault.api.ts
// MediVault AI — Frontend Medical Vault API Client

import { getCachedCsrfToken, fetchCsrfToken } from './auth.api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiDocument {
  id: string;
  title: string;
  originalFileName: string;
  mimeType: string;
  category: string;
  fileSize: number;
  status: string;
  notes: string | null;
  documentDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiStorageStats {
  usedBytes: number;
  quotaBytes: number;
  documentCount: number;
  usedPercentage: number;
}

export interface ListDocumentsResponse {
  success: boolean;
  documents: ApiDocument[];
  stats: ApiStorageStats;
}

export interface UploadDocumentResponse {
  success: boolean;
  document: ApiDocument;
}

/**
 * Ensures CSRF token is available for state-changing requests
 */
async function getCsrfHeader(): Promise<Record<string, string>> {
  let token = getCachedCsrfToken();
  if (!token) {
    token = await fetchCsrfToken();
  }
  return token ? { 'X-CSRF-Token': token } : {};
}

export const vaultApi = {
  /**
   * Uploads a document to the secure encrypted vault
   */
  async uploadDocument(
    file: File,
    meta?: {
      title?: string;
      category?: string;
      notes?: string;
      documentDate?: string;
    }
  ): Promise<UploadDocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (meta?.title) formData.append('title', meta.title);
    if (meta?.category) formData.append('category', meta.category);
    if (meta?.notes) formData.append('notes', meta.notes);
    if (meta?.documentDate) formData.append('documentDate', meta.documentDate);

    const csrfHeader = await getCsrfHeader();

    const response = await fetch(`${API_BASE}/vault/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        ...csrfHeader,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || data.error || `Upload failed with status ${response.status}`);
    }

    return data;
  },

  /**
   * Lists authenticated patient's encrypted documents
   */
  async listDocuments(category?: string): Promise<ListDocumentsResponse> {
    const url = new URL(`${API_BASE}/vault/documents`);
    if (category && category !== 'all') {
      url.searchParams.set('category', category);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `Failed to fetch documents: ${response.status}`);
    }

    return data;
  },

  /**
   * Downloads verified and decrypted document attachment
   */
  async downloadDocument(id: string, originalFileName: string): Promise<void> {
    const response = await fetch(`${API_BASE}/vault/documents/${id}/download`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Download failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = originalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  /**
   * Updates document metadata
   */
  async updateDocument(
    id: string,
    data: {
      title?: string;
      category?: string;
      notes?: string;
      documentDate?: string;
    }
  ): Promise<ApiDocument> {
    const csrfHeader = await getCsrfHeader();
    const response = await fetch(`${API_BASE}/vault/documents/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeader,
      },
      body: JSON.stringify(data),
    });

    const resData = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(resData.message || `Failed to update document: ${response.status}`);
    }

    return resData.document;
  },

  /**
   * Soft-deletes a document
   */
  async deleteDocument(id: string): Promise<void> {
    const csrfHeader = await getCsrfHeader();
    const response = await fetch(`${API_BASE}/vault/documents/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        ...csrfHeader,
      },
    });

    const resData = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(resData.message || `Failed to delete document: ${response.status}`);
    }
  },
};
