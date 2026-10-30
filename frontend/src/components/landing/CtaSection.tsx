import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

export const CtaSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-white" aria-label="Call to Action">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700 text-white p-8 sm:p-12 lg:p-16 shadow-xl">
          {/* Subtle background circles */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 rounded-full bg-sky-400/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-brand-200 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-brand-300" />
              <span>Phase 1 Demonstration Foundation</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">
              Ready to Experience Clearer Health Records?
            </h2>

            <p className="text-base sm:text-lg text-brand-100/90 leading-relaxed mb-8 max-w-2xl">
              Explore the interactive preview, check our architectural documentation, or register to
              follow along with the upcoming Phase 2 OCR and bilingual AI explanation engine.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Button
                variant="primary"
                size="lg"
                to="/auth/register"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                className="bg-white text-brand-navy hover:bg-brand-50 border-0 shadow-lg px-7 py-3.5 font-bold"
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                href="#how-it-works"
                className="border-white/30 text-white hover:bg-white/10 px-7 py-3.5"
              >
                Review How It Works
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
