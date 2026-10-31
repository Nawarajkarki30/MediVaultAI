import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { AuthLayout, BenefitItem } from '../../components/auth/AuthLayout';
import { authApi } from '../../services/auth.api';
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

const RESET_BENEFITS: BenefitItem[] = [
  {
    icon: 'lock',
    title: 'Password Hardening',
    description: 'We require robust passwords and employ Argon2id hashing algorithms.',
  },
  {
    icon: 'file',
    title: 'Session Revocation',
    description: 'Resetting your password automatically revokes any prior active sessions.',
  },
  {
    icon: 'users',
    title: 'Security Notifications',
    description: 'Protecting your family health vault from unauthorized account access.',
  },
  {
    icon: 'sparkles',
    title: 'Instant Reconnection',
    description: 'Resume viewing your medical documents securely once password is changed.',
  },
];

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage('Missing password reset token. Please request a new link.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({
        token,
        password,
        confirmPassword,
      });
      setIsSuccess(true);
    } catch (err) {
      setErrorMessage(
        (err as Error).message ||
          'Failed to reset password. The link may have expired or already been used.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      heading="Set New Password"
      subheading="Create a new, strong password to secure your MediVault AI patient health account."
      benefits={RESET_BENEFITS}
    >
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 lg:p-10 transition-all">
        <div className="space-y-1.5 mb-6">
          <h2 className="text-2xl font-bold text-navy-950 tracking-tight">Create New Password</h2>
          <p className="text-sm text-slate-500">
            Please choose a password with at least 8 characters.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}

        {isSuccess ? (
          <div className="space-y-6 text-center py-6 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-navy-950">Password Updated Successfully!</h3>
              <p className="text-sm text-slate-600">
                Your password has been changed. You can now log in with your new credentials.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/auth/login')}
              className="w-full py-3.5 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md transition-colors min-h-[44px]"
            >
              Continue to Log In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* New Password */}
            <div className="space-y-1.5">
              <label htmlFor="reset-pass" className="block text-sm font-semibold text-navy-950">
                New password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="reset-pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-11 pr-11 py-3 min-h-[44px] rounded-xl border border-slate-200 bg-white text-navy-950 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-navy-950 min-w-[44px] justify-center"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label htmlFor="reset-confirm" className="block text-sm font-semibold text-navy-950">
                Confirm new password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="reset-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full pl-11 pr-11 py-3 min-h-[44px] rounded-xl border border-slate-200 bg-white text-navy-950 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-navy-950 min-w-[44px] justify-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[44px] py-3.5 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-4 border-t border-slate-100 text-center">
              <Link
                to="/auth/login"
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Return to Log In
              </Link>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};
