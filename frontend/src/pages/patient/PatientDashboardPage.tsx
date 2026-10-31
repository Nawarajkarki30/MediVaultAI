import React from 'react';
import { useDashboardData } from '../../hooks/useDashboardData';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { WelcomeHero } from '../../components/dashboard/WelcomeHero';
import { SummaryCards } from '../../components/dashboard/SummaryCards';
import { RecentReports } from '../../components/dashboard/RecentReports';
import { AIExplanationPreview } from '../../components/dashboard/AIExplanationPreview';
import { FamilySharingCard } from '../../components/dashboard/FamilySharingCard';
import { QuickActions } from '../../components/dashboard/QuickActions';

export const PatientDashboardPage: React.FC = () => {
  const dashboard = useDashboardData();

  const {
    language,
    getTimeGreetingKey,
    setIsUploadModalOpen,
    setSelectedReport,
    setIsInviteModalOpen,
    setComingSoonFeature,
    stats,
    filteredReports,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    familyMembers,
    aiExplanationLanguage,
    setAiExplanationLanguage,
    t,
  } = dashboard;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <DashboardLayout dashboard={dashboard}>
      {/* 1. Welcome Hero Section */}
      <WelcomeHero
        language={language}
        greetingKey={getTimeGreetingKey()}
        onUploadClick={() => setIsUploadModalOpen(true)}
        onExploreVaultClick={() => scrollToSection('recent-reports-section')}
      />

      {/* 2. Summary Metric Cards */}
      <SummaryCards
        stats={stats}
        language={language}
        onReportsCardClick={() => scrollToSection('recent-reports-section')}
        onFamilyCardClick={() => scrollToSection('family-sharing-section')}
        onAICardClick={() => scrollToSection('ai-preview-section')}
      />

      {/* 3. Main Dashboard Content Grid: Reports & AI Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Medical Reports Table/Cards (8 cols) */}
        <div id="recent-reports-section" className="lg:col-span-7 xl:col-span-8 scroll-mt-24">
          <RecentReports
            reports={filteredReports}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            language={language}
            onViewReport={(report) => setSelectedReport(report)}
            onViewAllClick={() => setSelectedCategory('all')}
            onResetFilters={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            isFiltered={selectedCategory !== 'all' || searchQuery.trim() !== ''}
          />
        </div>

        {/* Right Column: AI Explanation Preview (4 cols) */}
        <div id="ai-preview-section" className="lg:col-span-5 xl:col-span-4 scroll-mt-24">
          <AIExplanationPreview
            language={language}
            aiLanguage={aiExplanationLanguage}
            onToggleAiLanguage={setAiExplanationLanguage}
            onExploreAIClick={() => {
              // Open first report preview as a detailed explanation demo
              if (filteredReports.length > 0) {
                setSelectedReport(filteredReports[0]);
              }
            }}
          />
        </div>
      </div>

      {/* 4. Bottom Grid: Family Sharing & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Card: Family Sharing (5 cols) */}
        <div id="family-sharing-section" className="lg:col-span-5 scroll-mt-24">
          <FamilySharingCard
            familyMembers={familyMembers}
            language={language}
            onInviteClick={() => setIsInviteModalOpen(true)}
            onManageClick={() => setIsInviteModalOpen(true)}
          />
        </div>

        {/* Right Card: Quick Actions (7 cols) */}
        <div className="lg:col-span-7">
          <QuickActions
            language={language}
            onUploadClick={() => setIsUploadModalOpen(true)}
            onViewReportsClick={() => scrollToSection('recent-reports-section')}
            onAIExplanationClick={() => scrollToSection('ai-preview-section')}
            onManageFamilyClick={() => setIsInviteModalOpen(true)}
            onFindCaregiverClick={() => setComingSoonFeature(t.navCaregivers)}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboardPage;
