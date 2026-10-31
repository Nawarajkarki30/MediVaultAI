// frontend/src/components/intelligence/SourceReference.tsx
// MediVault AI — Clickable Source Reference Link Pill

import React from 'react';
import { SourceReferenceLocation } from '../../types/documentIntelligence';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface SourceReferenceProps {
  source: SourceReferenceLocation;
  language?: DashboardLanguage;
  onNavigateToPage?: (page: number) => void;
  className?: string;
}

export const SourceReference: React.FC<SourceReferenceProps> = ({
  source,
  language = 'en',
  onNavigateToPage,
  className = '',
}) => {
  const t = TRANSLATIONS[language];

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateToPage) {
      onNavigateToPage(source.page);
    }
  };

  const displayText = `${t.pageLabel} ${source.page}`;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center text-xs font-semibold text-[#2675F5] hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline focus:outline-none focus:ring-2 focus:ring-[#2675F5]/30 rounded px-1.5 py-0.5 transition-colors ${className}`}
      title={`${displayText}${source.table ? ` (${source.table})` : ''} - Click to view in original document`}
      aria-label={`View source in document at ${displayText}`}
      data-testid={`source-ref-page-${source.page}`}
    >
      <svg
        className="w-3.5 h-3.5 mr-1 opacity-70"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      {displayText}
    </button>
  );
};
