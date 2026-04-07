import React from 'react';
import { Search, X, Mic } from 'lucide-react';
import styles from './SearchSystem.module.css';

interface SearchHeaderProps {
    query: string;
    setQuery: (val: string) => void;
    inputRef: React.RefObject<HTMLInputElement>;
    isListening: boolean;
    toggleVoiceSearch: () => void;
}

export function SearchHeader({ query, setQuery, inputRef, isListening, toggleVoiceSearch }: SearchHeaderProps) {
    return (
        <div className={styles.header}>
            <Search className={styles.searchIcon} />
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن عرض، مشكلة، منتج، أو مقال..."
                className={styles.input}
            />
            
            {query ? (
                <button className={styles.clearButton} onClick={() => setQuery('')}>
                    <X size={16} />
                </button>
            ) : (
                <div className={styles.shortcutGroup}>
                    <button 
                        className={`${styles.voiceButton} ${isListening ? styles.listening : ''}`} 
                        onClick={toggleVoiceSearch}
                        title="البحث الصوتي"
                    >
                        <Mic size={16} />
                    </button>
                    <div className={styles.shortcutLabel}>ESC</div>
                </div>
            )}
        </div>
    );
}
