'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, getErrorMessage } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('vinylite_token');
    const storedUser = localStorage.getItem('vinylite_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('vinylite_user');
      }
    }
    setLoading(false);
  }, []);

  const persistSession = useCallback((authResponse) => {
    const { token, userId, email, displayName } = authResponse;
    const sessionUser = { id: userId, email, displayName };
    localStorage.setItem('vinylite_token', token);
    localStorage.setItem('vinylite_user', JSON.stringify(sessionUser));
    setUser(sessionUser);
    return sessionUser;
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await authApi.login({ email, password });
      persistSession(data);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: getErrorMessage(err) };
    }
  }, [persistSession]);

  const register = useCallback(async (email, displayName, password) => {
    try {
      const { data } = await authApi.register({ email, displayName, password });
      persistSession(data);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: getErrorMessage(err) };
    }
  }, [persistSession]);

  const logout = useCallback(() => {
    localStorage.removeItem('vinylite_token');
    localStorage.removeItem('vinylite_user');
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
