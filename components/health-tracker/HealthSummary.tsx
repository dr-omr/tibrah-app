import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import {
    Droplets, Moon, Pill, Heart, Brain, Footprints,
    TrendingUp, ChevronLeft, Sparkles, Calendar, Activity,
    Flame, Scale, Zap, Thermometer, Timer, Plus, Target
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
    color: string;
    bgColor: string;
    gradientFrom: string;
    gradientTo: string;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
    href?: string;
}

export default function HealthSummary({ className = '' }: HealthSummaryProps) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const [showAllMetrics, setShowAllMetrics] = useState(false);

    // Fetch today's data
    const { data: waterLog, refetch: refetchWater } = useQuery({
        queryKey: ['waterLog', today],
        queryFn: async () => {
            try {
                const logs = await db.entities.WaterLog.filter({ date: today });
                return logs?.[0] || { glasses: 0, goal: 8 };
            } catch { return { glasses: 0, goal: 8 }; }
        },
    });

    const { data: sleepLog } = useQuery({
        queryKey: ['sleepLogLast'],
        queryFn: async () => {
            try {
                const logs = await db.entities.SleepLog.list('-date', 1);
                return logs?.[0] || null;
            } catch { return null; }
        },
    });

    const { data: medicationLogs = [], refetch: refetchMedLogs } = useQuery({
        queryKey: ['medicationLogsToday', today],
        queryFn: async () => {
            try {
                const logs = await db.entities.MedicationLog.filter({
                    taken_at: { $gte: today }
                });
                return logs || [];
            } catch { return []; }
        },
    });

    const { data: medications = [] } = useQuery({
        queryKey: ['medicationsActive'],
        queryFn: async () => {
            try {
                const meds = await db.entities.Medication.filter({ is_active: true });
                return meds || [];
            } catch { return []; }
        },
    });

    const { data: dailyLog, refetch: refetchDaily } = useQuery({
        queryKey: ['dailyLog', today],
        queryFn: async () => {
            try {
                const logs = await db.entities.DailyLog.filter({ date: today });
                return logs?.[0] || null;
            } catch { return null; }
        },
    });

    const { data: healthMetrics = [] } = useQuery({
        queryKey: ['healthMetricsRecent'],
        queryFn: async () => {
            try {
                const metrics = await db.entities.HealthMetric.list('-recorded_at', 10);
                return metrics || [];
            } catch { return []; }
        },
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
    const exerciseProgress = energyLevel * 20; // Using energy as proxy for exercise
    const standProgress = sleepPercentage > 50 ? 75 : 50;

    // Primary cards (always visible)
    // NOTE: We now use interactive widgets for Water, Meds, and Mood.
    // Sleep remains as a card for now.

    const sleepCard: MetricCard = {
        id: 'sleep',
        title: 'النوم',
        value: sleepHours.toFixed(1),
        unit: 'ساعات',
        icon: Moon,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10',
        gradientFrom: 'from-indigo-400',
        gradientTo: 'to-purple-500',
        trend: sleepHours >= 7 ? 'up' : sleepHours >= 5 ? 'stable' : 'down',
        href: '/health-tracker?tab=sleep'
    };
    // Additional health metrics
    const additionalCards: MetricCard[] = [
        {
            id: 'heart_rate',
            title: 'نبضات القلب',
            value: heartRate,
            unit: 'نبضة/دقيقة',
            icon: Heart,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
            gradientFrom: 'from-red-400',
            gradientTo: 'to-rose-500',
        },
        {
            id: 'steps',
            title: 'الخطوات',
            value: Number(steps).toLocaleString(),
            unit: 'خطوة',
            icon: Footprints,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
            gradientFrom: 'from-green-400',
            gradientTo: 'to-emerald-500',
        },
        {
            id: 'calories',
            title: 'السعرات',
            value: Number(calories) || '—',
            unit: 'سعرة حرارية',
            icon: Flame,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
            gradientFrom: 'from-orange-400',
            gradientTo: 'to-amber-500',
        },
        {
            id: 'weight',
            title: 'الوزن',
            value: weight,
            unit: 'كجم',
            icon: Scale,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
            gradientFrom: 'from-blue-400',
            gradientTo: 'to-sky-500',
        },
        {
            id: 'energy',
            title: 'الطاقة',
            value: energyLevel > 0 ? `${energyLevel * 20}%` : '—',
            unit: energyLevel > 0 ? ['منخفضة', 'ضعيفة', 'متوسطة', 'جيدة', 'عالية'][energyLevel - 1] || '' : 'سجّل طاقتك',
            icon: Zap,
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10',
            gradientFrom: 'from-yellow-400',
            gradientTo: 'to-orange-500',
        },
        {
            id: 'stress',
            title: 'التوتر',
            value: stressLevel > 0 ? `${stressLevel}/5` : '—',
            unit: stressLevel > 0 ? ['مرتاح', 'خفيف', 'متوسط', 'عالي', 'شديد'][stressLevel - 1] || '' : 'سجّل توترك',
            icon: Activity,
            color: 'text-teal-500',
            bgColor: 'bg-teal-500/10',
            gradientFrom: 'from-teal-400',
            gradientTo: 'to-cyan-500',
        }
    ];

    const displayCards = showAllMetrics
        ? additionalCards
        : [];

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                    <h2 className="text-lg font-bold text-slate-800">ملخص صحتك</h2>
                </div>
                <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(), 'EEEE d MMMM', { locale: ar })}</span>
                </div>
            </div>

            {/* Apple Health Style Activity Rings */}
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

            {/* Daily Goal Progress */}
            <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-[#2D9B83]" />
                        <h3 className="font-bold text-slate-700">أهداف اليوم</h3>
                    </div>
                    <span className="text-sm text-slate-500">
                        {Math.round((waterPercentage + sleepPercentage + medPercentage) / 3)}% مكتمل
                    </span>
                </div>

                {/* Progress bars */}
                <div className="space-y-3">
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-600">💧 الماء</span>
                            <span className="text-cyan-500 font-medium">{waterPercentage}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(waterPercentage, 100)}%` }}
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-600">🌙 النوم</span>
                            <span className="text-indigo-500 font-medium">{sleepPercentage}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(sleepPercentage, 100)}%` }}
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-600">💊 الأدوية</span>
                            <span className="text-rose-500 font-medium">{medPercentage}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(medPercentage, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <Link href="/health-tracker?tab=sleep">
                    <div className="glass rounded-2xl p-4 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden h-full">
                        <div className={`absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 opacity-0 group-hover:opacity-5 transition-opacity`} />
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                    <Moon className="w-6 h-6 text-indigo-500" />
                                </div>
                                <div className="flex items-center gap-1 text-xs text-indigo-500">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>{sleepPercentage}%</span>
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-slate-800 mb-1">{sleepHours.toFixed(1)}</div>
                            <div className="text-xs text-slate-500">ساعات نوم</div>
                        </div>
                    </div>
                </Link>

                <MoodWidget
                    currentMood={Number(dailyLog?.mood_score)}
                    logId={dailyLog?.id}
                    onUpdate={refetchDaily}
                />

                {/* Additional Metrics (Grid) */}
                {displayCards.map(card => {
                    const Icon = card.icon;
                    const content = (
                        <div
                            key={card.id}
                            className="glass rounded-2xl p-4 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden h-full"
                        >
                            {/* Gradient overlay on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo} opacity-0 group-hover:opacity-5 transition-opacity`} />

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`w-10 h-10 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                                        <Icon className={`w-5 h-5 ${card.color}`} />
                                    </div>
                                    {card.trend && (
                                        <div className={`flex items-center gap-1 text-xs ${card.trend === 'up' ? 'text-green-500' :
                                            card.trend === 'down' ? 'text-red-500' :
                                                'text-amber-500'
                                            }`}>
                                            <TrendingUp className={`w-3 h-3 ${card.trend === 'down' ? 'rotate-180' : ''}`} />
                                            {card.trendValue && <span>{card.trendValue}</span>}
                                        </div>
                                    )}
                                </div>
                                <div className="text-2xl font-bold text-slate-800 mb-1">{card.value}</div>
                                <div className="text-xs text-slate-500">{card.unit}</div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs font-medium text-slate-600">{card.title}</span>
                                    <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-[#2D9B83] transition-colors" />
                                </div>
                            </div>
                        </div>
                    );

                    return card.href ? (
                        <Link key={card.id} href={card.href}>{content}</Link>
                    ) : content;
                })}
            </div>

            {/* Show More Button */}
            <Button
                variant="ghost"
                className="w-full text-[#2D9B83] hover:bg-[#2D9B83]/5"
                onClick={() => setShowAllMetrics(!showAllMetrics)}
            >
                <Plus className={`w-4 h-4 ml-2 transition-transform ${showAllMetrics ? 'rotate-45' : ''}`} />
                {showAllMetrics ? 'إخفاء المقاييس الإضافية' : 'عرض المزيد من المقاييس'}
            </Button>

            {/* Daily Tip */}
            <div className="glass rounded-2xl p-4 bg-gradient-to-r from-[#2D9B83]/5 to-[#3FB39A]/5">
                <div className="flex items-center gap-3 text-sm">
                    <span className="text-2xl">💡</span>
                    <div className="flex-1">
                        <p className="font-medium text-slate-700">نصيحة اليوم</p>
                        <p className="text-slate-500 text-xs">
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
