import { SafeUser, AuthResponse, LoginResult, RegisterResult } from '../types/auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// In-memory CSRF token cache
let cachedCsrfToken: string | null = null;

export function setCachedCsrfToken(token: string | null) {
  cachedCsrfToken = token;
}

export function getCachedCsrfToken(): string | null {
  return cachedCsrfToken;
}

/**
 * Fetch fresh CSRF token from backend
 */
export async function fetchCsrfToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/csrf`, {
      method: 'GET',
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.data?.csrfToken) {
        cachedCsrfToken = data.data.csrfToken;
        return cachedCsrfToken;
      }
    }
  } catch {
    // Non-blocking in dev
  }
  return null;
}

/**
 * Generic API request wrapper with credentials: 'include' and automatic CSRF header
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<AuthResponse<T>> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach CSRF header on state-changing requests
  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    if (!cachedCsrfToken) {
      await fetchCsrfToken();
    }
    if (cachedCsrfToken) {
      headers.set('X-CSRF-Token', cachedCsrfToken);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Crucial for HttpOnly cookies
  });

  const data = await response.json().catch(() => ({}));

  if (data?.data?.csrfToken) {
    cachedCsrfToken = data.data.csrfToken;
  }

  if (!response.ok) {
    const errorMessage =
      data?.message || data?.error || `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    (error as unknown as { status: number; code?: string }).status = response.status;
    (error as unknown as { code?: string }).code = data?.code;
    throw error;
  }

  return data;
}

export const authApi = {
  async register(payload: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
  }): Promise<AuthResponse<RegisterResult>> {
    return request<RegisterResult>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(payload: { email: string; password: string }): Promise<AuthResponse<LoginResult>> {
    return request<LoginResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async logout(): Promise<AuthResponse<void>> {
    const res = await request<void>('/auth/logout', {
      method: 'POST',
    });
    cachedCsrfToken = null;
    return res;
  },

  async getMe(): Promise<AuthResponse<{ user: SafeUser }>> {
    return request<{ user: SafeUser }>('/auth/me', {
      method: 'GET',
    });
  },

  async verifyEmail(token: string): Promise<AuthResponse<{ user: SafeUser }>> {
    return request<{ user: SafeUser }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  async resendVerification(email: string): Promise<AuthResponse<{ verificationLink?: string }>> {
    return request<{ verificationLink?: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async forgotPassword(email: string): Promise<AuthResponse<{ resetLink?: string }>> {
    return request<{ resetLink?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(payload: {
    token: string;
    password: string;
    confirmPassword: string;
  }): Promise<AuthResponse<void>> {
    return request<void>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
