'use client';

import React from 'react';
import { Box, CircularProgress } from '@mui/material';

export default function FullScreenLoader() {
  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <CircularProgress />
    </Box>
  );
}
