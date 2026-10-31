import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, MoreVertical } from 'lucide-react';
import { useDashboardData } from '../../hooks/useDashboardData';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { DocumentPreview } from '../../components/vault/DocumentPreview';
import { DocumentDetail } from '../../components/vault/DocumentDetail';
import { DocumentActionMenu } from '../../components/vault/DocumentActionMenu';
import { EditTitleModal } from '../../components/vault/EditTitleModal';
import { ChangeCategoryModal } from '../../components/vault/ChangeCategoryModal';
import { DeleteConfirmModal } from '../../components/vault/DeleteConfirmModal';
import { ComingSoonModal } from '../../components/dashboard/ComingSoonModal';
import { DEMO_VAULT_DOCUMENTS } from '../../data/demoVault';
import { VaultDocument, VaultCategory } from '../../types/vault';
import { TRANSLATIONS } from '../../lib/translations';

export const PatientDocumentDetailPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const dashboard = useDashboardData();
  const { language, comingSoonFeature, setComingSoonFeature } = dashboard;
  const t = TRANSLATIONS[language];

  // Initialize or find document
  const initialDoc = DEMO_VAULT_DOCUMENTS.find((d) => d.id === documentId) || null;
  const [document, setDocument] = useState<VaultDocument | null>(initialDoc);

  // Modals state
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isEditTitleOpen, setIsEditTitleOpen] = useState(false);
  const [isChangeCatOpen, setIsChangeCatOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!document) {
    return (
      <DashboardLayout dashboard={dashboard}>
        <div className="bg-white rounded-3xl border border-brand-border p-12 text-center space-y-4 shadow-subtle">
          <h2 className="text-lg font-bold text-navy-950">Document Not Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            The requested medical document could not be located in this demonstration vault.
          </p>
          <Link
            to="/patient/vault"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToVault}</span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

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
    <DashboardLayout dashboard={dashboard}>
      <div className="space-y-6">
        {/* Top Breadcrumb & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-4">
          <Link
            to="/patient/vault"
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToVault}</span>
          </Link>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors min-h-[38px] shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-brand-500" />
              <span>{t.downloadBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsActionMenuOpen(true)}
              aria-label="Document options"
              className="p-2 rounded-xl text-slate-400 hover:text-navy-950 bg-white border border-slate-200 hover:bg-slate-50 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center shadow-2xs"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Two-Column Responsive Layout matching Wireframe */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Document Canvas Preview (7 cols on lg, 8 on xl) */}
          <div className="lg:col-span-7 xl:col-span-8">
            <DocumentPreview document={document} language={language} />
          </div>

          {/* Right Column: Metadata, Summary & Notes (5 cols on lg, 4 on xl) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <DocumentDetail
              document={document}
              language={language}
              onEditDetails={() => setIsEditTitleOpen(true)}
              onSaveNotes={(newNotes) => {
                setDocument((prev) => (prev ? { ...prev, notes: newNotes } : null));
                showToast(t.noteSaved);
              }}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <DocumentActionMenu
        document={isActionMenuOpen ? document : null}
        onClose={() => setIsActionMenuOpen(false)}
        language={language}
        onEditTitle={() => setIsEditTitleOpen(true)}
        onChangeCategory={() => setIsChangeCatOpen(true)}
        onDelete={() => setIsDeleteOpen(true)}
        onComingSoon={(feature) => setComingSoonFeature(feature)}
      />

      <EditTitleModal
        document={isEditTitleOpen ? document : null}
        onClose={() => setIsEditTitleOpen(false)}
        language={language}
        onSave={(_id, newTitle) => {
          setDocument((prev) => (prev ? { ...prev, title: newTitle } : null));
          showToast(`Title updated to "${newTitle}"`);
        }}
      />

      <ChangeCategoryModal
        document={isChangeCatOpen ? document : null}
        onClose={() => setIsChangeCatOpen(false)}
        language={language}
        onSave={(_id, newCat, labelEn, labelNe) => {
          setDocument((prev) =>
            prev
              ? {
                  ...prev,
                  category: newCat as VaultCategory,
                  categoryLabelEn: labelEn,
                  categoryLabelNe: labelNe,
                }
              : null
          );
          showToast(`Category updated to "${language === 'en' ? labelEn : labelNe}"`);
        }}
      />

      <DeleteConfirmModal
        document={isDeleteOpen ? document : null}
        onClose={() => setIsDeleteOpen(false)}
        language={language}
        onConfirm={() => {
          navigate('/patient/vault');
        }}
      />

      <ComingSoonModal
        featureName={comingSoonFeature}
        onClose={() => setComingSoonFeature(null)}
        language={language}
      />

      {/* Floating Demo Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-navy-950 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold animate-in slide-in-from-bottom duration-200">
          {toastMessage}
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientDocumentDetailPage;
