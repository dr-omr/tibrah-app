import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface SearchEngineContextType {
    isOpen: boolean;
    query: string;
    recentSearches: string[];
    openSearch: () => void;
    closeSearch: () => void;
    setQuery: (query: string) => void;
    saveRecentSearch: (query: string) => void;
    removeRecentSearch: (query: string) => void;
    clearRecentSearches: () => void;
}

const SearchEngineContext = createContext<SearchEngineContextType | undefined>(undefined);

export function SearchEngineProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    const RECENT_KEY = 'tibrah_search_engine_recent';
    const MAX_RECENT = 5;

    // Load recent on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem(RECENT_KEY);
                if (saved) {
                    setRecentSearches(JSON.parse(saved));
                }
            } catch (e) {
                console.error("Failed to parse recent searches", e);
            }
        }
    }, []);

    const openSearch = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeSearch = useCallback(() => {
        setIsOpen(false);
        setQuery(''); // Reset query on close
    }, []);

    const saveRecentSearch = useCallback((newQuery: string) => {
        const q = newQuery.trim();
        if (!q) return;

        setRecentSearches(prev => {
            const filtered = prev.filter(s => s !== q);
            const updated = [q, ...filtered].slice(0, MAX_RECENT);
            if (typeof window !== 'undefined') {
                localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
            }
            return updated;
        });
    }, []);

    const removeRecentSearch = useCallback((queryToRemove: string) => {
        setRecentSearches(prev => {
            const updated = prev.filter(s => s !== queryToRemove);
            if (typeof window !== 'undefined') {
                localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
            }
            return updated;
        });
    }, []);

    const clearRecentSearches = useCallback(() => {
        setRecentSearches([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(RECENT_KEY);
        }
    }, []);

    // Global Keyboard Shortcut (Ctrl+K or Cmd+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only capture if not typing in inputs (unless we are opening it)
            const tag = (e.target as HTMLElement).tagName;
            const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault(); // Prevent browser search
                openSearch();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [openSearch]);

    return (
        <SearchEngineContext.Provider value={{
            isOpen,
            query,
            recentSearches,
            openSearch,
            closeSearch,
            setQuery,
            saveRecentSearch,
            removeRecentSearch,
            clearRecentSearches
        }}>
            {children}
        </SearchEngineContext.Provider>
    );
}

export function useSearch() {
    const context = useContext(SearchEngineContext);
    if (!context) {
        throw new Error('useSearch must be used within a SearchEngineProvider');
    }
    return context;
}
