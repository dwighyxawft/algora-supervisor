import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Supervisor } from '@/lib/api/models';
import { AuthRoutes, SupervisorRoutes } from '@/lib/api/routes';
import { apiClient } from '@/lib/api/client';

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
        const raw = JSON.parse(userStr);
        const user = { ...raw, id: raw.id || raw._id };
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
      const data = await apiClient.post<{ token: string; user: Supervisor }>(
        AuthRoutes.loginSupervisor(),
        { username: email, password }
      );
      const { token, user: rawUser } = data;
      const user = { ...rawUser, id: rawUser.id || (rawUser as any)._id };
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setState({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      setState(s => ({ ...s, isLoading: false }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.get(AuthRoutes.logoutSupervisor());
    } catch {
      // ignore logout errors
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await apiClient.post(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/supervisor/forgot-password`,
      { email }
    );
  }, []);

  const resetPassword = useCallback(async (id: string, token: string, password: string) => {
    await apiClient.post(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/supervisor/reset-password/${id}?token=${token}`,
      { password }
    );
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
