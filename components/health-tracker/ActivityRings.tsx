import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Flame, Timer, PersonStanding, ChevronLeft, Plus, Target } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ActivityData {
    moveCalories: number;
    moveGoal: number;
    exerciseMinutes: number;
    exerciseGoal: number;
    standHours: number;
    standGoal: number;
}

interface RingProps {
    progress: number;
    color: string;
    size: number;
    strokeWidth: number;
    icon: React.ElementType;
    label: string;
    value: string;
    goal: string;
}

const ActivityRing = ({ progress, color, size, strokeWidth, icon: Icon, label, value, goal }: RingProps) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background Ring */}
                <svg className="transform -rotate-90" width={size} height={size}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeOpacity={0.2}
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {/* Progress Ring */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="w-6 h-6" style={{ color }} />
                </div>
            </div>
            <div className="mt-2 text-center">
                <p className="text-lg font-bold text-slate-800">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-[10px] text-slate-400">الهدف: {goal}</p>
            </div>
        </div>
    );
};

export default function ActivityRings() {
    const queryClient = useQueryClient();
    const today = format(new Date(), 'yyyy-MM-dd');

    const [data, setData] = useState<ActivityData>({
        moveCalories: 0,
        moveGoal: 500,
        exerciseMinutes: 0,
        exerciseGoal: 30,
        standHours: 0,
        standGoal: 8
    });

    // Load today's activity
    const { data: activityLog } = useQuery({
        queryKey: ['activityLog', today],
        queryFn: async () => {
            try {
                const logs = await base44.entities.DailyLog.filter({ date: today });
                const log = logs?.[0];
                if (log) {
                    return {
                        moveCalories: (log.exercise?.calories as number) || 0,
                        moveGoal: 500,
                        exerciseMinutes: (log.exercise?.duration_minutes as number) || 0,
                        exerciseGoal: 30,
                        standHours: (log.stand_hours as number) || 0,
                        standGoal: 8
                    };
                }
                return null;
            } catch {
                return null;
            }
        }
    });

    useEffect(() => {
        if (activityLog) {
            setData(activityLog);
        }
    }, [activityLog]);

    const moveProgress = (data.moveCalories / data.moveGoal) * 100;
    const exerciseProgress = (data.exerciseMinutes / data.exerciseGoal) * 100;
    const standProgress = (data.standHours / data.standGoal) * 100;

    const totalProgress = Math.round((moveProgress + exerciseProgress + standProgress) / 3);

    const quickAdd = useMutation({
        mutationFn: async (type: 'move' | 'exercise' | 'stand') => {
            const updates = {
                move: { moveCalories: data.moveCalories + 50 },
                exercise: { exerciseMinutes: data.exerciseMinutes + 10 },
                stand: { standHours: data.standHours + 1 }
            };
            setData({ ...data, ...updates[type] });
            // Save to backend
            const logs = await base44.entities.DailyLog.filter({ date: today });
            if (logs?.[0]) {
                await base44.entities.DailyLog.update(logs[0].id as string, {
                    exercise: {
                        calories: type === 'move' ? data.moveCalories + 50 : data.moveCalories,
                        duration_minutes: type === 'exercise' ? data.exerciseMinutes + 10 : data.exerciseMinutes
                    },
                    stand_hours: type === 'stand' ? data.standHours + 1 : data.standHours
                });
            } else {
                await base44.entities.DailyLog.create({
                    date: today,
                    exercise: {
                        calories: type === 'move' ? 50 : 0,
                        duration_minutes: type === 'exercise' ? 10 : 0
                    },
                    stand_hours: type === 'stand' ? 1 : 0
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activityLog', today] });
        }
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">نشاطك اليوم</h2>
                <span className="text-sm text-slate-500">
                    {format(new Date(), 'EEEE', { locale: ar })}
                </span>
            </div>

            {/* Main Rings Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white">
                {/* Concentric Rings Display */}
                <div className="flex justify-center mb-6">
                    <div className="relative" style={{ width: 200, height: 200 }}>
                        {/* Outer Ring - Move */}
                        <svg className="absolute inset-0 transform -rotate-90" width={200} height={200}>
                            <circle cx={100} cy={100} r={90} stroke="#FF2D55" strokeOpacity={0.3} strokeWidth={12} fill="none" />
                            <circle
                                cx={100} cy={100} r={90}
                                stroke="#FF2D55"
                                strokeWidth={12}
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 90}
                                strokeDashoffset={2 * Math.PI * 90 * (1 - Math.min(moveProgress, 100) / 100)}
                                className="transition-all duration-1000"
                            />
                        </svg>
                        {/* Middle Ring - Exercise */}
                        <svg className="absolute inset-0 transform -rotate-90" width={200} height={200}>
                            <circle cx={100} cy={100} r={72} stroke="#A8FF00" strokeOpacity={0.3} strokeWidth={12} fill="none" />
                            <circle
                                cx={100} cy={100} r={72}
                                stroke="#A8FF00"
                                strokeWidth={12}
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 72}
                                strokeDashoffset={2 * Math.PI * 72 * (1 - Math.min(exerciseProgress, 100) / 100)}
                                className="transition-all duration-1000"
                            />
                        </svg>
                        {/* Inner Ring - Stand */}
                        <svg className="absolute inset-0 transform -rotate-90" width={200} height={200}>
                            <circle cx={100} cy={100} r={54} stroke="#00D4FF" strokeOpacity={0.3} strokeWidth={12} fill="none" />
                            <circle
                                cx={100} cy={100} r={54}
                                stroke="#00D4FF"
                                strokeWidth={12}
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 54}
                                strokeDashoffset={2 * Math.PI * 54 * (1 - Math.min(standProgress, 100) / 100)}
                                className="transition-all duration-1000"
                            />
                        </svg>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold">{totalProgress}%</span>
                            <span className="text-xs text-slate-400">إجمالي</span>
                        </div>
                    </div>
                </div>

                {/* Ring Legend */}
                <div className="grid grid-cols-3 gap-4">
                    <button
                        onClick={() => quickAdd.mutate('move')}
                        className="text-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <div className="w-3 h-3 rounded-full bg-[#FF2D55]" />
                            <Flame className="w-4 h-4 text-[#FF2D55]" />
                        </div>
                        <p className="text-lg font-bold">{data.moveCalories}</p>
                        <p className="text-[10px] text-slate-400">/{data.moveGoal} سعرة</p>
                    </button>

                    <button
                        onClick={() => quickAdd.mutate('exercise')}
                        className="text-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <div className="w-3 h-3 rounded-full bg-[#A8FF00]" />
                            <Timer className="w-4 h-4 text-[#A8FF00]" />
                        </div>
                        <p className="text-lg font-bold">{data.exerciseMinutes}</p>
                        <p className="text-[10px] text-slate-400">/{data.exerciseGoal} دقيقة</p>
                    </button>

                    <button
                        onClick={() => quickAdd.mutate('stand')}
                        className="text-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <div className="w-3 h-3 rounded-full bg-[#00D4FF]" />
                            <PersonStanding className="w-4 h-4 text-[#00D4FF]" />
                        </div>
                        <p className="text-lg font-bold">{data.standHours}</p>
                        <p className="text-[10px] text-slate-400">/{data.standGoal} ساعات</p>
                    </button>
                </div>
            </div>

            {/* Motivation Message */}
            <div className="glass rounded-2xl p-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">
                        {totalProgress >= 100 ? '🏆' : totalProgress >= 50 ? '💪' : '🚀'}
                    </span>
                    <div>
                        <p className="font-medium text-slate-700">
                            {totalProgress >= 100 ? 'أحسنت! أكملت كل الحلقات!' :
                                totalProgress >= 50 ? 'رائع! نصف الطريق!' :
                                    'ابدأ يومك بنشاط!'}
                        </p>
                        <p className="text-xs text-slate-500">
                            {totalProgress < 100 ? 'اضغط على أي حلقة لإضافة نشاط سريع' : 'استمر هكذا كل يوم'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
