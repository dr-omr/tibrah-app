import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
    Scale, Plus, TrendingUp, TrendingDown, Target, Minus,
    Calendar, Ruler, Edit3, Check, X
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

interface UserProfile {
    height: number;
    goalWeight: number;
}

const BMI_CATEGORIES = [
    { max: 18.5, label: 'نحيف', color: 'bg-blue-500', textColor: 'text-blue-500' },
    { max: 25, label: 'طبيعي', color: 'bg-green-500', textColor: 'text-green-500' },
    { max: 30, label: 'زيادة وزن', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
    { max: 35, label: 'سمنة درجة أولى', color: 'bg-orange-500', textColor: 'text-orange-500' },
    { max: 40, label: 'سمنة درجة ثانية', color: 'bg-red-500', textColor: 'text-red-500' },
    { max: 100, label: 'سمنة مفرطة', color: 'bg-red-700', textColor: 'text-red-700' },
];

export default function WeightTracker() {
    const queryClient = useQueryClient();
    const today = format(new Date(), 'yyyy-MM-dd');

    const [showForm, setShowForm] = useState(false);
    const [showHeightForm, setShowHeightForm] = useState(false);
    const [newWeight, setNewWeight] = useState('');
    const [newHeight, setNewHeight] = useState('');
    const [newGoalWeight, setNewGoalWeight] = useState('');

    // Load profile from localStorage
    const [profile, setProfile] = useState<UserProfile>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('userProfile');
            return saved ? JSON.parse(saved) : { height: 0, goalWeight: 70 };
        }
        return { height: 0, goalWeight: 70 };
    });

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
    const toGoal = latestWeight - profile.goalWeight;

    // Calculate BMI
    const calculateBMI = (weight: number, heightCm: number) => {
        if (heightCm <= 0 || weight <= 0) return 0;
        const heightM = heightCm / 100;
        return weight / (heightM * heightM);
    };

    const bmi = calculateBMI(latestWeight, profile.height);

    const getBMICategory = (bmiValue: number) => {
        return BMI_CATEGORIES.find(cat => bmiValue < cat.max) || BMI_CATEGORIES[BMI_CATEGORIES.length - 1];
    };

    const bmiCategory = getBMICategory(bmi);

    // BMI bar position (0-100%)
    const getBMIBarPosition = (bmiValue: number) => {
        // Map BMI 15-40 to 0-100%
        const minBMI = 15;
        const maxBMI = 40;
        const position = ((bmiValue - minBMI) / (maxBMI - minBMI)) * 100;
        return Math.max(0, Math.min(100, position));
    };

    const saveProfile = (updates: Partial<UserProfile>) => {
        const newProfile = { ...profile, ...updates };
        setProfile(newProfile);
        localStorage.setItem('userProfile', JSON.stringify(newProfile));
    };

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

    const handleSaveHeight = () => {
        const height = parseFloat(newHeight);
        if (height > 0) {
            saveProfile({ height });
            setShowHeightForm(false);
            setNewHeight('');
            toast.success('تم حفظ الطول');
        }
    };

    const handleSaveGoalWeight = () => {
        const goalWeight = parseFloat(newGoalWeight);
        if (goalWeight > 0) {
            saveProfile({ goalWeight });
            setNewGoalWeight('');
            toast.success('تم تحديث هدف الوزن');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-purple-500" />
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">الوزن ومؤشر كتلة الجسم</h2>
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

            {/* Height Input - Required for BMI */}
            {profile.height === 0 && !showHeightForm && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                        <Ruler className="w-8 h-8 text-amber-500" />
                        <div className="flex-1">
                            <h3 className="font-bold text-amber-800 dark:text-amber-300">أدخل طولك</h3>
                            <p className="text-sm text-amber-600 dark:text-amber-400">لحساب مؤشر كتلة الجسم بدقة</p>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => setShowHeightForm(true)}
                            className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                        >
                            إضافة
                        </Button>
                    </div>
                </div>
            )}

            {/* Height Form */}
            {showHeightForm && (
                <div className="glass rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Ruler className="w-5 h-5 text-purple-500" />
                        <h3 className="font-bold text-slate-800 dark:text-white">الطول</h3>
                    </div>
                    <div className="flex gap-3">
                        <Input
                            type="number"
                            placeholder="170"
                            value={newHeight}
                            onChange={(e) => setNewHeight(e.target.value)}
                            className="text-center text-xl font-bold rounded-xl h-12 flex-1"
                        />
                        <span className="flex items-center text-slate-500">سم</span>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowHeightForm(false)}
                            className="flex-1 rounded-xl"
                        >
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleSaveHeight}
                            disabled={!newHeight}
                            className="flex-1 gradient-primary rounded-xl"
                        >
                            حفظ
                        </Button>
                    </div>
                </div>
            )}

            {/* Current Weight Display */}
            {latestWeight > 0 && !showForm && (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-5 border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-bold text-slate-800 dark:text-white">
                                    {latestWeight}
                                </span>
                                <span className="text-lg text-slate-500">كجم</span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                آخر تسجيل: {format(new Date(weightHistory[0]?.date || today), 'dd MMMM', { locale: ar })}
                            </p>
                        </div>

                        {/* BMI Circle */}
                        {profile.height > 0 && (
                            <div className="text-center">
                                <div className={`w-20 h-20 rounded-full ${bmiCategory.color} flex flex-col items-center justify-center text-white shadow-lg`}>
                                    <span className="text-2xl font-bold">{bmi.toFixed(1)}</span>
                                    <span className="text-[9px]">BMI</span>
                                </div>
                                <span className={`text-xs font-medium ${bmiCategory.textColor} mt-1 block`}>
                                    {bmiCategory.label}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* BMI Scale Bar */}
                    {profile.height > 0 && (
                        <div className="mt-4 pt-4 border-t border-purple-100 dark:border-purple-800">
                            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                <span>نحيف</span>
                                <span>طبيعي</span>
                                <span>زيادة</span>
                                <span>سمنة</span>
                            </div>
                            <div className="relative h-3 rounded-full overflow-hidden">
                                <div className="absolute inset-0 flex">
                                    <div className="flex-1 bg-blue-400"></div>
                                    <div className="flex-1 bg-green-400"></div>
                                    <div className="flex-1 bg-yellow-400"></div>
                                    <div className="flex-1 bg-orange-400"></div>
                                    <div className="flex-1 bg-red-400"></div>
                                </div>
                                {/* Indicator */}
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-slate-800 rounded-full shadow-lg transition-all duration-500"
                                    style={{ left: `calc(${getBMIBarPosition(bmi)}% - 8px)` }}
                                />
                            </div>
                            <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                                <span>15</span>
                                <span>18.5</span>
                                <span>25</span>
                                <span>30</span>
                                <span>35</span>
                                <span>40</span>
                            </div>
                        </div>
                    )}

                    {/* Height Edit */}
                    {profile.height > 0 && (
                        <button
                            onClick={() => {
                                setNewHeight(profile.height.toString());
                                setShowHeightForm(true);
                            }}
                            className="flex items-center gap-1 text-xs text-slate-500 hover:text-purple-500 mt-3 transition-colors"
                        >
                            <Edit3 className="w-3 h-3" />
                            الطول: {profile.height} سم
                        </button>
                    )}
                </div>
            )}

            {/* Input Form */}
            {showForm && (
                <div className="glass rounded-2xl p-5 space-y-4">
                    <div>
                        <label className="text-sm text-slate-600 dark:text-slate-400 block mb-2">وزنك اليوم (كجم)</label>
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
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">يومي</p>
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
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">أسبوعي</p>
                    </div>

                    <div className="glass rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                            <Target className="w-4 h-4 text-purple-500" />
                            <span className="font-bold text-purple-600">
                                {toGoal > 0 ? '-' : '+'}{Math.abs(toGoal).toFixed(1)}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">للهدف ({profile.goalWeight})</p>
                    </div>
                </div>
            )}

            {/* Goal Weight Setting */}
            <div className="glass rounded-2xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-500" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">الوزن المستهدف</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            value={newGoalWeight || profile.goalWeight}
                            onChange={(e) => setNewGoalWeight(e.target.value)}
                            className="w-20 h-8 text-center rounded-lg text-sm"
                        />
                        <span className="text-sm text-slate-500">كجم</span>
                        {newGoalWeight && newGoalWeight !== profile.goalWeight.toString() && (
                            <Button
                                size="icon"
                                onClick={handleSaveGoalWeight}
                                className="w-8 h-8 rounded-lg bg-green-500 hover:bg-green-600"
                            >
                                <Check className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Weight Chart */}
            {weightHistory.length > 1 && (
                <div className="glass rounded-2xl p-4">
                    <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-3">التقدم</h3>
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
                    <p className="text-slate-500 dark:text-slate-400">لم تسجل وزنك بعد</p>
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
