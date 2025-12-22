// components/health-tracker/WeightBodyTrackerPro.tsx
// PREMIUM Interactive Weight & Body Tracking with Animated BMI Gauge

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { getUserData, setUserData } from '@/lib/userDataService';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import {
    Scale, TrendingUp, TrendingDown, Target, Plus,
    Minus, Award, Sparkles, ArrowUp, ArrowDown, Ruler, Activity
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';

// BMI Categories
const BMI_CATEGORIES = [
    { min: 0, max: 18.5, label: 'نحيف', color: '#3B82F6', emoji: '🪶', advice: 'حاول زيادة السعرات' },
    { min: 18.5, max: 25, label: 'طبيعي', color: '#10B981', emoji: '✨', advice: 'حافظ على وزنك!' },
    { min: 25, max: 30, label: 'زيادة', color: '#F59E0B', emoji: '⚠️', advice: 'تمارين + غذاء صحي' },
    { min: 30, max: 50, label: 'سمنة', color: '#EF4444', emoji: '🏋️', advice: 'استشر طبيب' },
];

interface WeightEntry {
    id?: string;
    date: string;
    weight: number;
    height?: number;
}

export default function WeightBodyTrackerPro() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const userId = user?.id || null;

    // State
    const [showAddSheet, setShowAddSheet] = useState(false);
    const [newWeight, setNewWeight] = useState(70);
    const [height, setHeight] = useState(170);
    const [goalWeight, setGoalWeight] = useState(70);

    // Load user-specific data from cloud
    useEffect(() => {
        const loadUserData = async () => {
            const savedHeight = await getUserData(userId, 'userHeight', 170);
            const savedGoal = await getUserData(userId, 'goalWeight', 70);
            setHeight(savedHeight);
            setGoalWeight(savedGoal);
        };
        loadUserData();
    }, [userId]);

    // Animated BMI needle
    const bmiRotation = useMotionValue(-90);

    // Fetch weight history
    const { data: weightHistory = [] } = useQuery<WeightEntry[]>({
        queryKey: ['weightHistoryPro'],
        queryFn: async () => {
            try {
                const logs = await db.entities.WeightLog.filter({});
                return logs.map((log: any) => ({
                    id: log.id,
                    date: log.date,
                    weight: log.weight,
                    height: log.height || height
                })).sort((a: WeightEntry, b: WeightEntry) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );
            } catch {
                return [];
            }
        },
    });

    const latestWeight = weightHistory[0]?.weight || 70;
    const previousWeight = weightHistory[1]?.weight || latestWeight;
    const weightChange = latestWeight - previousWeight;

    // Calculate BMI
    const bmi = latestWeight / Math.pow(height / 100, 2);
    const bmiCategory = BMI_CATEGORIES.find(c => bmi >= c.min && bmi < c.max) || BMI_CATEGORIES[1];

    // Calculate progress to goal
    const startWeight = weightHistory[weightHistory.length - 1]?.weight || latestWeight;
    const progressToGoal = Math.abs(startWeight - latestWeight) / Math.abs(startWeight - goalWeight) * 100;

    // Animate BMI gauge
    useEffect(() => {
        // BMI range 15-40 maps to -90 to 90 degrees
        const targetRotation = ((bmi - 15) / 25) * 180 - 90;
        animate(bmiRotation, Math.max(-90, Math.min(90, targetRotation)), { duration: 1.5, ease: "easeOut" });
    }, [bmi, bmiRotation]);

    // Save weight mutation
    const saveWeightMutation = useMutation({
        mutationFn: async () => {
            // Save to cloud
            await setUserData(userId, 'userHeight', height);
            await setUserData(userId, 'goalWeight', goalWeight);

            const existing = await db.entities.WeightLog.filter({ date: today });
            if (existing?.[0]) {
                return db.entities.WeightLog.update(existing[0].id as string, {
                    weight: newWeight,
                    height,
                    goal: goalWeight
                });
            }
            return db.entities.WeightLog.create({
                date: today,
                weight: newWeight,
                height,
                goal: goalWeight
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['weightHistoryPro'] });
            setShowAddSheet(false);

            if (newWeight < latestWeight) {
                toast.success(`🎉 أحسنت! نزلت ${(latestWeight - newWeight).toFixed(1)} كجم`);
            } else {
                toast.success('تم تسجيل الوزن ⚖️');
            }
        },
    });

    // Get last 7 entries for chart
    const chartData = weightHistory.slice(0, 7).reverse();
    const maxWeight = Math.max(...chartData.map(d => d.weight), latestWeight);
    const minWeight = Math.min(...chartData.map(d => d.weight), latestWeight);
    const range = (maxWeight - minWeight) || 5;

    return (
        <motion.div
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Main Weight Card */}
            <motion.div
                className="relative bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-[2.5rem] p-6 text-white overflow-hidden shadow-2xl"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
            >
                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(10)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-xl"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                y: [0, -30, 0],
                                opacity: [0, 0.5, 0],
                                scale: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 4 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 3,
                            }}
                        >
                            {['⚖️', '🏋️', '💪'][i % 3]}
                        </motion.div>
                    ))}
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <motion.div
                            className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm"
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                        >
                            <Scale className="w-7 h-7" />
                        </motion.div>
                        <div>
                            <h2 className="text-2xl font-bold">تتبع الوزن</h2>
                            <p className="text-white/80 text-sm">راقب تقدمك</p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            setNewWeight(latestWeight);
                            setShowAddSheet(true);
                        }}
                        className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center backdrop-blur-sm"
                    >
                        <Plus className="w-6 h-6" />
                    </motion.button>
                </div>

                {/* Current Weight Display */}
                <div className="text-center mb-6 relative z-10">
                    <motion.div
                        className="text-7xl font-bold mb-2"
                        key={latestWeight}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        {latestWeight}
                        <span className="text-2xl mr-1">كجم</span>
                    </motion.div>

                    {/* Weight change indicator */}
                    <motion.div
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${weightChange < 0 ? 'bg-green-500/30 text-green-200' :
                            weightChange > 0 ? 'bg-red-500/30 text-red-200' :
                                'bg-white/20 text-white/80'
                            }`}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {weightChange < 0 ? (
                            <>
                                <TrendingDown className="w-4 h-4" />
                                {Math.abs(weightChange).toFixed(1)}− كجم
                            </>
                        ) : weightChange > 0 ? (
                            <>
                                <TrendingUp className="w-4 h-4" />
                                +{weightChange.toFixed(1)} كجم
                            </>
                        ) : (
                            'ثابت'
                        )}
                    </motion.div>
                </div>

                {/* BMI Gauge */}
                <div className="relative h-32 mb-6 flex justify-center relative z-10">
                    <div className="relative w-64">
                        {/* Gauge background arc */}
                        <svg className="w-full h-full" viewBox="0 0 200 100">
                            <defs>
                                <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#3B82F6" />
                                    <stop offset="35%" stopColor="#10B981" />
                                    <stop offset="65%" stopColor="#F59E0B" />
                                    <stop offset="100%" stopColor="#EF4444" />
                                </linearGradient>
                            </defs>
                            {/* Background arc */}
                            <path
                                d="M 20 90 A 80 80 0 0 1 180 90"
                                fill="none"
                                stroke="url(#gaugeGrad)"
                                strokeWidth="12"
                                strokeLinecap="round"
                            />
                            {/* Tick marks */}
                            {[0, 45, 90, 135, 180].map((angle, i) => {
                                const rad = (angle - 180) * Math.PI / 180;
                                const x1 = 100 + 70 * Math.cos(rad);
                                const y1 = 90 + 70 * Math.sin(rad);
                                const x2 = 100 + 60 * Math.cos(rad);
                                const y2 = 90 + 60 * Math.sin(rad);
                                return (
                                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="2" opacity="0.5" />
                                );
                            })}
                        </svg>

                        {/* Animated needle */}
                        <motion.div
                            className="absolute bottom-0 left-1/2 origin-bottom"
                            style={{
                                width: 4,
                                height: 60,
                                x: -2,
                                rotate: bmiRotation
                            }}
                        >
                            <div className="w-full h-full bg-white rounded-full shadow-lg" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full shadow-lg" />
                        </motion.div>
                    </div>
                </div>

                {/* BMI Result */}
                <motion.div
                    className="text-center relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                        <span className="text-2xl">{bmiCategory.emoji}</span>
                        <span className="font-bold">BMI: {bmi.toFixed(1)}</span>
                        <span className="text-white/80">({bmiCategory.label})</span>
                    </div>
                    <p className="text-sm text-white/70 mt-2">{bmiCategory.advice}</p>
                </motion.div>
            </motion.div>

            {/* Progress to Goal Card */}
            <motion.div
                className="bg-white rounded-2xl p-5 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-500" />
                    التقدم نحو الهدف
                </h3>

                <div className="flex items-center justify-between mb-3">
                    <div className="text-center">
                        <div className="text-sm text-slate-500">الحالي</div>
                        <div className="text-2xl font-bold text-slate-800">{latestWeight} كجم</div>
                    </div>
                    <motion.div
                        className="flex-1 mx-4 h-3 bg-slate-100 rounded-full overflow-hidden"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        style={{ originX: 0 }}
                    >
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full relative"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, progressToGoal)}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            />
                        </motion.div>
                    </motion.div>
                    <div className="text-center">
                        <div className="text-sm text-slate-500">الهدف</div>
                        <div className="text-2xl font-bold text-purple-600">{goalWeight} كجم</div>
                    </div>
                </div>

                <div className="text-center text-sm text-slate-600">
                    {latestWeight > goalWeight ? (
                        <span>متبقي <strong className="text-purple-600">{(latestWeight - goalWeight).toFixed(1)} كجم</strong> للوصول لهدفك</span>
                    ) : latestWeight < goalWeight ? (
                        <span>متبقي <strong className="text-purple-600">{(goalWeight - latestWeight).toFixed(1)} كجم</strong> لزيادة وزنك</span>
                    ) : (
                        <span className="text-green-600 font-bold">🎉 وصلت لهدفك!</span>
                    )}
                </div>
            </motion.div>

            {/* Weight History Chart */}
            <motion.div
                className="bg-white rounded-2xl p-5 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-violet-500" />
                    سجل الوزن
                </h3>

                {chartData.length > 1 ? (
                    <div className="relative h-40">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-slate-400">
                            <span>{maxWeight.toFixed(0)}</span>
                            <span>{minWeight.toFixed(0)}</span>
                        </div>

                        {/* Chart area */}
                        <div className="mr-8 h-full flex items-end gap-2">
                            {chartData.map((entry, i) => {
                                const heightPct = ((entry.weight - minWeight) / range) * 80 + 20;
                                return (
                                    <motion.div
                                        key={entry.date}
                                        className="flex-1 flex flex-col items-center gap-1"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <span className="text-[10px] text-slate-500 font-medium">{entry.weight}</span>
                                        <motion.div
                                            className="w-full rounded-xl bg-gradient-to-t from-purple-500 to-violet-400 relative overflow-hidden"
                                            initial={{ height: 0 }}
                                            animate={{ height: `${heightPct}%` }}
                                            transition={{ duration: 0.6, delay: i * 0.08 }}
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-t from-transparent to-white/30"
                                                initial={{ opacity: 0 }}
                                                whileHover={{ opacity: 1 }}
                                            />
                                        </motion.div>
                                        <span className="text-[9px] text-slate-400">
                                            {format(new Date(entry.date), 'd/M')}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-400">
                        <Scale className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>سجل وزنك لعدة أيام لرؤية الرسم البياني</p>
                    </div>
                )}
            </motion.div>

            {/* Body Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                <motion.div
                    className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-4 text-center shadow-lg"
                    whileHover={{ y: -3, scale: 1.02 }}
                >
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <Ruler className="w-7 h-7 mx-auto mb-2 text-violet-500" />
                    </motion.div>
                    <div className="text-2xl font-bold text-violet-700">{height}</div>
                    <div className="text-[10px] text-violet-600 font-medium">الطول (سم)</div>
                </motion.div>

                <motion.div
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 text-center shadow-lg"
                    whileHover={{ y: -3, scale: 1.02 }}
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2.5 }}
                    >
                        <Sparkles className="w-7 h-7 mx-auto mb-2 text-emerald-500" />
                    </motion.div>
                    <div className="text-2xl font-bold text-emerald-700">{bmi.toFixed(1)}</div>
                    <div className="text-[10px] text-emerald-600 font-medium">BMI</div>
                </motion.div>

                <motion.div
                    className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 text-center shadow-lg"
                    whileHover={{ y: -3, scale: 1.02 }}
                >
                    <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        <Award className="w-7 h-7 mx-auto mb-2 text-amber-500" />
                    </motion.div>
                    <div className="text-2xl font-bold text-amber-700">{weightHistory.length}</div>
                    <div className="text-[10px] text-amber-600 font-medium">تسجيل</div>
                </motion.div>
            </div>

            {/* Add Weight Sheet */}
            <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
                <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-auto">
                    <SheetHeader className="pb-4">
                        <SheetTitle className="text-center text-xl">تسجيل الوزن ⚖️</SheetTitle>
                    </SheetHeader>

                    <div className="space-y-6 py-4">
                        {/* Weight Input */}
                        <div>
                            <label className="text-sm font-medium text-slate-600 mb-3 block">وزنك الحالي (كجم)</label>
                            <div className="flex items-center justify-center gap-6">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setNewWeight(prev => Math.max(30, prev - 0.5))}
                                    className="w-16 h-16 rounded-full bg-purple-100 hover:bg-purple-200 flex items-center justify-center text-purple-600"
                                >
                                    <Minus className="w-8 h-8" />
                                </motion.button>
                                <motion.div
                                    className="text-center"
                                    key={newWeight}
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                >
                                    <span className="text-6xl font-bold text-purple-600">{newWeight}</span>
                                    <p className="text-sm text-slate-500">كجم</p>
                                </motion.div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setNewWeight(prev => Math.min(300, prev + 0.5))}
                                    className="w-16 h-16 rounded-full bg-purple-100 hover:bg-purple-200 flex items-center justify-center text-purple-600"
                                >
                                    <Plus className="w-8 h-8" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Height Input */}
                        <div>
                            <label className="text-sm font-medium text-slate-600 mb-3 block">الطول (سم)</label>
                            <div className="flex items-center justify-center gap-4">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setHeight(prev => Math.max(100, prev - 1))}
                                    className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                                >
                                    <Minus className="w-5 h-5" />
                                </motion.button>
                                <div className="text-center min-w-[80px]">
                                    <span className="text-3xl font-bold text-slate-700">{height}</span>
                                    <p className="text-xs text-slate-500">سم</p>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setHeight(prev => Math.min(250, prev + 1))}
                                    className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                                >
                                    <Plus className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Goal Weight Input */}
                        <div>
                            <label className="text-sm font-medium text-slate-600 mb-3 block">الوزن المستهدف (كجم)</label>
                            <div className="flex items-center justify-center gap-4">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setGoalWeight(prev => Math.max(30, prev - 1))}
                                    className="w-12 h-12 rounded-full bg-violet-100 hover:bg-violet-200 flex items-center justify-center text-violet-600"
                                >
                                    <Minus className="w-5 h-5" />
                                </motion.button>
                                <div className="text-center min-w-[80px]">
                                    <span className="text-3xl font-bold text-violet-600">{goalWeight}</span>
                                    <p className="text-xs text-slate-500">كجم</p>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setGoalWeight(prev => Math.min(300, prev + 1))}
                                    className="w-12 h-12 rounded-full bg-violet-100 hover:bg-violet-200 flex items-center justify-center text-violet-600"
                                >
                                    <Plus className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Preview BMI */}
                        <div className="bg-purple-50 rounded-2xl p-4 text-center">
                            <p className="text-sm text-purple-600 mb-1">BMI المتوقع</p>
                            <p className="text-3xl font-bold text-purple-700">
                                {(newWeight / Math.pow(height / 100, 2)).toFixed(1)}
                            </p>
                        </div>

                        {/* Save Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => saveWeightMutation.mutate()}
                            disabled={saveWeightMutation.isPending}
                            className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white rounded-2xl py-5 text-lg font-bold shadow-lg flex items-center justify-center gap-2"
                        >
                            <Scale className="w-5 h-5" />
                            حفظ الوزن
                        </motion.button>
                    </div>
                </SheetContent>
            </Sheet>
        </motion.div>
    );
}
