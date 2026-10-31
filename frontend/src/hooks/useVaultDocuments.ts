import { useState, useMemo, useCallback } from 'react';
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

  // Document Mutations (Client-side Demo State)
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
  const [activeEditTitleDocument, setActiveEditTitleDocument] = useState<VaultDocument | null>(null);
  const [activeChangeCategoryDocument, setActiveChangeCategoryDocument] = useState<VaultDocument | null>(null);
  const [activeDeleteDocument, setActiveDeleteDocument] = useState<VaultDocument | null>(null);
  const [isDemoBannerDismissed, setIsDemoBannerDismissed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

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

  // Compute category counts
  const categoryCounts = useMemo<Record<VaultCategory, number>>(() => {
    const counts: Record<VaultCategory, number> = {
      all: documents.length,
      'lab-reports': 0,
      prescriptions: 0,
      'imaging-reports': 0,
      'discharge-summaries': 0,
      'consultation-notes': 0,
      other: 0,
    };

    documents.forEach((doc) => {
      if (counts[doc.category] !== undefined) {
        counts[doc.category] += 1;
      }
    });

    return counts;
  }, [documents]);

  // Filter & Sort computation
  const filteredDocuments = useMemo(() => {
    const filtered = documents.filter((doc) => {
      // Category filter
      if (filters.category !== 'all' && doc.category !== filters.category) {
        return false;
      }

      // File Type filter
      if (filters.fileType !== 'all' && doc.fileType !== filters.fileType) {
        return false;
      }

      // Processing Status filter
      if (filters.status !== 'all' && doc.status !== filters.status) {
        return false;
      }

      // Date Range filters (comparing YYYY-MM-DD)
      if (filters.dateFrom && doc.documentDate < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && doc.documentDate > filters.dateTo) {
        return false;
      }

      // Search Query filter
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(q);
        const matchesFacility = doc.facility.toLowerCase().includes(q);
        const matchesCatEn = doc.categoryLabelEn.toLowerCase().includes(q);
        const matchesCatNe = doc.categoryLabelNe.toLowerCase().includes(q);
        const matchesDoctor = doc.doctorName ? doc.doctorName.toLowerCase().includes(q) : false;
        const matchesNotes = doc.notes ? doc.notes.toLowerCase().includes(q) : false;

        if (!matchesTitle && !matchesFacility && !matchesCatEn && !matchesCatNe && !matchesDoctor && !matchesNotes) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    return filtered.sort((a, b) => {
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

  // Document Mutations (Client-side Session only)
  const updateDocumentTitle = useCallback((id: string, newTitle: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, title: newTitle.trim() } : doc))
    );
  }, []);

  const updateDocumentCategory = useCallback(
    (id: string, newCategory: VaultCategory, labelEn: string, labelNe: string) => {
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
    },
    []
  );

  const updateDocumentNotes = useCallback((id: string, notes: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, notes: notes.trim() } : doc))
    );
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  }, []);

  const resetDemoDocuments = useCallback(() => {
    setDocuments(DEMO_VAULT_DOCUMENTS);
  }, []);

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
  };
};
