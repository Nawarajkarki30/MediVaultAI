// frontend/src/components/intelligence/ExtractedFieldsPanel.tsx
// MediVault AI — Extracted Medical Intelligence Review Panel

import React from 'react';
import {
  DocumentIntelligenceData,
  ExtractedFieldItem,
  ExtractedLabResult,
  ExtractedMedication,
  IntelligenceTab,
} from '../../types/documentIntelligence';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';
import { ReviewStatusBadge } from './ReviewStatusBadge';
import { ConfidencePill, MedicationWarningAlert } from './UncertaintyNotice';
import { SourceReference } from './SourceReference';
import { FieldSectionCard } from './FieldReviewCard';
import { FieldToEdit } from './FieldCorrectionDialog';

interface ExtractedFieldsPanelProps {
  data: DocumentIntelligenceData;
  language: DashboardLanguage;
  activeTab: IntelligenceTab;
  onTabChange: (tab: IntelligenceTab) => void;
  onEditField: (field: FieldToEdit) => void;
  onNavigateToPage: (page: number) => void;
  onSaveCorrectionsDemo: () => void;
  onCancelCorrections: () => void;
  className?: string;
}

export const ExtractedFieldsPanel: React.FC<ExtractedFieldsPanelProps> = ({
  data,
  language,
  activeTab,
  onTabChange,
  onEditField,
  onNavigateToPage,
  onSaveCorrectionsDemo,
  onCancelCorrections,
  className = '',
}) => {
  const t = TRANSLATIONS[language];

  // Helper to trigger lab field edit
  const handleEditLabField = (lab: ExtractedLabResult) => {
    onEditField({
      id: lab.id,
      testName: lab.testName,
      originalValue: lab.extractedValue,
      currentValue: lab.userCorrection ? lab.userCorrection.correctedValue : lab.extractedValue,
      unit: lab.unit,
      referenceRange: lab.referenceRange,
      source: lab.source,
      confidence: lab.confidence,
    });
  };

  // Helper to trigger med edit
  const handleEditMedication = (med: ExtractedMedication) => {
    onEditField({
      id: med.id,
      testName: med.medicationName,
      originalValue: `${med.strength} - ${med.instructions}`,
      currentValue: med.userCorrection
        ? med.userCorrection.correctedValue
        : `${med.strength} - ${med.instructions}`,
      unit: med.frequency,
      source: med.source,
      confidence: med.confidence,
    });
  };

  // Helper to trigger patient info edit
  const handleEditPatientField = (field: ExtractedFieldItem) => {
    onEditField({
      id: field.id,
      testName: language === 'ne' ? field.labelNe : field.labelEn,
      originalValue: String(field.value),
      currentValue: field.userCorrection
        ? field.userCorrection.correctedValue
        : String(field.value),
      source: field.source,
      confidence: field.confidence,
    });
  };

  const patientFieldsArray = [
    data.patientInfo.fullName,
    data.patientInfo.dateOfBirth,
    data.patientInfo.patientId,
  ];

  const reportFieldsArray = [
    data.reportInfo.reportDate,
    data.reportInfo.facility,
    data.reportInfo.department,
    data.reportInfo.documentType,
  ];

  return (
    <div
      className={`flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden ${className}`}
      data-testid="extracted-fields-panel"
    >
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-[#2675F5] flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t.extractedInformation}
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {t.demoDataBadge}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              Status:
            </span>
            <ReviewStatusBadge status={data.status} language={language} size="md" />
          </div>
        </div>

        {/* Demo Disclaimer Alert Banner */}
        <div className="mt-3 p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 flex items-start space-x-2 text-xs text-blue-800 dark:text-blue-300">
          <svg
            className="w-4 h-4 text-[#2675F5] flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="leading-snug">{t.demoBannerNotice}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 bg-slate-50/30 dark:bg-slate-850 overflow-x-auto text-xs sm:text-sm font-semibold">
        <button
          type="button"
          onClick={() => onTabChange('summary')}
          className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'summary'
              ? 'border-[#2675F5] text-[#2675F5] dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          data-testid="tab-summary"
        >
          {t.tabSummary}
        </button>

        <button
          type="button"
          onClick={() => onTabChange('labs')}
          className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'labs'
              ? 'border-[#2675F5] text-[#2675F5] dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          data-testid="tab-labs"
        >
          {t.tabLabResults} ({data.labResults.length})
        </button>

        <button
          type="button"
          onClick={() => onTabChange('meds')}
          className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'meds'
              ? 'border-[#2675F5] text-[#2675F5] dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          data-testid="tab-meds"
        >
          {t.tabMedications} ({data.medications.length})
        </button>

        <button
          type="button"
          onClick={() => onTabChange('facility')}
          className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'facility'
              ? 'border-[#2675F5] text-[#2675F5] dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          data-testid="tab-facility"
        >
          {t.tabFacility}
        </button>

        <button
          type="button"
          onClick={() => onTabChange('raw')}
          className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'raw'
              ? 'border-[#2675F5] text-[#2675F5] dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          data-testid="tab-raw"
        >
          {t.tabRawJson}
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 p-4 md:p-5 overflow-y-auto space-y-6">
        {/* TAB 1: SUMMARY */}
        {activeTab === 'summary' && (
          <>
            {/* Top Cards: Patient Info & Report Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldSectionCard
                title={t.patientInfoSection}
                fields={patientFieldsArray}
                language={language}
                onEditSection={() => handleEditPatientField(patientFieldsArray[0])}
                onEditField={handleEditPatientField}
                onNavigateToPage={onNavigateToPage}
                testId="card-patient-info"
              />
              <FieldSectionCard
                title={t.reportInfoSection}
                fields={reportFieldsArray}
                language={language}
                onEditSection={() => handleEditPatientField(reportFieldsArray[0])}
                onEditField={handleEditPatientField}
                onNavigateToPage={onNavigateToPage}
                testId="card-report-info"
              />
            </div>

            {/* Laboratory Results Table */}
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs"
              data-testid="section-lab-results"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
                  <span className="w-2 h-2 rounded-full bg-[#2675F5] mr-2" />
                  {t.labResultsSection} ({data.labResults.length} extracted)
                </h4>
                {data.labResults.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleEditLabField(data.labResults[0])}
                    className="inline-flex items-center text-xs font-semibold text-[#2675F5] hover:text-blue-700 dark:text-blue-400 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    data-testid="edit-all-labs-btn"
                  >
                    <svg
                      className="w-3.5 h-3.5 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    {t.editAllBtn}
                  </button>
                )}
              </div>

              {data.labResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs" data-testid="lab-results-table">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px]">
                        <th className="py-2.5 px-2">{t.fieldTestName}</th>
                        <th className="py-2.5 px-2">{t.fieldExtractedValue}</th>
                        <th className="py-2.5 px-2">{t.referenceRangeLabel}</th>
                        <th className="py-2.5 px-2">{t.fieldUnit}</th>
                        <th className="py-2.5 px-2">{t.fieldConfidence}</th>
                        <th className="py-2.5 px-2">{t.fieldSource}</th>
                        <th className="py-2.5 px-2 text-right">{t.fieldActions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {data.labResults.map((r) => (
                        <tr
                          key={r.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                          data-testid={`lab-row-${r.id}`}
                        >
                          <td className="py-2.5 px-2 font-medium text-slate-900 dark:text-slate-100">
                            {r.testName}
                          </td>
                          <td className="py-2.5 px-2 font-bold text-slate-800 dark:text-slate-200">
                            {r.userCorrection ? (
                              <div className="flex items-center space-x-1.5">
                                <span className="line-through text-slate-400 text-[11px]">
                                  {r.userCorrection.originalValue}
                                </span>
                                <span className="text-[#2675F5]">
                                  {r.userCorrection.correctedValue}
                                </span>
                              </div>
                            ) : (
                              r.extractedValue
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                            {r.referenceRange}
                          </td>
                          <td className="py-2.5 px-2 text-slate-500 dark:text-slate-400">
                            {r.unit}
                          </td>
                          <td className="py-2.5 px-2">
                            <ConfidencePill confidence={r.confidence} language={language} />
                          </td>
                          <td className="py-2.5 px-2">
                            <SourceReference
                              source={r.source}
                              language={language}
                              onNavigateToPage={onNavigateToPage}
                            />
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleEditLabField(r)}
                              className="text-xs font-semibold text-[#2675F5] hover:text-blue-700 dark:text-blue-400 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40"
                              data-testid={`edit-lab-${r.id}`}
                            >
                              {t.editBtn}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="pt-2 text-right">
                    <button
                      type="button"
                      onClick={() => onTabChange('labs')}
                      className="text-xs font-semibold text-[#2675F5] hover:underline"
                    >
                      {t.showAllResults} ({data.labResults.length}) →
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-3 italic">
                  No laboratory metrics were extracted from this document.
                </p>
              )}
            </div>

            {/* Medications Section */}
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3"
              data-testid="section-medications"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                  {t.medicationsSection} ({data.medications.length} extracted)
                </h4>
                {data.medications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleEditMedication(data.medications[0])}
                    className="inline-flex items-center text-xs font-semibold text-[#2675F5] hover:text-blue-700 dark:text-blue-400 p-1 rounded"
                    data-testid="edit-med-btn"
                  >
                    {t.editBtn}
                  </button>
                )}
              </div>

              {data.medications.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px]">
                          <th className="py-2 px-2">Medication Name</th>
                          <th className="py-2 px-2">Strength</th>
                          <th className="py-2 px-2">Instructions</th>
                          <th className="py-2 px-2">Frequency</th>
                          <th className="py-2 px-2">Confidence</th>
                          <th className="py-2 px-2">Source</th>
                          <th className="py-2 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {data.medications.map((m) => (
                          <tr
                            key={m.id}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                          >
                            <td className="py-2.5 px-2 font-bold text-slate-900 dark:text-white">
                              {m.medicationName}
                            </td>
                            <td className="py-2.5 px-2 font-semibold text-slate-700 dark:text-slate-300">
                              {m.strength}
                            </td>
                            <td className="py-2.5 px-2 text-slate-600 dark:text-slate-400">
                              {m.instructions}
                            </td>
                            <td className="py-2.5 px-2 font-mono text-slate-500">{m.frequency}</td>
                            <td className="py-2.5 px-2">
                              <ConfidencePill confidence={m.confidence} language={language} />
                            </td>
                            <td className="py-2.5 px-2">
                              <SourceReference
                                source={m.source}
                                language={language}
                                onNavigateToPage={onNavigateToPage}
                              />
                            </td>
                            <td className="py-2.5 px-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleEditMedication(m)}
                                className="text-xs font-semibold text-[#2675F5] hover:text-blue-700 dark:text-blue-400"
                              >
                                {t.editBtn}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Amber Medication Warning Notice */}
                  <MedicationWarningAlert language={language} />
                </>
              ) : (
                <p className="text-xs text-slate-500 py-3 italic">
                  No active prescription medications found in this report.
                </p>
              )}
            </div>

            {/* General Notes Section */}
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs"
              data-testid="section-general-notes"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
                  <span className="w-2 h-2 rounded-full bg-slate-400 mr-2" />
                  {t.generalNotesSection}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
                {data.generalNotes || 'No notes available for this document.'}
              </p>
            </div>

            {/* Save Patient Corrections (Demo Only) & Cancel Footer Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onCancelCorrections}
                className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                data-testid="cancel-all-corrections-btn"
              >
                {t.cancelCorrectionBtn}
              </button>
              <button
                type="button"
                onClick={onSaveCorrectionsDemo}
                className="px-5 py-2 text-sm font-bold text-white bg-[#2675F5] hover:bg-blue-600 active:bg-blue-700 rounded-xl shadow-xs transition-colors"
                data-testid="save-all-corrections-demo-btn"
              >
                {t.saveCorrectionsBtn}
              </button>
            </div>
          </>
        )}

        {/* TAB 2: LAB RESULTS ONLY */}
        {activeTab === 'labs' && (
          <div className="space-y-4" data-testid="tab-content-labs">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {t.labResultsSection}
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {data.labResults.map((r) => (
                <div
                  key={r.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                      {r.testName}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Reference:{' '}
                      <span className="font-mono">
                        {r.referenceRange} {r.unit}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      {r.userCorrection ? r.userCorrection.correctedValue : r.extractedValue}{' '}
                      {r.unit}
                    </span>
                    <ConfidencePill confidence={r.confidence} language={language} />
                    <button
                      type="button"
                      onClick={() => handleEditLabField(r)}
                      className="text-xs font-semibold text-[#2675F5] px-3 py-1 bg-blue-50 dark:bg-blue-950/40 rounded-lg hover:bg-blue-100"
                    >
                      {t.editBtn}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MEDICATIONS ONLY */}
        {activeTab === 'meds' && (
          <div className="space-y-4" data-testid="tab-content-meds">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {t.medicationsSection}
            </h4>
            <MedicationWarningAlert language={language} />
            <div className="space-y-3">
              {data.medications.map((m) => (
                <div
                  key={m.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white text-base">
                        {m.medicationName}{' '}
                        <span className="text-sm font-semibold text-slate-500">({m.strength})</span>
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {m.instructions} • {m.frequency}
                      </p>
                    </div>
                    <ConfidencePill confidence={m.confidence} language={language} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: FACILITY & DOCTOR */}
        {activeTab === 'facility' && (
          <div className="space-y-4" data-testid="tab-content-facility">
            <FieldSectionCard
              title={t.reportInfoSection}
              fields={reportFieldsArray}
              language={language}
              onNavigateToPage={onNavigateToPage}
            />
          </div>
        )}

        {/* TAB 5: RAW JSON */}
        {activeTab === 'raw' && (
          <div className="space-y-3" data-testid="tab-content-raw">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.tabRawJson}</h4>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(
                    JSON.stringify(data.rawJsonExport || data, null, 2)
                  );
                }}
                className="text-xs font-semibold text-[#2675F5] hover:underline"
              >
                Copy to Clipboard
              </button>
            </div>
            <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-auto max-h-[460px] border border-slate-800">
              {JSON.stringify(data.rawJsonExport || data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
