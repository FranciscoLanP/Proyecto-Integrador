'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    success: string;
    warning: string;
    error: string;
    info: string;
}

export interface AppTheme {
    id: string;
    name: string;
    colors: ThemeColors;
    gradient: string;
    headerGradient: string;
    cardGradient: string;
    buttonGradient: string;
}

export const themes: AppTheme[] = [
    {
        id: 'ocean',
        name: '🌊 Océano',
        colors: {
            primary: '#0ea5e9',
            secondary: '#0284c7',
            accent: '#0369a1',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            surface: 'rgba(255, 255, 255, 0.9)',
            text: '#0f172a',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
        },
        gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        headerGradient: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
        cardGradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(2, 132, 199, 0.1) 100%)',
        buttonGradient: 'linear-gradient(45deg, #0ea5e9 30%, #0284c7 90%)'
    },
    {
        id: 'sunset',
        name: '🌅 Atardecer',
        colors: {
            primary: '#f97316',
            secondary: '#ea580c',
            accent: '#dc2626',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
            surface: 'rgba(255, 255, 255, 0.9)',
            text: '#1f2937',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
        },
        gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        headerGradient: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
        cardGradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)',
        buttonGradient: 'linear-gradient(45deg, #f97316 30%, #ea580c 90%)'
    },
    {
        id: 'forest',
        name: '🌲 Bosque',
        colors: {
            primary: '#16a34a',
            secondary: '#15803d',
            accent: '#166534',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            surface: 'rgba(255, 255, 255, 0.9)',
            text: '#0f172a',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
        },
        gradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
        headerGradient: 'linear-gradient(135deg, #166534 0%, #15803d 100%)',
        cardGradient: 'linear-gradient(135deg, rgba(22, 163, 74, 0.1) 0%, rgba(21, 128, 61, 0.1) 100%)',
        buttonGradient: 'linear-gradient(45deg, #16a34a 30%, #15803d 90%)'
    },
    {
        id: 'lavender',
        name: '💜 Purpura',
        colors: {
            primary: '#8b5cf6',
            secondary: '#7c3aed',
            accent: '#6d28d9',
            background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
            surface: 'rgba(255, 255, 255, 0.9)',
            text: '#1f2937',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
        },
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        headerGradient: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)',
        cardGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
        buttonGradient: 'linear-gradient(45deg, #8b5cf6 30%, #7c3aed 90%)'
    },
    {
        id: 'rose',
        name: '🌹 Rosa',
        colors: {
            primary: '#e11d48',
            secondary: '#be185d',
            accent: '#9f1239',
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
            surface: 'rgba(255, 255, 255, 0.9)',
            text: '#1f2937',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
        },
        gradient: 'linear-gradient(135deg, #e11d48 0%, #be185d 100%)',
        headerGradient: 'linear-gradient(135deg, #9f1239 0%, #be185d 100%)',
        cardGradient: 'linear-gradient(135deg, rgba(225, 29, 72, 0.1) 0%, rgba(190, 24, 93, 0.1) 100%)',
        buttonGradient: 'linear-gradient(45deg, #e11d48 30%, #be185d 90%)'
    },
    {
        id: 'midnight',
        name: '🌙 Medianoche',
        colors: {
            primary: '#1e40af',
            secondary: '#1e3a8a',
            accent: '#1d4ed8',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            surface: 'rgba(255, 255, 255, 0.95)',
            text: '#0f172a',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
        },
        gradient: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
        headerGradient: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
        cardGradient: 'linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(30, 58, 138, 0.1) 100%)',
        buttonGradient: 'linear-gradient(45deg, #1e40af 30%, #1e3a8a 90%)'
    }
];

interface ThemeContextType {
    currentTheme: AppTheme;
    setTheme: (themeId: string) => void;
    themes: AppTheme[];
    isHydrated: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [currentTheme, setCurrentTheme] = useState<AppTheme>(themes[0]);
    const [mounted, setMounted] = useState(false);

    // Solo ejecutar en el cliente después de la hidratación
    useEffect(() => {
        setMounted(true);

        // Función para cargar el tema guardado
        const loadSavedTheme = () => {
            try {
                const savedThemeId = localStorage.getItem('app-theme');
                if (savedThemeId) {
                    const savedTheme = themes.find(t => t.id === savedThemeId);
                    if (savedTheme) {
                        setCurrentTheme(savedTheme);
                    }
                }
            } catch (error) {
                console.warn('Error loading saved theme:', error);
            }
        };

        loadSavedTheme();
    }, []);

    const setTheme = (themeId: string) => {
        const theme = themes.find(t => t.id === themeId);
        if (theme) {
            setCurrentTheme(theme);
            if (mounted) {
                try {
                    localStorage.setItem('app-theme', themeId);
                } catch (error) {
                    console.warn('Error saving theme:', error);
                }
            }
        }
    };

    return (
        <ThemeContext.Provider value={{
            currentTheme,
            setTheme,
            themes,
            isHydrated: mounted
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
    }
    return context;
}
