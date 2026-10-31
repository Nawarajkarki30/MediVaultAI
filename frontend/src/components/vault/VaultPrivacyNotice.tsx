import React from 'react';
import { Lock, Shield, EyeOff, Share2 } from 'lucide-react';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface VaultPrivacyNoticeProps {
  language: DashboardLanguage;
}

export const VaultPrivacyNotice: React.FC<VaultPrivacyNoticeProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  return (
    <section
      aria-label="Privacy & Security Safeguards"
      className="bg-white rounded-3xl border border-brand-border p-6 shadow-subtle space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-navy-950">
            {t.privacyNoticeTitle}
          </h2>
          <p className="text-[11px] text-slate-400">
            MediVault AI privacy-first design principles
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-navy-950">
            <Shield className="w-4 h-4 text-brand-500" />
            <span>Private By Default</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {t.privacyPrivateDefault}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-navy-950">
            <Share2 className="w-4 h-4 text-brand-500" />
            <span>Granular Sharing</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {t.privacyGranularShare}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-navy-950">
            <EyeOff className="w-4 h-4 text-brand-500" />
            <span>Revocable Permissions</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {t.privacyRevocable}
          </p>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 italic">
        {t.privacyNoticeNote}
      </p>
    </section>
  );
};
