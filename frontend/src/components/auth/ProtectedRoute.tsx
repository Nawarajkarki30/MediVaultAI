import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireVerified?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireVerified = true,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-brand-bg px-4"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-500 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Verifying security session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (requireVerified && !user.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-navy-950 mb-2">Email Verification Required</h2>
          <p className="text-sm text-slate-600 mb-6">
            To protect sensitive health information, MediVault AI requires you to verify your email
            before accessing patient dashboards.
          </p>
          <Navigate to="/auth/verify-email" replace />
        </div>
      </div>
    );
  }

  return children;
};
