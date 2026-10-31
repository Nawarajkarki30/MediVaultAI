import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  VaultDocument,
  VaultCategory,
  VaultFileType,
  VaultProcessingStatus,
  VaultSortOption,
  VaultViewMode,
  VaultFilterState,
} from '../types/vault';
import { DEMO_VAULT_DOCUMENTS } from '../data/demoVault';
import { vaultApi, ApiDocument } from '../services/vault.api';

function mapApiToVaultDoc(apiDoc: ApiDocument): VaultDocument {
  const ext = apiDoc.originalFileName.split('.').pop()?.toUpperCase() || 'PDF';
  const fileType: 'PDF' | 'JPG' | 'PNG' =
    ext === 'PNG' ? 'PNG' : ext === 'JPG' || ext === 'JPEG' ? 'JPG' : 'PDF';
  const sizeMb = (apiDoc.fileSize / (1024 * 1024)).toFixed(1);
  const sizeDisplay =
    apiDoc.fileSize >= 1024 * 1024 ? `${sizeMb} MB` : `${Math.round(apiDoc.fileSize / 1024)} KB`;

  let cat: VaultCategory = 'other';
  if (apiDoc.category === 'LABORATORY_REPORT') cat = 'lab-reports';
  else if (apiDoc.category === 'PRESCRIPTION') cat = 'prescriptions';
  else if (apiDoc.category === 'IMAGING_REPORT') cat = 'imaging-reports';
  else if (apiDoc.category === 'DISCHARGE_SUMMARY') cat = 'discharge-summaries';
  else if (apiDoc.category === 'CONSULTATION_NOTE') cat = 'consultation-notes';

  const dateObj = apiDoc.documentDate ? new Date(apiDoc.documentDate) : new Date(apiDoc.createdAt);
  const dateStr = dateObj.toISOString().split('T')[0];
  const dateDisplay = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    id: apiDoc.id,
    title: apiDoc.title,
    category: cat,
    categoryLabelEn: apiDoc.category.replace(/_/g, ' '),
    categoryLabelNe: apiDoc.category,
    facility: 'Personal Health Vault (Encrypted)',
    documentDate: dateStr,
    documentDateDisplay: dateDisplay,
    addedDate: apiDoc.createdAt.split('T')[0],
    addedDateDisplay: dateDisplay,
    fileType,
    fileSize: sizeDisplay,
    status: 'reviewed',
    notes: apiDoc.notes || undefined,
    previewType: fileType === 'PDF' ? 'table' : 'imaging',
  };
}

export interface UseVaultDocumentsReturn {
  // Data
  documents: VaultDocument[];
  filteredDocuments: VaultDocument[];
  categoryCounts: Record<VaultCategory, number>;

  // Filters & Search
  filters: VaultFilterState;
  setSearchQuery: (query: string) => void;
  setCategory: (category: VaultCategory) => void;
  setFileType: (fileType: VaultFileType) => void;
  setStatus: (status: VaultProcessingStatus | 'all') => void;
  setDateRange: (from: string, to: string) => void;
  setSortBy: (sort: VaultSortOption) => void;
  clearFilters: () => void;
  isFiltered: boolean;

  // View Mode
  viewMode: VaultViewMode;
  setViewMode: (mode: VaultViewMode) => void;

  // Modals & Active Selections
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  isFilterSheetOpen: boolean;
  setIsFilterSheetOpen: (open: boolean) => void;
  activeActionDocument: VaultDocument | null;
  setActiveActionDocument: (doc: VaultDocument | null) => void;
  activeEditTitleDocument: VaultDocument | null;
  setActiveEditTitleDocument: (doc: VaultDocument | null) => void;
  activeChangeCategoryDocument: VaultDocument | null;
  setActiveChangeCategoryDocument: (doc: VaultDocument | null) => void;
  activeDeleteDocument: VaultDocument | null;
  setActiveDeleteDocument: (doc: VaultDocument | null) => void;

  // Demo Banner & Toast
  isDemoBannerDismissed: boolean;
  setIsDemoBannerDismissed: (dismissed: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Document Mutations
  updateDocumentTitle: (id: string, newTitle: string) => void;
  updateDocumentCategory: (
    id: string,
    newCategory: VaultCategory,
    labelEn: string,
    labelNe: string
  ) => void;
  updateDocumentNotes: (id: string, notes: string) => void;
  deleteDocument: (id: string) => void;
  resetDemoDocuments: () => void;
  refreshDocuments: () => Promise<void>;
}

export const useVaultDocuments = (): UseVaultDocumentsReturn => {
  const [documents, setDocuments] = useState<VaultDocument[]>(DEMO_VAULT_DOCUMENTS);
  const [viewMode, setViewMode] = useState<VaultViewMode>('grid');

  const [filters, setFilters] = useState<VaultFilterState>({
    searchQuery: '',
    category: 'all',
    fileType: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'newest',
  });

  // Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [activeActionDocument, setActiveActionDocument] = useState<VaultDocument | null>(null);
  const [activeEditTitleDocument, setActiveEditTitleDocument] = useState<VaultDocument | null>(
    null
  );
  const [activeChangeCategoryDocument, setActiveChangeCategoryDocument] =
    useState<VaultDocument | null>(null);
  const [activeDeleteDocument, setActiveDeleteDocument] = useState<VaultDocument | null>(null);
  const [isDemoBannerDismissed, setIsDemoBannerDismissed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  const refreshDocuments = useCallback(async () => {
    try {
      const res = await vaultApi.listDocuments();
      if (res && res.documents && res.documents.length > 0) {
        const liveDocs = res.documents.map(mapApiToVaultDoc);
        setDocuments((prev) => {
          const nonLive = prev.filter(
            (p) => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p.id)
          );
          return [...liveDocs, ...nonLive];
        });
      }
    } catch {
      // Gracefully fall back to demo documents if offline or in testing
    }
  }, []);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  // Setters
  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const setCategory = useCallback((category: VaultCategory) => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const setFileType = useCallback((fileType: VaultFileType) => {
    setFilters((prev) => ({ ...prev, fileType }));
  }, []);

  const setStatus = useCallback((status: VaultProcessingStatus | 'all') => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const setDateRange = useCallback((from: string, to: string) => {
    setFilters((prev) => ({ ...prev, dateFrom: from, dateTo: to }));
  }, []);

  const setSortBy = useCallback((sortBy: VaultSortOption) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      category: 'all',
      fileType: 'all',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      sortBy: 'newest',
    });
  }, []);

