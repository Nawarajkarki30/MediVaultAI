import React from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { DemoReportModal } from './DemoReportModal';
import { DemoUploadModal } from './DemoUploadModal';
import { InviteFamilyModal } from './InviteFamilyModal';
import { ComingSoonModal } from './ComingSoonModal';
import { UseDashboardDataReturn } from '../../hooks/useDashboardData';
import { ShieldCheck } from 'lucide-react';

interface DashboardLayoutProps {
  dashboard: UseDashboardDataReturn;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ dashboard, children }) => {
  const {
    language,
    setLanguage,
    t,
    activeNavTab,
    setActiveNavTab,
    searchQuery,
    setSearchQuery,
    notifications,
    unreadNotificationsCount,
    markNotificationsAsRead,
    selectedReport,
    setSelectedReport,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isInviteModalOpen,
    setIsInviteModalOpen,
    comingSoonFeature,
    setComingSoonFeature,
  } = dashboard;

  const handleNavSelect = (tab: typeof activeNavTab) => {
    setActiveNavTab(tab);
    if (tab === 'vault') {
      const el = document.getElementById('recent-reports-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'ai') {
      const el = document.getElementById('ai-preview-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'family') {
      const el = document.getElementById('family-sharing-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'caregivers') {
      setComingSoonFeature(t.navCaregivers);
    } else if (tab === 'settings') {
      setComingSoonFeature(t.navSettings);
    } else if (tab === 'notifications') {
      // Handled via header
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex text-slate-800 antialiased selection:bg-brand-500 selection:text-white">
      {/* Desktop Sidebar (Fixed on desktop >= lg) */}
      <DashboardSidebar
        activeTab={activeNavTab}
        onSelectTab={handleNavSelect}
        language={language}
        unreadCount={unreadNotificationsCount}
        className="hidden lg:flex w-64 xl:w-72 shrink-0 sticky top-0 h-screen"
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <DashboardHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          language={language}
          onLanguageChange={setLanguage}
          notifications={notifications}
          unreadCount={unreadNotificationsCount}
          onMarkNotificationsAsRead={markNotificationsAsRead}
          onOpenSettings={() => setComingSoonFeature(t.navSettings)}
        />

        {/* Prototype Verification Pill Banner */}
        <div className="bg-blue-50/70 border-b border-brand-border/60 px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between text-[11px] text-brand-700">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span className="font-semibold">
              Authenticated Patient Vault Environment (Phase 2B)
            </span>
            <span className="hidden sm:inline text-brand-muted">
              — Sample medical records & statistics shown for interface verification.
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 shrink-0">
            Prototype Demo
          </span>
        </div>

        {/* Scrollable Page Body (pb-24 on mobile to prevent MobileBottomNav overlap) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 lg:pb-12 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation (< lg) */}
        <MobileBottomNav
          activeTab={activeNavTab}
          onSelectTab={handleNavSelect}
          language={language}
          onLanguageChange={setLanguage}
          unreadCount={unreadNotificationsCount}
        />
      </div>

      {/* Modals & Dialogs */}
      <DemoReportModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        language={language}
      />

      <DemoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        language={language}
      />

      <InviteFamilyModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        language={language}
      />

      <ComingSoonModal
        featureName={comingSoonFeature}
        onClose={() => setComingSoonFeature(null)}
        language={language}
      />
    </div>
  );
};
