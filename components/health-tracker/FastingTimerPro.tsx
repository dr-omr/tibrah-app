// components/health-tracker/FastingTimerPro.tsx
// PREMIUM Interactive Fasting Timer with Animated Timeline & Phases

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Timer, Play, Pause, RotateCcw, Trophy, Flame,
    Sparkles, Clock, Zap, Heart, Brain, Battery
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { format, differenceInSeconds, differenceInHours, addHours } from 'date-fns';
import { ar } from 'date-fns/locale';

// Fasting phases with benefits
const FASTING_PHASES = [
    { hours: 0, name: 'بداية', icon: Play, color: '#94A3B8', benefit: 'بدأت رحلة الصيام' },
    { hours: 4, name: 'حرق السكر', icon: Flame, color: '#F59E0B', benefit: 'استنفاد مخزون السكر' },
    { hours: 8, name: 'حرق الدهون', icon: Zap, color: '#EF4444', benefit: 'بدء حرق الدهون' },
    { hours: 12, name: 'الكيتوزيس', icon: Battery, color: '#8B5CF6', benefit: 'إنتاج الكيتونات' },
    { hours: 16, name: 'تنظيف الخلايا', icon: Sparkles, color: '#10B981', benefit: 'الالتهام الذاتي' },
    { hours: 20, name: 'تجديد', icon: Heart, color: '#EC4899', benefit: 'إصلاح الخلايا' },
    { hours: 24, name: 'الذروة', icon: Trophy, color: '#F97316', benefit: 'أقصى فائدة!' },
];

// Fasting presets
const FASTING_PRESETS = [
    { hours: 12, name: '12:12', description: 'للمبتدئين' },
    { hours: 14, name: '14:10', description: 'متوسط' },
    { hours: 16, name: '16:8', description: 'الأكثر شعبية' },
    { hours: 18, name: '18:6', description: 'متقدم' },
    { hours: 20, name: '20:4', description: 'المحاربين' },
    { hours: 24, name: '24:0', description: 'OMAD' },
];

interface FastingSession {
    id?: string;
    startTime: string;
    targetHours: number;
    endTime?: string;
    completed?: boolean;
}

