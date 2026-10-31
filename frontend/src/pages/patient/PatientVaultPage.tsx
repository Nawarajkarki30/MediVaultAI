import React from 'react';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useVaultDocuments } from '../../hooks/useVaultDocuments';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { VaultHeader } from '../../components/vault/VaultHeader';
import { VaultToolbar } from '../../components/vault/VaultToolbar';
import { DocumentCard } from '../../components/vault/DocumentCard';
import { DocumentList } from '../../components/vault/DocumentList';
import { VaultPrivacyNotice } from '../../components/vault/VaultPrivacyNotice';
import { VaultEmptyState } from '../../components/vault/VaultEmptyState';
import { UploadDocumentModal } from '../../components/vault/UploadDocumentModal';
import { FilterSortPanel } from '../../components/vault/FilterSortPanel';
import { DocumentActionMenu } from '../../components/vault/DocumentActionMenu';
import { EditTitleModal } from '../../components/vault/EditTitleModal';
import { ChangeCategoryModal } from '../../components/vault/ChangeCategoryModal';
import { DeleteConfirmModal } from '../../components/vault/DeleteConfirmModal';
import { ComingSoonModal } from '../../components/dashboard/ComingSoonModal';

export const PatientVaultPage: React.FC = () => {
  const dashboard = useDashboardData();
  const vault = useVaultDocuments();

  const { language, comingSoonFeature, setComingSoonFeature } = dashboard;

  const {
    documents,
    filteredDocuments,
    categoryCounts,
    filters,
    setSearchQuery,
    setCategory,
    setFileType,
    setStatus,
    setDateRange,
    setSortBy,
    clearFilters,
    isFiltered,
    viewMode,
    setViewMode,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isFilterSheetOpen,
    setIsFilterSheetOpen,
    activeActionDocument,
    setActiveActionDocument,
    activeEditTitleDocument,
    setActiveEditTitleDocument,
    activeChangeCategoryDocument,
    setActiveChangeCategoryDocument,
    activeDeleteDocument,
    setActiveDeleteDocument,
    isDemoBannerDismissed,
    setIsDemoBannerDismissed,
    toastMessage,
    showToast,
    updateDocumentTitle,
    updateDocumentCategory,
    deleteDocument,
    resetDemoDocuments,
    refreshDocuments,
  } = vault;

  return (
    <DashboardLayout dashboard={dashboard}>
      <div className="space-y-6">
        {/* 1. Health Vault Header & Demo Banner */}
        <VaultHeader
          language={language}
          onUploadClick={() => setIsUploadModalOpen(true)}
          isBannerDismissed={isDemoBannerDismissed}
          onDismissBanner={() => setIsDemoBannerDismissed(true)}
        />

        {/* 2. Search, Filter Chips & View Mode Toolbar */}
        <VaultToolbar
          language={language}
          filters={filters}
          onSearchChange={setSearchQuery}
          onCategoryChange={setCategory}
          onFileTypeChange={setFileType}
          onStatusChange={setStatus}
          onSortChange={setSortBy}
          onClearFilters={clearFilters}
          isFiltered={isFiltered}
          categoryCounts={categoryCounts}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenMobileFilters={() => setIsFilterSheetOpen(true)}
        />

        {/* 3. Document Library (Grid or List) */}
        {filteredDocuments.length === 0 ? (
          <VaultEmptyState
            language={language}
            onResetFilters={clearFilters}
            onResetAllDocs={resetDemoDocuments}
            isAllCleared={documents.length === 0}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                language={language}
                onOpenActionMenu={(doc) => setActiveActionDocument(doc)}
              />
            ))}
          </div>
        ) : (
          <DocumentList
            documents={filteredDocuments}
            language={language}
            onOpenActionMenu={(document) => setActiveActionDocument(document)}
          />
        )}

        {/* 4. Privacy Safeguards Notice */}
        <VaultPrivacyNotice language={language} />
      </div>

      {/* Vault Modals */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        language={language}
        onUploadSuccess={() => {
          refreshDocuments();
          showToast('Document encrypted and stored in vault!');
        }}
      />

      <FilterSortPanel
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        language={language}
        filters={filters}
        onCategoryChange={setCategory}
        onFileTypeChange={setFileType}
        onStatusChange={setStatus}
        onSortChange={setSortBy}
        onDateRangeChange={setDateRange}
        onClearFilters={clearFilters}
      />

      <DocumentActionMenu
        document={activeActionDocument}
        onClose={() => setActiveActionDocument(null)}
        language={language}
        onEditTitle={(doc) => setActiveEditTitleDocument(doc)}
        onChangeCategory={(doc) => setActiveChangeCategoryDocument(doc)}
        onDelete={(doc) => setActiveDeleteDocument(doc)}
        onComingSoon={(feature) => setComingSoonFeature(feature)}
      />

      <EditTitleModal
        document={activeEditTitleDocument}
        onClose={() => setActiveEditTitleDocument(null)}
        language={language}
        onSave={(id, newTitle) => {
          updateDocumentTitle(id, newTitle);
          showToast(`Title updated to "${newTitle}"`);
        }}
      />

      <ChangeCategoryModal
        document={activeChangeCategoryDocument}
        onClose={() => setActiveChangeCategoryDocument(null)}
        language={language}
        onSave={(id, newCat, labelEn, labelNe) => {
          updateDocumentCategory(id, newCat, labelEn, labelNe);
          showToast(`Category updated to "${language === 'en' ? labelEn : labelNe}"`);
        }}
      />

      <DeleteConfirmModal
        document={activeDeleteDocument}
        onClose={() => setActiveDeleteDocument(null)}
        language={language}
        onConfirm={(id) => {
          deleteDocument(id);
          showToast('Document removed from demonstration session.');
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

export default PatientVaultPage;
