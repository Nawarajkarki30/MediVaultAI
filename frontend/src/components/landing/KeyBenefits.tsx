import React from 'react';
import { Lock, FileText, Users, ShieldCheck, Sparkles } from 'lucide-react';
import { KEY_BENEFITS } from '../../lib/constants';

export const KeyBenefits: React.FC = () => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Lock':
        return <Lock className="w-6 h-6 text-brand-500" />;
      case 'FileText':
        return <FileText className="w-6 h-6 text-brand-500" />;
      case 'Users':
        return <Users className="w-6 h-6 text-brand-500" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-brand-500" />;
      default:
        return <Sparkles className="w-6 h-6 text-brand-500" />;
    }
  };

  return (
    <section
      id="features"
      className="py-12 sm:py-16 bg-white border-y border-brand-border/70"
      aria-label="Key Benefits"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Subtle section label */}
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-500">
              Core Capabilities
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mt-1">
              Key Platform Benefits
            </h2>
          </div>
          <span className="text-xs text-brand-muted hidden sm:inline">
            Planned features in development
          </span>
        </div>

        {/* 4 Feature Cards Grid matching Wireframe */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {KEY_BENEFITS.map((benefit) => (
            <div
              key={benefit.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-subtle hover:shadow-card-hover hover:border-brand-200 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Circular Icon Container matching wireframe */}
                <div className="w-13 h-13 w-12 h-12 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center mb-5 group-hover:bg-brand-100/80 group-hover:scale-105 transition-all">
                  {getIcon(benefit.iconName)}
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-brand-navy mb-2 group-hover:text-brand-600 transition-colors">
                  {benefit.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                  {benefit.description}
                </p>
              </div>

              {/* Status footer pill */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-medium text-brand-500">Feature Highlight</span>
                <span>Phase 2 Spec</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
