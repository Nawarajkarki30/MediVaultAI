import React, { useState, useEffect, useRef } from 'react';
import { X, Edit3, Check } from 'lucide-react';
import { VaultDocument } from '../../types/vault';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface EditTitleModalProps {
  document: VaultDocument | null;
  onClose: () => void;
  language: DashboardLanguage;
  onSave: (id: string, newTitle: string) => void;
}

export const EditTitleModal: React.FC<EditTitleModalProps> = ({
  document,
  onClose,
  language,
  onSave,
}) => {
  const t = TRANSLATIONS[language];
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      inputRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [document, onClose]);

  if (!document) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(document.id, title.trim());
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-title-heading"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden z-10 flex flex-col p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <h2 id="edit-title-heading" className="text-sm font-bold text-navy-950">
              {t.editTitle}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="doc-title-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Document Name
            </label>
            <input
              ref={inputRef}
              id="doc-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-navy-950 focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>

          <p className="text-[11px] text-slate-400 italic">
            * Changes update this demonstration session only.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 min-h-[38px]"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 shadow-xs min-h-[38px]"
            >
              <Check className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
