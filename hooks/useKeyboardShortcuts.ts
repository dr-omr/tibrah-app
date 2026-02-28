/**
 * useKeyboardShortcuts — Global keyboard shortcuts hook
 * Ctrl+K = Search, Ctrl+/ = AI Assistant, Escape = close modals
 */

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

interface ShortcutHandlers {
    onSearch?: () => void;
    onAI?: () => void;
}

export function useKeyboardShortcuts({ onSearch, onAI }: ShortcutHandlers = {}) {
    const router = useRouter();

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Don't trigger if typing in an input
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

        // Ctrl+K / Cmd+K = Open Search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            onSearch?.();
        }

        // Ctrl+/ or Cmd+/ = AI Assistant
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            if (onAI) {
                onAI();
            } else {
                router.push('/ai-assistant');
            }
        }

        // Alt+H = Health Tracker
        if (e.altKey && e.key === 'h') {
            e.preventDefault();
            router.push('/health-tracker');
        }

        // Alt+S = Shop
        if (e.altKey && e.key === 's') {
            e.preventDefault();
            router.push('/shop');
        }

        // Alt+B = Book Appointment
        if (e.altKey && e.key === 'b') {
            e.preventDefault();
            router.push('/book-appointment');
        }
    }, [onSearch, onAI, router]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

/** Keyboard shortcuts info for display */
export const shortcutsList = [
    { keys: 'Ctrl + K', label: 'بحث سريع' },
    { keys: 'Ctrl + /', label: 'المساعد الذكي' },
    { keys: 'Alt + H', label: 'المتابع الصحي' },
    { keys: 'Alt + S', label: 'المتجر' },
    { keys: 'Alt + B', label: 'حجز موعد' },
];
