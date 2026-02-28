/**
 * GlobalSearch — Universal search across the entire Tibrah app
 * Searches: Products, Articles, Pages
 * Features: Instant results, keyboard navigation, recent searches
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, X, Clock, Package, BookOpen,
    FileText, Sparkles, TrendingUp
} from 'lucide-react';
import { localProducts } from '@/lib/products';
import { localArticles } from '@/lib/articles';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface SearchResult {
    id: string;
    title: string;
    subtitle?: string;
    type: 'product' | 'article' | 'page';
    url: string;
}

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

// ═══════════════════════════════════════════════════════════════
// APP PAGES INDEX
// ═══════════════════════════════════════════════════════════════

const appPages: SearchResult[] = [
    { id: 'home', title: 'الرئيسية', type: 'page', url: '/' },
    { id: 'health', title: 'المتابع الصحي', subtitle: 'تتبع الماء والنوم والوزن', type: 'page', url: '/health-tracker' },
    { id: 'meal', title: 'تخطيط الوجبات', subtitle: 'خطة غذائية مخصصة', type: 'page', url: '/meal-planner' },
    { id: 'shop', title: 'المتجر', subtitle: 'مكملات ومنتجات صحية', type: 'page', url: '/shop' },
    { id: 'courses', title: 'الدورات التعليمية', subtitle: 'تعلم عن صحتك', type: 'page', url: '/courses' },
    { id: 'library', title: 'المكتبة الصحية', subtitle: 'مقالات ودراسات', type: 'page', url: '/library' },
    { id: 'services', title: 'خدماتنا', subtitle: 'استشارات ومتابعة', type: 'page', url: '/services' },
    { id: 'book', title: 'حجز موعد', subtitle: 'احجز استشارتك', type: 'page', url: '/book-appointment' },
    { id: 'profile', title: 'حسابي', type: 'page', url: '/profile' },
    { id: 'settings', title: 'الإعدادات', type: 'page', url: '/settings' },
    { id: 'rewards', title: 'الإنجازات', subtitle: 'أوسمة وتحديات', type: 'page', url: '/rewards' },
    { id: 'medical', title: 'الملف الطبي', subtitle: 'بياناتك الصحية', type: 'page', url: '/medical-file' },
    { id: 'bodymap', title: 'خريطة الجسم', subtitle: 'تشخيص بصري', type: 'page', url: '/body-map' },
    { id: 'symptoms', title: 'تحليل الأعراض', type: 'page', url: '/symptom-analysis' },
    { id: 'about', title: 'من نحن', type: 'page', url: '/about' },
    { id: 'ai', title: 'المساعد الذكي', subtitle: 'اسأل طِبرَا', type: 'page', url: '/ai-assistant' },
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const RECENT_KEY = 'tibrah_recent_searches';
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveRecentSearch(query: string) {
    const recent = getRecentSearches().filter(s => s !== query);
    recent.unshift(query);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function getTypeIcon(type: string) {
    switch (type) {
        case 'product': return <Package className="w-4 h-4 text-green-500" />;
        case 'article': return <BookOpen className="w-4 h-4 text-blue-500" />;
        case 'page': return <FileText className="w-4 h-4 text-purple-500" />;
        default: return <Search className="w-4 h-4 text-slate-400" />;
    }
}

function getTypeLabel(type: string) {
    switch (type) {
        case 'product': return 'منتج';
        case 'article': return 'مقال';
        case 'page': return 'صفحة';
        default: return '';
    }
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setRecentSearches(getRecentSearches());
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
        }
    }, [isOpen]);

    const performSearch = useCallback((searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        const q = searchQuery.toLowerCase().trim();
        const found: SearchResult[] = [];

        // Search pages
        appPages.forEach(page => {
            if (page.title.includes(q) || (page.subtitle && page.subtitle.includes(q))) {
                found.push(page);
            }
        });

        // Search products
        localProducts.forEach(product => {
            if (product.name.includes(q) || product.description.includes(q) ||
                (product.name_en && product.name_en.toLowerCase().includes(q))) {
                found.push({
                    id: `product-${product.id}`,
                    title: product.name,
                    subtitle: `${product.price} ر.س`,
                    type: 'product',
                    url: `/shop?search=${encodeURIComponent(product.name)}`,
                });
            }
        });

        // Search articles
        localArticles.forEach((article) => {
            if (article.title?.includes(q) || article.summary?.includes(q) ||
                article.tags?.some((t: string) => t.includes(q))) {
                found.push({
                    id: `article-${article.id}`,
                    title: article.title,
                    subtitle: article.category,
                    type: 'article',
                    url: `/library?article=${article.id}`,
                });
            }
        });

        setResults(found.slice(0, 12));
        setSelectedIndex(0);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => performSearch(query), 150);
        return () => clearTimeout(timer);
    }, [query, performSearch]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleSelect = (result: SearchResult) => {
        if (query.trim()) saveRecentSearch(query.trim());
        router.push(result.url);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="w-full max-w-lg mx-auto mt-16 px-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                        {/* Search Input */}
                        <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
                            <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="ابحث عن أي شيء..."
                                className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 outline-none text-lg"
                                dir="rtl"
                            />
                            {query && (
                                <button onClick={() => setQuery('')} className="p-1">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            )}
                        </div>

                        {/* Results */}
                        <div className="max-h-[60vh] overflow-y-auto">
                            {/* Recent Searches */}
                            {!query && recentSearches.length > 0 && (
                                <div className="p-4">
                                    <p className="text-xs text-slate-400 font-medium mb-3 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        عمليات بحث سابقة
                                    </p>
                                    {recentSearches.map((recent, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setQuery(recent)}
                                            className="w-full text-right px-3 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                                        >
                                            <Clock className="w-3.5 h-3.5 text-slate-300" />
                                            {recent}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Quick Links */}
                            {!query && (
                                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                                    <p className="text-xs text-slate-400 font-medium mb-3 flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        الأكثر زيارة
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { name: 'المتابع الصحي', url: '/health-tracker', emoji: '💊' },
                                            { name: 'المتجر', url: '/shop', emoji: '🛒' },
                                            { name: 'حجز موعد', url: '/book-appointment', emoji: '📅' },
                                            { name: 'المساعد الذكي', url: '/ai-assistant', emoji: '🤖' },
                                        ].map((item) => (
                                            <button
                                                key={item.url}
                                                onClick={() => { router.push(item.url); onClose(); }}
                                                className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors text-sm"
                                            >
                                                <span>{item.emoji}</span>
                                                <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Search Results */}
                            {query && results.length > 0 && (
                                <div className="p-2">
                                    {results.map((result, idx) => (
                                        <button
                                            key={result.id}
                                            onClick={() => handleSelect(result)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-right ${idx === selectedIndex
                                                    ? 'bg-[#2D9B83]/10 text-[#2D9B83]'
                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${idx === selectedIndex ? 'bg-[#2D9B83]/20' : 'bg-slate-100 dark:bg-slate-800'
                                                }`}>
                                                {getTypeIcon(result.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-800 dark:text-white truncate">{result.title}</p>
                                                {result.subtitle && (
                                                    <p className="text-xs text-slate-400 truncate">{result.subtitle}</p>
                                                )}
                                            </div>
                                            <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex-shrink-0">
                                                {getTypeLabel(result.type)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* No Results */}
                            {query && results.length === 0 && (
                                <div className="py-12 text-center">
                                    <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 dark:text-slate-400">لا توجد نتائج لـ &quot;{query}&quot;</p>
                                    <p className="text-xs text-slate-400 mt-1">حاول كلمات مختلفة</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                            <span>↑↓ تنقل • Enter اختيار • Esc إغلاق</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
