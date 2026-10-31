import React, { useEffect, useRef } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { VaultDocument } from '../../types/vault';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface DeleteConfirmModalProps {
  document: VaultDocument | null;
  onClose: () => void;
  language: DashboardLanguage;
  onConfirm: (id: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  document,
  onClose,
  language,
  onConfirm,
}) => {
  const t = TRANSLATIONS[language];
  const deleteBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (document) {
      deleteBtnRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [document, onClose]);

  if (!document) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-heading"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden z-10 flex flex-col p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h2 id="delete-confirm-heading" className="text-sm font-bold text-navy-950">
              {t.deleteConfirmTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-navy-950"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-slate-600 leading-relaxed">{t.deleteConfirmDesc}</p>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-navy-950">
            {document.title} ({document.facility} • {document.documentDateDisplay})
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 min-h-[38px]"
          >
            {t.cancelBtn}
          </button>
          <button
            ref={deleteBtnRef}
            type="button"
            onClick={() => {
              onConfirm(document.id);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs min-h-[38px]"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.confirmDeleteBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