export default function FastingTimerPro() {
    const queryClient = useQueryClient();

    // State
    const [selectedPreset, setSelectedPreset] = useState(16);
    const [isActive, setIsActive] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [startTime, setStartTime] = useState<Date | null>(null);

    // Fix hydration - only render random animations on client
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    // Generate stable flame positions
    const flamePositions = useMemo(() =>
        [...Array(15)].map((_, i) => ({
            left: (i * 6.6) % 100,
            xOffset: ((i * 5) % 30) - 15,
            duration: 2 + (i % 3),
            delay: i * 0.2
        })),
        []);

    // Fetch current session
    const { data: currentSession } = useQuery<FastingSession | null>({
        queryKey: ['fastingSessionPro'],
        queryFn: async () => {
            try {
                const sessions = await db.entities.FastingSession.filter({ completed: false });
                if (sessions?.[0]) {
                    return sessions[0] as unknown as FastingSession;
                }
                return null;
            } catch {
                return null;
            }
        },
    });

    // Initialize from current session
    useEffect(() => {
        if (currentSession && !currentSession.completed) {
            const start = new Date(currentSession.startTime);
            setStartTime(start);
            setSelectedPreset(currentSession.targetHours);
            setIsActive(true);
        }
    }, [currentSession]);

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && startTime) {
            interval = setInterval(() => {
                const now = new Date();
                const elapsed = differenceInSeconds(now, startTime);
                setElapsedSeconds(elapsed);

                // Check if target reached
                const targetSeconds = selectedPreset * 3600;
                if (elapsed >= targetSeconds && !currentSession?.completed) {
                    handleComplete();
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, startTime, selectedPreset, currentSession]);

    const elapsedHours = elapsedSeconds / 3600;
    const targetSeconds = selectedPreset * 3600;
    const progress = Math.min(100, (elapsedSeconds / targetSeconds) * 100);
    const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);

    // Current phase
    const currentPhase = [...FASTING_PHASES].reverse().find(p => elapsedHours >= p.hours) || FASTING_PHASES[0];
    const nextPhase = FASTING_PHASES.find(p => p.hours > elapsedHours);

    // Format time
    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return { hours, minutes, seconds };
    };

    const elapsed = formatTime(elapsedSeconds);
    const remaining = formatTime(remainingSeconds);

    // Start fasting
    const startFasting = useMutation({
        mutationFn: async () => {
            const now = new Date();
            return db.entities.FastingSession.create({
                startTime: now.toISOString(),
                targetHours: selectedPreset,
                completed: false
            });
        },
        onSuccess: () => {
            setStartTime(new Date());
            setIsActive(true);
            setElapsedSeconds(0);
            queryClient.invalidateQueries({ queryKey: ['fastingSessionPro'] });
            toast.success('🍽️ بدأ الصيام! بالتوفيق');
        },
    });

    // End fasting
    const endFasting = useMutation({
        mutationFn: async () => {
            if (currentSession?.id) {
                return db.entities.FastingSession.update(currentSession.id, {
                    endTime: new Date().toISOString(),
                    completed: true
                });
            }
        },
        onSuccess: () => {
            setIsActive(false);
            setStartTime(null);
            setElapsedSeconds(0);
            queryClient.invalidateQueries({ queryKey: ['fastingSessionPro'] });
            toast.success('تم إنهاء الصيام');
        },
    });

    const handleComplete = useCallback(() => {
        if (currentSession?.id) {
            db.entities.FastingSession.update(currentSession.id, {
                endTime: new Date().toISOString(),
                completed: true
            });
            toast.success('🎉 مبروك! أكملت صيامك بنجاح!', { duration: 5000 });
        }
    }, [currentSession]);

    return (
        <motion.div
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Main Timer Card */}
            <motion.div
                className="relative bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-500 rounded-[2.5rem] p-6 text-white overflow-hidden shadow-2xl"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
            >
                {/* Animated flames */}
                {isMounted && isActive && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {flamePositions.map((flame, i) => (
                            <motion.div
                                key={i}
                                className="absolute text-2xl"
                                style={{
                                    bottom: -20,
                                    left: `${flame.left}%`,
                                }}
                                animate={{
                                    y: [-20, -150],
                                    x: [0, flame.xOffset],
                                    opacity: [0, 0.7, 0],
                                    scale: [0.5, 1.2, 0.5],
                                }}
                                transition={{
                                    duration: flame.duration,
                                    repeat: Infinity,
                                    delay: flame.delay,
                                }}
                            >
                                🔥
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <motion.div
                        className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm"
                        animate={isActive ? {
                            scale: [1, 1.1, 1],
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <Timer className="w-7 h-7" />
                    </motion.div>
                    <div>
                        <h2 className="text-2xl font-bold">الصيام المتقطع</h2>
                        <p className="text-white/80 text-sm">
                            {isActive ? `${selectedPreset}:${24 - selectedPreset}` : 'اختر نمط الصيام'}
                        </p>
                    </div>
                </div>

                {/* Timer Circle */}
                <div className="flex justify-center mb-6 relative z-10">
                    <motion.div
                        className="relative w-56 h-56"
                        whileHover={{ scale: 1.02 }}
                    >
                        {/* Outer glow */}
                        {isActive && (
                            <motion.div
                                className="absolute inset-0 rounded-full bg-orange-400/30 blur-2xl"
                                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        )}

                        {/* Progress ring */}
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                            <defs>
                                <linearGradient id="fastingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#FCD34D" />
                                    <stop offset="50%" stopColor="#FBBF24" />
                                    <stop offset="100%" stopColor="#F59E0B" />
                                </linearGradient>
                                <filter id="fastingGlow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="4" result="blur" />
                                    <feMerge>
                                        <feMergeNode in="blur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            {/* Background ring */}
                            <circle
                                cx="112" cy="112" r="96"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="14"
                                fill="none"
                            />
                            {/* Progress ring */}
                            <motion.circle
                                cx="112" cy="112" r="96"
                                stroke="url(#fastingGrad)"
                                strokeWidth="14"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 96}
                                initial={{ strokeDashoffset: 2 * Math.PI * 96 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 96 * (1 - progress / 100) }}
                                transition={{ duration: 0.5 }}
                                filter="url(#fastingGlow)"
                            />
                        </svg>

                        {/* Center Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            {isActive ? (
                                <>
                                    <motion.div
                                        className="text-5xl font-bold font-mono tracking-tight"
                                        key={elapsed.hours}
                                        initial={{ scale: 1.1 }}
                                        animate={{ scale: 1 }}
                                    >
                                        {String(elapsed.hours).padStart(2, '0')}:
                                        {String(elapsed.minutes).padStart(2, '0')}
                                    </motion.div>
                                    <motion.span
                                        className="text-2xl font-mono text-white/70"
                                        animate={{ opacity: [1, 0.5, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    >
                                        :{String(elapsed.seconds).padStart(2, '0')}
                                    </motion.span>
                                    <div className="text-sm text-white/70 mt-2">
                                        متبقي {remaining.hours}س {remaining.minutes}د
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-6xl font-bold">{selectedPreset}</div>
                                    <div className="text-lg text-white/70">ساعة</div>
                                </>
                            )}
                        </div>

                        {/* Current phase emoji */}
                        {isActive && (
                            <motion.div
                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-4xl"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                {currentPhase.hours >= 16 ? '🏆' : currentPhase.hours >= 12 ? '⚡' : currentPhase.hours >= 8 ? '🔥' : '🍽️'}
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                {/* Current Phase Info */}
                {isActive && (
                    <motion.div
                        className="text-center mb-4 relative z-10"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm"
                            style={{ backgroundColor: `${currentPhase.color}40` }}
                        >
                            <currentPhase.icon className="w-5 h-5" />
                            <span className="font-bold">{currentPhase.name}</span>
                        </div>
                        <p className="text-white/80 text-sm mt-2">{currentPhase.benefit}</p>

                        {nextPhase && (
                            <p className="text-white/60 text-xs mt-1">
                                المرحلة التالية: {nextPhase.name} (بعد {Math.ceil(nextPhase.hours - elapsedHours)} س)
                            </p>
                        )}
                    </motion.div>
                )}

                {/* Control Buttons */}
                <div className="flex justify-center gap-4 relative z-10">
                    {!isActive ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => startFasting.mutate()}
                            className="px-8 py-4 bg-white text-orange-600 rounded-full font-bold text-lg shadow-xl flex items-center gap-2"
                        >
                            <Play className="w-6 h-6 fill-current" />
                            ابدأ الصيام
                        </motion.button>
                    ) : (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => endFasting.mutate()}
                                className="px-6 py-4 bg-white/20 backdrop-blur-sm rounded-full font-bold flex items-center gap-2 hover:bg-white/30"
                            >
                                <Pause className="w-5 h-5" />
                                إنهاء
                            </motion.button>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Fasting Presets */}
            {!isActive && (
                <motion.div
                    className="bg-white rounded-2xl p-5 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        اختر نمط الصيام
                    </h3>

                    <div className="grid grid-cols-3 gap-3">
                        {FASTING_PRESETS.map((preset, i) => (
                            <motion.button
                                key={preset.hours}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedPreset(preset.hours)}
                                className={`p-4 rounded-2xl text-center transition-all ${selectedPreset === preset.hours
                                    ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                <div className="text-2xl font-bold">{preset.name}</div>
                                <div className={`text-xs ${selectedPreset === preset.hours ? 'text-white/80' : 'text-slate-500'}`}>
                                    {preset.description}
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Phases Timeline */}
            <motion.div
                className="bg-white rounded-2xl p-5 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    مراحل الصيام
                </h3>

                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute top-6 left-6 bottom-6 w-1 bg-slate-200 rounded-full">
                        <motion.div
                            className="w-full bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"
                            initial={{ height: 0 }}
                            animate={{ height: isActive ? `${Math.min(100, (elapsedHours / 24) * 100)}%` : 0 }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>

                    <div className="space-y-4">
                        {FASTING_PHASES.map((phase, i) => {
                            const isReached = elapsedHours >= phase.hours;
                            const isCurrent = isActive && currentPhase.hours === phase.hours;

                            return (
                                <motion.div
                                    key={phase.hours}
                                    className="flex items-center gap-4 relative"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <motion.div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 ${isCurrent ? 'ring-4 ring-offset-2' : ''
                                            }`}
                                        style={{
                                            backgroundColor: isReached ? phase.color : '#E2E8F0',
                                            ringColor: isCurrent ? phase.color : 'transparent'
                                        }}
                                        animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    >
                                        <phase.icon
                                            className={`w-5 h-5 ${isReached ? 'text-white' : 'text-slate-400'}`}
                                        />
                                    </motion.div>

                                    <div className="flex-1">
                                        <div className={`font-bold ${isReached ? 'text-slate-800' : 'text-slate-400'}`}>
                                            {phase.name}
                                            <span className="text-sm font-normal mr-2">({phase.hours}س)</span>
                                        </div>
                                        <div className={`text-sm ${isReached ? 'text-slate-600' : 'text-slate-400'}`}>
                                            {phase.benefit}
                                        </div>
                                    </div>

                                    {isReached && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="text-2xl"
                                        >
                                            ✅
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

            {/* Benefits Summary */}
            <div className="grid grid-cols-3 gap-3">
                <motion.div
                    className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 text-center shadow-lg"
                    whileHover={{ y: -3, scale: 1.02 }}
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2.5 }}
                    >
                        <Flame className="w-7 h-7 mx-auto mb-2 text-orange-500" />
                    </motion.div>
                    <div className="text-2xl font-bold text-orange-700">
                        {isActive ? Math.round(elapsedHours * 50) : 0}
                    </div>
                    <div className="text-[10px] text-orange-600 font-medium">سعرات محروقة</div>
                </motion.div>

                <motion.div
                    className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-4 text-center shadow-lg"
                    whileHover={{ y: -3, scale: 1.02 }}
                >
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <Brain className="w-7 h-7 mx-auto mb-2 text-purple-500" />
                    </motion.div>
                    <div className="text-2xl font-bold text-purple-700">
                        {Math.round(progress)}%
                    </div>
                    <div className="text-[10px] text-purple-600 font-medium">التقدم</div>
                </motion.div>

                <motion.div
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 text-center shadow-lg"
                    whileHover={{ y: -3, scale: 1.02 }}
                >
                    <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        <Trophy className="w-7 h-7 mx-auto mb-2 text-emerald-500" />
                    </motion.div>
                    <div className="text-2xl font-bold text-emerald-700">
                        {FASTING_PHASES.filter(p => elapsedHours >= p.hours).length}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium">مراحل مُكتملة</div>
                </motion.div>
            </div>
        </motion.div>
    );
}
