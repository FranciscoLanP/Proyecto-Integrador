'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect
} from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../services/apiClient';

interface Auth {
  username: string;
  role: 'administrador' | 'empleado';
  token: string;
}

interface AuthContextType {
  auth: Auth | null;
  login: (username: string, role: Auth['role'], token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<Auth | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = typeof window !== 'undefined' && localStorage.getItem('auth');
    if (stored) {
      const a: Auth = JSON.parse(stored);
      setAuth(a);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${a.token}`;
    }
  }, []);

  const login = (username: string, role: Auth['role'], token: string) => {
    const a: Auth = { username, role, token };
    localStorage.setItem('auth', JSON.stringify(a));
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setAuth(a);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('auth');
    delete apiClient.defaults.headers.common['Authorization'];
    setAuth(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
