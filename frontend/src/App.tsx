import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { PatientDashboardPage } from './pages/patient/PatientDashboardPage';
import { PatientVaultPage } from './pages/patient/PatientVaultPage';
import { PatientDocumentDetailPage } from './pages/patient/PatientDocumentDetailPage';
import { PatientDocumentIntelligencePage } from './pages/patient/PatientDocumentIntelligencePage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<HomePage />} />

          {/* Authentication & Verification Routes (Phase 2A) */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

          {/* Authenticated Patient Dashboard Shell */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute>
                <PatientDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Personal Health Vault (Phase 2C.1) */}
          <Route
            path="/patient/vault"
            element={
              <ProtectedRoute>
                <PatientVaultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/vault/:documentId"
            element={
              <ProtectedRoute>
                <PatientDocumentDetailPage />
              </ProtectedRoute>
            }
          />
          {/* Document Intelligence Review UI (Phase 2D.1) */}
          <Route
            path="/patient/vault/:documentId/intelligence"
            element={
              <ProtectedRoute>
                <PatientDocumentIntelligencePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/intelligence"
            element={
              <ProtectedRoute>
                <PatientDocumentIntelligencePage />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
