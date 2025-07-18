'use client';

import type { ReactNode } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';
import theme from '../styles/theme';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from '@/components/utils/NotificationProvider';
import ProtectedApp from './vehiculodatos/ProtectedApp';

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head />
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <NotificationProvider>
                <ProtectedApp>{children}</ProtectedApp>
              </NotificationProvider>
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
