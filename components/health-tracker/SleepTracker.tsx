import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Moon, Sun, Clock, Star, TrendingUp, ChevronLeft, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from 'sonner';
import { format, subDays, differenceInMinutes, parse } from 'date-fns';
import { ar } from 'date-fns/locale';

interface SleepLog {
    id?: string;
    date: string;
    bedtime: string;
    wake_time: string;
    duration_hours: number;
    quality: number;
    notes?: string;
}

const QUALITY_LABELS = ['سيء جداً', 'سيء', 'متوسط', 'جيد', 'ممتاز'];
const QUALITY_EMOJIS = ['😫', '😔', '😐', '😊', '😴'];

export default function SleepTracker() {
    const [showAddSheet, setShowAddSheet] = useState(false);
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const queryClient = useQueryClient();

    // Fetch recent sleep logs
    const { data: sleepLogs = [], isLoading } = useQuery<SleepLog[]>({
        queryKey: ['sleepLogs'],
        queryFn: async () => {
            try {
                const weekAgo = format(subDays(new Date(), 14), 'yyyy-MM-dd');
                const logs = await base44.entities.SleepLog.filter({
                    date: { $gte: weekAgo }
                }, '-date');
                return logs as unknown as SleepLog[];
            } catch {
                return [];
            }
        },
    });

    // Get last night's sleep (yesterday's entry)
    const lastNight = sleepLogs.find(log => log.date === yesterday);

    // Calculate weekly average
    const weeklyLogs = sleepLogs.slice(0, 7);
    const weeklyAverage = weeklyLogs.length > 0
        ? (weeklyLogs.reduce((sum, log) => sum + log.duration_hours, 0) / weeklyLogs.length).toFixed(1)
        : '0';

    const averageQuality = weeklyLogs.length > 0
        ? Math.round(weeklyLogs.reduce((sum, log) => sum + log.quality, 0) / weeklyLogs.length)
        : 0;

    // Calculate sleep goal progress
    const sleepGoal = 8; // hours
    const lastNightHours = lastNight?.duration_hours || 0;
    const goalPercentage = Math.min(100, Math.round((lastNightHours / sleepGoal) * 100));

    return (
        <div className="space-y-6">
            {/* Main Card - Apple Health Style */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Moon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">تتبع النوم</h2>
                            <p className="text-white/80 text-sm">نوم صحي = حياة صحية</p>
                        </div>
                    </div>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="bg-white/20 hover:bg-white/30 text-white rounded-full"
                        onClick={() => setShowAddSheet(true)}
                    >
                        <Plus className="w-5 h-5" />
                    </Button>
                </div>

                {/* Sleep Ring */}
                <div className="flex items-center justify-center py-4">
                    <div className="relative w-36 h-36">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="72"
                                cy="72"
                                r="64"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="12"
                                fill="none"
                            />
                            <circle
                                cx="72"
                                cy="72"
                                r="64"
                                stroke="white"
                                strokeWidth="12"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${goalPercentage * 4.02} 402`}
                                className="transition-all duration-500"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold">{lastNightHours.toFixed(1)}</span>
                            <span className="text-sm text-white/80">ساعات</span>
                        </div>
                    </div>
                </div>

                {/* Last Night Stats */}
                {lastNight ? (
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-white/10 rounded-2xl p-3">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Moon className="w-4 h-4" />
                                <span className="text-sm">{lastNight.bedtime}</span>
                            </div>
                            <div className="text-xs text-white/70">وقت النوم</div>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-3">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Sun className="w-4 h-4" />
                                <span className="text-sm">{lastNight.wake_time}</span>
                            </div>
                            <div className="text-xs text-white/70">الاستيقاظ</div>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-3">
                            <div className="text-xl">{QUALITY_EMOJIS[lastNight.quality - 1]}</div>
                            <div className="text-xs text-white/70">{QUALITY_LABELS[lastNight.quality - 1]}</div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-white/80 mb-3">لم تسجل نوم الليلة الماضية</p>
                        <Button
                            variant="secondary"
                            className="bg-white/20 hover:bg-white/30 text-white border-0"
                            onClick={() => setShowAddSheet(true)}
                        >
                            <Plus className="w-4 h-4 ml-2" />
                            سجل الآن
                        </Button>
                    </div>
                )}
            </div>

            {/* Weekly Overview */}
            <div className="glass rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#2D9B83]" />
                        <h3 className="font-bold text-slate-800">نظرة أسبوعية</h3>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                        <span className="text-slate-500">المتوسط:</span>
                        <span className="font-bold text-[#2D9B83]">{weeklyAverage}س</span>
                    </div>
                </div>

                {/* Weekly Bar Chart */}
                <div className="flex items-end justify-between gap-2 h-32 mb-4">
                    {[...Array(7)].map((_, index) => {
                        const date = format(subDays(new Date(), 6 - index), 'yyyy-MM-dd');
                        const dayLog = sleepLogs.find(log => log.date === date);
                        const hours = dayLog?.duration_hours || 0;
                        const heightPercentage = Math.min(100, (hours / 10) * 100);
                        const dayName = format(subDays(new Date(), 6 - index), 'EEE', { locale: ar });
                        const isToday = date === today;
                        const isYesterday = date === yesterday;

                        return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-xs text-slate-500 font-medium">
                                    {hours > 0 ? hours.toFixed(0) : '-'}
                                </span>
                                <div className="w-full h-24 bg-slate-100 rounded-lg relative overflow-hidden">
                                    <div
                                        className={`absolute bottom-0 left-0 right-0 rounded-lg transition-all ${hours >= 7 ? 'bg-[#2D9B83]' : hours >= 5 ? 'bg-amber-400' : 'bg-red-400'
                                            }`}
                                        style={{ height: `${heightPercentage}%` }}
                                    />
                                </div>
                                <span className={`text-[10px] ${isToday ? 'text-[#2D9B83] font-bold' : 'text-slate-500'}`}>
                                    {isToday ? 'اليوم' : isYesterday ? 'أمس' : dayName}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Quality Stars */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-sm text-slate-600">متوسط جودة النوم</span>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star
                                key={star}
                                className={`w-5 h-5 ${star <= averageQuality
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-slate-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Sleep History */}
            <div className="glass rounded-3xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-[#D4AF37]" />
                    <h3 className="font-bold text-slate-800">السجل الأخير</h3>
                </div>

                <div className="space-y-3">
                    {sleepLogs.slice(0, 5).map((log, index) => (
                        <div
                            key={log.id || index}
                            className="flex items-center gap-4 p-3 rounded-xl bg-slate-50"
                        >
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                                <span className="text-2xl">{QUALITY_EMOJIS[log.quality - 1]}</span>
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-slate-800">
                                    {format(new Date(log.date), 'EEEE d MMMM', { locale: ar })}
                                </div>
                                <div className="text-sm text-slate-500">
                                    {log.bedtime} → {log.wake_time} • {log.duration_hours.toFixed(1)} ساعات
                                </div>
                            </div>
                            <ChevronLeft className="w-5 h-5 text-slate-300" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Sleep Sheet */}
            <AddSleepSheet
                open={showAddSheet}
                onOpenChange={setShowAddSheet}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['sleepLogs'] });
                    setShowAddSheet(false);
                }}
            />
        </div>
    );
}

