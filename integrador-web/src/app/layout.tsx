'use client';
import type { ReactNode } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import theme from '../styles/theme';
import Layout from '../components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';

const queryClient = new QueryClient();

function ProtectedApp({ children }: { children: ReactNode }) {
  const { auth } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!auth && pathname !== '/login') {
      router.replace('/login');
    }
    if (auth && pathname === '/login') {
      router.replace('/');
    }
  }, [auth, pathname, router]);

  if (pathname === '/login') return <>{children}</>;
  if (!auth) return null;
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
