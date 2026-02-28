// components/health-tracker/WeeklyHealthReport.tsx
// Weekly Health Report with Week-over-Week Comparison

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Minus, Calendar, Droplets, Moon,
    Activity, Heart, Brain, Scale, Share2, Download, ChevronLeft,
    ChevronRight, Sparkles, Award, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { aiClient } from '@/components/ai/aiClient';

interface WeeklyHealthReportProps {
    dailyLogs: any[];
    metrics: any[];
}

interface WeekData {
    water: number[];
    sleep: number[];
    mood: number[];
    steps: number[];
    weight: number[];
}

function getWeekRange(offset: number): { start: Date; end: Date; label: string } {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() - (offset * 7));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const formatDate = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;
    return {
        start: startOfWeek,
        end: endOfWeek,
        label: offset === 0 ? 'هذا الأسبوع' : offset === 1 ? 'الأسبوع الماضي' : `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`
    };
}

function avg(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function sum(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0);
}

export default function WeeklyHealthReport({ dailyLogs, metrics }: WeeklyHealthReportProps) {
    const [weekOffset, setWeekOffset] = useState(0);
    const [aiInsight, setAiInsight] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(false);

    const currentWeek = useMemo(() => getWeekRange(weekOffset), [weekOffset]);
    const prevWeek = useMemo(() => getWeekRange(weekOffset + 1), [weekOffset]);

    // Extract week data
    const getWeekData = (start: Date, end: Date): WeekData => {
        const logsInRange = dailyLogs.filter(log => {
            const d = new Date(log.date);
            return d >= start && d <= end;
        });

        const metricsInRange = metrics.filter(m => {
            const d = new Date(m.recorded_at || m.created_date);
            return d >= start && d <= end;
        });

        return {
            water: logsInRange.map(l => l.water_cups || 0),
            sleep: logsInRange.map(l => l.sleep_hours || 0),
            mood: logsInRange.map(l => l.mood_score || 0),
            steps: logsInRange.map(l => l.steps || 0),
            weight: metricsInRange.filter(m => m.type === 'weight').map(m => m.value || 0),
        };
    };

    const thisWeekData = useMemo(() => getWeekData(currentWeek.start, currentWeek.end), [dailyLogs, metrics, currentWeek]);
    const lastWeekData = useMemo(() => getWeekData(prevWeek.start, prevWeek.end), [dailyLogs, metrics, prevWeek]);

    const reportItems = [
        {
            icon: Droplets,
            label: 'الماء',
            unit: 'كوب',
            thisWeek: sum(thisWeekData.water),
            lastWeek: sum(lastWeekData.water),
            color: '#06B6D4',
            bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
        },
        {
            icon: Moon,
            label: 'النوم',
            unit: 'ساعة/يوم',
            thisWeek: Math.round(avg(thisWeekData.sleep) * 10) / 10,
            lastWeek: Math.round(avg(lastWeekData.sleep) * 10) / 10,
            color: '#8B5CF6',
            bgColor: 'bg-violet-50 dark:bg-violet-950/30',
        },
        {
            icon: Heart,
            label: 'المزاج',
            unit: '/10',
            thisWeek: Math.round(avg(thisWeekData.mood) * 10) / 10,
            lastWeek: Math.round(avg(lastWeekData.mood) * 10) / 10,
            color: '#EC4899',
            bgColor: 'bg-pink-50 dark:bg-pink-950/30',
        },
        {
            icon: Activity,
            label: 'النشاط',
            unit: 'خطوة',
            thisWeek: sum(thisWeekData.steps),
            lastWeek: sum(lastWeekData.steps),
            color: '#10B981',
            bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
        },
    ];

    // Calculate overall score
    const overallScore = useMemo(() => {
        let score = 50;
        // Water: +10 if >= 8 cups/day avg
        if (avg(thisWeekData.water) >= 8) score += 15;
        else if (avg(thisWeekData.water) >= 5) score += 8;
        // Sleep: +10 if >= 7h avg
        if (avg(thisWeekData.sleep) >= 7) score += 15;
        else if (avg(thisWeekData.sleep) >= 5) score += 5;
        // Mood: +10 if >= 7
        if (avg(thisWeekData.mood) >= 7) score += 10;
        else if (avg(thisWeekData.mood) >= 5) score += 5;
        // Active days
        const activeDays = thisWeekData.water.filter(w => w > 0).length;
        score += activeDays * 2;
        return Math.min(100, score);
    }, [thisWeekData]);

    const getScoreLabel = (s: number) => {
        if (s >= 85) return { text: 'ممتاز! 🌟', color: '#10B981' };
        if (s >= 70) return { text: 'جيد جداً 💪', color: '#3B82F6' };
        if (s >= 50) return { text: 'جيد 👍', color: '#F59E0B' };
        return { text: 'يحتاج تحسين 📈', color: '#EF4444' };
    };

    const scoreInfo = getScoreLabel(overallScore);

    const handleShare = async () => {
        const text = `📊 تقريري الصحي الأسبوعي\n\nالنتيجة: ${overallScore}/100\n💧 الماء: ${sum(thisWeekData.water)} كوب\n😴 النوم: ${avg(thisWeekData.sleep).toFixed(1)} ساعة/يوم\n❤️ المزاج: ${avg(thisWeekData.mood).toFixed(1)}/10\n\n— طِبرَا`;

        if (navigator.share) {
            try {
                await navigator.share({ title: 'تقريري الصحي', text });
            } catch { /* cancelled */ }
        } else {
            await navigator.clipboard.writeText(text);
            toast.success('تم نسخ التقرير! 📋');
        }
    };

    return (
        <div className="space-y-4">
            {/* Week Navigation */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
                <button
                    onClick={() => setWeekOffset(w => w + 1)}
                    className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
                >
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                </button>
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#2D9B83]" />
                    <span className="font-bold text-slate-800 dark:text-white">{currentWeek.label}</span>
                </div>
                <button
                    onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
                    disabled={weekOffset === 0}
                    className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center disabled:opacity-30"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            {/* Overall Score */}
            <motion.div
                className="bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] rounded-3xl p-6 text-center shadow-lg"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-white/80" />
                    <span className="text-white/80 text-sm font-medium">نتيجتك الأسبوعية</span>
                </div>
                <motion.div
                    className="text-6xl font-bold text-white mb-1"
                    key={overallScore}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    {overallScore}
                </motion.div>
                <span className="text-white/60 text-xs">من 100</span>
                <div className="mt-3">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-bold">
                        {scoreInfo.text}
                    </span>
                </div>
            </motion.div>

            {/* Metrics Comparison */}
            <div className="space-y-3">
                {reportItems.map((item, index) => {
                    const Icon = item.icon;
                    const diff = item.thisWeek - item.lastWeek;
                    const percentChange = item.lastWeek > 0 ? Math.round((diff / item.lastWeek) * 100) : 0;
                    const isUp = diff > 0;
                    const isDown = diff < 0;
                    const isSame = diff === 0;

                    return (
                        <motion.div
                            key={item.label}
                            className={`${item.bgColor} rounded-2xl p-4`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: item.color + '20' }}
                                    >
                                        <Icon className="w-5 h-5" style={{ color: item.color }} />
                                    </div>
                                    <div>
                                        <span className="text-sm font-bold text-slate-800 dark:text-white">{item.label}</span>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            {item.thisWeek} {item.unit}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-left">
                                    {isUp && (
                                        <div className="flex items-center gap-1 text-emerald-600">
                                            <TrendingUp className="w-4 h-4" />
                                            <span className="text-sm font-bold">+{percentChange}%</span>
                                        </div>
                                    )}
                                    {isDown && (
                                        <div className="flex items-center gap-1 text-red-500">
                                            <TrendingDown className="w-4 h-4" />
                                            <span className="text-sm font-bold">{percentChange}%</span>
                                        </div>
                                    )}
                                    {isSame && (
                                        <div className="flex items-center gap-1 text-slate-400">
                                            <Minus className="w-4 h-4" />
                                            <span className="text-sm font-bold">ثابت</span>
                                        </div>
                                    )}
                                    <div className="text-[10px] text-slate-400">
                                        الأسبوع الماضي: {item.lastWeek}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* AI Weekly Insight */}
            <motion.div
                className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-4 border border-purple-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <span className="font-bold text-slate-800 text-sm">رؤى ذكية أسبوعية</span>
                    </div>
                    <Button
                        size="sm"
                        className="bg-purple-600 text-white rounded-xl h-8 text-xs"
                        disabled={aiLoading}
                        onClick={async () => {
                            setAiLoading(true);
                            try {
                                const result = await aiClient.generateWeeklyReport({
                                    water: { total: sum(thisWeekData.water), avg: avg(thisWeekData.water).toFixed(1) },
                                    sleep: { avg: avg(thisWeekData.sleep).toFixed(1) },
                                    mood: { avg: avg(thisWeekData.mood).toFixed(1) },
                                    steps: { total: sum(thisWeekData.steps) },
                                    score: overallScore,
                                    days_tracked: thisWeekData.water.filter(w => w > 0).length
                                });
                                setAiInsight(result);
                            } catch { toast.error('تعذر التحليل'); }
                            finally { setAiLoading(false); }
                        }}
                    >
                        {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3 ml-1" />}
                        {aiLoading ? 'جاري...' : 'احصل على رؤى'}
                    </Button>
                </div>
                {aiInsight && (
                    <div className="space-y-2 mt-3">
                        {aiInsight.summary && <p className="text-sm text-slate-700 leading-relaxed">{aiInsight.summary}</p>}
                        {aiInsight.highlights?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {aiInsight.highlights.map((h: string, i: number) => (
                                    <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-lg border border-green-200">✓ {h}</span>
                                ))}
                            </div>
                        )}
                        {aiInsight.next_week_plan?.length > 0 && (
                            <div>
                                <p className="text-xs font-bold text-purple-700 mb-1">📋 خطة الأسبوع القادم:</p>
                                {aiInsight.next_week_plan.map((p: string, i: number) => (
                                    <p key={i} className="text-xs text-slate-600 mr-2">• {p}</p>
                                ))}
                            </div>
                        )}
                        {aiInsight.motivation && (
                            <p className="text-xs text-purple-600 italic text-center mt-2">"{aiInsight.motivation}"</p>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Actions */}
            <div className="flex gap-3">
                <Button
                    onClick={handleShare}
                    className="flex-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl h-12"
                    variant="outline"
                >
                    <Share2 className="w-4 h-4 ml-2" />
                    مشاركة التقرير
                </Button>
            </div>
        </div>
    );
}
