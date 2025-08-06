'use client';

import { Box, CircularProgress } from '@mui/material';
import { JSX } from 'react';

export default function FullScreenLoader(): JSX.Element {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1300,
        width: '100vw',
        height: '100vh',
        bgcolor: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)'
      }}
    >
      <CircularProgress
        size={60}
        sx={{
          color: '#3b82f6'
        }}
      />
    </Box>
  );
}