// Add Sleep Sheet Component
function AddSleepSheet({
    open,
    onOpenChange,
    onSuccess
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}) {
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const [formData, setFormData] = useState({
        date: yesterday,
        bedtime: '23:00',
        wake_time: '07:00',
        quality: 4,
        notes: ''
    });

    const calculateDuration = () => {
        try {
            const bedtime = parse(formData.bedtime, 'HH:mm', new Date());
            let wakeTime = parse(formData.wake_time, 'HH:mm', new Date());

            // If wake time is before bedtime, it's the next day
            if (wakeTime < bedtime) {
                wakeTime = new Date(wakeTime.getTime() + 24 * 60 * 60 * 1000);
            }

            const minutes = differenceInMinutes(wakeTime, bedtime);
            return Math.round((minutes / 60) * 10) / 10;
        } catch {
            return 0;
        }
    };

    const addMutation = useMutation({
        mutationFn: async () => {
            const duration = calculateDuration();
            return base44.entities.SleepLog.create({
                ...formData,
                duration_hours: duration
            });
        },
        onSuccess: () => {
            toast.success('تم تسجيل النوم بنجاح');
            onSuccess();
        },
        onError: () => {
            toast.error('حدث خطأ في التسجيل');
        }
    });

    const duration = calculateDuration();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-right text-xl">تسجيل النوم</SheetTitle>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">التاريخ</label>
                        <Input
                            type="date"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            className="h-12 rounded-xl"
                        />
                    </div>

                    {/* Times */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <Moon className="w-4 h-4 inline ml-1" />
                                وقت النوم
                            </label>
                            <Input
                                type="time"
                                value={formData.bedtime}
                                onChange={e => setFormData({ ...formData, bedtime: e.target.value })}
                                className="h-12 rounded-xl text-center"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <Sun className="w-4 h-4 inline ml-1" />
                                وقت الاستيقاظ
                            </label>
                            <Input
                                type="time"
                                value={formData.wake_time}
                                onChange={e => setFormData({ ...formData, wake_time: e.target.value })}
                                className="h-12 rounded-xl text-center"
                            />
                        </div>
                    </div>

                    {/* Duration Display */}
                    <div className="bg-indigo-50 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-bold text-indigo-600">{duration}</div>
                        <div className="text-sm text-indigo-500">ساعات نوم</div>
                    </div>

                    {/* Quality */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">جودة النوم</label>
                        <div className="flex justify-between gap-2">
                            {[1, 2, 3, 4, 5].map(q => (
                                <button
                                    key={q}
                                    onClick={() => setFormData({ ...formData, quality: q })}
                                    className={`flex-1 p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${formData.quality === q
                                            ? 'bg-indigo-500 text-white scale-105 shadow-lg'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    <span className="text-2xl">{QUALITY_EMOJIS[q - 1]}</span>
                                    <span className="text-[10px]">{QUALITY_LABELS[q - 1]}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">ملاحظات (اختياري)</label>
                        <Input
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="مثال: استيقظت مرتين أثناء الليل"
                            className="h-12 rounded-xl"
                        />
                    </div>

                    {/* Submit */}
                    <Button
                        onClick={() => addMutation.mutate()}
                        disabled={addMutation.isPending}
                        className="w-full h-14 rounded-2xl gradient-primary text-white font-bold text-lg"
                    >
                        <Moon className="w-5 h-5 ml-2" />
                        حفظ
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
