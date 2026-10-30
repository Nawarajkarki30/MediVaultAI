import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { AuthPlaceholderPage } from '../pages/AuthPlaceholderPage';
import { NotFoundPage } from '../pages/NotFoundPage';

describe('MediVault AI Frontend Routing Tests', () => {
  it('renders HomePage at root path "/"', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Your Personal Health Information/i
    );
  });

  it('renders AuthPlaceholderPage at "/auth/login"', () => {
    render(
      <MemoryRouter initialEntries={['/auth/login']}>
        <Routes>
          <Route path="/auth/login" element={<AuthPlaceholderPage mode="login" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Account Log In/i);
    expect(screen.getByText(/Phase 1 Prototype — Coming Soon/i)).toBeInTheDocument();
    expect(screen.getByText(/Nonfunctional Placeholder Notice/i)).toBeInTheDocument();
  });

  it('renders AuthPlaceholderPage at "/auth/register"', () => {
    render(
      <MemoryRouter initialEntries={['/auth/register']}>
        <Routes>
          <Route path="/auth/register" element={<AuthPlaceholderPage mode="register" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Create an Account/i);
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
  });

  it('renders NotFoundPage for unknown routes', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-route-test']}>
        <Routes>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Page Not Found/i);
    expect(screen.getByText(/Return to Homepage/i)).toBeInTheDocument();
  });
});
