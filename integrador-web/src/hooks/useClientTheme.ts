'use client';

import { useState, useEffect } from 'react';
import { themes, type AppTheme } from '../app/context/ThemeContext';

export function useClientTheme() {
    const [currentTheme, setCurrentTheme] = useState<AppTheme>(themes[0]);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        // Marcar como hidratado
        setIsHydrated(true);

        // Cargar tema del localStorage
        try {
            const savedThemeId = localStorage.getItem('app-theme');
            if (savedThemeId) {
                const savedTheme = themes.find(t => t.id === savedThemeId);
                if (savedTheme) {
                    setCurrentTheme(savedTheme);
                }
            }
        } catch (error) {
            console.warn('No se pudo cargar el tema guardado:', error);
        }
    }, []);

    const setTheme = (themeId: string) => {
        const theme = themes.find(t => t.id === themeId);
        if (theme) {
            setCurrentTheme(theme);
            if (isHydrated) {
                try {
                    localStorage.setItem('app-theme', themeId);
                } catch (error) {
                    console.warn('No se pudo guardar el tema:', error);
                }
            }
        }
    };

    return {
        currentTheme,
        setTheme,
        themes,
        isHydrated
    };
}
