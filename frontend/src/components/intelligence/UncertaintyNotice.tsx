// frontend/src/components/intelligence/UncertaintyNotice.tsx
// MediVault AI — Clinical Uncertainty & Confidence Visual Indicators

import React from 'react';
import { ConfidenceLevel } from '../../types/documentIntelligence';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface ConfidencePillProps {
  confidence: ConfidenceLevel;
  language?: DashboardLanguage;
  showExplanation?: boolean;
}

export const ConfidencePill: React.FC<ConfidencePillProps> = ({
  confidence,
  language = 'en',
  showExplanation = false,
}) => {
  const t = TRANSLATIONS[language];

  const styleMap: Record<
    ConfidenceLevel,
    { bg: string; text: string; label: string; dot: string }
  > = {
    high: {
      bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      text: 'High',
      label: t.confidenceHigh,
      dot: 'bg-emerald-500',
    },
    medium: {
      bg: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      text: 'Medium',
      label: t.confidenceMedium,
      dot: 'bg-amber-500',
    },
    low: {
      bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      text: 'Low',
      label: t.confidenceLow,
      dot: 'bg-rose-500',
    },
  };

  const current = styleMap[confidence] || styleMap.high;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${current.bg}`}
      title={
        showExplanation
          ? `Simulated extraction confidence: ${current.label}. Indicates optical model match agreement only, NOT clinical correctness.`
          : undefined
      }
      data-testid={`confidence-pill-${confidence}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${current.dot}`} />
      {current.label}
    </span>
  );
};

interface MedicationWarningAlertProps {
  language?: DashboardLanguage;
  customMessage?: string;
}

export const MedicationWarningAlert: React.FC<MedicationWarningAlertProps> = ({
  language = 'en',
  customMessage,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div
      role="alert"
      className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 dark:bg-rose-950/30 dark:border-rose-900/60 flex items-start space-x-3 text-rose-800 dark:text-rose-200 text-xs md:text-sm"
      data-testid="medication-warning-alert"
    >
      <svg
        className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <div>
        <p className="font-medium leading-relaxed">{customMessage || t.medicationWarningAlert}</p>
      </div>
    </div>
  );
};
