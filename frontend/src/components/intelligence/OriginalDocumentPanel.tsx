// frontend/src/components/intelligence/OriginalDocumentPanel.tsx
// MediVault AI — Original Document Viewer with Synthetic Canvas & Security Guards

import React, { useState } from 'react';
import { DocumentIntelligenceData } from '../../types/documentIntelligence';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface OriginalDocumentPanelProps {
  data: DocumentIntelligenceData;
  language: DashboardLanguage;
  activePage: number;
  onPageChange: (page: number) => void;
  onDownloadOriginal?: () => void;
  className?: string;
}

export const OriginalDocumentPanel: React.FC<OriginalDocumentPanelProps> = ({
  data,
  language,
  activePage,
  onPageChange,
  onDownloadOriginal,
  className = '',
}) => {
  const t = TRANSLATIONS[language];
  const [zoom, setZoom] = useState<number>(100);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 60));
  const handleZoomReset = () => setZoom(100);

  const totalPages = data.totalPages || 3;

  return (
    <div
      className={`flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden ${className}`}
      data-testid="original-document-panel"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2675F5]" />
            <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
              {t.originalDocument}
            </h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
            {data.fileType}
          </span>
        </div>

        <div className="mt-2">
          <h4 className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
            {data.documentTitle}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">{data.uploadedAtDisplay}</p>
        </div>
      </div>

      {/* Toolbar Controls */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-100/70 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-750 text-xs">
        {/* Page Nav */}
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(activePage - 1, 1))}
            disabled={activePage <= 1}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous Page"
            aria-label="Previous Page"
            data-testid="prev-page-btn"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span
            className="font-semibold text-slate-700 dark:text-slate-300 px-1"
            data-testid="page-indicator"
          >
            {activePage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(activePage + 1, totalPages))}
            disabled={activePage >= totalPages}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next Page"
            aria-label="Next Page"
            data-testid="next-page-btn"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 60}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
            title={t.zoomOut}
            aria-label={t.zoomOut}
            data-testid="zoom-out-btn"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="w-10 text-center font-mono font-medium text-slate-600 dark:text-slate-300">
            {zoom}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 150}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
            title={t.zoomIn}
            aria-label={t.zoomIn}
            data-testid="zoom-in-btn"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleZoomReset}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            title={t.fitWidth}
            aria-label={t.fitWidth}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
        </div>

        {/* Download Action */}
        <div>
          <button
            type="button"
            onClick={onDownloadOriginal}
            className="p-1 rounded text-slate-500 hover:text-[#2675F5] dark:hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={t.downloadOriginal}
            aria-label={t.downloadOriginal}
            data-testid="download-original-btn"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Document Viewer Canvas */}
      <div
        className="flex-1 bg-slate-100 dark:bg-slate-950/70 p-4 overflow-auto flex justify-center items-start min-h-[460px] max-h-[620px]"
        data-testid="document-canvas-container"
      >
        {data.isPreviewAvailable ? (
          <div
            className="bg-white text-slate-900 shadow-lg rounded-sm border border-slate-300 transition-transform origin-top w-full max-w-[480px] p-5 sm:p-6 text-[10px] sm:text-xs leading-relaxed select-text"
            style={{ transform: `scale(${zoom / 100})` }}
            data-testid={`document-page-canvas-${activePage}`}
          >
            {/* Synthetic Document Header */}
            <div className="border-b-2 border-slate-800 pb-3 mb-4 text-center">
              <div className="flex items-center justify-center space-x-1.5 mb-0.5">
                <span className="w-4 h-4 rounded bg-[#2675F5] text-white flex items-center justify-center text-[10px] font-bold">
                  +
                </span>
                <span className="font-extrabold text-sm tracking-wide text-slate-900">
                  CITY MEDICAL CENTER
                </span>
              </div>
              <p className="font-bold uppercase tracking-wider text-slate-700 text-[11px]">
                {activePage === 1
                  ? 'Laboratory Report'
                  : activePage === 2
                    ? 'Outpatient Prescription Sheet'
                    : 'Pathologist Electronic Sign-Off & Notes'}
              </p>
            </div>

            {/* Page 1 Content: CBC & Lipid Profile */}
            {activePage === 1 && (
              <div className="space-y-4">
                {/* Header Metadata */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 bg-slate-50 p-2.5 rounded border border-slate-200 text-[10px]">
                  <div>
                    <span className="text-slate-500">Patient Name: </span>
                    <strong className="text-slate-900">John Doe</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Report Date: </span>
                    <strong className="text-slate-900">12 Jan 2024</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">DOB: </span>
                    <strong className="text-slate-900">15 Jan 1995</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Doctor: </span>
                    <strong className="text-slate-900">Dr. Sarah Smith</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Patient ID: </span>
                    <strong className="text-slate-900 font-mono">MC123456</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Department: </span>
                    <strong className="text-slate-900">Pathology</strong>
                  </div>
                </div>

                {/* Section 1: Complete Blood Count */}
                <div>
                  <h5 className="font-bold text-slate-900 text-[11px] mb-1.5 border-b border-slate-200 pb-0.5">
                    Complete Blood Count (CBC)
                  </h5>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-300 text-slate-500 text-[9px] uppercase">
                        <th className="py-1">Test</th>
                        <th className="py-1">Result</th>
                        <th className="py-1">Reference Range</th>
                        <th className="py-1">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[10px]">
                      <tr>
                        <td className="py-1 font-medium">Hemoglobin</td>
                        <td className="py-1 font-bold text-slate-900">14.2</td>
                        <td className="py-1 text-slate-600">13.0 - 17.0</td>
                        <td className="py-1 text-slate-500">g/dL</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-medium">Hematocrit</td>
                        <td className="py-1 font-bold text-slate-900">42.1</td>
                        <td className="py-1 text-slate-600">38.0 - 50.0</td>
                        <td className="py-1 text-slate-500">%</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-medium">WBC</td>
                        <td className="py-1 font-bold text-slate-900">6.8</td>
                        <td className="py-1 text-slate-600">4.0 - 11.0</td>
                        <td className="py-1 text-slate-500">x10³/µL</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-medium">Platelets</td>
                        <td className="py-1 font-bold text-slate-900">250</td>
                        <td className="py-1 text-slate-600">150 - 400</td>
                        <td className="py-1 text-slate-500">x10³/µL</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section 2: Lipid Profile */}
                <div>
                  <h5 className="font-bold text-slate-900 text-[11px] mb-1.5 border-b border-slate-200 pb-0.5">
                    Lipid Profile
                  </h5>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-300 text-slate-500 text-[9px] uppercase">
                        <th className="py-1">Test</th>
                        <th className="py-1">Result</th>
                        <th className="py-1">Reference Range</th>
                        <th className="py-1">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[10px]">
                      <tr>
                        <td className="py-1 font-medium">Total Cholesterol</td>
                        <td className="py-1 font-bold text-slate-900">180</td>
                        <td className="py-1 text-slate-600">&lt; 200</td>
                        <td className="py-1 text-slate-500">mg/dL</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-medium">HDL</td>
                        <td className="py-1 font-bold text-slate-900">55</td>
                        <td className="py-1 text-slate-600">&gt; 40</td>
                        <td className="py-1 text-slate-500">mg/dL</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-medium">LDL</td>
                        <td className="py-1 font-bold text-slate-900">110</td>
                        <td className="py-1 text-slate-600">&lt; 130</td>
                        <td className="py-1 text-slate-500">mg/dL</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-medium">Triglycerides</td>
                        <td className="py-1 font-bold text-slate-900">120</td>
                        <td className="py-1 text-slate-600">&lt; 150</td>
                        <td className="py-1 text-slate-500">mg/dL</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Page 2 Content: Prescriptions */}
            {activePage === 2 && (
              <div className="space-y-4">
                <div className="bg-amber-50 p-3 rounded border border-amber-200 text-[10px]">
                  <p className="font-bold text-amber-900 mb-1">Rx Order Sheet:</p>
                  <p className="font-semibold text-slate-900 text-xs">1. Amoxicillin 500 mg</p>
                  <p className="text-slate-700">
                    Oral Capsules • Take 1 capsule 3 times daily (TID) with water for 7 days.
                  </p>
                  <p className="text-slate-500 mt-1">Dispense: #21 capsules • Refills: 0</p>
                </div>
                <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-600">
                  <p className="italic">
                    Note: Complete the full course of antibiotics as prescribed.
                  </p>
                </div>
              </div>
            )}

            {/* Page 3 Content: Doctor Notes */}
            {activePage === 3 && (
              <div className="space-y-4 text-[10px]">
                <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-900">Pathology Clinical Notes:</p>
                  <p className="text-slate-700">
                    Specimen verified for hemolysis. Indices within normal physiological limits for
                    healthy adult male.
                  </p>
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                    <div>
                      <p className="font-bold text-slate-900">Dr. Sarah Smith, MD</p>
                      <p className="text-slate-500">Senior Clinical Pathologist</p>
                      <p className="text-slate-400 text-[9px]">License: 48921-NMC</p>
                    </div>
                    <span className="font-serif italic text-blue-700 font-bold border-b border-blue-700 px-2">
                      S. Smith
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Canvas Footer */}
            <div className="mt-6 pt-3 border-t border-slate-200 flex justify-between text-[9px] text-slate-400">
              <span>Synthetic Document Specimen #SYN-2024</span>
              <span>
                Page {activePage} of {totalPages}
              </span>
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 max-w-sm my-auto"
            data-testid="preview-unavailable-card"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {t.previewUnavailable}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t.previewUnavailableDesc}
            </p>
          </div>
        )}
      </div>

      {/* Page Thumbnails Bar */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
        <div className="flex items-center justify-center space-x-3">
          {[1, 2, 3].slice(0, totalPages).map((p) => {
            const isActive = activePage === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isActive
                    ? 'border-[#2675F5] bg-blue-50 text-[#2675F5] dark:bg-blue-950/50 dark:border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
                data-testid={`page-thumbnail-${p}`}
                aria-label={`Go to page ${p}`}
              >
                <span>
                  {t.pageLabel} {p}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
