import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Supervisor } from '@/lib/api/models';

interface AuthState {
  user: Supervisor | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (id: string, token: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<Supervisor>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'algora_supervisor_token';
const USER_KEY = 'algora_supervisor_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setState({ user, token, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setState(s => ({ ...s, isLoading: false }));
      }
    } else {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, isLoading: true }));
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/auth/login/supervisor`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password }),
        }
      );
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      const { token, user } = data;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setState({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      setState(s => ({ ...s, isLoading: false }));
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/supervisor/forgot-password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }
    );
    if (!res.ok) throw new Error('Failed to send reset link');
  }, []);

  const resetPassword = useCallback(async (id: string, token: string, password: string) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/supervisor/reset-password/${id}?token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      }
    );
    if (!res.ok) throw new Error('Failed to reset password');
  }, []);

  const updateProfile = useCallback((data: Partial<Supervisor>) => {
    setState(s => {
      if (!s.user) return s;
      const updated = { ...s.user, ...data };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return { ...s, user: updated };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, forgotPassword, resetPassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
