import React, { useState, useEffect, useRef } from 'react';
import { Wind, Play, Pause, RotateCcw, CheckCircle, Timer, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface BreathingPattern {
    id: string;
    name: string;
    description: string;
    inhale: number;
    hold1: number;
    exhale: number;
    hold2: number;
    cycles: number;
    color: string;
    bgGradient: string;
}

const BREATHING_PATTERNS: BreathingPattern[] = [
    {
        id: 'relaxing',
        name: 'تنفس استرخائي',
        description: 'يهدئ الجهاز العصبي ويقلل التوتر',
        inhale: 4,
        hold1: 7,
        exhale: 8,
        hold2: 0,
        cycles: 4,
        color: '#2D9B83',
        bgGradient: 'from-teal-500 to-emerald-600'
    },
    {
        id: 'box',
        name: 'تنفس الصندوق',
        description: 'يحسن التركيز والهدوء الذهني',
        inhale: 4,
        hold1: 4,
        exhale: 4,
        hold2: 4,
        cycles: 4,
        color: '#6366F1',
        bgGradient: 'from-indigo-500 to-purple-600'
    },
    {
        id: 'energizing',
        name: 'تنفس منشط',
        description: 'يعزز الطاقة واليقظة',
        inhale: 4,
        hold1: 0,
        exhale: 4,
        hold2: 0,
        cycles: 6,
        color: '#F59E0B',
        bgGradient: 'from-amber-500 to-orange-600'
    }
];

type Phase = 'inhale' | 'hold1' | 'exhale' | 'hold2' | 'done';

export default function BreathingExercises() {
    const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState<Phase>('inhale');
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentCycle, setCurrentCycle] = useState(1);
    const [circleScale, setCircleScale] = useState(1);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const getPhaseLabel = (phase: Phase): string => {
        switch (phase) {
            case 'inhale': return 'شهيق';
            case 'hold1': return 'احبس';
            case 'exhale': return 'زفير';
            case 'hold2': return 'احبس';
            case 'done': return 'انتهى!';
        }
    };

    const getPhaseDuration = (pattern: BreathingPattern, phase: Phase): number => {
        switch (phase) {
            case 'inhale': return pattern.inhale;
            case 'hold1': return pattern.hold1;
            case 'exhale': return pattern.exhale;
            case 'hold2': return pattern.hold2;
            default: return 0;
        }
    };

    const getNextPhase = (current: Phase): Phase => {
        if (current === 'inhale') return 'hold1';
        if (current === 'hold1') return 'exhale';
        if (current === 'exhale') return 'hold2';
        return 'inhale';
    };

    useEffect(() => {
        if (!isActive || !selectedPattern) return;

        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // Move to next phase
                    let nextPhase = getNextPhase(phase);
                    let nextDuration = getPhaseDuration(selectedPattern, nextPhase);

                    // Skip phases with 0 duration
                    while (nextDuration === 0 && nextPhase !== 'inhale') {
                        nextPhase = getNextPhase(nextPhase);
                        nextDuration = getPhaseDuration(selectedPattern, nextPhase);
                    }

                    // Check if cycle complete
                    if (nextPhase === 'inhale') {
                        if (currentCycle >= selectedPattern.cycles) {
                            setIsActive(false);
                            setPhase('done');
                            toast.success('أحسنت! أكملت التمرين 🎉');
                            return 0;
                        }
                        setCurrentCycle(c => c + 1);
                    }

                    setPhase(nextPhase);
                    return nextDuration;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, phase, selectedPattern, currentCycle]);

    // Animate circle based on phase
    useEffect(() => {
        if (phase === 'inhale') {
            setCircleScale(1.3);
        } else if (phase === 'exhale') {
            setCircleScale(1);
        }
    }, [phase]);

    const startExercise = (pattern: BreathingPattern) => {
        setSelectedPattern(pattern);
        setPhase('inhale');
        setTimeLeft(pattern.inhale);
        setCurrentCycle(1);
        setIsActive(true);
        setCircleScale(1);
    };

    const togglePause = () => {
        setIsActive(!isActive);
    };

    const resetExercise = () => {
        setIsActive(false);
        setPhase('inhale');
        setTimeLeft(selectedPattern?.inhale || 0);
        setCurrentCycle(1);
        setCircleScale(1);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-[#2D9B83]" />
                <h2 className="text-lg font-bold text-slate-800">تمارين التنفس</h2>
            </div>

            {/* Pattern Selection */}
            {!selectedPattern && (
                <div className="space-y-3">
                    {BREATHING_PATTERNS.map(pattern => (
                        <button
                            key={pattern.id}
                            onClick={() => startExercise(pattern)}
                            className={`w-full p-4 rounded-2xl bg-gradient-to-r ${pattern.bgGradient} text-white text-right transition-transform hover:scale-[1.02] active:scale-[0.98]`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-lg">{pattern.name}</h3>
                                    <p className="text-white/80 text-sm">{pattern.description}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-white/70">
                                        <span>شهيق: {pattern.inhale}ث</span>
                                        {pattern.hold1 > 0 && <span>حبس: {pattern.hold1}ث</span>}
                                        <span>زفير: {pattern.exhale}ث</span>
                                        <span>{pattern.cycles} دورات</span>
                                    </div>
                                </div>
                                <Play className="w-10 h-10 opacity-80" />
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Active Exercise */}
            {selectedPattern && (
                <div className="glass rounded-3xl p-6 text-center">
                    {/* Pattern Name */}
                    <h3 className="font-bold text-lg text-slate-700 mb-2">
                        {selectedPattern.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">
                        الدورة {currentCycle} من {selectedPattern.cycles}
                    </p>

                    {/* Breathing Circle */}
                    <div className="flex justify-center mb-6">
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            {/* Outer Ring */}
                            <div
                                className="absolute inset-0 rounded-full border-4 transition-all duration-1000"
                                style={{
                                    borderColor: selectedPattern.color,
                                    transform: `scale(${circleScale})`,
                                    opacity: 0.3
                                }}
                            />
                            {/* Inner Circle */}
                            <div
                                className="w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-1000"
                                style={{
                                    backgroundColor: selectedPattern.color,
                                    transform: `scale(${circleScale})`
                                }}
                            >
                                <span className="text-4xl font-bold text-white">
                                    {phase === 'done' ? '✓' : timeLeft}
                                </span>
                                <span className="text-white/80 text-sm">
                                    {getPhaseLabel(phase)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <p className="text-slate-600 mb-6">
                        {phase === 'inhale' && 'تنفس ببطء من أنفك...'}
                        {phase === 'hold1' && 'احبس نفسك بلطف...'}
                        {phase === 'exhale' && 'أخرج الهواء ببطء من فمك...'}
                        {phase === 'hold2' && 'انتظر قليلاً...'}
                        {phase === 'done' && 'تمرين رائع! تشعر بالهدوء الآن؟'}
                    </p>

                    {/* Controls */}
                    <div className="flex justify-center gap-4">
                        {phase !== 'done' && (
                            <>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={resetExercise}
                                    className="rounded-full w-12 h-12"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </Button>
                                <Button
                                    onClick={togglePause}
                                    className="rounded-full w-16 h-16"
                                    style={{ backgroundColor: selectedPattern.color }}
                                >
                                    {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                                </Button>
                            </>
                        )}
                        {phase === 'done' && (
                            <Button
                                onClick={() => setSelectedPattern(null)}
                                className="gradient-primary rounded-xl px-6"
                            >
                                <Sparkles className="w-4 h-4 ml-2" />
                                تمرين آخر
                            </Button>
                        )}
                    </div>

                    {/* Back Button */}
                    {phase === 'done' || !isActive ? (
                        <button
                            onClick={() => setSelectedPattern(null)}
                            className="mt-4 text-sm text-slate-500 hover:text-slate-700"
                        >
                            ← العودة للقائمة
                        </button>
                    ) : null}
                </div>
            )}

            {/* Benefits */}
            {!selectedPattern && (
                <div className="bg-slate-50 rounded-2xl p-4">
                    <h4 className="font-medium text-slate-700 mb-2">فوائد التنفس العميق:</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                        <li>• يقلل التوتر والقلق</li>
                        <li>• يحسن جودة النوم</li>
                        <li>• يعزز التركيز والوضوح الذهني</li>
                        <li>• ينشط الدورة الدموية</li>
                    </ul>
                </div>
            )}
        </div>
    );
}
