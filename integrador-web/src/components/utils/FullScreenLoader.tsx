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
        bgcolor: 'rgba(255,255,255,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <CircularProgress size={60} />
    </Box>
  );
}
