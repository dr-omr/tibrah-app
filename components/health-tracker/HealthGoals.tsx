/**
 * HealthGoals — Personal health goals tracker
 * Set and track daily/weekly goals with progress rings
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Target, Plus, Droplets, Moon, Footprints,
    Apple, Dumbbell, Check, Sparkles, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface HealthGoal {
    id: string;
    type: 'water' | 'sleep' | 'steps' | 'meals' | 'exercise' | 'custom';
    label: string;
    target: number;
    current: number;
    unit: string;
    icon: React.ReactNode;
    color: string;
}

const GOALS_KEY = 'tibrah_health_goals';

const goalPresets = [
    { type: 'water' as const, label: 'شرب الماء', target: 8, unit: 'كوب', icon: <Droplets className="w-5 h-5" />, color: '#3B82F6' },
    { type: 'sleep' as const, label: 'النوم', target: 7, unit: 'ساعة', icon: <Moon className="w-5 h-5" />, color: '#6366F1' },
    { type: 'steps' as const, label: 'المشي', target: 8000, unit: 'خطوة', icon: <Footprints className="w-5 h-5" />, color: '#10B981' },
    { type: 'meals' as const, label: 'وجبات صحية', target: 3, unit: 'وجبة', icon: <Apple className="w-5 h-5" />, color: '#F59E0B' },
    { type: 'exercise' as const, label: 'التمارين', target: 30, unit: 'دقيقة', icon: <Dumbbell className="w-5 h-5" />, color: '#EF4444' },
];

// ═══════════════════════════════════════════════════════════════
// Progress Ring SVG
// ═══════════════════════════════════════════════════════════════

function ProgressRing({ progress, color, size = 60 }: { progress: number; color: string; size?: number }) {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(progress, 1) * circumference);

    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={4}
                className="text-slate-100 dark:text-slate-700"
            />
            <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={4}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            />
        </svg>
    );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function HealthGoals() {
    const [goals, setGoals] = useState<HealthGoal[]>([]);
    const [showAdd, setShowAdd] = useState(false);

    // Load goals from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(GOALS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Re-attach icons
                setGoals(parsed.map((g: any) => ({
                    ...g,
                    icon: goalPresets.find(p => p.type === g.type)?.icon || <Target className="w-5 h-5" />,
                })));
            } else {
                // Default goals
                const defaults: HealthGoal[] = goalPresets.slice(0, 3).map((p, i) => ({
                    id: `goal-${i}`,
                    ...p,
                    current: 0,
                }));
                setGoals(defaults);
            }
        } catch { /* ignore */ }
    }, []);

    // Save goals (without icons)
    const saveGoals = (updated: HealthGoal[]) => {
        setGoals(updated);
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            localStorage.setItem(GOALS_KEY, JSON.stringify(updated.map(({ icon, ...rest }) => rest)));
        } catch { /* ignore */ }
    };

    const updateProgress = (goalId: string, delta: number) => {
        const updated = goals.map(g =>
            g.id === goalId ? { ...g, current: Math.max(0, g.current + delta) } : g
        );
        saveGoals(updated);
    };

    const addGoal = (preset: typeof goalPresets[0]) => {
        const newGoal: HealthGoal = {
            id: `goal-${Date.now()}`,
            ...preset,
            current: 0,
        };
        saveGoals([...goals, newGoal]);
        setShowAdd(false);
    };

    const removeGoal = (goalId: string) => {
        saveGoals(goals.filter(g => g.id !== goalId));
    };

    const totalProgress = goals.length > 0
        ? goals.reduce((sum, g) => sum + Math.min(g.current / g.target, 1), 0) / goals.length
        : 0;

    return (
        <div className="space-y-4" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#2D9B83]" />
                    أهدافي اليومية
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{Math.round(totalProgress * 100)}% مكتمل</span>
                    <button
                        onClick={() => setShowAdd(!showAdd)}
                        className="w-8 h-8 rounded-full bg-[#2D9B83]/10 text-[#2D9B83] flex items-center justify-center hover:bg-[#2D9B83]/20 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Overall Progress Ring */}
            <div className="flex items-center gap-4 bg-gradient-to-r from-[#2D9B83]/10 to-[#3FB39A]/10 dark:from-[#2D9B83]/20 dark:to-[#3FB39A]/20 rounded-2xl p-4">
                <div className="relative">
                    <ProgressRing progress={totalProgress} color="#2D9B83" size={70} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-[#2D9B83]">{Math.round(totalProgress * 100)}%</span>
                    </div>
                </div>
                <div>
                    <p className="font-bold text-slate-800 dark:text-white">
                        {totalProgress >= 1 ? '🎉 أحسنت! أكملت كل أهدافك!' :
                            totalProgress >= 0.7 ? '💪 ممتاز! بقي القليل!' :
                                totalProgress >= 0.3 ? '🌱 استمر! أنت في الطريق الصحيح' :
                                    '🚀 ابدأ يومك بقوة!'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {goals.filter(g => g.current >= g.target).length} من {goals.length} أهداف مكتملة
                    </p>
                </div>
            </div>

            {/* Goals List */}
            <div className="space-y-3">
                {goals.map((goal) => {
                    const progress = Math.min(goal.current / goal.target, 1);
                    const isComplete = goal.current >= goal.target;

                    return (
                        <motion.div
                            key={goal.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-white dark:bg-slate-800 rounded-2xl p-4 border transition-all ${isComplete
                                    ? 'border-green-200 dark:border-green-800'
                                    : 'border-slate-100 dark:border-slate-700'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Progress Ring */}
                                <div className="relative flex-shrink-0">
                                    <ProgressRing progress={progress} color={goal.color} size={48} />
                                    <div className="absolute inset-0 flex items-center justify-center" style={{ color: goal.color }}>
                                        {isComplete ? <Check className="w-4 h-4" /> : goal.icon}
                                    </div>
                                </div>

                                {/* Goal info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-slate-800 dark:text-white text-sm">{goal.label}</p>
                                        {isComplete && <Sparkles className="w-3 h-3 text-yellow-500" />}
                                    </div>
                                    <p className="text-xs text-slate-400">
                                        {goal.current} / {goal.target} {goal.unit}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => updateProgress(goal.id, -1)}
                                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 flex items-center justify-center text-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-600"
                                    >
                                        −
                                    </button>
                                    <button
                                        onClick={() => updateProgress(goal.id, 1)}
                                        className="w-8 h-8 rounded-lg text-white flex items-center justify-center text-lg font-bold hover:opacity-90"
                                        style={{ backgroundColor: goal.color }}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Add Goal Sheet */}
            {showAdd && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700"
                >
                    <div className="flex items-center justify-between mb-3">
                        <p className="font-medium text-slate-800 dark:text-white text-sm">إضافة هدف</p>
                        <button onClick={() => setShowAdd(false)} className="text-slate-400">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {goalPresets.filter(p => !goals.some(g => g.type === p.type)).map(preset => (
                            <button
                                key={preset.type}
                                onClick={() => addGoal(preset)}
                                className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-750 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm"
                            >
                                <span style={{ color: preset.color }}>{preset.icon}</span>
                                <span className="text-slate-700 dark:text-slate-300">{preset.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
