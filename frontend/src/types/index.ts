export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface BenefitItem {
  id: string;
  title: string;
  description: string;
  iconName: 'Lock' | 'FileText' | 'Users' | 'ShieldCheck';
}

export interface StepItem {
  stepNumber: number;
  title: string;
  description: string;
  iconName: 'Upload' | 'FileSearch' | 'Users';
}

export interface MockReport {
  id: string;
  name: string;
  date: string;
  status: 'Explained' | 'Processing' | 'Pending';
  type: string;
}

export interface HealthCheckResponse {
  success: boolean;
  message: string;
  data: {
    status: string;
    service: string;
    version: string;
    uptimeSeconds: number;
    environment: string;
    timestamp: string;
  };
}
