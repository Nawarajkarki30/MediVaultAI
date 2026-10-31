// frontend/src/components/intelligence/MobileReviewTabs.tsx
// MediVault AI — Mobile Screen Tab Navigation & Compact Views

import React from 'react';
import { DocumentIntelligenceData, MobileIntelligenceView } from '../../types/documentIntelligence';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface MobileReviewTabsProps {
  currentView: MobileIntelligenceView;
  onViewChange: (view: MobileIntelligenceView) => void;
  data: DocumentIntelligenceData;
  language: DashboardLanguage;
}

export const MobileReviewTabs: React.FC<MobileReviewTabsProps> = ({
  currentView,
  onViewChange,
  data,
  language,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div
      className="lg:hidden flex items-center justify-around bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-2 py-1 sticky top-0 z-20 shadow-xs"
      data-testid="mobile-review-tabs"
    >
      <button
        type="button"
        onClick={() => onViewChange('original')}
        className={`flex-1 py-2.5 text-center text-xs font-bold border-b-2 transition-all ${
          currentView === 'original'
            ? 'border-[#2675F5] text-[#2675F5] dark:text-blue-400'
            : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
        }`}
        data-testid="mobile-tab-original"
      >
        {t.mobileBackToDoc}
      </button>

      <button
        type="button"
        onClick={() => onViewChange('extracted')}
        className={`flex-1 py-2.5 text-center text-xs font-bold border-b-2 transition-all flex items-center justify-center space-x-1.5 ${
          currentView === 'extracted'
            ? 'border-[#2675F5] text-[#2675F5] dark:text-blue-400'
            : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
        }`}
        data-testid="mobile-tab-extracted"
      >
        <span>{t.mobileExtractedTab}</span>
        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#2675F5] text-[10px] flex items-center justify-center">
          {data.labResults.length + data.medications.length}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onViewChange('review')}
        className={`flex-1 py-2.5 text-center text-xs font-bold border-b-2 transition-all flex items-center justify-center space-x-1.5 ${
          currentView === 'review'
            ? 'border-[#2675F5] text-[#2675F5] dark:text-blue-400'
            : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
        }`}
        data-testid="mobile-tab-review"
      >
        <span>{t.mobileReviewTab}</span>
        {data.attentionItems.length > 0 && (
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        )}
      </button>
    </div>
  );
};
