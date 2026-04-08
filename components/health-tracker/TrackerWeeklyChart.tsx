// components/health-tracker/TrackerWeeklyChart.tsx
// Health Tracker — 7-Day Trend Chart
// Shows a sparkline-style bar chart for any metric over the last 7 days.
// Tap a bar to see the exact value. Animate in on mount.
// Uses pure SVG — no chart library needed.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { METRIC, TC, type MetricKey } from './tracker-tokens';
import { SPRING_BOUNCY } from '@/lib/tibrah-motion';

interface DayData {
    label: string;   // 'خ' 'ج' 'س' etc.
    value: number;
    date:  string;
}

interface TrackerWeeklyChartProps {
    metricKey:  MetricKey;
    days:       DayData[];
    goal?:      number;     // reference line value
    unit?:      string;
}

const DAY_LABELS = ['أ', 'إ', 'ث', 'أ', 'خ', 'ج', 'س'];

/* Generate demo data if none given */
function demoDays(key: MetricKey): DayData[] {
    const bases: Record<MetricKey, number[]> = {
        water:    [6, 8, 5, 7, 8, 6, 7],
        sleep:    [7, 6.5, 8, 5.5, 7, 7.5, 6],
        activity: [20, 35, 0, 45, 30, 10, 25],
        mood:     [7, 6, 8, 5, 7, 8, 9],
        meds:     [1, 1, 0, 1, 1, 1, 1],
        weight:   [83, 82.8, 82.5, 82.6, 82.3, 82.1, 82.0],
        bp:       [120, 118, 122, 119, 121, 117, 120],
        fasting:  [14, 16, 12, 18, 16, 0, 14],
        calories: [1800, 2100, 1600, 1900, 2000, 1750, 1850],
    };
    const today = new Date();
    return DAY_LABELS.map((label, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        return {
            label,
            value:  (bases[key] ?? [5,5,5,5,5,5,5])[i],
            date:   d.toLocaleDateString('ar', { day: 'numeric', month: 'short' }),
        };
    });
}

