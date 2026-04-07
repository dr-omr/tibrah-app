// components/health-tracker/WaterTrackerPro.tsx
// PREMIUM Interactive Water Tracking with Animated 3D Bottle

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { getUserData, setUserData } from '@/lib/userDataService';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import {
    Droplets, Plus, Minus, Target, TrendingUp, Clock,
    Sparkles, Award, Settings2, Flame, Waves, Zap, RotateCcw,
    Bell, BellOff
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from '@/components/notification-engine';
import { format, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
    getReminders, saveReminder, deleteReminder, 
    getDefaultWaterReminders, initializeNotifications 
} from '@/lib/pushNotifications';

// Quick add options with emojis
const QUICK_ADD_OPTIONS = [
    { ml: 100, label: 'رشفة', icon: '💧', color: 'from-cyan-400 to-cyan-500' },
    { ml: 200, label: 'كوب صغير', icon: '🥛', color: 'from-blue-400 to-blue-500' },
    { ml: 350, label: 'كوب', icon: '🥤', color: 'from-indigo-400 to-indigo-500' },
    { ml: 500, label: 'زجاجة', icon: '🍶', color: 'from-purple-400 to-purple-500' },
    { ml: 750, label: 'زجاجة كبيرة', icon: '💦', color: 'from-violet-400 to-violet-500' },
];

// Motivational messages
const MESSAGES = {
    start: ['هيا نبدأ! 💪', 'جسمك يحتاج الماء 💧', 'رطب جسمك اليوم! 🌊'],
    progress: ['ممتاز! استمر! 🔥', 'أنت في الطريق الصحيح! ⭐', 'رائع! واصل! 💪'],
    almostThere: ['قليل وتصل! 🎯', 'أنت قريب جداً! 🏆', 'آخر دفعة! 💫'],
    completed: ['مبروك! 🎉', 'أنت بطل! 🏆', 'صحة ممتازة! 💚'],
};

interface WaterLog {
    id?: string;
    date: string;
    total_ml: number;
    goal_ml: number;
    logs: { time: string; amount: number }[];
}

export default function WaterTrackerPro({ userWeight = 70 }: { userWeight?: number }) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const userId = user?.id || null;

    // State
    const [showSettings, setShowSettings] = useState(false);
    const [isAddingWater, setIsAddingWater] = useState(false);
    const [lastAddedAmount, setLastAddedAmount] = useState(0);
    const [showCelebration, setShowCelebration] = useState(false);
    const [dailyGoal, setDailyGoal] = useState(Math.round(userWeight * 35));
    const [goalLoaded, setGoalLoaded] = useState(false);
    const [remindersEnabled, setRemindersEnabled] = useState(false);

    // Load user-specific goal from cloud/localStorage
    useEffect(() => {
        const loadGoal = async () => {
            const savedGoal = await getUserData(userId, 'waterGoalMl', Math.round(userWeight * 35));
            setDailyGoal(savedGoal);
            setGoalLoaded(true);

            // Check if reminders are enabled
            const activeReminders = getReminders().filter(r => r.type === 'water' && r.enabled);
            setRemindersEnabled(activeReminders.length > 0);
        };
        loadGoal();
    }, [userId, userWeight]);

    const toggleReminders = async () => {
        if (!remindersEnabled) {
            const granted = await initializeNotifications(userId || undefined);
            if (granted) {
                const defaults = getDefaultWaterReminders();
                defaults.forEach(r => saveReminder(r));
                setRemindersEnabled(true);
                toast.success('تم تفعيل إشعارات الماء التلقائية 🔔');
            } else {
                toast.error('لم نتمكن من تفعيل الإشعارات. يرجى التحقق من صلاحيات المتصفح/التطبيق.');
            }
        } else {
            const currentReminders = getReminders().filter(r => r.type === 'water');
            currentReminders.forEach(r => deleteReminder(r.id));
            setRemindersEnabled(false);
            toast.success('تم إيقاف إشعارات الماء 🔕');
        }
    };

    // Animated values
    const animatedProgress = useMotionValue(0);

    // Fix hydration - only render random animations on client
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    // Generate stable bubble positions
    const bubblePositions = useMemo(() =>
        [...Array(12)].map((_, i) => ({
            size: 8 + (i * 2),
            left: (i * 8) % 100,
            xOffset: ((i * 7) % 40) - 20,
            duration: 4 + (i * 0.5),
            delay: i * 0.4
        })),
        []);

    // PERF-1 FIX: Pre-compute add bubble and confetti positions
    const addBubbles = useMemo(() =>
        Array.from({ length: 8 }, () => ({
            size: 4 + Math.random() * 8,
            left: 10 + Math.random() * 80,
            duration: 0.8 + Math.random() * 0.5,
        })), []);

    const confettiPositions = useMemo(() =>
        Array.from({ length: 20 }, () => ({
            x: (Math.random() - 0.5) * 300,
            y: (Math.random() - 0.5) * 300,
            rotate: Math.random() * 360,
        })), []);

    // Fetch today's data
    const { data: todayLog } = useQuery<WaterLog>({
        queryKey: ['waterLogPro', today, userId],
        queryFn: async () => {
            try {
                const logs = await db.entities.WaterLog.filter({ date: today, user_id: userId });
                if (logs?.[0]) {
                    return {
                        ...logs[0],
                        total_ml: logs[0].glasses ? (logs[0].glasses as number) * 250 : 0,
                        goal_ml: dailyGoal,
                        logs: []
                    } as WaterLog;
                }
                return { date: today, total_ml: 0, goal_ml: dailyGoal, logs: [] };
            } catch {
                return { date: today, total_ml: 0, goal_ml: dailyGoal, logs: [] };
            }
        },
        enabled: !!userId,
    });

    // Fetch weekly data
    const { data: weeklyData = [] } = useQuery<WaterLog[]>({
        queryKey: ['waterLogWeekPro', userId],
        queryFn: async () => {
            try {
                const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
                const logs = await db.entities.WaterLog.filter({ date: { $gte: weekAgo }, user_id: userId });
                return logs.map((log: any) => ({
                    date: log.date,
                    total_ml: log.glasses ? log.glasses * 250 : 0,
                    goal_ml: dailyGoal,
                    logs: []
                })) as WaterLog[];
            } catch {
                return [];
            }
        },
        enabled: !!userId,
    });

    const currentMl = todayLog?.total_ml || 0;
    const percentage = Math.min(100, Math.round((currentMl / dailyGoal) * 100));
    const remainingMl = Math.max(0, dailyGoal - currentMl);

    // Animate progress when it changes
    useEffect(() => {
        animate(animatedProgress, percentage, { duration: 1, ease: "easeOut" });
    }, [percentage, animatedProgress]);

    // Weekly stats
    const streak = calculateStreak(weeklyData, dailyGoal);

    // PERF-1 FIX: Stable message per percentage bracket
    const getMessage = useMemo(() => {
        if (percentage === 0) return MESSAGES.start[percentage % MESSAGES.start.length];
        if (percentage >= 100) return MESSAGES.completed[percentage % MESSAGES.completed.length];
        if (percentage >= 80) return MESSAGES.almostThere[percentage % MESSAGES.almostThere.length];
        return MESSAGES.progress[percentage % MESSAGES.progress.length];
    }, [percentage]);

    // Add water mutation with animations
    const addWaterMutation = useMutation({
        mutationFn: async (amountMl: number) => {
            setIsAddingWater(true);
            setLastAddedAmount(amountMl);

            const newTotal = currentMl + amountMl;
            const glasses = Math.round(newTotal / 250);

            const logs = await db.entities.WaterLog.filter({ date: today, user_id: userId });
            if (logs?.[0]) {
                return db.entities.WaterLog.update(logs[0].id as string, { glasses, goal: Math.round(dailyGoal / 250) });
            }
            return db.entities.WaterLog.createForUser(userId || '', { date: today, glasses, goal: Math.round(dailyGoal / 250), logs: [] });
        },
        onSuccess: (_, amountMl) => {
            queryClient.invalidateQueries({ queryKey: ['waterLogPro'] });
            queryClient.invalidateQueries({ queryKey: ['waterLogWeekPro'] });

            const newTotal = currentMl + amountMl;

            // Show celebration when goal reached
            if (newTotal >= dailyGoal && currentMl < dailyGoal) {
                setShowCelebration(true);
                setTimeout(() => setShowCelebration(false), 3000);
                toast.success('🎉 مبروك! وصلت لهدفك اليومي!', { duration: 5000 });
            } else {
                toast.success(`+${amountMl}مل 💧`, { duration: 1500 });
            }

            setTimeout(() => setIsAddingWater(false), 800);
        },
    });

    // Reset water mutation
    const resetWaterMutation = useMutation({
        mutationFn: async () => {
            const logs = await db.entities.WaterLog.filter({ date: today, user_id: userId });
            if (logs?.[0]) {
                return db.entities.WaterLog.update(logs[0].id as string, { glasses: 0, goal: Math.round(dailyGoal / 250) });
            }
            return null;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waterLogPro'] });
            queryClient.invalidateQueries({ queryKey: ['waterLogWeekPro'] });
            toast.success('تم إعادة التعيين 🔄');
        },
    });

    const updateGoal = async (newGoal: number) => {
        setDailyGoal(newGoal);
        await setUserData(userId, 'waterGoalMl', newGoal);
        toast.success(`تم تحديث الهدف إلى ${(newGoal / 1000).toFixed(1)} لتر`);
        setShowSettings(false);
    };

    return (
        <motion.div
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Main Water Bottle Card */}
            <motion.div
                className="relative bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 rounded-[2.5rem] p-6 text-white overflow-hidden shadow-2xl"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
            >
                {/* Animated background bubbles */}
                {isMounted && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {bubblePositions.map((bubble, i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full bg-white/10"
                                style={{
                                    width: bubble.size,
                                    height: bubble.size,
                                    left: `${bubble.left}%`,
                                    bottom: -20,
                                }}
                                animate={{
                                    y: [-20, -400],
                                    x: [0, bubble.xOffset],
                                    opacity: [0, 0.6, 0],
                                    scale: [1, 1.2, 0.8],
                                }}
                                transition={{
                                    duration: bubble.duration,
                                    repeat: Infinity,
                                    delay: bubble.delay,
                                    ease: "easeOut"
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Settings Button */}
                <motion.button
                    whileHover={{ rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowSettings(!showSettings)}
                    className="absolute top-4 left-4 p-2.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm z-10"
                >
                    <Settings2 className="w-5 h-5" />
                </motion.button>

                {/* Header with animated icon */}
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <motion.div
                        className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm"
                        animate={isAddingWater ? {
                            rotate: [0, -10, 10, -10, 0],
                            scale: [1, 1.1, 1]
                        } : {}}
                        transition={{ duration: 0.5 }}
                    >
                        <Droplets className="w-7 h-7" />
                    </motion.div>
                    <div>
                        <h2 className="text-2xl font-bold">ترطيب الجسم</h2>
                        <motion.p
                            className="text-white/90 text-sm"
                            key={percentage}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {getMessage}
                        </motion.p>
                    </div>
                </div>

                {/* Settings Panel */}
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="bg-white rounded-2xl p-4 text-slate-800 relative z-10"
                        >
                            <h3 className="font-bold mb-3 text-center">الهدف اليومي</h3>
                            <div className="flex items-center justify-center gap-4 mb-3">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setDailyGoal(prev => Math.max(1000, prev - 250))}
                                    className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold text-xl"
                                >
                                    -
                                </motion.button>
                                <div className="text-center min-w-[100px]">
                                    <motion.span
                                        className="text-4xl font-bold text-cyan-600"
                                        key={dailyGoal}
                                        initial={{ scale: 1.2 }}
                                        animate={{ scale: 1 }}
                                    >
                                        {(dailyGoal / 1000).toFixed(1)}
                                    </motion.span>
                                    <span className="text-xl text-slate-500 mr-1">لتر</span>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setDailyGoal(prev => Math.min(5000, prev + 250))}
                                    className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold text-xl"
                                >
                                    +
                                </motion.button>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl"
                                    onClick={() => updateGoal(dailyGoal)}
                                >
                                    حفظ الهدف
                                </Button>
                                <motion.button
                                    whileHover={{ scale: 1.05, rotate: 180 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => resetWaterMutation.mutate()}
                                    disabled={resetWaterMutation.isPending || currentMl === 0}
                                    className="w-12 h-12 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center disabled:opacity-50"
                                    title="إعادة تعيين"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </motion.button>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-100">
                                <Button
                                    variant="outline"
                                    className={`w-full flex items-center justify-center gap-2 rounded-xl ${remindersEnabled ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                                    onClick={toggleReminders}
                                >
                                    {remindersEnabled ? (
                                        <>
                                            <Bell className="w-4 h-4" />
                                            <span>إشعارات التشجيع مفعلة</span>
                                        </>
                                    ) : (
                                        <>
                                            <BellOff className="w-4 h-4" />
                                            <span>تفعيل الإشعارات التلقائية</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Interactive Water Bottle */}
                <div className="flex justify-center items-center mb-6 relative z-10">
                    <div className="relative">
                        {/* Bottle Container */}
                        <motion.div
                            className="relative w-40 h-56"
                            animate={isAddingWater ? { y: [0, -5, 0] } : {}}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Bottle Cap */}
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-14 h-8 bg-white/40 rounded-t-2xl border-2 border-white/50 z-10">
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-2 bg-white/30 rounded-t" />
                            </div>

                            {/* Bottle Body */}
                            <div className="relative h-full bg-white/15 rounded-[2rem] border-4 border-white/40 overflow-hidden backdrop-blur-sm">
                                {/* Water Fill with waves */}
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-200/90 via-cyan-300/70 to-cyan-400/50"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${percentage}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                >
                                    {/* Wave Effect Top */}
                                    <motion.div
                                        className="absolute -top-3 left-0 right-0 h-6"
                                        animate={{ x: [0, 10, 0] }}
                                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                    >
                                        <svg viewBox="0 0 120 20" className="w-full h-full" preserveAspectRatio="none">
                                            <motion.path
                                                d="M0,10 Q15,5 30,10 T60,10 T90,10 T120,10 L120,20 L0,20 Z"
                                                fill="rgba(255,255,255,0.4)"
                                                animate={{
                                                    d: [
                                                        "M0,10 Q15,5 30,10 T60,10 T90,10 T120,10 L120,20 L0,20 Z",
                                                        "M0,10 Q15,15 30,10 T60,10 T90,10 T120,10 L120,20 L0,20 Z",
                                                        "M0,10 Q15,5 30,10 T60,10 T90,10 T120,10 L120,20 L0,20 Z"
                                                    ]
                                                }}
                                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                            />
                                        </svg>
                                    </motion.div>

                                    {/* Bubbles inside water */}
                                    {isAddingWater && addBubbles.map((b, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute rounded-full bg-white/50"
                                            style={{
                                                width: b.size,
                                                height: b.size,
                                                left: `${b.left}%`,
                                                bottom: 0,
                                            }}
                                            initial={{ y: 0, opacity: 0 }}
                                            animate={{ y: [-100, -200], opacity: [0, 0.8, 0] }}
                                            transition={{ duration: b.duration, delay: i * 0.05 }}
                                        />
                                    ))}
                                </motion.div>

                                {/* Level Markers */}
                                <div className="absolute inset-y-4 right-2 flex flex-col justify-between pointer-events-none">
                                    {[100, 75, 50, 25].map((level) => (
                                        <div key={level} className="flex items-center gap-1">
                                            <div className="w-3 h-0.5 bg-white/50" />
                                            <span className="text-xs text-white/70">{level}%</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Center Display */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <motion.span
                                        className="text-4xl font-bold drop-shadow-lg"
                                        key={currentMl}
                                        initial={{ scale: 1.3, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                    >
                                        {currentMl}
                                    </motion.span>
                                    <span className="text-sm text-white/80">مل</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Stats beside bottle */}
                        <div className="absolute -right-28 top-1/2 -translate-y-1/2 text-right space-y-3">
                            <div>
                                <motion.div
                                    className="text-3xl font-bold"
                                    key={percentage}
                                    initial={{ scale: 1.2 }}
                                    animate={{ scale: 1 }}
                                >
                                    {percentage}%
                                </motion.div>
                                <div className="text-white/70 text-xs">من الهدف</div>
                            </div>
                            <div className="w-14 h-2 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-white rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.8 }}
                                />
                            </div>
                            {remainingMl > 0 && (
                                <div className="text-xs text-white/80">
                                    متبقي {remainingMl} مل
                                </div>
                            )}
                        </div>

                        {/* Floating +Amount indicator */}
                        <AnimatePresence>
                            {isAddingWater && (
                                <motion.div
                                    className="absolute top-0 left-1/2 -translate-x-1/2 text-2xl font-bold text-cyan-200"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: -20 }}
                                    exit={{ opacity: 0, y: -50 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    +{lastAddedAmount}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Quick Add Buttons */}
                <div className="grid grid-cols-5 gap-2 relative z-10">
                    {QUICK_ADD_OPTIONS.map((option, index) => (
                        <motion.button
                            key={option.ml}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.08, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => addWaterMutation.mutate(option.ml)}
                            disabled={addWaterMutation.isPending}
                            className={`bg-gradient-to-br ${option.color} backdrop-blur-sm rounded-2xl p-3 text-center shadow-lg hover:shadow-xl transition-shadow`}
                        >
                            <motion.span
                                className="text-2xl block mb-1"
                                animate={isAddingWater && lastAddedAmount === option.ml ? { rotate: [0, -15, 15, 0] } : {}}
                            >
                                {option.icon}
                            </motion.span>
                            <span className="text-xs font-bold">{option.ml}مل</span>
                        </motion.button>
                    ))}
                </div>

                {/* Celebration Overlay */}
                <AnimatePresence>
                    {showCelebration && (
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-20 rounded-[2.5rem]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="text-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                                transition={{ type: "spring" }}
                            >
                                <motion.div
                                    className="text-7xl mb-4"
                                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                                    transition={{ repeat: 2 }}
                                >
                                    🎉
                                </motion.div>
                                <div className="text-2xl font-bold">مبروك!</div>
                                <div className="text-white/80">وصلت لهدفك اليومي</div>
                            </motion.div>

                            {/* Confetti */}
                            {confettiPositions.map((c, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-3 h-3 rounded-full"
                                    style={{
                                        background: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'][i % 5],
                                        top: '50%',
                                        left: '50%',
                                    }}
                                    animate={{
                                        x: c.x,
                                        y: c.y,
                                        rotate: c.rotate,
                                        opacity: [1, 0],
                                    }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
                <motion.div
                    className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 text-center shadow-sm border border-slate-200/60 dark:border-slate-700/50"
                    whileHover={{ y: -3, scale: 1.02 }}
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 3, delay: 0 }}
                    >
                        <TrendingUp className="w-7 h-7 mx-auto mb-2 text-blue-500" />
                    </motion.div>
                    <div className="text-2xl font-bold text-blue-700">
                        {Math.round(weeklyData.reduce((s, d) => s + d.total_ml, 0) / Math.max(1, weeklyData.length))}
                    </div>
                    <div className="text-xs text-blue-600 font-medium">متوسط (مل)</div>
                </motion.div>

                <motion.div
                    className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 text-center shadow-sm border border-slate-200/60 dark:border-slate-700/50"
                    whileHover={{ y: -3, scale: 1.02 }}
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                    >
                        <Flame className="w-7 h-7 mx-auto mb-2 text-orange-500" />
                    </motion.div>
                    <div className="text-2xl font-bold text-orange-700">{streak}</div>
                    <div className="text-xs text-orange-600 font-medium">سلسلة أيام 🔥</div>
                </motion.div>

                <motion.div
                    className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 text-center shadow-sm border border-slate-200/60 dark:border-slate-700/50"
                    whileHover={{ y: -3, scale: 1.02 }}
                >
                    <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                    >
                        <Target className="w-7 h-7 mx-auto mb-2 text-emerald-500" />
                    </motion.div>
                    <div className="text-2xl font-bold text-emerald-700">{(dailyGoal / 1000).toFixed(1)}L</div>
                    <div className="text-xs text-emerald-600 font-medium">الهدف</div>
                </motion.div>
            </div>

            {/* Weekly Chart */}
            <motion.div
                className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-700/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-500" />
                    الأسبوع الماضي
                </h3>
                <div className="flex items-end justify-between gap-2 h-28">
                    {getLast7Days().map((day, index) => {
                        const dayData = weeklyData.find(d => d.date === day.date);
                        const dayMl = dayData?.total_ml || 0;
                        const dayPercent = Math.min(100, (dayMl / dailyGoal) * 100);
                        const isToday = day.date === today;

                        return (
                            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                                <motion.span
                                    className="text-xs text-slate-500 font-medium"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    {dayMl > 0 ? `${Math.round(dayMl / 100)}` : '-'}
                                </motion.span>
                                <motion.div
                                    className={`w-full rounded-xl relative overflow-hidden ${isToday ? 'ring-2 ring-cyan-400 ring-offset-2' : ''}`}
                                    style={{ height: 70, background: '#E2E8F0' }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <motion.div
                                        className={`absolute bottom-0 left-0 right-0 rounded-xl ${dayPercent >= 100 ? 'bg-gradient-to-t from-emerald-500 to-emerald-400' :
                                            dayPercent >= 50 ? 'bg-gradient-to-t from-cyan-500 to-cyan-400' :
                                                dayPercent > 0 ? 'bg-gradient-to-t from-amber-500 to-amber-400' : ''
                                            }`}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${dayPercent}%` }}
                                        transition={{ delay: index * 0.08, duration: 0.6, ease: "easeOut" }}
                                    />
                                    {dayPercent >= 100 && (
                                        <motion.div
                                            className="absolute top-1 left-1/2 -translate-x-1/2 text-xs"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: index * 0.08 + 0.3 }}
                                        >
                                            ⭐
                                        </motion.div>
                                    )}
                                </motion.div>
                                <span className={`text-xs font-medium ${isToday ? 'text-cyan-600 font-bold' : 'text-slate-500'}`}>
                                    {day.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Today's Log History */}
            <motion.div
                className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-700/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-500" />
                    سجل اليوم
                </h3>

                {currentMl > 0 ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                                    <Droplets className="w-5 h-5 text-cyan-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800">{currentMl} مل</div>
                                    <div className="text-xs text-slate-500">إجمالي اليوم</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-cyan-600">{percentage}%</div>
                                <div className="text-xs text-slate-500">من الهدف</div>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${percentage >= 100 ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, percentage)}%` }}
                                transition={{ duration: 0.8 }}
                            />
                        </div>

                        <p className="text-sm text-slate-500 text-center mt-2">
                            {percentage >= 100 ? '🎉 أحسنت! وصلت لهدفك' : `باقي ${remainingMl} مل للوصول للهدف`}
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-6 text-slate-400">
                        <Droplets className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p>لم تسجل أي ماء اليوم</p>
                        <p className="text-xs mt-1">ابدأ بإضافة الماء من الأزرار أعلاه</p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

// Helper functions
function calculateStreak(data: WaterLog[], goal: number): number {
    let streak = 0;
    const sorted = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const log of sorted) {
        if (log.total_ml >= goal * 0.8) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

function getLast7Days() {
    const days = [];
    const dayNames = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

    for (let i = 6; i >= 0; i--) {

        const date = subDays(new Date(), i);
        const dayIndex = date.getDay();
        days.push({
            date: format(date, 'yyyy-MM-dd'),
            label: i === 0 ? 'اليوم' : i === 1 ? 'أمس' : dayNames[dayIndex]
        });
    }
    return days;
}
