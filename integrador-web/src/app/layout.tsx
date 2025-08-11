// src/app/layout.tsx
'use client'

import type { ReactNode } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { QueryClient, QueryClientProvider } from 'react-query'
import theme from '../styles/theme'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider as AppThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from '@/components/utils/NotificationProvider'
import ProtectedApp from './vehiculodatos/ProtectedApp'
import './globals.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="http://localhost:3001" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <AppThemeProvider>
                <NotificationProvider>
                  <ProtectedApp>{children}</ProtectedApp>
                </NotificationProvider>
              </AppThemeProvider>
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
