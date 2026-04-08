// components/health-tracker/TrackerGoalCard.tsx
// Health Tracker — Personal Health Goal Cards
// Users set a goal → see progress → celebrate achievement.
// Design: Premium gradient card with animated progress arc and confetti on completion.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target, Edit3, Check, X, ChevronRight,
    Droplets, Moon, Activity, Scale,
} from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { METRIC, TC, type MetricKey } from './tracker-tokens';
import { SPRING_BOUNCY, SPRING_SMOOTH } from '@/lib/tibrah-motion';

interface Goal {
    id:       string;
    key:      MetricKey;
    label:    string;
    target:   number;
    current:  number;
    unit:     string;
    deadline: string;  // "في ٣٠ يوماً"
}

/* ── Circular progress arc ── */
function GoalArc({ progress, color, size = 64 }: { progress: number; color: string; size?: number }) {
    const r    = (size - 10) / 2;
    const circ = 2 * Math.PI * r;
    const pct  = Math.min(progress, 1);

    return (
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size/2} cy={size/2} r={r} fill="none"
                    stroke="rgba(0,0,0,0.06)" strokeWidth="5" />
                <motion.circle cx={size/2} cy={size/2} r={r} fill="none"
                    stroke={color} strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ - pct * circ }}
                    transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
                    style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[13px] font-black tabular-nums" style={{ color }}>
                    {Math.round(pct * 100)}%
                </span>
            </div>
        </div>
    );
}

