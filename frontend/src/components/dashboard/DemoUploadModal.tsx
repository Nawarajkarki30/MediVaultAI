import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { DashboardLanguage, ReportCategory } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface DemoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: DashboardLanguage;
}

export const DemoUploadModal: React.FC<DemoUploadModalProps> = ({ isOpen, onClose, language }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const t = TRANSLATIONS[language];

  const [documentName, setDocumentName] = useState('');
  const [category, setCategory] = useState<ReportCategory>('blood-test');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
      setDocumentName('');
      setSelectedFile(null);
      setIsUploading(false);
      setUploadSuccess(false);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSimulatedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden z-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200/80 flex items-center justify-center text-brand-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 id="upload-modal-title" className="text-base font-bold text-navy-950">
                {t.demoUploadTitle}
              </h3>
              <p className="text-xs text-slate-500">{t.demoUploadSubtitle}</p>
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
        <form onSubmit={handleSimulatedSubmit} className="p-6 space-y-5">
          {/* Demo Boundary Notice */}
          <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 text-xs text-brand-900">
            <AlertCircle className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">{t.demoUploadNotice}</p>
          </div>

          {/* Drag & Drop Box */}
          <div
            onClick={() => setSelectedFile('Simulated_Medical_Record_Oct2026.pdf')}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
              selectedFile
                ? 'border-emerald-400 bg-emerald-50/40'
                : 'border-slate-200 hover:border-brand-400 bg-slate-50/50 hover:bg-brand-50/30'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  selectedFile ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-100 text-brand-600'
                }`}
              >
                {selectedFile ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <FileText className="w-6 h-6" />
                )}
              </div>
              <p className="text-xs font-semibold text-navy-950">
                {selectedFile ? selectedFile : t.demoUploadDropzone}
              </p>
              <span className="text-[11px] text-slate-400">{t.demoUploadSupported}</span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label htmlFor="doc-name" className="block text-xs font-semibold text-slate-700 mb-1">
                {t.thDocumentName}
              </label>
              <input
                id="doc-name"
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="e.g. Comprehensive Metabolic Panel"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-navy-950 focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-slate-50/40"
              />
            </div>

            <div>
              <label htmlFor="doc-cat" className="block text-xs font-semibold text-slate-700 mb-1">
                {t.thCategory}
              </label>
              <select
                id="doc-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as ReportCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-navy-950 focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="blood-test">{t.filterBloodTests}</option>
                <option value="x-ray">{t.filterXRay}</option>
                <option value="prescription">{t.filterPrescription}</option>
                <option value="checkup">{t.filterCheckup}</option>
              </select>
            </div>
          </div>

          {/* Success Notification */}
          {uploadSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Simulated upload successful! Document queued for processing.</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors min-h-[40px]"
            >
              {t.closeModal}
            </button>
            <button
              type="submit"
              disabled={isUploading || uploadSuccess}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors disabled:opacity-60 shadow-xs min-h-[40px]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{t.demoUploadSubmit}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
