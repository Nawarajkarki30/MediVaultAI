// frontend/src/components/intelligence/ReviewSummary.tsx
// MediVault AI — Review Progress, Validation Checklist, and Document Actions Panel

import React from 'react';
import {
  AttentionItem,
  DocumentIntelligenceData,
  ReviewChecklistItem,
} from '../../types/documentIntelligence';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface ReviewSummaryProps {
  data: DocumentIntelligenceData;
  language: DashboardLanguage;
  checklist: ReviewChecklistItem[];
  onToggleChecklistItem: (itemId: string) => void;
  onSelectAttentionItem?: (item: AttentionItem) => void;
  onDownloadOriginal: () => void;
  onViewInVault: () => void;
  onShareDocument?: () => void;
  className?: string;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  data,
  language,
  checklist,
  onToggleChecklistItem,
  onSelectAttentionItem,
  onDownloadOriginal,
  onViewInVault,
  onShareDocument,
  className = '',
}) => {
  const t = TRANSLATIONS[language];

  // Calculate review progress percentage
  const totalFields = data.totalFieldsCount || 7;
  const reviewedFields = data.reviewedFieldsCount || 3;
  const progressPercent = Math.min(Math.round((reviewedFields / totalFields) * 100), 100);

  return (
    <div
      className={`flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden ${className}`}
      data-testid="review-summary-panel"
    >
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center space-x-2">
          <span className="w-5 h-5 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {t.reviewValidation}
          </h3>
        </div>
      </div>

      <div className="p-4 md:p-5 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
        {/* Review Progress Card */}
        <div
          className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 space-y-2.5"
          data-testid="review-progress-card"
        >
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              {t.reviewProgress}
            </span>
            <span className="font-extrabold text-[#2675F5] dark:text-blue-400">
              {progressPercent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-[#2675F5] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {reviewedFields} of {totalFields} fields reviewed
          </p>
        </div>

        {/* Items Requiring Attention */}
        <div className="space-y-2.5" data-testid="attention-items-section">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {t.itemsRequiringAttention}
            </h4>
            {data.attentionItems.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center">
                {data.attentionItems.length}
              </span>
            )}
          </div>

          {data.attentionItems.length > 0 ? (
            <div className="space-y-2">
              {data.attentionItems.map((item) => {
                const isHigh = item.severity === 'high';
                const title = language === 'ne' ? item.titleNe : item.titleEn;
                const desc = language === 'ne' ? item.descriptionNe : item.descriptionEn;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectAttentionItem && onSelectAttentionItem(item)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between space-x-2 ${
                      isHigh
                        ? 'bg-rose-50/70 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50 hover:bg-rose-100/70'
                        : 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50 hover:bg-amber-100/70'
                    }`}
                    data-testid={`attention-item-${item.id}`}
                  >
                    <div className="flex items-start space-x-2">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                          isHigh ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                        }`}
                      >
                        !
                      </span>
                      <div>
                        <p
                          className={`font-bold text-xs ${
                            isHigh
                              ? 'text-rose-900 dark:text-rose-200'
                              : 'text-amber-900 dark:text-amber-200'
                          }`}
                        >
                          {title}
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                          {desc}
                        </p>
                      </div>
                    </div>
                    <span className="text-slate-400 font-semibold text-xs">&gt;</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              No outstanding anomalies or attention items.
            </p>
          )}
        </div>

        {/* Review Checklist */}
        <div className="space-y-2.5" data-testid="review-checklist-section">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {t.reviewChecklist}
          </h4>
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
            {checklist.map((item) => {
              const label = language === 'ne' ? item.labelNe : item.labelEn;
              return (
                <label
                  key={item.id}
                  className="flex items-center space-x-2.5 cursor-pointer text-xs select-none"
                  data-testid={`checklist-item-${item.id}`}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => onToggleChecklistItem(item.id)}
                    className="w-4 h-4 rounded border-slate-300 text-[#2675F5] focus:ring-[#2675F5]"
                  />
                  <span
                    className={`font-medium ${
                      item.completed
                        ? 'text-slate-900 dark:text-slate-100 line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Important Notice */}
        <div
          className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/60 flex items-start space-x-2.5 text-xs text-blue-900 dark:text-blue-200"
          data-testid="important-notice-card"
        >
          <svg
            className="w-4 h-4 text-[#2675F5] flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h5 className="font-bold text-xs mb-1">{t.importantNotice}</h5>
            <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
              {t.importantNoticeText}
            </p>
          </div>
        </div>

        {/* Document Actions */}
        <div
          className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800"
          data-testid="document-actions-section"
        >
          <div className="flex items-center space-x-2">
            <span className="w-4 h-4 rounded bg-purple-100 dark:bg-purple-900/50 text-purple-600 flex items-center justify-center">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {t.documentActions}
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={onDownloadOriginal}
              className="flex items-center justify-center space-x-2 py-2 px-3 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors"
              data-testid="action-download-original"
            >
              <svg
                className="w-3.5 h-3.5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>{t.downloadOriginal}</span>
            </button>

            <button
              type="button"
              onClick={onViewInVault}
              className="flex items-center justify-center space-x-2 py-2 px-3 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors"
              data-testid="action-view-in-vault"
            >
              <svg
                className="w-3.5 h-3.5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>{t.viewInVault}</span>
            </button>

            <button
              type="button"
              onClick={onShareDocument}
              className="flex items-center justify-center space-x-2 py-2 px-3 bg-slate-50 dark:bg-slate-850 text-slate-400 font-semibold rounded-xl text-xs cursor-not-allowed opacity-80"
              disabled
              title="Coming in Phase 2E"
              data-testid="action-share-document"
            >
              <svg
                className="w-3.5 h-3.5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              <span>{t.shareFuture}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
