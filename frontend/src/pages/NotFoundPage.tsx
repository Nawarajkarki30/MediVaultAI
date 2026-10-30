import React from 'react';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FBFF] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <header className="max-w-6xl mx-auto w-full py-4">
        <Logo size="md" />
      </header>

      <main className="max-w-md mx-auto w-full my-12 bg-white rounded-3xl border border-brand-border p-8 text-center shadow-card">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-500 mx-auto flex items-center justify-center mb-6">
          <FileQuestion className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold text-brand-500 uppercase tracking-wider">
          404 Not Found
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight mt-2 mb-3">
          Page Not Found
        </h1>

        <p className="text-sm text-brand-muted mb-8 leading-relaxed">
          The requested page could not be located. It may have been moved, or it might belong to a
          future development phase.
        </p>

        <Button
          variant="primary"
          size="md"
          to="/"
          icon={<ArrowLeft className="w-4 h-4" />}
          iconPosition="left"
          fullWidth
        >
          Return to Homepage
        </Button>
      </main>

      <footer className="text-center text-xs text-brand-muted py-4">
        &copy; {new Date().getFullYear()} MediVault AI
      </footer>
    </div>
  );
};
