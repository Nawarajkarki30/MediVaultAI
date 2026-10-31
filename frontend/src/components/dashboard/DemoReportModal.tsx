import React, { useEffect, useRef } from 'react';
import {
  X,
  FileText,
  Calendar,
  Building2,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Download,
  Share2,
} from 'lucide-react';
import { DashboardReport, DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface DemoReportModalProps {
  report: DashboardReport | null;
  onClose: () => void;
  language: DashboardLanguage;
}

export const DemoReportModal: React.FC<DemoReportModalProps> = ({ report, onClose, language }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (report) {
      closeButtonRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [report, onClose]);

  if (!report) return null;

  const isEn = language === 'en';
  const categoryLabel = isEn ? report.categoryLabelEn : report.categoryLabelNe;
  const summaryText = isEn ? report.sampleSummaryEn : report.sampleSummaryNe;
  const keyFindings = isEn ? report.keyFindingsEn : report.keyFindingsNe;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      {/* Backdrop click to dismiss */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Dialog Window */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200/80 flex items-center justify-center text-brand-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
                  {categoryLabel}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t.statusProcessed}
                </span>
              </div>
              <h3 id="report-modal-title" className="text-lg font-bold text-navy-950 mt-0.5">
                {report.name}
              </h3>
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

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Synthetic Demo Banner Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 flex items-start gap-3 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{t.demoReportModalTitle}</p>
              <p className="text-amber-800/90 mt-0.5">{t.demoReportNotice}</p>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-brand-500" />
                Facility
              </span>
              <p className="text-xs font-bold text-navy-950 mt-1 truncate">{report.facility}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-brand-500" />
                {t.thDateUploaded}
              </span>
              <p className="text-xs font-bold text-navy-950 mt-1">{report.dateUploaded}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-brand-500" />
                {t.doctorInCharge}
              </span>
              <p className="text-xs font-bold text-navy-950 mt-1 truncate">
                {report.doctorName || 'Attending Physician'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <FileText className="w-3 h-3 text-brand-500" />
                {t.fileDetails}
              </span>
              <p className="text-xs font-bold text-navy-950 mt-1">{report.fileSize}</p>
            </div>
          </div>

          {/* AI Simplified Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-500" />
                {t.aiPreviewTitle}
              </h4>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-200">
                {isEn ? 'English' : 'नेपाली'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-slate-700 text-sm leading-relaxed">
              {summaryText}
            </div>
          </div>

          {/* Key Simplified Findings */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.keyFindingsHeader}
            </h4>
            <ul className="space-y-2 text-xs text-slate-700">
              {keyFindings.map((finding, idx) => (
                <li
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-2.5"
                >
                  <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Medical Disclaimer Callout */}
          <div className="p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200 text-slate-600 text-[11px] leading-relaxed flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{t.medicalDisclaimer}</span>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => alert('Simulated demonstration PDF download triggered.')}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors w-full sm:w-auto min-h-[40px]"
            >
              <Download className="w-3.5 h-3.5 text-brand-500" />
              <span>{t.actionDownload}</span>
            </button>
            <button
              type="button"
              onClick={() => alert('Demonstration family sharing link created.')}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors w-full sm:w-auto min-h-[40px]"
            >
              <Share2 className="w-3.5 h-3.5 text-brand-500" />
              <span>{t.actionShare}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors shadow-xs min-h-[40px]"
          >
            {t.closeModal}
          </button>
        </div>
      </div>
    </div>
  );
};
