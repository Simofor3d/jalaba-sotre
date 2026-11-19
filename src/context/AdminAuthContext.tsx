import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types/store.ts';

interface AdminAuthContextType {
  isAdminLoggedIn: boolean;
  isCheckingSession: boolean;
  adminUser: AdminUser | null;
  token: string | null;
  login: (username: string, passwordAttempt: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateSession: (newToken: string, newUser: AdminUser) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_TOKEN_KEY = 'dar_al_maghribia_admin_token';
const ADMIN_USER_KEY = 'dar_al_maghribia_admin_user';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(ADMIN_TOKEN_KEY));
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(() => Boolean(sessionStorage.getItem(ADMIN_TOKEN_KEY)));
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const u = sessionStorage.getItem(ADMIN_USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Verify existing session token against server on mount
  useEffect(() => {
    if (!token) {
      setIsCheckingSession(false);
      return;
    }
    let cancelled = false;
    setIsCheckingSession(true);
    fetch('/api/admin/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        if (cancelled) return;
        if (!res.ok) {
          setToken(null);
          setAdminUser(null);
          sessionStorage.removeItem(ADMIN_TOKEN_KEY);
          sessionStorage.removeItem(ADMIN_USER_KEY);
          return;
        }
        const data = await res.json();
        if (data?.user) {
          setAdminUser(data.user);
          sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.user));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsCheckingSession(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (username: string, passwordAttempt: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: passwordAttempt }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'فشل تسجيل الدخول' };
      }
      setToken(data.token);
      setAdminUser(data.user);
      sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.user));
      return { success: true };
    } catch {
      return { success: false, error: 'حدث خطأ في الاتصال بالخادم' };
    }
  };

  const updateSession = (newToken: string, newUser: AdminUser) => {
    setToken(newToken);
    setAdminUser(newUser);
    sessionStorage.setItem(ADMIN_TOKEN_KEY, newToken);
    sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(newUser));
  };

  const logout = async () => {
    const activeToken = token;
    setToken(null);
    setAdminUser(null);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_USER_KEY);
    setIsAdminOpen(false);
    if (activeToken) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${activeToken}` },
        });
      } catch {
        // Ignore network errors on logout
      }
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminLoggedIn: !!token,
        isCheckingSession,
        adminUser,
        token,
        login,
        logout,
        updateSession,
        isAdminOpen,
        setIsAdminOpen,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
