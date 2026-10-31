import React from 'react';
import { Plus } from 'lucide-react';
import { FamilyMember, DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface FamilySharingCardProps {
  familyMembers: FamilyMember[];
  language: DashboardLanguage;
  onInviteClick: () => void;
  onManageClick: () => void;
}

export const FamilySharingCard: React.FC<FamilySharingCardProps> = ({
  familyMembers,
  language,
  onInviteClick,
  onManageClick,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <section
      aria-label="Family Sharing Section"
      className="bg-white rounded-3xl border border-brand-border p-5 sm:p-6 shadow-subtle space-y-4"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-navy-950">{t.familySharingTitle}</h2>
        <button
          type="button"
          onClick={onManageClick}
          className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors focus:outline-hidden focus:ring-2 focus:ring-brand-500 rounded-lg px-2 py-1 min-h-[36px] flex items-center"
        >
          {t.manageLink}
        </button>
      </div>

      <p className="text-xs text-brand-muted leading-relaxed">{t.familySubtitle}</p>

      {/* Avatars Row matching Wireframe */}
      <div className="flex items-start gap-4 overflow-x-auto pb-1 no-scrollbar pt-2">
        {familyMembers.map((member) => {
          const relationship = language === 'en' ? member.relationshipEn : member.relationshipNe;

          const isCanView = member.permissionStatus === 'can_view';

          return (
            <div
              key={member.id}
              className="flex flex-col items-center text-center space-y-1.5 shrink-0 min-w-[72px]"
            >
              {/* Avatar circle */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs border shadow-2xs ${member.avatarColor}`}
              >
                {member.initials}
              </div>

              {/* Name & Relation */}
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-navy-950 block leading-tight">
                  {member.name}
                </span>
                <span className="text-[10px] text-slate-400 block">{relationship}</span>
              </div>

              {/* Permission Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  isCanView
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {!isCanView && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                {isCanView ? t.canViewStatus : t.pendingStatus}
              </span>
            </div>
          );
        })}

        {/* Invite Family Button */}
        <button
          type="button"
          onClick={onInviteClick}
          className="flex flex-col items-center text-center space-y-1.5 shrink-0 min-w-[72px] group focus:outline-hidden focus:ring-2 focus:ring-brand-500 rounded-2xl p-1"
        >
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-brand-300 group-hover:border-brand-500 group-hover:bg-brand-50/50 flex items-center justify-center text-brand-500 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-brand-600 group-hover:underline block leading-tight">
              {t.inviteFamilyBtn}
            </span>
            <span className="text-[10px] text-slate-400 block">+ New</span>
          </div>
        </button>
      </div>
    </section>
  );
};
