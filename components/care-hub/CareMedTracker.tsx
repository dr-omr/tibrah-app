// components/care-hub/CareMedTracker.tsx
// دواء يومي — Medication Adherence Tracker
// Inspired by:
//   - Medisafe (USA/Israel): World's #1 medication adherence app
//   - Mango Health (USA): Gamified pill tracking
//   - CareClinic (Canada): Comprehensive medication management
//
// Features:
//   - Today's pill schedule with check-off
//   - Weekly adherence ring (Medisafe-style)
//   - Visual "don't break the streak" motivation
//   - Refill reminder if supply is low

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Check, Clock, AlertCircle, ShoppingCart, Flame } from 'lucide-react';
import { CT, adherenceColor } from './care-tokens';
import { haptic } from '@/lib/HapticFeedback';
import { SPRING_BOUNCY } from '@/lib/tibrah-motion';

interface MedItem {
    id:        string;
    name:      string;
    dosage:    string;
    time:      string;   // "08:00"
    taken:     boolean;
    supply?:   number;   // days remaining
}

/* ── Adherence weekly ring ── */
function AdherenceRing({ pct, streak }: { pct: number; streak: number }) {
    const sz = 72; const r = 28; const circ = 2 * Math.PI * r;
    const color = adherenceColor(pct);
    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative" style={{ width: sz, height: sz }}>
                <svg width={sz} height={sz} style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="6" />
                    <motion.circle cx={sz/2} cy={sz/2} r={r} fill="none"
                        stroke={color} strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={circ}
                        initial={{ strokeDashoffset: circ }}
                        animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
                        transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
                        style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[18px] font-black leading-none" style={{ color }}>{pct}%</span>
                    <span className="text-[8px] text-slate-400">أسبوعي</span>
                </div>
            </div>
            {/* Streak */}
            {streak > 0 && (
                <div className="flex items-center gap-1">
                    <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Flame className="w-3 h-3" style={{ color: streak >= 7 ? '#f97316' : '#94a3b8' }} />
                    </motion.div>
                    <span className="text-[9px] font-bold text-slate-500">{streak} أيام</span>
                </div>
            )}
        </div>
    );
}

/* ── Single medication row ── */
function MedRow({ med, onToggle }: { med: MedItem; onToggle: (id: string) => void }) {
    const isLate = !med.taken && new Date().getHours() > parseInt(med.time.split(':')[0]);

    return (
        <motion.div layout
            className="flex items-center gap-3 p-3 rounded-[16px] transition-all"
            style={{
                background: med.taken ? 'rgba(22,163,74,0.06)' : isLate ? 'rgba(220,38,38,0.05)' : 'rgba(0,0,0,0.03)',
                border: `1.5px solid ${med.taken ? 'rgba(22,163,74,0.18)' : isLate ? 'rgba(220,38,38,0.15)' : 'rgba(0,0,0,0.07)'}`,
            }}>
            {/* Icon */}
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{ background: med.taken ? CT.green.c : isLate ? CT.red.c : CT.soul.c }}>
                <Pill className="w-4 h-4 text-white" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-black text-slate-800 leading-tight">{med.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] text-slate-400 font-medium">{med.dosage}</p>
                    <div className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5 text-slate-300" />
                        <span className="text-[9.5px] text-slate-400">{med.time}</span>
                    </div>
                    {isLate && !med.taken && (
                        <span className="text-[9px] font-black text-red-500">متأخر!</span>
                    )}
                </div>
            </div>

            {/* Supply warning */}
            {med.supply !== undefined && med.supply <= 7 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-[8px]"
                    style={{ background: 'rgba(217,119,6,0.10)', border: '1px solid rgba(217,119,6,0.22)' }}>
                    <AlertCircle className="w-2.5 h-2.5 text-amber-500" />
                    <span className="text-[8px] font-bold text-amber-600">{med.supply}د</span>
                </div>
            )}

            {/* Check button */}
            <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => { haptic.impact(); onToggle(med.id); }}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                    background: med.taken ? CT.green.c : 'rgba(0,0,0,0.07)',
                    boxShadow: med.taken ? `0 4px 12px ${CT.green.glow}` : 'none',
                }}>
                <AnimatePresence mode="wait">
                    {med.taken ? (
                        <motion.div key="check"
                            initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }} transition={SPRING_BOUNCY}>
                            <Check className="w-4 h-4 text-white" />
                        </motion.div>
                    ) : (
                        <motion.div key="empty" className="w-3 h-3 rounded-full border-2 border-slate-300" />
                    )}
                </AnimatePresence>
            </motion.button>
        </motion.div>
    );
}

