'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Theme color presets
export const themePresets = {
    cyan: {
        name: 'السماوي',
        primary: '#0891B2',
        primaryLight: '#22D3EE',
        primaryDark: '#0E7490',
    },
    emerald: {
        name: 'الزمردي',
        primary: '#2D9B83',
        primaryLight: '#3FB39A',
        primaryDark: '#1E7A66',
    },
    ocean: {
        name: 'المحيط',
        primary: '#2563eb',
        primaryLight: '#3b82f6',
        primaryDark: '#1d4ed8',
    },
    sunset: {
        name: 'الغروب',
        primary: '#dc2626',
        primaryLight: '#ef4444',
        primaryDark: '#b91c1c',
    },
    purple: {
        name: 'البنفسجي',
        primary: '#7c3aed',
        primaryLight: '#8b5cf6',
        primaryDark: '#6d28d9',
    },
    gold: {
        name: 'الذهبي',
        primary: '#d97706',
        primaryLight: '#f59e0b',
        primaryDark: '#b45309',
    },
    teal: {
        name: 'الأزرق الفيروزي',
        primary: '#0891B2',
        primaryLight: '#22D3EE',
        primaryDark: '#0E7490',
    },
};

export type ThemePreset = keyof typeof themePresets;

export interface ThemeConfig {
    preset: ThemePreset;
    customPrimary?: string;
    useCustom: boolean;
}

interface ThemeContextType {
    theme: ThemeConfig;
    currentColors: {
        primary: string;
        primaryLight: string;
        primaryDark: string;
    };
    primary: string;
    primaryLight: string;
    primaryDark: string;
    isDarkMode: boolean;
    isHighContrast: boolean;
    toggleDarkMode: () => void;
    toggleHighContrast: () => void;
    setTheme: (config: Partial<ThemeConfig>) => void;
    setPreset: (preset: ThemePreset) => void;
    setCustomColor: (color: string) => void;
    presets: typeof themePresets;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'tibrah_theme';
const DARK_MODE_KEY = 'tibrah_dark_mode';
const HIGH_CONTRAST_KEY = 'tibrah_high_contrast';

// Helper to calculate lighter/darker variants
function adjustColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
        0x1000000 +
        (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeConfig>({
        preset: 'cyan',
        useCustom: false,
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isHighContrast, setIsHighContrast] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Load theme and dark mode from localStorage on mount
    useEffect(() => {
        setMounted(true);
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setThemeState(parsed);
            }
            const darkStored = localStorage.getItem(DARK_MODE_KEY);
            if (darkStored) {
                const isDark = JSON.parse(darkStored);
                setIsDarkMode(isDark);
                if (isDark) {
                    document.documentElement.classList.add('dark');
                }
            }
            const hcStored = localStorage.getItem(HIGH_CONTRAST_KEY);
            if (hcStored) {
                const isHC = JSON.parse(hcStored);
                setIsHighContrast(isHC);
                if (isHC) {
                    document.documentElement.classList.add('high-contrast');
                }
            }
        } catch (e) {
            console.error('Failed to load theme:', e);
        }
    }, []);

    // Calculate current colors
    const currentColors = React.useMemo(() => {
        if (theme.useCustom && theme.customPrimary) {
            return {
                primary: theme.customPrimary,
                primaryLight: adjustColor(theme.customPrimary, 15),
                primaryDark: adjustColor(theme.customPrimary, -15),
            };
        }
        return themePresets[theme.preset] || themePresets.cyan;
    }, [theme]);

    // Apply theme CSS variables and override hardcoded colors
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        root.style.setProperty('--primary', currentColors.primary);
        root.style.setProperty('--primary-light', currentColors.primaryLight);
        root.style.setProperty('--primary-dark', currentColors.primaryDark);

        // Also update gradient stops for dynamic gradients
        root.style.setProperty('--gradient-start', currentColors.primary);
        root.style.setProperty('--gradient-end', currentColors.primaryLight);

