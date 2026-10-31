import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout, BenefitItem } from '../../components/auth/AuthLayout';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/auth.api';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

const LOGIN_BENEFITS: BenefitItem[] = [
  {
    icon: 'lock',
    title: 'Secure Access',
    description: 'Your data is protected with industry-standard security.',
  },
  {
    icon: 'file',
    title: 'All in One Place',
    description: 'View your reports, prescriptions, and health information.',
  },
  {
    icon: 'users',
    title: 'Stay Connected',
    description: 'Share with trusted family members and caregivers.',
  },
  {
    icon: 'sparkles',
    title: 'AI Insights',
    description: 'Understand your reports in simple language.',
  },
];

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsUnverified(false);
    setResendStatus(null);

    if (!email || !password) {
      setErrorMessage('Please provide both your email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      const destination =
        (location.state as { from?: { pathname: string } })?.from?.pathname || '/patient/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      const error = err as Error & { code?: string; status?: number };
      if (error.code === 'EMAIL_NOT_VERIFIED' || error.status === 403) {
        setIsUnverified(true);
      }
      setErrorMessage(error.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const res = await authApi.resendVerification(email);
      setResendStatus(res.message || 'Verification email resent successfully.');
    } catch (err) {
      setResendStatus((err as Error).message || 'Failed to resend verification email.');
    }
  };

  return (
    <AuthLayout
      heading="Welcome Back"
      subheading="Sign in to your MediVault AI account to access your health information securely."
      benefits={LOGIN_BENEFITS}
    >
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 lg:p-10 transition-all">
        {/* Card Header */}
        <div className="space-y-1.5 mb-6">
          <h2 className="text-2xl font-bold text-navy-950 tracking-tight">
            Log in to MediVault AI
          </h2>
          <p className="text-sm text-slate-500">Enter your email and password to continue.</p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3 animate-in fade-in"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
            <div className="space-y-1.5">
              <p className="font-medium">{errorMessage}</p>
              {isUnverified && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="text-xs font-semibold underline text-rose-800 hover:text-rose-950 block mt-1"
                >
                  Click here to resend verification email
                </button>
              )}
            </div>
          </div>
        )}

        {resendStatus && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{resendStatus}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email Field */}
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="block text-sm font-semibold text-navy-950">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-11 pr-4 py-3 min-h-[44px] rounded-xl border border-slate-200 bg-white text-navy-950 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="block text-sm font-semibold text-navy-950">
                Password
              </label>
              <Link
                to="/auth/forgot-password"
                className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline min-h-[32px] flex items-center focus-visible:outline-2 focus-visible:outline-brand-500 rounded"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-11 pr-11 py-3 min-h-[44px] rounded-xl border border-slate-200 bg-white text-navy-950 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-navy-950 focus-visible:outline-2 focus-visible:outline-brand-500 min-w-[44px] justify-center"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Primary Submit CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[44px] py-3.5 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Log in</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 font-medium tracking-wider">
              or continue with
            </span>
          </div>
        </div>

        {/* Social Authentication (Explicitly disabled with Coming Soon tag as required) */}
        <div className="space-y-3">
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-400 text-sm font-medium flex items-center justify-center gap-3 cursor-not-allowed transition-colors relative group"
            title="OAuth integration scheduled for upcoming release"
          >
            {/* Google Multi-color G SVG */}
            <svg className="w-4 h-4 opacity-50" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-200 text-slate-500">
              Coming soon
            </span>
          </button>

          <button
            type="button"
            disabled
            aria-disabled="true"
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-400 text-sm font-medium flex items-center justify-center gap-3 cursor-not-allowed transition-colors"
            title="OAuth integration scheduled for upcoming release"
          >
            {/* Apple Logo SVG */}
            <svg className="w-4 h-4 fill-current opacity-50" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-6.3-9.68-11.08-20.73-14.34-33.15-3.26-12.42-4.89-23.77-4.89-34.05 0-14.79 3.8-27.18 11.41-37.16 7.61-9.98 17.18-15.03 28.71-15.15 4.35 0 9.29 1.14 14.82 3.42 5.53 2.28 9.29 3.48 11.28 3.59 1.74 0 5.68-1.25 11.83-3.76 6.15-2.51 11.22-3.64 15.22-3.39 13.92.76 24.81 5.79 32.68 15.08-11.75 7.18-17.47 16.92-17.15 29.23.33 9.68 4.08 17.79 11.25 24.32 7.18 6.53 15.69 10.12 25.53 10.77-2.18 6.53-4.89 13.38-8.15 20.56zM119.22 31.84c0-7.39 2.67-14.24 8.01-20.56 5.34-6.31 11.97-10.45 19.89-12.41.33 1.09.49 2.07.49 2.94 0 7.39-2.78 14.41-8.33 21.05-5.55 6.64-12.29 10.55-20.22 11.75-.43-.98-.65-1.9-.65-2.77z" />
            </svg>
            <span>Continue with Apple</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-200 text-slate-500">
              Coming soon
            </span>
          </button>
        </div>

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
          <span>Don't have an account? </span>
          <Link
            to="/auth/register"
            className="font-bold text-brand-600 hover:text-brand-700 hover:underline min-h-[32px] inline-flex items-center focus-visible:outline-2 focus-visible:outline-brand-500 rounded px-1"
          >
            Sign up
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};
