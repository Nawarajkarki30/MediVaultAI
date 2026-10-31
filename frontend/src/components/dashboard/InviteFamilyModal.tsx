import React, { useState, useEffect, useRef } from 'react';
import { X, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface InviteFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: DashboardLanguage;
}

export const InviteFamilyModal: React.FC<InviteFamilyModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const t = TRANSLATIONS[language];

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
      setName('');
      setRelationship('');
      setSentSuccess(false);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSentSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden z-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-brand-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 id="invite-modal-title" className="text-base font-bold text-navy-950">
                {t.inviteFamilyTitle}
              </h3>
              <p className="text-xs text-slate-500">{t.inviteFamilySubtitle}</p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t.closeModal}
            className="p-2 rounded-xl text-slate-400 hover:text-navy-950 hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-brand-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Demonstration interface. Real invitation emails and cryptographic token permissions
              will activate in Phase 3.
            </p>
          </div>

          <div>
            <label htmlFor="fam-name" className="block text-xs font-semibold text-slate-700 mb-1">
              {t.inviteNameLabel}
            </label>
            <input
              id="fam-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya Sharma"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-navy-950 focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-slate-50/40"
            />
          </div>

          <div>
            <label htmlFor="fam-rel" className="block text-xs font-semibold text-slate-700 mb-1">
              {t.inviteRelationLabel}
            </label>
            <input
              id="fam-rel"
              type="text"
              required
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="e.g. Mother / आमा"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-navy-950 focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-slate-50/40"
            />
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-1">
              Access Permissions
            </span>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">View Shared Reports Only</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                Default
              </span>
            </div>
          </div>

          {sentSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Simulated invitation sent to {name}!</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors min-h-[40px]"
            >
              {t.closeModal}
            </button>
            <button
              type="submit"
              disabled={sentSuccess}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors disabled:opacity-60 shadow-xs min-h-[40px]"
            >
              {t.inviteSubmit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
