// frontend/src/components/intelligence/ReviewStatusBadge.tsx
// MediVault AI — Review Status Indicator Badge

import React from 'react';
import { IntelligenceReviewStatus } from '../../types/documentIntelligence';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface ReviewStatusBadgeProps {
  status: IntelligenceReviewStatus;
  language?: DashboardLanguage;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ReviewStatusBadge: React.FC<ReviewStatusBadgeProps> = ({
  status,
  language = 'en',
  size = 'md',
  className = '',
}) => {
  const t = TRANSLATIONS[language];

  const config: Record<
    IntelligenceReviewStatus,
    { label: string; bg: string; text: string; dot: string; border: string }
  > = {
    'not-processed': {
      label: t.statusNotProcessed,
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-700 dark:text-slate-300',
      dot: 'bg-slate-400',
      border: 'border-slate-300 dark:border-slate-700',
    },
    'extraction-available': {
      label: t.statusExtractionAvailable,
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-700 dark:text-blue-300',
      dot: 'bg-blue-500',
      border: 'border-blue-200 dark:border-blue-800',
    },
    'needs-review': {
      label: t.statusNeedsReview,
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-800 dark:text-amber-200',
      dot: 'bg-amber-500 animate-pulse',
      border: 'border-amber-300 dark:border-amber-800',
    },
    'patient-reviewed': {
      label: t.statusPatientReviewed,
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-800 dark:text-emerald-200',
      dot: 'bg-emerald-500',
      border: 'border-emerald-300 dark:border-emerald-800',
    },
    'qualified-review-required': {
      label: t.statusQualifiedReview,
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-800 dark:text-purple-200',
      dot: 'bg-purple-500',
      border: 'border-purple-300 dark:border-purple-800',
    },
    'unable-to-read': {
      label: t.statusUnableToRead,
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-800 dark:text-rose-200',
      dot: 'bg-rose-500',
      border: 'border-rose-300 dark:border-rose-800',
    },
  };

  const item = config[status] || config['needs-review'];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 space-x-1.5',
    md: 'text-xs md:text-sm px-2.5 py-1 space-x-2 font-medium',
    lg: 'text-sm px-3 py-1.5 space-x-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${item.bg} ${item.text} ${item.border} ${sizeClasses[size]} ${className}`}
      data-testid="review-status-badge"
      data-status={status}
    >
      <span className={`w-2 h-2 rounded-full ${item.dot}`} aria-hidden="true" />
      <span>{item.label}</span>
    </span>
  );
};