/* ── Single goal card ── */
function GoalCard({ goal }: { goal: Goal }) {
    const m       = METRIC[goal.key];
    const pct     = Math.min(goal.current / goal.target, 1);
    const done    = pct >= 1;
    const remain  = Math.max(goal.target - goal.current, 0);

    return (
        <motion.div
            layout
            className="relative overflow-hidden rounded-[22px]"
            style={{
                background: done
                    ? `linear-gradient(135deg, ${m.color}15, ${m.color}05)`
                    : TC.card.bg,
                backdropFilter: TC.card.blur,
                border: `1.5px solid ${done ? m.color + '30' : TC.card.border}`,
                boxShadow: done ? `0 6px 24px ${m.color}18` : TC.card.shadow,
            }}>
            {/* Completion banner */}
            {done && (
                <motion.div
                    initial={{ x: '100%' }} animate={{ x: 0 }}
                    className="absolute top-0 left-0 right-0 py-1.5 text-center text-[10px] font-black text-white"
                    style={{ background: m.color }}>
                    🎉 تحقق الهدف!
                </motion.div>
            )}

            <div className={`flex items-center gap-3.5 p-4 ${done ? 'mt-7' : ''}`}>
                {/* Arc */}
                <GoalArc progress={pct} color={m.color} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[12.5px] font-black text-slate-800">{goal.label}</span>
                        {done && <Check className="w-3.5 h-3.5 text-green-500" />}
                    </div>

                    <div className="flex items-baseline gap-1 mb-1.5">
                        <span className="text-[18px] font-black tabular-nums" style={{ color: m.color }}>
                            {goal.current}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">/ {goal.target} {goal.unit}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-1.5">
                        <motion.div className="h-full rounded-full"
                            style={{ background: m.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct * 100}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }} />
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-[9.5px] text-slate-400">
                            {done ? 'اكتمل 🎯' : `متبقي ${remain} ${goal.unit} — ${goal.deadline}`}
                        </span>
                        <span className="text-[9px]">{m.emoji}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/* ── Add goal form ── */
const QUICK_GOALS = [
    { key: 'water'    as MetricKey, label: 'شرب ١٠ أكواب يومياً', target: 10, unit: 'كوب',  deadline: 'في أسبوع' },
    { key: 'sleep'    as MetricKey, label: 'نوم ٨ ساعات',          target: 8,  unit: 'ساعة', deadline: 'في ٣ أيام' },
    { key: 'activity' as MetricKey, label: '٣٠ دقيقة نشاط يومي',  target: 30, unit: 'دقيقة',deadline: 'هذا الأسبوع' },
    { key: 'weight'   as MetricKey, label: 'خسارة ٣ كجم',          target: 3,  unit: 'كجم',  deadline: 'في شهر' },
];

function AddGoalSheet({ onAdd, onClose }: { onAdd: (g: Goal) => void; onClose: () => void }) {
    return (
        <motion.div className="fixed inset-0 z-[400] flex items-end"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }} />
            <motion.div className="relative w-full rounded-t-[28px] overflow-hidden pb-10"
                style={{ background: 'rgba(252,252,253,0.98)', backdropFilter: 'blur(40px)' }}
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={SPRING_SMOOTH}
                onClick={e => e.stopPropagation()}>
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-slate-200" />
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                    <h3 className="text-[17px] font-black text-slate-900">اختر هدفاً</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <X className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                </div>
                <div className="px-4 space-y-2.5">
                    {QUICK_GOALS.map((qg, i) => {
                        const m = METRIC[qg.key];
                        return (
                            <motion.button key={i}
                                className="w-full flex items-center gap-3 p-3.5 rounded-[18px] text-right"
                                style={{ background: `${m.color}09`, border: `1.5px solid ${m.color}18` }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => {
                                    haptic.impact();
                                    onAdd({ id: `${qg.key}-${Date.now()}`, ...qg, current: 0 });
                                    onClose();
                                }}>
                                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                                    style={{ background: m.color }}>
                                    <span className="text-[18px]">{m.emoji}</span>
                                </div>
                                <div className="flex-1 text-right">
                                    <p className="text-[13px] font-black text-slate-800">{qg.label}</p>
                                    <p className="text-[10px] text-slate-400">{qg.deadline}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300" />
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ════════════════════════════════════════════════════
   TRACKER GOAL CARD (main export)
   ════════════════════════════════════════════════════ */
const DEFAULT_GOALS: Goal[] = [
    { id: 'w1', key: 'water',    label: 'شرب ٨ أكواب يومياً',  target: 8,  current: 6,  unit: 'كوب',  deadline: 'في أسبوع' },
    { id: 's1', key: 'sleep',    label: 'نوم ٧.٥ ساعة يومياً', target: 7.5,current: 6.5,unit: 'ساعة', deadline: 'في ٣ أيام' },
    { id: 'a1', key: 'activity', label: 'نشاط ٣٠ دقيقة يومياً',target: 30, current: 30, unit: 'دقيقة',deadline: 'هذا الأسبوع' },
];

export function TrackerGoalCard() {
    const [goals, setGoals] = useState<Goal[]>(DEFAULT_GOALS);
    const [showAdd, setShowAdd] = useState(false);

    const addGoal = (g: Goal) => setGoals(prev => [g, ...prev]);

    return (
        <div className="px-4 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-[7px] flex items-center justify-center"
                    style={{ background: 'rgba(99,102,241,0.12)' }}>
                    <Target className="w-3 h-3 text-indigo-500" />
                </div>
                <span className="text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-indigo-500/80">
                    أهدافي الصحية
                </span>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(99,102,241,0.12))' }} />
                <motion.button
                    whileTap={{ scale: 0.90 }}
                    onClick={() => { setShowAdd(true); haptic.selection(); }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-indigo-500"
                    style={{ background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.18)' }}>
                    + هدف جديد
                </motion.button>
            </div>

            {/* Goal cards */}
            <div className="space-y-2.5">
                <AnimatePresence initial={false}>
                    {goals.map((g, i) => (
                        <motion.div key={g.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: i * 0.06, ...SPRING_BOUNCY }}>
                            <GoalCard goal={g} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Add goal sheet */}
            <AnimatePresence>
                {showAdd && (
                    <AddGoalSheet onAdd={addGoal} onClose={() => setShowAdd(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}
