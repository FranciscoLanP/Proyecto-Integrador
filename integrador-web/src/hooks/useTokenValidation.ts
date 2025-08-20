import { useEffect } from 'react';
import { useAuth } from '../app/context/AuthContext';

export const useTokenValidation = () => {
    const { auth, logout } = useAuth();

    useEffect(() => {
        if (!auth?.token) return;

        const checkTokenExpiration = () => {
            try {
                const payload = JSON.parse(atob(auth.token.split('.')[1]));
                const currentTime = Math.floor(Date.now() / 1000);

                const timeUntilExpiry = payload.exp - currentTime;

                if (timeUntilExpiry <= 0) {
                    console.warn('Token expirado, cerrando sesión...');
                    logout();
                } else if (timeUntilExpiry <= 300) { 
                    console.warn(`Token expira en ${Math.floor(timeUntilExpiry / 60)} minutos`);
                }
            } catch (error) {
                console.error('Error al validar token:', error);
                logout();
            }
        };

        checkTokenExpiration();

        const interval = setInterval(checkTokenExpiration, 60000);

        return () => clearInterval(interval);
    }, [auth?.token, logout]);
};

export default useTokenValidation;
