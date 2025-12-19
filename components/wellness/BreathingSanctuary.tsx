import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, X, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function BreathingSanctuary() {
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'idle'>('idle');
    const [timeLeft, setTimeLeft] = useState(0); // For phase countdown
    const [cycles, setCycles] = useState(0);

    // 4-7-8 Technique
    const PHASES = {
        inhale: { duration: 4, label: 'شهيق عميق...', color: '#2D9B83' }, // Green
        hold: { duration: 7, label: 'احبس نفسك...', color: '#D4AF37' },   // Gold
        exhale: { duration: 8, label: 'زفير ببطء...', color: '#3FB39A' } // Light Green
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (isActive) {
            const runCycle = async () => {
                // Inhale
                setPhase('inhale');
                await wait(PHASES.inhale.duration);
                if (!isActive) return;

                // Hold
                setPhase('hold');
                await wait(PHASES.hold.duration);
                if (!isActive) return;

                // Exhale
                setPhase('exhale');
                await wait(PHASES.exhale.duration);
                if (!isActive) return;

                setCycles(c => c + 1);
                // Loop
                runCycle();
            };

            if (phase === 'idle') runCycle();
        } else {
            setPhase('idle');
        }

        return () => clearTimeout(timer);
    }, [isActive]);

    const wait = (seconds: number) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-900 text-white">

            {/* Ambient Background */}
            <div className="absolute inset-0 z-0">
                <div className={`absolute inset-0 bg-gradient-to-br from-[#1a2e2a] to-[#0f172a] transition-colors duration-[4000ms] ${phase === 'inhale' ? 'opacity-100' : 'opacity-80'}`} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2D9B83]/10 rounded-full blur-[100px] animate-pulse-soft" />
            </div>

            {/* Header Content */}
            <div className="relative z-10 w-full max-w-md px-6 text-center mb-10">
                <div className="flex items-center justify-between mb-8">
                    <Link href="/Dashboard">
                        <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10 rounded-full">
                            <X className="w-6 h-6" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Wind className="w-5 h-5 text-[#2D9B83]" />
                        <span className="text-sm font-medium tracking-wider uppercase text-[#2D9B83]">معبد التنفس</span>
                    </div>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                {!isActive && phase === 'idle' && (
                    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <h1 className="text-3xl font-bold mb-4 font-cairo">استعد للهدوء</h1>
                        <p className="text-white/60 mb-8 leading-relaxed">
                            تقنية التنفس 4-7-8 تساعد على تهدئة الجهاز العصبي وتقليل التوتر والحصول على نوم عميق خلال دقائق.
                        </p>
                    </div>
                )}
            </div>

            {/* Breathing Circle Visualization */}
            <div className="relative z-10 mb-12">
                {/* Outer Ring */}
                <motion.div
                    animate={{
                        scale: phase === 'inhale' ? 1.5 : phase === 'exhale' ? 1 : 1.2,
                        opacity: phase === 'hold' ? 0.6 : 0.3,
                        borderColor: phase === 'idle' ? '#ffffff' : PHASES[phase as keyof typeof PHASES]?.color
                    }}
                    transition={{ duration: phase === 'idle' ? 0.5 : PHASES[phase as keyof typeof PHASES]?.duration, ease: "easeInOut" }}
                    className="w-64 h-64 rounded-full border-4 border-white/20 flex items-center justify-center relative"
                >
                    {/* Inner Circle */}
                    <motion.div
                        animate={{
                            scale: phase === 'inhale' ? 1 : phase === 'exhale' ? 0.5 : 0.8,
                            backgroundColor: phase === 'idle' ? '#ffffff' : PHASES[phase as keyof typeof PHASES]?.color
                        }}
                        transition={{ duration: phase === 'idle' ? 0.5 : PHASES[phase as keyof typeof PHASES]?.duration, ease: "easeInOut" }}
                        className="w-full h-full rounded-full bg-white opacity-20 blur-xl absolute inset-0"
                    />

                    {/* Text Label */}
                    <div className="relative z-20 text-center">
                        {isActive ? (
                            <motion.div
                                key={phase}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-2"
                            >
                                <p className="text-2xl font-bold">{PHASES[phase as keyof typeof PHASES]?.label}</p>
                                <p className="text-3xl font-mono opacity-50">{phase === 'hold' ? '' : ''}</p>
                            </motion.div>
                        ) : (
                            <Play className="w-16 h-16 text-white ml-2 opacity-80" />
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Controls */}
            <div className="relative z-10 flex items-center gap-6">
                {!isActive ? (
                    <Button
                        onClick={() => setIsActive(true)}
                        className="h-16 px-10 rounded-full bg-[#2D9B83] hover:bg-[#258570] text-white text-xl font-bold shadow-[0_0_30px_rgba(45,155,131,0.4)] transition-all hover:scale-105"
                    >
                        ابدأ الجلسة
                    </Button>
                ) : (
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => { setIsActive(false); setPhase('idle'); }}
                            variant="outline"
                            size="icon"
                            className="h-14 w-14 rounded-full border-white/20 hover:bg-white/10 text-white"
                        >
                            <Pause className="w-6 h-6" />
                        </Button>
                        <Button
                            onClick={() => { setCycles(0); setIsActive(false); setTimeout(() => setIsActive(true), 100); }}
                            variant="outline"
                            size="icon"
                            className="h-14 w-14 rounded-full border-white/20 hover:bg-white/10 text-white"
                        >
                            <RotateCcw className="w-6 h-6" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Stats */}
            {cycles > 0 && (
                <div className="absolute bottom-10 z-10 text-white/40 text-sm font-mono">
                    تم إكمال {cycles} دورات تنفس
                </div>
            )}
        </div>
    );
}
