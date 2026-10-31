import React, { useEffect, useRef } from 'react';
import { X, Shield, FileText } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  type: 'terms' | 'privacy';
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, type, onClose }) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeBtnRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isTerms = type === 'terms';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-500 flex items-center justify-center">
              {isTerms ? <FileText className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <h3 id="policy-modal-title" className="text-xl font-bold text-navy-950">
                {isTerms ? 'Terms of Service' : 'Privacy Policy'}
              </h3>
              <p className="text-xs text-slate-500">Effective Date: October 2026</p>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close dialog"
            className="w-10 h-10 rounded-xl text-slate-400 hover:text-navy-950 hover:bg-slate-100 flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto py-6 space-y-4 text-sm text-slate-600 leading-relaxed pr-2">
          {isTerms ? (
            <>
              <h4 className="font-bold text-navy-950 text-base">
                1. Informational Health Service Notice
              </h4>
              <p>
                MediVault AI provides an AI-assisted health document organization and explanation
                platform. The explanations, summaries, and translations provided are strictly
                informational and educational in nature and{' '}
                <strong>do not constitute medical advice</strong>, diagnosis, or treatment. Always
                consult a qualified medical professional for health concerns.
              </p>

              <h4 className="font-bold text-navy-950 text-base">
                2. Patient Account Responsibilities
              </h4>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials
                and for all activities that occur under your account. You agree to immediately
                notify MediVault AI of any unauthorized access or security breach.
              </p>

              <h4 className="font-bold text-navy-950 text-base">3. Acceptable Use</h4>
              <p>
                You agree not to upload fraudulent medical records, malicious files, or materials
                that infringe upon the intellectual property or privacy rights of any third party.
              </p>
            </>
          ) : (
            <>
              <h4 className="font-bold text-navy-950 text-base">
                1. Health Data Protection Commitment
              </h4>
              <p>
                MediVault AI treats personal health information with rigorous confidentiality. We do
                not sell, monetize, or disclose your health reports to advertisers or unauthorized
                third parties.
              </p>

              <h4 className="font-bold text-navy-950 text-base">
                2. Encryption & Security Controls
              </h4>
              <p>
                All data in transit is protected using TLS 1.3 encryption. Passwords and session
                tokens are hashed with memory-hard Argon2id and SHA-256 algorithms. Medical
                documents are stored in dedicated, encrypted health storage vaults.
              </p>

              <h4 className="font-bold text-navy-950 text-base">3. Sharing Permissions</h4>
              <p>
                You retain complete ownership over your health documents. Information is shared with
                family members or verified caregivers only upon your explicit authorization and
                invitation.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors focus-visible:outline-2 focus-visible:outline-brand-500 min-h-[44px]"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
