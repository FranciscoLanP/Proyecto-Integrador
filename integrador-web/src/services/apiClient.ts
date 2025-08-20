import axios from 'axios';

// Función helper para verificar si un token JWT está expirado
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true; // Si no se puede decodificar, considerar como expirado
  }
};

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
  timeout: 10000
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth');
      if (stored) {
        try {
          const { token } = JSON.parse(stored);
          if (token && token !== 'null' && token !== 'undefined') {
            // Verificar si el token está expirado antes de usarlo
            if (isTokenExpired(token)) {
              console.warn('Token expirado detectado, limpiando localStorage...');
              localStorage.removeItem('auth');
              delete apiClient.defaults.headers.common['Authorization'];

              // Redirigir al login si no estamos ya allí
              if (window.location.pathname !== '/login') {
                window.location.href = '/login';
              }
              return config; // Retornar sin agregar el token expirado
            }

            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error parsing auth token:', error);
          localStorage.removeItem('auth');
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        console.warn('Token de autenticación inválido, redirigiendo al login...');
        localStorage.removeItem('auth');
        delete apiClient.defaults.headers.common['Authorization'];

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (error.code === 'NETWORK_ERROR' || error.message.includes('CORS')) {
      console.error('Error de red o CORS:', error.message);
      error.message = 'Error de conexión con el servidor. Verifique que el backend esté ejecutándose.';
    }

    return Promise.reject(error);
  }
);

if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('auth');
  if (stored) {
    try {
      const { token } = JSON.parse(stored);
      if (token && token !== 'null' && token !== 'undefined') {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error initializing auth token:', error);
      localStorage.removeItem('auth');
    }
  }
}
