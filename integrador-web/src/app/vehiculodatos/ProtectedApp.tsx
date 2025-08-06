'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Layout from '@/components/Layout';
import FullScreenLoader from '../vehiculodatos/FullScreenLoader';
import HydrationWrapper from '@/components/HydrationWrapper';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ProtectedApp({ children }: { children: ReactNode }) {
  const { auth, isLoading, transitionLoading } = useAuth();
  const { isHydrated } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !transitionLoading && isHydrated) {
      if (!auth && pathname !== '/login') {
        router.replace('/login');
      } else if (auth && pathname === '/login') {
        router.replace('/');
      }
    }
  }, [auth, pathname, router, isLoading, transitionLoading, isHydrated]);

  // Mostrar loader mientras se cargan auth y tema
  if (isLoading || transitionLoading || !isHydrated) {
    return (
      <HydrationWrapper>
        <FullScreenLoader />
      </HydrationWrapper>
    );
  }

  if (!auth && pathname === '/login') {
    return (
      <HydrationWrapper>
        {children}
      </HydrationWrapper>
    );
  }

  if (!auth) {
    return null;
  }

  return (
    <HydrationWrapper>
      <Layout>{children}</Layout>
    </HydrationWrapper>
  );
}
