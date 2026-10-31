// frontend/src/components/intelligence/IntelligenceReviewLayout.tsx
// MediVault AI — Responsive 3-Panel Desktop & 3-Screen Mobile Review Layout

import React from 'react';
import {
  AttentionItem,
  DocumentIntelligenceData,
  IntelligenceTab,
  MobileIntelligenceView,
  ReviewChecklistItem,
} from '../../types/documentIntelligence';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';
import { OriginalDocumentPanel } from './OriginalDocumentPanel';
import { ExtractedFieldsPanel } from './ExtractedFieldsPanel';
import { ReviewSummary } from './ReviewSummary';
import { MobileReviewTabs } from './MobileReviewTabs';
import { FieldToEdit } from './FieldCorrectionDialog';

interface IntelligenceReviewLayoutProps {
  data: DocumentIntelligenceData;
  language: DashboardLanguage;
  activePage: number;
  onPageChange: (page: number) => void;
  activeTab: IntelligenceTab;
  onTabChange: (tab: IntelligenceTab) => void;
  mobileView: MobileIntelligenceView;
  onMobileViewChange: (view: MobileIntelligenceView) => void;
  checklist: ReviewChecklistItem[];
  onToggleChecklistItem: (itemId: string) => void;
  onSelectAttentionItem?: (item: AttentionItem) => void;
  onEditField: (field: FieldToEdit) => void;
  onDownloadOriginal: () => void;
  onViewInVault: () => void;
  onShareDocument?: () => void;
  onSaveCorrectionsDemo: () => void;
  onCancelCorrections: () => void;
}

export const IntelligenceReviewLayout: React.FC<IntelligenceReviewLayoutProps> = ({
  data,
  language,
  activePage,
  onPageChange,
  activeTab,
  onTabChange,
  mobileView,
  onMobileViewChange,
  checklist,
  onToggleChecklistItem,
  onSelectAttentionItem,
  onEditField,
  onDownloadOriginal,
  onViewInVault,
  onShareDocument,
  onSaveCorrectionsDemo,
  onCancelCorrections,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="flex flex-col space-y-4" data-testid="intelligence-review-layout">
      {/* Mobile Tab Switcher */}
      <MobileReviewTabs
        currentView={mobileView}
        onViewChange={onMobileViewChange}
        data={data}
        language={language}
      />

      {/* Desktop 3-Panel Layout (hidden on mobile, visible lg:grid) */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-5 items-start">
        {/* Panel 1: Original Document (33% = 4 cols) */}
        <div className="col-span-4 sticky top-4">
          <OriginalDocumentPanel
            data={data}
            language={language}
            activePage={activePage}
            onPageChange={onPageChange}
            onDownloadOriginal={onDownloadOriginal}
          />
        </div>

        {/* Panel 2: Extracted Information (42% = 5 cols) */}
        <div className="col-span-5">
          <ExtractedFieldsPanel
            data={data}
            language={language}
            activeTab={activeTab}
            onTabChange={onTabChange}
            onEditField={onEditField}
            onNavigateToPage={onPageChange}
            onSaveCorrectionsDemo={onSaveCorrectionsDemo}
            onCancelCorrections={onCancelCorrections}
          />
        </div>

        {/* Panel 3: Review & Validation (25% = 3 cols) */}
        <div className="col-span-3 sticky top-4">
          <ReviewSummary
            data={data}
            language={language}
            checklist={checklist}
            onToggleChecklistItem={onToggleChecklistItem}
            onSelectAttentionItem={onSelectAttentionItem}
            onDownloadOriginal={onDownloadOriginal}
            onViewInVault={onViewInVault}
            onShareDocument={onShareDocument}
          />
        </div>
      </div>

      {/* Mobile Single-Screen Views (< lg) */}
      <div className="lg:hidden space-y-4">
        {/* Screen 1: Original Document */}
        {mobileView === 'original' && (
          <div className="space-y-4" data-testid="mobile-screen-original">
            <OriginalDocumentPanel
              data={data}
              language={language}
              activePage={activePage}
              onPageChange={onPageChange}
              onDownloadOriginal={onDownloadOriginal}
            />

            {/* Mobile Wireframe CTA: View Extracted Information */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-amber-700 dark:text-amber-300">
                  {t.statusNeedsReview}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onMobileViewChange('extracted')}
                className="w-full py-3 px-4 bg-[#2675F5] hover:bg-blue-600 text-white font-bold rounded-xl text-sm shadow-xs transition-colors flex items-center justify-center space-x-2"
                data-testid="mobile-view-extracted-btn"
              >
                <span>{t.mobileViewExtractedCTA}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Screen 2: Extracted Fields */}
        {mobileView === 'extracted' && (
          <div data-testid="mobile-screen-extracted">
            <ExtractedFieldsPanel
              data={data}
              language={language}
              activeTab={activeTab}
              onTabChange={onTabChange}
              onEditField={onEditField}
              onNavigateToPage={(page) => {
                onPageChange(page);
                onMobileViewChange('original');
              }}
              onSaveCorrectionsDemo={onSaveCorrectionsDemo}
              onCancelCorrections={onCancelCorrections}
            />
          </div>
        )}

        {/* Screen 3: Review & Validation */}
        {mobileView === 'review' && (
          <div data-testid="mobile-screen-review">
            <ReviewSummary
              data={data}
              language={language}
              checklist={checklist}
              onToggleChecklistItem={onToggleChecklistItem}
              onSelectAttentionItem={(item) => {
                if (item.targetSection === 'medication') {
                  onTabChange('meds');
                  onMobileViewChange('extracted');
                } else if (item.targetSection === 'lab') {
                  onTabChange('labs');
                  onMobileViewChange('extracted');
                }
              }}
              onDownloadOriginal={onDownloadOriginal}
              onViewInVault={onViewInVault}
              onShareDocument={onShareDocument}
            />
          </div>
        )}
      </div>
    </div>
  );
};
