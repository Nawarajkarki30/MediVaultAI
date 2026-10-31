import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, MoreVertical, Activity, FileCheck, FileSpreadsheet } from 'lucide-react';
import { VaultDocument, VaultProcessingStatus } from '../../types/vault';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface DocumentListProps {
  documents: VaultDocument[];
  language: DashboardLanguage;
  onOpenActionMenu: (doc: VaultDocument) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
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

  const getIcon = (doc: VaultDocument) => {
    if (doc.category === 'prescriptions') {
      return (
        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
          <Activity className="w-4 h-4" />
        </div>
      );
    }
    if (doc.category === 'lab-reports') {
      return (
        <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
          <FileSpreadsheet className="w-4 h-4" />
        </div>
      );
    }
    if (doc.category === 'imaging-reports') {
      return (
        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
          <FileCheck className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center shrink-0 border border-blue-100">
        <FileText className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-brand-border shadow-subtle overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
              <th scope="col" className="py-3 px-6">
                {t.thDocumentName}
              </th>
              <th scope="col" className="py-3 px-4">
                {t.thCategory}
              </th>
              <th scope="col" className="py-3 px-4">
                {t.documentDate}
              </th>
              <th scope="col" className="py-3 px-4">
                {t.thStatus}
              </th>
              <th scope="col" className="py-3 px-4">
                {t.fileType}
              </th>
              <th scope="col" className="py-3 px-6 text-right">
                {t.thAction}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {documents.map((doc) => {
              const categoryLabel = language === 'en' ? doc.categoryLabelEn : doc.categoryLabelNe;

              return (
                <tr
                  key={doc.id}
                  onClick={() => navigate(`/patient/vault/${doc.id}`)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  {/* Title & Facility */}
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      {getIcon(doc)}
                      <div className="min-w-0">
                        <span className="font-bold text-navy-950 block truncate group-hover:text-brand-600 transition-colors">
                          {doc.title}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {doc.facility}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">{categoryLabel}</td>

                  {/* Document Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                    {doc.documentDateDisplay}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(doc.status)}</td>

                  {/* File Info */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-medium">
                    {doc.fileSize} • {doc.fileType}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-6 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenActionMenu(doc);
                      }}
                      aria-label={`Options for ${doc.title}`}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-navy-950 hover:bg-slate-100 transition-colors min-h-[36px] min-w-[36px] inline-flex items-center justify-center"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile List View (< md) */}
      <div className="block md:hidden divide-y divide-slate-100">
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => navigate(`/patient/vault/${doc.id}`)}
            className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              {getIcon(doc)}
              <div className="min-w-0 space-y-0.5">
                <span className="font-bold text-xs text-navy-950 block truncate">{doc.title}</span>
                <span className="text-[11px] text-slate-400 block truncate">
                  {doc.facility} • {doc.documentDateDisplay}
                </span>
                <div className="pt-0.5">{getStatusBadge(doc.status)}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenActionMenu(doc);
              }}
              aria-label={`Options for ${doc.title}`}
              className="p-2 rounded-xl text-slate-400 hover:text-navy-950 hover:bg-slate-100 shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
