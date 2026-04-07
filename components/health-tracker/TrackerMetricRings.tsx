// components/health-tracker/TrackerMetricRings.tsx
// Health Tracker — Apple Health-style Activity Rings
// 6 metrics in a horizontal scrollable row with an in-place expand.
// Each ring: SVG arc + animated value + tap-to-expand with detail.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Droplets, Moon, Activity, Smile, Pill, Scale,
    TrendingUp, TrendingDown, Minus, ChevronLeft,
} from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { METRIC, TC, type MetricKey } from './tracker-tokens';
import { SPRING_BOUNCY } from '@/lib/tibrah-motion';
import { createPageUrl } from '@/utils';

const METRIC_ICONS: Record<MetricKey, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
    water:    Droplets,
    sleep:    Moon,
    activity: Activity,
    mood:     Smile,
    meds:     Pill,
    weight:   Scale,
    bp:       Activity,
    fasting:  Activity,
    calories: Activity,
};

const TAB_LINKS: Partial<Record<MetricKey, string>> = {
    water:    '/health-tracker?tab=water',
    sleep:    '/health-tracker?tab=sleep',
    activity: '/health-tracker?tab=activity',
    mood:     '/health-tracker?tab=mood',
    meds:     '/health-tracker?tab=meds',
    weight:   '/health-tracker?tab=weight',
    bp:       '/health-tracker?tab=bp',
};

interface Ring {
    key:      MetricKey;
    value:    string;
    unit:     string;
    progress: number;   // 0–1
    trend:    'up' | 'down' | 'stable';
    trendText: string;
    sub:      string;
}

function TrendIcon({ trend, color }: { trend: Ring['trend']; color: string }) {
    if (trend === 'up')   return <TrendingUp   className="w-3 h-3" style={{ color }} />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-red-500" />;
    return                       <Minus        className="w-3 h-3 text-slate-400" />;
}

