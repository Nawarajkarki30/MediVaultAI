import React from 'react';
import { Users2, HeartHandshake, Shield, Eye, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';

export const FamilyAndCaregivers: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-white border-t border-brand-border/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        {/* For Families Section */}
        <div id="for-families" className="scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-600 text-xs font-semibold mb-4">
                <Users2 className="w-3.5 h-3.5" />
                <span>Collaborative Family Care</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight mb-4">
                Keep Loved Ones Informed, With Granular Privacy Controls
              </h2>
              <p className="text-sm sm:text-base text-brand-muted leading-relaxed mb-6">
                Managing health across elderly parents, children, or family members shouldn't mean
                shuffling paper folders or sending unencrypted photos on chat apps. MediVault AI
                allows you to grant selective access to specific reports or summaries while keeping
                sensitive notes strictly private.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm text-brand-navy">
                    <strong>Granular Document Permissions:</strong> Share lab tests while keeping
                    specialized consultations private.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm text-brand-navy">
                    <strong>Dual-Language Summaries:</strong> Elderly family members can review
                    simplified health notes in Nepali or English.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm text-brand-navy">
                    <strong>Immediate Revocation:</strong> Revoke or expire access anytime with a
                    single tap.
                  </span>
                </div>
              </div>

              <Button variant="outline" size="md" to="/auth/register">
                Explore Family Accounts
              </Button>
            </div>

            {/* Right Card Illustration */}
            <div className="lg:col-span-6 bg-gradient-to-br from-brand-50 to-sky-50 rounded-3xl p-6 sm:p-8 border border-brand-border">
              <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                    Family Circle (3 Connected)
                  </span>
                  <span className="text-xs text-brand-500 font-semibold">+ Add Member</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs">
                      P
                    </div>
                    <div>
                      <div className="text-xs font-bold text-brand-navy">Parent (Father)</div>
                      <div className="text-[10px] text-slate-400">Full Reports &amp; Summaries</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-xs">
                      S
                    </div>
                    <div>
                      <div className="text-xs font-bold text-brand-navy">Sibling (Sister)</div>
                      <div className="text-[10px] text-slate-400">Prescriptions Only</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                <div className="pt-2 text-[11px] text-slate-400 italic text-center">
                  All family permissions require owner approval and mutual consent.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* For Caregivers Section */}
        <div id="caregivers" className="scroll-mt-24 pt-8 border-t border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Card Illustration */}
            <div className="lg:col-span-6 order-2 lg:order-1 bg-gradient-to-br from-indigo-50/50 to-brand-50 rounded-3xl p-6 sm:p-8 border border-brand-border">
              <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                    Caregiver Assistance Network
                  </span>
                  <span className="text-[10px] text-brand-muted bg-slate-100 px-2 py-0.5 rounded-full">
                    Non-Medical
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl border border-slate-200/80 bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-brand-navy">
                        Vetted Identification
                      </span>
                      <Shield className="w-3.5 h-3.5 text-brand-500" />
                    </div>
                    <p className="text-[11px] text-brand-muted">
                      Every prospective caregiver will undergo ID verification and qualification
                      vetting.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200/80 bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-brand-navy">
                        Limited Scoped Access
                      </span>
                      <Eye className="w-3.5 h-3.5 text-brand-500" />
                    </div>
                    <p className="text-[11px] text-brand-muted">
                      Caregivers only see schedule reminders, allergies, and daily routine notes—not
                      raw sensitive medical scans.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200/80 bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-brand-navy">
                        Comprehensive Audit Logging
                      </span>
                      <Lock className="w-3.5 h-3.5 text-brand-500" />
                    </div>
                    <p className="text-[11px] text-brand-muted">
                      Every data access is logged with an immutable audit timestamp for full
                      accountability.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-6 order-1 lg:order-2 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-4">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Support When You Need It</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight mb-4">
                Verified Caregivers for Non-Medical Assistance
              </h2>
              <p className="text-sm sm:text-base text-brand-muted leading-relaxed mb-6">
                From medication routine reminders and mobility support to transport coordination,
                MediVault AI envisions a trusted ecosystem of vetted caregivers who assist patients
                and families without compromising their core medical privacy.
              </p>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6 text-xs text-brand-muted leading-relaxed">
                <strong className="text-brand-navy font-semibold">Planned Safeguard:</strong>{' '}
                Caregivers registered on MediVault AI provide non-medical, assistive companionship.
                They are not licensed to administer clinical treatments or modify doctor
                prescriptions.
              </div>

              <Button variant="primary" size="md" to="/auth/register">
                Learn About Caregiver Network
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
