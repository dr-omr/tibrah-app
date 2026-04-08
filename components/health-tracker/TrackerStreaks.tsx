// components/health-tracker/TrackerStreaks.tsx
// Health Tracker — Daily Habit Streaks
// Shows consecutive days for each tracked metric.
// The most addictive feature — "don't break the chain".
// Design: Gaming badge aesthetic with fire animations + GitHub-style heatmap dots.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Star, Zap, Trophy, ChevronDown } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { METRIC, TC, type MetricKey } from './tracker-tokens';
import { SPRING_BOUNCY } from '@/lib/tibrah-motion';

interface StreakMetric {
    key:        MetricKey;
    streak:     number;         // consecutive days
    best:       number;         // personal best
    last7:      boolean[];      // true = logged that day, [0]=today, [6]=6 days ago
    isActive:   boolean;        // logged today?
}

/* ── Flame color by streak length ── */
function flameColor(streak: number): string {
    if (streak >= 30) return '#f97316'; // orange
    if (streak >= 14) return '#eab308'; // yellow
    if (streak >= 7)  return '#22c55e'; // green
    return '#64748b';                   // grey (just started)
}

function flameSize(streak: number): number {
    if (streak >= 30) return 22;
    if (streak >= 14) return 20;
    if (streak >= 7)  return 18;
    return 16;
}

/* ── Milestone badge ── */
function MilestoneBadge({ streak }: { streak: number }) {
    if (streak >= 30) return <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-100">
        <Trophy className="w-2.5 h-2.5 text-orange-500" /><span className="text-[8px] font-black text-orange-600">٣٠+ يوم!</span></div>;
    if (streak >= 14) return <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-yellow-50 border border-yellow-100">
        <Star className="w-2.5 h-2.5 text-yellow-500" /><span className="text-[8px] font-black text-yellow-600">أسبوعان!</span></div>;
    if (streak >= 7)  return <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-green-50 border border-green-100">
        <Zap className="w-2.5 h-2.5 text-green-500" /><span className="text-[8px] font-black text-green-600">أسبوع!</span></div>;
    return null;
}

/* ── Single streak card ── */
function StreakCard({ item }: { item: StreakMetric }) {
    const m      = METRIC[item.key];
    const fColor = item.isActive ? flameColor(item.streak) : '#cbd5e1';
    const fSize  = flameSize(item.streak);

    return (
        <motion.div
            layout
            className="flex-shrink-0 flex flex-col items-center gap-2 p-3.5 rounded-[20px]"
            style={{
                background: item.isActive ? `${m.color}08` : 'rgba(0,0,0,0.03)',
                border:     `1.5px solid ${item.isActive ? m.color + '22' : 'rgba(0,0,0,0.06)'}`,
                width:      112,
            }}>

            {/* Flame */}
            <div className="relative">
                <motion.div
                    animate={item.isActive ? {
                        scale:  [1, 1.12, 1, 1.08, 1],
                        rotate: [0, -4, 4, -2, 0],
                    } : { scale: 1 }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}>
                    <Flame style={{ width: fSize, height: fSize, color: fColor,
                        filter: item.isActive ? `drop-shadow(0 2px 6px ${fColor}80)` : 'none' }} />
                </motion.div>
                {item.streak >= 7 && item.isActive && (
                    <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                        style={{ background: fColor }}
                        animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                        transition={{ duration: 1.8, repeat: Infinity }} />
                )}
            </div>

            {/* Streak number */}
            <div className="text-center">
                <div className="flex items-baseline gap-0.5 justify-center">
                    <span className="text-[24px] font-black tabular-nums leading-none"
                        style={{ color: item.isActive ? m.color : '#94a3b8' }}>
                        {item.streak}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold">يوم</span>
                </div>
                <p className="text-[9.5px] font-bold text-slate-400 mt-0.5">{m.label}</p>
            </div>

            {/* Milestone */}
            <MilestoneBadge streak={item.streak} />

            {/* Last 7 days heatmap */}
            <div className="flex gap-0.5">
                {item.last7.slice().reverse().map((done, i) => (
                    <motion.div
                        key={i}
                        className="w-2.5 h-2.5 rounded-[3px]"
                        style={{ background: done ? m.color : 'rgba(0,0,0,0.08)' }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.04, type: 'spring', stiffness: 500, damping: 26 }}
                        title={i === 0 ? 'الأمس' : `${i + 1} أيام مضت`}
                    />
                ))}
            </div>

            {/* Best streak */}
            {item.best > item.streak && (
                <p className="text-[8px] text-slate-300 font-medium">
                    أفضل: {item.best} يوم
                </p>
            )}
        </motion.div>
    );
}

/* ════════════════════════════════════════════════════
   TRACKER STREAKS (main export)
   ════════════════════════════════════════════════════ */

// In production these come from the DB / daily log history.
// For now we generate demo-realistic data.
function defaultStreaks(): StreakMetric[] {
    return [
        { key: 'water',    streak: 12, best: 21, isActive: true,  last7: [true,true,true,true,true,false,true] },
        { key: 'sleep',    streak: 5,  best: 14, isActive: true,  last7: [true,true,true,true,true,false,false] },
        { key: 'activity', streak: 3,  best: 9,  isActive: true,  last7: [true,true,true,false,false,true,false] },
        { key: 'meds',     streak: 22, best: 22, isActive: true,  last7: [true,true,true,true,true,true,true] },
        { key: 'mood',     streak: 7,  best: 15, isActive: true,  last7: [true,true,true,true,true,true,true] },
    ];
}

interface TrackerStreaksProps {
    streaks?: StreakMetric[];
}

export function TrackerStreaks({ streaks = defaultStreaks() }: TrackerStreaksProps) {
    const totalStreak = Math.min(...streaks.filter(s => s.isActive).map(s => s.streak));
    const allActive   = streaks.every(s => s.isActive);

    return (
        <div className="px-4 space-y-3">
            {/* Header banner */}
            <motion.div
                className="relative overflow-hidden rounded-[20px] px-4 py-3 flex items-center gap-3"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{
                    background: allActive
                        ? 'linear-gradient(135deg, rgba(249,115,22,0.10), rgba(234,179,8,0.10))'
                        : 'rgba(0,0,0,0.04)',
                    border: `1.5px solid ${allActive ? 'rgba(249,115,22,0.20)' : 'rgba(0,0,0,0.07)'}`,
                }}>
                <motion.div
                    animate={{ rotate: [0, -8, 8, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}>
                    <Flame className="w-7 h-7" style={{ color: flameColor(totalStreak) }} />
                </motion.div>
                <div>
                    <p className="text-[14px] font-black text-slate-800">
                        {allActive ? `سلسلة ${totalStreak} يوم متواصل! 🔥` : 'لا تكسر السلسلة اليوم!'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {allActive ? 'كل المؤشرات مُسجَّلة اليوم ✓' : 'سجّل مؤشراتك للحفاظ على سلسلتك'}
                    </p>
                </div>
            </motion.div>

            {/* Streak cards horizontal scroll */}
            <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {streaks.map((item, i) => (
                    <motion.div key={item.key}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07, ...SPRING_BOUNCY }}>
                        <StreakCard item={item} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
