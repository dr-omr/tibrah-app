// components/common/CommandPalette.tsx
// Premium Spotlight-style Command Palette with glassmorphism & animations
// Triggered by Search button or Ctrl+K / ⌘+K

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import {
    Search, X, ArrowRight, Clock, Sparkles, TrendingUp,
    Heart, Activity, FileText, BookOpen, ShoppingBag, Stethoscope,
    Calendar, Brain, Droplets, Moon, Pill, Scale, Timer,
    Music, Radio, User, Settings, HelpCircle, Flame, Utensils,
    ChefHat, Zap, Compass, Star, ArrowUpRight, Command
} from 'lucide-react';

// ============================================
// SEARCH INDEX - All navigable items
// ============================================

interface SearchItem {
    id: string;
    title: string;
    titleEn?: string;
    description: string;
    icon: React.ElementType;
    href: string;
    category: 'pages' | 'health' | 'tools' | 'content' | 'settings';
    keywords: string[];
    color: string;
    badge?: string;
}

const searchIndex: SearchItem[] = [
    // === الصفحات الرئيسية ===
    { id: 'home', title: 'الصفحة الرئيسية', titleEn: 'Home', description: 'العودة للصفحة الرئيسية', icon: Compass, href: '/home', category: 'pages', keywords: ['رئيسية', 'home', 'بداية'], color: '#2D9B83' },
    { id: 'services', title: 'خدماتنا', titleEn: 'Services', description: 'تصفح جميع خدمات طِبرَا', icon: Sparkles, href: '/services', category: 'pages', keywords: ['خدمات', 'services', 'برامج'], color: '#8B5CF6', badge: 'جديد' },
    { id: 'shop', title: 'الصيدلية والمكملات', titleEn: 'Pharmacy', description: 'علاجات صحية ومكملات غذائية', icon: ShoppingBag, href: '/shop', category: 'pages', keywords: ['متجر', 'shop', 'منتجات', 'شراء', 'مكملات', 'صيدلية', 'علاج'], color: '#EC4899' },
    { id: 'courses', title: 'الدورات التعليمية', titleEn: 'Courses', description: 'دورات صحية وتطويرية', icon: BookOpen, href: '/courses', category: 'pages', keywords: ['دورات', 'courses', 'تعلم', 'تعليم'], color: '#F59E0B' },
    { id: 'library', title: 'المكتبة الصحية', titleEn: 'Library', description: 'مقالات ومعلومات طبية', icon: FileText, href: '/library', category: 'pages', keywords: ['مكتبة', 'library', 'مقالات', 'قراءة'], color: '#06B6D4' },
    { id: 'about', title: 'من نحن', titleEn: 'About', description: 'تعرف على د. عمرو وطِبرَا', icon: User, href: '/about', category: 'pages', keywords: ['عنا', 'about', 'دكتور', 'عمرو'], color: '#2D9B83' },

    // === أدوات الصحة ===
    { id: 'health-tracker', title: 'المتابع الصحي', titleEn: 'Health Tracker', description: 'تتبع صحتك يومياً بالذكاء الاصطناعي', icon: Activity, href: '/health-tracker', category: 'health', keywords: ['صحة', 'تتبع', 'health', 'tracker', 'متابعة'], color: '#10B981', badge: '⭐' },
    { id: 'meal-planner', title: 'تخطيط الوجبات', titleEn: 'Meal Planner', description: 'خطة غذائية مخصصة لحالتك', icon: Utensils, href: '/meal-planner', category: 'health', keywords: ['وجبات', 'غذاء', 'meal', 'أكل', 'طعام', 'حمية'], color: '#22C55E' },
    { id: 'medical-file', title: 'ملفي الطبي', titleEn: 'Medical File', description: 'بياناتك الصحية في مكان واحد', icon: FileText, href: '/medical-file', category: 'health', keywords: ['ملف', 'طبي', 'medical', 'سجل', 'بيانات'], color: '#3B82F6' },
    { id: 'symptom-analysis', title: 'تحليل الأعراض', titleEn: 'Symptom Analysis', description: 'تحليل ذكي لأعراضك الصحية', icon: Stethoscope, href: '/symptom-analysis', category: 'health', keywords: ['أعراض', 'تحليل', 'symptom', 'تشخيص', 'مرض'], color: '#EF4444' },
    { id: 'body-map', title: 'خريطة الجسم', titleEn: 'Body Map', description: 'حدد مكان الألم بدقة', icon: Heart, href: '/body-map', category: 'health', keywords: ['جسم', 'body', 'ألم', 'map', 'خريطة'], color: '#F43F5E' },
    { id: 'face-scan', title: 'فحص الوجه', titleEn: 'Face Scan', description: 'تحليل البشرة بالذكاء الاصطناعي', icon: Zap, href: '/diagnosis/face-scan', category: 'health', keywords: ['وجه', 'face', 'بشرة', 'فحص', 'scan'], color: '#A855F7' },

    // === أدوات علاجية ===
    { id: 'breathe', title: 'تمارين التنفس', titleEn: 'Breathing', description: 'تمارين استرخاء وتنفس عميق', icon: Brain, href: '/breathe', category: 'tools', keywords: ['تنفس', 'breathe', 'استرخاء', 'تأمل', 'هدوء'], color: '#6366F1' },
    { id: 'frequencies', title: 'الترددات العلاجية', titleEn: 'Frequencies', description: 'ترددات شفائية للجسم والروح', icon: Radio, href: '/frequencies', category: 'tools', keywords: ['ترددات', 'frequencies', 'علاج', 'صوت'], color: '#0EA5E9' },
    { id: 'rife', title: 'ترددات رايف', titleEn: 'Rife Frequencies', description: 'ترددات رايف المتقدمة', icon: Music, href: '/rife-frequencies', category: 'tools', keywords: ['رايف', 'rife', 'ترددات', 'علاج'], color: '#14B8A6' },
    { id: 'emotional', title: 'الطب العاطفي', titleEn: 'Emotional Medicine', description: 'علاج المشاعر والعواطف', icon: Heart, href: '/emotional-medicine', category: 'tools', keywords: ['عاطفي', 'emotional', 'مشاعر', 'نفسي'], color: '#EC4899' },

    // === محتوى ===
    { id: 'book-appointment', title: 'حجز موعد', titleEn: 'Book Appointment', description: 'احجز استشارتك الآن', icon: Calendar, href: '/book-appointment', category: 'content', keywords: ['حجز', 'موعد', 'appointment', 'استشارة', 'book'], color: '#2D9B83', badge: '🏥' },
    { id: 'rewards', title: 'المكافآت', titleEn: 'Rewards', description: 'نقاطك ومكافآتك', icon: Star, href: '/rewards', category: 'content', keywords: ['مكافآت', 'rewards', 'نقاط', 'جوائز'], color: '#F59E0B' },
    { id: 'my-appointments', title: 'مواعيدي', titleEn: 'My Appointments', description: 'قائمة مواعيدك', icon: Calendar, href: '/my-appointments', category: 'content', keywords: ['مواعيد', 'appointments', 'حجوزات'], color: '#8B5CF6' },

    // === إعدادات ===
    { id: 'profile', title: 'الملف الشخصي', titleEn: 'Profile', description: 'تعديل بياناتك الشخصية', icon: User, href: '/profile', category: 'settings', keywords: ['ملف', 'profile', 'شخصي', 'حساب'], color: '#64748B' },
    { id: 'settings', title: 'الإعدادات', titleEn: 'Settings', description: 'إعدادات التطبيق', icon: Settings, href: '/settings', category: 'settings', keywords: ['إعدادات', 'settings', 'ضبط'], color: '#64748B' },
    { id: 'help', title: 'المساعدة', titleEn: 'Help', description: 'الأسئلة الشائعة والدعم', icon: HelpCircle, href: '/help', category: 'settings', keywords: ['مساعدة', 'help', 'دعم', 'سؤال'], color: '#64748B' },
];