  const isFiltered = useMemo(() => {
    return (
      filters.searchQuery.trim() !== '' ||
      filters.category !== 'all' ||
      filters.fileType !== 'all' ||
      filters.status !== 'all' ||
      filters.dateFrom !== '' ||
      filters.dateTo !== '' ||
      filters.sortBy !== 'newest'
    );
  }, [filters]);

  // Category Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<VaultCategory, number> = {
      all: documents.length,
      'lab-reports': 0,
      prescriptions: 0,
      'imaging-reports': 0,
      'discharge-summaries': 0,
      'consultation-notes': 0,
      other: 0,
    };

    for (const doc of documents) {
      if (counts[doc.category] !== undefined) {
        counts[doc.category]++;
      } else {
        counts.other++;
      }
    }

    return counts;
  }, [documents]);

  // Filtered & Sorted Documents
  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        // Search query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchTitle = doc.title.toLowerCase().includes(q);
          const matchFacility = doc.facility.toLowerCase().includes(q);
          const matchDoctor = doc.doctorName?.toLowerCase().includes(q) || false;
          const matchCategoryEn = doc.categoryLabelEn.toLowerCase().includes(q);
          const matchCategoryNe = doc.categoryLabelNe.toLowerCase().includes(q);
          if (
            !matchTitle &&
            !matchFacility &&
            !matchDoctor &&
            !matchCategoryEn &&
            !matchCategoryNe
          ) {
            return false;
          }
        }

        // Category
        if (filters.category !== 'all' && doc.category !== filters.category) {
          return false;
        }

        // File Type
        if (filters.fileType !== 'all' && doc.fileType !== filters.fileType) {
          return false;
        }

        // Processing Status
        if (filters.status !== 'all' && doc.status !== filters.status) {
          return false;
        }

        // Date Range
        if (filters.dateFrom && doc.documentDate < filters.dateFrom) {
          return false;
        }
        if (filters.dateTo && doc.documentDate > filters.dateTo) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'newest':
            return b.documentDate.localeCompare(a.documentDate);
          case 'oldest':
            return a.documentDate.localeCompare(b.documentDate);
          case 'name-asc':
            return a.title.localeCompare(b.title);
          case 'recently-added':
            return b.addedDate.localeCompare(a.addedDate);
          default:
            return 0;
        }
      });
  }, [documents, filters]);

  // Document Mutations
  const updateDocumentTitle = useCallback(
    async (id: string, newTitle: string) => {
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === id ? { ...doc, title: newTitle } : doc))
      );
      setActiveEditTitleDocument(null);
      showToast(`Document renamed to "${newTitle}"`);

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        try {
          await vaultApi.updateDocument(id, { title: newTitle });
        } catch {
          // Gracefully retain optimistic client state
        }
      }
    },
    [showToast]
  );

  const updateDocumentCategory = useCallback(
    async (id: string, newCategory: VaultCategory, labelEn: string, labelNe: string) => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id
            ? {
                ...doc,
                category: newCategory,
                categoryLabelEn: labelEn,
                categoryLabelNe: labelNe,
              }
            : doc
        )
      );
      setActiveChangeCategoryDocument(null);
      showToast(`Category updated to "${labelEn}"`);
    },
    [showToast]
  );

  const updateDocumentNotes = useCallback(
    (id: string, notes: string) => {
      setDocuments((prev) => prev.map((doc) => (doc.id === id ? { ...doc, notes } : doc)));
      showToast('Notes saved.');
    },
    [showToast]
  );

  const deleteDocument = useCallback(
    async (id: string) => {
      const docToDelete = documents.find((d) => d.id === id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      setActiveDeleteDocument(null);
      if (docToDelete) {
        showToast(`Document "${docToDelete.title}" removed.`);
      }

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        try {
          await vaultApi.deleteDocument(id);
        } catch {
          // Gracefully retain optimistic client state
        }
      }
    },
    [documents, showToast]
  );

  const resetDemoDocuments = useCallback(() => {
    setDocuments(DEMO_VAULT_DOCUMENTS);
    showToast('Demo documents restored.');
  }, [showToast]);

  return {
    documents,
    filteredDocuments,
    categoryCounts,
    filters,
    setSearchQuery,
    setCategory,
    setFileType,
    setStatus,
    setDateRange,
    setSortBy,
    clearFilters,
    isFiltered,
    viewMode,
    setViewMode,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isFilterSheetOpen,
    setIsFilterSheetOpen,
    activeActionDocument,
    setActiveActionDocument,
    activeEditTitleDocument,
    setActiveEditTitleDocument,
    activeChangeCategoryDocument,
    setActiveChangeCategoryDocument,
    activeDeleteDocument,
    setActiveDeleteDocument,
    isDemoBannerDismissed,
    setIsDemoBannerDismissed,
    toastMessage,
    showToast,
    updateDocumentTitle,
    updateDocumentCategory,
    updateDocumentNotes,
    deleteDocument,
    resetDemoDocuments,
    refreshDocuments,
  };
};
