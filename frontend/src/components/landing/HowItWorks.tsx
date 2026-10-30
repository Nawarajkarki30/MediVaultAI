import React from 'react';
import { ArrowRight, Upload, FileSearch, Users, AlertCircle } from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '../../lib/constants';

export const HowItWorks: React.FC = () => {
  const getStepIcon = (name: string) => {
    switch (name) {
      case 'Upload':
        return <Upload className="w-8 h-8 text-brand-500" />;
      case 'FileSearch':
        return <FileSearch className="w-8 h-8 text-brand-500" />;
      case 'Users':
        return <Users className="w-8 h-8 text-brand-500" />;
      default:
        return <Upload className="w-8 h-8 text-brand-500" />;
    }
  };

  return (
    <section
      id="how-it-works"
      className="py-16 sm:py-24 bg-[#F8FBFF] relative overflow-hidden"
      aria-label="How MediVault AI Works"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-navy tracking-tight mb-4">
            How MediVault AI Works
          </h2>
          <p className="text-base sm:text-lg text-brand-muted">
            A simpler way to organize and understand your health information.
          </p>
        </div>

        {/* 3 Sequential Cards with Connecting Arrows */}
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
          {HOW_IT_WORKS_STEPS.map((step, index) => {
            const isLast = index === HOW_IT_WORKS_STEPS.length - 1;

            return (
              <React.Fragment key={step.stepNumber}>
                {/* Step Card */}
                <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/90 shadow-card hover:shadow-card-hover hover:border-brand-200 transition-all duration-200 relative group flex flex-col items-center text-center">
                  {/* Number Badge floating at top left */}
                  <div className="absolute -top-3.5 -left-3.5 w-8 h-8 rounded-full bg-brand-500 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                    {step.stepNumber}
                  </div>

                  {/* Circular Icon Container */}
                  <div className="w-20 h-20 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center mb-6 group-hover:bg-brand-100/70 group-hover:scale-105 transition-all">
                    {getStepIcon(step.iconName)}
                  </div>

                  {/* Step Title */}
                  <h3 className="text-lg font-bold text-brand-navy mb-3">{step.title}</h3>

                  {/* Step Description */}
                  <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connecting Arrow for Desktop */}
                {!isLast && (
                  <div className="hidden lg:flex lg:col-span-1 items-center justify-center text-brand-300">
                    <ArrowRight className="w-8 h-8 stroke-[1.5]" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Informational Disclaimer Box as required */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm border border-brand-border/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-left shadow-subtle">
            <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                <strong className="text-brand-navy font-semibold">Important Medical Notice:</strong>{' '}
                Planned AI explanations are informational only and do not replace medical advice,
                diagnosis, or clinical evaluation by a licensed healthcare provider.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
