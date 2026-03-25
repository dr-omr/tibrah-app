// components/health-tracker/ActivityFitnessPro.tsx
// PREMIUM Interactive Activity & Fitness with Apple Watch Style Rings

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import {
    Flame, Timer, PersonStanding, TrendingUp, Target,
    Plus, Footprints, Dumbbell, Heart, Zap, Award, X, Trophy
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';

// Workout library with colors
const WORKOUTS = [
    { id: 'walk', name: 'مشي', emoji: '🚶', caloriesPerMin: 4, color: 'from-green-400 to-emerald-500' },
    { id: 'run', name: 'جري', emoji: '🏃', caloriesPerMin: 10, color: 'from-orange-400 to-red-500' },
    { id: 'bike', name: 'دراجة', emoji: '🚴', caloriesPerMin: 8, color: 'from-blue-400 to-indigo-500' },
    { id: 'swim', name: 'سباحة', emoji: '🏊', caloriesPerMin: 9, color: 'from-cyan-400 to-blue-500' },
    { id: 'strength', name: 'قوة', emoji: '💪', caloriesPerMin: 6, color: 'from-purple-400 to-violet-500' },
    { id: 'yoga', name: 'يوغا', emoji: '🧘', caloriesPerMin: 3, color: 'from-pink-400 to-rose-500' },
];

interface ActivityData {
    moveCalories: number;
    moveGoal: number;
    exerciseMinutes: number;
    exerciseGoal: number;
    standHours: number;
    standGoal: number;
    steps: number;
    stepsGoal: number;
}

const DEFAULT_GOALS = {
    moveGoal: 500,
    exerciseGoal: 30,
    standGoal: 8,
    stepsGoal: 10000
};

export default function ActivityFitnessPro() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const userId = user?.id;
    const [showWorkoutSheet, setShowWorkoutSheet] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState(WORKOUTS[0]);
    const [workoutDuration, setWorkoutDuration] = useState(30);
    const [showCelebration, setShowCelebration] = useState(false);

    // Animated values for rings
    const moveProgress = useMotionValue(0);
    const exerciseProgress = useMotionValue(0);
    const standProgress = useMotionValue(0);

    // Fetch today's activity
    const { data: activity } = useQuery<ActivityData>({
        queryKey: ['activityPro', today, userId],
        queryFn: async () => {
            try {
                const logs = await db.entities.DailyLog.filter({ date: today, user_id: userId });
                const log = logs?.[0];
                if (log) {
                    return {
                        moveCalories: (log.exercise?.calories as number) || 0,
                        moveGoal: DEFAULT_GOALS.moveGoal,
                        exerciseMinutes: (log.exercise?.duration_minutes as number) || 0,
                        exerciseGoal: DEFAULT_GOALS.exerciseGoal,
                        standHours: (log.stand_hours as number) || 0,
                        standGoal: DEFAULT_GOALS.standGoal,
                        steps: (log.steps as number) || 0,
                        stepsGoal: DEFAULT_GOALS.stepsGoal,
                    };
                }
                return { ...DEFAULT_GOALS, moveCalories: 0, exerciseMinutes: 0, standHours: 0, steps: 0 };
            } catch {
                return { ...DEFAULT_GOALS, moveCalories: 0, exerciseMinutes: 0, standHours: 0, steps: 0 };
            }
        },
        enabled: !!userId,
    });

    const movePct = Math.min(100, ((activity?.moveCalories || 0) / (activity?.moveGoal || 500)) * 100);
    const exercisePct = Math.min(100, ((activity?.exerciseMinutes || 0) / (activity?.exerciseGoal || 30)) * 100);
    const standPct = Math.min(100, ((activity?.standHours || 0) / (activity?.standGoal || 8)) * 100);
    const stepsPct = Math.min(100, ((activity?.steps || 0) / (activity?.stepsGoal || 10000)) * 100);

    // Animate ring progress
    useEffect(() => {
        animate(moveProgress, movePct, { duration: 1.5, ease: "easeOut" });
        animate(exerciseProgress, exercisePct, { duration: 1.5, ease: "easeOut", delay: 0.2 });
        animate(standProgress, standPct, { duration: 1.5, ease: "easeOut", delay: 0.4 });
    }, [movePct, exercisePct, standPct, moveProgress, exerciseProgress, standProgress]);

    // All rings complete?
    const allComplete = movePct >= 100 && exercisePct >= 100 && standPct >= 100;

    // Log workout mutation
    const logWorkoutMutation = useMutation({
        mutationFn: async () => {
            const calories = selectedWorkout.caloriesPerMin * workoutDuration;
            const newCalories = (activity?.moveCalories || 0) + calories;
            const newMinutes = (activity?.exerciseMinutes || 0) + workoutDuration;

            const logs = await db.entities.DailyLog.filter({ date: today, user_id: userId });
            const updateData = {
                exercise: {
                    calories: newCalories,
                    duration_minutes: newMinutes,
                    type: selectedWorkout.id
                }
            };

            if (logs?.[0]) {
                return db.entities.DailyLog.update(logs[0].id as string, updateData);
            }
            return db.entities.DailyLog.createForUser(userId || '', { date: today, ...updateData });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activityPro'] });
            setShowWorkoutSheet(false);

            const newCalories = (activity?.moveCalories || 0) + (selectedWorkout.caloriesPerMin * workoutDuration);
            const newMinutes = (activity?.exerciseMinutes || 0) + workoutDuration;

            // Check if completed rings
            if (newCalories >= DEFAULT_GOALS.moveGoal && (activity?.moveCalories || 0) < DEFAULT_GOALS.moveGoal) {
                setShowCelebration(true);
                setTimeout(() => setShowCelebration(false), 3000);
            }

            toast.success(`🔥 +${selectedWorkout.caloriesPerMin * workoutDuration} سعرة!`);
        },
    });

    // Add stand hour
    const addStandHour = useMutation({
        mutationFn: async () => {
            const newHours = Math.min(24, (activity?.standHours || 0) + 1);
            const logs = await db.entities.DailyLog.filter({ date: today, user_id: userId });

            if (logs?.[0]) {
                return db.entities.DailyLog.update(logs[0].id as string, { stand_hours: newHours });
            }
            return db.entities.DailyLog.createForUser(userId || '', { date: today, stand_hours: newHours });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activityPro'] });
            toast.success('⬆️ +1 ساعة وقوف');
        },
    });

    // Ring component
    const Ring = ({
        progress,
        color1,
        color2,
        radius,
        strokeWidth,
        id
    }: {
        progress: number;
        color1: string;
        color2: string;
        radius: number;
        strokeWidth: number;
        id: string;
    }) => {
        const circumference = 2 * Math.PI * radius;
        const offset = circumference * (1 - progress / 100);

        return (
            <>
                {/* Background ring */}
                <circle
                    cx="110" cy="110" r={radius}
                    stroke={color1}
                    strokeOpacity={0.2}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress ring */}
                <motion.circle
                    cx="110" cy="110" r={radius}
                    stroke={`url(#${id})`}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    filter={`url(#${id}Glow)`}
                />
            </>
        );
    };

    return (
        <motion.div
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Activity Rings Card */}
            <motion.div
                className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-6 text-white overflow-hidden shadow-2xl"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
            >
                {/* Animated particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(15)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 rounded-full"
                            style={{
                                background: ['#FF2D55', '#A8FF00', '#00D4FF'][i % 3],
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                y: [0, -30, 0],
                                opacity: [0, 1, 0],
                                scale: [0, 1.5, 0],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 3,
                            }}
                        />
                    ))}
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <motion.div
                            className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm"
                            animate={{
                                scale: allComplete ? [1, 1.1, 1] : 1,
                            }}
                            transition={{ repeat: allComplete ? Infinity : 0, duration: 1 }}
                        >
                            {allComplete ? (
                                <Trophy className="w-7 h-7 text-yellow-400" />
                            ) : (
                                <Flame className="w-7 h-7 text-red-500" />
                            )}
                        </motion.div>
                        <div>
                            <h2 className="text-2xl font-bold">نشاطك اليوم</h2>
                            <p className="text-white/60 text-sm">{format(new Date(), 'EEEE d MMMM', { locale: ar })}</p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowWorkoutSheet(true)}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg"
                    >
                        <Plus className="w-6 h-6" />
                    </motion.button>
                </div>

                {/* Concentric Rings */}
                <div className="flex justify-center mb-6 relative z-10">
                    <motion.div
                        className="relative"
                        style={{ width: 220, height: 220 }}
                        whileHover={{ scale: 1.02 }}
                    >
                        {/* Outer glow */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/20 via-green-500/20 to-cyan-500/20 blur-2xl" />

                        <svg className="absolute inset-0 transform -rotate-90" width={220} height={220}>
                            <defs>
                                {/* Move Gradient */}
                                <linearGradient id="moveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#FF2D55" />
                                    <stop offset="100%" stopColor="#FF6B9D" />
                                </linearGradient>
                                {/* Exercise Gradient */}
                                <linearGradient id="exerciseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#A8FF00" />
                                    <stop offset="100%" stopColor="#C6FF4D" />
                                </linearGradient>
                                {/* Stand Gradient */}
                                <linearGradient id="standGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#00D4FF" />
                                    <stop offset="100%" stopColor="#4DE8FF" />
                                </linearGradient>
                                {/* Glow Filters */}
                                <filter id="moveGradGlow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                </filter>
                                <filter id="exerciseGradGlow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                </filter>
                                <filter id="standGradGlow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                </filter>
                            </defs>

                            <Ring progress={movePct} color1="#FF2D55" color2="#FF6B9D" radius={95} strokeWidth={16} id="moveGrad" />
                            <Ring progress={exercisePct} color1="#A8FF00" color2="#C6FF4D" radius={75} strokeWidth={16} id="exerciseGrad" />
                            <Ring progress={standPct} color1="#00D4FF" color2="#4DE8FF" radius={55} strokeWidth={16} id="standGrad" />
                        </svg>

                        {/* Center Stats */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span
                                className="text-4xl font-bold"
                                key={activity?.moveCalories}
                                initial={{ scale: 1.3 }}
                                animate={{ scale: 1 }}
                            >
                                {activity?.moveCalories || 0}
                            </motion.span>
                            <span className="text-xs text-white/60">سعرة</span>
                        </div>

                        {/* Ring completion indicators */}
                        {movePct >= 100 && (
                            <motion.div
                                className="absolute -top-2 right-1/2 translate-x-1/2"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                            >
                                <span className="text-xl">🔥</span>
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                {/* Ring Legend - Interactive */}
                <div className="grid grid-cols-3 gap-3 relative z-10">
                    {[
                        {
                            label: 'تحريك',
                            value: activity?.moveCalories || 0,
                            goal: activity?.moveGoal || 500,
                            unit: '',
                            color: 'from-[#FF2D55] to-[#FF6B9D]',
                            progress: movePct
                        },
                        {
                            label: 'تمرين',
                            value: activity?.exerciseMinutes || 0,
                            goal: activity?.exerciseGoal || 30,
                            unit: 'د',
                            color: 'from-[#A8FF00] to-[#C6FF4D]',
                            progress: exercisePct
                        },
                        {
                            label: 'وقوف',
                            value: activity?.standHours || 0,
                            goal: activity?.standGoal || 8,
                            unit: 'س',
                            color: 'from-[#00D4FF] to-[#4DE8FF]',
                            progress: standPct
                        },
                    ].map((item, i) => (
                        <motion.div
                            key={item.label}
                            className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center"
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${item.color} mx-auto mb-2`} />
                            <div className="text-lg font-bold">{item.value}{item.unit}</div>
                            <div className="text-xs text-white/60">/{item.goal}{item.unit}</div>
                            <div className="text-xs text-white/50 mt-1">{Math.round(item.progress)}%</div>
                        </motion.div>
                    ))}
                </div>

                {/* Celebration Overlay */}
                <AnimatePresence>
                    {showCelebration && (
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20 rounded-[2.5rem]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="text-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                            >
                                <motion.div
                                    className="text-7xl mb-4"
                                    animate={{ rotate: [0, -10, 10, 0] }}
                                    transition={{ repeat: 3 }}
                                >
                                    🏆
                                </motion.div>
                                <div className="text-2xl font-bold">أحسنت!</div>
                                <div className="text-white/80">أكملت حلقة التحريك</div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Steps Card - Interactive */}
            <motion.div
                className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-sm overflow-hidden relative"
                whileHover={{ scale: 1.01 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {/* Background footprints */}
                <div className="absolute inset-0 opacity-10">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                            }}
                            animate={{ y: [0, -20], opacity: [0, 0.5, 0] }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 0.5
                            }}
                        >
                            <Footprints className="w-8 h-8" />
                        </motion.div>
                    ))}
                </div>

                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={{ y: [0, -3, 0] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                        >
                            <Footprints className="w-8 h-8" />
                        </motion.div>
                        <div>
                            <h3 className="font-bold text-lg">الخطوات</h3>
                            <p className="text-white/70 text-sm">الهدف: {(activity?.stepsGoal || 10000).toLocaleString()}</p>
                        </div>
                    </div>
                    <motion.span
                        className="text-4xl font-bold"
                        key={activity?.steps}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                    >
                        {(activity?.steps || 0).toLocaleString()}
                    </motion.span>
                </div>

                {/* Progress Bar */}
                <div className="h-4 bg-white/20 rounded-full overflow-hidden relative z-10">
                    <motion.div
                        className="h-full bg-white rounded-full relative"
                        initial={{ width: 0 }}
                        animate={{ width: `${stepsPct}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    >
                        {/* Shimmer effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        />
                    </motion.div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-white/70 relative z-10">
                    <span>{Math.round(stepsPct)}% من الهدف</span>
                    <span>{Math.max(0, (activity?.stepsGoal || 10000) - (activity?.steps || 0)).toLocaleString()} متبقي</span>
                </div>
            </motion.div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-3">
                <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowWorkoutSheet(true)}
                    className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 text-white text-right shadow-sm"
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <Dumbbell className="w-10 h-10 mb-3" />
                    </motion.div>
                    <h3 className="font-bold text-lg">تسجيل تمرين</h3>
                    <p className="text-white/70 text-sm">أضف نشاط رياضي</p>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => addStandHour.mutate()}
                    className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl p-5 text-white text-right shadow-sm"
                >
                    <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        <PersonStanding className="w-10 h-10 mb-3" />
                    </motion.div>
                    <h3 className="font-bold text-lg">ساعة وقوف</h3>
                    <p className="text-white/70 text-sm">+1 ساعة</p>
                </motion.button>
            </div>

            {/* Workout Sheet */}
            <Sheet open={showWorkoutSheet} onOpenChange={setShowWorkoutSheet}>
                <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-auto">
                    <SheetHeader className="pb-4">
                        <SheetTitle className="text-center text-xl">تسجيل تمرين 🏋️</SheetTitle>
                    </SheetHeader>

                    <div className="space-y-6 py-4">
                        {/* Workout Selection */}
                        <div>
                            <label className="text-sm font-medium text-slate-600 mb-3 block">نوع التمرين</label>
                            <div className="grid grid-cols-3 gap-3">
                                {WORKOUTS.map((workout, i) => (
                                    <motion.button
                                        key={workout.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ scale: 1.05, y: -3 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedWorkout(workout)}
                                        className={`p-4 rounded-2xl text-center transition-all ${selectedWorkout.id === workout.id
                                                ? `bg-gradient-to-br ${workout.color} text-white shadow-lg`
                                                : 'bg-slate-100 hover:bg-slate-200'
                                            }`}
                                    >
                                        <motion.span
                                            className="text-4xl block mb-2"
                                            animate={selectedWorkout.id === workout.id ? {
                                                scale: [1, 1.2, 1],
                                                rotate: [0, -10, 10, 0]
                                            } : {}}
                                        >
                                            {workout.emoji}
                                        </motion.span>
                                        <span className="text-sm font-bold">{workout.name}</span>
                                        <span className={`text-xs block ${selectedWorkout.id === workout.id ? 'text-white/80' : 'text-slate-500'
                                            }`}>
                                            {workout.caloriesPerMin} سعرة/د
                                        </span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Duration Slider */}
                        <div>
                            <label className="text-sm font-medium text-slate-600 mb-3 block">المدة (دقيقة)</label>
                            <div className="flex items-center justify-center gap-6">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setWorkoutDuration(prev => Math.max(5, prev - 5))}
                                    className="w-14 h-14 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-2xl text-slate-600"
                                >
                                    -
                                </motion.button>
                                <motion.div
                                    className="text-center"
                                    key={workoutDuration}
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                >
                                    <span className="text-6xl font-bold text-orange-500">{workoutDuration}</span>
                                    <p className="text-sm text-slate-500">دقيقة</p>
                                </motion.div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setWorkoutDuration(prev => Math.min(180, prev + 5))}
                                    className="w-14 h-14 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-2xl text-slate-600"
                                >
                                    +
                                </motion.button>
                            </div>
                        </div>

                        {/* Estimated Calories - Animated */}
                        <motion.div
                            className={`bg-gradient-to-r ${selectedWorkout.color} rounded-2xl p-5 text-center text-white`}
                            layout
                        >
                            <p className="text-sm text-white/80 mb-1">السعرات المحروقة</p>
                            <motion.p
                                className="text-5xl font-bold"
                                key={selectedWorkout.caloriesPerMin * workoutDuration}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                            >
                                {selectedWorkout.caloriesPerMin * workoutDuration}
                                <span className="text-xl mr-1">🔥</span>
                            </motion.p>
                        </motion.div>

                        {/* Save Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => logWorkoutMutation.mutate()}
                            disabled={logWorkoutMutation.isPending}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl py-5 text-lg font-bold shadow-lg flex items-center justify-center gap-2"
                        >
                            <Flame className="w-6 h-6" />
                            تسجيل التمرين
                        </motion.button>
                    </div>
                </SheetContent>
            </Sheet>
        </motion.div>
    );
}
