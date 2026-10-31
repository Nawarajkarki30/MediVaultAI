import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Calendar,
  MoreVertical,
  Activity,
  FileCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { VaultDocument, VaultProcessingStatus } from '../../types/vault';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface DocumentCardProps {
  document: VaultDocument;
  language: DashboardLanguage;
  onOpenActionMenu: (doc: VaultDocument) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  language,
  onOpenActionMenu,
}) => {
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];

  const getStatusBadge = (status: VaultProcessingStatus) => {
    switch (status) {
      case 'reviewed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            {t.statusReviewed}
          </span>
        );
      case 'pending-review':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {t.statusPendingReview}
          </span>
        );
      case 'uploaded':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            {t.statusUploaded}
          </span>
        );
      case 'not-available':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {t.statusNotAvailable}
          </span>
        );
    }
  };

  const getThumbnailVisual = () => {
    if (document.previewType === 'imaging') {
      if (document.id === 'doc-02') {
        // Chest X-Ray thumbnail
        return (
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
            <svg viewBox="0 0 48 48" className="w-10 h-10 opacity-80" aria-hidden="true">
              <path d="M24 6 C 14 16, 12 36, 16 42" stroke="#94A3B8" strokeWidth="2" fill="none" />
              <path d="M24 6 C 34 16, 36 36, 32 42" stroke="#94A3B8" strokeWidth="2" fill="none" />
              <path
                d="M18 16 H30 M16 22 H32 M15 28 H33 M16 34 H32"
                stroke="#CBD5E1"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
            </svg>
          </div>
        );
      }
      // MRI Brain scan thumbnail
      return (
        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
          <svg viewBox="0 0 48 48" className="w-10 h-10 opacity-80" aria-hidden="true">
            <circle cx="24" cy="24" r="16" stroke="#60A5FA" strokeWidth="1.5" fill="none" />
            <path
              d="M16 24 Q 24 14 32 24 Q 24 34 16 24"
              stroke="#93C5FD"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </div>
      );
    }

    if (document.fileType === 'PDF') {
      if (document.category === 'prescriptions') {
        return (
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Activity className="w-6 h-6" />
          </div>
        );
      }
      if (document.category === 'lab-reports') {
        return (
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        );
      }
      return (
        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-brand-600 flex items-center justify-center shrink-0 shadow-2xs">
          <FileText className="w-6 h-6" />
        </div>
      );
    }

    return (
      <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
        <FileCheck className="w-6 h-6" />
      </div>
    );
  };

  const handleCardClick = () => {
    navigate(`/patient/vault/${document.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-3xl border border-brand-border hover:border-brand-300 p-5 shadow-subtle hover:shadow-card transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 focus-within:ring-2 focus-within:ring-brand-500"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`View ${document.title}`}
    >
      {/* Top Header: Thumbnail + Status + Actions */}
      <div className="flex items-start justify-between gap-3">
        {getThumbnailVisual()}

        <div className="flex items-center gap-1.5 ml-auto">
          {getStatusBadge(document.status)}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenActionMenu(document);
            }}
            aria-label={`Options for ${document.title}`}
            className="p-1.5 rounded-xl text-slate-400 hover:text-navy-950 hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-brand-500 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Middle: Title & Facility */}
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-navy-950 group-hover:text-brand-600 transition-colors line-clamp-1">
          {document.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-1">{document.facility}</p>
      </div>

      {/* Bottom Row: Date & File Info */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{document.documentDateDisplay}</span>
        </div>

        <span className="font-semibold text-slate-400">
          {document.fileSize} • {document.fileType}
        </span>
      </div>
    </div>
  );
};
