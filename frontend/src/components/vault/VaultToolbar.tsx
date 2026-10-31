import React from 'react';
import { Search, SlidersHorizontal, LayoutGrid, List, RotateCcw } from 'lucide-react';
import {
  VaultCategory,
  VaultFileType,
  VaultProcessingStatus,
  VaultSortOption,
  VaultViewMode,
  VaultFilterState,
} from '../../types/vault';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface VaultToolbarProps {
  language: DashboardLanguage;
  filters: VaultFilterState;
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: VaultCategory) => void;
  onFileTypeChange: (type: VaultFileType) => void;
  onStatusChange: (status: VaultProcessingStatus | 'all') => void;
  onSortChange: (sort: VaultSortOption) => void;
  onClearFilters: () => void;
  isFiltered: boolean;
  categoryCounts: Record<VaultCategory, number>;
  viewMode: VaultViewMode;
  onViewModeChange: (mode: VaultViewMode) => void;
  onOpenMobileFilters: () => void;
}

export const VaultToolbar: React.FC<VaultToolbarProps> = ({
  language,
  filters,
  onSearchChange,
  onCategoryChange,
  onFileTypeChange,
  onStatusChange,
  onSortChange,
  onClearFilters,
  isFiltered,
  categoryCounts,
  viewMode,
  onViewModeChange,
  onOpenMobileFilters,
}) => {
  const t = TRANSLATIONS[language];

  const categoryChips: { id: VaultCategory; label: string; count: number }[] = [
    { id: 'all', label: t.filterAll, count: categoryCounts.all },
    { id: 'lab-reports', label: t.catLabReports, count: categoryCounts['lab-reports'] },
    { id: 'prescriptions', label: t.catPrescriptions, count: categoryCounts.prescriptions },
    { id: 'imaging-reports', label: t.catImaging, count: categoryCounts['imaging-reports'] },
    {
      id: 'discharge-summaries',
      label: t.catDischarge,
      count: categoryCounts['discharge-summaries'],
    },
    {
      id: 'consultation-notes',
      label: t.catConsultation,
      count: categoryCounts['consultation-notes'],
    },
    { id: 'other', label: t.catOther, count: categoryCounts.other },
  ];

  return (
    <div className="space-y-4">
      {/* Primary Filter Toolbar Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="search"
            value={filters.searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchVaultPlaceholder}
            aria-label="Search documents in Health Vault"
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-navy-950 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-2xs transition-all"
          />
        </div>

        {/* Desktop Controls (Dropdowns + View Mode Toggle) */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {/* File Type Filter */}
          <select
            value={filters.fileType}
            onChange={(e) => onFileTypeChange(e.target.value as VaultFileType)}
            aria-label={t.allFileTypes}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-2xs"
          >
            <option value="all">{t.allFileTypes}</option>
            <option value="PDF">PDF</option>
            <option value="JPG">JPG / JPEG</option>
            <option value="PNG">PNG</option>
          </select>

          {/* Processing Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => onStatusChange(e.target.value as VaultProcessingStatus | 'all')}
            aria-label={t.allStatus}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-2xs"
          >
            <option value="all">{t.allStatus}</option>
            <option value="uploaded">{t.statusUploaded}</option>
            <option value="pending-review">{t.statusPendingReview}</option>
            <option value="reviewed">{t.statusReviewed}</option>
            <option value="not-available">{t.statusNotAvailable}</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={filters.sortBy}
            onChange={(e) => onSortChange(e.target.value as VaultSortOption)}
            aria-label="Sort options"
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-2xs"
          >
            <option value="newest">{t.sortNewest}</option>
            <option value="oldest">{t.sortOldest}</option>
            <option value="name-asc">{t.sortName}</option>
            <option value="recently-added">{t.sortRecentlyAdded}</option>
          </select>

          {/* View Mode Toggle (Grid / List) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-brand-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-navy-950'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden lg:inline">{t.viewGrid}</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-brand-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-navy-950'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden lg:inline">{t.viewList}</span>
            </button>
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="flex md:hidden items-center justify-between gap-2">
          <button
            type="button"
            onClick={onOpenMobileFilters}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs min-h-[40px]"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-500" />
            <span>{t.filterPanelTitle}</span>
            {isFiltered && <span className="w-2 h-2 rounded-full bg-brand-500" />}
          </button>

          {/* Mobile Grid/List toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              aria-label="Grid view"
              className={`p-2 rounded-lg text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-brand-500 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              aria-label="List view"
              className={`p-2 rounded-lg text-xs transition-colors ${
                viewMode === 'list' ? 'bg-brand-500 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Chips Row (Horizontally scrollable with counts) */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {categoryChips.map((chip) => {
            const isActive = filters.category === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => onCategoryChange(chip.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 min-h-[36px] flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:text-navy-950'
                } focus:outline-hidden focus:ring-2 focus:ring-brand-500`}
              >
                <span>{chip.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Clear Filter Action */}
        {isFiltered && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-semibold px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.clearFilters}</span>
          </button>
        )}
      </div>
    </div>
  );
};
