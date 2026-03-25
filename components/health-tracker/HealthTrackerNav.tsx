import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, X, Heart, Activity, Droplets, Moon, Pill, Smile, Calendar, BarChart3 } from 'lucide-react';

interface HealthTrackerNavProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const quickMetrics = [
    { id: 'weight', emoji: '⚖️', label: 'الوزن' },
    { id: 'bp', emoji: '💓', label: 'الضغط' },
    { id: 'fasting', emoji: '⏱️', label: 'الصيام' },
    { id: 'breathing', emoji: '🌬️', label: 'التنفس' },
];

const navTabs = [
    { id: 'summary', icon: Heart, label: 'ملخص' },
    { id: 'activity', icon: Activity, label: 'النشاط' },
    { id: 'water', icon: Droplets, label: 'الماء' },
    { id: 'sleep', icon: Moon, label: 'النوم' },
    { id: 'meds', icon: Pill, label: 'الأدوية' },
    { id: 'mood', icon: Smile, label: 'المزاج' },
    { id: 'history', icon: Calendar, label: 'السجل' },
    { id: 'report', icon: BarChart3, label: 'تقرير' },
];

export default function HealthTrackerNav({ activeTab, setActiveTab }: HealthTrackerNavProps) {
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="sticky top-0 z-30" style={{ background: 'rgba(240,253,250,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(13,148,136,0.08)' }}>
            
            {/* Title Bar */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <Link href="/">
                    <button className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                </Link>
                <h1 className="text-[18px] font-black text-slate-800 dark:text-white">تتبع صحتي</h1>
                <button
                    onClick={() => setShowSearch(!showSearch)}
                    className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                >
                    {showSearch ? <X className="w-4 h-4 text-slate-500" /> : <Search className="w-4 h-4 text-slate-500" />}
                </button>
            </div>

            {/* Expandable Search */}
            <AnimatePresence>
                {showSearch && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden px-4 pb-2"
                    >
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ابحث في السجلات الصحية..."
                            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 border border-slate-200/60 dark:border-slate-700/50"
                            autoFocus
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Metric Chips */}
            <div className="px-4 pb-2">
                <div className="flex gap-2 justify-center">
                    {quickMetrics.map((metric) => (
                        <button
                            key={metric.id}
                            onClick={() => setActiveTab(metric.id)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${activeTab === metric.id
                                ? 'text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                                }`}
                            style={activeTab === metric.id ? { background: 'linear-gradient(135deg, #0d9488, #10b981)' } : {}}
                        >
                            <span className="text-sm">{metric.emoji}</span>
                            <span>{metric.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Navigation Pill Bar */}
            <div className="overflow-x-auto scrollbar-hide pb-2.5">
                <div className="flex gap-1 px-3 min-w-max">
                    {navTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${isActive
                                    ? 'text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                    }`}
                                style={isActive ? { background: 'linear-gradient(135deg, #0d9488, #10b981)' } : {}}
                            >
                                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : ''}`} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
