import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  ShieldCheck,
  LogOut,
  User,
  Mail,
  Calendar,
  FileText,
  Sparkles,
  Users,
  HeartHandshake,
  ArrowRight,
} from 'lucide-react';
import { Logo } from '../../components/common/Logo';

export const PatientDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login', { replace: true });
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently';

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Authenticated Dashboard Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="w-7 h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold text-xs">
                {user?.fullName?.charAt(0).toUpperCase() || 'P'}
              </div>
              <div className="text-left text-xs">
                <span className="font-bold text-navy-950 block">{user?.fullName}</span>
                <span className="text-brand-600 font-medium text-[10px] uppercase tracking-wider">
                  Patient Vault
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors min-h-[44px]"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-brand-500 to-blue-700 p-6 sm:p-8 text-white shadow-lg">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Authenticated Patient Session Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Welcome, {user?.fullName}!
            </h1>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              Your MediVault AI security foundation is established. Live authentication, session
              persistence, and email verification have been verified.
            </p>
          </div>
        </div>

        {/* Account Details Card */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-navy-950">Patient Account Information</h2>
            <p className="text-xs text-slate-500">
              Verified identity credentials managed on MediVault AI.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-500" />
                Full Name
              </span>
              <p className="text-sm font-bold text-navy-950">{user?.fullName}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand-500" />
                Email Address
              </span>
              <p className="text-sm font-bold text-navy-950 truncate">{user?.email}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                Account Status
              </span>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Verified Patient
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-500" />
                Member Since
              </span>
              <p className="text-sm font-bold text-navy-950">{memberSince}</p>
            </div>
          </div>
        </section>

        {/* Phase 2B Roadmap Section (Zero Fake Data) */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-navy-950">Upcoming Healthcare Capabilities</h2>
            <p className="text-xs text-slate-500">
              The following vault modules are scheduled for implementation in Phase 2B and Phase 3.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 relative group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-500 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                  Phase 2B Roadmap
                </span>
                <h3 className="text-base font-bold text-navy-950 mt-1">Personal Health Vault</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Upload, organize, and categorize laboratory test results, prescriptions, and
                  radiology images.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 relative group">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                  Phase 2B Roadmap
                </span>
                <h3 className="text-base font-bold text-navy-950 mt-1">AI Report Explanations</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Plain-language medical breakdowns and Nepali/English translations of complex
                  medical terminology.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 relative group">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Phase 2B Roadmap
                </span>
                <h3 className="text-base font-bold text-navy-950 mt-1">Family Circle Sharing</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Granular, consent-driven document sharing with trusted family members and
                  guardians.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 relative group">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  Phase 3 Roadmap
                </span>
                <h3 className="text-base font-bold text-navy-950 mt-1">Verified Caregivers</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Explore non-medical companionship and health coordination from verified
                  caregivers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Phase 1 Landing Page Link */}
        <div className="pt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200">
          <span>MediVault AI Prototype — University Capstone Project</span>
          <Link
            to="/"
            className="text-brand-600 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>View Public Landing Page</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>
    </div>
  );
};