        // Inject CSS to override hardcoded Tailwind arbitrary values
        const styleId = 'theme-overrides';
        let styleEl = document.getElementById(styleId) as HTMLStyleElement;

        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
        }

        // Override ALL old hardcoded teal/cyan colors with current theme
        styleEl.textContent = `
            /* Old #2D9B83 emerald teal */
            .bg-\\[\\#2D9B83\\], .bg-\\[\\#2d9b83\\] { background-color: ${currentColors.primary} !important; }
            .text-\\[\\#2D9B83\\], .text-\\[\\#2d9b83\\] { color: ${currentColors.primary} !important; }
            .border-\\[\\#2D9B83\\], .border-\\[\\#2d9b83\\] { border-color: ${currentColors.primary} !important; }
            .from-\\[\\#2D9B83\\], .from-\\[\\#2d9b83\\] { --tw-gradient-from: ${currentColors.primary} !important; }
            .to-\\[\\#3FB39A\\], .to-\\[\\#3fb39a\\] { --tw-gradient-to: ${currentColors.primaryLight} !important; }
            .bg-\\[\\#3FB39A\\], .bg-\\[\\#3fb39a\\] { background-color: ${currentColors.primaryLight} !important; }
            .ring-\\[\\#2D9B83\\], .ring-\\[\\#2d9b83\\] { --tw-ring-color: ${currentColors.primary} !important; }
            .bg-\\[\\#2D9B83\\]\\/5 { background-color: ${currentColors.primary}0d !important; }
            .bg-\\[\\#2D9B83\\]\\/10 { background-color: ${currentColors.primary}1a !important; }
            .bg-\\[\\#2D9B83\\]\\/20 { background-color: ${currentColors.primary}33 !important; }
            .border-\\[\\#2D9B83\\]\\/20 { border-color: ${currentColors.primary}33 !important; }
            .hover\\:bg-\\[\\#2D9B83\\]:hover { background-color: ${currentColors.primary} !important; }
            .hover\\:text-\\[\\#2D9B83\\]:hover { color: ${currentColors.primary} !important; }
            .shadow-\\[\\#2D9B83\\]\\/25 { --tw-shadow-color: ${currentColors.primary}40 !important; }
            .shadow-\\[\\#2D9B83\\]\\/40 { --tw-shadow-color: ${currentColors.primary}66 !important; }
            /* Old #0d9488 teal */
            .bg-\\[\\#0d9488\\], .bg-\\[\\#0D9488\\] { background-color: ${currentColors.primary} !important; }
            .text-\\[\\#0d9488\\], .text-\\[\\#0D9488\\] { color: ${currentColors.primary} !important; }
            .border-\\[\\#0d9488\\], .border-\\[\\#0D9488\\] { border-color: ${currentColors.primary} !important; }
            .from-\\[\\#0d9488\\], .from-\\[\\#0D9488\\] { --tw-gradient-from: ${currentColors.primary} !important; }
            .to-\\[\\#0d9488\\], .to-\\[\\#0D9488\\] { --tw-gradient-to: ${currentColors.primary} !important; }
            .bg-\\[\\#0d9488\\]\\/10 { background-color: ${currentColors.primary}1a !important; }
            .bg-\\[\\#0d9488\\]\\/20 { background-color: ${currentColors.primary}33 !important; }
            /* Old #0f766e dark teal */
            .bg-\\[\\#0f766e\\], .to-\\[\\#0f766e\\], .from-\\[\\#0f766e\\] { background-color: ${currentColors.primaryDark} !important; }
            /* Old #14b8a6 light teal */
            .bg-\\[\\#14b8a6\\], .text-\\[\\#14b8a6\\] { color: ${currentColors.primaryLight} !important; }
            /* Tailwind teal-600 / teal-700 */
            .bg-teal-600 { background-color: ${currentColors.primary} !important; }
            .bg-teal-700 { background-color: ${currentColors.primaryDark} !important; }
            .text-teal-600 { color: ${currentColors.primary} !important; }
            .text-teal-700 { color: ${currentColors.primaryDark} !important; }
            .border-teal-600 { border-color: ${currentColors.primary} !important; }
            .ring-teal-600 { --tw-ring-color: ${currentColors.primary} !important; }
            .from-teal-600 { --tw-gradient-from: ${currentColors.primary} !important; }
            .to-teal-600 { --tw-gradient-to: ${currentColors.primary} !important; }
            .hover\\:bg-teal-700:hover { background-color: ${currentColors.primaryDark} !important; }
        `;
    }, [currentColors, mounted]);

    // Save theme to localStorage
    useEffect(() => {
        if (!mounted) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
        } catch (e) {
            console.error('Failed to save theme:', e);
        }
    }, [theme, mounted]);

    const setTheme = (config: Partial<ThemeConfig>) => {
        setThemeState(prev => ({ ...prev, ...config }));
    };

    const setPreset = (preset: ThemePreset) => {
        setThemeState({ preset, useCustom: false });
    };

    const setCustomColor = (color: string) => {
        setThemeState({
            preset: 'emerald',
            customPrimary: color,
            useCustom: true
        });
    };

    const toggleDarkMode = () => {
        setIsDarkMode(prev => {
            const newValue = !prev;
            if (newValue) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            try {
                localStorage.setItem(DARK_MODE_KEY, JSON.stringify(newValue));
            } catch (e) { /* ignore */ }
            return newValue;
        });
    };

    const toggleHighContrast = () => {
        setIsHighContrast(prev => {
            const newValue = !prev;
            if (newValue) {
                document.documentElement.classList.add('high-contrast');
            } else {
                document.documentElement.classList.remove('high-contrast');
            }
            try {
                localStorage.setItem(HIGH_CONTRAST_KEY, JSON.stringify(newValue));
            } catch (e) { /* ignore */ }
            return newValue;
        });
    };

    return (
        <ThemeContext.Provider value={{
            theme,
            currentColors,
            primary: currentColors.primary,
            primaryLight: currentColors.primaryLight,
            primaryDark: currentColors.primaryDark,
            isDarkMode,
            isHighContrast,
            toggleDarkMode,
            toggleHighContrast,
            setTheme,
            setPreset,
            setCustomColor,
            presets: themePresets,
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// HOC for server-side rendering safety
export function withTheme<P extends object>(
    WrappedComponent: React.ComponentType<P>
): React.FC<P> {
    return function WithThemeComponent(props: P) {
        const [mounted, setMounted] = useState(false);
        useEffect(() => setMounted(true), []);
        if (!mounted) return null;
        return <WrappedComponent {...props} />;
    };
}
