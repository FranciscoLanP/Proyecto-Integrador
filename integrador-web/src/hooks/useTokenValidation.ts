import { useEffect } from 'react';
import { useAuth } from '../app/context/AuthContext';

// Hook para verificar automáticamente si el token está expirado
export const useTokenValidation = () => {
  const { auth, logout } = useAuth();

  useEffect(() => {
    if (!auth?.token) return;

    const checkTokenExpiration = () => {
      try {
        const payload = JSON.parse(atob(auth.token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        // Si el token expira en menos de 5 minutos, hacer logout preventivo
        const timeUntilExpiry = payload.exp - currentTime;
        
        if (timeUntilExpiry <= 0) {
          console.warn('Token expirado, cerrando sesión...');
          logout();
        } else if (timeUntilExpiry <= 300) { // 5 minutos
          console.warn(`Token expira en ${Math.floor(timeUntilExpiry / 60)} minutos`);
        }
      } catch (error) {
        console.error('Error al validar token:', error);
        logout();
      }
    };

    // Verificar inmediatamente
    checkTokenExpiration();

    // Verificar cada minuto
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, [auth?.token, logout]);
};

export default useTokenValidation;
