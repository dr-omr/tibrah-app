// contexts/LanguageContext.tsx
// i18n system with Arabic (default) and English support
// Translations loaded from separate JSON files for maintainability

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Import translations from separate JSON files
import arTranslations from '../locales/ar.json';
import enTranslations from '../locales/en.json';

// ============================================
// TYPES
// ============================================

export type Language = 'ar' | 'en';
export type TranslationKey = keyof typeof arTranslations;

// ============================================
// TRANSLATIONS (loaded from JSON files)
// ============================================

export const translations = {
    ar: arTranslations,
    en: enTranslations,
} as const;

// ============================================
// CONTEXT
// ============================================

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
    dir: 'rtl' | 'ltr';
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
    language: 'ar',
    setLanguage: () => { },
    t: (key) => key,
    dir: 'rtl',
    isRTL: true,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('ar');

    // Load saved language
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('tibrah_language') as Language;
            if (saved && (saved === 'ar' || saved === 'en')) {
                setLanguageState(saved);
            }
        }
    }, []);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        if (typeof window !== 'undefined') {
            localStorage.setItem('tibrah_language', lang);
            // Update document direction
            document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = lang;
        }
    }, []);

    const t = useCallback((key: TranslationKey): string => {
        return translations[language][key] || translations['ar'][key] || key;
    }, [language]);

    const dir = language === 'ar' ? 'rtl' : 'ltr';
    const isRTL = language === 'ar';

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dir, isRTL }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}

export default LanguageContext;
