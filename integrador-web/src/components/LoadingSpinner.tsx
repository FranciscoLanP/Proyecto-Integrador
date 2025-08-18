import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
    message?: string;
    size?: number;
    fullScreen?: boolean;
    variant?: 'default' | 'minimal' | 'detailed';
}

export default function LoadingSpinner({
    message = "Cargando datos...",
    size = 50,
    fullScreen = false,
    variant = 'default'
}: LoadingSpinnerProps) {

    const containerStyles = fullScreen ? {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(248, 250, 252, 0.95)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999
    } : {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        width: '100%'
    };

    if (variant === 'minimal') {
        return (
            <Box sx={containerStyles}>
                <CircularProgress
                    size={size}
                    thickness={4}
                    sx={{
                        color: '#1976d2',
                        animationDuration: '1.2s'
                    }}
                />
            </Box>
        );
    }

    if (variant === 'detailed') {
        return (
            <Box sx={containerStyles}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 3,
                        padding: 4,
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(25, 118, 210, 0.1)',
                        minWidth: 300,
                        animation: 'pulse 2s ease-in-out infinite'
                    }}
                >
                    {/* Icono animado del taller */}
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            color: 'white',
                            marginBottom: 1,
                            animation: 'rotate 3s linear infinite',
                            boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3)'
                        }}
                    >
                        🔧
                    </Box>

                    {/* Spinner personalizado */}
                    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CircularProgress
                            size={size}
                            thickness={4}
                            sx={{
                                color: '#1976d2',
                                animationDuration: '1.4s'
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <CircularProgress
                                variant="determinate"
                                value={25}
                                size={size + 15}
                                thickness={2}
                                sx={{
                                    color: 'rgba(25, 118, 210, 0.2)',
                                    transform: 'rotate(-90deg)!important',
                                    '& .MuiCircularProgress-circle': {
                                        strokeLinecap: 'round',
                                    }
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Mensaje de carga */}
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#1976d2',
                            fontWeight: 600,
                            textAlign: 'center',
                            fontSize: '1.1rem'
                        }}
                    >
                        {message}
                    </Typography>

                    {/* Puntos animados */}
                    <Box sx={{ display: 'flex', gap: 0.5, marginTop: 1 }}>
                        {[0, 1, 2].map((index) => (
                            <Box
                                key={index}
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: '#1976d2',
                                    animation: `bounce 1.4s ease-in-out ${index * 0.16}s infinite both`
                                }}
                            />
                        ))}
                    </Box>

                    <Typography
                        variant="body2"
                        sx={{
                            color: '#666',
                            fontSize: '0.875rem',
                            textAlign: 'center',
                            marginTop: 1
                        }}
                    >
                        JHS AutoServicios
                    </Typography>
                </Box>

                {/* Estilos CSS para animaciones */}
                <style jsx>{`
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes bounce {
            0%, 80%, 100% { 
              transform: scale(0);
              opacity: 0.5;
            } 
            40% { 
              transform: scale(1);
              opacity: 1;
            }
          }
          
          @keyframes pulse {
            0%, 100% { 
              transform: scale(1);
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            }
            50% { 
              transform: scale(1.02);
              box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15);
            }
          }
        `}</style>
            </Box>
        );
    }

    // Variant por defecto
    return (
        <Box sx={containerStyles}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    padding: 3,
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(25, 118, 210, 0.1)'
                }}
            >
                {/* Icono del taller */}
                <Box
                    sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        color: 'white',
                        marginBottom: 1,
                        boxShadow: '0 6px 20px rgba(25, 118, 210, 0.3)'
                    }}
                >
                    🔧
                </Box>

                {/* Spinner con anillo exterior */}
                <Box sx={{ position: 'relative' }}>
                    <CircularProgress
                        size={size}
                        thickness={4}
                        sx={{
                            color: '#1976d2',
                            animationDuration: '1.2s'
                        }}
                    />
                </Box>

                {/* Mensaje */}
                <Typography
                    variant="body1"
                    sx={{
                        color: '#1976d2',
                        fontWeight: 500,
                        textAlign: 'center'
                    }}
                >
                    {message}
                </Typography>
            </Box>
        </Box>
    );
}
