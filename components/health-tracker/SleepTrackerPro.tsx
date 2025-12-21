// components/health-tracker/SleepTrackerPro.tsx
// PREMIUM Interactive Sleep Tracking with Animated Starfield

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import {
    Moon, Sun, Clock, Star, TrendingUp, Sparkles,
    Plus, CloudMoon, Sunrise, Bed, AlarmClock, Zap, X, RotateCcw, Trash2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';

// Sleep quality with emojis
const QUALITY_OPTIONS = [
    { value: 1, emoji: '😫', label: 'سيء جداً', color: '#EF4444' },
    { value: 2, emoji: '😔', label: 'سيء', color: '#F97316' },
    { value: 3, emoji: '😐', label: 'عادي', color: '#F59E0B' },
    { value: 4, emoji: '😊', label: 'جيد', color: '#22C55E' },
    { value: 5, emoji: '😴', label: 'ممتاز', color: '#10B981' },
];

// Sleep phases for visualization
const SLEEP_PHASES = [
    { name: 'مستيقظ', color: '#FEF3C7', lightColor: '#FFFBEB' },
    { name: 'نوم خفيف', color: '#7DD3FC', lightColor: '#E0F2FE' },
    { name: 'نوم عميق', color: '#3B82F6', lightColor: '#DBEAFE' },
    { name: 'أحلام', color: '#A78BFA', lightColor: '#EDE9FE' },
];

// Quality factors
const FACTORS = [
    { id: 'caffeine', emoji: '☕', label: 'كافيين', negative: true },
    { id: 'exercise', emoji: '🏃', label: 'رياضة', negative: false },
    { id: 'screen', emoji: '📱', label: 'شاشات', negative: true },
    { id: 'stress', emoji: '😰', label: 'توتر', negative: true },
    { id: 'quiet', emoji: '🤫', label: 'هدوء', negative: false },
    { id: 'dark', emoji: '🌑', label: 'ظلام', negative: false },
];

interface SleepEntry {
    id?: string;
    date: string;
    bedtime: string;
    wake_time: string;
    duration_hours: number;
    quality: number;
    score: number;
    factors: string[];
}

export default function SleepTrackerPro() {
    const [showAddSheet, setShowAddSheet] = useState(false);
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const queryClient = useQueryClient();

    // Form state
    const [bedtime, setBedtime] = useState('23:00');
    const [wakeTime, setWakeTime] = useState('07:00');
    const [quality, setQuality] = useState(3);
    const [selectedFactors, setSelectedFactors] = useState<string[]>([]);

    // Animated score
    const animatedScore = useMotionValue(0);

    // Fetch sleep data
    const { data: sleepLogs = [] } = useQuery<SleepEntry[]>({
        queryKey: ['sleepLogsPro'],
        queryFn: async () => {
            try {
                const twoWeeksAgo = format(subDays(new Date(), 14), 'yyyy-MM-dd');
                const logs = await db.entities.SleepLog.filter({ date: { $gte: twoWeeksAgo } });
                return logs.map((log: any) => ({
                    ...log,
                    duration_hours: log.duration_hours || 0,
                    score: calculateSleepScore(log.duration_hours || 0, log.quality || 3)
                })) as SleepEntry[];
            } catch {
                return [];
            }
        },
    });

    const lastNightSleep = sleepLogs.find(log => log.date === yesterday);
    const sleepScore = lastNightSleep?.score || 0;
    const sleepHours = lastNightSleep?.duration_hours || 0;

    // Animate score
    useEffect(() => {
        animate(animatedScore, sleepScore, { duration: 1.5, ease: "easeOut" });
    }, [sleepScore, animatedScore]);

    // Fix hydration - only render random animations on client
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    // Generate stable star positions
    const starPositions = useMemo(() =>
        [...Array(30)].map((_, i) => ({
            size: 1 + (i % 4),
            top: (i * 3.3) % 100,
            left: (i * 7.2) % 100,
            duration: 2 + (i % 4),
            delay: (i % 10) * 0.3
        })),
        []);

    // Weekly stats
    const weeklyLogs = sleepLogs.slice(0, 7);
    const avgScore = weeklyLogs.length > 0
        ? Math.round(weeklyLogs.reduce((sum, log) => sum + (log.score || 0), 0) / weeklyLogs.length)
        : 0;
    const avgHours = weeklyLogs.length > 0
        ? weeklyLogs.reduce((sum, log) => sum + (log.duration_hours || 0), 0) / weeklyLogs.length
        : 0;

    // Sleep debt
    const idealSleep = 8;
    const weeklyDebt = weeklyLogs.reduce((debt, log) => {
        const diff = idealSleep - (log.duration_hours || 0);
        return debt + (diff > 0 ? diff : 0);
    }, 0);

    // Get score color and emoji
    const getScoreData = (score: number) => {
        if (score >= 80) return { color: 'from-emerald-500 to-teal-500', emoji: '😴', label: 'ممتاز!' };
        if (score >= 60) return { color: 'from-green-500 to-emerald-500', emoji: '😊', label: 'جيد' };
        if (score >= 40) return { color: 'from-yellow-500 to-orange-500', emoji: '😐', label: 'عادي' };
        return { color: 'from-orange-500 to-red-500', emoji: '😔', label: 'ضعيف' };
    };

    const scoreData = getScoreData(sleepScore);

    // Save mutation
    const saveSleepMutation = useMutation({
        mutationFn: async () => {
            const duration = calculateDuration(bedtime, wakeTime);

            const data = {
                date: yesterday,
                bedtime,
                wake_time: wakeTime,
                duration_hours: duration,
                quality,
                notes: selectedFactors.join(',')
            };

            const existing = await db.entities.SleepLog.filter({ date: yesterday });
            if (existing?.[0]) {
                return db.entities.SleepLog.update(existing[0].id as string, data);
            }
            return db.entities.SleepLog.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sleepLogsPro'] });
            setShowAddSheet(false);
            toast.success('تم حفظ بيانات النوم 🌙');
        },
    });

    // Delete/Reset sleep log
    const deleteSleepMutation = useMutation({
        mutationFn: async () => {
            const existing = await db.entities.SleepLog.filter({ date: yesterday });
            if (existing?.[0]) {
                return db.entities.SleepLog.delete(existing[0].id as string);
            }
            return null;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sleepLogsPro'] });
            toast.success('تم حذف سجل النوم 🗑️');
        },
    });

    const toggleFactor = (id: string) => {
        setSelectedFactors(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    return (
        <motion.div
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Main Sleep Card with Starfield */}
            <motion.div
                className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 rounded-[2.5rem] p-6 text-white overflow-hidden shadow-2xl min-h-[380px]"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
            >
                {/* Animated Starfield */}
                {isMounted && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {starPositions.map((star, i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full bg-white"
                                style={{
                                    width: star.size,
                                    height: star.size,
                                    top: `${star.top}%`,
                                    left: `${star.left}%`,
                                }}
                                animate={{
                                    opacity: [0.2, 1, 0.2],
                                    scale: [1, 1.5, 1],
                                }}
                                transition={{
                                    duration: star.duration,
                                    repeat: Infinity,
                                    delay: star.delay,
                                }}
                            />
                        ))}

                        {/* Shooting star occasionally */}
                        <motion.div
                            className="absolute w-1 h-1 bg-white rounded-full"
                            initial={{ top: '10%', left: '80%', opacity: 0 }}
                            animate={{
                                top: ['10%', '60%'],
                                left: ['80%', '20%'],
                                opacity: [0, 1, 0],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatDelay: 8,
                            }}
                            style={{
                                boxShadow: '0 0 10px 2px rgba(255,255,255,0.5)',
                            }}
                        />
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <motion.div
                            className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm"
                            animate={{
                                rotate: [0, 5, -5, 0],
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <Moon className="w-7 h-7" />
                        </motion.div>
                        <div>
                            <h2 className="text-2xl font-bold">تتبع النوم</h2>
                            <p className="text-white/80 text-sm">نوم أفضل = حياة أفضل</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {lastNightSleep && (
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 180 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => deleteSleepMutation.mutate()}
                                disabled={deleteSleepMutation.isPending}
                                className="w-12 h-12 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center backdrop-blur-sm"
                                title="حذف سجل النوم"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowAddSheet(true)}
                            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center backdrop-blur-sm"
                        >
                            <Plus className="w-6 h-6" />
                        </motion.button>
                    </div>
                </div>

                {/* Sleep Score Circle - Interactive */}
                <div className="flex justify-center mb-6 relative z-10">
                    <motion.div
                        className="relative w-48 h-48"
                        whileHover={{ scale: 1.02 }}
                    >
                        {/* Outer glow */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/30 to-pink-400/30 blur-xl" />

                        {/* Score Ring SVG */}
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                            <defs>
                                <linearGradient id="sleepScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#F0ABFC" />
                                    <stop offset="50%" stopColor="#C084FC" />
                                    <stop offset="100%" stopColor="#A78BFA" />
                                </linearGradient>
                                <filter id="sleepGlow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="4" result="blur" />
                                    <feMerge>
                                        <feMergeNode in="blur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            {/* Background ring */}
                            <circle
                                cx="96" cy="96" r="82"
                                stroke="rgba(255,255,255,0.15)"
                                strokeWidth="14"
                                fill="none"
                            />
                            {/* Progress ring */}
                            <motion.circle
                                cx="96" cy="96" r="82"
                                stroke="url(#sleepScoreGrad)"
                                strokeWidth="14"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 82}
                                initial={{ strokeDashoffset: 2 * Math.PI * 82 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 82 * (1 - sleepScore / 100) }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                filter="url(#sleepGlow)"
                            />
                        </svg>

                        {/* Center Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span
                                className="text-5xl font-bold"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                            >
                                {sleepScore}
                            </motion.span>
                            <span className="text-sm text-white/80">درجة النوم</span>

                            {/* Star rating */}
                            <div className="flex items-center gap-0.5 mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <motion.div
                                        key={star}
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ delay: 0.5 + star * 0.1, type: 'spring' }}
                                    >
                                        <Star
                                            className={`w-4 h-4 ${star <= Math.round(sleepScore / 20)
                                                ? 'text-yellow-300 fill-yellow-300'
                                                : 'text-white/30'
                                                }`}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Quality emoji */}
                        <motion.div
                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-4xl"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            {scoreData.emoji}
                        </motion.div>
                    </motion.div>
                </div>

                {/* Last Night Stats */}
                {lastNightSleep ? (
                    <motion.div
                        className="grid grid-cols-3 gap-3 relative z-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <motion.div
                            className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center"
                            whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.2)' }}
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            >
                                <Bed className="w-6 h-6 mx-auto mb-2 text-indigo-200" />
                            </motion.div>
                            <div className="font-bold text-lg">{lastNightSleep.bedtime}</div>
                            <div className="text-[10px] text-white/70">وقت النوم</div>
                        </motion.div>
                        <motion.div
                            className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center"
                            whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.2)' }}
                        >
                            <motion.div
                                animate={{ y: [0, -3, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Sunrise className="w-6 h-6 mx-auto mb-2 text-amber-200" />
                            </motion.div>
                            <div className="font-bold text-lg">{lastNightSleep.wake_time}</div>
                            <div className="text-[10px] text-white/70">الاستيقاظ</div>
                        </motion.div>
                        <motion.div
                            className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center"
                            whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.2)' }}
                        >
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <Clock className="w-6 h-6 mx-auto mb-2 text-cyan-200" />
                            </motion.div>
                            <div className="font-bold text-lg">{sleepHours.toFixed(1)}س</div>
                            <div className="text-[10px] text-white/70">المدة</div>
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        className="text-center py-6 relative z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-5xl mb-3"
                        >
                            🌙
                        </motion.div>
                        <p className="text-white/80 mb-4">لم تسجل نوم الليلة الماضية</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowAddSheet(true)}
                            className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full font-medium backdrop-blur-sm"
                        >
                            <Plus className="w-4 h-4 inline ml-2" />
                            سجل الآن
                        </motion.button>
                    </motion.div>
                )}
            </motion.div>

            {/* Sleep Phases Card */}
            <motion.div
                className="bg-white rounded-2xl p-5 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <CloudMoon className="w-5 h-5 text-indigo-500" />
                    مراحل النوم
                </h3>
                <div className="space-y-3">
                    {SLEEP_PHASES.map((phase, i) => (
                        <motion.div
                            key={phase.name}
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: phase.color }}
                            />
                            <span className="text-sm text-slate-600 w-20">{phase.name}</span>
                            <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: phase.lightColor }}>
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: phase.color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${[5, 50, 25, 20][i]}%` }}
                                    transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                                />
                            </div>
                            <span className="text-xs text-slate-500 w-12 text-left">{[5, 50, 25, 20][i]}%</span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                <motion.div
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 text-center shadow-lg"
                    whileHover={{ y: -3, scale: 1.02 }}
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                    >
                        <TrendingUp className="w-7 h-7 mx-auto mb-2 text-indigo-500" />
                    </motion.div>
                    <div className="text-2xl font-bold text-indigo-700">{avgScore}</div>
                    <div className="text-[10px] text-indigo-600 font-medium">متوسط الدرجة</div>
                </motion.div>

                <motion.div
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 text-center shadow-lg"
                    whileHover={{ y: -3, scale: 1.02 }}
                >
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <Clock className="w-7 h-7 mx-auto mb-2 text-purple-500" />
                    </motion.div>
                    <div className="text-2xl font-bold text-purple-700">{avgHours.toFixed(1)}س</div>
                    <div className="text-[10px] text-purple-600 font-medium">متوسط المدة</div>
                </motion.div>

                <motion.div
                    className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-4 text-center shadow-lg"
                    whileHover={{ y: -3, scale: 1.02 }}
                >
                    <motion.div
                        animate={{ y: [0, -2, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        <Zap className="w-7 h-7 mx-auto mb-2 text-red-500" />
                    </motion.div>
                    <div className="text-2xl font-bold text-red-700">{weeklyDebt.toFixed(1)}س</div>
                    <div className="text-[10px] text-red-600 font-medium">دين النوم</div>
                </motion.div>
            </div>

            {/* Weekly Chart */}
            <motion.div
                className="bg-white rounded-2xl p-5 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    نومك هذا الأسبوع
                </h3>
                <div className="flex items-center justify-between gap-2">
                    {getLast7Days().map((day, index) => {
                        const daySleep = sleepLogs.find(s => s.date === day.date);
                        const hours = daySleep?.duration_hours || 0;
                        const isToday = day.date === today;
                        const isYesterday = day.date === yesterday;

                        return (
                            <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                                <motion.div
                                    className={`w-full h-20 rounded-xl flex items-center justify-center relative overflow-hidden ${isYesterday ? 'ring-2 ring-purple-400 ring-offset-2' : ''
                                        }`}
                                    style={{
                                        background: hours > 0
                                            ? `linear-gradient(to top, ${hours >= 7 ? '#10B981' : hours >= 5 ? '#F59E0B' : '#EF4444'}20, transparent)`
                                            : '#F1F5F9'
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    {hours > 0 ? (
                                        <motion.span
                                            className="text-2xl"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            {hours >= 7 ? '😴' : hours >= 5 ? '😊' : '😔'}
                                        </motion.span>
                                    ) : (
                                        <span className="text-slate-300 text-xs">-</span>
                                    )}
                                </motion.div>
                                <span className="text-[9px] text-slate-500 font-medium">
                                    {hours > 0 ? `${hours.toFixed(1)}س` : '-'}
                                </span>
                                <span className={`text-[10px] ${isYesterday ? 'text-purple-600 font-bold' : 'text-slate-500'}`}>
                                    {day.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Bedtime Recommendation */}
            <motion.div
                className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 flex items-center gap-4 shadow-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.01 }}
            >
                <motion.div
                    className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                >
                    <AlarmClock className="w-7 h-7 text-indigo-600" />
                </motion.div>
                <div className="flex-1">
                    <p className="text-sm text-slate-600 font-medium">للاستيقاظ الساعة 7:00 صباحاً</p>
                    <p className="text-xl font-bold text-indigo-600">نم الساعة 11:00 مساءً</p>
                </div>
                <Moon className="w-6 h-6 text-indigo-300" />
            </motion.div>

            {/* Add Sleep Sheet */}
            <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
                <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-auto">
                    <SheetHeader className="pb-4">
                        <SheetTitle className="text-center text-xl">سجل نوم الليلة الماضية 🌙</SheetTitle>
                    </SheetHeader>

                    <div className="space-y-6 py-4">
                        {/* Time Inputs */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-600 mb-2 block">وقت النوم</label>
                                <div className="relative">
                                    <motion.div
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                    >
                                        <Moon className="w-5 h-5 text-indigo-500" />
                                    </motion.div>
                                    <input
                                        type="time"
                                        value={bedtime}
                                        onChange={(e) => setBedtime(e.target.value)}
                                        className="w-full pr-10 pl-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-lg font-medium"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600 mb-2 block">وقت الاستيقاظ</label>
                                <div className="relative">
                                    <motion.div
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                        animate={{ y: [0, -2, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Sun className="w-5 h-5 text-amber-500" />
                                    </motion.div>
                                    <input
                                        type="time"
                                        value={wakeTime}
                                        onChange={(e) => setWakeTime(e.target.value)}
                                        className="w-full pr-10 pl-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-lg font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Duration Display */}
                        <div className="bg-indigo-50 rounded-2xl p-4 text-center">
                            <span className="text-sm text-indigo-600">مدة النوم المحسوبة</span>
                            <motion.div
                                className="text-3xl font-bold text-indigo-700 mt-1"
                                key={`${bedtime}-${wakeTime}`}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                            >
                                {calculateDuration(bedtime, wakeTime).toFixed(1)} ساعة
                            </motion.div>
                        </div>

                        {/* Quality Rating */}
                        <div>
                            <label className="text-sm font-medium text-slate-600 mb-3 block">جودة النوم</label>
                            <div className="flex justify-between gap-2">
                                {QUALITY_OPTIONS.map((q) => (
                                    <motion.button
                                        key={q.value}
                                        whileHover={{ scale: 1.1, y: -3 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setQuality(q.value)}
                                        className={`flex-1 py-4 rounded-2xl text-center transition-all ${q.value === quality
                                            ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg text-white'
                                            : 'bg-slate-100 hover:bg-slate-200'
                                            }`}
                                    >
                                        <motion.span
                                            className="text-3xl block mb-1"
                                            animate={q.value === quality ? { scale: [1, 1.2, 1] } : {}}
                                        >
                                            {q.emoji}
                                        </motion.span>
                                        <span className={`text-[10px] font-medium ${q.value === quality ? 'text-white' : 'text-slate-600'}`}>
                                            {q.label}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Factors */}
                        <div>
                            <label className="text-sm font-medium text-slate-600 mb-3 block">عوامل مؤثرة (اختياري)</label>
                            <div className="flex flex-wrap gap-2">
                                {FACTORS.map((factor, i) => (
                                    <motion.button
                                        key={factor.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => toggleFactor(factor.id)}
                                        className={`px-4 py-2.5 rounded-full text-sm flex items-center gap-2 transition-all font-medium ${selectedFactors.includes(factor.id)
                                            ? factor.negative
                                                ? 'bg-red-100 text-red-700 border-2 border-red-300'
                                                : 'bg-green-100 text-green-700 border-2 border-green-300'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        <span className="text-lg">{factor.emoji}</span>
                                        {factor.label}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Save Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => saveSleepMutation.mutate()}
                            disabled={saveSleepMutation.isPending}
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl py-5 text-lg font-bold shadow-lg flex items-center justify-center gap-2"
                        >
                            <Moon className="w-5 h-5" />
                            حفظ بيانات النوم
                        </motion.button>
                    </div>
                </SheetContent>
            </Sheet>
        </motion.div >
    );
}

// Helper functions
function calculateDuration(bedtime: string, wakeTime: string): number {
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);

    let bedMinutes = bedHour * 60 + bedMin;
    let wakeMinutes = wakeHour * 60 + wakeMin;

    if (wakeMinutes < bedMinutes) {
        wakeMinutes += 24 * 60;
    }

    return (wakeMinutes - bedMinutes) / 60;
}

function calculateSleepScore(hours: number, quality: number): number {
    let durationScore = 0;
    if (hours >= 7 && hours <= 9) durationScore = 50;
    else if (hours >= 6 && hours < 7) durationScore = 35;
    else if (hours > 9 && hours <= 10) durationScore = 40;
    else if (hours >= 5 && hours < 6) durationScore = 25;
    else durationScore = 15;

    const qualityScore = quality * 10;
    return Math.min(100, durationScore + qualityScore);
}

function getLast7Days() {
    const days = [];
    const dayNames = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

    for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        days.push({
            date: format(date, 'yyyy-MM-dd'),
            label: i === 0 ? 'اليوم' : i === 1 ? 'أمس' : dayNames[date.getDay()]
        });
    }
    return days;
}
