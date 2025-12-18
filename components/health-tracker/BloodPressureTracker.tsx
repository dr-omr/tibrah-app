import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
    Activity, Plus, TrendingUp, TrendingDown, Minus,
    Calendar, AlertTriangle, CheckCircle
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';

interface BPReading {
    id?: string;
    systolic: number;
    diastolic: number;
    pulse?: number;
    date: string;
    time: string;
    notes?: string;
}

const getBPStatus = (systolic: number, diastolic: number) => {
    if (systolic < 90 || diastolic < 60) {
        return { label: 'منخفض', color: 'text-blue-500', bg: 'bg-blue-50', icon: TrendingDown };
    }
    if (systolic < 120 && diastolic < 80) {
        return { label: 'طبيعي', color: 'text-green-500', bg: 'bg-green-50', icon: CheckCircle };
    }
    if (systolic < 130 && diastolic < 85) {
        return { label: 'مرتفع قليلاً', color: 'text-yellow-500', bg: 'bg-yellow-50', icon: Minus };
    }
    if (systolic < 140 || diastolic < 90) {
        return { label: 'ارتفاع طفيف', color: 'text-orange-500', bg: 'bg-orange-50', icon: TrendingUp };
    }
    return { label: 'مرتفع', color: 'text-red-500', bg: 'bg-red-50', icon: AlertTriangle };
};

export default function BloodPressureTracker() {
    const queryClient = useQueryClient();
    const today = format(new Date(), 'yyyy-MM-dd');

    const [showForm, setShowForm] = useState(false);
    const [systolic, setSystolic] = useState('');
    const [diastolic, setDiastolic] = useState('');
    const [pulse, setPulse] = useState('');

    // Load readings
    const { data: readings = [] } = useQuery<BPReading[]>({
        queryKey: ['bloodPressure'],
        queryFn: async () => {
            try {
                const logs = await base44.entities.DailyLog.list('-date', 14);
                return logs
                    .filter((log: Record<string, unknown>) => log.blood_pressure)
                    .map((log: Record<string, unknown>) => ({
                        id: log.id as string,
                        systolic: (log.blood_pressure as { systolic: number }).systolic,
                        diastolic: (log.blood_pressure as { diastolic: number }).diastolic,
                        pulse: (log.blood_pressure as { pulse?: number })?.pulse,
                        date: log.date as string,
                        time: (log.blood_pressure as { time?: string })?.time || '00:00'
                    }));
            } catch {
                return [];
            }
        }
    });

    const latestReading = readings[0];
    const averageSystolic = readings.length > 0
        ? Math.round(readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length)
        : 0;
    const averageDiastolic = readings.length > 0
        ? Math.round(readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length)
        : 0;

    const saveMutation = useMutation({
        mutationFn: async () => {
            const sys = parseInt(systolic);
            const dia = parseInt(diastolic);
            const pul = pulse ? parseInt(pulse) : null;

            const logs = await base44.entities.DailyLog.filter({ date: today });
            const data = {
                date: today,
                blood_pressure: {
                    systolic: sys,
                    diastolic: dia,
                    pulse: pul,
                    time: format(new Date(), 'HH:mm')
                }
            };

            if (logs?.[0]) {
                await base44.entities.DailyLog.update(logs[0].id as string, data);
            } else {
                await base44.entities.DailyLog.create(data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bloodPressure'] });
            setShowForm(false);
            setSystolic('');
            setDiastolic('');
            setPulse('');
            toast.success('تم حفظ القراءة! 💓');
        }
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-red-500" />
                    <h2 className="text-lg font-bold text-slate-800">ضغط الدم</h2>
                </div>
                {!showForm && (
                    <Button
                        size="sm"
                        onClick={() => setShowForm(true)}
                        className="gradient-primary rounded-xl"
                    >
                        <Plus className="w-4 h-4 ml-1" />
                        قراءة جديدة
                    </Button>
                )}
            </div>

            {/* Latest Reading */}
            {latestReading && !showForm && (
                <div className={`rounded-2xl p-5 ${getBPStatus(latestReading.systolic, latestReading.diastolic).bg}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-slate-800">
                                    {latestReading.systolic}
                                </span>
                                <span className="text-2xl text-slate-500">/</span>
                                <span className="text-4xl font-bold text-slate-800">
                                    {latestReading.diastolic}
                                </span>
                                <span className="text-sm text-slate-500">mmHg</span>
                            </div>
                            {latestReading.pulse && (
                                <p className="text-sm text-slate-500 mt-1">
                                    النبض: {latestReading.pulse} نبضة/دقيقة
                                </p>
                            )}
                        </div>
                        <div className="text-center">
                            {React.createElement(getBPStatus(latestReading.systolic, latestReading.diastolic).icon, {
                                className: `w-10 h-10 ${getBPStatus(latestReading.systolic, latestReading.diastolic).color}`
                            })}
                            <p className={`text-sm font-medium ${getBPStatus(latestReading.systolic, latestReading.diastolic).color}`}>
                                {getBPStatus(latestReading.systolic, latestReading.diastolic).label}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-3">
                        آخر قراءة: {format(new Date(latestReading.date), 'dd MMMM', { locale: ar })} - {latestReading.time}
                    </p>
                </div>
            )}

            {/* Input Form */}
            {showForm && (
                <div className="glass rounded-2xl p-5 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">الانقباضي</label>
                            <Input
                                type="number"
                                placeholder="120"
                                value={systolic}
                                onChange={(e) => setSystolic(e.target.value)}
                                className="text-center text-lg font-bold rounded-xl"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">الانبساطي</label>
                            <Input
                                type="number"
                                placeholder="80"
                                value={diastolic}
                                onChange={(e) => setDiastolic(e.target.value)}
                                className="text-center text-lg font-bold rounded-xl"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">النبض</label>
                            <Input
                                type="number"
                                placeholder="70"
                                value={pulse}
                                onChange={(e) => setPulse(e.target.value)}
                                className="text-center text-lg font-bold rounded-xl"
                            />
                        </div>
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
                            disabled={!systolic || !diastolic || saveMutation.isPending}
                            className="flex-1 gradient-primary rounded-xl"
                        >
                            حفظ
                        </Button>
                    </div>
                </div>
            )}

            {/* Average */}
            {readings.length > 1 && (
                <div className="glass rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">المتوسط (آخر {readings.length} قراءات)</span>
                        <span className="font-bold text-slate-800">
                            {averageSystolic}/{averageDiastolic}
                        </span>
                    </div>
                </div>
            )}

            {/* History Chart */}
            {readings.length > 0 && (
                <div className="glass rounded-2xl p-4">
                    <h3 className="font-medium text-slate-700 mb-3">السجل</h3>
                    <div className="flex items-end justify-between h-24 gap-1">
                        {readings.slice(0, 7).reverse().map((reading, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                <div className="relative w-full">
                                    <div
                                        className="absolute bottom-0 w-full bg-red-400 rounded-t"
                                        style={{ height: `${(reading.systolic / 180) * 60}px` }}
                                    />
                                    <div
                                        className="absolute bottom-0 w-full bg-red-300 rounded-t"
                                        style={{ height: `${(reading.diastolic / 180) * 60}px` }}
                                    />
                                </div>
                                <span className="text-[9px] text-slate-400 mt-1">
                                    {format(new Date(reading.date), 'dd/MM')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Reference */}
            <div className="text-xs text-slate-400 text-center">
                المعدل الطبيعي: أقل من 120/80 mmHg
            </div>
        </div>
    );
}
