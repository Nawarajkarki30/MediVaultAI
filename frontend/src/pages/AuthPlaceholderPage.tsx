import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { Button } from '../components/common/Button';
import { ShieldAlert, ArrowLeft, Clock, Lock } from 'lucide-react';

interface AuthPlaceholderPageProps {
  mode: 'login' | 'register';
}

export const AuthPlaceholderPage: React.FC<AuthPlaceholderPageProps> = ({ mode }) => {
  const isLogin = mode === 'login';
  const pageTitle = isLogin ? 'Account Log In' : 'Create an Account';

  return (
    <div className="min-h-screen bg-[#F8FBFF] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4">
        <Logo size="md" />
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-muted hover:text-brand-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Homepage</span>
        </Link>
      </header>

      {/* Main Content Card */}
      <main className="max-w-md mx-auto w-full my-8 bg-white rounded-3xl border border-brand-border/90 p-6 sm:p-8 shadow-card text-center relative overflow-hidden">
        {/* Subtle decorative top border */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-400 via-brand-500 to-sky-400" />

        {/* Phase 1 Prototype Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-6">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Phase 1 Prototype — Coming Soon</span>
        </div>

        <h1 className="text-2xl font-extrabold text-brand-navy tracking-tight mb-2">{pageTitle}</h1>

        <p className="text-xs sm:text-sm text-brand-muted mb-6 leading-relaxed">
          {isLogin
            ? 'Sign in to access your stored medical records and AI summaries.'
            : 'Register for your personal MediVault AI account to begin organizing health data.'}
        </p>

        {/* Informational Callout Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left mb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-navy">
            <ShieldAlert className="w-4 h-4 text-brand-500" />
            <span>Nonfunctional Placeholder Notice</span>
          </div>
          <p className="text-xs text-brand-muted leading-relaxed">
            Authentication is intentionally nonfunctional in Phase 1. Real user registration,
            OAuth2, encrypted session storage, and JWT token issuance will be implemented in Phase 2
            alongside PostgreSQL user tables.
          </p>
        </div>

        {/* Nonfunctional Mock Form (Disabled) */}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4 text-left">
          {!isLogin && (
            <div>
              <label htmlFor="mock-name" className="block text-xs font-bold text-brand-navy mb-1.5">
                Full Name
              </label>
              <input
                id="mock-name"
                type="text"
                disabled
                placeholder="e.g. Maya Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-sm cursor-not-allowed"
              />
            </div>
          )}

          <div>
            <label htmlFor="mock-email" className="block text-xs font-bold text-brand-navy mb-1.5">
              Email Address
            </label>
            <input
              id="mock-email"
              type="email"
              disabled
              placeholder="user@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label
              htmlFor="mock-password"
              className="block text-xs font-bold text-brand-navy mb-1.5"
            >
              Password
            </label>
            <input
              id="mock-password"
              type="password"
              disabled
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-sm cursor-not-allowed"
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              disabled
              className="w-full py-3 px-4 rounded-xl bg-slate-200 text-slate-400 font-semibold text-sm cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isLogin ? 'Log In (Phase 2)' : 'Sign Up (Phase 2)'}</span>
            </button>
          </div>
        </form>

        {/* Switch Link */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-brand-muted">
          {isLogin ? (
            <p>
              Don't have an account yet?{' '}
              <Link to="/auth/register" className="font-semibold text-brand-500 hover:underline">
                Sign up
              </Link>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <Link to="/auth/login" className="font-semibold text-brand-500 hover:underline">
                Log in
              </Link>
            </p>
          )}
        </div>

        <div className="mt-4">
          <Button variant="ghost" size="sm" to="/">
            Return to Landing Page
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-brand-muted py-4">
        &copy; {new Date().getFullYear()} MediVault AI &bull; Phase 1 Interface Demonstration
      </footer>
    </div>
  );
};
