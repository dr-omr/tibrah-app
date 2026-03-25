import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import {
    Droplets, Moon, Pill, Heart, Brain, Footprints,
    TrendingUp, ChevronLeft, Sparkles, Calendar, Activity,
    Flame, Scale, Zap, Thermometer, Timer, Plus, Target,
    ChevronDown, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import AppleHealthRings from './AppleHealthRings';
import { Button } from '@/components/ui/button';
import { WaterWidget } from '@/components/dashboard/widgets/WaterWidget';
import { MedicationWidget } from '@/components/dashboard/widgets/MedicationWidget';
import { MoodWidget } from '@/components/dashboard/widgets/MoodWidget';

interface HealthSummaryProps {
    className?: string;
}

interface MetricCard {
    id: string;
    title: string;
    value: string | number;
    unit: string;
    icon: React.ElementType;
    tintBg: string;
    tintColor: string;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
    href?: string;
}

export default function HealthSummary({ className = '' }: HealthSummaryProps) {
    const { user } = useAuth();
    const today = format(new Date(), 'yyyy-MM-dd');
    const [showAllMetrics, setShowAllMetrics] = useState(false);

    // Fetch today's data
    const { data: waterLog, refetch: refetchWater } = useQuery({
        queryKey: ['waterLog', today, user?.id],
        queryFn: async () => {
            try {
                const logs = await db.entities.WaterLog.filter({ date: today, user_id: user?.id });
                return logs?.[0] || { glasses: 0, goal: 8 };
            } catch { return { glasses: 0, goal: 8 }; }
        },
        enabled: !!user?.id,
    });

    const { data: sleepLog } = useQuery({
        queryKey: ['sleepLogLast', user?.id],
        queryFn: async () => {
            try {
                const logs = await db.entities.SleepLog.listForUser(user?.id || '', '-date', 1);
                return logs?.[0] || null;
            } catch { return null; }
        },
        enabled: !!user?.id,
    });

    const { data: medicationLogs = [], refetch: refetchMedLogs } = useQuery({
        queryKey: ['medicationLogsToday', today, user?.id],
        queryFn: async () => {
            try {
                const logs = await db.entities.MedicationLog.filter({
                    taken_at: { $gte: today }, user_id: user?.id
                });
                return logs || [];
            } catch { return []; }
        },
        enabled: !!user?.id,
    });

    const { data: medications = [] } = useQuery({
        queryKey: ['medicationsActive', user?.id],
        queryFn: async () => {
            try {
                const meds = await db.entities.Medication.filter({ is_active: true, user_id: user?.id });
                return meds || [];
            } catch { return []; }
        },
        enabled: !!user?.id,
    });

    const { data: dailyLog, refetch: refetchDaily } = useQuery({
        queryKey: ['dailyLog', today, user?.id],
        queryFn: async () => {
            try {
                const logs = await db.entities.DailyLog.filter({ date: today, user_id: user?.id });
                return logs?.[0] || null;
            } catch { return null; }
        },
        enabled: !!user?.id,
    });

    const { data: healthMetrics = [] } = useQuery({
        queryKey: ['healthMetricsRecent', user?.id],
        queryFn: async () => {
            try {
                const metrics = await db.entities.HealthMetric.listForUser(user?.id || '', '-recorded_at', 10);
                return metrics || [];
            } catch { return []; }
        },
        enabled: !!user?.id,
    });

    // Calculate values with proper type casting
    const waterGlasses = Number(waterLog?.glasses) || 0;
    const waterGoal = Number(waterLog?.goal) || 8;
    const waterPercentage = Math.round((waterGlasses / waterGoal) * 100);

    const sleepHours = Number(sleepLog?.duration_hours) || 0;
    const sleepQuality = Number(sleepLog?.quality) || 0;
    const sleepPercentage = sleepHours >= 7 ? 100 : Math.round((sleepHours / 7) * 100);

    const totalMeds = (medications as Array<{ times?: string[] }>).reduce((sum: number, med) =>
        sum + (med.times?.length || 0), 0);
    const takenMeds = (medicationLogs as unknown[]).length;
    const medPercentage = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 0;

    const moodScore = Number(dailyLog?.mood_score) || 0;
    const energyLevel = Number(dailyLog?.energy_level) || 0;
    const stressLevel = Number(dailyLog?.stress_level) || 0;

    // Get latest metrics with proper typing
    const getMetricValue = (type: string): string | number | null => {
        const metric = (healthMetrics as Array<{ metric_type?: string; value?: unknown }>)
            .find(m => m.metric_type === type);
        return metric?.value as string | number | null;
    };

    const heartRate = getMetricValue('heart_rate') ?? '—';
    const steps = Number(getMetricValue('steps')) || 0;
    const weight = getMetricValue('weight') ?? '—';
    const calories = Number(getMetricValue('calories')) || 0;
    const bloodPressure = getMetricValue('blood_pressure') ?? '—';

    // Activity Rings calculations
    const moveProgress = Math.min(100, (Number(calories) / 500) * 100);
    const exerciseProgress = energyLevel * 20;
    const standProgress = sleepPercentage > 50 ? 75 : 50;

    // Overall daily completion
    const overallCompletion = Math.round((waterPercentage + sleepPercentage + medPercentage) / 3);

    const latestEmotionalDiagnostic = (dailyLog as any)?.emotional_diagnostic;

    // Additional health metrics
    const additionalCards: MetricCard[] = [
        {
            id: 'heart_rate', title: 'نبضات القلب', value: heartRate, unit: 'نبضة/دقيقة',
            icon: Heart, tintBg: 'bg-red-100/80 dark:bg-red-900/20', tintColor: 'text-red-500',
        },
        {
            id: 'steps', title: 'الخطوات', value: Number(steps).toLocaleString(), unit: 'خطوة',
            icon: Footprints, tintBg: 'bg-green-100/80 dark:bg-green-900/20', tintColor: 'text-green-500',
        },
        {
            id: 'calories', title: 'السعرات', value: Number(calories) || '—', unit: 'سعرة حرارية',
            icon: Flame, tintBg: 'bg-orange-100/80 dark:bg-orange-900/20', tintColor: 'text-orange-500',
        },
        {
            id: 'weight', title: 'الوزن', value: weight, unit: 'كجم',
            icon: Scale, tintBg: 'bg-blue-100/80 dark:bg-blue-900/20', tintColor: 'text-blue-500',
        },
        {
            id: 'energy', title: 'الطاقة',
            value: energyLevel > 0 ? `${energyLevel * 20}%` : '—',
            unit: energyLevel > 0 ? ['منخفضة', 'ضعيفة', 'متوسطة', 'جيدة', 'عالية'][energyLevel - 1] || '' : 'سجّل طاقتك',
            icon: Zap, tintBg: 'bg-yellow-100/80 dark:bg-yellow-900/20', tintColor: 'text-yellow-500',
        },
        {
            id: 'stress', title: 'التوتر',
            value: stressLevel > 0 ? `${stressLevel}/5` : '—',
            unit: stressLevel > 0 ? ['مرتاح', 'خفيف', 'متوسط', 'عالي', 'شديد'][stressLevel - 1] || '' : 'سجّل توترك',
            icon: Activity, tintBg: 'bg-teal-100/80 dark:bg-teal-900/20', tintColor: 'text-teal-500',
        }
    ];

    const displayCards = showAllMetrics ? additionalCards : [];

    // Daily goal progress bars config
    const goalBars = [
        { emoji: '💧', label: 'الماء', value: waterPercentage, color: 'from-cyan-400 to-blue-500' },
        { emoji: '🌙', label: 'النوم', value: sleepPercentage, color: 'from-indigo-400 to-purple-500' },
        { emoji: '💊', label: 'الأدوية', value: medPercentage, color: 'from-rose-400 to-pink-500' },
    ];

    return (
        <div className={`space-y-4 ${className}`}>
            {/* ─── Section Header ─── */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">ملخص صحتك</h2>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{format(new Date(), 'EEEE d MMMM', { locale: ar })}</span>
                </div>
            </div>

            {/* ─── Activity Rings ─── */}
            <AppleHealthRings
                moveProgress={moveProgress}
                exerciseProgress={exerciseProgress}
                standProgress={standProgress}
                moveGoal={500}
                exerciseGoal={30}
                standGoal={12}
                currentMove={Number(calories) || 0}
                currentExercise={energyLevel > 0 ? energyLevel * 6 : 0}
                currentStand={sleepHours >= 7 ? 10 : Math.round(Number(sleepHours) || 0)}
            />

            {/* ─── Daily Goals Card ─── */}
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">أهداف اليوم</h3>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${overallCompletion >= 80
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : overallCompletion >= 40
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                        }`}>
                        {overallCompletion}% مكتمل
                    </span>
                </div>

                {/* Progress bars */}
                <div className="space-y-2.5">
                    {goalBars.map((bar) => (
                        <div key={bar.label} className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-600 dark:text-slate-400 font-medium">{bar.emoji} {bar.label}</span>
                                <span className="font-semibold text-slate-500">{bar.value}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${bar.color} rounded-full transition-all duration-500`}
                                    style={{ width: `${Math.min(bar.value, 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── Emotional Diagnostic Daily Protocol ─── */}
            {latestEmotionalDiagnostic && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800/40 shadow-sm overflow-hidden mb-4">
                    <div className="bg-indigo-100/50 dark:bg-indigo-800/30 px-4 py-3 border-b border-indigo-100 dark:border-indigo-800/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <h3 className="text-[13px] font-bold text-indigo-900 dark:text-indigo-100">هدف التعافي النفس-جسدي اليوم</h3>
                        </div>
                        <span className="text-[10px] font-bold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full shadow-sm">
                            متابعة مستمرة
                        </span>
                    </div>
                    <div className="p-4 space-y-3">
                        <p className="text-[13px] text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold ml-1">بؤرة التركيز:</span>
                            العمل على فك الارتباط بين النمط الشعوري ({latestEmotionalDiagnostic.emotional_diagnostic_pattern || latestEmotionalDiagnostic.psychosomatic_dimension}) والشكوى العضوية ({latestEmotionalDiagnostic.physical_complaint}).
                        </p>
                        
                        <div className="bg-white/60 dark:bg-slate-800/50 rounded-xl p-3 border border-white dark:border-slate-700 shadow-sm flex items-start gap-2.5">
                            <Activity className="w-4 h-4 text-emerald-500 mt-0.5" />
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                مراقبة ذاتية: راقب اليوم أي محفزات شعورية تسبق ظهور الخلل العضوي، وحاول ممارسة تقنيات التنظيم العصبي لدقيقتين عند كل محفز.
                            </p>
                        </div>

                        {latestEmotionalDiagnostic.repeated_pattern_flag && (
                            <div className="flex items-start gap-2 mt-1 bg-rose-50 dark:bg-rose-900/20 px-3 py-2 rounded-xl border border-rose-100 dark:border-rose-800/30">
                                <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5" />
                                <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400 leading-relaxed">
                                    تذكير سريري: سيتم مناقشة تكرار هذا النمط مع الطبيب في الجلسة القادمة لتقييم مدى التشافي جذرياً.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── Health Widgets Grid ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Interactive Widgets */}
                <WaterWidget
                    initialGlasses={Number(waterLog?.glasses) || 0}
                    goal={Number(waterLog?.goal) || 8}
                    logId={waterLog?.id}
                    onUpdate={refetchWater}
                />

                <MedicationWidget
                    medications={medications as any[]}
                    logs={medicationLogs as any[]}
                    onUpdate={refetchMedLogs}
                />

                {/* Sleep Card */}
                <Link href="/health-tracker?tab=sleep">
                    <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-700/50 hover:shadow-md transition-shadow cursor-pointer h-full">
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100/80 dark:bg-indigo-900/20 flex items-center justify-center">
                                <Moon className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div className="flex items-center gap-1 text-xs text-indigo-500 font-semibold">
                                <TrendingUp className="w-3 h-3" />
                                <span>{sleepPercentage}%</span>
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-white mb-0.5">{sleepHours.toFixed(1)}</div>
                        <div className="text-xs text-slate-400 font-medium">ساعات نوم</div>
                    </div>
                </Link>

                {/* Mood Widget */}
                <MoodWidget
                    currentMood={Number(dailyLog?.mood_score)}
                    logId={dailyLog?.id}
                    onUpdate={refetchDaily}
                />

                {/* Additional Metrics (expanded) */}
                {displayCards.map(card => {
                    const Icon = card.icon;
                    const content = (
                        <div
                            key={card.id}
                            className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-700/50 hover:shadow-md transition-shadow cursor-pointer h-full"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl ${card.tintBg} flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${card.tintColor}`} />
                                </div>
                                {card.trend && (
                                    <div className={`flex items-center gap-1 text-xs font-semibold ${card.trend === 'up' ? 'text-green-500' :
                                        card.trend === 'down' ? 'text-red-500' :
                                            'text-amber-500'
                                        }`}>
                                        <TrendingUp className={`w-3 h-3 ${card.trend === 'down' ? 'rotate-180' : ''}`} />
                                        {card.trendValue && <span>{card.trendValue}</span>}
                                    </div>
                                )}
                            </div>
                            <div className="text-2xl font-bold text-slate-800 dark:text-white mb-0.5">{card.value}</div>
                            <div className="text-xs text-slate-400 font-medium">{card.unit}</div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{card.title}</span>
                                <ChevronLeft className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                            </div>
                        </div>
                    );

                    return card.href ? (
                        <Link key={card.id} href={card.href}>{content}</Link>
                    ) : content;
                })}
            </div>

            {/* ─── Show More Button ─── */}
            <button
                className="flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-semibold text-primary hover:bg-primary/5 rounded-xl transition-colors"
                onClick={() => setShowAllMetrics(!showAllMetrics)}
            >
                <ChevronDown className={`w-4 h-4 transition-transform ${showAllMetrics ? 'rotate-180' : ''}`} />
                {showAllMetrics ? 'إخفاء المقاييس الإضافية' : 'عرض المزيد من المقاييس'}
            </button>

            {/* ─── Daily Tip ─── */}
            <div className="bg-amber-50/80 dark:bg-amber-900/15 rounded-2xl p-4 border border-amber-100/50 dark:border-amber-800/20">
                <div className="flex items-center gap-3 text-sm">
                    <span className="text-xl">💡</span>
                    <div className="flex-1">
                        <p className="font-semibold text-slate-700 dark:text-slate-200 text-xs">نصيحة اليوم</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 leading-relaxed">
                            {waterGlasses < 4 ? 'اشرب المزيد من الماء للحفاظ على نشاطك' :
                                sleepHours < 6 ? 'حاول النوم مبكراً الليلة للحصول على راحة أفضل' :
                                    moodScore < 3 ? 'جرب تمارين التنفس لتحسين مزاجك 🧘' :
                                        'استمر في نمط حياتك الصحي! 🌟'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
