import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { NotFoundPage } from '../pages/NotFoundPage';

describe('MediVault AI Frontend Routing Tests', () => {
  it('renders HomePage at root path "/"', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Your Personal Health Information/i
    );
  });

  it('renders LoginPage at "/auth/login"', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/auth/login']}>
          <Routes>
            <Route path="/auth/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Welcome Back/i);
    expect(
      screen.getByRole('heading', { level: 2, name: /Log in to MediVault AI/i })
    ).toBeInTheDocument();
  });

  it('renders RegisterPage at "/auth/register"', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/auth/register']}>
          <Routes>
            <Route path="/auth/register" element={<RegisterPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Create Your MediVault AI Account/i
    );
    expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
  });

  it('renders NotFoundPage for unknown routes', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/unknown-route-test']}>
          <Routes>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Page Not Found/i);
    expect(screen.getByText(/Return to Homepage/i)).toBeInTheDocument();
  });
});
