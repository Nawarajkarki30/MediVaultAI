export type VaultCategory =
  | 'all'
  | 'lab-reports'
  | 'prescriptions'
  | 'imaging-reports'
  | 'discharge-summaries'
  | 'consultation-notes'
  | 'other';

export type VaultProcessingStatus =
  | 'uploaded'
  | 'pending-review'
  | 'reviewed'
  | 'not-available';

export type VaultFileType = 'all' | 'PDF' | 'JPG' | 'PNG';

export type VaultSortOption =
  | 'newest'
  | 'oldest'
  | 'name-asc'
  | 'recently-added';

export type VaultViewMode = 'grid' | 'list';

export interface VaultDocument {
  id: string;
  title: string;
  category: VaultCategory;
  categoryLabelEn: string;
  categoryLabelNe: string;
  facility: string;
  doctorName?: string;
  documentDate: string; // ISO date format YYYY-MM-DD
  documentDateDisplay: string; // e.g. "Oct 28, 2026"
  addedDate: string; // ISO date format YYYY-MM-DD
  addedDateDisplay: string; // e.g. "Oct 28, 2026"
  fileType: 'PDF' | 'JPG' | 'PNG';
  fileSize: string; // e.g. "2.4 MB"
  status: VaultProcessingStatus;
  notes?: string;
  previewType: 'table' | 'imaging' | 'prescription' | 'notes' | 'unavailable';
  downloadableSampleUrl?: string;
  summaryEn?: string;
  summaryNe?: string;
}

export interface VaultFilterState {
  searchQuery: string;
  category: VaultCategory;
  fileType: VaultFileType;
  status: VaultProcessingStatus | 'all';
  dateFrom: string; // YYYY-MM-DD or empty
  dateTo: string; // YYYY-MM-DD or empty
  sortBy: VaultSortOption;
}
