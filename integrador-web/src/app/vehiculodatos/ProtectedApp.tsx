'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Layout from '@/components/Layout';
import FullScreenLoader from '../vehiculodatos/FullScreenLoader';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedApp({ children }: { children: ReactNode }) {
  const { auth, isLoading, transitionLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !transitionLoading) {
      if (!auth && pathname !== '/login') {
        router.replace('/login');
      } else if (auth && pathname === '/login') {
        router.replace('/');
      }
    }
  }, [auth, pathname, router, isLoading, transitionLoading]);

  if (isLoading || transitionLoading) {
    return <FullScreenLoader />;
  }

  if (!auth && pathname === '/login') {
    return <>{children}</>;
  }

  if (!auth) {
    return null;
  }

  return <Layout>{children}</Layout>;
}
