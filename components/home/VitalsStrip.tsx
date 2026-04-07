// components/home/VitalsStrip.tsx  ✦ V2 — Data Poetry Edition
// Each vital is a story: collapsed shows the headline, expanded shows the chapter.
// New: mini sparkline in collapsed state, ring draw-in animation, better expand UX

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    HeartPulse, Droplets, Flame, Target, Activity,
    TrendingUp, TrendingDown, Minus, ChevronLeft,
} from 'lucide-react';
import { type HealthDashboardData } from '@/hooks/useHealthDashboard';
import { createPageUrl } from '@/utils';
import { haptic } from '@/lib/HapticFeedback';
import { STAGGER_ITEM } from '@/lib/tibrah-motion';

type TrendDir = 'up' | 'down' | 'stable';

/* ── Tiny 5-bar sparkline ── */
function Sparkline({ values, color }: { values: number[]; color: string }) {
    if (!values?.length) return null;
    const max = Math.max(...values, 1);
    const BAR_W = 3; const BAR_GAP = 1.5;
    const WIDTH  = values.length * (BAR_W + BAR_GAP);
    const HEIGHT = 14;

    return (
        <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="overflow-visible">
            {values.map((v, i) => {
                const barH = Math.max(2, (v / max) * HEIGHT);
                const x = i * (BAR_W + BAR_GAP);
                const isLast = i === values.length - 1;
                return (
                    <motion.rect key={i}
                        x={x} y={HEIGHT - barH} width={BAR_W} height={barH}
                        rx={1.5}
                        fill={isLast ? color : `${color}50`}
                        initial={{ scaleY: 0, originY: 1 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: i * 0.06, type: 'spring', stiffness: 400, damping: 22 }}
                    />
                );
            })}
        </svg>
    );
}

/* ── Trend badge ── */
function TrendBadge({ trend }: { trend: TrendDir }) {
    const cfg = {
        up:     { Icon: TrendingUp,   cls: 'text-emerald-500' },
        down:   { Icon: TrendingDown, cls: 'text-red-500'     },
        stable: { Icon: Minus,        cls: 'text-slate-400'   },
    }[trend];
    const { Icon, cls } = cfg;
    return <Icon className={`${cls}`} style={{ width: 9, height: 9 }} />;
}

/* ════════════════════════════════════════════════════
   VITALS STRIP
   ════════════════════════════════════════════════════ */
interface VitalDef {
    icon:        React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    label:       string;
    value:       string;
    unit:        string;
    sub:         string;
    progress:    number;
    color:       string;
    href:        string;
    trend:       TrendDir;
    sparkValues: number[];   // last 7 data points (normalised 0–100)
}

