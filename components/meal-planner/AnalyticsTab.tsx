// components/meal-planner/AnalyticsTab.tsx
// Premium analytics — adherence score, nutrition breakdown, health report, macro ratio

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Heart, Sparkles, Target, Flame, Beef, Wheat, Droplets, Leaf, Award } from 'lucide-react';
import { NutritionInfo, healthConditions } from '@/lib/mealDatabase';
import { DailyGoals } from './types';

interface AnalyticsTabProps {
    dailyTotals: NutritionInfo;
    goals: DailyGoals;
    conditions: string[];
}

function getProgress(current: number, goal: number) {
    return Math.min((current / goal) * 100, 100);
}

function getAdherenceScore(totals: NutritionInfo, goals: DailyGoals): number {
    const scores = [
        getProgress(totals.calories, goals.calories),
        getProgress(totals.protein, goals.protein),
        getProgress(totals.carbs, goals.carbs),
        getProgress(totals.fat, goals.fat),
    ];
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function getScoreColor(score: number): string {
    if (score >= 80) return '#22C55E';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
}

function getScoreLabel(score: number): string {
    if (score >= 80) return 'ممتاز!';
    if (score >= 50) return 'جيد';
    if (score >= 20) return 'يحتاج تحسين';
    return 'ابدأ بتسجيل وجباتك';
}

export default function AnalyticsTab({ dailyTotals, goals, conditions }: AnalyticsTabProps) {
    const adherenceScore = getAdherenceScore(dailyTotals, goals);
    const scoreColor = getScoreColor(adherenceScore);
    const circumference = 2 * Math.PI * 40;
    const strokeDash = (adherenceScore / 100) * circumference;

    const nutritionItems = [
        { label: 'السعرات الحرارية', value: dailyTotals.calories, goal: goals.calories, color: '#F59E0B', icon: Flame, trackColor: '#FEF3C7' },
        { label: 'البروتين', value: dailyTotals.protein, goal: goals.protein, color: '#EF4444', unit: 'غ', icon: Beef, trackColor: '#FEE2E2' },
        { label: 'الكربوهيدرات', value: dailyTotals.carbs, goal: goals.carbs, color: '#8B5CF6', unit: 'غ', icon: Wheat, trackColor: '#EDE9FE' },
        { label: 'الدهون', value: dailyTotals.fat, goal: goals.fat, color: '#3B82F6', unit: 'غ', icon: Droplets, trackColor: '#DBEAFE' },
        { label: 'الألياف', value: dailyTotals.fiber, goal: 25, color: '#22C55E', unit: 'غ', icon: Leaf, trackColor: '#DCFCE7' },
    ];

    // Macro ratio for pie chart
    const totalMacros = dailyTotals.protein + dailyTotals.carbs + dailyTotals.fat;
    const proteinPercent = totalMacros > 0 ? Math.round((dailyTotals.protein / totalMacros) * 100) : 0;
    const carbsPercent = totalMacros > 0 ? Math.round((dailyTotals.carbs / totalMacros) * 100) : 0;
    const fatPercent = totalMacros > 0 ? 100 - proteinPercent - carbsPercent : 0;

    return (
        <motion.div
            key="analytics"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
        >
            {/* ─── Adherence Score Card ─── */}
            <motion.div
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-slate-100 dark:border-slate-700"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="flex items-center gap-5">
                    {/* Score ring */}
                    <div className="relative w-[100px] h-[100px] flex-shrink-0">
                        <svg className="w-[100px] h-[100px] transform -rotate-90">
                            <circle cx="50" cy="50" r="40" strokeWidth="8" fill="none" stroke="#E5E7EB" className="dark:opacity-30" />
                            <motion.circle
                                cx="50" cy="50" r="40" strokeWidth="8" fill="none"
                                stroke={scoreColor}
                                strokeLinecap="round"
                                strokeDasharray={`${circumference}`}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset: circumference - strokeDash }}
                                transition={{ duration: 1.2, ease: 'easeOut' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span
                                className="text-2xl font-extrabold"
                                style={{ color: scoreColor }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                {adherenceScore}%
                            </motion.span>
                        </div>
                    </div>

                    {/* Score details */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Award className="w-5 h-5" style={{ color: scoreColor }} />
                            <h3 className="font-bold text-slate-800 dark:text-white text-lg">الالتزام اليومي</h3>
                        </div>
                        <p className="text-sm font-semibold" style={{ color: scoreColor }}>{getScoreLabel(adherenceScore)}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            بناءً على السعرات والمغذيات الكبرى
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* ─── Macro Ratio Chart ─── */}
            {totalMacros > 0 && (
                <motion.div
                    className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-card border border-slate-100 dark:border-slate-700"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2 text-sm">
                        <Target className="w-4 h-4 text-emerald-500" />
                        نسب المغذيات الكبرى
                    </h3>
                    {/* CSS-based ratio bar */}
                    <div className="h-4 rounded-full overflow-hidden flex">
                        <motion.div
                            className="h-full bg-red-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${proteinPercent}%` }}
                            transition={{ duration: 0.8 }}
                        />
                        <motion.div
                            className="h-full bg-purple-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${carbsPercent}%` }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                        />
                        <motion.div
                            className="h-full bg-blue-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${fatPercent}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                            <span className="text-xs text-slate-600 dark:text-slate-400">بروتين {proteinPercent}%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                            <span className="text-xs text-slate-600 dark:text-slate-400">كربو {carbsPercent}%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                            <span className="text-xs text-slate-600 dark:text-slate-400">دهون {fatPercent}%</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ─── Nutrition Breakdown ─── */}
            <motion.div
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-card border border-slate-100 dark:border-slate-700"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    ملخص المغذيات
                </h3>
                <div className="space-y-3.5">
                    {nutritionItems.map((item, index) => {
                        const Icon = item.icon;
                        const progress = getProgress(item.value, item.goal);
                        return (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.05 }}
                            >
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                        <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                                        {item.label}
                                    </span>
                                    <span className="font-bold text-sm" style={{ color: item.color }}>
                                        {Math.round(item.value)}{item.unit} / {item.goal}{item.unit}
                                    </span>
                                </div>
                                <div className="bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: item.color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* ─── Health Conditions Report ─── */}
            {conditions.length > 0 && (
                <motion.div
                    className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-4 border border-amber-200/50 dark:border-amber-800/30"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2 text-sm">
                        <Heart className="w-4 h-4" />
                        تقرير الحالة الصحية
                    </h3>
                    <div className="space-y-2">
                        {conditions.map(condId => {
                            const condition = healthConditions.find(c => c.id === condId);
                            if (!condition) return null;
                            return (
                                <div key={condId} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-amber-100 dark:border-slate-700">
                                    <div className="font-semibold text-slate-800 dark:text-white mb-1.5 text-sm">{condition.nameAr}</div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        ✓ ينصح: {condition.recommendations.slice(0, 3).join('، ')}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* ─── Smart Tip Card ─── */}
            <motion.div
                className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/15"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                {/* Pattern */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-6 -left-6 w-24 h-24 border-[2px] border-white/10 rounded-full" />
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 border-[2px] border-white/10 rounded-full" />
                </div>
                <div className="relative">
                    <h3 className="font-bold mb-2 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        نصيحة ذكية
                    </h3>
                    <p className="text-sm text-white/90 leading-relaxed">
                        {dailyTotals.protein < goals.protein * 0.5
                            ? 'تحتاج لزيادة البروتين! جرب إضافة صدر دجاج أو بيض للوجبة القادمة. البروتين ضروري لبناء العضلات والشعور بالشبع.'
                            : dailyTotals.fiber < 15
                                ? 'أضف المزيد من الألياف لتحسين الهضم — جرب الشوفان أو الخضروات الورقية. الألياف تساعد على توازن السكر في الدم.'
                                : dailyTotals.calories < goals.calories * 0.3
                                    ? 'لم تسجل وجبات كافية اليوم! تذكر أن تناول السعرات الكافية مهم لصحتك ونشاطك.'
                                    : 'أحسنت! تتبع تقدمك مستمر بشكل ممتاز 🎉 حافظ على هذا الالتزام!'}
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
