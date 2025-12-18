import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Droplets, Plus, Minus, Target, TrendingUp, History } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';

interface WaterLog {
    id?: string;
    date: string;
    glasses: number;
    goal: number;
    logs: string[];
}

const GLASS_ML = 250;
const DEFAULT_GOAL = 8;

export default function WaterTracker() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const queryClient = useQueryClient();

    // Fetch today's water log
    const { data: waterLog, isLoading } = useQuery<WaterLog>({
        queryKey: ['waterLog', today],
        queryFn: async () => {
            try {
                const logs = await base44.entities.WaterLog.filter({ date: today });
                if (logs && logs.length > 0) {
                    return logs[0] as unknown as WaterLog;
                }
                return { date: today, glasses: 0, goal: DEFAULT_GOAL, logs: [] };
            } catch {
                return { date: today, glasses: 0, goal: DEFAULT_GOAL, logs: [] };
            }
        },
    });

    // Fetch weekly data
    const { data: weeklyData = [] } = useQuery<WaterLog[]>({
        queryKey: ['waterLogWeek'],
        queryFn: async () => {
            try {
                const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
                const logs = await base44.entities.WaterLog.filter({
                    date: { $gte: weekAgo }
                }, '-date');
                return logs as unknown as WaterLog[];
            } catch {
                return [];
            }
        },
    });

    const glasses = waterLog?.glasses || 0;
    const goal = waterLog?.goal || DEFAULT_GOAL;
    const percentage = Math.min(100, Math.round((glasses / goal) * 100));
    const remaining = Math.max(0, goal - glasses);
    const totalMl = glasses * GLASS_ML;

    // Update water log mutation
    const updateWaterMutation = useMutation({
        mutationFn: async (newGlasses: number) => {
            const logTime = format(new Date(), 'HH:mm');
            const newLogs = [...(waterLog?.logs || []), logTime];

            if (waterLog?.id) {
                return base44.entities.WaterLog.update(waterLog.id, {
                    glasses: newGlasses,
                    logs: newLogs
                });
            } else {
                return base44.entities.WaterLog.create({
                    date: today,
                    glasses: newGlasses,
                    goal: DEFAULT_GOAL,
                    logs: newLogs
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waterLog'] });
        },
    });

    const addGlass = () => {
        const newGlasses = glasses + 1;
        updateWaterMutation.mutate(newGlasses);

        if (newGlasses === goal) {
            toast.success('🎉 أحسنت! وصلت لهدفك اليومي من الماء');
        } else {
            toast.success('💧 تم إضافة كوب ماء');
        }
    };

    const removeGlass = () => {
        if (glasses > 0) {
            updateWaterMutation.mutate(glasses - 1);
        }
    };

    // Calculate weekly average
    const weeklyAverage = weeklyData.length > 0
        ? Math.round(weeklyData.reduce((sum, log) => sum + log.glasses, 0) / weeklyData.length)
        : 0;

    return (
        <div className="space-y-6">
            {/* Main Card - Apple Health Style */}
            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Droplets className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">تتبع الماء</h2>
                        <p className="text-white/80 text-sm">حافظ على ترطيب جسمك</p>
                    </div>
                </div>

                {/* Water Animation Container */}
                <div className="relative w-40 h-40 mx-auto mb-6">
                    {/* Glass Container */}
                    <div className="absolute inset-0 rounded-3xl border-4 border-white/30 overflow-hidden">
                        {/* Water Level */}
                        <div
                            className="absolute bottom-0 left-0 right-0 bg-white/30 transition-all duration-700 ease-out"
                            style={{ height: `${percentage}%` }}
                        >
                            {/* Wave Animation */}
                            <div className="absolute top-0 left-0 right-0 h-4 overflow-hidden">
                                <div className="absolute inset-0 animate-wave bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            </div>
                        </div>
                    </div>

                    {/* Center Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold">{glasses}</span>
                        <span className="text-sm text-white/80">من {goal} أكواب</span>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/10 rounded-2xl p-3">
                        <div className="text-2xl font-bold">{totalMl}</div>
                        <div className="text-xs text-white/70">مل</div>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-3">
                        <div className="text-2xl font-bold">{percentage}%</div>
                        <div className="text-xs text-white/70">مكتمل</div>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-3">
                        <div className="text-2xl font-bold">{remaining}</div>
                        <div className="text-xs text-white/70">متبقي</div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-4 mt-6">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 text-white"
                        onClick={removeGlass}
                        disabled={glasses === 0 || updateWaterMutation.isPending}
                    >
                        <Minus className="w-6 h-6" />
                    </Button>

                    <Button
                        className="w-20 h-20 rounded-full bg-white text-blue-500 hover:bg-white/90 shadow-lg"
                        onClick={addGlass}
                        disabled={updateWaterMutation.isPending}
                    >
                        <Plus className="w-8 h-8" />
                    </Button>

                    <Button
                        size="icon"
                        variant="ghost"
                        className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 text-white"
                        onClick={() => {
                            // Quick add 2 glasses
                            updateWaterMutation.mutate(glasses + 2);
                            toast.success('💧💧 تم إضافة كوبين');
                        }}
                        disabled={updateWaterMutation.isPending}
                    >
                        <span className="text-lg font-bold">+2</span>
                    </Button>
                </div>
            </div>

            {/* Weekly Stats */}
            <div className="glass rounded-3xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#2D9B83]" />
                    <h3 className="font-bold text-slate-800">إحصائيات الأسبوع</h3>
                </div>

                <div className="flex items-end justify-between gap-2 h-24">
                    {[...Array(7)].map((_, index) => {
                        const date = format(subDays(new Date(), 6 - index), 'yyyy-MM-dd');
                        const dayLog = weeklyData.find(log => log.date === date);
                        const dayGlasses = dayLog?.glasses || 0;
                        const dayPercentage = Math.min(100, (dayGlasses / goal) * 100);
                        const dayName = format(subDays(new Date(), 6 - index), 'EEE', { locale: ar });

                        return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full h-20 bg-slate-100 rounded-lg relative overflow-hidden">
                                    <div
                                        className={`absolute bottom-0 left-0 right-0 rounded-lg transition-all ${dayPercentage >= 100 ? 'bg-[#2D9B83]' : 'bg-cyan-400'
                                            }`}
                                        style={{ height: `${dayPercentage}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-slate-500">{dayName}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">المتوسط الأسبوعي</span>
                    </div>
                    <span className="font-bold text-[#2D9B83]">{weeklyAverage} أكواب</span>
                </div>
            </div>

            {/* Tips Card */}
            <div className="glass rounded-3xl p-5">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">💡</span>
                    <h3 className="font-bold text-slate-800">نصيحة اليوم</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                    اشرب كوب ماء فور الاستيقاظ، فهذا يساعد على تنشيط الجسم وتحسين عملية الهضم طوال اليوم.
                </p>
            </div>

            {/* Add wave animation to globals.css if needed */}
            <style jsx global>{`
                @keyframes wave {
                    0%, 100% { transform: translateX(-100%); }
                    50% { transform: translateX(100%); }
                }
                .animate-wave {
                    animation: wave 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
