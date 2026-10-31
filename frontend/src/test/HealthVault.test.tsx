// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PatientVaultPage } from '../pages/patient/PatientVaultPage';
import { PatientDocumentDetailPage } from '../pages/patient/PatientDocumentDetailPage';
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

const renderVault = (initialEntries = ['/patient/vault']) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/patient/vault" element={<PatientVaultPage />} />
          <Route path="/patient/vault/:documentId" element={<PatientDocumentDetailPage />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('MediVault AI — Phase 2C.1 Personal Health Vault Frontend Suite', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('1. renders the Health Vault header, subtitle, privacy tag and Upload button', () => {
    renderVault();

    expect(screen.getByRole('heading', { level: 1, name: /My Health Vault/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Your medical documents, organized in one place/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Private\. Organized\. In Your Control\./i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload Document/i })).toBeInTheDocument();
  });

  it('2. displays the demonstration disclaimer banner and allows dismissing it', () => {
    renderVault();

    expect(
      screen.getByText(/This is a demonstration view with sample documents/i)
    ).toBeInTheDocument();

    const dismissBtn = screen.getByRole('button', { name: /Dismiss demo notice/i });
    fireEvent.click(dismissBtn);

    expect(
      screen.queryByText(/This is a demonstration view with sample documents/i)
    ).not.toBeInTheDocument();
  });

  it('3. renders all 12 synthetic documents matching wireframe category counts', () => {
    renderVault();

    // Wireframe category filter chips with counts
    expect(screen.getByRole('button', { name: /All.*12/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Laboratory Reports.*4/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Prescriptions.*2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Imaging Reports.*2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Discharge Summaries.*2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Consultation Notes.*1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Other.*1/i })).toBeInTheDocument();

    // Verify key documents are rendered in cards
    expect(screen.getByText('Blood Test Report')).toBeInTheDocument();
    expect(screen.getByText('Chest X-Ray')).toBeInTheDocument();
    expect(screen.getByText('MRI Brain Scan')).toBeInTheDocument();
    expect(screen.getByText('Vaccination Record')).toBeInTheDocument();
  });

  it('4. filters documents by category when clicking category chip', () => {
    renderVault();

    const imagingChip = screen.getByRole('button', { name: /Imaging Reports.*2/i });
    fireEvent.click(imagingChip);

    // Imaging reports must be visible
    expect(screen.getByText('Chest X-Ray')).toBeInTheDocument();
    expect(screen.getByText('MRI Brain Scan')).toBeInTheDocument();

    // Lab report must not be visible
    expect(screen.queryByText('Blood Test Report')).not.toBeInTheDocument();
    expect(screen.queryByText('Vaccination Record')).not.toBeInTheDocument();
  });

  it('5. searches documents dynamically across title, facility, and keywords', () => {
    renderVault();

    const searchInput = screen.getByRole('searchbox', {
      name: /Search documents in Health Vault/i,
    });
    fireEvent.change(searchInput, { target: { value: 'Metro Hospital' } });

    // MRI Brain Scan is from Metro Hospital
    expect(screen.getByText('MRI Brain Scan')).toBeInTheDocument();
    expect(screen.queryByText('Blood Test Report')).not.toBeInTheDocument();
  });

  it('6. toggles between Grid and List view presentation modes', () => {
    renderVault();

    // Default is Grid view
    const gridBtn = screen.getAllByRole('button', { name: /Grid view/i })[0];
    expect(gridBtn).toHaveAttribute('aria-pressed', 'true');

    // Switch to List view
    const listBtn = screen.getAllByRole('button', { name: /List view/i })[0];
    fireEvent.click(listBtn);

    expect(listBtn).toHaveAttribute('aria-pressed', 'true');
    // In list view table headers are present
    expect(screen.getByText('Document Name')).toBeInTheDocument();
    expect(screen.getByText('Document Date')).toBeInTheDocument();
  });

  it('7. filters documents by file type dropdown', () => {
    renderVault();

    const fileTypeSelect = screen.getByLabelText(/All File Types/i);
    fireEvent.change(fileTypeSelect, { target: { value: 'JPG' } });

    // Chest X-Ray is JPG
    expect(screen.getByText('Chest X-Ray')).toBeInTheDocument();
    expect(screen.queryByText('Blood Test Report')).not.toBeInTheDocument();
    expect(screen.queryByText('MRI Brain Scan')).not.toBeInTheDocument();
  });

  it('8. filters documents by processing status dropdown', () => {
    renderVault();

    const statusSelect = screen.getByLabelText(/All Status/i);
    fireEvent.change(statusSelect, { target: { value: 'not-available' } });

    // Pediatric Dental Slip has status not-available
    expect(screen.getByText('Pediatric Dental Slip')).toBeInTheDocument();
    expect(screen.queryByText('Blood Test Report')).not.toBeInTheDocument();
  });

  it('9. opens Upload Modal and displays prototype validation notice', () => {
    renderVault();

    const uploadBtn = screen.getByRole('button', { name: /Upload Document/i });
    fireEvent.click(uploadBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByText(/Drag and drop your file here/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Supported files: PDF, PNG, JPG, JPEG/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Maximum file size: 10 MB/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This is a prototype demonstration/i)
    ).toBeInTheDocument();
  });

  it('10. rejects oversized files in Upload Modal (>10MB)', () => {
    renderVault();

    const uploadBtn = screen.getByRole('button', { name: /Upload Document/i });
    fireEvent.click(uploadBtn);

    const fileInput = screen.getByTestId('vault-file-input');
    const largeFile = new File(['a'.repeat(1024)], 'huge-scan.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    expect(
      screen.getByText(/File exceeds the 10 MB limit/i)
    ).toBeInTheDocument();
  });

  it('11. rejects unsupported file formats in Upload Modal (.exe, .zip)', () => {
    renderVault();

    const uploadBtn = screen.getByRole('button', { name: /Upload Document/i });
    fireEvent.click(uploadBtn);

    const fileInput = screen.getByTestId('vault-file-input');
    const badFile = new File(['test'], 'malware.exe', { type: 'application/x-msdownload' });

    fireEvent.change(fileInput, { target: { files: [badFile] } });

    expect(
      screen.getByText(/Unsupported file type/i)
    ).toBeInTheDocument();
  });

  it('12. opens Document Action Menu and allows renaming document title', () => {
    renderVault();

    const actionBtns = screen.getAllByRole('button', { name: /Options for /i });
    fireEvent.click(actionBtns[0]);

    // Click "Edit Title (Demo)"
    const editTitleOption = screen.getByRole('button', { name: /Edit Title/i });
    fireEvent.click(editTitleOption);

    expect(screen.getByRole('heading', { level: 2, name: /Edit Title/i })).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Document Name/i);
    fireEvent.change(titleInput, { target: { value: 'Updated Comprehensive Panel' } });

    const saveBtn = screen.getByRole('button', { name: /^Save$/i });
    fireEvent.click(saveBtn);

    // Document title updated in view
    expect(screen.getByText('Updated Comprehensive Panel')).toBeInTheDocument();
  });

  it('13. allows changing category via Change Category modal', () => {
    renderVault();

    const actionBtns = screen.getAllByRole('button', { name: /Options for /i });
    fireEvent.click(actionBtns[0]);

    const changeCatOption = screen.getByRole('button', { name: /Change Category/i });
    fireEvent.click(changeCatOption);

    expect(screen.getByRole('heading', { level: 2, name: /Change Category/i })).toBeInTheDocument();

    const select = screen.getByLabelText(/Select Category/i);
    fireEvent.change(select, { target: { value: 'other' } });

    const applyBtn = screen.getByRole('button', { name: /^Apply$/i });
    fireEvent.click(applyBtn);

    // Category count for Other increases to 2
    expect(screen.getByRole('button', { name: /Other.*2/i })).toBeInTheDocument();
  });

  it('14. allows deleting document with confirmation', () => {
    renderVault();

    const actionBtns = screen.getAllByRole('button', { name: /Options for /i });
    fireEvent.click(actionBtns[0]);

    const deleteOption = screen.getByRole('button', { name: /Delete Document/i });
    fireEvent.click(deleteOption);

    expect(screen.getByRole('heading', { level: 2, name: /Delete Document/i })).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /^Delete Document$/i });
    fireEvent.click(confirmBtn);

    // Count decreases from 12 to 11
    expect(screen.getByRole('button', { name: /All.*11/i })).toBeInTheDocument();
  });

  it('15. renders Document Detail page at /patient/vault/:documentId with viewer, metadata, and editable notes', async () => {
    renderVault(['/patient/vault/doc-01']);

    expect(screen.getByText('Blood Test Report')).toBeInTheDocument();
    expect(screen.getAllByText('City Medical Center').length).toBeGreaterThan(0);
    expect(screen.getByText('Laboratory Reports')).toBeInTheDocument();
    expect(screen.getByText('Reviewed')).toBeInTheDocument();

    // Notes textarea
    const notesInput = screen.getByPlaceholderText(/Add your personal notes about this document\.\.\./i);
    expect(notesInput).toBeInTheDocument();

    fireEvent.change(notesInput, { target: { value: 'Fasting glucose was within range.' } });
    const saveNoteBtn = screen.getByRole('button', { name: /Save Note/i });
    fireEvent.click(saveNoteBtn);

    expect((await screen.findAllByText(/Note updated/i)).length).toBeGreaterThan(0);
  });
});