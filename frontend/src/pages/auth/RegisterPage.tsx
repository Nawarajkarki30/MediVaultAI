import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout, BenefitItem } from '../../components/auth/AuthLayout';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/auth.api';
import { PolicyModal } from '../../components/auth/PolicyModal';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Send,
  ExternalLink,
} from 'lucide-react';

const REGISTER_BENEFITS: BenefitItem[] = [
  {
    icon: 'lock',
    title: 'Secure and Private',
    description: 'Your medical information is encrypted and protected.',
  },
  {
    icon: 'file',
    title: 'All Your Reports in One Place',
    description: 'Organize reports, prescriptions, and health documents.',
  },
  {
    icon: 'users',
    title: 'Manage with Family',
    description: 'Share selected information with trusted family members.',
  },
  {
    icon: 'sparkles',
    title: 'AI Explanations',
    description: 'Understand complex medical information in simple English or Nepali.',
  },
];

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();

  // Form State
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Status State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationLink, setVerificationLink] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // Policy Modal State
  const [modalType, setModalType] = useState<'terms' | 'privacy' | null>(null);

  // Password Strength Calculation
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculatePasswordStrength(password);
  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
  const strengthColors = [
    'bg-slate-200',
    'bg-rose-500',
    'bg-amber-500',
    'bg-brand-500',
    'bg-emerald-500',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
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
    if (!agreeToTerms) {
      setErrorMessage('You must agree to the Terms of Service and Privacy Policy to register.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        agreeToTerms,
      });

      if (result.verificationLink) {
        setVerificationLink(result.verificationLink);
      }
      setStep(2);
    } catch (err) {
      setErrorMessage((err as Error).message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const res = await authApi.resendVerification(email);
      setResendStatus(res.message || 'Verification link sent!');
      if (res.data?.verificationLink) {
        setVerificationLink(res.data.verificationLink);
      }
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setResendStatus((err as Error).message || 'Failed to resend email.');
    }
  };

  return (
    <AuthLayout
      heading="Create Your MediVault AI Account"
      subheading="Join MediVault AI to securely manage your medical information and get simple, AI-powered explanations for your health reports."
      benefits={REGISTER_BENEFITS}
    >
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 lg:p-10 transition-all">
        {/* Step Header & Progress Indicator */}
        <div className="flex items-center justify-between mb-6 pb-2">
          <div>
            <h2 className="text-2xl font-bold text-navy-950 tracking-tight">
              {step === 1 ? 'Create an Account' : 'Verify Your Email'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {step === 1
                ? 'Sign up to get started with MediVault AI.'
                : 'Confirm your email address to activate your vault.'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-brand-600 block mb-1.5">Step {step} of 2</span>
            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-brand-500 transition-all duration-300 ${
                  step === 1 ? 'w-1/2' : 'w-full'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Step 1: Registration Form */}
        {step === 1 ? (
          <>
            {/* Error Message Alert */}
            {errorMessage && (
              <div
                className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3 animate-in fade-in"
                role="alert"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                <p className="font-medium">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
              {/* Full Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="register-fullname"
                  className="block text-sm font-semibold text-navy-950"
                >
                  Full name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <input
                    id="register-fullname"
                    type="text"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-11 pr-4 py-3 min-h-[44px] rounded-xl border border-slate-200 bg-white text-navy-950 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-colors"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label
                  htmlFor="register-email"
                  className="block text-sm font-semibold text-navy-950"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="register-email"
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

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="register-password"
                  className="block text-sm font-semibold text-navy-950"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
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

                {/* Password Helper & Strength Meter */}
                <p className="text-xs text-slate-500 pt-0.5">
                  Use at least 8 characters with a mix of letters, numbers, and symbols.
                </p>

                {password.length > 0 && (
                  <div className="pt-1 space-y-1">
                    <div className="flex gap-1 h-1.5">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 rounded-full transition-colors ${
                            strength >= level ? strengthColors[strength] : 'bg-slate-100'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">
                      Strength: {strengthLabels[strength]}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="register-confirm-password"
                  className="block text-sm font-semibold text-navy-950"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-11 pr-11 py-3 min-h-[44px] rounded-xl border border-slate-200 bg-white text-navy-950 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-navy-950 focus-visible:outline-2 focus-visible:outline-brand-500 min-w-[44px] justify-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms and Privacy Checkbox */}
              <div className="pt-1 flex items-start gap-3">
                <input
                  id="agree-terms"
                  type="checkbox"
                  required
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500 focus:ring-2 cursor-pointer"
                />
                <label htmlFor="agree-terms" className="text-xs text-slate-600 leading-snug">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setModalType('terms')}
                    className="text-brand-600 hover:underline font-semibold"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => setModalType('privacy')}
                    className="text-brand-600 hover:underline font-semibold"
                  >
                    Privacy Policy
                  </button>
                  .
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[44px] py-3.5 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
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
                  or sign up with
                </span>
              </div>
            </div>

            {/* Social Buttons (Disabled with Coming Soon as required) */}
            <div className="space-y-3">
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-400 text-sm font-medium flex items-center justify-center gap-3 cursor-not-allowed"
                title="OAuth registration coming in an upcoming release"
              >
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
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-400 text-sm font-medium flex items-center justify-center gap-3 cursor-not-allowed"
                title="OAuth registration coming in an upcoming release"
              >
                <svg className="w-4 h-4 fill-current opacity-50" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-6.3-9.68-11.08-20.73-14.34-33.15-3.26-12.42-4.89-23.77-4.89-34.05 0-14.79 3.8-27.18 11.41-37.16 7.61-9.98 17.18-15.03 28.71-15.15 4.35 0 9.29 1.14 14.82 3.42 5.53 2.28 9.29 3.48 11.28 3.59 1.74 0 5.68-1.25 11.83-3.76 6.15-2.51 11.22-3.64 15.22-3.39 13.92.76 24.81 5.79 32.68 15.08-11.75 7.18-17.47 16.92-17.15 29.23.33 9.68 4.08 17.79 11.25 24.32 7.18 6.53 15.69 10.12 25.53 10.77-2.18 6.53-4.89 13.38-8.15 20.56zM119.22 31.84c0-7.39 2.67-14.24 8.01-20.56 5.34-6.31 11.97-10.45 19.89-12.41.33 1.09.49 2.07.49 2.94 0 7.39-2.78 14.41-8.33 21.05-5.55 6.64-12.29 10.55-20.22 11.75-.43-.98-.65-1.9-.65-2.77z" />
                </svg>
                <span>Continue with Apple</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-200 text-slate-500">
                  Coming soon
                </span>
              </button>
            </div>

            {/* Footer Login Link */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
              <span>Already have an account? </span>
              <Link
                to="/auth/login"
                className="font-bold text-brand-600 hover:text-brand-700 hover:underline min-h-[32px] inline-flex items-center focus-visible:outline-2 focus-visible:outline-brand-500 rounded px-1"
              >
                Log in
              </Link>
            </div>
          </>
        ) : (
          /* Step 2: Email Verification Notice */
          <div className="space-y-6 text-center py-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center mx-auto shadow-inner">
              <Mail className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-navy-950">Check Your Email</h3>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                We sent a secure verification link to{' '}
                <strong className="text-navy-950 font-semibold">{email}</strong>.
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click the link in that email to confirm your identity and access your patient health
                vault.
              </p>
            </div>

            {/* In Development: Direct Verification Link Preview */}
            {verificationLink && (
              <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200 text-left text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-brand-900">
                  <ExternalLink className="w-4 h-4 text-brand-600" />
                  <span>Development Preview Link:</span>
                </div>
                <p className="text-slate-600 break-all bg-white p-2.5 rounded-xl border border-brand-100 font-mono text-[11px]">
                  {verificationLink}
                </p>
                <a
                  href={verificationLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 text-white font-semibold text-xs hover:bg-brand-600 transition-colors"
                >
                  Verify Email Now (1-Click Dev)
                </a>
              </div>
            )}

            {/* Resend Action */}
            <div className="space-y-3 pt-2">
              {resendStatus && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resendStatus}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white text-navy-950 text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
              >
                <Send className="w-4 h-4 text-brand-500" />
                <span>
                  {resendCooldown > 0
                    ? `Resend available in ${resendCooldown}s`
                    : 'Resend Verification Email'}
                </span>
              </button>

              <Link
                to="/auth/login"
                className="block text-xs font-semibold text-brand-600 hover:underline min-h-[36px] py-2"
              >
                Return to Log In
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Policy Modal */}
      {modalType && (
        <PolicyModal isOpen={true} type={modalType} onClose={() => setModalType(null)} />
      )}
    </AuthLayout>
  );
};
