import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Printer, Download, AlertCircle } from 'lucide-react';
import { VaultDocument } from '../../types/vault';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface DocumentPreviewProps {
  document: VaultDocument;
  language: DashboardLanguage;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, language }) => {
  const t = TRANSLATIONS[language];
  const [zoomLevel, setZoomLevel] = useState(100);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 150));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 70));

  const handleDownload = () => {
    const element = window.document.createElement('a');
    const fileContent = `MEDIVAULT AI — SYNTHETIC DEMO MEDICAL REPORT\n\nTitle: ${document.title}\nFacility: ${document.facility}\nDate: ${document.documentDateDisplay}\nCategory: ${document.categoryLabelEn}\nStatus: ${document.status}\n\nClinical Summary (Demo):\n${document.summaryEn || 'Clinical verification will activate in Phase 2D.'}\n\nNotes:\n${document.notes || 'None'}\n\n[DISCLAIMER: Fictional demonstration data. Not real medical records.]`;
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${document.title.replace(/\s+/g, '_')}_demo.txt`;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col min-h-[520px]">
      {/* Reader Window Chrome Header */}
      <div className="bg-slate-800/90 border-b border-slate-700/80 px-4 py-2.5 flex items-center justify-between text-slate-300 text-xs">
        {/* Left: Page count & Document Title */}
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded-md bg-slate-700 text-slate-200 text-[11px] font-semibold">
            1 / 1
          </span>
          <span className="text-[11px] font-medium text-slate-400 hidden sm:inline truncate max-w-xs">
            {document.title} • {document.fileType}
          </span>
        </div>

        {/* Center: Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/60 px-2 py-1 rounded-xl border border-slate-700/50">
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="Zoom out"
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono px-1 min-w-[38px] text-center">{zoomLevel}%</span>
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="Zoom in"
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => window.print()}
            aria-label="Print document"
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors hidden sm:inline-flex"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleDownload}
            aria-label="Download document"
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setZoomLevel(100)}
            aria-label="Reset zoom"
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors hidden sm:inline-flex"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Document View Canvas */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center overflow-auto bg-slate-950/60">
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
          className="transition-transform duration-150 ease-out max-w-full"
        >
          {/* 1. Laboratory Report Preview Table */}
          {document.previewType === 'table' && (
            <div className="w-[520px] max-w-full bg-white text-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-brand-500 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold text-sm">
                    +
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-950 text-xs uppercase tracking-wider">
                      {document.facility}
                    </h4>
                    <p className="text-[10px] text-slate-400">Department of Clinical Pathology</p>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  <p>Date: {document.documentDateDisplay}</p>
                  <p className="font-mono">Ref: #{document.id.toUpperCase()}</p>
                </div>
              </div>

              {/* Analyte Table */}
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase">
                    <th className="pb-1.5">Investigation</th>
                    <th className="pb-1.5">Observed Value</th>
                    <th className="pb-1.5">Reference Interval</th>
                    <th className="pb-1.5">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-1.5 font-semibold">Fasting Blood Sugar</td>
                    <td className="py-1.5 font-bold text-brand-600">92</td>
                    <td className="py-1.5 text-slate-500">70 — 99</td>
                    <td className="py-1.5 text-slate-400">mg/dL</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-semibold">Total Cholesterol</td>
                    <td className="py-1.5 font-bold text-brand-600">178</td>
                    <td className="py-1.5 text-slate-500">&lt; 200</td>
                    <td className="py-1.5 text-slate-400">mg/dL</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-semibold">Hemoglobin</td>
                    <td className="py-1.5 font-bold text-brand-600">13.8</td>
                    <td className="py-1.5 text-slate-500">12.0 — 15.5</td>
                    <td className="py-1.5 text-slate-400">g/dL</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-semibold">Vitamin D (25-OH)</td>
                    <td className="py-1.5 font-bold text-amber-600">22</td>
                    <td className="py-1.5 text-slate-500">30 — 100</td>
                    <td className="py-1.5 text-slate-400">ng/mL</td>
                  </tr>
                </tbody>
              </table>

              {/* Signature block */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Verified by automated electronic signature</span>
                <span className="font-semibold text-slate-600">{document.doctorName}</span>
              </div>
            </div>
          )}

          {/* 2. Imaging View (Chest X-Ray / Brain MRI) */}
          {document.previewType === 'imaging' && (
            <div className="w-[460px] max-w-full bg-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-700 text-center space-y-3">
              <div className="w-full h-72 bg-black rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden relative">
                {document.id === 'doc-02' ? (
                  // X-Ray PA Radiograph simulation
                  <svg
                    viewBox="0 0 300 240"
                    className="w-full h-full opacity-85"
                    aria-hidden="true"
                  >
                    <rect width="300" height="240" fill="#020617" />
                    {/* Spine */}
                    <path
                      d="M150 20 V 220"
                      stroke="#475569"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                    {/* Clavicles */}
                    <path d="M90 40 Q 150 48 210 40" stroke="#64748B" strokeWidth="5" fill="none" />
                    {/* Ribs Bilateral */}
                    <path
                      d="M100 65 Q 150 55 200 65 M90 90 Q 150 78 210 90 M85 115 Q 150 102 215 115 M80 140 Q 150 126 220 140 M85 165 Q 150 150 215 165"
                      stroke="#475569"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="3 3"
                    />
                    {/* Lung Fields */}
                    <path
                      d="M100 70 C 80 120, 80 170, 115 185 C 135 185, 145 150, 145 70 Z"
                      fill="#0F172A"
                      opacity="0.8"
                    />
                    <path
                      d="M200 70 C 220 120, 220 170, 185 185 C 165 185, 155 150, 155 70 Z"
                      fill="#0F172A"
                      opacity="0.8"
                    />
                    {/* Cardiac Silhouette */}
                    <path
                      d="M140 120 Q 120 150 145 180 Q 165 180 160 140 Z"
                      fill="#1E293B"
                      opacity="0.9"
                    />
                  </svg>
                ) : (
                  // Brain MRI simulation
                  <svg
                    viewBox="0 0 300 240"
                    className="w-full h-full opacity-85"
                    aria-hidden="true"
                  >
                    <rect width="300" height="240" fill="#020617" />
                    <circle
                      cx="150"
                      cy="120"
                      r="75"
                      stroke="#334155"
                      strokeWidth="3"
                      fill="#090D16"
                    />
                    <path
                      d="M110 120 C 110 80, 190 80, 190 120 C 190 160, 110 160, 110 120 Z"
                      stroke="#60A5FA"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      fill="none"
                    />
                    <path
                      d="M150 65 V 175"
                      stroke="#93C5FD"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  </svg>
                )}
                <div className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded">
                  {document.facility} • {document.documentDateDisplay}
                </div>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {document.title} — High Resolution Diagnostic Scan
              </p>
            </div>
          )}

          {/* 3. Prescription Slip */}
          {document.previewType === 'prescription' && (
            <div className="w-[460px] max-w-full bg-white text-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-emerald-500">
                <div>
                  <h4 className="font-bold text-navy-950 text-xs uppercase">{document.facility}</h4>
                  <p className="text-[10px] text-slate-400">{document.doctorName}</p>
                </div>
                <span className="text-2xl font-serif font-extrabold text-emerald-600">Rx</span>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-slate-700 space-y-2">
                <p className="font-bold text-navy-950">1. Cholecalciferol (Vitamin D3) 60,000 IU</p>
                <p className="text-[11px] text-slate-600">
                  Sig: 1 capsule orally once weekly on Sundays after breakfast (8 weeks duration).
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 space-y-2">
                <p className="font-bold text-navy-950">2. Cetirizine Hydrochloride 10 mg</p>
                <p className="text-[11px] text-slate-600">
                  Sig: 1 tablet orally once daily at bedtime as needed for allergic rhinitis.
                </p>
              </div>

              <div className="text-[10px] text-slate-400 pt-2 border-t flex justify-between">
                <span>Date: {document.documentDateDisplay}</span>
                <span>Signature Verified</span>
              </div>
            </div>
          )}

          {/* 4. Clinical Consultation / Discharge Notes */}
          {document.previewType === 'notes' && (
            <div className="w-[480px] max-w-full bg-white text-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-200 text-xs space-y-3">
              <div className="border-b pb-2">
                <h4 className="font-bold text-navy-950 text-xs">{document.facility}</h4>
                <p className="text-[10px] text-slate-400">
                  Clinical Evaluation Summary • {document.documentDateDisplay}
                </p>
              </div>
              <div className="space-y-2 text-[11px] text-slate-600 leading-relaxed">
                <p className="font-semibold text-navy-950">Subjective & Objective Notes:</p>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  {document.notes ||
                    'Patient presented for routine scheduled evaluation. Clinical vitals stable. Comprehensive physical examination unremarkable. Recommended routine maintenance protocol.'}
                </p>
              </div>
              <div className="pt-2 text-[10px] text-slate-400 flex justify-between border-t">
                <span>Physician: {document.doctorName}</span>
                <span>Document Status: {document.status}</span>
              </div>
            </div>
          )}

          {/* 5. Unavailable Fallback */}
          {document.previewType === 'unavailable' && (
            <div className="w-[400px] max-w-full bg-slate-900 text-white rounded-2xl p-8 text-center space-y-3 border border-slate-800">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">{t.previewUnavailable}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{t.previewUnavailableDesc}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
