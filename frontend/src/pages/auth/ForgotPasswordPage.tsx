import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout, BenefitItem } from '../../components/auth/AuthLayout';
import { authApi } from '../../services/auth.api';
import { Mail, ArrowRight, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';

const FORGOT_BENEFITS: BenefitItem[] = [
  {
    icon: 'lock',
    title: 'Secure Account Recovery',
    description:
      'Cryptographically hashed tokens protect your login credentials from unauthorized changes.',
  },
  {
    icon: 'file',
    title: 'Zero Exposure',
    description:
      'We never transmit passwords via plain email. Recovery links expire in 60 minutes.',
  },
  {
    icon: 'users',
    title: 'Family Privacy Intact',
    description: 'Recovery requests only affect personal vault credentials.',
  },
  {
    icon: 'sparkles',
    title: 'Immediate Access',
    description: 'Regain access to your organized medical summaries quickly and safely.',
  },
];

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      setIsSubmitted(true);
      if (res.data?.resetLink) {
        setResetLink(res.data.resetLink);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      heading="Reset Your Password"
      subheading="Enter your registered email address and we will send you secure instructions to reset your password."
      benefits={FORGOT_BENEFITS}
    >
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 lg:p-10 transition-all">
        <div className="space-y-1.5 mb-6">
          <h2 className="text-2xl font-bold text-navy-950 tracking-tight">Forgot Password</h2>
          <p className="text-sm text-slate-500">
            Enter your email to receive a secure recovery link.
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-6 text-center py-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-navy-950">Instructions Sent</h3>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                If an account exists with{' '}
                <strong className="text-navy-950 font-semibold">{email}</strong>, we have dispatched
                password reset instructions.
              </p>
              <p className="text-xs text-slate-500">
                Please check your inbox or spam folder. The link will expire in 60 minutes.
              </p>
            </div>

            {/* Development Preview */}
            {resetLink && (
              <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200 text-left text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-brand-900">
                  <ExternalLink className="w-4 h-4 text-brand-600" />
                  <span>Development Preview Link:</span>
                </div>
                <p className="text-slate-600 break-all bg-white p-2.5 rounded-xl border border-brand-100 font-mono text-[11px]">
                  {resetLink}
                </p>
                <a
                  href={resetLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 text-white font-semibold text-xs hover:bg-brand-600 transition-colors"
                >
                  Open Reset Password Screen (1-Click Dev)
                </a>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100">
              <Link
                to="/auth/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-slate-200 text-navy-950 font-semibold text-sm hover:bg-slate-50 transition-colors min-h-[44px]"
              >
                Return to Log In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="forgot-email" className="block text-sm font-semibold text-navy-950">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-11 pr-4 py-3 min-h-[44px] rounded-xl border border-slate-200 bg-white text-navy-950 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                />
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
                  <span>Send Reset Instructions</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-4 border-t border-slate-100 text-center">
              <Link
                to="/auth/login"
                className="text-xs font-semibold text-brand-600 hover:underline min-h-[32px] inline-flex items-center"
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
