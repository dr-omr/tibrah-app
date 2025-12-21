import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useAI } from '@/components/ai/useAI';
import {
    Droplets, Moon, Activity, Flame, Plus,
    Check, Loader2, Lightbulb, Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import AIContextAssistant from '@/components/ai/AIContextAssistant';
import { DOCTOR_KNOWLEDGE } from '@/components/ai/knowledge';

export default function HabitTracker({ metrics, dailyLogs, onUpdate }) {
    const [loading, setLoading] = useState(null);
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const { generateSuggestions } = useAI();

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
        return streakCount;
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

    // Move useEffect AFTER variable declarations
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

    // Handlers
    const addWater = async () => {
        setLoading('water');
        try {
            await db.entities.HealthMetric.create({
                metric_type: 'water_intake',
                value: 0.25, // 250ml cup
                unit: 'L',
                recorded_at: new Date().toISOString()
            });
            onUpdate();
            toast.success('تم تسجيل كوب ماء 💧');
        } catch (e) {
            toast.error('فشل التسجيل');
        } finally {
            setLoading(null);
        }
    };

    const logSleep = async (hours) => {
        setLoading('sleep');
        try {
            await db.entities.HealthMetric.create({
                metric_type: 'sleep_hours',
                value: hours,
                unit: 'hours',
                recorded_at: new Date().toISOString()
            });
            onUpdate();
            toast.success('تم تسجيل ساعات النوم 😴');
        } catch (e) {
            toast.error('فشل التسجيل');
        } finally {
            setLoading(null);
        }
    };

    const logExercise = async (minutes) => {
        setLoading('exercise');
        try {
            // Check if log exists for today
            const existingLog = dailyLogs.find(l => l.date === today);

            if (existingLog) {
                await db.entities.DailyLog.update(existingLog.id, {
                    exercise: { type: 'general', duration_minutes: minutes }
                });
            } else {
                await db.entities.DailyLog.create({
                    date: today,
                    exercise: { type: 'general', duration_minutes: minutes }
                });
            }
            onUpdate();
            toast.success('تم تسجيل النشاط الرياضي 💪');
        } catch (e) {
            toast.error('فشل التسجيل');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="glass rounded-3xl p-5 mb-6 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#2D9B83]/5 to-[#3FB39A]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            {/* Header & Streak */}
            <div className="flex items-center justify-between mb-6 relative">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#2D9B83]" />
                        العادات اليومية
                    </h2>
                    <p className="text-xs text-slate-500">تابع نشاطك وحافظ على السلسلة</p>
                </div>

                <div className="flex items-center gap-3 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100">
                    <div className="relative">
                        <Flame className={`w-5 h-5 ${streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-slate-300'}`} />
                        {streak > 3 && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        )}
                    </div>
                    <div className="text-center">
                        <span className="text-sm font-bold text-orange-600">{streak}</span>
                        <span className="text-[10px] text-orange-400 block -mt-1">أيام متتالية</span>
                    </div>
                </div>
            </div>

            {/* AI Coach Nudge */}
            {aiSuggestion && (
                <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 p-2 opacity-10">
                        <Sparkles className="w-20 h-20 text-amber-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-5 h-5 text-amber-500" />
                            <h3 className="font-bold text-amber-800">همسة المدرب الذكي</h3>
                        </div>
                        <p className="text-sm text-amber-900 font-medium mb-3 leading-relaxed">
                            "{aiSuggestion.focus_text}"
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {aiSuggestion.suggestions?.map((tip, idx) => (
                                <span key={idx} className="text-xs bg-white/60 px-2 py-1 rounded-lg text-amber-800 border border-amber-100 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> {tip}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6">
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

            {/* Habits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Water Habit */}
                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Droplets className="w-4 h-4 text-blue-500" />
                            </div>
                            <span className="font-medium text-slate-700">الماء</span>
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">
                            {todayWater} / 3 L
                        </span>
                    </div>

                    <Progress value={(todayWater / 3) * 100} className="h-2 bg-blue-100 mb-4" />

                    <Button
                        onClick={addWater}
                        disabled={loading === 'water'}
                        className="w-full bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 shadow-sm h-9 text-sm"
                    >
                        {loading === 'water' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />}
                        تسجيل كوب (250ml)
                    </Button>
                </div>

                {/* Sleep Habit */}
                <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <Moon className="w-4 h-4 text-indigo-500" />
                            </div>
                            <span className="font-medium text-slate-700">النوم</span>
                        </div>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-lg">
                            {todaySleep}h
                        </span>
                    </div>

                    <div className="flex gap-2 mb-2">
                        {[6, 7, 8].map(hours => (
                            <button
                                key={hours}
                                onClick={() => logSleep(hours)}
                                disabled={loading === 'sleep'}
                                className={`flex-1 h-8 rounded-lg text-xs font-medium transition-colors ${todaySleep === hours
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
                                    }`}
                            >
                                {hours}h
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => logSleep(todaySleep + 1)}
                        className="w-full text-xs text-indigo-400 hover:text-indigo-600 h-6"
                    >
                        تعديل يدوي
                    </Button>
                </div>

                {/* Exercise Habit */}
                <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <Activity className="w-4 h-4 text-emerald-500" />
                            </div>
                            <span className="font-medium text-slate-700">الرياضة</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">
                            {todayExercise} دقيقة
                        </span>
                    </div>

                    <div className="flex gap-2 mb-1">
                        {[15, 30, 45].map(mins => (
                            <button
                                key={mins}
                                onClick={() => logExercise(mins)}
                                disabled={loading === 'exercise'}
                                className={`flex-1 h-8 rounded-lg text-xs font-medium transition-colors ${todayExercise === mins
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50'
                                    }`}
                            >
                                {mins}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}