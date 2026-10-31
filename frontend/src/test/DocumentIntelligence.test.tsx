// @vitest-environment jsdom
// frontend/src/test/DocumentIntelligence.test.tsx
// MediVault AI — Phase 2D.1 Document Intelligence Review UI Test Suite

import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PatientDocumentIntelligencePage } from '../pages/patient/PatientDocumentIntelligencePage';
import { PatientVaultPage } from '../pages/patient/PatientVaultPage';
import { PatientDocumentDetailPage } from '../pages/patient/PatientDocumentDetailPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { AuthContext, AuthContextType } from '../contexts/AuthContext';
import { SafeUser } from '../types/auth';

const mockUser: SafeUser = {
  id: 'usr-12345',
  fullName: 'John Doe',
  email: 'john.doe@example.com',
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

const unauthenticatedContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
};

const renderIntelligence = (
  initialEntries = ['/patient/vault/doc-01/intelligence'],
  authContext = mockAuthContext
) => {
  return render(
    <AuthContext.Provider value={authContext}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/patient/vault" element={<PatientVaultPage />} />
          <Route path="/patient/vault/:documentId" element={<PatientDocumentDetailPage />} />
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
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('MediVault AI — Phase 2D.1 Document Intelligence Review UI Suite', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.clearAllMocks();
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    window.URL.revokeObjectURL = vi.fn();
    HTMLAnchorElement.prototype.click = vi.fn();
  });

  // 1. Core Route and Protected Access
  it('1. renders the Document Intelligence page with title, beta badge, and breadcrumb link', () => {
    renderIntelligence();

    expect(
      screen.getByRole('heading', { level: 1, name: /Document Intelligence/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Beta/i).length).toBeGreaterThan(0);
    expect(screen.getByTestId('back-to-vault-link')).toBeInTheDocument();
  });

  it('2. redirects unauthenticated user from intelligence route to login', () => {
    renderIntelligence(['/patient/vault/doc-01/intelligence'], unauthenticatedContext);

    // ProtectedRoute redirects to /auth/login
    expect(screen.getByRole('heading', { level: 1, name: /Welcome back/i })).toBeInTheDocument();
  });

  // 2. Desktop Wireframe 3-Panel Rendering
  it('3. renders all 3 panels of the approved wireframe: Original Document, Extracted Information, and Review & Validation', () => {
    renderIntelligence();

    expect(screen.getAllByTestId('original-document-panel')[0]).toBeInTheDocument();
    expect(screen.getByTestId('extracted-fields-panel')).toBeInTheDocument();
    expect(screen.getByTestId('review-summary-panel')).toBeInTheDocument();
  });

  // 3. Original Document Panel Navigation & Zoom
  it('4. displays synthetic document canvas on Page 1 (CBC & Lipid Profile) and supports page navigation', () => {
    renderIntelligence();

    const canvas = screen.getAllByTestId('document-page-canvas-1')[0];
    expect(canvas).toBeInTheDocument();
    expect(within(canvas).getByText(/CITY MEDICAL CENTER/i)).toBeInTheDocument();
    expect(within(canvas).getByText(/Complete Blood Count \(CBC\)/i)).toBeInTheDocument();
    expect(within(canvas).getByText(/Lipid Profile/i)).toBeInTheDocument();

    // Check page indicator
    expect(screen.getAllByTestId('page-indicator')[0]).toHaveTextContent('1 / 3');

    // Click Next Page button
    const nextBtn = screen.getAllByTestId('next-page-btn')[0];
    fireEvent.click(nextBtn);

    // Should now show page 2 canvas (Prescriptions)
    expect(screen.getAllByTestId('document-page-canvas-2')[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Outpatient Prescription Sheet/i).length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('page-indicator')[0]).toHaveTextContent('2 / 3');

    // Click Page 3 thumbnail
    const thumb3 = screen.getAllByTestId('page-thumbnail-3')[0];
    fireEvent.click(thumb3);
    expect(screen.getAllByTestId('document-page-canvas-3')[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Dr\. Sarah Smith, MD/i).length).toBeGreaterThan(0);
  });

  it('5. adjusts document canvas zoom level using zoom in and zoom out controls', () => {
    renderIntelligence();

    const zoomInBtn = screen.getAllByTestId('zoom-in-btn')[0];
    const zoomOutBtn = screen.getAllByTestId('zoom-out-btn')[0];

    expect(screen.getAllByText('100%')[0]).toBeInTheDocument();

    fireEvent.click(zoomInBtn);
    expect(screen.getAllByText('110%')[0]).toBeInTheDocument();

    fireEvent.click(zoomOutBtn);
    expect(screen.getAllByText('100%')[0]).toBeInTheDocument();
  });

  // 4. Extracted Fields Panel Content & Tabs
  it('6. displays demo disclaimer banner, Needs Review status badge, and structured patient info', () => {
    renderIntelligence();

    expect(
      screen.getByText(/This is a demonstration of document intelligence using synthetic data/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId('review-status-badge')).toHaveTextContent(/Needs Review/i);

    // Patient info card
    expect(screen.getByTestId('meta-row-fullName')).toHaveTextContent(/John Doe/i);
    expect(screen.getByTestId('meta-row-dateOfBirth')).toHaveTextContent(/15 Jan 1995/i);
    expect(screen.getByTestId('meta-row-patientId')).toHaveTextContent(/MC123456/i);
  });

  it('7. displays extracted lab results table with confidence pills and source references', () => {
    renderIntelligence();

    expect(screen.getByTestId('lab-results-table')).toBeInTheDocument();
    expect(screen.getByTestId('lab-row-lab-hb')).toHaveTextContent(/Hemoglobin/i);
    expect(screen.getByTestId('lab-row-lab-hb')).toHaveTextContent(/14\.2/i);
    expect(screen.getByTestId('lab-row-lab-hb')).toHaveTextContent(/13\.0 - 17\.0/i);
    expect(screen.getByTestId('lab-row-lab-hb')).toHaveTextContent(/g\/dL/i);

    // Click source reference for Page 1
    const sourceRef = screen.getAllByTestId('source-ref-page-1')[0];
    fireEvent.click(sourceRef);
    expect(screen.getAllByTestId('page-indicator')[0]).toHaveTextContent('1 / 3');
  });

  it('8. renders the critical medication safety warning alert box', () => {
    renderIntelligence();

    const alert = screen.getByTestId('medication-warning-alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(
      /The medication information may be incomplete or unclear\. Please verify with the original document and consult a healthcare professional/i
    );
  });

  it('9. switches between tabs: Summary, Lab Results, Medications, Doctor & Facility, and Raw JSON', () => {
    renderIntelligence();

    // Switch to Labs tab
    fireEvent.click(screen.getByTestId('tab-labs'));
    expect(screen.getByTestId('tab-content-labs')).toBeInTheDocument();

    // Switch to Meds tab
    fireEvent.click(screen.getByTestId('tab-meds'));
    expect(screen.getByTestId('tab-content-meds')).toBeInTheDocument();
    expect(screen.getByText(/Amoxicillin/i)).toBeInTheDocument();

    // Switch to Facility tab
    fireEvent.click(screen.getByTestId('tab-facility'));
    expect(screen.getByTestId('tab-content-facility')).toBeInTheDocument();
    expect(
      within(screen.getByTestId('tab-content-facility')).getByText(/City Medical Center/i)
    ).toBeInTheDocument();

    // Switch to Raw JSON tab
    fireEvent.click(screen.getByTestId('tab-raw'));
    expect(screen.getByTestId('tab-content-raw')).toBeInTheDocument();
    expect(screen.getByText(/Copy to Clipboard/i)).toBeInTheDocument();
  });

  // 5. Field Correction Dialog & Local State Editing
  it('10. opens field correction modal, edits a lab value, and updates local state with visual strikethrough', () => {
    renderIntelligence();

    const editBtn = screen.getByTestId('edit-lab-lab-hb');
    fireEvent.click(editBtn);

    // Modal opens
    expect(screen.getByTestId('field-correction-dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Edit Extracted Field/i })).toBeInTheDocument();
    expect(
      screen.getByText(/This is a demo correction and will not be permanently saved/i)
    ).toBeInTheDocument();

    const input = screen.getByTestId('edit-field-input');
    expect(input).toHaveValue('14.2');

    // Change value and add reason
    fireEvent.change(input, { target: { value: '14.0' } });
    const reasonInput = screen.getByTestId('edit-field-reason-input');
    fireEvent.change(reasonInput, { target: { value: 'OCR printout artifact' } });

    // Save correction
    fireEvent.click(screen.getByTestId('save-correction-btn'));

    // Modal closed
    expect(screen.queryByTestId('field-correction-dialog')).not.toBeInTheDocument();

    // Table now reflects corrected value with original strikethrough
    const row = screen.getByTestId('lab-row-lab-hb');
    expect(row).toHaveTextContent('14.0');
    expect(row).toHaveTextContent('14.2');

    // Toast notification appeared
    expect(screen.getByTestId('toast-notification')).toHaveTextContent(
      /Correction saved in local session/i
    );
  });

  it('11. prompts confirmation when discarding unsaved edits in correction dialog', () => {
    renderIntelligence();

    fireEvent.click(screen.getByTestId('edit-lab-lab-hb'));
    const input = screen.getByTestId('edit-field-input');
    fireEvent.change(input, { target: { value: '99.9' } });

    // Click cancel
    fireEvent.click(screen.getByTestId('cancel-correction-btn'));

    // Discard warning appears
    const discardDialog = screen.getByTestId('confirm-discard-dialog');
    expect(discardDialog).toBeInTheDocument();
    expect(
      within(discardDialog).getByRole('heading', { name: /Unsaved Corrections/i })
    ).toBeInTheDocument();

    // Click Discard
    fireEvent.click(screen.getByTestId('discard-changes-btn'));
    expect(screen.queryByTestId('field-correction-dialog')).not.toBeInTheDocument();
  });

  // 6. Review Progress & Checklist Panel
  it('12. displays review progress bar and allows checking/unchecking checklist items in local state', () => {
    renderIntelligence();

    expect(screen.getByTestId('review-progress-card')).toHaveTextContent(/Review Progress/i);
    expect(screen.getByTestId('review-progress-card')).toHaveTextContent('43%');

    // Checklist item
    const medChecklist = screen.getByTestId('checklist-item-chk-3');
    const checkbox = within(medChecklist).getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('13. renders attention items with high/medium severity alerts', () => {
    renderIntelligence();

    expect(screen.getByTestId('attention-items-section')).toBeInTheDocument();
    expect(screen.getByTestId('attention-item-att-med')).toHaveTextContent(
      /Medication information has low confidence/i
    );
    expect(screen.getByTestId('attention-item-att-ldl')).toHaveTextContent(
      /LDL reference range unclear/i
    );
  });

  // 7. Demonstration State Variations
  it('14. switches dynamically to Unprocessed state via the state selector', () => {
    renderIntelligence();

    const selector = screen.getByTestId('demo-state-selector');
    fireEvent.change(selector, { target: { value: 'unprocessed' } });

    expect(screen.getByTestId('review-status-badge')).toHaveTextContent(/Not Processed/i);
    expect(screen.getByText(/No laboratory metrics were extracted/i)).toBeInTheDocument();
  });

  it('15. switches to Preview Unavailable state and renders fallback card instead of canvas', () => {
    renderIntelligence(['/patient/vault/doc-01/intelligence?state=preview-unavailable']);

    expect(screen.getAllByTestId('preview-unavailable-card')[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Preview Unavailable/i)[0]).toBeInTheDocument();
  });

  it('16. switches to Ambiguous Medication state and shows qualified review required alert', () => {
    renderIntelligence(['/patient/vault/doc-01/intelligence?state=ambiguous-med']);

    expect(screen.getByTestId('review-status-badge')).toHaveTextContent(
      /Qualified Review Required/i
    );
    expect(screen.getByTestId('attention-item-att-high-risk')).toHaveTextContent(
      /Qualified Clinical Review Required/i
    );
  });

  it('17. switches to Unreadable state and shows illegible handwriting notice', () => {
    renderIntelligence(['/patient/vault/doc-01/intelligence?state=unreadable']);

    expect(screen.getByTestId('review-status-badge')).toHaveTextContent(/Unable to Read/i);
    expect(screen.getByTestId('attention-item-att-unread')).toHaveTextContent(
      /Handwritten prescription unreadable/i
    );
  });

  // 8. Mobile Workflow
  it('18. supports mobile tab switching between Original, Extracted, and Review screens', () => {
    renderIntelligence();

    // Mobile tabs are present
    expect(screen.getByTestId('mobile-review-tabs')).toBeInTheDocument();

    // Switch to Extracted tab
    fireEvent.click(screen.getByTestId('mobile-tab-extracted'));
    expect(screen.getByTestId('mobile-screen-extracted')).toBeInTheDocument();

    // Switch to Review tab
    fireEvent.click(screen.getByTestId('mobile-tab-review'));
    expect(screen.getByTestId('mobile-screen-review')).toBeInTheDocument();

    // Switch back to Original tab
    fireEvent.click(screen.getByTestId('mobile-tab-original'));
    expect(screen.getByTestId('mobile-screen-original')).toBeInTheDocument();

    // Click CTA on mobile overview: "View Extracted Information"
    const cta = screen.getByTestId('mobile-view-extracted-btn');
    fireEvent.click(cta);
    expect(screen.getByTestId('mobile-screen-extracted')).toBeInTheDocument();
  });

  // 9. Document Actions
  it('19. triggers synthetic file download from document actions', () => {
    renderIntelligence();

    const downloadBtn = screen.getAllByTestId('action-download-original')[0];
    fireEvent.click(downloadBtn);

    expect(screen.getByTestId('toast-notification')).toHaveTextContent(
      /Downloaded synthetic demonstration file/i
    );
  });
});
