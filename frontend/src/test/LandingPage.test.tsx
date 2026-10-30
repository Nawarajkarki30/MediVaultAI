import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('MediVault AI Landing Page UI Tests', () => {
  it('renders the main brand headline matching approved wireframe', () => {
    render(<App />);

    // Check main headline
    const headline = screen.getByRole('heading', { level: 1 });
    expect(headline).toBeInTheDocument();
    expect(headline).toHaveTextContent(/Your Personal Health Information/i);
    expect(headline).toHaveTextContent(/Made Simple with AI/i);

    // Check eyebrow pill
    expect(screen.getByText(/Your Health\. Clearer\. Safer\. Together\./i)).toBeInTheDocument();
  });

  it('renders key navigation items in the header', () => {
    render(<App />);

    expect(screen.getAllByText('Home')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Features')[0]).toBeInTheDocument();
    expect(screen.getAllByText('How It Works')[0]).toBeInTheDocument();
    expect(screen.getAllByText('For Families')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Caregivers')[0]).toBeInTheDocument();
    expect(screen.getAllByText('About')[0]).toBeInTheDocument();
  });

  it('renders the interactive dashboard preview with synthetic report cards', () => {
    render(<App />);

    expect(screen.getByText('Welcome, User')).toBeInTheDocument();
    expect(screen.getByText('Medical Reports')).toBeInTheDocument();
    expect(screen.getByText('Family Members')).toBeInTheDocument();
    expect(screen.getAllByText('Caregivers').length).toBeGreaterThan(0);
    expect(screen.getByText('Blood Test Report')).toBeInTheDocument();
    expect(screen.getAllByText('Explained')[0]).toBeInTheDocument();
  });

  it('renders Section C: 4 Key Benefits', () => {
    render(<App />);

    expect(screen.getByText('Secure Storage')).toBeInTheDocument();
    expect(screen.getByText('AI Explanations')).toBeInTheDocument();
    expect(screen.getAllByText('Family Sharing').length).toBeGreaterThan(0);
    expect(screen.getByText('Verified Caregivers')).toBeInTheDocument();
  });

  it('renders Section D: How MediVault AI Works with 3 steps and medical notice', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /How MediVault AI Works/i })).toBeInTheDocument();
    expect(screen.getByText('Upload Your Reports')).toBeInTheDocument();
    expect(screen.getByText('Get AI Explanations')).toBeInTheDocument();
    expect(screen.getByText('Manage and Share')).toBeInTheDocument();

    // Check informational medical notice
    expect(screen.getByText(/Planned AI explanations are informational only/i)).toBeInTheDocument();
  });
});