export function TrackerWeeklyChart({
    metricKey,
    days,
    goal,
    unit = '',
}: TrackerWeeklyChartProps) {
    const m = METRIC[metricKey];
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    const values    = days.map(d => d.value);
    const maxVal    = Math.max(...values, goal ?? 0, 1);
    const minVal    = Math.min(...values);
    const avg       = values.reduce((a, b) => a + b, 0) / values.length;
    const last      = values[values.length - 1];
    const prev      = values[values.length - 2];
    const trend     = last > prev * 1.05 ? 'up' : last < prev * 0.95 ? 'down' : 'stable';

    const chartH = 80; const barW = 24; const gap = 8;
    const totalW = (barW + gap) * 7 - gap;

    const barHeight = (v: number) => Math.max((v / maxVal) * chartH, 4);

    return (
        <div className="rounded-[22px] overflow-hidden"
            style={{
                background: TC.card.bg,
                backdropFilter: TC.card.blur,
                border: `1.5px solid ${TC.card.border}`,
                boxShadow: TC.card.shadow,
            }}>
            <div className="p-4">
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-[9px] flex items-center justify-center"
                            style={{ background: m.color }}>
                            <span className="text-[13px]">{m.emoji}</span>
                        </div>
                        <div>
                            <p className="text-[13px] font-black text-slate-800">{m.label}</p>
                            <p className="text-[9.5px] text-slate-400 font-medium">آخر ٧ أيام</p>
                        </div>
                    </div>

                    {/* Trend indicator */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{
                            background: trend === 'up' ? `${m.color}10` : trend === 'down' ? 'rgba(220,38,38,0.08)' : 'rgba(0,0,0,0.05)',
                        }}>
                        {trend === 'up'   ? <TrendingUp   className="w-3.5 h-3.5" style={{ color: m.color }} /> :
                         trend === 'down' ? <TrendingDown className="w-3.5 h-3.5 text-red-500" /> :
                                            <Minus        className="w-3.5 h-3.5 text-slate-400" />}
                        <span className="text-[10px] font-black" style={{ color: trend === 'up' ? m.color : trend === 'down' ? '#dc2626' : '#94a3b8' }}>
                            {trend === 'up' ? 'تحسّن' : trend === 'down' ? 'انخفاض' : 'مستقر'}
                        </span>
                    </div>
                </div>

                {/* Hovered value tooltip */}
                <AnimatePresence>
                    {hoveredIdx !== null && (
                        <motion.div
                            key="tooltip"
                            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2 mb-3 px-3 py-2 rounded-[12px]"
                            style={{ background: `${m.color}10`, border: `1px solid ${m.color}22` }}>
                            <span className="text-[11px] text-slate-400">{days[hoveredIdx].date}</span>
                            <span className="text-[16px] font-black tabular-nums" style={{ color: m.color }}>
                                {days[hoveredIdx].value}{unit}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Chart */}
                <div className="relative" style={{ height: chartH + 24 }}>
                    {/* Goal reference line */}
                    {goal && (
                        <div className="absolute left-0 right-0 flex items-center gap-1"
                            style={{ bottom: 24 + (goal / maxVal) * chartH - 12 }}>
                            <div className="flex-1 border-t border-dashed"
                                style={{ borderColor: `${m.color}40` }} />
                            <span className="text-[8px] font-bold" style={{ color: m.color }}>
                                الهدف {goal}{unit}
                            </span>
                        </div>
                    )}

                    {/* Bars */}
                    <div className="absolute bottom-6 left-0 right-0 flex items-end justify-between px-0">
                        {days.map((day, i) => {
                            const h   = barHeight(day.value);
                            const isH = hoveredIdx === i;
                            return (
                                <div key={i} className="flex flex-col items-center gap-1 cursor-pointer"
                                    style={{ width: barW }}
                                    onMouseEnter={() => setHoveredIdx(i)}
                                    onMouseLeave={() => setHoveredIdx(null)}
                                    onTouchStart={() => setHoveredIdx(i)}
                                    onTouchEnd={() => setTimeout(() => setHoveredIdx(null), 1500)}>
                                    <motion.div
                                        className="w-full rounded-t-[6px]"
                                        style={{
                                            background: isH ? m.color : `${m.color}50`,
                                            boxShadow: isH ? `0 -4px 12px ${m.color}50` : 'none',
                                        }}
                                        initial={{ height: 0 }}
                                        animate={{ height: h }}
                                        transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 22 }}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {/* Day labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between px-0">
                        {days.map((day, i) => (
                            <div key={i} style={{ width: barW }} className="text-center">
                                <span className="text-[9px] font-bold text-slate-400">{day.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary stats */}
                <div className="flex gap-3 mt-3 pt-3 border-t border-slate-100/80">
                    <div className="flex-1 text-center">
                        <p className="text-[10px] text-slate-400">متوسط</p>
                        <p className="text-[14px] font-black tabular-nums" style={{ color: m.color }}>
                            {avg.toFixed(1)}{unit}
                        </p>
                    </div>
                    <div className="w-px bg-slate-100" />
                    <div className="flex-1 text-center">
                        <p className="text-[10px] text-slate-400">أعلى</p>
                        <p className="text-[14px] font-black tabular-nums" style={{ color: m.color }}>
                            {Math.max(...values).toFixed(1)}{unit}
                        </p>
                    </div>
                    <div className="w-px bg-slate-100" />
                    <div className="flex-1 text-center">
                        <p className="text-[10px] text-slate-400">أدنى</p>
                        <p className="text-[14px] font-black tabular-nums" style={{ color: m.color }}>
                            {Math.min(...values).toFixed(1)}{unit}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Multi-metric overview (all metrics in one compact view) ── */
export function TrackerWeeklyOverview() {
    const [activeMetric, setActiveMetric] = useState<MetricKey>('water');
    const metrics: { key: MetricKey; unit: string; goal?: number }[] = [
        { key: 'water',    unit: ' ك',   goal: 8 },
        { key: 'sleep',    unit: ' س',   goal: 8 },
        { key: 'activity', unit: ' د',   goal: 30 },
        { key: 'mood',     unit: '/١٠'  },
        { key: 'weight',   unit: ' ك'   },
    ];

    const current = metrics.find(m => m.key === activeMetric)!;

    return (
        <div className="px-4 space-y-3">
            {/* Metric selector pills */}
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {metrics.map(({ key }) => {
                    const m = METRIC[key];
                    const isActive = key === activeMetric;
                    return (
                        <motion.button key={key}
                            onClick={() => { setActiveMetric(key); }}
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
                            style={{
                                background: isActive ? m.color : 'rgba(0,0,0,0.05)',
                                color:      isActive ? 'white' : '#64748b',
                                boxShadow:  isActive ? `0 4px 12px ${m.color}35` : 'none',
                            }}
                            animate={{ scale: isActive ? 1.04 : 1 }}
                            transition={SPRING_BOUNCY}>
                            <span>{m.emoji}</span>
                            {m.label}
                        </motion.button>
                    );
                })}
            </div>

            {/* Chart */}
            <AnimatePresence mode="wait">
                <motion.div key={activeMetric}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.18 }}>
                    <TrackerWeeklyChart
                        metricKey={activeMetric}
                        days={demoDays(activeMetric)}
                        goal={current.goal}
                        unit={current.unit}
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
