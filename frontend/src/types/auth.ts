export interface SafeUser {
  id: string;
  fullName: string;
  email: string;
  role: 'PATIENT' | 'FAMILY_MEMBER' | 'CAREGIVER' | 'ADMIN';
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface LoginResult {
  user: SafeUser;
  csrfToken?: string;
}

export interface RegisterResult {
  user: SafeUser;
  verificationLink?: string;
}

