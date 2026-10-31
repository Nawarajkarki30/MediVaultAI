import React from 'react';
import { Upload, ShieldCheck, Info, X } from 'lucide-react';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface VaultHeaderProps {
  language: DashboardLanguage;
  onUploadClick: () => void;
  isBannerDismissed: boolean;
  onDismissBanner: () => void;
}

export const VaultHeader: React.FC<VaultHeaderProps> = ({
  language,
  onUploadClick,
  isBannerDismissed,
  onDismissBanner,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="space-y-4">
      {/* Top Banner & Header Row */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-white border border-brand-border/80 p-6 sm:p-8 shadow-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Soft Ambient Radial Background */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-brand-200/20 rounded-full blur-3xl pointer-events-none -z-0" />

        {/* Title, Subtitle & Privacy Callout */}
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100/70 text-brand-700 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-brand-500" />
            <span>{t.privateOrganizedControl}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-950 tracking-tight">
            {t.vaultTitle}
          </h1>

          <p className="text-sm sm:text-base text-brand-muted leading-relaxed">{t.vaultSubtitle}</p>
        </div>

        {/* Action Button */}
        <div className="relative z-10 shrink-0">
          <button
            type="button"
            onClick={onUploadClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs sm:text-sm shadow-card hover:shadow-card-hover transition-all min-h-[46px] focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          >
            <Upload className="w-4 h-4" />
            <span>{t.uploadDocumentBtn}</span>
          </button>
        </div>
      </div>

      {/* Demonstration Banner matching wireframe */}
      {!isBannerDismissed && (
        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-start justify-between gap-3 text-xs text-brand-900 transition-all animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-navy-950">{t.vaultDemoBanner}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onDismissBanner}
            aria-label="Dismiss demo notice"
            className="p-1 rounded-lg text-slate-400 hover:text-navy-950 hover:bg-white/80 transition-colors shrink-0 min-h-[32px] min-w-[32px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
