// components/health-tracker/TrackerHeader.tsx — V3 "Command Center"
// Premium redesign: gradient hero banner + frosted tab rail.
// Inspired by Apple Health top card + Oura Ring dashboard header.

import React, { useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Plus, Heart, Activity, Droplets,
    Moon, Pill, Smile, Calendar, BarChart3,
    Scale, Droplet, Timer, Wind, Zap,
} from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { METRIC, type MetricKey } from './tracker-tokens';
import { SPRING_SNAPPY } from '@/lib/tibrah-motion';

/* ─── Tab definition ─────────────────────────────────────────── */
interface Tab { id: string; label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string; emoji: string; }

const TABS: Tab[] = [
    { id: 'summary',   label: 'ملخص',   icon: Heart,     color: '#0d9488', emoji: '✦'  },
    { id: 'activity',  label: 'نشاط',   icon: Activity,  color: METRIC.activity.color,  emoji: '🏃' },
    { id: 'water',     label: 'ماء',    icon: Droplets,  color: METRIC.water.color,     emoji: '💧' },
    { id: 'sleep',     label: 'نوم',    icon: Moon,      color: METRIC.sleep.color,     emoji: '🌙' },
    { id: 'meds',      label: 'أدوية',  icon: Pill,      color: METRIC.meds.color,      emoji: '💊' },
    { id: 'mood',      label: 'مزاج',   icon: Smile,     color: METRIC.mood.color,      emoji: '😊' },
    { id: 'weight',    label: 'وزن',    icon: Scale,     color: METRIC.weight.color,    emoji: '⚖️' },
    { id: 'bp',        label: 'ضغط',    icon: Droplet,   color: METRIC.bp.color,        emoji: '🩺' },
    { id: 'fasting',   label: 'صيام',   icon: Timer,     color: METRIC.fasting.color,   emoji: '⏱️' },
    { id: 'breathing', label: 'تنفس',   icon: Wind,      color: '#0891b2',              emoji: '🌬' },
    { id: 'history',   label: 'سجل',    icon: Calendar,  color: '#475569',              emoji: '📅' },
    { id: 'report',    label: 'تقرير',  icon: BarChart3, color: '#6366f1',              emoji: '📊' },
];

/* ─── Hero gradient colors by tab ───────────────────────────── */
const HERO_GRADIENTS: Record<string, [string, string]> = {
    summary:   ['#0d9488', '#14b8a6'],
    activity:  ['#ea580c', '#f97316'],
    water:     ['#0369a1', '#0891b2'],
    sleep:     ['#312e81', '#4f46e5'],
    meds:      ['#7e22ce', '#9333ea'],
    mood:      ['#b45309', '#d97706'],
    weight:    ['#374151', '#6b7280'],
    bp:        ['#9f1239', '#e11d48'],
    fasting:   ['#4d7c0f', '#65a30d'],
    breathing: ['#0e7490', '#0891b2'],
    history:   ['#334155', '#64748b'],
    report:    ['#3730a3', '#6366f1'],
};

/* ─── Date helpers ───────────────────────────────────────────── */
function todayStr() {
    return new Date().toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' });
}
function greetingStr() {
    const h = new Date().getHours();
    return h < 12 ? 'صباح الصحة' : h < 17 ? 'وقت التتبع' : 'مساء العافية';
}

/* ─── Context chip ───────────────────────────────────────────── */
function ContextChip({ lastLogHoursAgo, tabColor }: { lastLogHoursAgo?: number; tabColor: string }) {
    const urgent = !lastLogHoursAgo || lastLogHoursAgo > 8;
    return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}>
            <motion.div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: urgent ? '#fcd34d' : '#86efac' }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }} />
            <span className="text-[9.5px] font-bold text-white/85">
                {urgent
                    ? (lastLogHoursAgo ? `آخر سجل ${lastLogHoursAgo}س` : 'لم تُسجّل اليوم')
                    : `مُحدَّث منذ ${lastLogHoursAgo}س`}
            </span>
        </div>
    );
}

/* ─── Mini metric pills (shown in summary hero) ──────────────── */
function HeroPills() {
    const pills = [
        { emoji: '💧', label: 'ماء' },
        { emoji: '🌙', label: 'نوم' },
        { emoji: '🏃', label: 'نشاط' },
    ];
    return (
        <div className="flex gap-1.5 mt-2">
            {pills.map((p, i) => (
                <motion.div key={p.label}
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.07 }}
                    className="flex items-center gap-1 px-2 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
                    <span className="text-[11px]">{p.emoji}</span>
                    <span className="text-[9px] font-bold text-white/80">{p.label}</span>
                </motion.div>
            ))}
        </div>
    );
}

/* ════════════════════════════════════════════════════
   TRACKER HEADER
   ════════════════════════════════════════════════════ */
