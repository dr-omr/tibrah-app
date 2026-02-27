// components/health/HealthMetricsCard.tsx
// Advanced health metrics card with BMI calculator, hydration tracker, and daily summary

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Droplets, Moon, Footprints, Scale, Activity,
    TrendingUp, Heart, Smile, Frown, Meh,
    Plus, Minus, Target
} from 'lucide-react';

interface HealthMetricsCardProps {
    weight?: number;
    height?: number; // in cm
    waterGoal?: number;
    sleepGoal?: number;
    stepsGoal?: number;
}

function CircularProgress({ value, max, color, size = 80, strokeWidth = 6, children }: {
    value: number; max: number; color: string; size?: number; strokeWidth?: number; children?: React.ReactNode;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(value / max, 1);
    const offset = circumference - progress * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke={color + '20'} strokeWidth={strokeWidth}
                />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke={color} strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {children}
            </div>
        </div>
    );
}

function getBmiCategory(bmi: number): { label: string; color: string; emoji: string } {
    if (bmi < 18.5) return { label: 'نحافة', color: '#3B82F6', emoji: '💙' };
    if (bmi < 25) return { label: 'طبيعي', color: '#10B981', emoji: '💚' };
    if (bmi < 30) return { label: 'زيادة وزن', color: '#F59E0B', emoji: '💛' };
    return { label: 'سمنة', color: '#EF4444', emoji: '❤️' };
}

export default function HealthMetricsCard({
    weight = 75,
    height = 170,
    waterGoal = 8,
    sleepGoal = 8,
    stepsGoal = 10000
}: HealthMetricsCardProps) {
    const [waterCount, setWaterCount] = useState(3);
    const [sleepHours, setSleepHours] = useState(6.5);
    const [steps, setSteps] = useState(4500);
    const [mood, setMood] = useState<'happy' | 'neutral' | 'sad'>('neutral');

    const bmi = useMemo(() => {
        const h = height / 100;
        return parseFloat((weight / (h * h)).toFixed(1));
    }, [weight, height]);

    const bmiCat = getBmiCategory(bmi);

    const moodIcons = [
        { key: 'happy' as const, icon: Smile, color: '#10B981', label: '😊' },
        { key: 'neutral' as const, icon: Meh, color: '#F59E0B', label: '😐' },
        { key: 'sad' as const, icon: Frown, color: '#EF4444', label: '😔' },
    ];

    return (
        <div className="space-y-4">
            {/* BMI Card */}
            <motion.div
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <Scale className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white">مؤشر كتلة الجسم (BMI)</h3>
                </div>

                <div className="flex items-center gap-6">
                    <CircularProgress value={bmi} max={40} color={bmiCat.color} size={90} strokeWidth={8}>
                        <div className="text-center">
                            <span className="text-xl font-black" style={{ color: bmiCat.color }}>{bmi}</span>
                        </div>
                    </CircularProgress>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{bmiCat.emoji}</span>
                            <span className="font-bold text-slate-800 dark:text-white">{bmiCat.label}</span>
                        </div>
                        <div className="text-xs text-slate-400 space-y-0.5">
                            <p>الوزن: {weight} كجم</p>
                            <p>الطول: {height} سم</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Daily Trackers Grid */}
            <div className="grid grid-cols-2 gap-3">
                {/* Water Tracker */}
                <motion.div
                    className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center gap-1.5 mb-3">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">الماء</span>
                    </div>
                    <CircularProgress value={waterCount} max={waterGoal} color="#3B82F6" size={70}>
                        <span className="text-sm font-bold text-blue-600">{waterCount}/{waterGoal}</span>
                    </CircularProgress>
                    <div className="flex items-center justify-center gap-3 mt-3">
                        <motion.button
                            className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"
                            whileTap={{ scale: 0.85 }}
                            onClick={() => setWaterCount(Math.max(0, waterCount - 1))}
                        >
                            <Minus className="w-3.5 h-3.5 text-blue-600" />
                        </motion.button>
                        <motion.button
                            className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center"
                            whileTap={{ scale: 0.85 }}
                            onClick={() => setWaterCount(waterCount + 1)}
                        >
                            <Plus className="w-3.5 h-3.5 text-white" />
                        </motion.button>
                    </div>
                </motion.div>

                {/* Sleep Tracker */}
                <motion.div
                    className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <div className="flex items-center gap-1.5 mb-3">
                        <Moon className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">النوم</span>
                    </div>
                    <CircularProgress value={sleepHours} max={sleepGoal} color="#6366F1" size={70}>
                        <span className="text-sm font-bold text-indigo-600">{sleepHours}h</span>
                    </CircularProgress>
                    <p className="text-center text-[10px] text-slate-400 mt-2">
                        {sleepHours >= sleepGoal ? '👏 ممتاز!' : `ينقصك ${(sleepGoal - sleepHours).toFixed(1)} ساعة`}
                    </p>
                </motion.div>

                {/* Steps Counter */}
                <motion.div
                    className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-1.5 mb-3">
                        <Footprints className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">الخطوات</span>
                    </div>
                    <CircularProgress value={steps} max={stepsGoal} color="#10B981" size={70}>
                        <span className="text-sm font-bold text-green-600">{(steps / 1000).toFixed(1)}k</span>
                    </CircularProgress>
                    <p className="text-center text-[10px] text-slate-400 mt-2">
                        الهدف: {(stepsGoal / 1000)}k خطوة
                    </p>
                </motion.div>

                {/* Mood Tracker */}
                <motion.div
                    className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <div className="flex items-center gap-1.5 mb-3">
                        <Heart className="w-4 h-4 text-pink-500" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">المزاج</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 my-3">
                        {moodIcons.map(m => (
                            <motion.button
                                key={m.key}
                                className={`text-2xl transition-transform ${mood === m.key ? 'scale-125' : 'opacity-40 scale-90'}`}
                                whileTap={{ scale: 0.85 }}
                                onClick={() => setMood(m.key)}
                            >
                                {m.label}
                            </motion.button>
                        ))}
                    </div>
                    <p className="text-center text-[10px] text-slate-400">
                        {mood === 'happy' ? 'يومك رائع! 🌟' : mood === 'sad' ? 'بكرة أحلى 💪' : 'يوم عادي 🌤️'}
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
