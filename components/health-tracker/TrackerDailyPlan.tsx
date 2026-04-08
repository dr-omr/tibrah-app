// components/health-tracker/TrackerDailyPlan.tsx
// NEW — Smart daily health plan: morning / afternoon / evening tasks
// Apple Reminders × Health × Streaks style
// Time-aware: shows current period first, fades completed tasks
// Glass Light canvas, spring physics tick animation

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sun, CloudSun, Moon, CheckCircle2, Circle,
    Droplets, Flame, Brain, Wind, Pill, Apple,
} from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { TC } from './tracker-tokens';
import { STAGGER_ITEM } from '@/lib/tibrah-motion';

interface Task {
    id:     string;
    label:  string;
    sub:    string;
    icon:   React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    color:  string;
}

interface Period {
    id:    'morning' | 'afternoon' | 'evening';
    label: string;
    time:  string;
    icon:  typeof Sun;
    tasks: Task[];
}

const PERIODS: Period[] = [
    {
        id: 'morning', label: 'الصباح', time: '٦ص – ١٢م', icon: Sun,
        tasks: [
            { id: 'm1', label: 'شرب ٢ كوب ماء', sub: 'قبل الإفطار',      icon: Droplets, color: '#2563eb' },
            { id: 'm2', label: 'تسجيل المزاج',  sub: 'كيف تشعر اليوم؟', icon: Brain,    color: '#8b5cf6' },
            { id: 'm3', label: 'أدوية الصباح',  sub: 'حسب البروتوكول',   icon: Pill,     color: '#dc2626' },
            { id: 'm4', label: 'تنفس عميق',      sub: '٥ دقائق',          icon: Wind,     color: '#0891b2' },
        ],
    },
    {
        id: 'afternoon', label: 'الظهيرة', time: '١٢م – ٦م', icon: CloudSun,
        tasks: [
            { id: 'a1', label: 'شرب ٣ أكواب ماء', sub: 'مع وجبة الغداء',  icon: Droplets, color: '#2563eb' },
            { id: 'a2', label: 'نشاط ٣٠ دقيقة',   sub: 'مشي أو تمرين',   icon: Flame,    color: '#ea580c' },
            { id: 'a3', label: 'تسجيل الأعراض',   sub: 'أي تغييرات؟',     icon: Brain,    color: '#0d9488' },
        ],
    },
    {
        id: 'evening', label: 'المساء', time: '٦م – ١٢ل', icon: Moon,
        tasks: [
            { id: 'e1', label: 'أدوية المساء',     sub: 'قبل النوم',       icon: Pill,     color: '#7c3aed' },
            { id: 'e2', label: 'تسجيل النوم',      sub: 'وقت وجودة النوم', icon: Moon,     color: '#6366f1' },
            { id: 'e3', label: 'وجبة خفيفة صحية', sub: 'حسب بروتوكولك',   icon: Apple,    color: '#16a34a' },
        ],
    },
];

const SP = { type: 'spring' as const, stiffness: 480, damping: 32 };

function getCurrentPeriodId(): 'morning' | 'afternoon' | 'evening' {
    const h = new Date().getHours();
    if (h >= 6  && h < 12) return 'morning';
    if (h >= 12 && h < 18) return 'afternoon';
    return 'evening';
}

function TaskRow({
    task, done, onToggle,
}: { task: Task; done: boolean; onToggle: () => void }) {
    const Icon = task.icon;
    return (
        <motion.button
            layout
            whileTap={{ scale: 0.97 }}
            onClick={() => { haptic.selection(); onToggle(); }}
            className="w-full flex items-center gap-3 py-3 text-right"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.55)' }}>

            {/* Tick */}
            <motion.div
                animate={done ? { scale: [1.3, 1], rotate: [0, 15, 0] } : {}}
                transition={SP}
                className="flex-shrink-0">
                {done
                    ? <CheckCircle2 className="w-5 h-5" style={{ color: task.color }} />
                    : <Circle       className="w-5 h-5 text-slate-200" />
                }
            </motion.div>

            {/* Icon */}
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{
                    background: done ? `${task.color}10` : `${task.color}12`,
                    border: `1px solid ${task.color}18`,
                }}>
                <Icon className="w-4 h-4" style={{ color: done ? `${task.color}55` : task.color }} />
            </div>

            {/* Text */}
            <div className="flex-1">
                <p className="text-[13px] font-bold text-right leading-tight"
                    style={{
                        color: done ? '#94A3B8' : '#0F172A',
                        textDecoration: done ? 'line-through' : 'none',
                    }}>
                    {task.label}
                </p>
                <p className="text-[10px] mt-0.5 text-right" style={{ color: '#94A3B8' }}>
                    {task.sub}
                </p>
            </div>
        </motion.button>
    );
}

