'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { useHydration } from '@/hooks/useHydration';

interface ThemeSafePageProps {
    children: React.ReactNode;
    title?: string;
}

/**
 * Wrapper para páginas que previene errores de hidratación
 * mostrando un loader mientras se completa la hidratación
 */
export default function ThemeSafePage({ children, title }: ThemeSafePageProps) {
    const isHydrated = useHydration();

    if (!isHydrated) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '50vh',
                    gap: 2
                }}
            >
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        border: '3px solid #e2e8f0',
                        borderTop: '3px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' }
                        }
                    }}
                />
                <Typography
                    variant="h6"
                    sx={{
                        color: '#64748b',
                        fontWeight: 500
                    }}
                >
                    {title ? `Cargando ${title}...` : 'Cargando...'}
                </Typography>
            </Box>
        );
    }

    return <>{children}</>;
}
