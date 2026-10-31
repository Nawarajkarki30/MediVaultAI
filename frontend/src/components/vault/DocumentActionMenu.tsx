import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Eye, Edit3, Tag, Download, Share2, Sparkles, Trash2 } from 'lucide-react';
import { VaultDocument } from '../../types/vault';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';
import { vaultApi } from '../../services/vault.api';

interface DocumentActionMenuProps {
  document: VaultDocument | null;
  onClose: () => void;
  language: DashboardLanguage;
  onEditTitle: (doc: VaultDocument) => void;
  onChangeCategory: (doc: VaultDocument) => void;
  onDelete: (doc: VaultDocument) => void;
  onComingSoon: (featureName: string) => void;
}

export const DocumentActionMenu: React.FC<DocumentActionMenuProps> = ({
  document,
  onClose,
  language,
  onEditTitle,
  onChangeCategory,
  onDelete,
  onComingSoon,
}) => {
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (document) {
      closeBtnRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [document, onClose]);

  if (!document) return null;

  const handleDownload = async () => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      document.id
    );
    if (isUuid) {
      try {
        await vaultApi.downloadDocument(
          document.id,
          `${document.title.replace(/\s+/g, '_')}.${document.fileType.toLowerCase()}`
        );
        onClose();
        return;
      } catch (err) {
        console.error('Download error:', err);
      }
    }

    // Fallback for demonstration records
    const element = window.document.createElement('a');
    const fileContent = `MEDIVAULT AI — SYNTHETIC DEMO MEDICAL REPORT\n\nDocument: ${document.title}\nFacility: ${document.facility}\nDate: ${document.documentDateDisplay}\nCategory: ${document.categoryLabelEn}\nStatus: ${document.status}\n\nClinical Summary (Demo):\n${document.summaryEn || 'Clinical verification will activate in Phase 2D.'}\n\nNotes:\n${document.notes || 'None'}\n\n[DISCLAIMER: Fictional demonstration data. Not real medical records.]`;
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${document.title.replace(/\s+/g, '_')}_demo.txt`;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="actions-menu-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden z-10 flex flex-col p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-2">
          <div>
            <h3 id="actions-menu-title" className="text-xs font-bold text-navy-950">
              {document.title}
            </h3>
            <p className="text-[11px] text-slate-400">{document.facility}</p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label={t.closeModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-navy-950 hover:bg-slate-100 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(`/vault/${document.id}`);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-navy-950 hover:bg-slate-50 transition-colors text-left"
          >
            <Eye className="w-4 h-4 text-slate-400" />
            <span>{t.viewDocument}</span>
          </button>

          <button
            type="button"
            onClick={() => onEditTitle(document)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-navy-950 hover:bg-slate-50 transition-colors text-left"
          >
            <Edit3 className="w-4 h-4 text-slate-400" />
            <span>{t.editTitle}</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeCategory(document)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-navy-950 hover:bg-slate-50 transition-colors text-left"
          >
            <Tag className="w-4 h-4 text-slate-400" />
            <span>{t.changeCategory}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-navy-950 hover:bg-slate-50 transition-colors text-left"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>{t.downloadBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => onComingSoon(t.shareFamilyComingSoon)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-50 transition-colors text-left"
          >
            <Share2 className="w-4 h-4 text-slate-300" />
            <span>{t.shareFamilyComingSoon}</span>
          </button>

          <button
            type="button"
            onClick={() => onComingSoon(t.explainAIComingSoon)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-50 transition-colors text-left"
          >
            <Sparkles className="w-4 h-4 text-slate-300" />
            <span>{t.explainAIComingSoon}</span>
          </button>

          <div className="pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onDelete(document)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>{t.deleteDocument}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
