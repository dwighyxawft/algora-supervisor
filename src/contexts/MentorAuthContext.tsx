import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Mentor } from '@/lib/api/models';
import { AuthRoutes, MentorRoutes } from '@/lib/api/routes';
import { mentorApiClient } from '@/lib/api/mentor-client';

interface MentorAuthState {
  user: Mentor | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface MentorAuthContextType extends MentorAuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Mentor>) => void;
}

const MentorAuthContext = createContext<MentorAuthContextType | undefined>(undefined);

const TOKEN_KEY = 'algora_mentor_token';
const USER_KEY = 'algora_mentor_user';

export function MentorAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MentorAuthState>({
    user: null, token: null, isAuthenticated: false, isLoading: true,
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
      const res = await fetch(AuthRoutes.loginMentor(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Login failed');
      }
      const data = await res.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setState({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      setState(s => ({ ...s, isLoading: false }));
      throw err;
    }
  }, []);

  const register = useCallback(async (data: Record<string, unknown>) => {
    const res = await fetch(MentorRoutes.create(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message || 'Registration failed');
    }
  }, []);

  const logout = useCallback(async () => {
    try { await mentorApiClient.get(AuthRoutes.logoutMentor()); } catch {}
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);

  const updateProfile = useCallback((data: Partial<Mentor>) => {
    setState(s => {
      if (!s.user) return s;
      const updated = { ...s.user, ...data };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return { ...s, user: updated };
    });
  }, []);

  return (
    <MentorAuthContext.Provider value={{ ...state, login, register, logout, updateProfile }}>
      {children}
    </MentorAuthContext.Provider>
  );
}

export function useMentorAuth() {
  const ctx = useContext(MentorAuthContext);
  if (!ctx) throw new Error('useMentorAuth must be used within MentorAuthProvider');
  return ctx;
}
