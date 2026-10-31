import React, { useState } from 'react';
import {
  Calendar,
  Building2,
  UserCheck,
  FileText,
  Edit3,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { VaultDocument } from '../../types/vault';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface DocumentDetailProps {
  document: VaultDocument;
  language: DashboardLanguage;
  onEditDetails: () => void;
  onSaveNotes: (newNotes: string) => void;
}

export const DocumentDetail: React.FC<DocumentDetailProps> = ({
  document,
  language,
  onEditDetails,
  onSaveNotes,
}) => {
  const t = TRANSLATIONS[language];
  const [notes, setNotes] = useState(document.notes || '');
  const [isSaved, setIsSaved] = useState(false);

  const categoryLabel = language === 'en' ? document.categoryLabelEn : document.categoryLabelNe;

  const summary = language === 'en' ? document.summaryEn : document.summaryNe;

  const handleSaveNotes = () => {
    onSaveNotes(notes);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2400);
  };

  const getStatusBadge = () => {
    switch (document.status) {
      case 'reviewed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            {t.statusReviewed}
          </span>
        );
      case 'pending-review':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {t.statusPendingReview}
          </span>
        );
      case 'uploaded':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            {t.statusUploaded}
          </span>
        );
      case 'not-available':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {t.statusNotAvailable}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-subtle space-y-6">
      {/* Title & Status */}
      <div className="space-y-2 border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
            {categoryLabel}
          </span>
          {getStatusBadge()}
        </div>

        <h2 className="text-xl font-extrabold text-navy-950">{document.title}</h2>
        <p className="text-xs text-slate-400">{document.facility}</p>
      </div>

      {/* Metadata Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {t.documentDetails}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
            <span className="text-slate-400 text-[11px] flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-brand-500" />
              {t.documentDate}
            </span>
            <p className="font-bold text-navy-950">{document.documentDateDisplay}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
            <span className="text-slate-400 text-[11px] flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-brand-500" />
              {t.addedDate}
            </span>
            <p className="font-bold text-navy-950">{document.addedDateDisplay}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
            <span className="text-slate-400 text-[11px] flex items-center gap-1.5 font-medium">
              <FileText className="w-3.5 h-3.5 text-brand-500" />
              {t.fileType}
            </span>
            <p className="font-bold text-navy-950">
              {document.fileType} ({document.fileSize})
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
            <span className="text-slate-400 text-[11px] flex items-center gap-1.5 font-medium">
              <Building2 className="w-3.5 h-3.5 text-brand-500" />
              {t.facility}
            </span>
            <p className="font-bold text-navy-950 truncate">{document.facility}</p>
          </div>
        </div>

        {document.doctorName && (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs flex items-center justify-between">
            <span className="text-slate-400 text-[11px] flex items-center gap-1.5 font-medium">
              <UserCheck className="w-3.5 h-3.5 text-brand-500" />
              {t.physician}
            </span>
            <span className="font-bold text-navy-950">{document.doctorName}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onEditDetails}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-brand-200 text-brand-600 hover:bg-brand-50 text-xs font-semibold transition-colors min-h-[40px]"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{t.editDetailsBtn}</span>
        </button>
      </div>

      {/* Extracted Clinical Findings / Summary Callout */}
      {summary && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>{t.summaryHeader}</span>
          </h3>
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-slate-700 text-xs leading-relaxed">
            {summary}
          </div>
        </div>
      )}

      {/* Notes Section */}
      <div className="space-y-2">
        <label
          htmlFor="vault-doc-notes"
          className="text-xs font-bold text-slate-400 uppercase tracking-wider block"
        >
          {t.notesHeader}
        </label>
        <textarea
          id="vault-doc-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t.notesPlaceholder}
          className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs text-navy-950 bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
        />

        <div className="flex items-center justify-between gap-3 pt-1">
          {isSaved ? (
            <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              {t.noteSaved}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">
              * Notes are stored for this session demo
            </span>
          )}

          <button
            type="button"
            onClick={handleSaveNotes}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs transition-colors shadow-2xs min-h-[38px]"
          >
            {t.saveNoteBtn}
          </button>
        </div>
      </div>

      {/* Prototype Attribution */}
      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-500 flex items-start gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>
          Fictional demonstration document. Real encrypted storage and OCR pipeline will activate in
          Phase 2C.2.
        </span>
      </div>
    </div>
  );
};
