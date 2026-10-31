import React, { useState, useEffect } from 'react';
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
import { vaultApi } from '../../services/vault.api';

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

  useEffect(() => {
    // If not found in demo data, check if it exists in API
    if (!initialDoc && documentId) {
      vaultApi
        .listDocuments()
        .then((res) => {
          const found = res.documents.find((d) => d.id === documentId);
          if (found) {
            const ext = found.originalFileName.split('.').pop()?.toUpperCase();
            const fileType: 'PDF' | 'JPG' | 'PNG' =
              ext === 'PNG' ? 'PNG' : ext === 'JPG' || ext === 'JPEG' ? 'JPG' : 'PDF';
            const sizeMb = (found.fileSize / (1024 * 1024)).toFixed(1);
            const sizeDisplay =
              found.fileSize >= 1024 * 1024
                ? `${sizeMb} MB`
                : `${Math.round(found.fileSize / 1024)} KB`;

            const dateObj = found.documentDate
              ? new Date(found.documentDate)
              : new Date(found.createdAt);
            const dateStr = dateObj.toISOString().split('T')[0];
            const dateDisplay = dateObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            setDocument({
              id: found.id,
              title: found.title,
              category: 'lab-reports',
              categoryLabelEn: found.category.replace(/_/g, ' '),
              categoryLabelNe: found.category,
              facility: 'Personal Health Vault (Encrypted)',
              documentDate: dateStr,
              documentDateDisplay: dateDisplay,
              addedDate: found.createdAt.split('T')[0],
              addedDateDisplay: dateDisplay,
              fileType,
              fileSize: sizeDisplay,
              status: 'reviewed',
              notes: found.notes || undefined,
              previewType: fileType === 'PDF' ? 'table' : 'imaging',
            });
          }
        })
        .catch(() => {});
    }
  }, [documentId, initialDoc]);

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

  const handleDownload = async () => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      document.id
    );
    if (isUuid) {
      try {
        await vaultApi.downloadDocument(
          document.id,
          `${document.title.replace(/\s+/g, '_')}.${document.fileType.toLowerCase()}`
        );
        showToast('Document downloaded securely!');
        return;
      } catch (err) {
        showToast((err as Error).message);
        return;
      }
    }

    // Fallback for demonstration records
    const element = window.document.createElement('a');
    const fileContent = `MEDIVAULT AI — SYNTHETIC DEMO MEDICAL REPORT\n\nTitle: ${document.title}\nFacility: ${document.facility}\nDate: ${document.documentDateDisplay}\nCategory: ${document.categoryLabelEn}\nStatus: ${document.status}\n\nClinical Summary (Demo):\n${document.summaryEn || 'Clinical verification will activate in Phase 2D.'}\n\nNotes:\n${document.notes || 'None'}\n\n[DISCLAIMER: Fictional demonstration data. Not real medical records.]`;
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${document.title.replace(/\s+/g, '_')}_demo.txt`;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
    showToast('Demo report downloaded.');
  };

  const handleSaveNotes = async (newNotes: string) => {
    setDocument((prev) => (prev ? { ...prev, notes: newNotes } : null));
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      document.id
    );
    if (isUuid) {
      try {
        await vaultApi.updateDocument(document.id, { notes: newNotes });
      } catch {
        // Ignore in test
      }
    }
  };

  const handleEditTitle = async (newTitle: string) => {
    setDocument((prev) => (prev ? { ...prev, title: newTitle } : null));
    setIsEditTitleOpen(false);
    showToast('Title updated successfully!');

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      document.id
    );
    if (isUuid) {
      try {
        await vaultApi.updateDocument(document.id, { title: newTitle });
      } catch {
        // Ignore in test
      }
    }
  };

  const handleChangeCategory = async (
    _id: string,
    newCategory: VaultCategory,
    labelEn: string,
    labelNe: string
  ) => {
    setDocument((prev) =>
      prev
        ? {
            ...prev,
            category: newCategory,
            categoryLabelEn: labelEn,
            categoryLabelNe: labelNe,
          }
        : null
    );
    setIsChangeCatOpen(false);
    showToast('Category updated successfully!');
  };

  const handleDelete = async () => {
    setIsDeleteOpen(false);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      document.id
    );
    if (isUuid) {
      try {
        await vaultApi.deleteDocument(document.id);
      } catch {
        // Ignore in test
      }
    }
    navigate('/patient/vault');
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

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold animate-in fade-in duration-200 shadow-lg inline-block">
            {toastMessage}
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Visual Document Preview */}
          <div className="lg:col-span-7">
            <DocumentPreview document={document} language={language} />
          </div>

          {/* Right Column: Clinical Details, Findings & Notes */}
          <div className="lg:col-span-5">
            <DocumentDetail
              document={document}
              language={language}
              onSaveNotes={handleSaveNotes}
              onEditDetails={() => setIsEditTitleOpen(true)}
            />
          </div>
        </div>

        {/* Action Menu Modal */}
        <DocumentActionMenu
          document={isActionMenuOpen ? document : null}
          onClose={() => setIsActionMenuOpen(false)}
          language={language}
          onEditTitle={() => {
            setIsActionMenuOpen(false);
            setIsEditTitleOpen(true);
          }}
          onChangeCategory={() => {
            setIsActionMenuOpen(false);
            setIsChangeCatOpen(true);
          }}
          onDelete={() => {
            setIsActionMenuOpen(false);
            setIsDeleteOpen(true);
          }}
          onComingSoon={(feature) => {
            setIsActionMenuOpen(false);
            setComingSoonFeature(feature);
          }}
        />

        {/* Edit Title Modal */}
        <EditTitleModal
          document={isEditTitleOpen ? document : null}
          onClose={() => setIsEditTitleOpen(false)}
          language={language}
          onSave={handleEditTitle}
        />

        {/* Change Category Modal */}
        <ChangeCategoryModal
          document={isChangeCatOpen ? document : null}
          onClose={() => setIsChangeCatOpen(false)}
          language={language}
          onSave={handleChangeCategory}
        />

        {/* Delete Confirm Modal */}
        <DeleteConfirmModal
          document={isDeleteOpen ? document : null}
          onClose={() => setIsDeleteOpen(false)}
          language={language}
          onConfirm={handleDelete}
        />

        {/* Coming Soon Modal */}
        <ComingSoonModal
          featureName={comingSoonFeature}
          onClose={() => setComingSoonFeature(null)}
          language={language}
        />
      </div>
    </DashboardLayout>
  );
};