/* ════════════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════════════ */
const DEMO_MEDS: MedItem[] = [
    { id: 'm1', name: 'فيتامين د٣', dosage: '5000 iu',  time: '08:00', taken: true,  supply: 14 },
    { id: 'm2', name: 'أوميغا 3',   dosage: '1000 ملج', time: '08:00', taken: true,  supply: 5  },
    { id: 'm3', name: 'ماغنيسيوم',  dosage: '400 ملج',  time: '21:00', taken: false, supply: 22 },
    { id: 'm4', name: 'زنك',        dosage: '30 ملج',   time: '12:00', taken: false },
];

interface CareMedTrackerProps {
    medications?: MedItem[];
    weeklyAdherence?: number;
    streak?: number;
}

export function CareMedTracker({
    medications = DEMO_MEDS,
    weeklyAdherence = 82,
    streak = 5,
}: CareMedTrackerProps) {
    const [meds, setMeds] = useState<MedItem[]>(medications);
    const todayDone  = meds.filter(m => m.taken).length;
    const todayTotal = meds.length;
    const lowSupply  = meds.filter(m => m.supply !== undefined && m.supply <= 7);

    const toggle = (id: string) => {
        setMeds(prev => prev.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
    };

    return (
        <div className="rounded-[24px] overflow-hidden"
            style={{
                background: CT.card.bg,
                backdropFilter: CT.card.blur,
                border: `1.5px solid ${CT.card.border}`,
                boxShadow: CT.card.shadow,
            }}>
            <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-[13px] font-black text-slate-800">دوائي اليومي</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                            {todayDone} من {todayTotal} مأخوذة اليوم
                        </p>
                    </div>
                    <AdherenceRing pct={weeklyAdherence} streak={streak} />
                </div>

                {/* Today's bar */}
                <div className="mb-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <motion.div className="h-full rounded-full"
                        style={{ background: `linear-gradient(to left, ${CT.green.c}, ${CT.green.light})` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(todayDone / todayTotal) * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.2 }} />
                </div>

                {/* Medication list */}
                <div className="space-y-2">
                    {meds.map(med => (
                        <MedRow key={med.id} med={med} onToggle={toggle} />
                    ))}
                </div>

                {/* Low supply alert */}
                {lowSupply.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        className="mt-3 flex items-center gap-2 px-3 py-2 rounded-[14px]"
                        style={{ background: 'rgba(217,119,6,0.08)', border: '1.5px solid rgba(217,119,6,0.20)' }}>
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <p className="text-[11px] text-amber-700 font-semibold flex-1">
                            {lowSupply.map(m => m.name).join('، ')} — المخزون ينفد
                        </p>
                        <a href="/smart-pharmacy"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black text-amber-700"
                            style={{ background: 'rgba(217,119,6,0.15)' }}>
                            <ShoppingCart className="w-2.5 h-2.5" />
                            اطلب
                        </a>
                    </motion.div>
                )}

                {/* All done celebration */}
                <AnimatePresence>
                    {todayDone === todayTotal && todayTotal > 0 && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className="mt-3 text-center py-2.5 rounded-[14px]"
                            style={{ background: `${CT.green.c}12`, border: `1.5px solid ${CT.green.c}25` }}>
                            <p className="text-[12px] font-black" style={{ color: CT.green.c }}>
                                🎉 أحسنت! أخذت جميع جرعاتك اليوم
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
