// components/therapy/BreathingExercise.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Wind } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';

type BreathingPhase = 'IDLE' | 'INHALE' | 'HOLD' | 'EXHALE';

interface BreathingExerciseProps {
    onComplete?: () => void;
}

export default function BreathingExercise({ onComplete }: BreathingExerciseProps) {
    const [phase, setPhase] = useState<BreathingPhase>('IDLE');
    const [timeLeft, setTimeLeft] = useState(0);
    const [cycleCount, setCycleCount] = useState(0);
    const CYCLES_TARGET = 4;

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (phase === 'INHALE') {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) { setPhase('HOLD'); setTimeLeft(7); return 0; }
                    return prev - 1;
                });
            }, 1000);
        } else if (phase === 'HOLD') {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) { setPhase('EXHALE'); setTimeLeft(8); return 0; }
                    return prev - 1;
                });
            }, 1000);
        } else if (phase === 'EXHALE') {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        const newCycles = cycleCount + 1;
                        setCycleCount(newCycles);
                        if (newCycles >= CYCLES_TARGET) {
                            setPhase('IDLE');
                            if (onComplete) onComplete();
                            haptic.success();
                            return 0;
                        }
                        setPhase('INHALE');
                        setTimeLeft(4);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(timer);
    }, [phase, cycleCount, onComplete]);

    useEffect(() => {
        if (phase === 'INHALE' || phase === 'EXHALE') {
            haptic.selection();
        } else if (phase === 'HOLD') {
            haptic.selection();
        }
    }, [phase]);

    const startExercise = () => {
        haptic.selection();
        setCycleCount(0);
        setPhase('INHALE');
        setTimeLeft(4);
    };

    const stopExercise = () => {
        haptic.selection();
        setPhase('IDLE');
        setTimeLeft(0);
    };

    const getInstruction = () => {
        switch (phase) {
            case 'INHALE': return 'شهيق عميق من الأنف...';
            case 'HOLD': return 'احتفظ بالهواء...';
            case 'EXHALE': return 'زفير بطيء من الفم...';
            default: return 'اضغط للبدء (٤-٧-٨)';
        }
    };

    const getScale = () => {
        switch (phase) {
            case 'INHALE': return 1.5;
            case 'HOLD': return 1.5;
            case 'EXHALE': return 0.8;
            default: return 1;
        }
    };

    const getTransitionDuration = () => {
        switch (phase) {
            case 'INHALE': return 4;
            case 'EXHALE': return 8;
            default: return 0.5;
        }
    };

    const getColor = () => {
        switch (phase) {
            case 'INHALE': return 'from-teal-400 to-emerald-400 shadow-teal-500/40';
            case 'HOLD': return 'from-amber-400 to-orange-400 shadow-amber-500/40';
            case 'EXHALE': return 'from-indigo-400 to-purple-400 shadow-indigo-500/40';
            default: return 'from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 shadow-slate-500/10';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[40px] border border-white/20 dark:border-slate-800/50 shadow-[0_20px_40px_rgba(0,0,0,0.05)] w-full">
            
            <div className="relative w-64 h-64 flex items-center justify-center mb-8">
                {/* Background ripple rings */}
                <AnimatePresence>
                    {phase !== 'IDLE' && (
                        <>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.8, 1] }}
                                transition={{ duration: phase === 'INHALE' ? 4 : phase === 'EXHALE' ? 8 : 7, repeat: Infinity, ease: "easeInOut" }}
                                className={`absolute inset-0 rounded-full border border-teal-500/20`}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: [0.05, 0.2, 0.05], scale: [1, 2.2, 1] }}
                                transition={{ duration: phase === 'INHALE' ? 4 : phase === 'EXHALE' ? 8 : 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                className={`absolute inset-0 rounded-full border border-teal-500/10`}
                            />
                        </>
                    )}
                </AnimatePresence>

                {/* Main Breathing Circle */}
                <motion.div
                    animate={{ scale: getScale() }}
                    transition={{ ease: "easeInOut", duration: getTransitionDuration() }}
                    className={`relative z-10 w-32 h-32 rounded-full bg-gradient-to-br ${getColor()} shadow-2xl flex items-center justify-center`}
                >
                    <div className="absolute inset-1 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-sm" />
                    <span className="relative z-20 text-4xl font-black text-white drop-shadow-md tabular-nums tracking-tighter">
                        {phase === 'IDLE' ? <Wind className="w-12 h-12 opacity-80" /> : timeLeft}
                    </span>
                </motion.div>
            </div>

            <div className="text-center mb-8">
                <AnimatePresence mode="wait">
                    <motion.h3
                        key={phase}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight"
                    >
                        {getInstruction()}
                    </motion.h3>
                </AnimatePresence>
                
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    {phase === 'IDLE' ? 'تمرين مثبت علمياً لتهدئة الجهاز العصبي' : `الدورة ${cycleCount + 1} من ${CYCLES_TARGET}`}
                </p>
            </div>

            <div className="flex items-center gap-4">
                {phase === 'IDLE' ? (
                    <button
                        onClick={startExercise}
                        className="w-16 h-16 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Play className="w-6 h-6 ml-1" />
                    </button>
                ) : (
                    <button
                        onClick={stopExercise}
                        className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                    >
                        <RotateCcw className="w-6 h-6" />
                    </button>
                )}
            </div>
        </div>
    );
}
