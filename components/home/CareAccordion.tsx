// components/home/CareAccordion.tsx  ✦ V2 — Clinical Depth Edition
// Every step feels meaningful. Timeline is a breathing organism.
// New: completion ring in accordion header, phase labels, step timing estimates

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
    HeartPulse, TrendingUp, ChevronDown,
    CheckCircle, Brain, Target, Stethoscope,
    Clock, Flag,
} from 'lucide-react';
import { type HealthDashboardData } from '@/hooks/useHealthDashboard';
import { haptic } from '@/lib/HapticFeedback';
import { T, CARD_SPRING } from './home-tokens';
import { STAGGER_ITEM } from '@/lib/tibrah-motion';

const CareSessionHub = dynamic(() => import('../care-hub/CareSessionHub'), {
    loading: () => <div className="h-20 rounded-xl bg-slate-100/60 animate-pulse" />,
    ssr: false,
});

const STEP_ICONS = [Stethoscope, Brain, Target, TrendingUp, CheckCircle, HeartPulse];
const STEP_TIMES = ['٥ دقائق', '١٥ دقيقة', '٣٠ دقيقة', '١ ساعة'];

/* ── Completion ring (small, in header) ── */
function CompRing({ pct, color, size = 36 }: { pct: number; color: string; size?: number }) {
    const r = size / 2 - 3.5;
    const c = 2 * Math.PI * r;
    return (
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size/2} cy={size/2} r={r} fill="none"
                    stroke="rgba(0,0,0,0.05)" strokeWidth="3" />
                <motion.circle cx={size/2} cy={size/2} r={r} fill="none"
                    stroke={color} strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={c}
                    initial={{ strokeDashoffset: c }}
                    animate={{ strokeDashoffset: c - pct * c }}
                    transition={{ duration: 1, ease: 'easeOut' }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[8px] font-black tabular-nums" style={{ color }}>
                    {Math.round(pct * 100)}
                </span>
            </div>
        </div>
    );
}

