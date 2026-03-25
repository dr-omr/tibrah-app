import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, X } from 'lucide-react';
import { categories } from './data';

interface CourseHeaderProps {
    showSearch: boolean;
    setShowSearch: (show: boolean) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    activeCategory: string;
    setActiveCategory: (category: string) => void;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({
    showSearch,
    setShowSearch,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory
}) => {
    return (
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
            {/* Title bar */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <Link href="/">
                    <button className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                </Link>
                <div className="text-center flex-1">
                    <h1 className="text-lg font-bold text-slate-800 dark:text-white">الدورات التعليمية</h1>
                    <p className="text-xs text-slate-400 font-medium">تعلم الطب الوظيفي من المصدر</p>
                </div>
                <button
                    onClick={() => setShowSearch(!showSearch)}
                    className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                >
                    {showSearch ? <X className="w-4 h-4 text-slate-500" /> : <Search className="w-4 h-4 text-slate-500" />}
                </button>
            </div>

            {/* Search bar (expandable) */}
            <AnimatePresence>
                {showSearch && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden px-4 pb-2"
                    >
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                            <input
                                type="text"
                                placeholder="ابحث عن دورة..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 border border-slate-200/60 dark:border-slate-700/50"
                                autoFocus
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute left-3 top-1/2 -translate-y-1/2"
                                >
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Category pills */}
            <div className="overflow-x-auto scrollbar-hide pb-2.5">
                <div className="flex gap-1.5 px-4 min-w-max">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeCategory === cat.id
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                }`}
                        >
                            <span className="text-sm">{cat.icon}</span>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