interface TrackerHeaderProps {
    activeTab:        string;
    setActiveTab:     (tab: string) => void;
    onQuickLog:       () => void;
    lastLogHoursAgo?: number;
    bodyScore?:       number;   // 0-100
}

export default function TrackerHeader({
    activeTab, setActiveTab, onQuickLog, lastLogHoursAgo, bodyScore = 74,
}: TrackerHeaderProps) {
    const activeTabDef = TABS.find(t => t.id === activeTab) ?? TABS[0];
    const [fromColor, toColor] = HERO_GRADIENTS[activeTab] ?? HERO_GRADIENTS.summary;

    return (
        <div className="sticky top-0 z-30">

            {/* ── Gradient hero banner ───────────────────────── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="relative overflow-hidden px-4 pt-12 pb-4"
                    style={{ background: `linear-gradient(145deg, ${fromColor}EE, ${toColor}DD)` }}>

                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.12] blur-3xl bg-white"
                        style={{ transform: 'translate(30%,-30%)' }} />
                    <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-[0.10] blur-2xl bg-white"
                        style={{ transform: 'translate(-20%,20%)' }} />

                    <div className="relative flex items-center justify-between">
                        {/* Back */}
                        <Link href="/" onClick={() => haptic.selection()}>
                            <motion.div whileTap={{ scale: 0.88 }}
                                className="w-9 h-9 rounded-full flex items-center justify-center"
                                style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)' }}>
                                <ChevronLeft className="w-5 h-5 text-white" />
                            </motion.div>
                        </Link>

                        {/* Center */}
                        <div className="flex flex-col items-center gap-1.5">
                            <motion.h1 key={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                                className="text-[18px] font-black text-white leading-none">
                                {activeTab === 'summary' ? greetingStr() : activeTabDef.label}
                            </motion.h1>
                            <ContextChip lastLogHoursAgo={lastLogHoursAgo} tabColor={fromColor} />
                        </div>

                        {/* Log FAB */}
                        <motion.button whileTap={{ scale: 0.86 }}
                            onClick={() => { haptic.impact(); onQuickLog(); }}
                            className="w-9 h-9 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.28)', backdropFilter: 'blur(8px)', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
                            <Plus className="w-5 h-5 text-white" />
                        </motion.button>
                    </div>

                    {/* Summary hero extras */}
                    {activeTab === 'summary' && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                            className="mt-3 flex items-end justify-between">
                            <div>
                                <p className="text-[11px] text-white/60 font-medium">{todayStr()}</p>
                                <HeroPills />
                            </div>
                            {/* Body score mini ring */}
                            <div className="flex flex-col items-center gap-0.5">
                                <div className="relative" style={{ width: 48, height: 48 }}>
                                    <svg width={48} height={48} style={{ transform: 'rotate(-90deg)' }}>
                                        <circle cx={24} cy={24} r={18} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="4" />
                                        <motion.circle cx={24} cy={24} r={18} fill="none"
                                            stroke="white" strokeWidth="4" strokeLinecap="round"
                                            strokeDasharray={2 * Math.PI * 18}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 18 }}
                                            animate={{ strokeDashoffset: 2 * Math.PI * 18 - (bodyScore / 100) * 2 * Math.PI * 18 }}
                                            transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
                                            style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-[13px] font-black text-white">{bodyScore}</span>
                                    </div>
                                </div>
                                <span className="text-[8px] text-white/60 font-bold">نقاط</span>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* ── Tab rail ──────────────────────────────────── */}
            <div className="overflow-x-auto py-2.5"
                style={{
                    background: 'rgba(240,250,248,0.97)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    borderBottom: '1px solid rgba(255,255,255,0.70)',
                    scrollbarWidth: 'none',
                }}>
                <div className="flex gap-1.5 px-4 min-w-max">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = tab.id === activeTab;
                        return (
                            <motion.button key={tab.id}
                                onClick={() => { setActiveTab(tab.id); haptic.selection(); }}
                                className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-bold whitespace-nowrap"
                                style={{
                                    color:      isActive ? 'white' : '#64748b',
                                    background: isActive ? tab.color : 'rgba(0,0,0,0.04)',
                                    boxShadow:  isActive ? `0 4px 14px ${tab.color}45` : 'none',
                                }}
                                animate={{ scale: isActive ? 1.05 : 1 }}
                                transition={SPRING_SNAPPY}>
                                <Icon style={{ width: 13, height: 13 }} />
                                {tab.label}
                                {isActive && (
                                    <motion.div layoutId="tabPill"
                                        className="absolute inset-0 rounded-full"
                                        style={{ background: 'rgba(255,255,255,0.15)' }}
                                        transition={SPRING_SNAPPY} />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
