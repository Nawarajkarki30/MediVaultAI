// frontend/src/components/intelligence/FieldCorrectionDialog.tsx
// MediVault AI — Field Correction Modal Dialog with Safety Guarantees

import React, { useState, useEffect } from 'react';
import { ConfidenceLevel, SourceReferenceLocation } from '../../types/documentIntelligence';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';
import { ConfidencePill } from './UncertaintyNotice';

export interface FieldToEdit {
  id: string;
  testName: string;
  originalValue: string;
  currentValue: string;
  unit?: string;
  referenceRange?: string;
  source: SourceReferenceLocation;
  confidence: ConfidenceLevel;
}

interface FieldCorrectionDialogProps {
  isOpen: boolean;
  field: FieldToEdit | null;
  language: DashboardLanguage;
  onSave: (fieldId: string, newValue: string, reason?: string) => void;
  onClose: () => void;
}

export const FieldCorrectionDialog: React.FC<FieldCorrectionDialogProps> = ({
  isOpen,
  field,
  language,
  onSave,
  onClose,
}) => {
  const t = TRANSLATIONS[language];
  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);

  useEffect(() => {
    if (field) {
      setValue(field.currentValue || field.originalValue || '');
      setReason('');
      setShowConfirmDiscard(false);
    }
  }, [field]);

  if (!isOpen || !field) return null;

  const hasUnsavedChanges =
    value !== (field.currentValue || field.originalValue) || reason.trim().length > 0;

  const handleRequestClose = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDiscard(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setShowConfirmDiscard(false);
    onClose();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSave(field.id, value.trim(), reason.trim() || undefined);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="correction-dialog-title"
      data-testid="field-correction-dialog"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-[#2675F5]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h3
              id="correction-dialog-title"
              className="text-base font-bold text-slate-900 dark:text-white"
            >
              {t.editFieldModalTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleRequestClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
            data-testid="close-correction-dialog-btn"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Field Metadata Reference */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span>{t.fieldTestName}:</span>
              <span className="font-bold text-slate-900 dark:text-white">{field.testName}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span>{t.originalExtractedValue}:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {field.originalValue} {field.unit || ''}
              </span>
            </div>
            {field.referenceRange && (
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>{t.referenceRangeLabel}:</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono text-xs">
                  {field.referenceRange} {field.unit || ''}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span>{t.sourceLocationLabel}:</span>
              <span className="text-slate-700 dark:text-slate-300">
                {t.pageLabel} {field.source.page}
                {field.source.table ? `, ${field.source.table}` : ''}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              <span>{t.fieldConfidence}:</span>
              <ConfidencePill confidence={field.confidence} language={language} showExplanation />
            </div>
          </div>

          {/* Edit Value Input */}
          <div>
            <label
              htmlFor="corrected-field-value"
              className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5"
            >
              {t.editValueLabel}{' '}
              {field.unit && <span className="font-normal text-slate-500">({field.unit})</span>}
            </label>
            <div className="relative rounded-xl shadow-xs">
              <input
                id="corrected-field-value"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-sm focus:ring-2 focus:ring-[#2675F5] focus:border-transparent outline-none pr-12 transition-all"
                placeholder="Enter verified value"
                data-testid="edit-field-input"
              />
              {field.unit && (
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-semibold text-slate-400">
                  {field.unit}
                </div>
              )}
            </div>
          </div>

          {/* Reason for Correction */}
          <div>
            <label
              htmlFor="corrected-field-reason"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              {t.reasonOptional}
            </label>
            <textarea
              id="corrected-field-reason"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t.reasonPlaceholder}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#2675F5] focus:border-transparent outline-none transition-all resize-none"
              data-testid="edit-field-reason-input"
            />
          </div>

          {/* Demonstration Notice */}
          <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 text-xs text-blue-800 dark:text-blue-300">
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
            <p className="leading-snug">{t.demoCorrectionDisclaimer}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleRequestClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              data-testid="cancel-correction-btn"
            >
              {t.cancelCorrectionBtn}
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#2675F5] hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors"
              data-testid="save-correction-btn"
            >
              {t.saveCorrectionModalBtn}
            </button>
          </div>
        </form>

        {/* Confirmation Discard Sub-Modal */}
        {showConfirmDiscard && (
          <div
            className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-6 flex flex-col justify-center items-center text-center z-20 space-y-4"
            data-testid="confirm-discard-dialog"
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {t.unsavedChangesTitle}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xs">
                {t.unsavedChangesMessage}
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDiscard(false)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl"
                data-testid="keep-editing-btn"
              >
                {t.keepEditingBtn}
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
                data-testid="discard-changes-btn"
              >
                {t.discardBtn}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
