/**
 * Theme Toggle Component
 * Dark/Light mode switcher with smooth transitions
 * Persists user preference in localStorage
 */

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';

interface ThemeToggleProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function ThemeToggle({ className = '', size = 'md' }: ThemeToggleProps) {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Sizes
    const sizes = {
        sm: { button: 'w-10 h-10', icon: 'w-4 h-4' },
        md: { button: 'w-12 h-12', icon: 'w-5 h-5' },
        lg: { button: 'w-14 h-14', icon: 'w-6 h-6' }
    };

    useEffect(() => {
        setMounted(true);
        // Check for saved preference ONLY - default to light mode
        const savedTheme = localStorage.getItem('tibrah_theme');

        // Only enable dark mode if explicitly saved as 'dark'
        if (savedTheme === 'dark') {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            // Default to light mode - remove dark class
            setIsDark(false);
            document.documentElement.classList.remove('dark');
            // If no saved preference, set to light
            if (!savedTheme) {
                localStorage.setItem('tibrah_theme', 'light');
            }
        }
    }, []);

    const toggleTheme = () => {
        haptic.tap();

        const newIsDark = !isDark;
        setIsDark(newIsDark);

        if (newIsDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('tibrah_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('tibrah_theme', 'light');
        }
    };

    // Don't render until mounted to avoid hydration mismatch
    if (!mounted) {
        return (
            <div className={`${sizes[size].button} rounded-full bg-slate-100 animate-pulse ${className}`} />
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className={`
                ${sizes[size].button}
                rounded-full
                flex items-center justify-center
                transition-all duration-300 ease-out
                transform active:scale-95
                ${isDark
                    ? 'bg-slate-800 text-yellow-400 shadow-lg shadow-slate-900/20'
                    : 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 shadow-lg shadow-amber-200/50'
                }
                hover:shadow-xl
                ${className}
            `}
            aria-label={isDark ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
            title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
        >
            <div className="relative">
                {/* Sun icon */}
                <Sun
                    className={`
                        ${sizes[size].icon}
                        absolute inset-0
                        transition-all duration-300
                        ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
                    `}
                />
                {/* Moon icon */}
                <Moon
                    className={`
                        ${sizes[size].icon}
                        transition-all duration-300
                        ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
                    `}
                />
            </div>
        </button>
    );
}

// Hook for accessing theme state
export function useTheme() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkTheme = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };

        checkTheme();

        // Observer for class changes
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    const setTheme = (dark: boolean) => {
        if (dark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('tibrah_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('tibrah_theme', 'light');
        }
        setIsDark(dark);
    };

    return { isDark, setTheme, toggleTheme: () => setTheme(!isDark) };
}
