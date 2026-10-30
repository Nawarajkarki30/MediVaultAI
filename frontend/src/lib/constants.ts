import { BenefitItem, NavItem, StepItem, MockReport } from '../types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'For Families', href: '#for-families' },
  { label: 'Caregivers', href: '#caregivers' },
  { label: 'About', href: '#about' },
];

export const KEY_BENEFITS: BenefitItem[] = [
  {
    id: 'secure-storage',
    title: 'Secure Storage',
    description: 'Keep your medical documents organized in one place.',
    iconName: 'Lock',
  },
  {
    id: 'ai-explanations',
    title: 'AI Explanations',
    description: 'Understand complex medical reports in simple English or Nepali.',
    iconName: 'FileText',
  },
  {
    id: 'family-sharing',
    title: 'Family Sharing',
    description: 'Choose what information to share with trusted family members.',
    iconName: 'Users',
  },
  {
    id: 'verified-caregivers',
    title: 'Verified Caregivers',
    description: 'Explore non-medical assistance from verified caregivers.',
    iconName: 'ShieldCheck',
  },
];

export const HOW_IT_WORKS_STEPS: StepItem[] = [
  {
    stepNumber: 1,
    title: 'Upload Your Reports',
    description: 'Organize medical reports, prescriptions, and supporting documents.',
    iconName: 'Upload',
  },
  {
    stepNumber: 2,
    title: 'Get AI Explanations',
    description:
      'Review extracted information and receive understandable explanations in English or Nepali.',
    iconName: 'FileSearch',
  },
  {
    stepNumber: 3,
    title: 'Manage and Share',
    description: 'Maintain your health information and control selected sharing permissions.',
    iconName: 'Users',
  },
];

export const MOCK_REPORTS: MockReport[] = [
  {
    id: 'rep-1',
    name: 'Blood Test Report',
    date: 'Mar 12, 2024',
    status: 'Explained',
    type: 'Laboratory',
  },
  {
    id: 'rep-2',
    name: 'X-Ray Report',
    date: 'Feb 5, 2024',
    status: 'Explained',
    type: 'Radiology',
  },
  {
    id: 'rep-3',
    name: 'Prescription',
    date: 'Jan 20, 2024',
    status: 'Explained',
    type: 'Prescription',
  },
];
