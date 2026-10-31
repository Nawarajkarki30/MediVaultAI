import React from 'react';
import { Sparkles, FileText, Info } from 'lucide-react';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface AIExplanationPreviewProps {
  language: DashboardLanguage;
  aiLanguage: DashboardLanguage;
  onToggleAiLanguage: (lang: DashboardLanguage) => void;
  onExploreAIClick: () => void;
}

export const AIExplanationPreview: React.FC<AIExplanationPreviewProps> = ({
  language,
  aiLanguage,
  onToggleAiLanguage,
  onExploreAIClick,
}) => {
  const t = TRANSLATIONS[language];

  const sampleReportTitle = aiLanguage === 'en' ? 'Blood Test Report' : 'रगत परीक्षण रिपोर्ट';

  const sampleExcerpt =
    aiLanguage === 'en'
      ? 'This report checks important things like your blood sugar, cholesterol, and other health indicators. All key indicators are within healthy ranges, with vitamin D slightly low.'
      : 'यो रिपोर्टले तपाईंको रगतमा चिनीको मात्रा (Blood Sugar), कोलेस्ट्रोल र अन्य स्वास्थ्य सूचकहरू जाँच गर्दछ। सबै मुख्य सूचकहरू सामान्य दायराभित्र छन्, भिटामिन डी केही कम देखिएको छ।';

  return (
    <section
      aria-label="AI Explanation Preview Section"
      className="bg-white rounded-3xl border border-brand-border p-5 sm:p-6 shadow-subtle space-y-4"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-navy-950">{t.aiPreviewTitle}</h2>
        <button
          type="button"
          onClick={onExploreAIClick}
          className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors focus:outline-hidden focus:ring-2 focus:ring-brand-500 rounded-lg px-2 py-1 min-h-[36px] flex items-center"
        >
          {t.aiTryNow}
        </button>
      </div>

      <p className="text-xs text-brand-muted leading-relaxed">{t.aiPreviewSubtitle}</p>

      {/* Language Toggle Pills */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => onToggleAiLanguage('en')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[36px] ${
            aiLanguage === 'en'
              ? 'bg-brand-500 text-white shadow-2xs'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
          } focus:outline-hidden focus:ring-2 focus:ring-brand-500`}
        >
          English
        </button>

        <button
          type="button"
          onClick={() => onToggleAiLanguage('ne')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[36px] ${
            aiLanguage === 'ne'
              ? 'bg-brand-500 text-white shadow-2xs'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
          } focus:outline-hidden focus:ring-2 focus:ring-brand-500`}
        >
          नेपाली
        </button>
      </div>

      {/* Demonstration Card Container */}
      <div className="p-4 rounded-2xl bg-blue-50/50 border border-brand-border/70 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-navy-950">{sampleReportTitle}</span>
          </div>

          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            {t.sampleBadge}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed italic bg-white/70 p-3 rounded-xl border border-slate-100">
          "{sampleExcerpt}"
        </p>

        {/* CTA Button */}
        <button
          type="button"
          onClick={onExploreAIClick}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-brand-600 font-semibold text-xs border border-brand-200 hover:border-brand-300 shadow-2xs transition-all min-h-[42px] focus:outline-hidden focus:ring-2 focus:ring-brand-500"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>{t.exploreAIBtn}</span>
        </button>
      </div>

      {/* Prominent Medical Disclaimer */}
      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-slate-500 text-[11px] leading-relaxed flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>{t.medicalDisclaimer}</span>
      </div>
    </section>
  );
};