const categoryLabels: Record<string, { label: string; icon: React.ElementType }> = {
    pages: { label: 'الصفحات', icon: Compass },
    health: { label: 'أدوات الصحة', icon: Activity },
    tools: { label: 'أدوات علاجية', icon: Sparkles },
    content: { label: 'المحتوى', icon: BookOpen },
    settings: { label: 'الإعدادات', icon: Settings },
};

// Quick actions shown when search is empty
const quickActions = [
    { title: 'تتبع صحتك اليوم', icon: Activity, href: '/health-tracker', color: '#10B981' },
    { title: 'تنفس واسترخِ', icon: Brain, href: '/breathe', color: '#6366F1' },
    { title: 'احجز موعد', icon: Calendar, href: '/book-appointment', color: '#2D9B83' },
    { title: 'خطط وجباتك', icon: ChefHat, href: '/meal-planner', color: '#22C55E' },
];

// ============================================
// COMMAND PALETTE COMPONENT
// ============================================

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Load recent searches from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('recentSearches');
            if (saved) setRecentSearches(JSON.parse(saved));
        }
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Filter results
    const results = useMemo(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        return searchIndex
            .filter(item =>
                item.title.includes(query) ||
                item.titleEn?.toLowerCase().includes(q) ||
                item.description.includes(query) ||
                item.keywords.some(k => k.includes(q))
            )
            .sort((a, b) => {
                // Prioritize exact title matches
                const aTitle = a.title.includes(query) || a.titleEn?.toLowerCase().includes(q);
                const bTitle = b.title.includes(query) || b.titleEn?.toLowerCase().includes(q);
                if (aTitle && !bTitle) return -1;
                if (!aTitle && bTitle) return 1;
                return 0;
            });
    }, [query]);

    // Group results by category
    const groupedResults = useMemo(() => {
        const groups: Record<string, SearchItem[]> = {};
        results.forEach(item => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        });
        return groups;
    }, [results]);

    // Flat list for keyboard navigation
    const flatResults = useMemo(() => {
        const flat: SearchItem[] = [];
        Object.values(groupedResults).forEach(items => flat.push(...items));
        return flat;
    }, [groupedResults]);

    // Navigate to result
    const navigateTo = useCallback((href: string, title?: string) => {
        if (title) {
            const updated = [title, ...recentSearches.filter(s => s !== title)].slice(0, 5);
            setRecentSearches(updated);
            if (typeof window !== 'undefined') {
                localStorage.setItem('recentSearches', JSON.stringify(updated));
            }
        }
        onClose();
        router.push(href);
    }, [router, onClose, recentSearches]);

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => Math.min(prev + 1, flatResults.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => Math.max(prev - 1, 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (flatResults[selectedIndex]) {
                        navigateTo(flatResults[selectedIndex].href, flatResults[selectedIndex].title);
                    }
                    break;
                case 'Escape':
                    onClose();
                    break;
            }
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, flatResults, selectedIndex, navigateTo, onClose]);

    // Scroll selected into view
    useEffect(() => {
        if (resultsRef.current) {
            const selected = resultsRef.current.querySelector('[data-selected="true"]');
            selected?.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    // Reset selection when query changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    let itemIndex = -1;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                    />

                    {/* Palette */}
                    <motion.div
                        className="fixed top-[12%] left-1/2 z-[10000] w-[92%] max-w-lg"
                        initial={{ opacity: 0, y: -30, x: '-50%', scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
                        exit={{ opacity: 0, y: -20, x: '-50%', scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                    >
                        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">

                            {/* Search Input */}
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                                <motion.div
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    transition={{ delay: 0.1, type: 'spring' }}
                                >
                                    <Search className="w-5 h-5 text-emerald-500" />
                                </motion.div>
                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="ابحث عن صفحة، أداة، أو خدمة..."
                                    className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 outline-none text-base"
                                    dir="rtl"
                                    autoComplete="off"
                                />
                                {query && (
                                    <motion.button
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                                        onClick={() => setQuery('')}
                                    >
                                        <X className="w-3 h-3 text-slate-500" />
                                    </motion.button>
                                )}
                                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-500 font-mono">
                                    ESC
                                </kbd>
                            </div>

                            {/* Results */}
                            <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto overscroll-contain">
                                {query.trim() === '' ? (
                                    /* Empty state - Quick Actions & Recent */
                                    <div className="p-4 space-y-5">
                                        {/* Quick Actions */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-3 px-1">
                                                <Zap className="w-3.5 h-3.5 text-amber-500" />
                                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">إجراءات سريعة</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {quickActions.map((action, idx) => {
                                                    const Icon = action.icon;
                                                    return (
                                                        <motion.button
                                                            key={action.href}
                                                            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right"
                                                            onClick={() => navigateTo(action.href, action.title)}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: idx * 0.05 }}
                                                            whileTap={{ scale: 0.97 }}
                                                        >
                                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${action.color}15` }}>
                                                                <Icon className="w-4.5 h-4.5" style={{ color: action.color }} />
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{action.title}</span>
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Recent Searches */}
                                        {recentSearches.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-2 px-1">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">بحث سابق</span>
                                                </div>
                                                <div className="space-y-1">
                                                    {recentSearches.map((term, idx) => (
                                                        <motion.button
                                                            key={term}
                                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-right"
                                                            onClick={() => setQuery(term)}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.03 }}
                                                        >
                                                            <Clock className="w-3.5 h-3.5 text-slate-300" />
                                                            <span className="text-sm text-slate-600 dark:text-slate-400">{term}</span>
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Trending */}
                                        <div className="flex items-center gap-2 px-1 pb-2">
                                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="text-xs text-slate-400">جرّب: "صحة" • "ترددات" • "وجبات" • "حجز"</span>
                                        </div>
                                    </div>
                                ) : results.length > 0 ? (
                                    /* Search Results */
                                    <div className="p-2">
                                        {Object.entries(groupedResults).map(([category, items]) => {
                                            const catInfo = categoryLabels[category];
                                            const CatIcon = catInfo?.icon || Compass;
                                            return (
                                                <div key={category} className="mb-2">
                                                    <div className="flex items-center gap-2 px-3 py-2">
                                                        <CatIcon className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                                            {catInfo?.label || category}
                                                        </span>
                                                    </div>
                                                    {items.map((item) => {
                                                        itemIndex++;
                                                        const Icon = item.icon;
                                                        const isSelected = itemIndex === selectedIndex;
                                                        const currentIdx = itemIndex;
                                                        return (
                                                            <motion.button
                                                                key={item.id}
                                                                data-selected={isSelected}
                                                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-right ${isSelected
                                                                    ? 'bg-emerald-50 dark:bg-emerald-900/30 ring-1 ring-emerald-200 dark:ring-emerald-800'
                                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                                    }`}
                                                                onClick={() => navigateTo(item.href, item.title)}
                                                                onMouseEnter={() => setSelectedIndex(currentIdx)}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: currentIdx * 0.03 }}
                                                                whileTap={{ scale: 0.98 }}
                                                            >
                                                                <div
                                                                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform"
                                                                    style={{
                                                                        backgroundColor: `${item.color}12`,
                                                                        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                                                                    }}
                                                                >
                                                                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`font-semibold text-sm ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
                                                                            {item.title}
                                                                        </span>
                                                                        {item.badge && (
                                                                            <span className="text-xs px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-full font-medium">
                                                                                {item.badge}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{item.description}</p>
                                                                </div>
                                                                <motion.div
                                                                    className="flex-shrink-0"
                                                                    animate={{ x: isSelected ? 0 : 5, opacity: isSelected ? 1 : 0 }}
                                                                >
                                                                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                                                                </motion.div>
                                                            </motion.button>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    /* No Results */
                                    <motion.div
                                        className="p-8 text-center"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                    >
                                        <motion.div
                                            className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4"
                                            animate={{ rotate: [0, 10, -10, 0] }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <Search className="w-7 h-7 text-slate-300" />
                                        </motion.div>
                                        <p className="text-slate-600 dark:text-slate-400 font-medium mb-1">لا توجد نتائج لـ "{query}"</p>
                                        <p className="text-xs text-slate-400">جرب كلمات مختلفة أو تصفح الإجراءات السريعة</p>
                                    </motion.div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">↑↓</kbd>
                                        تنقل
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">↵</kbd>
                                        فتح
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">esc</kbd>
                                        إغلاق
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3 text-emerald-500" />
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">طِبرَا</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ============================================
// SEARCH BUTTON (can be used anywhere)
// ============================================
export function SearchButton({ onClick }: { onClick: () => void }) {
    return (
        <motion.button
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/20 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-white/20 dark:hover:bg-slate-700/50 transition-all w-full"
            onClick={onClick}
            whileTap={{ scale: 0.98 }}
        >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-right text-sm">ابحث عن أي شيء...</span>
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-200/50 dark:bg-slate-700 rounded text-xs font-mono">
                <Command className="w-3 h-3" />K
            </kbd>
        </motion.button>
    );
}
