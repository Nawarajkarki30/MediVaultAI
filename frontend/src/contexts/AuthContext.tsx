import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SafeUser } from '../types/auth';
import { authApi } from '../services/auth.api';

interface AuthContextType {
  user: SafeUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<SafeUser>;
  register: (payload: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
  }) => Promise<{ user: SafeUser; verificationLink?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<SafeUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from HttpOnly cookie on page load / reload
  const refreshUser = useCallback(async (): Promise<SafeUser | null> => {
    try {
      const response = await authApi.getMe();
      if (response?.data?.user) {
        setUser(response.data.user);
        return response.data.user;
      }
      setUser(null);
      return null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<SafeUser> => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      if (!response.data?.user) {
        throw new Error(response.message || 'Login failed');
      }
      setUser(response.data.user);
      return response.data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
  }) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(payload);
      if (!response.data?.user) {
        throw new Error(response.message || 'Registration failed');
      }
      // Note: User is registered but not logged in until verified
      return response.data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      // Clean local state regardless
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

