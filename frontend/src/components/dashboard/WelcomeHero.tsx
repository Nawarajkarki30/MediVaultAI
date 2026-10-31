import React from 'react';
import { Upload, FolderOpen } from 'lucide-react';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';
import { useAuth } from '../../contexts/AuthContext';
import { HeroIllustration } from './HeroIllustration';

interface WelcomeHeroProps {
  language: DashboardLanguage;
  greetingKey: 'greetingMorning' | 'greetingAfternoon' | 'greetingEvening';
  onUploadClick: () => void;
  onExploreVaultClick: () => void;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({
  language,
  greetingKey,
  onUploadClick,
  onExploreVaultClick,
}) => {
  const { user } = useAuth();
  const t = TRANSLATIONS[language];

  const displayName = user?.fullName || 'Sita';
  const firstName = displayName.split(' ')[0] || displayName;
  const greetingText = t[greetingKey];

  return (
    <section
      aria-label="Welcome Overview"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-sky-50/80 to-white border border-brand-border/80 p-6 sm:p-8 lg:p-10 shadow-subtle transition-all duration-300"
    >
      {/* Soft Ambient Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-sky-200/20 rounded-full blur-2xl pointer-events-none -z-0" />

      {/* Two-Column Responsive Layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Greeting, Value Proposition, Action Buttons */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-950 tracking-tight flex items-center flex-wrap gap-2">
              <span>
                {greetingText}, {firstName}!
              </span>
              <span
                className="inline-block animate-wave origin-bottom-right"
                role="img"
                aria-label="wave"
              >
                👋
              </span>
            </h1>
            <p className="text-sm sm:text-base text-brand-muted leading-relaxed max-w-xl">
              {t.heroSubtitle}
            </p>
          </div>

          {/* Action CTAs matching Wireframe */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onUploadClick}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs sm:text-sm shadow-card hover:shadow-card-hover transition-all min-h-[46px] focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            >
              <Upload className="w-4 h-4" />
              <span>{t.uploadReportBtn}</span>
            </button>

            <button
              type="button"
              onClick={onExploreVaultClick}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-brand-600 font-semibold text-xs sm:text-sm border border-brand-200 hover:border-brand-300 shadow-2xs transition-all min-h-[46px] focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            >
              <FolderOpen className="w-4 h-4 text-brand-500" />
              <span>{t.exploreVaultBtn}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Health Persona SVG Illustration */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
};
