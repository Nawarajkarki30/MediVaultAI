import React from 'react';
import { Logo } from '../common/Logo';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-white border-t border-brand-border/80 text-brand-navy"
      aria-label="Site Footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 text-left space-y-4">
            <Logo size="md" />
            <p className="text-sm text-brand-muted max-w-sm leading-relaxed">
              MediVault AI is an AI-powered personal healthcare platform designed to simplify
              medical reports, facilitate family coordination, and support verified caregiver
              assistance.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-brand-600 bg-brand-50 border border-brand-200/70 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              <span>Phase 1: Project Foundation &amp; Landing Page</span>
            </div>
          </div>

          {/* Column 1: Navigation */}
          <div className="text-left space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-brand-muted">
              <li>
                <a href="#home" className="hover:text-brand-500 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-brand-500 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-brand-500 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#for-families" className="hover:text-brand-500 transition-colors">
                  For Families
                </a>
              </li>
              <li>
                <a href="#caregivers" className="hover:text-brand-500 transition-colors">
                  Caregivers
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Platform & Vision */}
          <div className="text-left space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
              Platform Vision
            </h4>
            <ul className="space-y-2 text-sm text-brand-muted">
              <li>
                <a href="#about" className="hover:text-brand-500 transition-colors">
                  About Project
                </a>
              </li>
              <li>
                <span className="text-slate-400">OCR Pipeline (Phase 2)</span>
              </li>
              <li>
                <span className="text-slate-400">Nepali NLP (Phase 2)</span>
              </li>
              <li>
                <span className="text-slate-400">Caregiver Vetting (Phase 3)</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Architecture & Docs */}
          <div className="text-left space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
              Documentation
            </h4>
            <ul className="space-y-2 text-sm text-brand-muted">
              <li>
                <span className="hover:text-brand-500 transition-colors cursor-pointer">
                  Architecture Specs
                </span>
              </li>
              <li>
                <span className="hover:text-brand-500 transition-colors cursor-pointer">
                  Database Schema
                </span>
              </li>
              <li>
                <span className="hover:text-brand-500 transition-colors cursor-pointer">
                  Feature Roadmap
                </span>
              </li>
              <li>
                <span className="hover:text-brand-500 transition-colors cursor-pointer">
                  API Health Status
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Medical & Legal Disclaimer Banner */}
        <div className="border-t border-slate-100 pt-8 pb-4 text-left">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 text-xs text-brand-muted leading-relaxed">
            <strong className="text-brand-navy font-semibold">
              Medical Advice &amp; Operational Notice:
            </strong>{' '}
            MediVault AI is currently in Phase 1 (Project Foundation &amp; UI Demonstration).
            AI-generated explanations are strictly informational summaries and must never be treated
            as professional medical diagnosis, clinical advice, or treatment regimens. Always
            consult qualified healthcare professionals regarding any medical condition or
            prescription change.
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-muted gap-4">
          <p>
            &copy; {currentYear} MediVault AI. Academic Capstone &amp; Future Healthcare Platform.
          </p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current inline" />
            <span>for clearer, safer health management</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
