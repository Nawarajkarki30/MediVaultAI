import React from 'react';
import { Navbar } from '../layout/Navbar';
import {
  ShieldCheck,
  Lock,
  FileText,
  Users,
  Sparkles,
  Info,
  CheckCircle2,
  Heart,
} from 'lucide-react';

export interface BenefitItem {
  icon: 'lock' | 'file' | 'users' | 'sparkles';
  title: string;
  description: string;
}

interface AuthLayoutProps {
  children: React.ReactNode;
  heading: string;
  subheading: string;
  benefits: BenefitItem[];
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  heading,
  subheading,
  benefits,
}) => {
  const renderIcon = (type: BenefitItem['icon']) => {
    switch (type) {
      case 'lock':
        return <Lock className="w-5 h-5 text-brand-500" />;
      case 'file':
        return <FileText className="w-5 h-5 text-brand-500" />;
      case 'users':
        return <Users className="w-5 h-5 text-brand-500" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-brand-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Sticky Header */}
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Left Column: Brand Value Propositions & Visual Showcase */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-8 lg:pr-6">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100/80 text-xs font-semibold text-brand-700 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
              <span>Your Health. Clearer. Safer. Together.</span>
            </div>

            {/* Page Heading & Subheading */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-950 tracking-tight leading-[1.15]">
                {heading}
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                {subheading}
              </p>
            </div>

            {/* 4 Feature Cards (2x2 Grid on tablet/desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
              {benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/70 border border-slate-200/60 shadow-xs hover:border-brand-200 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-center shrink-0">
                    {renderIcon(benefit.icon)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-navy-950">{benefit.title}</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Healthcare Lifestyle Graphic matching wireframe */}
            <div className="relative pt-4 hidden sm:block">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100/70 via-blue-50 to-white border border-blue-100 p-6 shadow-sm">
                {/* Decorative background curves */}
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-brand-200/40 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-blue-300/30 blur-xl pointer-events-none" />

                <div className="relative flex items-center justify-between">
                  <div className="space-y-3 max-w-[280px]">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-brand-700 text-xs font-semibold shadow-xs">
                      <ShieldCheck className="w-4 h-4 text-brand-500" />
                      <span>Patient-Owned Records</span>
                    </div>

                    <p className="text-sm font-semibold text-navy-950 leading-snug">
                      Take full control of your medical history, reports, and personal wellness
                      journey.
                    </p>

                    {/* Handwritten-styled callout matching wireframe */}
                    <div className="pt-2 flex items-center gap-2">
                      <span className="font-serif italic text-brand-600 text-base font-semibold tracking-wide">
                        Your Health In Your Hands
                      </span>
                      <Heart className="w-4 h-4 text-brand-500 fill-brand-100 animate-pulse" />
                    </div>
                  </div>

                  {/* Illustrated smartphone & patient avatar graphic */}
                  <div className="w-32 h-36 bg-gradient-to-b from-white to-blue-50 rounded-2xl border border-blue-100 shadow-md p-2.5 flex flex-col justify-between shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="w-3 h-3 rounded-full bg-brand-500" />
                      <div className="w-10 h-1.5 rounded-full bg-slate-200" />
                    </div>
                    <div className="space-y-1.5 my-auto">
                      <div className="h-2 w-full bg-blue-100 rounded" />
                      <div className="h-2 w-4/5 bg-slate-100 rounded" />
                      <div className="h-2 w-3/5 bg-emerald-100 rounded" />
                    </div>
                    <div className="flex items-center gap-1.5 bg-brand-500 text-white rounded-lg px-2 py-1 text-[10px] font-semibold justify-center">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form Card + Medical Disclaimer */}
          <div className="lg:col-span-6 xl:col-span-6 max-w-lg mx-auto w-full space-y-4">
            {children}

            {/* Medical Disclaimer matching wireframe */}
            <div className="rounded-2xl bg-blue-50/70 border border-blue-100/90 p-4 flex items-start gap-3 shadow-2xs">
              <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-navy-950 font-semibold">MediVault AI</strong> is an
                informational tool and does not provide medical advice. Always consult a qualified
                healthcare professional for medical concerns.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
