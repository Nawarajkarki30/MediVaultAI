import React from 'react';
import { FileText, Users, Sparkles, ChevronRight } from 'lucide-react';
import { DashboardStats, DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface SummaryCardsProps {
  stats: DashboardStats;
  language: DashboardLanguage;
  onReportsCardClick: () => void;
  onFamilyCardClick: () => void;
  onAICardClick: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  stats,
  language,
  onReportsCardClick,
  onFamilyCardClick,
  onAICardClick,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <section aria-label="Health Summary Metrics" className="space-y-2">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: My Medical Reports */}
        <button
          type="button"
          onClick={onReportsCardClick}
          className="group text-left p-5 sm:p-6 rounded-3xl bg-white border border-brand-border hover:border-brand-300 shadow-subtle hover:shadow-card transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 relative flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 group-hover:scale-105 transition-transform shrink-0">
              <FileText className="w-6 h-6 text-brand-500" />
            </div>
            <div>
              <span className="text-xs font-semibold text-brand-muted block">
                {t.cardReportsTitle}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-navy-950">
                  {stats.totalReports}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  +{stats.reportsDelta}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {t.cardReportsSubtitle}
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>

        {/* Card 2: Shared With Family */}
        <button
          type="button"
          onClick={onFamilyCardClick}
          className="group text-left p-5 sm:p-6 rounded-3xl bg-white border border-brand-border hover:border-brand-300 shadow-subtle hover:shadow-card transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 relative flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform shrink-0">
              <Users className="w-6 h-6 text-brand-500" />
            </div>
            <div>
              <span className="text-xs font-semibold text-brand-muted block">
                {t.cardFamilyTitle}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-navy-950">
                  {stats.familyMembersCount}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {t.cardFamilySubtitle}
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>

        {/* Card 3: AI Explanations */}
        <button
          type="button"
          onClick={onAICardClick}
          className="group text-left p-5 sm:p-6 rounded-3xl bg-white border border-brand-border hover:border-brand-300 shadow-subtle hover:shadow-card transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 relative flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="w-6 h-6 text-brand-500" />
            </div>
            <div>
              <span className="text-xs font-semibold text-brand-muted block">{t.cardAITitle}</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-navy-950">
                  {stats.aiExplanationsCount}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  +{stats.explanationsDelta}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">{t.cardAISubtitle}</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>
      </div>

      {/* Synthetic Metric Attribution Disclaimer */}
      <div className="text-right">
        <span className="text-[10px] text-slate-400 italic">* {t.demoDataNotice}</span>
      </div>
    </section>
  );
};
