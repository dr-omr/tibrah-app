// components/meal-planner/DailySummary.tsx
// Premium daily nutrition summary with enhanced circular progress + calorie insights

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Beef, Wheat, Droplets, Zap } from 'lucide-react';
import { NutritionInfo } from '@/lib/mealTypes';
import { DailyGoals } from './types';

interface DailySummaryProps {
    dailyTotals: NutritionInfo;
    goals: DailyGoals;
}

const nutrientConfig = [
    { key: 'calories' as const, label: 'سعرات', icon: Flame, color: '#F59E0B', trackColor: '#FEF3C7' },
    { key: 'protein' as const, label: 'بروتين', icon: Beef, color: '#EF4444', trackColor: '#FEE2E2', unit: 'غ' },
    { key: 'carbs' as const, label: 'كربو', icon: Wheat, color: '#8B5CF6', trackColor: '#EDE9FE', unit: 'غ' },
    { key: 'fat' as const, label: 'دهون', icon: Droplets, color: '#3B82F6', trackColor: '#DBEAFE', unit: 'غ' },
];

function getProgress(current: number, goal: number) {
    return Math.min((current / goal) * 100, 100);
}

function getStatusEmoji(percent: number): string {
    if (percent >= 90) return '🎉';
    if (percent >= 60) return '💪';
    if (percent >= 30) return '🍽️';
    return '🌅';
}

function getStatusText(remaining: number): string {
    if (remaining <= 0) return 'أحسنت! وصلت لهدفك اليوم';
    if (remaining <= 200) return 'قريب جداً من هدفك!';
    if (remaining <= 500) return 'نصف الطريق، استمر!';
    return 'ابدأ يومك بوجبة صحية';
}

export default function DailySummary({ dailyTotals, goals }: DailySummaryProps) {
    const caloriePercent = getProgress(dailyTotals.calories, goals.calories);
    const remaining = Math.round(goals.calories - dailyTotals.calories);

    return (
        <div className="px-4 -mt-2 relative z-10">
            <motion.div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700/50 p-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
                {/* Nutrient Rings */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {nutrientConfig.map((item, index) => {
                        const Icon = item.icon;
                        const value = dailyTotals[item.key];
                        const goal = goals[item.key];
                        const progress = getProgress(value, goal);
                        const circumference = 2 * Math.PI * 26;
                        const strokeDash = (progress / 100) * circumference;

                        return (
                            <motion.div
                                key={item.key}
                                className="text-center"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.08, type: 'spring' }}
                            >
                                <div className="relative w-[60px] h-[60px] mx-auto mb-1.5">
                                    <svg className="w-[60px] h-[60px] transform -rotate-90">
                                        {/* Track */}
                                        <circle
                                            cx="30" cy="30" r="26"
                                            strokeWidth="5"
                                            fill="none"
                                            stroke={item.trackColor}
                                            className="dark:opacity-30"
                                        />
                                        {/* Progress */}
                                        <motion.circle
                                            cx="30" cy="30" r="26"
                                            strokeWidth="5"
                                            fill="none"
                                            stroke={item.color}
                                            strokeLinecap="round"
                                            strokeDasharray={`${circumference}`}
                                            initial={{ strokeDashoffset: circumference }}
                                            animate={{ strokeDashoffset: circumference - strokeDash }}
                                            transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Icon className="w-5 h-5" style={{ color: item.color }} />
                                    </div>
                                </div>
                                <div className="text-[13px] font-bold text-slate-800 dark:text-white leading-tight">
                                    {Math.round(value)}{item.unit}
                                </div>
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                                    / {goal}{item.unit}
                                </div>
                                <div className="text-[10px] font-medium text-slate-400 mt-0.5">{item.label}</div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Progress Bar with label */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-500" />
                            {getStatusText(remaining)}
                        </span>
                        <span className="font-bold text-slate-600 dark:text-slate-300">
                            {Math.round(caloriePercent)}%
                        </span>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 relative"
                            initial={{ width: 0 }}
                            animate={{ width: `${caloriePercent}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        >
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 overflow-hidden rounded-full">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_ease-in-out_infinite]" />
                            </div>
                        </motion.div>
                    </div>
                    <p className="text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {getStatusEmoji(caloriePercent)} {remaining > 0 ? `${remaining} سعرة متبقية` : 'وصلت لهدفك!'}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
