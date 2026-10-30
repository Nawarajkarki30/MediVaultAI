import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Users,
  UserCheck,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  Sparkles,
  User,
  Info,
  CheckCircle2,
  X,
  Languages,
} from 'lucide-react';
import { MOCK_REPORTS } from '../../lib/constants';
import { MockReport } from '../../types';

export const DashboardPreview: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<MockReport | null>(null);
  const [explanationLanguage, setExplanationLanguage] = useState<'en' | 'ne'>('en');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports'>('dashboard');
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus close button when modal opens
  useEffect(() => {
    if (selectedReport) {
      closeButtonRef.current?.focus();
    }
  }, [selectedReport]);

  // Handle Escape key to close the explanation preview modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Escape' || event.key === 'Esc') && selectedReport) {
        setSelectedReport(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedReport]);

  return (
    <div className="relative w-full max-w-2xl mx-auto lg:max-w-none">
      {/* Subtle background glow */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-brand-500/10 via-brand-300/20 to-sky-400/10 rounded-3xl blur-xl -z-10" />

      {/* Decorative floating dots pattern from wireframe */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-grid-subtle opacity-40 -z-10 pointer-events-none hidden sm:block" />

      {/* Main Preview Container */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-preview overflow-hidden transition-all duration-300">
        {/* Window Chrome Header */}
        <div className="bg-slate-50/90 border-b border-brand-border/80 px-4 py-2.5 flex items-center justify-between">
          {/* macOS / Window dots */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/90 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90 inline-block" />
            <span className="ml-2 text-[11px] font-medium text-slate-400 hidden sm:inline">
              medivault.app/dashboard
            </span>
          </div>

          {/* Interactive Synthetic Prototype Pill */}
          <div className="flex items-center gap-1 text-[11px] font-medium text-brand-600 bg-brand-50 border border-brand-200/80 px-2 py-0.5 rounded-full">
            <Info className="w-3 h-3 text-brand-500" />
            <span>Interactive Product Preview</span>
          </div>
        </div>

        {/* Dashboard Shell */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
          {/* Sidebar */}
          <aside className="md:col-span-4 bg-slate-50/60 border-b md:border-b-0 md:border-r border-brand-border/80 p-4 flex flex-col justify-between">
            <div>
              {/* Sidebar Logo */}
              <div className="flex items-center gap-2 mb-6 px-2">
                <div className="w-6 h-6 bg-brand-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                  <span className="text-xs font-bold leading-none">+</span>
                </div>
                <span className="text-sm font-bold tracking-tight text-brand-navy">
                  MediVault <span className="text-brand-500">AI</span>
                </span>
              </div>

              {/* Sidebar Nav Items */}
              <nav className="space-y-1" aria-label="Dashboard Preview Navigation">
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors min-h-[38px] ${
                    activeTab === 'dashboard'
                      ? 'bg-brand-100/70 text-brand-600 font-bold'
                      : 'text-brand-muted hover:text-brand-navy hover:bg-slate-100/70'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-brand-500" />
                  <span>Dashboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('reports')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors min-h-[38px] ${
                    activeTab === 'reports'
                      ? 'bg-brand-100/70 text-brand-600 font-bold'
                      : 'text-brand-muted hover:text-brand-navy hover:bg-slate-100/70'
                  }`}
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>My Reports</span>
                </button>

                <div className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-brand-muted rounded-xl cursor-default opacity-80 min-h-[38px]">
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  <span>AI Assistant</span>
                </div>

                <div className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-brand-muted rounded-xl cursor-default opacity-80 min-h-[38px]">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Family Sharing</span>
                </div>

                <div className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-brand-muted rounded-xl cursor-default opacity-80 min-h-[38px]">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <span>Caregivers</span>
                </div>

                <div className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-brand-muted rounded-xl cursor-default opacity-80 min-h-[38px]">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profile</span>
                </div>
              </nav>
            </div>

            {/* Sidebar Footer Note */}
            <div className="hidden md:block pt-4 border-t border-slate-200/60 px-2 text-[10px] text-slate-400 leading-tight">
              Synthetic demo preview
            </div>
          </aside>

          {/* Main Dashboard Content Area */}
          <main className="md:col-span-8 p-4 sm:p-5 flex flex-col justify-between bg-white">
            <div>
              {/* User Bar */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="text-left">
                  <h3 className="text-base sm:text-lg font-bold text-brand-navy">Welcome, User</h3>
                  <p className="text-xs text-brand-muted">
                    Here's an overview of your health information.
                  </p>
                </div>

                {/* Profile menu pill */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 cursor-default">
                  <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-brand-navy hidden sm:inline">User</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              {/* 3 Summary Stat Cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
                {/* Stat 1: Medical Reports */}
                <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-2.5 sm:p-3 relative flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className="text-xl sm:text-2xl font-bold text-brand-navy">5</span>
                    <div className="w-6 h-6 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-brand-muted mt-1 leading-tight break-words">
                    Medical Reports
                  </span>
                </div>

                {/* Stat 2: Family Members */}
                <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-2.5 sm:p-3 relative flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className="text-xl sm:text-2xl font-bold text-brand-navy">3</span>
                    <div className="w-6 h-6 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-brand-muted mt-1 leading-tight break-words">
                    Family Members
                  </span>
                </div>

                {/* Stat 3: Caregivers */}
                <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-2.5 sm:p-3 relative flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className="text-xl sm:text-2xl font-bold text-brand-navy">2</span>
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <UserCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-brand-muted mt-1 leading-tight break-words">
                    Caregivers
                  </span>
                </div>
              </div>

              {/* Recent Reports List */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-subtle">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs sm:text-sm font-bold text-brand-navy">Recent Reports</h4>
                  <button
                    type="button"
                    onClick={() => setActiveTab('reports')}
                    className="text-xs font-semibold text-brand-500 hover:text-brand-600 hover:underline min-h-[32px] px-2 flex items-center"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-2">
                  {MOCK_REPORTS.map((report) => (
                    <button
                      key={report.id}
                      type="button"
                      onClick={() => setSelectedReport(report)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/40 transition-all text-left group min-h-[44px]"
                      title="Click to view simulated AI explanation"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0 group-hover:bg-brand-100 transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-brand-navy group-hover:text-brand-600 transition-colors">
                            {report.name}
                          </div>
                          <div className="text-[10px] text-slate-400">{report.date}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Green badge matching wireframe */}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          {report.status}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Demo Banner */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-brand-muted">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Simulated Interface Preview</span>
              </span>
              <span className="italic text-slate-400 text-[10px]">
                Click any report to view AI explanation
              </span>
            </div>
          </main>
        </div>
      </div>

      {/* Simulated AI Explanation Modal (Interactive Polish & A11y) */}
      {selectedReport && (
        <div
          id="explanation-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/40 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="explanation-dialog-title"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-brand-navy rounded-lg hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-brand-500"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-500 bg-brand-50 px-2.5 py-0.5 rounded-full">
                Simulated AI Explanation
              </span>
            </div>

            <h3 id="explanation-dialog-title" className="text-lg font-bold text-brand-navy">
              {selectedReport.name}
            </h3>
            <p className="text-xs text-brand-muted mb-4">
              Recorded date: {selectedReport.date} &bull; Synthetic Demonstration
            </p>

            {/* Language Toggle */}
            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200 mb-4">
              <span className="text-xs font-medium text-brand-navy flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-brand-500" />
                Explanation Language:
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setExplanationLanguage('en')}
                  className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors min-h-[36px] flex items-center ${
                    explanationLanguage === 'en'
                      ? 'bg-brand-500 text-white'
                      : 'text-brand-navy hover:bg-slate-200/70'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setExplanationLanguage('ne')}
                  className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors min-h-[36px] flex items-center ${
                    explanationLanguage === 'ne'
                      ? 'bg-brand-500 text-white'
                      : 'text-brand-navy hover:bg-slate-200/70'
                  }`}
                >
                  नेपाली (Nepali)
                </button>
              </div>
            </div>

            {/* Explanation Content Box */}
            <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-4 text-sm text-brand-navy mb-4 space-y-2">
              {explanationLanguage === 'en' ? (
                <>
                  <p className="font-semibold text-brand-600">Summary in Simple English:</p>
                  <p className="text-xs leading-relaxed text-slate-700">
                    &bull; <strong>Hemoglobin:</strong> 14.2 g/dL (Normal range: 13.5 - 17.5 g/dL).
                    Your blood's oxygen-carrying capacity is healthy.
                  </p>
                  <p className="text-xs leading-relaxed text-slate-700">
                    &bull; <strong>Fasting Glucose:</strong> 108 mg/dL (Slightly above normal
                    threshold of 99 mg/dL). Discuss dietary adjustments with your physician.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-brand-600">सरल नेपालीमा सारांश:</p>
                  <p className="text-xs leading-relaxed text-slate-700">
                    &bull; <strong>हेमोग्लोबिन:</strong> १४.२ g/dL (सामान्य दायरा: १३.५ - १७.५
                    g/dL)। तपाईंको रगतको अक्सिजन बोक्ने क्षमता स्वस्थ छ।
                  </p>
                  <p className="text-xs leading-relaxed text-slate-700">
                    &bull; <strong>उपवास ग्लुकोज (सुगर):</strong> १०८ mg/dL (सामान्य ९९ mg/dL भन्दा
                    केही बढी)। खानापान र जीवनशैली बारे डाक्टरसँग सल्लाह लिनुहोस्।
                  </p>
                </>
              )}
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-4">
              <strong>Informational Disclaimer:</strong> This preview demonstrates proposed Phase 2
              AI explanation capabilities. It does not replace professional medical advice.
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2.5 bg-brand-500 text-white text-xs font-semibold rounded-xl hover:bg-brand-600 min-h-[44px] focus-visible:outline-brand-500"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
