import React, { useEffect, useRef } from 'react';
import { Sparkles, Clock, X } from 'lucide-react';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface ComingSoonModalProps {
  featureName: string | null;
  onClose: () => void;
  language: DashboardLanguage;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  featureName,
  onClose,
  language,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (featureName) {
      closeButtonRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [featureName, onClose]);

  if (!featureName) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coming-soon-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden z-10 flex flex-col p-6 text-center space-y-4">
        <button
          type="button"
          onClick={onClose}
          aria-label={t.closeModal}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-navy-950 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center">
          <Sparkles className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-brand-500" />
            <span>Phase 3 Roadmap</span>
          </div>
          <h3 id="coming-soon-title" className="text-lg font-bold text-navy-950">
            {featureName}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            {t.comingSoonDesc}
          </p>
        </div>

        <div className="pt-2">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors shadow-xs min-h-[44px]"
          >
            {t.comingSoonClose}
          </button>
        </div>
      </div>
    </div>
  );
};
