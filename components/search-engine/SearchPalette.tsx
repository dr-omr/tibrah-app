import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useSearch } from './SearchContext';
import styles from './SearchSystem.module.css';
import {
    Search, X, Clock, Compass, Sparkles, Activity,
    BookOpen, Settings, Package, FileText, ShoppingBag,
    Calendar, Heart, Brain, Zap, Stethoscope, ArrowUpRight,
    Mic, Trash2
} from 'lucide-react';
import { SearchIndexItem, buildUnifiedIndex } from '@/lib/search/UnifiedIndexBuilder';
import Fuse, { FuseResult, FuseResultMatch } from 'fuse.js';
import { normalizeSearchString, mapEnglishToArabicKeyboard, expandQueryWithSynonyms } from '@/lib/search/normalization';
import { PreviewPane } from './PreviewPane';
import { SearchHeader } from './SearchHeader';
import { SearchResults } from './SearchResults';

// ============================================
// COMPONENT
// ============================================
export function SearchPalette() {
    const { isOpen, closeSearch, query, setQuery, recentSearches, saveRecentSearch, removeRecentSearch, clearRecentSearches } = useSearch();
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [fuse, setFuse] = useState<Fuse<SearchIndexItem> | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Toggle Voice Search
    const toggleVoiceSearch = () => {
        const SpeechRecognitionApi = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognitionApi) {
            alert('خاصية الإملاء الصوتي غير مدعومة في متصفحك.');
            return;
        }

        if (isListening) return; // Wait for it to end

        const recognition = new SpeechRecognitionApi();
        recognition.lang = 'ar-SA';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
            const speechResult = event.results[event.results.length - 1][0].transcript;
            setQuery(speechResult);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => {
            setIsListening(false);
            if (inputRef.current) inputRef.current.focus();
        };

        recognition.start();
    };

    // Build the deep index on mount
    useEffect(() => {
        let isMounted = true;
        buildUnifiedIndex().then(indexData => {
            if (!isMounted) return;
            const fuseInstance = new Fuse(indexData, {
                keys: [
                    { name: 'title', weight: 5 },
                    { name: 'description', weight: 3 },
                    { name: 'content', weight: 1 }
                ],
                // Strict threshold for accuracy. 0.2 means very low error tolerance (Google-like strictness).
                threshold: 0.15, // Even stricter to rely heavily on our cascading fallbacks!
                distance: 2000,       // Allow match anywhere in the text
                ignoreLocation: true, // Keyword location doesn't decrease score
                includeMatches: true,
                includeScore: true,
                useExtendedSearch: true,
                getFn: (obj, path) => {
                    const value = Fuse.config.getFn(obj, path);
                    if (typeof value === 'string') {
                        return normalizeSearchString(value);
                    }
                    return value;
                }
            });
            setFuse(fuseInstance);
        });
        return () => { isMounted = false; };
    }, []);

    // Auto-focus logic
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Reset selection and filter on query change
    useEffect(() => {
        setSelectedIndex(0);
        // Don't reset filter if they're actively typing, only reset if closed/opened
    }, [query]);

    // Filter and combine results dynamically using 5-Tier Cascading Fuse Architecture
    const { results, suggestedCorrection } = useMemo(() => {
        if (!query.trim() || !fuse) return { results: [], suggestedCorrection: null };
        
        let fuseResults: FuseResult<SearchIndexItem>[] = [];
        let correctedTerm: string | null = null;
        
        // --- TIER 1: Strict Normalized Match ---
        const normalizedQuery = normalizeSearchString(query);
        fuseResults = fuse.search(normalizedQuery);
        
        // --- TIER 2: Lemmatization (Prefix Stripping) ---
        if (fuseResults.length === 0) {
            const lemmatizedQuery = normalizeSearchString(query, true);
            if (lemmatizedQuery !== normalizedQuery) {
                fuseResults = fuse.search(lemmatizedQuery);
                if (fuseResults.length > 0) correctedTerm = null; // No need to say "Did you mean", it's just a smarter match
            }
        }

        // --- TIER 3: Semantic Synonym Injection ---
        if (fuseResults.length === 0) {
            const semanticQuery = expandQueryWithSynonyms(query);
            if (semanticQuery !== normalizedQuery) {
                fuseResults = fuse.search(semanticQuery);
            }
        }
        
        // --- TIER 4: Keyboard Layout Translation (e.g. "rgf" -> "قلب") ---
        if (fuseResults.length === 0) {
            const mappedQuery = mapEnglishToArabicKeyboard(query);
            if (mappedQuery) {
                const mappedResults = fuse.search(normalizeSearchString(mappedQuery, true));
                if (mappedResults.length > 0) {
                    fuseResults = mappedResults;
                    correctedTerm = mappedQuery; 
                }
            }
        }
            
        // --- TIER 5: Loose Typo Tolerance (only if word length > 3 to avoid chaotic junk) ---
        if (fuseResults.length === 0 && query.length >= 3) {
            try {
                const docs = (fuse as any)._docs as SearchIndexItem[];
                if (docs && docs.length > 0) {
                    const looseFuse = new Fuse(docs, { 
                        keys: [{ name: 'title', weight: 5 }, { name: 'description', weight: 2 }], 
                        threshold: 0.45, // Open up for multi-character mistakes 
                        distance: 100, 
                        includeScore: true,
                        getFn: (obj, path) => {
                            const val = Fuse.config.getFn(obj, path);
                            return typeof val === 'string' ? normalizeSearchString(val) : val;
                        }
                    });
                    
                    const looseSearch = looseFuse.search(normalizedQuery);
                    
                    // Only trust mathematically significant findings (score <= 0.45)
                    if (looseSearch.length > 0 && looseSearch[0].score !== undefined && looseSearch[0].score <= 0.45) {
                        fuseResults = looseSearch;
                        correctedTerm = looseSearch[0].item.title; // Assume they meant the best result's exact name
                    }
                }
            } catch (e) {}
        }
        
        // Personalized Sorting Strategy: Combine Fuse Score, Global Weight, and Local Memory (Recent Searches Boost)
        const sorted = fuseResults.sort((a, b) => {
            const isARecent = recentSearches.includes(a.item.title) ? 1 : 0;
            const isBRecent = recentSearches.includes(b.item.title) ? 1 : 0;
            
            // Memory boost: -1.0 score modifier for recently searched items ensures they float to top unconditionally
            const scoreA = (a.score || 1) - (a.item.weight * 0.05) - (isARecent * 1.0);
            const scoreB = (b.score || 1) - (b.item.weight * 0.05) - (isBRecent * 1.0);
            
            return scoreA - scoreB;
        });
        
        return { results: sorted.slice(0, 15), suggestedCorrection: correctedTerm };
    }, [query, fuse, recentSearches]);

    // Group results
    const groupedResults = useMemo(() => {
        const groups: Record<string, FuseResult<SearchIndexItem>[]> = {};
        
        let filtered = results;
        if (activeFilter !== 'all') {
            filtered = results.filter(res => res.item.category === activeFilter);
        }

        filtered.forEach(res => {
            if (!groups[res.item.category]) groups[res.item.category] = [];
            groups[res.item.category].push(res);
        });
        return groups;
    }, [results, activeFilter]);

    // Flat array for keyboard navigation indexing
    const flatResults = useMemo(() => {
        const flat: FuseResult<SearchIndexItem>[] = [];
        Object.values(groupedResults).forEach(items => flat.push(...items));
        return flat;
    }, [groupedResults]);

    const handleSelect = (href: string, title: string, newTab: boolean = false) => {
        saveRecentSearch(query || title); // Save query if typed, otherwise just title
        closeSearch();
        if (newTab) {
            window.open(href, '_blank');
        } else {
            router.push(href);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setToastMessage('تم نسخ الرابط بنجاح!');
        setTimeout(() => setToastMessage(null), 2000);
    };

    // Keyboard navigation (Apple HIG + Microsoft Fluent Modifiers)
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                closeSearch();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, (query.trim() ? flatResults.length : recentSearches.length + 4) - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'PageDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 5, (query.trim() ? flatResults.length : recentSearches.length + 4) - 1));
            } else if (e.key === 'PageUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 5, 0));
            } else if (e.key === 'Home') {
                e.preventDefault();
                setSelectedIndex(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                setSelectedIndex((query.trim() ? flatResults.length : recentSearches.length + 4) - 1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const isNewTab = e.ctrlKey || e.metaKey;
                const isCopy = e.shiftKey;

                if (query.trim() && flatResults[selectedIndex]) {
                    const item = flatResults[selectedIndex].item;
                    if (isCopy) {
                        handleCopy(window.location.origin + item.href);
                    } else {
                        handleSelect(item.href, item.title, isNewTab);
                    }
                } else if (!query.trim()) {
                    // Empty state enter logic (Recent searches or quick links)
                    const totalRecent = recentSearches.length;
                    if (selectedIndex < totalRecent) {
                        setQuery(recentSearches[selectedIndex]);
                    } else {
                        // Quick actions logic (just rough approx here)
                        const quickActions = [
                            { href: '/health-tracker', title: 'المتابع' },
                            { href: '/shop', title: 'الصيدلية' },
                            { href: '/book-appointment', title: 'حجز' }
                        ];
                        const qaIndex = selectedIndex - totalRecent;
                        if (quickActions[qaIndex]) {
                            handleSelect(quickActions[qaIndex].href, quickActions[qaIndex].title);
                        }
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, flatResults, selectedIndex, recentSearches, query, closeSearch, setQuery]);

    // Scroll selected item into view
    useEffect(() => {
        if (resultsRef.current && isOpen) {
            const selectedItem = resultsRef.current.querySelector('[data-selected="true"]');
            if (selectedItem) {
                selectedItem.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex, isOpen]);

    if (!isOpen) return null;

    let itemIndex = -1; // Global index counter for mapped sections

    return (
        <div className={styles.backdrop} onClick={closeSearch}>
            <div className={styles.palette} onClick={e => e.stopPropagation()}>
                <div className={styles.columns}>
                    <div className={styles.mainColumn}>
                        {/* Search Header */}
                        <SearchHeader 
                            query={query} 
                            setQuery={setQuery} 
                            inputRef={inputRef} 
                            isListening={isListening} 
                            toggleVoiceSearch={toggleVoiceSearch} 
                        />

                        {/* Tabs / Filters (Only show if typing or results exist) */}
                        {query.trim().length > 0 && (
                            <div className={styles.tabsContainer}>
                                {[
                                    { id: 'all', label: 'الكل' },
                                    { id: 'pages', label: 'الصفحات' },
                                    { id: 'health', label: 'الطب التشريحي' },
                                    { id: 'tools', label: 'علاجات شعورية' },
                                    { id: 'pharmacy', label: 'الصيدلية' },
                                    { id: 'library', label: 'المكتبة' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        className={`${styles.filterTab} ${activeFilter === tab.id ? styles.activeTab : ''}`}
                                        onClick={() => {
                                            setActiveFilter(tab.id);
                                            setSelectedIndex(0);
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Content Area / Results */}
                        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                            {toastMessage && (
                                <div style={{
                                    position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
                                    zIndex: 100, backgroundColor: '#10B981', color: 'white', padding: '6px 16px',
                                    borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', animation: 'scaleIn 0.2s ease-out'
                                }}>
                                    {toastMessage}
                                </div>
                            )}
                            <SearchResults 
                                query={query}
                                setQuery={setQuery}
                                results={results}
                                groupedResults={groupedResults}
                                selectedIndex={selectedIndex}
                                setSelectedIndex={setSelectedIndex}
                                handleSelect={handleSelect}
                                suggestedCorrection={suggestedCorrection}
                                resultsRef={resultsRef}
                            />
                        </div>
                    </div> {/* End mainColumn */}

                {/* Preview Column (Desktop Only) */}
                <div className={styles.previewColumn}>
                    <PreviewPane 
                        selectedItem={query.trim().length > 0 && flatResults[selectedIndex] ? flatResults[selectedIndex].item : null} 
                        onSelect={handleSelect}
                        onCopy={handleCopy}
                    />
                </div> {/* End previewColumn */}
                
                </div> {/* End columns layout */}

                {/* Footer Footer */}
                <div className={styles.footer}>
                    <div className={styles.branding}>
                        <Sparkles size={12} /> طِبرَا
                    </div>
                    <div className={styles.keyboardHints}>
                        <div className={styles.hint}><span className={styles.key}>↑↓</span> تنقل</div>
                        <div className={styles.hint}><span className={styles.key}>↵</span> فتح</div>
                        <div className={styles.hint}><span className={styles.key}>esc</span> إغلاق</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
