// src/app/layout.tsx
'use client'

import type { ReactNode } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { QueryClient, QueryClientProvider } from 'react-query'
import theme from '../styles/theme'
import Layout from '../components/Layout'
import '../app/globals.css'
import { AuthProvider } from './context/AuthContext'


const queryClient = new QueryClient()

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head />
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <QueryClientProvider client={queryClient}>
            {/* Inyectamos el contexto de autenticación */}
            <AuthProvider>
              <Layout>
                {children}
              </Layout>
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
