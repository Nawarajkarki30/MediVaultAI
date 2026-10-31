// frontend/src/pages/patient/PatientDocumentIntelligencePage.tsx
// MediVault AI — Phase 2D.1: Advanced Medical Document Intelligence Review Page

import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { useDashboardData } from '../../hooks/useDashboardData';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import {
  IntelligenceReviewLayout,
  FieldCorrectionDialog,
  FieldToEdit,
} from '../../components/intelligence';
import { getDemoExtraction } from '../../data/demoExtraction';
import {
  DocumentIntelligenceData,
  IntelligenceTab,
  MobileIntelligenceView,
  PatientCorrection,
  ReviewChecklistItem,
} from '../../types/documentIntelligence';
import { TRANSLATIONS } from '../../lib/translations';

export const PatientDocumentIntelligencePage: React.FC = () => {
  const { documentId = 'doc-01' } = useParams<{ documentId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dashboard = useDashboardData();
  const { language } = dashboard;
  const t = TRANSLATIONS[language];

  // Demo State Selector (allows instant switching between all 10 evaluation states)
  const stateQuery = searchParams.get('state') || 'standard';
  const [activeDemoState, setActiveDemoState] = useState<string>(stateQuery);

  // Load baseline demonstration extraction fixture
  const baseData = useMemo(() => {
    return getDemoExtraction(documentId, activeDemoState);
  }, [documentId, activeDemoState]);

  // Page, Tab & Mobile View Navigation State
  const [activePage, setActivePage] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<IntelligenceTab>('summary');
  const [mobileView, setMobileView] = useState<MobileIntelligenceView>('original');

  // Local Patient Corrections & Checklist State (Never persisted to server)
  const [corrections, setCorrections] = useState<Record<string, PatientCorrection>>({});
  const [checklist, setChecklist] = useState<ReviewChecklistItem[]>(baseData.checklist);

  // Field Correction Modal State
  const [fieldToEdit, setFieldToEdit] = useState<FieldToEdit | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Merge baseline fixture with local React state corrections
  const mergedData: DocumentIntelligenceData = useMemo(() => {
    const updatedLabResults = baseData.labResults.map((r) => {
      if (corrections[r.id]) {
        return {
          ...r,
          extractedValue: corrections[r.id].correctedValue,
          userCorrection: corrections[r.id],
        };
      }
      return r;
    });

    const updatedPatientInfo = { ...baseData.patientInfo };
    Object.keys(updatedPatientInfo).forEach((key) => {
      const field = updatedPatientInfo[key as keyof typeof updatedPatientInfo];
      if (corrections[field.id]) {
        updatedPatientInfo[key as keyof typeof updatedPatientInfo] = {
          ...field,
          value: corrections[field.id].correctedValue,
          userCorrection: corrections[field.id],
        };
      }
    });

    const reviewedCount = baseData.reviewedFieldsCount + Object.keys(corrections).length;

    return {
      ...baseData,
      labResults: updatedLabResults,
      patientInfo: updatedPatientInfo,
      reviewedFieldsCount: Math.min(reviewedCount, baseData.totalFieldsCount),
    };
  }, [baseData, corrections]);

  // Switch demo state
  const handleSelectDemoState = (newState: string) => {
    setActiveDemoState(newState);
    setSearchParams(newState === 'standard' ? {} : { state: newState });
    setCorrections({});
    const nextData = getDemoExtraction(documentId, newState);
    setChecklist(nextData.checklist);
    setActivePage(1);
    setActiveTab('summary');
    showToast(`Switched to demonstration state: ${newState}`);
  };

  // Checklist toggle
  const handleToggleChecklistItem = (itemId: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item))
    );
  };

  // Open correction modal
  const handleOpenEditField = (field: FieldToEdit) => {
    setFieldToEdit(field);
    setIsEditDialogOpen(true);
  };

  // Save correction in local state
  const handleSaveCorrection = (fieldId: string, newValue: string, reason?: string) => {
    const originalVal =
      fieldToEdit?.originalValue ||
      mergedData.labResults.find((r) => r.id === fieldId)?.extractedValue ||
      '';

    setCorrections((prev) => ({
      ...prev,
      [fieldId]: {
        originalValue: originalVal,
        correctedValue: newValue,
        reason,
        timestamp: new Date().toISOString(),
      },
    }));

    showToast('Correction saved in local session (Demo Only)');
  };

  // Save all corrections button handler
  const handleSaveAllCorrectionsDemo = () => {
    showToast('All patient corrections updated in local state (Demo Only).');
  };

  // Cancel corrections button handler
  const handleCancelCorrections = () => {
    setCorrections({});
    showToast('Patient corrections reset.');
  };

  // Download synthetic report handler
  const handleDownloadOriginal = () => {
    try {
      if (typeof window !== 'undefined' && typeof window.URL?.createObjectURL === 'function') {
        const element = window.document.createElement('a');
        const fileContent = `MEDIVAULT AI — SYNTHETIC DEMONSTRATION DOCUMENT\n\nTitle: ${mergedData.documentTitle}\nCategory: ${mergedData.documentCategory}\nDate: ${mergedData.uploadedAtDisplay}\nStatus: ${mergedData.status}\n\n[CLINICAL SAFETY DISCLAIMER: This document contains purely synthetic medical data generated for UI/UX evaluation. Not real patient records.]`;
        const file = new Blob([fileContent], { type: 'text/plain' });
        element.href = window.URL.createObjectURL(file);
        element.download = `${mergedData.documentTitle.replace(/\s+/g, '_')}_synthetic.txt`;
        window.document.body.appendChild(element);
        element.click();
        window.document.body.removeChild(element);
      }
    } catch {
      // Ignored in headless/test environments
    }
    showToast('Downloaded synthetic demonstration file.');
  };

  return (
    <DashboardLayout dashboard={dashboard}>
      <div className="space-y-4 max-w-7xl mx-auto" data-testid="patient-document-intelligence-page">
        {/* Top Breadcrumb & Demo State Switcher Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <Link
              to="/patient/vault"
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              data-testid="back-to-vault-link"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t.backToVault}
            </Link>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#2675F5]" />
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {t.intelligenceTitle}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-[#2675F5] dark:text-blue-300">
                {t.betaBadge}
              </span>
            </div>
          </div>

          {/* Interactive Demo State Selector */}
          <div className="flex items-center space-x-2 self-start sm:self-auto text-xs">
            <label
              htmlFor="demo-state-select"
              className="text-slate-500 dark:text-slate-400 font-medium"
            >
              {t.stateSwitcherLabel}
            </label>
            <select
              id="demo-state-select"
              value={activeDemoState}
              onChange={(e) => handleSelectDemoState(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs focus:ring-2 focus:ring-[#2675F5] outline-none"
              data-testid="demo-state-selector"
            >
              <option value="standard">1. Standard Lab Report (Wireframe)</option>
              <option value="unprocessed">2. Unprocessed Document</option>
              <option value="missing-fields">3. Missing Fields</option>
              <option value="unreadable">4. Unreadable Handwritten</option>
              <option value="ambiguous-med">5. Ambiguous Medication</option>
              <option value="patient-corrected">6. Patient Corrected</option>
              <option value="empty">7. Empty Extraction</option>
              <option value="preview-unavailable">8. Preview Unavailable</option>
              <option value="extraction-failed">9. Extraction Failed</option>
            </select>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div
            role="status"
            className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-medium animate-in fade-in slide-in-from-bottom-3"
            data-testid="toast-notification"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main 3-Panel Desktop / 3-Screen Mobile Review Layout */}
        <IntelligenceReviewLayout
          data={mergedData}
          language={language}
          activePage={activePage}
          onPageChange={setActivePage}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          mobileView={mobileView}
          onMobileViewChange={setMobileView}
          checklist={checklist}
          onToggleChecklistItem={handleToggleChecklistItem}
          onSelectAttentionItem={(item) => {
            if (item.targetSection === 'medication') {
              setActiveTab('meds');
            } else if (item.targetSection === 'lab') {
              setActiveTab('labs');
            }
          }}
          onEditField={handleOpenEditField}
          onDownloadOriginal={handleDownloadOriginal}
          onViewInVault={() => navigate(`/patient/vault/${mergedData.documentId}`)}
          onShareDocument={() => showToast('Family sharing will be available in Phase 2E.')}
          onSaveCorrectionsDemo={handleSaveAllCorrectionsDemo}
          onCancelCorrections={handleCancelCorrections}
        />

        {/* Modal Dialog for Editing an Extracted Field */}
        <FieldCorrectionDialog
          isOpen={isEditDialogOpen}
          field={fieldToEdit}
          language={language}
          onSave={handleSaveCorrection}
          onClose={() => setIsEditDialogOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
};