export function VitalsStrip({ dashboard }: { dashboard: HealthDashboardData }) {
    const [activeIdx, setActiveIdx] = useState<number | null>(null);

    const waterPct = dashboard.waterToday / Math.max(dashboard.waterGoal, 1);
    const streakPct = Math.min(dashboard.streak / 30, 1);
    const goalsPct  = dashboard.goalsCompleted / Math.max(dashboard.goalsTotal, 1);

    const vitals: VitalDef[] = [
        {
            icon: HeartPulse, label: 'الصحة', value: `${dashboard.healthScore}`, unit: 'نقطة',
            sub:  dashboard.healthScore >= 80 ? 'ممتاز ✓' : 'قيد التحسن',
            progress: dashboard.healthScore / 100,
            color: dashboard.healthScore >= 80 ? '#16a34a' : dashboard.healthScore >= 50 ? '#d97706' : '#dc2626',
            href:  createPageUrl('HealthTracker'), trend: 'up',
            sparkValues: [70, 74, 72, 78, 80, 82, dashboard.healthScore],
        },
        {
            icon: Droplets, label: 'الماء', value: dashboard.waterAr, unit: `ل`,
            sub:  `من ${dashboard.waterGoal} ليتر يومي`,
            progress: Math.min(waterPct, 1),
            color: '#2563eb', href: createPageUrl('DailyLog'),
            trend: waterPct >= 1 ? 'up' : waterPct < 0.4 ? 'down' : 'stable',
            sparkValues: [60, 70, 55, 85, 90, 75, Math.round(waterPct * 100)],
        },
        {
            icon: Flame, label: 'الانتظام', value: dashboard.streakAr, unit: 'يوم',
            sub:  `${Math.round(streakPct * 100)}% نحو ٣٠ يوم`,
            progress: streakPct,
            color: '#ea580c', href: createPageUrl('DailyLog'),
            trend: dashboard.streak >= 3 ? 'up' : 'stable',
            sparkValues: [0,1,1,1,0,1,dashboard.streak > 0 ? 1 : 0].map(v => v * 100),
        },
        {
            icon: Target, label: 'الأهداف', value: `${dashboard.goalsCompleted}`, unit: `/${dashboard.goalsTotal}`,
            sub:  `${Math.round(goalsPct * 100)}% مكتمل`,
            progress: goalsPct,
            color: '#7c3aed', href: createPageUrl('Rewards'),
            trend: goalsPct >= 1 ? 'up' : 'stable',
            sparkValues: [40, 55, 60, 70, 75, 80, Math.round(goalsPct * 100)],
        },
        {
            icon: Activity, label: 'النشاط', value: '→', unit: '',
            sub:  'عرض سجل الأنشطة',
            progress: 0.6, color: '#0891b2',
            href: createPageUrl('HealthTracker'), trend: 'up',
            sparkValues: [45, 60, 55, 70, 65, 72, 68],
        },
    ];

    return (
        <motion.div variants={STAGGER_ITEM}>
            <div className="flex gap-3 overflow-x-auto px-4 pb-1.5"
                style={{ scrollbarWidth: 'none' }}>

                {vitals.map((v, i) => {
                    const Icon     = v.icon;
                    const isActive = activeIdx === i;
                    const sz = 52; const r = 21; const c = 2 * Math.PI * r;

                    return (
                        <motion.div key={i}
                            layout
                            onClick={() => { setActiveIdx(isActive ? null : i); haptic.selection(); }}
                            className="flex-shrink-0 rounded-[22px] cursor-pointer overflow-hidden"
                            style={{
                                background: isActive
                                    ? `linear-gradient(145deg, white 40%, ${v.color}06)`
                                    : 'rgba(255,255,255,0.92)',
                                border: `1.5px solid ${isActive ? v.color + '26' : 'rgba(0,0,0,0.07)'}`,
                                backdropFilter: 'blur(32px)',
                                boxShadow: isActive
                                    ? `0 10px 32px ${v.color}22, 0 2px 8px rgba(0,0,0,0.04)`
                                    : '0 2px 10px rgba(0,0,0,0.05)',
                                width: isActive ? 172 : 84,
                            }}
                            transition={{ type: 'spring', stiffness: 420, damping: 34 }}>

                            <div className={`p-3.5 flex ${isActive ? 'items-start gap-3.5' : 'flex-col items-center gap-2'}`}>

                                {/* Ring */}
                                <div className="relative flex-shrink-0" style={{ width: sz, height: sz }}>
                                    <svg width={sz} height={sz} style={{ transform: 'rotate(-90deg)' }}>
                                        <circle cx={sz/2} cy={sz/2} r={r} fill="none"
                                            stroke="rgba(0,0,0,0.06)" strokeWidth="5" />
                                        <motion.circle cx={sz/2} cy={sz/2} r={r} fill="none"
                                            stroke={v.color} strokeWidth="5" strokeLinecap="round"
                                            style={{ filter: isActive ? `drop-shadow(0 0 4px ${v.color}80)` : 'none' }}
                                            strokeDasharray={c}
                                            animate={{ strokeDashoffset: c - v.progress * c }}
                                            transition={{ duration: 0.9, ease: 'easeOut' }} />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Icon className="w-[18px] h-[18px]" style={{ color: v.color }} />
                                    </div>
                                </div>

                                {/* Data */}
                                <div className={isActive ? 'flex-1 min-w-0 pt-0.5' : 'text-center w-full'}>
                                    {/* Value + trend */}
                                    <div className={`flex items-center gap-1 ${isActive ? '' : 'justify-center'}`}>
                                        <span className="text-[15px] font-black tabular-nums leading-none" style={{ color: v.color }}>
                                            {v.value}
                                        </span>
                                        {v.unit && (
                                            <span className="text-[9px] font-bold text-slate-400 leading-none">{v.unit}</span>
                                        )}
                                        {!isActive && <TrendBadge trend={v.trend} />}
                                    </div>
                                    <p className="text-[9.5px] font-bold text-slate-500 mt-0.5">{v.label}</p>

                                    {/* Collapsed sparkline */}
                                    {!isActive && (
                                        <div className="mt-1.5 flex justify-center">
                                            <Sparkline values={v.sparkValues} color={v.color} />
                                        </div>
                                    )}

                                    {/* Expanded details */}
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ delay: 0.1 }}>
                                                <p className="text-[10.5px] text-slate-400 mt-1.5 leading-snug">{v.sub}</p>

                                                {/* Progress bar */}
                                                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2">
                                                    <motion.div className="h-full rounded-full" style={{ background: v.color }}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${v.progress * 100}%` }}
                                                        transition={{ duration: 0.7, ease: 'easeOut' }} />
                                                </div>

                                                {/* Trend badge row */}
                                                <div className="flex items-center gap-1 mt-2">
                                                    <TrendBadge trend={v.trend} />
                                                    <span className="text-[9.5px] text-slate-400">{
                                                        v.trend === 'up' ? 'تحسن ملحوظ' :
                                                        v.trend === 'down' ? 'يحتاج اهتماماً' : 'مستقر'
                                                    }</span>
                                                </div>

                                                {/* Link */}
                                                <Link href={v.href}
                                                    onClick={(e) => { e.stopPropagation(); haptic.impact(); }}
                                                    className="inline-flex items-center gap-1 mt-2.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                                                    style={{ background: `${v.color}14`, color: v.color }}>
                                                    التفاصيل <ChevronLeft className="w-2.5 h-2.5" />
                                                </Link>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
