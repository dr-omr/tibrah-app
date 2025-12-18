import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Utensils, Moon, Check, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface FastingPlan {
    id: string;
    name: string;
    fastingHours: number;
    eatingHours: number;
    description: string;
}

const FASTING_PLANS: FastingPlan[] = [
    { id: '16-8', name: '16:8', fastingHours: 16, eatingHours: 8, description: 'الأكثر شيوعاً للمبتدئين' },
    { id: '18-6', name: '18:6', fastingHours: 18, eatingHours: 6, description: 'للمتوسطين' },
    { id: '20-4', name: '20:4', fastingHours: 20, eatingHours: 4, description: 'للمتقدمين' },
    { id: '14-10', name: '14:10', fastingHours: 14, eatingHours: 10, description: 'للمبتدئين' }
];

export default function FastingTimer() {
    const [selectedPlan, setSelectedPlan] = useState<FastingPlan | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [isFasting, setIsFasting] = useState(true);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Load saved state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('fastingState');
        if (saved) {
            const state = JSON.parse(saved);
            if (state.startTime && state.planId) {
                const plan = FASTING_PLANS.find(p => p.id === state.planId);
                if (plan) {
                    setSelectedPlan(plan);
                    setStartTime(new Date(state.startTime));
                    setIsFasting(state.isFasting);
                    setIsActive(true);
                }
            }
        }
    }, []);

    // Timer logic
    useEffect(() => {
        if (isActive && startTime) {
            intervalRef.current = setInterval(() => {
                const now = new Date();
                const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
                setElapsedSeconds(elapsed);

                // Check if phase completed
                if (selectedPlan) {
                    const targetSeconds = isFasting
                        ? selectedPlan.fastingHours * 3600
                        : selectedPlan.eatingHours * 3600;

                    if (elapsed >= targetSeconds) {
                        // Switch phase
                        const newFasting = !isFasting;
                        setIsFasting(newFasting);
                        setStartTime(new Date());
                        setElapsedSeconds(0);

                        if (newFasting) {
                            toast.success('انتهت فترة الأكل! ابدأ الصيام 🌙');
                        } else {
                            toast.success('أكملت الصيام! يمكنك الأكل الآن 🍽️');
                        }

                        // Save state
                        localStorage.setItem('fastingState', JSON.stringify({
                            startTime: new Date().toISOString(),
                            planId: selectedPlan.id,
                            isFasting: newFasting
                        }));
                    }
                }
            }, 1000);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, startTime, selectedPlan, isFasting]);

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const getProgress = () => {
        if (!selectedPlan) return 0;
        const targetSeconds = isFasting
            ? selectedPlan.fastingHours * 3600
            : selectedPlan.eatingHours * 3600;
        return Math.min((elapsedSeconds / targetSeconds) * 100, 100);
    };

    const getRemainingTime = () => {
        if (!selectedPlan) return 0;
        const targetSeconds = isFasting
            ? selectedPlan.fastingHours * 3600
            : selectedPlan.eatingHours * 3600;
        return Math.max(targetSeconds - elapsedSeconds, 0);
    };

    const startFasting = (plan: FastingPlan) => {
        setSelectedPlan(plan);
        setStartTime(new Date());
        setIsFasting(true);
        setIsActive(true);
        setElapsedSeconds(0);

        localStorage.setItem('fastingState', JSON.stringify({
            startTime: new Date().toISOString(),
            planId: plan.id,
            isFasting: true
        }));

        toast.success(`بدأ الصيام! تنتهي بعد ${plan.fastingHours} ساعة 🌙`);
    };

    const stopFasting = () => {
        setIsActive(false);
        setSelectedPlan(null);
        setElapsedSeconds(0);
        localStorage.removeItem('fastingState');
        toast('تم إيقاف الصيام');
    };

    const progress = getProgress();
    const remaining = getRemainingTime();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-bold text-slate-800">الصيام المتقطع</h2>
            </div>

            {/* Plan Selection */}
            {!selectedPlan && (
                <div className="space-y-3">
                    <p className="text-sm text-slate-600">اختر خطة الصيام:</p>
                    {FASTING_PLANS.map(plan => (
                        <button
                            key={plan.id}
                            onClick={() => startFasting(plan)}
                            className="w-full p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-right transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-xl">{plan.name}</h3>
                                    <p className="text-white/80 text-sm">{plan.description}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-white/70">
                                        <span className="flex items-center gap-1">
                                            <Moon className="w-3 h-3" />
                                            صيام: {plan.fastingHours}س
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Utensils className="w-3 h-3" />
                                            أكل: {plan.eatingHours}س
                                        </span>
                                    </div>
                                </div>
                                <Play className="w-10 h-10 opacity-80" />
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Active Timer */}
            {selectedPlan && (
                <div className={`rounded-3xl p-6 text-center ${isFasting
                        ? 'bg-gradient-to-br from-indigo-900 to-purple-900 text-white'
                        : 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
                    }`}>
                    {/* Phase Indicator */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        {isFasting ? (
                            <>
                                <Moon className="w-6 h-6" />
                                <span className="font-bold text-lg">فترة الصيام</span>
                            </>
                        ) : (
                            <>
                                <Utensils className="w-6 h-6" />
                                <span className="font-bold text-lg">فترة الأكل</span>
                            </>
                        )}
                    </div>

                    {/* Progress Ring */}
                    <div className="relative w-48 h-48 mx-auto mb-4">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="96" cy="96" r="88"
                                stroke="currentColor"
                                strokeOpacity={0.2}
                                strokeWidth={12}
                                fill="none"
                            />
                            <circle
                                cx="96" cy="96" r="88"
                                stroke="currentColor"
                                strokeWidth={12}
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 88}
                                strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
                                className="transition-all duration-1000"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold">{formatTime(elapsedSeconds)}</span>
                            <span className="text-sm opacity-80">
                                متبقي: {formatTime(remaining)}
                            </span>
                        </div>
                    </div>

                    {/* Plan Info */}
                    <p className="text-sm opacity-80 mb-4">
                        خطة {selectedPlan.name} • بدأ {format(startTime!, 'h:mm a', { locale: ar })}
                    </p>

                    {/* Controls */}
                    <div className="flex justify-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={stopFasting}
                            className="text-white hover:bg-white/10"
                        >
                            <RotateCcw className="w-4 h-4 ml-2" />
                            إنهاء
                        </Button>
                    </div>
                </div>
            )}

            {/* Benefits */}
            {!selectedPlan && (
                <div className="bg-orange-50 rounded-2xl p-4">
                    <h4 className="font-medium text-orange-800 mb-2">فوائد الصيام المتقطع:</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                        <li>• يحسن حساسية الأنسولين</li>
                        <li>• يعزز الالتهام الذاتي (تجديد الخلايا)</li>
                        <li>• يساعد في إنقاص الوزن</li>
                        <li>• يحسن التركيز والوضوح الذهني</li>
                    </ul>
                </div>
            )}
        </div>
    );
}
