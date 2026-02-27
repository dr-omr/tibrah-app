// components/meal-planner/DailySummary.tsx
// Daily nutrition summary with circular progress indicators

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Beef, Wheat, Droplets } from 'lucide-react';
import { NutritionInfo } from '@/lib/mealDatabase';
import { DailyGoals } from './types';

interface DailySummaryProps {
    dailyTotals: NutritionInfo;
    goals: DailyGoals;
}

const nutrientConfig = [
    { key: 'calories' as const, label: 'سعرات', icon: Flame, color: '#F59E0B', unit: '' },
    { key: 'protein' as const, label: 'بروتين', icon: Beef, color: '#EF4444', unit: 'غ' },
    { key: 'carbs' as const, label: 'كربوهيدرات', icon: Wheat, color: '#8B5CF6', unit: 'غ' },
    { key: 'fat' as const, label: 'دهون', icon: Droplets, color: '#3B82F6', unit: 'غ' },
];

function getProgress(current: number, goal: number) {
    return Math.min((current / goal) * 100, 100);
}

export default function DailySummary({ dailyTotals, goals }: DailySummaryProps) {
    return (
        <div className="px-4 -mt-4 relative z-10">
            <motion.div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="grid grid-cols-4 gap-3 mb-4">
                    {nutrientConfig.map((item, index) => {
                        const Icon = item.icon;
                        const value = dailyTotals[item.key];
                        const goal = goals[item.key];
                        const progress = getProgress(value, goal);
                        return (
                            <motion.div
                                key={item.key}
                                className="text-center"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <motion.div className="relative w-14 h-14 mx-auto mb-2" whileTap={{ rotate: 10 }}>
                                    <svg className="w-14 h-14 transform -rotate-90">
                                        <circle cx="28" cy="28" r="24" strokeWidth="4" fill="none" stroke="#E5E7EB" />
                                        <circle
                                            cx="28" cy="28" r="24" strokeWidth="4" fill="none"
                                            stroke={item.color}
                                            strokeLinecap="round"
                                            strokeDasharray={`${progress * 1.5} 150`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Icon className="w-5 h-5" style={{ color: item.color }} />
                                    </div>
                                </motion.div>
                                <div className="text-sm font-bold text-slate-800 dark:text-white">
                                    {Math.round(value)}{item.unit}
                                </div>
                                <div className="text-[10px] text-slate-400">/ {goal}{item.unit}</div>
                            </motion.div>
                        );
                    })}
                </div>
                <div className="bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgress(dailyTotals.calories, goals.calories)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </div>
                <p className="text-center text-sm text-slate-500 mt-2">
                    {Math.round(goals.calories - dailyTotals.calories)} سعرة متبقية
                </p>
            </motion.div>
        </div>
    );
}
