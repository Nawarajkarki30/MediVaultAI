import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AuthLayout, BenefitItem } from '../../components/auth/AuthLayout';
import { authApi } from '../../services/auth.api';
import { CheckCircle2, AlertCircle, Loader2, Mail, ArrowRight, Send } from 'lucide-react';

const VERIFY_BENEFITS: BenefitItem[] = [
  {
    icon: 'lock',
    title: 'Verified Access',
    description: 'Protecting patient confidentiality through strict identity verification.',
  },
  {
    icon: 'file',
    title: 'Health Record Vault',
    description: 'Your medical files remain isolated and encrypted under your account.',
  },
  {
    icon: 'users',
    title: 'Family Sharing Safeguards',
    description: 'Ensure only verified patients control delegated access.',
  },
  {
    icon: 'sparkles',
    title: 'AI Translation Ready',
    description: 'Begin translating complex lab results into clear Nepali and English.',
  },
];

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manual Resend State
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const executeVerification = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        await authApi.verifyEmail(token);
        if (isMounted) setIsSuccess(true);
      } catch (err) {
        if (isMounted) {
          setErrorMessage(
            (err as Error).message ||
              'This verification link is invalid or has expired. Please request a new link below.'
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    executeVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleManualResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsResending(true);
    setResendMessage(null);
    try {
      const res = await authApi.resendVerification(email.trim());
      setResendMessage(res.message || 'Verification link sent!');
    } catch (err) {
      setResendMessage((err as Error).message || 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      heading="Email Verification"
      subheading="Verify your identity to safeguard your medical documents and health privacy."
      benefits={VERIFY_BENEFITS}
    >
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 lg:p-10 transition-all text-center">
        {/* State 1: Verifying Token with Spinner */}
        {isLoading && (
          <div className="py-12 space-y-4">
            <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-navy-950">Verifying your email...</h2>
            <p className="text-sm text-slate-500">
              Please wait while we validate your secure token.
            </p>
          </div>
        )}

        {/* State 2: Verification Successful */}
        {!isLoading && isSuccess && (
          <div className="py-8 space-y-6 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-navy-950">Email Verified Successfully!</h2>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                Your MediVault AI account is active. You can now log in and access your personal
                health assistance dashboard.
              </p>
            </div>

            <Link
              to="/auth/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md transition-colors min-h-[44px]"
            >
              <span>Continue to Log In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* State 3: Expired / Invalid Token or Manual Request */}
        {!isLoading && !isSuccess && (
          <div className="space-y-6 text-left animate-in fade-in">
            {errorMessage ? (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                <p className="font-medium">{errorMessage}</p>
              </div>
            ) : (
              <div className="space-y-1 text-center">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-brand-500 flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-navy-950">Request Verification Link</h2>
                <p className="text-xs text-slate-500">
                  Enter your email address to receive a fresh verification link.
                </p>
              </div>
            )}

            {resendMessage && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{resendMessage}</span>
              </div>
            )}

            <form onSubmit={handleManualResend} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="verify-email-input"
                  className="block text-sm font-semibold text-navy-950"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="verify-email-input"
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
                disabled={isResending}
                className="w-full py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md transition-colors flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-70"
              >
                {isResending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Verification Link</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center">
              <Link
                to="/auth/login"
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Return to Log In
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};
