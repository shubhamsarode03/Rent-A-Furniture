import { createContext, useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/authApi';

export const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch {
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Always check auth on mount using HttpOnly cookie
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    // Backend sets HttpOnly JWT cookie
    const userData = {
      id: res.id,
      userId: res.userId,
      email: res.email,
      firstName: res.firstName,
      lastName: res.lastName,
      role: res.role,
    };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await authApi.register(payload);
    // Backend sets HttpOnly JWT cookie
    const userData = {
      id: res.id,
      userId: res.userId,
      email: res.email,
      firstName: res.firstName,
      lastName: res.lastName,
      role: res.role,
    };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue with logout even if API call fails
    }
    setUser(null);
    localStorage.removeItem('user');
    // Clear all React Query cache to prevent data leakage between users
    queryClient.clear();
    // Force a re-render by clearing all auth-related state
    sessionStorage.clear();
  }, [queryClient]);

  const isAuthenticated = Boolean(user);
  const role = user ? user.role : null;

  const value = { user, role, isAuthenticated, loading, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
