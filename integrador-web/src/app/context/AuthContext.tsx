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
import FullScreenLoader from '../vehiculodatos/FullScreenLoader';

interface Auth {
  username: string;
  role: 'administrador' | 'empleado';
  token: string;
}

interface AuthContextType {
  auth: Auth | null;
  isLoading: boolean;
  transitionLoading: boolean;
  login: (username: string, role: Auth['role'], token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateAuth: (username: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transitionLoading, setTransitionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = typeof window !== 'undefined' && localStorage.getItem('auth');
    if (stored) {
      try {
        const a: Auth = JSON.parse(stored);
        setAuth(a);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${a.token}`;
      } catch {
        localStorage.removeItem('auth');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, role: Auth['role'], token: string): Promise<void> => {
    setTransitionLoading(true);
    const a: Auth = { username, role, token };
    localStorage.setItem('auth', JSON.stringify(a));
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setAuth(a);
    await router.replace('/');
    setTransitionLoading(false);
  };

  const logout = async (): Promise<void> => {
    setTransitionLoading(true);
    localStorage.removeItem('auth');
    delete apiClient.defaults.headers.common['Authorization'];
    setAuth(null);
    await router.replace('/login');
    setTransitionLoading(false);
  };

  const updateAuth = (username: string): void => {
    if (auth) {
      const updatedAuth = { ...auth, username };
      localStorage.setItem('auth', JSON.stringify(updatedAuth));
      setAuth(updatedAuth);
    }
  };

  return (
    <AuthContext.Provider value={{ auth, isLoading, transitionLoading, login, logout, updateAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