export function TrackerDailyPlan() {
    const defaultPeriod          = getCurrentPeriodId();
    const [activePeriod, setAP]  = useState<string>(defaultPeriod);
    const [done, setDone]        = useState<Set<string>>(new Set());

    const toggle = (id: string) =>
        setDone(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

    const period     = PERIODS.find(p => p.id === activePeriod) ?? PERIODS[0];
    const completedN = period.tasks.filter(t => done.has(t.id)).length;
    const progress   = period.tasks.length > 0 ? completedN / period.tasks.length : 0;
    const PIcon      = period.icon;

    return (
        <motion.div variants={STAGGER_ITEM} className="px-4">
            <div className="relative overflow-hidden rounded-[24px]"
                style={{
                    background: TC.card.bg,
                    backdropFilter: TC.card.blur,
                    WebkitBackdropFilter: TC.card.blur,
                    border: `1.5px solid ${TC.card.border}`,
                    boxShadow: TC.card.shadow,
                }}>

                {/* Fluent top reflection */}
                <div className="absolute top-0 left-5 right-5 h-px pointer-events-none"
                    style={{ background: TC.card.borderTop }} />

                {/* Header */}
                <div className="px-4 pt-5 pb-3">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                                style={{ background: 'rgba(13,148,136,0.10)', border: '1px solid rgba(13,148,136,0.15)' }}>
                                <PIcon className="w-4 h-4" style={{ color: '#0D9488' }} />
                            </div>
                            <div>
                                <p className="text-[13px] font-black" style={{ color: '#0F172A' }}>خطة يومك الصحية</p>
                                <p className="text-[9.5px] font-semibold mt-0.5" style={{ color: '#94A3B8' }}>
                                    {completedN}/{period.tasks.length} مكتمل
                                </p>
                            </div>
                        </div>

                        {/* Progress pill */}
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full overflow-hidden"
                                style={{ background: 'rgba(0,0,0,0.06)' }}>
                                <motion.div className="h-full rounded-full"
                                    style={{ background: '#0D9488' }}
                                    animate={{ width: `${progress * 100}%` }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }} />
                            </div>
                            <span className="text-[11px] font-black" style={{ color: '#0D9488' }}>
                                {Math.round(progress * 100)}%
                            </span>
                        </div>
                    </div>

                    {/* Period selector */}
                    <div className="flex gap-2">
                        {PERIODS.map(p => {
                            const PIc = p.icon;
                            const isAct = activePeriod === p.id;
                            const isCurrent = p.id === defaultPeriod;
                            return (
                                <motion.button key={p.id}
                                    whileTap={{ scale: 0.94 }}
                                    onClick={() => { setAP(p.id); haptic.selection(); }}
                                    className="flex-1 flex flex-col items-center gap-1 py-2 rounded-[14px] relative"
                                    style={{
                                        background: isAct ? 'rgba(13,148,136,0.10)' : 'rgba(0,0,0,0.03)',
                                        border: `1.5px solid ${isAct ? 'rgba(13,148,136,0.20)' : 'rgba(255,255,255,0.60)'}`,
                                    }}>
                                    {isCurrent && !isAct && (
                                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                                            style={{ background: '#0D9488' }} />
                                    )}
                                    <PIc className="w-3.5 h-3.5"
                                        style={{ color: isAct ? '#0D9488' : '#94A3B8' }} />
                                    <span className="text-[9px] font-black"
                                        style={{ color: isAct ? '#0D9488' : '#94A3B8' }}>
                                        {p.label}
                                    </span>
                                    <span className="text-[8px]" style={{ color: '#C4CDD5' }}>
                                        {p.time}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Task list */}
                <div className="px-4 pb-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activePeriod}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={SP}>
                            {period.tasks.map(task => (
                                <TaskRow
                                    key={task.id}
                                    task={task}
                                    done={done.has(task.id)}
                                    onToggle={() => toggle(task.id)}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* Completion celebration */}
                    <AnimatePresence>
                        {progress === 1 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 6 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={SP}
                                className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-[14px]"
                                style={{
                                    background: 'rgba(13,148,136,0.08)',
                                    border: '1px solid rgba(13,148,136,0.18)',
                                }}>
                                <CheckCircle2 className="w-4 h-4" style={{ color: '#0D9488' }} />
                                <span className="text-[12px] font-black" style={{ color: '#0D9488' }}>
                                    أنجزت {period.label} بالكامل 🎉
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
