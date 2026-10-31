import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { PatientDashboardPage } from '../pages/patient/PatientDashboardPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// Mock fetch for authApi to avoid real network calls in frontend unit tests
global.fetch = vi.fn().mockImplementation((url: string) => {
  if (url.includes('/api/auth/me')) {
    return Promise.resolve({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ success: false, message: 'Unauthenticated' }),
    });
  }
  if (url.includes('/api/auth/csrf')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, data: { csrfToken: 'mock-csrf' } }),
    });
  }
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true }),
  });
});

describe('MediVault AI Phase 2A Frontend Auth Pages Suite', () => {
  it('renders LoginPage matching the approved wireframe layout', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/auth/login']}>
          <Routes>
            <Route path="/auth/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    // Header & Brand Values
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Welcome Back/i);
    expect(screen.getByText(/Your Health\. Clearer\. Safer\. Together\./i)).toBeInTheDocument();
    expect(screen.getByText(/Secure Access/i)).toBeInTheDocument();
    expect(screen.getByText(/All in One Place/i)).toBeInTheDocument();

    // Form Elements
    expect(
      screen.getByRole('heading', { level: 2, name: /Log in to MediVault AI/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email address$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Log in/i })).toBeInTheDocument();

    // Disabled Social Buttons (Coming soon)
    expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
    expect(screen.getByText(/Continue with Apple/i)).toBeInTheDocument();

    // Medical Disclaimer Notice
    expect(
      screen.getByText(/is an informational tool and does not provide medical advice/i)
    ).toBeInTheDocument();
  });

  it('toggles password visibility on LoginPage', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/auth/login']}>
          <Routes>
            <Route path="/auth/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const toggleButton = screen.getByLabelText(/Show password/i);

    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle to reveal password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click toggle again to hide password
    fireEvent.click(screen.getByLabelText(/Hide password/i));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('renders RegisterPage matching the approved wireframe layout with Step 1 of 2', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/auth/register']}>
          <Routes>
            <Route path="/auth/register" element={<RegisterPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    // Left Column
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Create Your MediVault AI Account/i
    );
    expect(screen.getByText(/Secure and Private/i)).toBeInTheDocument();
    expect(screen.getByText(/All Your Reports in One Place/i)).toBeInTheDocument();
    expect(screen.getByText(/Manage with Family/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Explanations/i)).toBeInTheDocument();

    // Form Header & Step Indicator
    expect(
      screen.getByRole('heading', { level: 2, name: /Create an Account/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 2/i)).toBeInTheDocument();

    // Form Inputs
    expect(screen.getByLabelText(/^Full name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email address$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirm password$/i)).toBeInTheDocument();

    // Terms Checkbox & Policy Links
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Terms of Service/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Privacy Policy/i })).toBeInTheDocument();

    // CTA
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('opens and closes PolicyModal when clicking Terms of Service', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/auth/register']}>
          <Routes>
            <Route path="/auth/register" element={<RegisterPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    const termsBtn = screen.getByRole('button', { name: /Terms of Service/i });
    fireEvent.click(termsBtn);

    // Modal should be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /Terms of Service/i })
    ).toBeInTheDocument();

    // Dismiss modal
    const closeBtn = screen.getByRole('button', { name: /I Understand/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('validates password mismatch on registration', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/auth/register']}>
          <Routes>
            <Route path="/auth/register" element={<RegisterPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter your full name/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText(/your@email\.com/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Create a password/i), {
      target: { value: 'ValidPassword123!' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Confirm your password/i), {
      target: { value: 'MismatchPassword999!' },
    });
    fireEvent.click(screen.getByRole('checkbox'));

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/Passwords do not match/i);
  });

  it('redirects unauthenticated users attempting to access /patient/dashboard to /auth/login', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/patient/dashboard']}>
          <Routes>
            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoute>
                  <PatientDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/auth/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    // Wait for session check to complete and navigate to /auth/login
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Welcome Back/i);
    });
  });
});
