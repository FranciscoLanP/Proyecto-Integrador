'use client'

import { Box, Toolbar } from '@mui/material'
import Sidebar from './Sidebar'
import Header from './Header'
import { ReactNode } from 'react'
import { useTheme } from '@/app/context/ThemeContext'

export default function Layout({ children }: { children: ReactNode }) {
  const { currentTheme } = useTheme()

  return (
    <Box
      sx={{
        display: 'flex',
        background: currentTheme.id === 'dark'
          ? 'linear-gradient(135deg, #0f0f23 0%, #1e1b4b 100%)'
          : currentTheme.colors.background,
        minHeight: '100vh'
      }}
    >
      <Header />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}
