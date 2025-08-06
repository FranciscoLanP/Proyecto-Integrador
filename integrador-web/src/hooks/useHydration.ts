'use client';

import { useState, useEffect } from 'react';

/**
 * Hook que maneja el estado de hidratación de manera segura
 */
export function useHydration() {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    return isHydrated;
}

/**
 * Tema por defecto para usar durante SSR o cuando no hay contexto disponible
 */
export const defaultTheme = {
    id: 'ocean',
    name: '🌊 Océano',
    colors: {
        primary: '#3b82f6',
        secondary: '#1e40af',
        accent: '#1d4ed8',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
        surface: 'rgba(255, 255, 255, 0.9)',
        text: '#1f2937',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
    },
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    headerGradient: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
    cardGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(30, 64, 175, 0.1) 100%)',
    buttonGradient: 'linear-gradient(45deg, #3b82f6 30%, #1e40af 90%)'
};
