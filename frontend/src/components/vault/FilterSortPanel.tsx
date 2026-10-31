import React, { useEffect, useRef } from 'react';
import { X, RotateCcw, Check } from 'lucide-react';
import {
  VaultCategory,
  VaultFileType,
  VaultProcessingStatus,
  VaultSortOption,
  VaultFilterState,
} from '../../types/vault';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface FilterSortPanelProps {
  isOpen: boolean;
  onClose: () => void;
  language: DashboardLanguage;
  filters: VaultFilterState;
  onCategoryChange: (cat: VaultCategory) => void;
  onFileTypeChange: (type: VaultFileType) => void;
  onStatusChange: (status: VaultProcessingStatus | 'all') => void;
  onSortChange: (sort: VaultSortOption) => void;
  onDateRangeChange: (from: string, to: string) => void;
  onClearFilters: () => void;
}

export const FilterSortPanel: React.FC<FilterSortPanelProps> = ({
  isOpen,
  onClose,
  language,
  filters,
  onCategoryChange,
  onFileTypeChange,
  onStatusChange,
  onSortChange,
  onDateRangeChange,
  onClearFilters,
}) => {
  const t = TRANSLATIONS[language];
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeBtnRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex flex-col justify-end lg:hidden animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-panel-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-white rounded-t-3xl border-t border-brand-border p-6 space-y-5 z-10 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 id="filter-panel-title" className="text-sm font-bold text-navy-950">
            {t.filterPanelTitle}
          </h2>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label={t.closeModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-navy-950 hover:bg-slate-100 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Form Controls */}
        <div className="space-y-4">
          {/* Category */}
          <div>
            <label htmlFor="mob-cat" className="block text-xs font-semibold text-slate-700 mb-1">
              {t.thCategory}
            </label>
            <select
              id="mob-cat"
              value={filters.category}
              onChange={(e) => onCategoryChange(e.target.value as VaultCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-navy-950 bg-slate-50/50"
            >
              <option value="all">{t.allCategories}</option>
              <option value="lab-reports">{t.catLabReports}</option>
              <option value="prescriptions">{t.catPrescriptions}</option>
              <option value="imaging-reports">{t.catImaging}</option>
              <option value="discharge-summaries">{t.catDischarge}</option>
              <option value="consultation-notes">{t.catConsultation}</option>
              <option value="other">{t.catOther}</option>
            </select>
          </div>

          {/* File Type */}
          <div>
            <label htmlFor="mob-file" className="block text-xs font-semibold text-slate-700 mb-1">
              {t.fileType}
            </label>
            <select
              id="mob-file"
              value={filters.fileType}
              onChange={(e) => onFileTypeChange(e.target.value as VaultFileType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-navy-950 bg-slate-50/50"
            >
              <option value="all">{t.allFileTypes}</option>
              <option value="PDF">PDF</option>
              <option value="JPG">JPG / JPEG</option>
              <option value="PNG">PNG</option>
            </select>
          </div>

          {/* Processing Status */}
          <div>
            <label htmlFor="mob-status" className="block text-xs font-semibold text-slate-700 mb-1">
              {t.thStatus}
            </label>
            <select
              id="mob-status"
              value={filters.status}
              onChange={(e) => onStatusChange(e.target.value as VaultProcessingStatus | 'all')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-navy-950 bg-slate-50/50"
            >
              <option value="all">{t.allStatus}</option>
              <option value="uploaded">{t.statusUploaded}</option>
              <option value="pending-review">{t.statusPendingReview}</option>
              <option value="reviewed">{t.statusReviewed}</option>
              <option value="not-available">{t.statusNotAvailable}</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="mob-sort" className="block text-xs font-semibold text-slate-700 mb-1">
              Sort By
            </label>
            <select
              id="mob-sort"
              value={filters.sortBy}
              onChange={(e) => onSortChange(e.target.value as VaultSortOption)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-navy-950 bg-slate-50/50"
            >
              <option value="newest">{t.sortNewest}</option>
              <option value="oldest">{t.sortOldest}</option>
              <option value="name-asc">{t.sortName}</option>
              <option value="recently-added">{t.sortRecentlyAdded}</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="mob-from" className="block text-xs font-semibold text-slate-700 mb-1">
                {t.dateRangeFrom}
              </label>
              <input
                id="mob-from"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onDateRangeChange(e.target.value, filters.dateTo)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-navy-950 bg-slate-50/50"
              />
            </div>
            <div>
              <label htmlFor="mob-to" className="block text-xs font-semibold text-slate-700 mb-1">
                {t.dateRangeTo}
              </label>
              <input
                id="mob-to"
                type="date"
                value={filters.dateTo}
                onChange={(e) => onDateRangeChange(filters.dateFrom, e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-navy-950 bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 min-h-[44px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.clearFilters}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 shadow-xs min-h-[44px]"
          >
            <Check className="w-4 h-4" />
            <span>{t.applyFilters}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
