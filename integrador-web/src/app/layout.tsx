'use client';

import type { ReactNode } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import theme from '../styles/theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from '../components/Layout';
import FullScreenLoader from './vehiculodatos/FullScreenLoader';

const queryClient = new QueryClient();

function ProtectedApp({ children }: { children: ReactNode }) {
  const { auth, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!auth && pathname !== '/login') {
        router.replace('/login');
      } else if (auth && pathname === '/login') {
        router.replace('/');
      }
    }
  }, [auth, isLoading, pathname, router]);

  if (isLoading) {
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head />
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <ProtectedApp>{children}</ProtectedApp>
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
