// components/meal-planner/AnalyticsTab.tsx
// Daily analytics with nutrition breakdown and health report

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Heart, Sparkles } from 'lucide-react';
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

export default function AnalyticsTab({ dailyTotals, goals, conditions }: AnalyticsTabProps) {
    const nutritionItems = [
        { label: 'السعرات الحرارية', value: dailyTotals.calories, goal: goals.calories, color: '#F59E0B' },
        { label: 'البروتين', value: dailyTotals.protein, goal: goals.protein, color: '#EF4444', unit: 'غ' },
        { label: 'الكربوهيدرات', value: dailyTotals.carbs, goal: goals.carbs, color: '#8B5CF6', unit: 'غ' },
        { label: 'الدهون', value: dailyTotals.fat, goal: goals.fat, color: '#3B82F6', unit: 'غ' },
        { label: 'الألياف', value: dailyTotals.fiber, goal: 25, color: '#22C55E', unit: 'غ' },
    ];

    return (
        <motion.div
            key="analytics"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
        >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    ملخص اليوم
                </h3>
                <div className="space-y-4">
                    {nutritionItems.map((item) => (
                        <div key={item.label}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                                <span className="font-bold" style={{ color: item.color }}>
                                    {Math.round(item.value)}{item.unit} / {item.goal}{item.unit}
                                </span>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: item.color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${getProgress(item.value, item.goal)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {conditions.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4">
                    <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        تقرير الحالة الصحية
                    </h3>
                    <div className="space-y-2">
                        {conditions.map(condId => {
                            const condition = healthConditions.find(c => c.id === condId);
                            if (!condition) return null;
                            return (
                                <div key={condId} className="bg-white dark:bg-slate-800 rounded-xl p-3">
                                    <div className="font-medium text-slate-800 dark:text-white mb-1">{condition.nameAr}</div>
                                    <p className="text-xs text-slate-500">
                                        ✓ ينصح: {condition.recommendations.slice(0, 3).join('، ')}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-white">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    نصيحة اليوم
                </h3>
                <p className="text-sm text-white/90">
                    {dailyTotals.protein < goals.protein * 0.5
                        ? 'تحتاج لزيادة البروتين! جرب إضافة صدر دجاج أو بيض للوجبة القادمة.'
                        : dailyTotals.fiber < 15
                            ? 'أضف المزيد من الألياف لتحسين الهضم - جرب الشوفان أو الخضروات الورقية.'
                            : 'أحسنت! تتبع تقدمك مستمر بشكل ممتاز 🎉'}
                </p>
            </div>
        </motion.div>
    );
}
