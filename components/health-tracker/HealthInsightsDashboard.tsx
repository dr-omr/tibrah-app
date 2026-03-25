/**
 * HealthInsightsDashboard — Weekly/Monthly health statistics overview
 * Shows: water trends, sleep quality, weight progress, mood patterns
 * Uses local data from React Query cache
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Droplets, Moon, Scale, Smile, TrendingUp, TrendingDown,
    Minus, Calendar, ChevronLeft, ChevronRight, Sparkles, Activity
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface DailyData {
    date: string;
    water_glasses?: number;
    sleep_hours?: number;
    mood?: number; // 1-5
    weight?: number;
    steps?: number;
    energy?: number; // 1-5
}

interface HealthInsightsDashboardProps {
    dailyData: DailyData[];
    weightGoal?: number;
    waterGoal?: number;
}

type Period = '7d' | '30d';

// ═══════════════════════════════════════════════════════════════
// Helper: Mini bar chart
// ═══════════════════════════════════════════════════════════════

function MiniBarChart({
    data,
    color,
    maxValue,
}: {
    data: number[];
    color: string;
    maxValue?: number;
}) {
    const max = maxValue || Math.max(...data, 1);
    return (
        <div className="flex items-end gap-[3px] h-14">
            {data.map((val, idx) => (
                <div
                    key={idx}
                    className={`flex-1 rounded-t-sm min-w-[4px] transition-all duration-300 ${color}`}
                    style={{
                        height: `${Math.max((val / max) * 100, 4)}%`,
                        opacity: idx === data.length - 1 ? 1 : 0.5 + (idx / data.length) * 0.5,
                    }}
                />
            ))}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// Helper: Trend indicator
// ═══════════════════════════════════════════════════════════════

function TrendBadge({ current, previous, suffix = '', inverted = false }: {
    current: number;
    previous: number;
    suffix?: string;
    inverted?: boolean;
}) {
    const diff = current - previous;
    const pct = previous > 0 ? Math.round((diff / previous) * 100) : 0;
    const isPositive = inverted ? diff < 0 : diff > 0;
    const isNeutral = diff === 0;

    if (isNeutral) {
        return (
            <span className="text-xs text-slate-400 flex items-center gap-0.5">
                <Minus className="w-3 h-3" /> ثابت
            </span>
        );
    }

    return (
        <span className={`text-xs flex items-center gap-0.5 font-medium ${isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(pct)}%{suffix}
        </span>
    );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function HealthInsightsDashboard({
    dailyData,
    weightGoal,
    waterGoal = 8,
}: HealthInsightsDashboardProps) {
    const [period, setPeriod] = useState<Period>('7d');

    const periodDays = period === '7d' ? 7 : 30;
    const periodLabel = period === '7d' ? 'الأسبوع' : 'الشهر';

    // ─── Computed stats ───────────────────────────────────
    const stats = useMemo(() => {
        const sorted = [...dailyData].sort((a, b) => a.date.localeCompare(b.date));
        const recent = sorted.slice(-periodDays);
        const previous = sorted.slice(-periodDays * 2, -periodDays);

        const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        const last = (arr: number[]) => arr.length > 0 ? arr[arr.length - 1] : 0;

        // Water
        const waterNums = recent.map(d => d.water_glasses || 0);
        const waterPrev = previous.map(d => d.water_glasses || 0);
        const waterAvg = avg(waterNums);
        const waterPrevAvg = avg(waterPrev);
        const waterDaysOnTarget = waterNums.filter(w => w >= waterGoal).length;

        // Sleep
        const sleepNums = recent.map(d => d.sleep_hours || 0).filter(s => s > 0);
        const sleepPrev = previous.map(d => d.sleep_hours || 0).filter(s => s > 0);
        const sleepAvg = avg(sleepNums);
        const sleepPrevAvg = avg(sleepPrev);

        // Mood
        const moodNums = recent.map(d => d.mood || 0).filter(m => m > 0);
        const moodPrev = previous.map(d => d.mood || 0).filter(m => m > 0);
        const moodAvg = avg(moodNums);
        const moodPrevAvg = avg(moodPrev);

        // Weight
        const weightNums = recent.map(d => d.weight || 0).filter(w => w > 0);
        const currentWeight = last(weightNums);
        const weightStart = weightNums.length > 0 ? weightNums[0] : 0;
        const weightChange = currentWeight - weightStart;

        return {
            water: { avg: waterAvg, prevAvg: waterPrevAvg, data: waterNums, onTarget: waterDaysOnTarget },
            sleep: { avg: sleepAvg, prevAvg: sleepPrevAvg, data: recent.map(d => d.sleep_hours || 0) },
            mood: { avg: moodAvg, prevAvg: moodPrevAvg, data: recent.map(d => d.mood || 0) },
            weight: { current: currentWeight, change: weightChange, data: recent.map(d => d.weight || 0) },
        };
    }, [dailyData, periodDays, waterGoal]);

    const moodEmoji = (val: number) => {
        if (val >= 4.5) return '😄';
        if (val >= 3.5) return '🙂';
        if (val >= 2.5) return '😐';
        if (val >= 1.5) return '😟';
        return '😔';
    };

    // ─── Render ───────────────────────────────────────────
    return (
        <div className="space-y-4" dir="rtl">
            {/* Period Toggle */}
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                    إحصائيات {periodLabel}
                </h3>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                    {(['7d', '30d'] as Period[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${period === p
                                    ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                                    : 'text-slate-500'
                                }`}
                        >
                            {p === '7d' ? '7 أيام' : '30 يوم'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                {/* Water */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Droplets className="w-4 h-4 text-blue-500" />
                            </div>
                            <span className="text-xs text-slate-500 font-medium">الماء</span>
                        </div>
                        <TrendBadge current={stats.water.avg} previous={stats.water.prevAvg} />
                    </div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                        {stats.water.avg.toFixed(1)} <span className="text-sm text-slate-400">كوب/يوم</span>
                    </p>
                    <p className="text-xs text-green-500">
                        {stats.water.onTarget} من {periodDays} أيام على الهدف
                    </p>
                    <div className="mt-3">
                        <MiniBarChart data={stats.water.data} color="bg-blue-400" maxValue={waterGoal + 2} />
                    </div>
                </motion.div>

                {/* Sleep */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <Moon className="w-4 h-4 text-indigo-500" />
                            </div>
                            <span className="text-xs text-slate-500 font-medium">النوم</span>
                        </div>
                        <TrendBadge current={stats.sleep.avg} previous={stats.sleep.prevAvg} />
                    </div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                        {stats.sleep.avg.toFixed(1)} <span className="text-sm text-slate-400">ساعة/يوم</span>
                    </p>
                    <p className="text-xs text-slate-400">
                        {stats.sleep.avg >= 7 ? '✅ ممتاز' : stats.sleep.avg >= 6 ? '⚡ جيد' : '⚠️ يحتاج تحسين'}
                    </p>
                    <div className="mt-3">
                        <MiniBarChart data={stats.sleep.data} color="bg-indigo-400" maxValue={10} />
                    </div>
                </motion.div>

                {/* Mood */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Smile className="w-4 h-4 text-amber-500" />
                            </div>
                            <span className="text-xs text-slate-500 font-medium">المزاج</span>
                        </div>
                        <TrendBadge current={stats.mood.avg} previous={stats.mood.prevAvg} />
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-3xl">{moodEmoji(stats.mood.avg)}</span>
                        <span className="text-lg font-bold text-slate-800 dark:text-white">
                            {stats.mood.avg.toFixed(1)}/5
                        </span>
                    </div>
                    <div className="mt-3">
                        <MiniBarChart data={stats.mood.data} color="bg-amber-400" maxValue={5} />
                    </div>
                </motion.div>

                {/* Weight */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <Scale className="w-4 h-4 text-emerald-500" />
                            </div>
                            <span className="text-xs text-slate-500 font-medium">الوزن</span>
                        </div>
                        {stats.weight.change !== 0 && (
                            <span className={`text-xs font-bold ${stats.weight.change < 0 ? 'text-green-500' : 'text-orange-500'
                                }`}>
                                {stats.weight.change > 0 ? '+' : ''}{stats.weight.change.toFixed(1)} كغ
                            </span>
                        )}
                    </div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                        {stats.weight.current > 0 ? stats.weight.current.toFixed(1) : '--'}{' '}
                        <span className="text-sm text-slate-400">كغ</span>
                    </p>
                    {weightGoal && stats.weight.current > 0 && (
                        <p className="text-xs text-slate-400">
                            الهدف: {weightGoal} كغ — باقي {Math.abs(stats.weight.current - weightGoal).toFixed(1)} كغ
                        </p>
                    )}
                    <div className="mt-3">
                        <MiniBarChart data={stats.weight.data} color="bg-emerald-400" />
                    </div>
                </motion.div>
            </div>

            {/* AI Summary Placeholder */}
            <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 dark:from-primary/20 dark:to-primary-light/20 rounded-2xl p-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-primary">ملخص ذكي</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {stats.water.avg >= waterGoal
                        ? '💧 ممتاز! أنت تشرب كمية كافية من الماء. '
                        : `💧 حاول زيادة شرب الماء — المعدل ${stats.water.avg.toFixed(1)} من ${waterGoal} أكواب. `}
                    {stats.sleep.avg >= 7
                        ? '😴 نومك جيد. '
                        : '😴 حاول النوم أكثر لتحسين طاقتك. '}
                    {stats.mood.avg >= 3.5
                        ? '😊 مزاجك مستقر وإيجابي!'
                        : '🌱 استمر بالعمل على صحتك النفسية.'}
                </p>
            </div>
        </div>
    );
}
