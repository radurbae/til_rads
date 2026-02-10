'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Language } from '@/lib/i18n';

export type Theme = 'light' | 'dark';

interface AppSettingsContextValue {
    language: Language;
    setLanguage: (language: Language) => void;
    theme: Theme;
    toggleTheme: () => void;
}

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

interface AppSettingsProviderProps {
    children: React.ReactNode;
}

function getPreferredTheme(): Theme {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getPreferredLanguage(): Language {
    if (typeof window === 'undefined') return 'id';
    return window.navigator.language.toLowerCase().startsWith('id') ? 'id' : 'en';
}

export default function AppSettingsProvider({ children }: AppSettingsProviderProps) {
    const [theme, setTheme] = useState<Theme>('light');
    const [language, setLanguage] = useState<Language>('id');

    useEffect(() => {
        const storedTheme = window.localStorage.getItem('theme');
        const storedLanguage = window.localStorage.getItem('language');

        if (storedTheme === 'light' || storedTheme === 'dark') {
            setTheme(storedTheme);
        } else {
            setTheme(getPreferredTheme());
        }

        if (storedLanguage === 'id' || storedLanguage === 'en') {
            setLanguage(storedLanguage);
        } else {
            setLanguage(getPreferredLanguage());
        }
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.style.colorScheme = theme;
        window.localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        document.documentElement.lang = language;
        window.localStorage.setItem('language', language);
    }, [language]);

    const value = useMemo<AppSettingsContextValue>(() => {
        return {
            language,
            setLanguage,
            theme,
            toggleTheme: () => setTheme((current) => (current === 'light' ? 'dark' : 'light')),
        };
    }, [language, theme]);

    return (
        <AppSettingsContext.Provider value={value}>
            {children}
        </AppSettingsContext.Provider>
    );
}

export function useAppSettings() {
    const context = useContext(AppSettingsContext);
    if (!context) {
        throw new Error('useAppSettings must be used inside AppSettingsProvider');
    }
    return context;
}
