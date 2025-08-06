'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles: ('administrador' | 'empleado')[];
    redirectTo?: string;
    showError?: boolean;
}

export default function RoleGuard({
    children,
    allowedRoles,
    redirectTo = '/factura',
    showError = true
}: RoleGuardProps) {
    const { auth, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && auth) {
            if (!allowedRoles.includes(auth.role)) {
                router.replace(redirectTo);
            }
        }
    }, [auth, isLoading, allowedRoles, redirectTo, router]);

    // Mostrar loading mientras se verifica la autenticación
    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <Typography>Cargando...</Typography>
            </Box>
        );
    }

    // Si no hay autenticación, no mostrar nada (el AuthContext redirigirá al login)
    if (!auth) {
        return null;
    }

    // Si el rol no está permitido, mostrar error o no mostrar nada (ya se redirigió)
    if (!allowedRoles.includes(auth.role)) {
        if (showError) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" height="400px" p={3}>
                    <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
                        <BlockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                        <Typography variant="h5" gutterBottom color="error">
                            Acceso Denegado
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            No tienes permisos para acceder a esta sección.
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
                            Redirigiendo...
                        </Typography>
                    </Paper>
                </Box>
            );
        }
        return null;
    }

    // Si el rol está permitido, mostrar el contenido
    return <>{children}</>;
}
