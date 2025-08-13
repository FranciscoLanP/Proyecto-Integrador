'use client'

import type { ReactNode } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { QueryClient, QueryClientProvider } from 'react-query'
import theme from '../styles/theme'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider as AppThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from '@/components/utils/NotificationProvider'
import ProtectedApp from './vehiculodatos/ProtectedApp'
import NoSSR from '@/components/NoSSR'
import './globals.css'
import '../styles/print.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, 
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
        <NoSSR fallback={
          <div
            style={{
              height: '100vh',
              width: '100vw',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f0f9ff'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #0ea5e9',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}
            />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        }>
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
        </NoSSR>
      </body>
    </html>
  )
}