function MetricRingCard({ ring, isActive, onToggle }: {
    ring: Ring;
    isActive: boolean;
    onToggle: () => void;
}) {
    const m    = METRIC[ring.key];
    const Icon = METRIC_ICONS[ring.key] ?? Activity;
    const sz   = 54; const r = 22; const circ = 2 * Math.PI * r;

    return (
        <motion.div
            layout
            onClick={() => { onToggle(); haptic.selection(); }}
            className="flex-shrink-0 rounded-[22px] cursor-pointer overflow-hidden"
            style={{
                background: isActive ? `linear-gradient(155deg, white, ${m.color}08)` : TC.card.bg,
                border: `1.5px solid ${isActive ? m.color + '28' : TC.card.border}`,
                backdropFilter: TC.card.blur,
                boxShadow: isActive ? `0 10px 32px ${m.color}22, ${TC.card.shadow}` : TC.card.shadow,
                width: isActive ? 176 : 86,
            }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}>

            <div className={`p-3.5 flex ${isActive ? 'items-start gap-3.5' : 'flex-col items-center gap-2'}`}>

                {/* Ring */}
                <div className="relative flex-shrink-0" style={{ width: sz, height: sz }}>
                    <svg width={sz} height={sz} style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx={sz/2} cy={sz/2} r={r} fill="none"
                            stroke="rgba(0,0,0,0.06)" strokeWidth="5.5" />
                        <motion.circle
                            cx={sz/2} cy={sz/2} r={r}
                            fill="none" stroke={m.color} strokeWidth="5.5" strokeLinecap="round"
                            style={{ filter: isActive ? `drop-shadow(0 0 5px ${m.color}70)` : 'none' }}
                            strokeDasharray={circ}
                            animate={{ strokeDashoffset: circ - ring.progress * circ }}
                            transition={{ duration: 0.9, ease: 'easeOut' }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className="w-4.5 h-4.5" style={{ color: m.color, width: 18, height: 18 }} />
                    </div>
                </div>

                {/* Data */}
                <div className={isActive ? 'flex-1 min-w-0 pt-0.5' : 'text-center w-full'}>
                    <div className={`flex items-baseline gap-0.5 ${isActive ? '' : 'justify-center'}`}>
                        <span className="text-[16px] font-black tabular-nums" style={{ color: m.color }}>
                            {ring.value}
                        </span>
                        {ring.unit && (
                            <span className="text-[9px] text-slate-400 font-bold">{ring.unit}</span>
                        )}
                    </div>
                    <p className="text-[9.5px] font-bold text-slate-500 mt-0.5">{m.label}</p>
                    <div className={`flex items-center gap-0.5 mt-0.5 ${isActive ? '' : 'justify-center'}`}>
                        <TrendIcon trend={ring.trend} color={m.color} />
                        <span className="text-[9px] text-slate-400">{ring.trendText}</span>
                    </div>

                    {/* Expanded area */}
                    <AnimatePresence>
                        {isActive && (
                            <motion.div
                                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }} transition={{ delay: 0.1 }}>
                                <p className="text-[10.5px] text-slate-400 mt-2 leading-snug">{ring.sub}</p>
                                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2">
                                    <motion.div className="h-full rounded-full" style={{ background: m.color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${ring.progress * 100}%` }}
                                        transition={{ duration: 0.7, ease: 'easeOut' }} />
                                </div>
                                {TAB_LINKS[ring.key] && (
                                    <Link href={TAB_LINKS[ring.key]!}
                                        onClick={(e) => { e.stopPropagation(); haptic.impact(); }}
                                        className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full"
                                        style={{ background: `${m.color}14`, color: m.color }}>
                                        تفاصيل <ChevronLeft className="w-2.5 h-2.5" />
                                    </Link>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}

/* ════════════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════════════ */
export interface TrackerRingsData {
    waterPct:   number;   // 0–1
    sleepHours: number;   // 0–12
    activityMin: number;  // 0–60
    moodScore:  number;   // 0–10
    medsCount:  number;   // taken today
    medsTotalCount: number;
    weightKg?:  number;
}

export function TrackerMetricRings({ data }: { data: TrackerRingsData }) {
    const [activeIdx, setActiveIdx] = useState<number | null>(null);

    const rings: Ring[] = [
        {
            key: 'water', value: `${Math.round(data.waterPct * 100)}`, unit: '%',
            progress: Math.min(data.waterPct, 1),
            trend: data.waterPct >= 1 ? 'up' : data.waterPct < 0.4 ? 'down' : 'stable',
            trendText: data.waterPct >= 1 ? 'اكتمل' : `${Math.round(data.waterPct * 100)}% من هدفك`,
            sub: data.waterPct < 0.5 ? 'ترطيب غير كافٍ — اشرب ماءً الآن' : 'مستوى ترطيب جيد، استمر!',
        },
        {
            key: 'sleep', value: `${data.sleepHours.toFixed(1)}`, unit: 'س',
            progress: Math.min(data.sleepHours / 8, 1),
            trend: data.sleepHours >= 7 ? 'up' : data.sleepHours < 6 ? 'down' : 'stable',
            trendText: data.sleepHours >= 7 ? 'ممتاز' : 'أقل من المعدل',
            sub: data.sleepHours >= 7 ? 'نوم ممتاز يُحسّن التركيز والمزاج.' : 'النوم أقل من ٧ س يؤثر على طاقتك.',
        },
        {
            key: 'activity', value: `${data.activityMin}`, unit: 'دق',
            progress: Math.min(data.activityMin / 30, 1),
            trend: data.activityMin >= 30 ? 'up' : 'stable',
            trendText: data.activityMin >= 30 ? 'هدف محقق' : `${30 - data.activityMin} دق متبقية`,
            sub: '٣٠ دقيقة نشاط يومي — الحد الأدنى الموصى به صحياً.',
        },
        {
            key: 'mood', value: `${data.moodScore}`, unit: '/10',
            progress: data.moodScore / 10,
            trend: data.moodScore >= 7 ? 'up' : data.moodScore < 5 ? 'down' : 'stable',
            trendText: data.moodScore >= 7 ? 'إيجابي' : 'متوسط',
            sub: data.moodScore < 5 ? 'مزاجك أقل من المعتاد، ما الذي يُزعجك؟' : 'مزاجك جيد اليوم.',
        },
        {
            key: 'meds', value: `${data.medsCount}`, unit: `/${data.medsTotalCount}`,
            progress: data.medsTotalCount > 0 ? data.medsCount / data.medsTotalCount : 0,
            trend: data.medsCount >= data.medsTotalCount ? 'up' : 'stable',
            trendText: data.medsCount >= data.medsTotalCount ? 'اكتمل ✓' : `${data.medsTotalCount - data.medsCount} متبقية`,
            sub: data.medsCount < data.medsTotalCount ? 'تذكر أخذ جرعتك المتبقية.' : 'أخذت كل أدويتك اليوم.',
        },
        ...(data.weightKg ? [{
            key: 'weight' as MetricKey, value: `${data.weightKg.toFixed(1)}`, unit: 'كجم',
            progress: 0.7,
            trend: 'stable' as const,
            trendText: 'مستقر',
            sub: 'يُنصح بالوزن أسبوعياً للحصول على قراءات دقيقة.',
        }] : []),
    ];

    return (
        <div className="flex gap-3 overflow-x-auto px-4 pb-1.5" style={{ scrollbarWidth: 'none' }}>
            {rings.map((ring, i) => (
                <MetricRingCard
                    key={ring.key}
                    ring={ring}
                    isActive={activeIdx === i}
                    onToggle={() => setActiveIdx(activeIdx === i ? null : i)}
                />
            ))}
        </div>
    );
}
