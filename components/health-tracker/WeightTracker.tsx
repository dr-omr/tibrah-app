import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
    Scale, Plus, TrendingUp, TrendingDown, Target, Minus,
    Calendar
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';

interface WeightEntry {
    weight: number;
    date: string;
}

export default function WeightTracker() {
    const queryClient = useQueryClient();
    const today = format(new Date(), 'yyyy-MM-dd');

    const [showForm, setShowForm] = useState(false);
    const [newWeight, setNewWeight] = useState('');
    const [goalWeight, setGoalWeight] = useState(70);

    // Load weight history
    const { data: weightHistory = [] } = useQuery<WeightEntry[]>({
        queryKey: ['weightHistory'],
        queryFn: async () => {
            try {
                const logs = await base44.entities.DailyLog.list('-date', 30);
                return logs
                    .filter((log: Record<string, unknown>) => log.weight)
                    .map((log: Record<string, unknown>) => ({
                        weight: log.weight as number,
                        date: log.date as string
                    }));
            } catch {
                return [];
            }
        }
    });

    const latestWeight = weightHistory[0]?.weight || 0;
    const previousWeight = weightHistory[1]?.weight || latestWeight;
    const weekAgoWeight = weightHistory.find(w => {
        const days = (new Date().getTime() - new Date(w.date).getTime()) / (1000 * 60 * 60 * 24);
        return days >= 7;
    })?.weight || latestWeight;

    const dailyChange = latestWeight - previousWeight;
    const weeklyChange = latestWeight - weekAgoWeight;
    const toGoal = latestWeight - goalWeight;

    const calculateBMI = (weight: number, heightCm: number = 170) => {
        const heightM = heightCm / 100;
        return (weight / (heightM * heightM)).toFixed(1);
    };

    const getBMIStatus = (bmi: number) => {
        if (bmi < 18.5) return { label: 'نحيف', color: 'text-blue-500' };
        if (bmi < 25) return { label: 'طبيعي', color: 'text-green-500' };
        if (bmi < 30) return { label: 'زيادة وزن', color: 'text-yellow-500' };
        return { label: 'سمنة', color: 'text-red-500' };
    };

    const bmi = parseFloat(calculateBMI(latestWeight));

    const saveMutation = useMutation({
        mutationFn: async () => {
            const weight = parseFloat(newWeight);
            const logs = await base44.entities.DailyLog.filter({ date: today });

            if (logs?.[0]) {
                await base44.entities.DailyLog.update(logs[0].id as string, { weight });
            } else {
                await base44.entities.DailyLog.create({ date: today, weight });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['weightHistory'] });
            setShowForm(false);
            setNewWeight('');
            toast.success('تم تسجيل الوزن! ⚖️');
        }
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-purple-500" />
                    <h2 className="text-lg font-bold text-slate-800">الوزن</h2>
                </div>
                {!showForm && (
                    <Button
                        size="sm"
                        onClick={() => setShowForm(true)}
                        className="gradient-primary rounded-xl"
                    >
                        <Plus className="w-4 h-4 ml-1" />
                        تسجيل الوزن
                    </Button>
                )}
            </div>

            {/* Current Weight Display */}
            {latestWeight > 0 && !showForm && (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-bold text-slate-800">
                                    {latestWeight}
                                </span>
                                <span className="text-lg text-slate-500">كجم</span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                آخر تسجيل: {format(new Date(weightHistory[0]?.date || today), 'dd MMMM', { locale: ar })}
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex flex-col items-center justify-center">
                                <span className="text-xl font-bold text-purple-600">{bmi}</span>
                                <span className="text-[9px] text-slate-500">BMI</span>
                            </div>
                            <span className={`text-xs ${getBMIStatus(bmi).color}`}>
                                {getBMIStatus(bmi).label}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Input Form */}
            {showForm && (
                <div className="glass rounded-2xl p-5 space-y-4">
                    <div>
                        <label className="text-sm text-slate-600 block mb-2">وزنك اليوم (كجم)</label>
                        <Input
                            type="number"
                            step="0.1"
                            placeholder="70.5"
                            value={newWeight}
                            onChange={(e) => setNewWeight(e.target.value)}
                            className="text-center text-2xl font-bold rounded-xl h-14"
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowForm(false)}
                            className="flex-1 rounded-xl"
                        >
                            إلغاء
                        </Button>
                        <Button
                            onClick={() => saveMutation.mutate()}
                            disabled={!newWeight || saveMutation.isPending}
                            className="flex-1 gradient-primary rounded-xl"
                        >
                            حفظ
                        </Button>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            {latestWeight > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    <div className="glass rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                            {dailyChange > 0 ? (
                                <TrendingUp className="w-4 h-4 text-red-500" />
                            ) : dailyChange < 0 ? (
                                <TrendingDown className="w-4 h-4 text-green-500" />
                            ) : (
                                <Minus className="w-4 h-4 text-slate-400" />
                            )}
                            <span className={`font-bold ${dailyChange > 0 ? 'text-red-500' : dailyChange < 0 ? 'text-green-500' : 'text-slate-600'
                                }`}>
                                {dailyChange > 0 ? '+' : ''}{dailyChange.toFixed(1)}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">يومي</p>
                    </div>

                    <div className="glass rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                            {weeklyChange > 0 ? (
                                <TrendingUp className="w-4 h-4 text-red-500" />
                            ) : weeklyChange < 0 ? (
                                <TrendingDown className="w-4 h-4 text-green-500" />
                            ) : (
                                <Minus className="w-4 h-4 text-slate-400" />
                            )}
                            <span className={`font-bold ${weeklyChange > 0 ? 'text-red-500' : weeklyChange < 0 ? 'text-green-500' : 'text-slate-600'
                                }`}>
                                {weeklyChange > 0 ? '+' : ''}{weeklyChange.toFixed(1)}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">أسبوعي</p>
                    </div>

                    <div className="glass rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                            <Target className="w-4 h-4 text-purple-500" />
                            <span className="font-bold text-purple-600">
                                {toGoal > 0 ? '-' : '+'}{Math.abs(toGoal).toFixed(1)}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">للهدف</p>
                    </div>
                </div>
            )}

            {/* Weight Chart */}
            {weightHistory.length > 1 && (
                <div className="glass rounded-2xl p-4">
                    <h3 className="font-medium text-slate-700 mb-3">التقدم</h3>
                    <div className="flex items-end justify-between h-20 gap-1">
                        {weightHistory.slice(0, 10).reverse().map((entry, idx) => {
                            const minWeight = Math.min(...weightHistory.map(w => w.weight)) - 2;
                            const maxWeight = Math.max(...weightHistory.map(w => w.weight)) + 2;
                            const heightPercent = ((entry.weight - minWeight) / (maxWeight - minWeight)) * 100;

                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center">
                                    <div
                                        className="w-full bg-purple-400 rounded-t transition-all"
                                        style={{ height: `${heightPercent}%` }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                        <span>{weightHistory[Math.min(9, weightHistory.length - 1)]?.date.slice(-5)}</span>
                        <span>{weightHistory[0]?.date.slice(-5)}</span>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {latestWeight === 0 && !showForm && (
                <div className="text-center py-8">
                    <Scale className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-500">لم تسجل وزنك بعد</p>
                    <Button
                        onClick={() => setShowForm(true)}
                        className="mt-3 gradient-primary rounded-xl"
                    >
                        سجل وزنك الأول
                    </Button>
                </div>
            )}
        </div>
    );
}
