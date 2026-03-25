import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { useAI } from '@/components/ai/useAI';
import {
    Droplets, Moon, Activity, Flame, Plus,
    Check, Loader2, Lightbulb, Sparkles, Wind, Pill, Gift
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import AIContextAssistant from '@/components/ai/AIContextAssistant';
import { DOCTOR_KNOWLEDGE } from '@/components/ai/knowledge';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';

export default function HabitTracker({ metrics, dailyLogs, onUpdate }) {
    const [loading, setLoading] = useState(null);
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const { generateSuggestions } = useAI();
    const { user } = useAuth();
    const userId = user?.id;

    // Calculate Streak
    const calculateStreak = () => {
        let streakCount = 0;
        const todayDate = new Date();

        for (let i = 0; i < 30; i++) {
            const date = subDays(todayDate, i);
            const hasLog = dailyLogs.some(log => isSameDay(parseISO(log.date), date)) ||
                metrics.some(m => isSameDay(parseISO(m.recorded_at), date));

            if (hasLog) streakCount++;
            else if (i > 0) break; // Break if missed a day (allow today to be empty)
        }
        return Math.max(streakCount, 3); // Mock minimum 3 for demo gamification
    };

    const streak = calculateStreak();

    // Get today's data
    const today = format(new Date(), 'yyyy-MM-dd');

    const todayWater = metrics
        .filter(m => m.metric_type === 'water_intake' && m.recorded_at.startsWith(today))
        .reduce((acc, curr) => acc + curr.value, 0);

    const todaySleep = metrics
        .find(m => m.metric_type === 'sleep_hours' && m.recorded_at.startsWith(today))?.value || 0;

    const todayExercise = dailyLogs
        .find(l => l.date === today)?.exercise?.duration_minutes || 0;

    const todayBreathing = metrics
        .filter(m => m.metric_type === 'breathing_minutes' && m.recorded_at.startsWith(today))
        .reduce((acc, curr) => acc + curr.value, 0);

    const todayMeds = metrics
        .filter(m => m.metric_type === 'medication_taken' && m.recorded_at.startsWith(today))
        .reduce((acc, curr) => acc + curr.value, 0);

    // AI suggestion fetch logic
    React.useEffect(() => {
        const fetchSuggestion = async () => {
            const suggestion = await generateSuggestions({
                todayWater, todaySleep, todayExercise, streak,
                recentLogs: dailyLogs.slice(0, 3)
            });
            if (suggestion) setAiSuggestion(suggestion);
        };
        fetchSuggestion();
    }, [todayWater, todaySleep, todayExercise, generateSuggestions, dailyLogs, streak]);

    // Handlers with Gamification
    const notifyReward = (habitName, points) => {
        haptic.success();
        uiSounds.success();
        toast.success(
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Gift className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                    <p className="font-bold text-slate-800 dark:text-white">أحسنت! {habitName}</p>
                    <p className="text-xs text-amber-600 font-bold">+{points} نقطة مكافأة</p>
                </div>
            </div>
        );
    };

    const addWater = async () => {
        setLoading('water');
        try {
            await db.entities.HealthMetric.createForUser(userId || '', {
                metric_type: 'water_intake',
                value: 0.25, // 250ml cup
                unit: 'L',
                recorded_at: new Date().toISOString()
            });
            onUpdate();
            notifyReward('تم تسجيل كوب ماء 💧', 5);
        } catch (e) {
            toast.error('فشل التسجيل');
        } finally {
            setLoading(null);
        }
    };

    const logSleep = async (hours) => {
        setLoading('sleep');
        try {
            await db.entities.HealthMetric.createForUser(userId || '', {
                metric_type: 'sleep_hours',
                value: hours,
                unit: 'hours',
                recorded_at: new Date().toISOString()
            });
            onUpdate();
            notifyReward('تم تسجيل ساعات النوم 😴', 10);
        } catch (e) {
            toast.error('فشل التسجيل');
        } finally {
            setLoading(null);
        }
    };

    const logExercise = async (minutes) => {
        setLoading('exercise');
        try {
            const existingLog = dailyLogs.find(l => l.date === today);
            if (existingLog) {
                await db.entities.DailyLog.update(existingLog.id, {
                    exercise: { type: 'general', duration_minutes: minutes }
                });
            } else {
                await db.entities.DailyLog.createForUser(userId || '', {
                    date: today,
                    exercise: { type: 'general', duration_minutes: minutes }
                });
            }
            onUpdate();
            notifyReward('بطل! تم تسجيل نشاطك الرياضي 💪', 15);
        } catch (e) {
            toast.error('فشل التسجيل');
        } finally {
            setLoading(null);
        }
    };

    const logBreathing = async () => {
        setLoading('breathing');
        try {
            await db.entities.HealthMetric.createForUser(userId || '', {
                metric_type: 'breathing_minutes',
                value: 5,
                unit: 'minutes',
                recorded_at: new Date().toISOString()
            });
            onUpdate();
            notifyReward('جلسة تنفس ممتازة 🌬️', 10);
        } catch (e) {
            toast.error('فشل التسجيل');
        } finally {
            setLoading(null);
        }
    };

    const logMedication = async () => {
        setLoading('meds');
        try {
            await db.entities.HealthMetric.createForUser(userId || '', {
                metric_type: 'medication_taken',
                value: 1,
                unit: 'dose',
                recorded_at: new Date().toISOString()
            });
            onUpdate();
            notifyReward('تم أخذ المكملات الغذائية 💊', 10);
        } catch (e) {
            toast.error('فشل التسجيل');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-5 rounded-3xl shadow-[var(--shadow-card)] mb-6 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-primary-light/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            {/* Header & Streak */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        لوحة المهام اليومية
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">أكمل مهامك لجمع النقاط والحفاظ على حماسك</p>
                </div>

                <div className="flex items-center gap-3 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 px-3 py-1.5 rounded-2xl border border-orange-100 dark:border-orange-900/50 shadow-sm">
                    <div className="relative">
                        <Flame className={`w-5 h-5 ${streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-slate-300'}`} />
                        {streak > 3 && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                        )}
                    </div>
                    <div className="text-center">
                        <span className="text-sm font-black text-orange-600 dark:text-orange-400">{streak}</span>
                        <span className="text-[10px] text-orange-400 dark:text-orange-500 block -mt-1 font-bold">أيام نار</span>
                    </div>
                </div>
            </div>

            {/* AI Coach Nudge */}
            {aiSuggestion && (
                <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-4 border border-amber-100/50 dark:border-amber-700/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 p-2 opacity-10">
                        <Sparkles className="w-20 h-20 text-amber-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-5 h-5 text-amber-500" />
                            <h3 className="font-bold text-amber-800 dark:text-amber-400">همسة المدرب الذكي</h3>
                        </div>
                        <p className="text-sm text-amber-900 dark:text-amber-100 font-medium mb-3 leading-relaxed">
                            "{aiSuggestion.focus_text}"
                        </p>
                    </div>
                </div>
            )}

            {/* Habits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                {/* 1. Medication Habit */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100/60 dark:border-slate-700/50">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-violet-100/80 dark:bg-violet-900/30 flex items-center justify-center">
                                <Pill className="w-4.5 h-4.5 text-violet-500" />
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-200">المكملات</span>
                        </div>
                        {todayMeds > 0 ? (
                            <span className="text-xs font-bold text-violet-600 bg-violet-100 dark:bg-violet-900/50 dark:text-violet-300 px-2 py-1 rounded-lg flex items-center gap-1">
                                <Check className="w-3 h-3" /> تم
                            </span>
                        ) : (
                            <span className="text-[10px] font-bold text-slate-400">+10 نقاط</span>
                        )}
                    </div>
                    <Button
                        onClick={logMedication}
                        disabled={loading === 'meds' || todayMeds > 0}
                        variant={todayMeds > 0 ? "secondary" : "outline"}
                        className={`w-full h-10 rounded-xl text-sm font-semibold transition-all ${todayMeds > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 shadow-sm'}`}
                    >
                        {loading === 'meds' ? <Loader2 className="w-4 h-4 animate-spin" /> : (todayMeds > 0 ? 'مكتمل' : 'تسجيل الأخذ')}
                    </Button>
                </div>

                {/* 2. Water Habit */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100/60 dark:border-slate-700/50">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-blue-100/80 dark:bg-blue-900/30 flex items-center justify-center">
                                <Droplets className="w-4.5 h-4.5 text-blue-500" />
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-200">شرب الماء</span>
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-1 rounded-lg">
                            {todayWater} / 3 L
                        </span>
                    </div>
                    <Progress value={Math.min((todayWater / 3) * 100, 100)} className="h-2 bg-blue-100 dark:bg-slate-800 mb-3" />
                    <Button
                        onClick={addWater}
                        disabled={loading === 'water'}
                        variant="outline"
                        className="w-full h-10 rounded-xl text-sm font-semibold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 shadow-sm"
                    >
                        {loading === 'water' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-3.5 h-3.5 ml-1" />}
                        كوب (250ml)
                    </Button>
                </div>

                {/* 3. Breathing Habit */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100/60 dark:border-slate-700/50">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-teal-100/80 dark:bg-teal-900/30 flex items-center justify-center">
                                <Wind className="w-4.5 h-4.5 text-teal-500" />
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-200">التنفس العميق</span>
                        </div>
                        {todayBreathing > 0 ? (
                            <span className="text-xs font-bold text-teal-600 bg-teal-100 dark:bg-teal-900/50 dark:text-teal-300 px-2 py-1 rounded-lg flex items-center gap-1">
                                <Check className="w-3 h-3" /> تم
                            </span>
                        ) : (
                            <span className="text-[10px] font-bold text-slate-400">+10 نقاط</span>
                        )}
                    </div>
                    <Button
                        onClick={logBreathing}
                        disabled={loading === 'breathing'}
                        variant="outline"
                        className="w-full h-10 rounded-xl text-sm font-semibold hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 shadow-sm"
                    >
                        {loading === 'breathing' ? <Loader2 className="w-4 h-4 animate-spin" /> : (todayBreathing > 0 ? `تم (${todayBreathing} دقيقة)` : 'جلسة ٥ دقائق')}
                    </Button>
                </div>

                {/* 4. Sleep Habit */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100/60 dark:border-slate-700/50">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-indigo-100/80 dark:bg-indigo-900/30 flex items-center justify-center">
                                <Moon className="w-4.5 h-4.5 text-indigo-500" />
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-200">النوم</span>
                        </div>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-1 rounded-lg">
                            {todaySleep}h
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {[6, 7, 8].map(hours => (
                            <button
                                key={hours}
                                onClick={() => logSleep(hours)}
                                disabled={loading === 'sleep'}
                                className={`flex-1 h-9 rounded-xl text-sm font-bold transition-all shadow-sm ${todaySleep === hours
                                    ? 'bg-indigo-500 text-white shadow-indigo-500/20'
                                    : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100/60 dark:border-indigo-800/50 hover:bg-indigo-50'
                                    }`}
                            >
                                {hours}h
                            </button>
                        ))}
                    </div>
                </div>

                {/* 5. Exercise Habit */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100/60 dark:border-slate-700/50">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/30 flex items-center justify-center">
                                <Activity className="w-4.5 h-4.5 text-emerald-500" />
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-200">الرياضة</span>
                        </div>
                        {todayExercise > 0 ? (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300 px-2 py-1 rounded-lg">
                                {todayExercise} دقيقة
                            </span>
                        ) : (
                            <span className="text-[10px] font-bold text-slate-400">+15 نقطة</span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {[15, 30, 45].map(mins => (
                            <button
                                key={mins}
                                onClick={() => logExercise(mins)}
                                disabled={loading === 'exercise'}
                                className={`flex-1 h-9 rounded-xl text-sm font-bold transition-all shadow-sm ${todayExercise === mins
                                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                    : 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-emerald-100/60 dark:border-emerald-800/50 hover:bg-emerald-50'
                                    }`}
                            >
                                {mins} د
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="mt-4">
                <AIContextAssistant
                    contextType="habits"
                    contextData={{
                        todayWater,
                        todaySleep,
                        todayExercise,
                        streak
                    }}
                    knowledgeBase={DOCTOR_KNOWLEDGE}
                    title="مساعد العادات الصحية - اسألني"
                />
            </div>
        </div>
    );
}