/* ── Accordion item ── */
function AccordionItem({
    id, icon: Icon, color, label, preview, pct, badge, isOpen, onToggle, children,
}: {
    id:       string;
    icon:     React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    color:    string;
    label:    string;
    preview:  string;
    pct?:     number;
    badge?:   string;
    isOpen:   boolean;
    onToggle: (id: string) => void;
    children: React.ReactNode;
}) {
    return (
        <motion.div layout className="overflow-hidden rounded-[22px]"
            style={{
                background:     T.card.bg,
                backdropFilter: T.card.blur,
                border:         `1.5px solid ${isOpen ? color + '22' : T.card.border}`,
                boxShadow:      isOpen
                    ? `${T.sh.lg}, 0 0 0 3px ${color}07`
                    : T.sh.sm,
            }}
            transition={CARD_SPRING}>

            <button className="w-full flex items-center gap-3.5 px-4 py-4 text-start"
                onClick={() => { onToggle(id); haptic.selection(); }}>

                {/* Gradient icon */}
                <div className="w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0"
                    style={{
                        background: isOpen
                            ? `linear-gradient(135deg,${color},${color}cc)`
                            : `${color}12`,
                        border: `1px solid ${color}20`,
                        boxShadow: isOpen ? `0 4px 12px ${color}28` : 'none',
                        transition: 'all 0.3s ease',
                    }}>
                    <Icon className="w-5 h-5" style={{ color: isOpen ? 'white' : color }} />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-black text-slate-900 dark:text-slate-100">{label}</p>
                    <p className="text-[10.5px] text-slate-400 mt-0.5 truncate">{preview}</p>
                </div>

                {/* Completion ring */}
                {pct !== undefined && <CompRing pct={pct} color={color} />}

                {badge && !pct && (
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: `${color}14`, color }}>
                        {badge}
                    </span>
                )}

                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={CARD_SPRING}
                    className="ml-1 flex-shrink-0">
                    <ChevronDown className="w-4.5 h-4.5 text-slate-300" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ ...CARD_SPRING, stiffness: 360, damping: 36 }}
                        className="overflow-hidden">
                        <div className="px-4 pb-5 pt-0">
                            <div className="h-px bg-slate-100/80 dark:bg-white/[0.05] mb-4" />
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ── Journey steps ── */
function JourneySteps({ steps }: { steps: HealthDashboardData['journeySteps'] }) {
    const done    = steps.filter(s => s.status === 'done').length;
    const current = steps.findIndex(s => s.status === 'current');

    return (
        <div>
            {/* Phase summary */}
            <div className="flex items-center gap-2 mb-4 px-1">
                <Flag className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] font-bold text-slate-500">
                    المرحلة {current >= 0 ? current + 1 : done} من {steps.length} — {
                        done === steps.length ? 'اكتمل ✓' :
                        current >= 0 ? 'جارٍ التنفيذ' : 'في الانتظار'
                    }
                </span>
            </div>

            {steps.map((step, i) => {
                const StepIcon = STEP_ICONS[i % STEP_ICONS.length];
                const isDone    = step.status === 'done';
                const isCurrent = step.status === 'current';
                const isPending = !isDone && !isCurrent;

                return (
                    <div key={step.label} className="flex gap-4 relative pb-5 last:pb-0">
                        {/* Connector */}
                        {i < steps.length - 1 && (
                            <motion.div
                                className="absolute right-[19px] top-10 w-[2px] h-[calc(100%-20px)] rounded-full"
                                initial={{ scaleY: 0, originY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ delay: i * 0.1, duration: 0.4 }}
                                style={{
                                    background: isDone
                                        ? 'linear-gradient(to bottom, #14b8a6, #0d9488)'
                                        : 'rgba(0,0,0,0.06)',
                                }} />
                        )}

                        {/* Step circle */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.08, type: 'spring', stiffness: 380, damping: 22 }}
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                            style={{
                                background: isDone
                                    ? 'linear-gradient(135deg,#14b8a6,#0d9488)'
                                    : isCurrent
                                    ? 'linear-gradient(135deg,#fbbf24,#f59e0b)'
                                    : 'rgba(0,0,0,0.04)',
                                boxShadow: isDone
                                    ? '0 4px 12px rgba(13,148,136,0.3)'
                                    : isCurrent
                                    ? '0 4px 12px rgba(251,191,36,0.3), 0 0 0 4px rgba(251,191,36,0.12)'
                                    : 'none',
                            }}>
                            <StepIcon className={`w-4.5 h-4.5 ${isDone || isCurrent ? 'text-white' : 'text-slate-300'}`}
                                style={{ width:18, height:18 }} />
                        </motion.div>

                        {/* Step content */}
                        <div className="flex-1 pt-1.5 min-w-0">
                            <p className={`text-[13.5px] font-bold ${
                                isDone    ? 'text-teal-700 dark:text-teal-300' :
                                isCurrent ? 'text-amber-700' : 'text-slate-300'
                            }`}>{step.label}</p>

                            {isCurrent && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <motion.div className="w-1.5 h-1.5 rounded-full bg-amber-400"
                                        animate={{ opacity: [1, 0.2, 1], scale: [1, 1.3, 1] }}
                                        transition={{ duration: 1.6, repeat: Infinity }} />
                                    <span className="text-[10.5px] text-amber-600 font-bold">الخطوة الحالية</span>
                                </div>
                            )}

                            {isDone && (
                                <div className="flex items-center gap-1 mt-0.5">
                                    <CheckCircle className="w-3 h-3 text-teal-500" />
                                    <span className="text-[10px] text-teal-500 font-bold">مكتمل</span>
                                </div>
                            )}

                            {isPending && i === current + 1 && (
                                <div className="flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3 h-3 text-slate-300" />
                                    <span className="text-[10px] text-slate-300 font-medium">
                                        التالي · {STEP_TIMES[i % STEP_TIMES.length]}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ════════════════════════════════════════════════════
   MAIN
   ════════════════════════════════════════════════════ */
export function CareAccordion({ dashboard }: { dashboard: HealthDashboardData }) {
    const [openSection, setOpenSection] = useState<string | null>(null);
    const toggle = (id: string) => setOpenSection(p => p === id ? null : id);

    const done = dashboard.journeySteps.filter(s => s.status === 'done').length;
    const pct  = done / Math.max(dashboard.journeySteps.length, 1);

    return (
        <motion.div variants={STAGGER_ITEM} className="px-4 space-y-2.5">

            {/* Active Care Session */}
            <AccordionItem
                id="session" icon={HeartPulse} color="#0d9488"
                label="جلستي الطبية النشطة"
                preview="اضغط لعرض رعايتك الحالية"
                isOpen={openSection === 'session'} onToggle={toggle}>
                <CareSessionHub />
            </AccordionItem>

            {/* Treatment Journey */}
            <AccordionItem
                id="journey" icon={TrendingUp} color="#6366f1"
                label="رحلتي العلاجية"
                preview={`${done} من ${dashboard.journeySteps.length} مراحل مكتملة`}
                pct={pct}
                isOpen={openSection === 'journey'} onToggle={toggle}>

                {/* Progress bar header */}
                <div className="mb-4 p-3 rounded-[14px]"
                    style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
                    <div className="flex justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-indigo-600">التقدم الكلي</span>
                        <span className="text-[11px] font-black text-indigo-700">{Math.round(pct * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/60 overflow-hidden">
                        <motion.div className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct * 100}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }} />
                    </div>
                </div>

                <JourneySteps steps={dashboard.journeySteps} />
            </AccordionItem>

        </motion.div>
    );
}
