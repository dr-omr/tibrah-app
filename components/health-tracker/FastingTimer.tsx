import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Utensils, Moon, Check, Clock, Bell, BellOff, ArrowLeftRight, Settings2, ChevronDown, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import { format, addHours } from 'date-fns';
import { ar } from 'date-fns/locale';
import { showNotification, requestNotificationPermission, isNotificationSupported } from '@/lib/pushNotifications';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [isPaused, setIsPaused] = useState(false);
    const [isFasting, setIsFasting] = useState(true);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [pausedElapsed, setPausedElapsed] = useState(0);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [showPlanSelector, setShowPlanSelector] = useState(false);
    const [lastNotificationHour, setLastNotificationHour] = useState(-1);
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
                    setIsPaused(state.isPaused || false);
                    setPausedElapsed(state.pausedElapsed || 0);
                    setNotificationsEnabled(state.notificationsEnabled !== false);
                }
            }
        }
    }, []);

    // Timer logic
    useEffect(() => {
        if (isActive && startTime && !isPaused) {
            intervalRef.current = setInterval(() => {
                const now = new Date();
                const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000) + pausedElapsed;
                setElapsedSeconds(elapsed);

                // Check if phase completed
                if (selectedPlan) {
                    const targetSeconds = isFasting
                        ? selectedPlan.fastingHours * 3600
                        : selectedPlan.eatingHours * 3600;

                    // Send hourly notification
                    const currentHour = Math.floor(elapsed / 3600);
                    if (notificationsEnabled && currentHour > lastNotificationHour && currentHour > 0 && elapsed < targetSeconds) {
                        const remainingHours = Math.floor((targetSeconds - elapsed) / 3600);
                        const remainingMinutes = Math.floor(((targetSeconds - elapsed) % 3600) / 60);

                        if (remainingHours > 0 || remainingMinutes >= 30) {
                            sendFastingNotification(
                                isFasting ? '🌙 تحديث الصيام' : '🍽️ تحديث فترة الأكل',
                                `متبقي ${remainingHours > 0 ? remainingHours + ' ساعة و ' : ''}${remainingMinutes} دقيقة`
                            );
                            setLastNotificationHour(currentHour);
                        }
                    }

                    // 30-minute warning
                    const remainingSeconds = targetSeconds - elapsed;
                    if (notificationsEnabled && remainingSeconds <= 1800 && remainingSeconds > 1795) {
                        sendFastingNotification(
                            isFasting ? '⏰ قاربت على الانتهاء!' : '⏰ فترة الأكل تنتهي قريباً!',
                            `متبقي 30 دقيقة فقط ${isFasting ? 'على انتهاء الصيام' : 'على بدء الصيام'}`
                        );
                    }

                    if (elapsed >= targetSeconds) {
                        // Switch phase
                        const newFasting = !isFasting;
                        setIsFasting(newFasting);
                        setStartTime(new Date());
                        setElapsedSeconds(0);
                        setPausedElapsed(0);
                        setLastNotificationHour(-1);

                        const message = newFasting
                            ? 'انتهت فترة الأكل! ابدأ الصيام 🌙'
                            : 'أكملت الصيام! يمكنك الأكل الآن 🍽️';

                        toast.success(message);

                        if (notificationsEnabled) {
                            sendFastingNotification(
                                newFasting ? '🌙 بدء فترة الصيام' : '🍽️ انتهى الصيام!',
                                message
                            );
                        }

                        // Save state
                        saveFastingState({
                            startTime: new Date().toISOString(),
                            planId: selectedPlan.id,
                            isFasting: newFasting,
                            isPaused: false,
                            pausedElapsed: 0,
                            notificationsEnabled
                        });
                    }
                }
            }, 1000);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, startTime, selectedPlan, isFasting, isPaused, pausedElapsed, notificationsEnabled, lastNotificationHour]);

    const saveFastingState = (state: any) => {
        localStorage.setItem('fastingState', JSON.stringify(state));
    };

    const sendFastingNotification = (title: string, body: string) => {
        if (isNotificationSupported() && Notification.permission === 'granted') {
            showNotification(title, {
                body,
                tag: 'fasting-timer',
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                vibrate: [200, 100, 200],
                silent: false,
                requireInteraction: false
            });
        }
    };

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

    const getEndTime = () => {
        if (!startTime || !selectedPlan) return null;
        const targetHours = isFasting ? selectedPlan.fastingHours : selectedPlan.eatingHours;
        const adjustedStart = new Date(startTime.getTime() - pausedElapsed * 1000);
        return addHours(adjustedStart, targetHours);
    };

    const startFasting = async (plan: FastingPlan) => {
        // Request notification permission
        if (notificationsEnabled) {
            await requestNotificationPermission();
        }

        setSelectedPlan(plan);
        setStartTime(new Date());
        setIsFasting(true);
        setIsActive(true);
        setIsPaused(false);
        setElapsedSeconds(0);
        setPausedElapsed(0);
        setLastNotificationHour(-1);

        saveFastingState({
            startTime: new Date().toISOString(),
            planId: plan.id,
            isFasting: true,
            isPaused: false,
            pausedElapsed: 0,
            notificationsEnabled
        });

        toast.success(`بدأ الصيام! تنتهي بعد ${plan.fastingHours} ساعة 🌙`);

        if (notificationsEnabled) {
            sendFastingNotification(
                '🌙 بدأ الصيام المتقطع',
                `خطة ${plan.name} - الصيام ${plan.fastingHours} ساعة`
            );
        }
    };

    const togglePause = () => {
        if (isPaused) {
            // Resume - create new start time accounting for elapsed
            setStartTime(new Date());
            setPausedElapsed(elapsedSeconds);
            setIsPaused(false);
            toast.info('تم استئناف المؤقت ▶️');
        } else {
            // Pause
            setIsPaused(true);
            toast.info('تم إيقاف المؤقت مؤقتاً ⏸️');
        }

        saveFastingState({
            startTime: new Date().toISOString(),
            planId: selectedPlan?.id,
            isFasting,
            isPaused: !isPaused,
            pausedElapsed: isPaused ? elapsedSeconds : elapsedSeconds,
            notificationsEnabled
        });
    };

    const switchPhase = () => {
        const newFasting = !isFasting;
        setIsFasting(newFasting);
        setStartTime(new Date());
        setElapsedSeconds(0);
        setPausedElapsed(0);
        setIsPaused(false);
        setLastNotificationHour(-1);

        saveFastingState({
            startTime: new Date().toISOString(),
            planId: selectedPlan?.id,
            isFasting: newFasting,
            isPaused: false,
            pausedElapsed: 0,
            notificationsEnabled
        });

        const message = newFasting ? 'بدأت فترة الصيام 🌙' : 'بدأت فترة الأكل 🍽️';
        toast.success(message);

        if (notificationsEnabled) {
            sendFastingNotification(
                newFasting ? '🌙 بدء فترة الصيام' : '🍽️ بدء فترة الأكل',
                message
            );
        }
    };

    const changePlan = (plan: FastingPlan) => {
        setSelectedPlan(plan);
        setShowPlanSelector(false);

        saveFastingState({
            startTime: startTime?.toISOString(),
            planId: plan.id,
            isFasting,
            isPaused,
            pausedElapsed,
            notificationsEnabled
        });

        toast.success(`تم تغيير الخطة إلى ${plan.name}`);
    };

    const stopFasting = () => {
        setIsActive(false);
        setSelectedPlan(null);
        setElapsedSeconds(0);
        setIsPaused(false);
        setPausedElapsed(0);
        setLastNotificationHour(-1);
        localStorage.removeItem('fastingState');
        toast('تم إنهاء الصيام');
    };

    const toggleNotifications = async () => {
        if (!notificationsEnabled) {
            const granted = await requestNotificationPermission();
            if (!granted) {
                toast.error('لم يتم منح إذن الإشعارات');
                return;
            }
        }

        const newValue = !notificationsEnabled;
        setNotificationsEnabled(newValue);

        if (selectedPlan) {
            saveFastingState({
                startTime: startTime?.toISOString(),
                planId: selectedPlan.id,
                isFasting,
                isPaused,
                pausedElapsed,
                notificationsEnabled: newValue
            });
        }

        toast.success(newValue ? 'تم تفعيل الإشعارات 🔔' : 'تم إيقاف الإشعارات 🔕');
    };

    const progress = getProgress();
    const remaining = getRemainingTime();
    const endTime = getEndTime();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-orange-500" />
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">الصيام المتقطع</h2>
                </div>
                {selectedPlan && (
                    <button
                        onClick={toggleNotifications}
                        className={`p-2 rounded-full transition-colors ${notificationsEnabled
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-700'
                            }`}
                    >
                        {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                    </button>
                )}
            </div>

            {/* Plan Selection */}
            {!selectedPlan && (
                <div className="space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-400">اختر خطة الصيام:</p>
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
                <div className={`rounded-3xl p-6 text-center relative overflow-hidden ${isFasting
                    ? 'bg-gradient-to-br from-indigo-900 to-purple-900 text-white'
                    : 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
                    }`}>

                    {/* Paused Indicator */}
                    {isPaused && (
                        <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                            ⏸️ متوقف مؤقتاً
                        </div>
                    )}

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
                            <span className={`text-3xl font-bold ${isPaused ? 'animate-pulse' : ''}`}>
                                {formatTime(elapsedSeconds)}
                            </span>
                            <span className="text-sm opacity-80">
                                متبقي: {formatTime(remaining)}
                            </span>
                        </div>
                    </div>

                    {/* Plan Info & End Time */}
                    <div className="space-y-1 mb-4">
                        <button
                            onClick={() => setShowPlanSelector(!showPlanSelector)}
                            className="inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100 transition-opacity"
                        >
                            خطة {selectedPlan.name}
                            <ChevronDown className={`w-4 h-4 transition-transform ${showPlanSelector ? 'rotate-180' : ''}`} />
                        </button>
                        {endTime && (
                            <p className="text-xs opacity-70">
                                ينتهي في {format(endTime, 'h:mm a', { locale: ar })}
                            </p>
                        )}
                    </div>

                    {/* Plan Selector Dropdown */}
                    {showPlanSelector && (
                        <div className="absolute left-4 right-4 top-full mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-2 z-10">
                            {FASTING_PLANS.map(plan => (
                                <button
                                    key={plan.id}
                                    onClick={() => changePlan(plan)}
                                    className={`w-full p-3 rounded-xl text-right transition-colors ${plan.id === selectedPlan.id
                                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                        }`}
                                >
                                    <span className="font-bold">{plan.name}</span>
                                    <span className="text-sm opacity-70 mr-2">{plan.description}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Controls */}
                    <div className="flex justify-center gap-2 flex-wrap">
                        {/* Pause/Resume Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={togglePause}
                            className="text-white hover:bg-white/10"
                        >
                            {isPaused ? (
                                <>
                                    <Play className="w-4 h-4 ml-1" />
                                    استئناف
                                </>
                            ) : (
                                <>
                                    <Pause className="w-4 h-4 ml-1" />
                                    إيقاف مؤقت
                                </>
                            )}
                        </Button>

                        {/* Switch Phase Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={switchPhase}
                            className="text-white hover:bg-white/10"
                        >
                            <ArrowLeftRight className="w-4 h-4 ml-1" />
                            {isFasting ? 'بدء الأكل' : 'بدء الصيام'}
                        </Button>

                        {/* End Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={stopFasting}
                            className="text-white/70 hover:text-white hover:bg-white/10"
                        >
                            <RotateCcw className="w-4 h-4 ml-1" />
                            إنهاء
                        </Button>
                    </div>
                </div>
            )}

            {/* Benefits */}
            {!selectedPlan && (
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4">
                    <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-2">فوائد الصيام المتقطع:</h4>
                    <ul className="text-sm text-orange-700 dark:text-orange-400 space-y-1">
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
