import React from 'react';
import { GraduationCap, Sparkles, Shield, Heart } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 sm:py-20 bg-[#F8FBFF] border-t border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-600 text-xs font-semibold mb-3">
            <GraduationCap className="w-4 h-4 text-brand-500" />
            <span>Academic Project &amp; Future Vision</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight mb-4">
            About MediVault AI
          </h2>
          <p className="text-base text-brand-muted leading-relaxed">
            Initially developed as a final-year university capstone project, MediVault AI is
            architected from day one with enterprise-grade modularity for future real-world
            deployment across clinical, familial, and personal health contexts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-brand-border/80 shadow-subtle text-left">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-brand-navy mb-2">Bilingual Health Clarity</h3>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              Medical jargon creates anxiety. MediVault AI aims to translate laboratory values,
              clinical acronyms, and medication regimens into plain English and Nepali.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-brand-border/80 shadow-subtle text-left">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-brand-navy mb-2">Patient Data Ownership</h3>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              Patients should hold the keys to their own records. We design with zero-trust
              principles, granular role-based sharing, and comprehensive access auditing.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-brand-border/80 shadow-subtle text-left">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 mb-4">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-brand-navy mb-2">Human-Centered Care</h3>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              Health care is social care. Bridging patients, their children, and trusted non-medical
              companions creates a supportive, reliable circle of care.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
