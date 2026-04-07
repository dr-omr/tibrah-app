// components/health-tracker/TrackerHeader.tsx
// Health Tracker — Smart Header Navigation
// Replaces the old HealthTrackerNav with a premium, compact, animated pill bar.
// Design: Apple Health top nav + last-logged context chip + fluid tab indicator.

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Plus, Heart, Activity, Droplets,
    Moon, Pill, Smile, Calendar, BarChart3,
    Scale, Droplet, Timer, Wind,
} from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { METRIC, type MetricKey } from './tracker-tokens';
import { SPRING_SNAPPY } from '@/lib/tibrah-motion';

interface Tab {
    id:    string;
    label: string;
    icon:  React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    color: string;
}

const TABS: Tab[] = [
    { id: 'summary',   label: 'ملخص',    icon: Heart,     color: '#0d9488' },
    { id: 'activity',  label: 'نشاط',    icon: Activity,  color: METRIC.activity.color },
    { id: 'water',     label: 'ماء',     icon: Droplets,  color: METRIC.water.color },
    { id: 'sleep',     label: 'نوم',     icon: Moon,      color: METRIC.sleep.color },
    { id: 'meds',      label: 'أدوية',   icon: Pill,      color: METRIC.meds.color },
    { id: 'mood',      label: 'مزاج',    icon: Smile,     color: METRIC.mood.color },
    { id: 'weight',    label: 'وزن',     icon: Scale,     color: METRIC.weight.color },
    { id: 'bp',        label: 'ضغط',     icon: Droplet,   color: METRIC.bp.color },
    { id: 'fasting',   label: 'صيام',    icon: Timer,     color: METRIC.fasting.color },
    { id: 'breathing', label: 'تنفس',    icon: Wind,      color: '#0891b2' },
    { id: 'history',   label: 'سجل',     icon: Calendar,  color: '#475569' },
    { id: 'report',    label: 'تقرير',   icon: BarChart3, color: '#6366f1' },
];

/* ── Last-logged context chip ── */
function ContextChip({ lastLogHoursAgo }: { lastLogHoursAgo?: number }) {
    const urgent = !lastLogHoursAgo || lastLogHoursAgo > 8;
    return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
                background: urgent ? 'rgba(217,119,6,0.10)' : 'rgba(22,163,74,0.10)',
                border: `1px solid ${urgent ? 'rgba(217,119,6,0.22)' : 'rgba(22,163,74,0.22)'}`,
            }}>
            <motion.div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: urgent ? '#d97706' : '#16a34a' }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }} />
            <span className="text-[10px] font-bold"
                style={{ color: urgent ? '#d97706' : '#16a34a' }}>
                {urgent
                    ? (lastLogHoursAgo ? `آخر سجل منذ ${lastLogHoursAgo}س` : 'لم تُسجّل اليوم')
                    : `آخر سجل منذ ${lastLogHoursAgo}س`
                }
            </span>
        </div>
    );
}

/* ════════════════════════════════════════════════════
   TRACKER HEADER
   ════════════════════════════════════════════════════ */
interface TrackerHeaderProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onQuickLog: () => void;
    lastLogHoursAgo?: number;
}

export default function TrackerHeader({
    activeTab,
    setActiveTab,
    onQuickLog,
    lastLogHoursAgo,
}: TrackerHeaderProps) {
    const activeTabDef = TABS.find(t => t.id === activeTab) ?? TABS[0];

    return (
        <div className="sticky top-0 z-30"
            style={{
                background: 'rgba(248,250,252,0.95)',
                backdropFilter: 'blur(32px) saturate(180%)',
                borderBottom: `1px solid rgba(0,0,0,0.06)`,
            }}>

            {/* ── Title row ── */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <Link href="/" onClick={() => haptic.selection()}>
                    <motion.div whileTap={{ scale: 0.90 }}
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.07)' }}>
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </motion.div>
                </Link>

                <div className="flex flex-col items-center gap-0.5">
                    <h1 className="text-[17px] font-black text-slate-900 dark:text-white leading-tight">
                        تتبّعي
                    </h1>
                    <ContextChip lastLogHoursAgo={lastLogHoursAgo} />
                </div>

                <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => { haptic.impact(); onQuickLog(); }}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                    style={{
                        background: activeTabDef.color,
                        boxShadow: `0 4px 12px ${activeTabDef.color}40`,
                    }}>
                    <Plus className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                </motion.button>
            </div>

            {/* ── Tab pill bar ── */}
            <div className="overflow-x-auto pb-3"
                style={{ scrollbarWidth: 'none' }}>
                <div className="flex gap-1.5 px-4 min-w-max">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = tab.id === activeTab;
                        return (
                            <motion.button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); haptic.selection(); }}
                                className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11.5px] font-bold whitespace-nowrap"
                                style={{
                                    color: isActive ? 'white' : '#64748b',
                                    background: isActive ? tab.color : 'rgba(0,0,0,0.05)',
                                    boxShadow: isActive ? `0 4px 12px ${tab.color}35` : 'none',
                                }}
                                animate={{
                                    scale: isActive ? 1.04 : 1,
                                }}
                                transition={SPRING_SNAPPY}>
                                <Icon className="w-3.5 h-3.5" style={{ width: 14, height: 14 }} />
                                {tab.label}
                                {/* Active indicator glow */}
                                {isActive && (
                                    <motion.div
                                        layoutId="tabGlow"
                                        className="absolute inset-0 rounded-full"
                                        style={{ background: 'rgba(255,255,255,0.18)' }}
                                        transition={SPRING_SNAPPY}
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
