import { createContext, useState, useCallback, useEffect } from 'react';
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

function readStoredToken() {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(false);

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
    // Only check auth if we have a token - don't hit /api/auth/me for guest sessions
    const token = readStoredToken();
    if (token) {
      checkAuth();
    }
  }, [checkAuth]);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
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
    // Force a re-render by clearing all auth-related state
    sessionStorage.clear();
  }, []);

  const isAuthenticated = Boolean(user);
  const role = user ? user.role : null;

  const value = { user, role, isAuthenticated, loading, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
