import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';
import { DashboardPreview } from './DashboardPreview';

export const HeroSection: React.FC = () => {
  return (
    <section
      id="home"
      className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden"
      aria-label="MediVault AI Hero"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Value Proposition & Call to Actions */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Eyebrow badge matching wireframe */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/90 text-brand-700 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
              <div className="w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
              </div>
              <span>Your Health. Clearer. Safer. Together.</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-brand-navy tracking-tight leading-[1.15] mb-6">
              Your Personal Health Information,{' '}
              <span className="text-brand-500">Made Simple with AI</span>
            </h1>

            {/* Description Subtitle */}
            <p className="text-base sm:text-lg text-brand-muted leading-relaxed mb-8 max-w-xl">
              MediVault AI helps you securely organize your medical reports, understand them in
              simple language, and manage your health information with your family and trusted
              caregivers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                to="/auth/register"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                className="shadow-md shadow-brand-500/20 px-7 py-3.5"
              >
                Get Started
              </Button>

              <Button variant="secondary" size="lg" href="#how-it-works" className="px-7 py-3.5">
                Learn More
              </Button>
            </div>

            {/* Security and Informational Note */}
            <div className="mt-8 pt-6 border-t border-brand-border/60 w-full flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-brand-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                Designed for Patient Empowerment
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                English &amp; Nepali Support
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Family Permission Controls
              </span>
            </div>
          </div>

          {/* Right Column: Hero Visual - Interactive Dashboard Preview */}
          <div className="lg:col-span-6 w-full">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
};
