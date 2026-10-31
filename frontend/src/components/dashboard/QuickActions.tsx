import React from 'react';
import { Upload, FileText, Sparkles, Users, UserCheck } from 'lucide-react';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface QuickActionsProps {
  language: DashboardLanguage;
  onUploadClick: () => void;
  onViewReportsClick: () => void;
  onAIExplanationClick: () => void;
  onManageFamilyClick: () => void;
  onFindCaregiverClick: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  language,
  onUploadClick,
  onViewReportsClick,
  onAIExplanationClick,
  onManageFamilyClick,
  onFindCaregiverClick,
}) => {
  const t = TRANSLATIONS[language];

  const actions = [
    {
      id: 'upload',
      title: t.qaUploadReport,
      icon: Upload,
      onClick: onUploadClick,
      bg: 'bg-blue-50 text-brand-600 border-blue-100',
    },
    {
      id: 'view',
      title: t.qaViewReports,
      icon: FileText,
      onClick: onViewReportsClick,
      bg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      id: 'ai',
      title: t.qaAIExplanation,
      icon: Sparkles,
      onClick: onAIExplanationClick,
      bg: 'bg-sky-50 text-sky-600 border-sky-100',
    },
    {
      id: 'family',
      title: t.qaManageFamily,
      icon: Users,
      onClick: onManageFamilyClick,
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      id: 'caregiver',
      title: t.qaFindCaregiver,
      icon: UserCheck,
      onClick: onFindCaregiverClick,
      bg: 'bg-purple-50 text-purple-600 border-purple-100',
    },
  ];

  return (
    <section
      aria-label="Quick Actions"
      className="bg-white rounded-3xl border border-brand-border p-5 sm:p-6 shadow-subtle space-y-4"
    >
      <h2 className="text-base sm:text-lg font-bold text-navy-950">{t.quickActionsTitle}</h2>

      {/* 5 Action Cards Grid matching wireframe */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={act.onClick}
              className="group flex flex-col items-center text-center p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/60 hover:border-brand-300 shadow-2xs hover:shadow-subtle transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 min-h-[90px] justify-center"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-2 group-hover:scale-105 transition-transform ${act.bg}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-navy-950 group-hover:text-brand-600 transition-colors leading-tight">
                {act.title}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
