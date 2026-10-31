// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PatientDashboardPage } from '../pages/patient/PatientDashboardPage';
import { AuthContext, AuthContextType } from '../contexts/AuthContext';
import { SafeUser } from '../types/auth';

const mockUser: SafeUser = {
  id: 'usr-12345',
  fullName: 'Sita Sharma',
  email: 'sita.sharma@example.com',
  role: 'PATIENT',
  emailVerified: true,
  emailVerifiedAt: '2026-10-31T00:00:00.000Z',
  createdAt: '2026-10-31T00:00:00.000Z',
  updatedAt: '2026-10-31T00:00:00.000Z',
};

const mockAuthContext: AuthContextType = {
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
};

const renderWithAuth = (ui: React.ReactElement) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      <MemoryRouter initialEntries={['/patient/dashboard']}>{ui}</MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('MediVault AI — Phase 2B Patient Dashboard Frontend Suite', () => {
  it('1. renders the Welcome Hero with time-appropriate greeting and authenticated patient name', () => {
    renderWithAuth(<PatientDashboardPage />);

    // Greeting contains user's first name: Sita
    expect(screen.getByRole('heading', { level: 1, name: /Sita/i })).toBeInTheDocument();

    expect(
      screen.getByText(/Your health information, organized in one secure place/i)
    ).toBeInTheDocument();

    expect(screen.getAllByRole('button', { name: /Upload Report/i })[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Explore My Vault/i })).toBeInTheDocument();
  });

  it('2. renders the three Summary Cards matching wireframe metrics', () => {
    renderWithAuth(<PatientDashboardPage />);

    expect(screen.getByText(/My Medical Reports/i)).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();

    expect(screen.getByText(/Shared With Family/i)).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    expect(screen.getAllByText(/AI Explanations/i).length).toBeGreaterThan(0);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('3. renders Recent Medical Reports table with synthetic reports', () => {
    renderWithAuth(<PatientDashboardPage />);

    expect(
      screen.getByRole('heading', { level: 2, name: /Recent Medical Reports/i })
    ).toBeInTheDocument();

    // Verify synthetic demonstration documents are present
    expect(screen.getAllByText('Blood Test Report')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Chest X-Ray')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Prescription')[0]).toBeInTheDocument();
    expect(screen.getAllByText('General Health Checkup')[0]).toBeInTheDocument();
  });

  it('4. filters reports when category filter button is clicked', () => {
    renderWithAuth(<PatientDashboardPage />);

    // Click "Blood Tests" filter button
    const bloodTestsBtn = screen.getByRole('button', { name: /^Blood Tests$/i });
    fireEvent.click(bloodTestsBtn);

    // Blood Test should be visible
    expect(screen.getAllByText('Blood Test Report')[0]).toBeInTheDocument();

    // Chest X-Ray should not be visible when filtered to Blood Tests
    expect(screen.queryByText('Chest X-Ray')).not.toBeInTheDocument();
  });

  it('5. searches reports dynamically using the search bar', () => {
    renderWithAuth(<PatientDashboardPage />);

    const searchInput = screen.getByLabelText(/Search medical reports/i);
    fireEvent.change(searchInput, { target: { value: 'Chest X-Ray' } });

    expect(screen.getAllByText('Chest X-Ray')[0]).toBeInTheDocument();
    expect(screen.queryByText('Sunrise Clinic')).not.toBeInTheDocument();
  });

  it('6. opens and closes DemoReportModal when clicking View on a report', () => {
    renderWithAuth(<PatientDashboardPage />);

    const viewButtons = screen.getAllByRole('button', { name: /^View$/i });
    fireEvent.click(viewButtons[0]);

    // Modal dialog title should appear
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Medical Report Preview \(Demonstration\)/i)).toBeInTheDocument();

    // Close modal via first close button (X)
    const closeBtns = screen.getAllByRole('button', { name: /Close/i });
    fireEvent.click(closeBtns[0]);

    expect(screen.queryByText(/Medical Report Preview \(Demonstration\)/i)).not.toBeInTheDocument();
  });

  it('7. opens and dismisses DemoUploadModal when clicking Upload Report', () => {
    renderWithAuth(<PatientDashboardPage />);

    const uploadBtns = screen.getAllByRole('button', { name: /Upload Report/i });
    fireEvent.click(uploadBtns[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Upload Medical Report \(Demonstration\)/i)).toBeInTheDocument();

    const closeBtns = screen.getAllByRole('button', { name: /Close/i });
    fireEvent.click(closeBtns[0]);

    expect(screen.queryByText(/Upload Medical Report \(Demonstration\)/i)).not.toBeInTheDocument();
  });

  it('8. opens InviteFamilyModal when clicking Invite Family', () => {
    renderWithAuth(<PatientDashboardPage />);

    const inviteBtn = screen.getByRole('button', { name: /Invite Family/i });
    fireEvent.click(inviteBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Invite Trusted Family Member \(Demonstration\)/i)).toBeInTheDocument();

    const closeBtns = screen.getAllByRole('button', { name: /Close/i });
    fireEvent.click(closeBtns[0]);

    expect(
      screen.queryByText(/Invite Trusted Family Member \(Demonstration\)/i)
    ).not.toBeInTheDocument();
  });

  it('9. toggles language in the AI Explanation Preview between English and Nepali', () => {
    renderWithAuth(<PatientDashboardPage />);

    // Initially English excerpt
    expect(
      screen.getByText(/This report checks important things like your blood sugar/i)
    ).toBeInTheDocument();

    // Click Nepali toggle
    const nepaliPill = screen.getByRole('button', { name: /^नेपाली$/i });
    fireEvent.click(nepaliPill);

    // Nepali excerpt should be visible
    expect(screen.getByText(/यो रिपोर्टले तपाईंको रगतमा चिनीको मात्रा/i)).toBeInTheDocument();
  });

  it('10. renders Quick Actions matching wireframe', () => {
    renderWithAuth(<PatientDashboardPage />);

    expect(screen.getByRole('heading', { level: 2, name: /Quick Actions/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Find Caregiver/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^AI Explanation$/i })).toBeInTheDocument();
  });

  it('11. renders Family Sharing overview with synthetic relatives', () => {
    renderWithAuth(<PatientDashboardPage />);

    expect(screen.getByRole('heading', { level: 2, name: /Family Sharing/i })).toBeInTheDocument();
    expect(screen.getByText('Ramesh')).toBeInTheDocument();
    expect(screen.getByText('Father')).toBeInTheDocument();
    expect(screen.getByText('Anita')).toBeInTheDocument();
    expect(screen.getByText('Pawan')).toBeInTheDocument();
  });

  it('12. displays medical disclaimers prominently without unsubstantiated claims', () => {
    renderWithAuth(<PatientDashboardPage />);

    expect(
      screen.getAllByText(
        /AI explanations are informational only and do not replace professional medical advice/i
      )[0]
    ).toBeInTheDocument();
  });
});
