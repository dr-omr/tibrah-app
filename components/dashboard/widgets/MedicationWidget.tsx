import React, { useMemo, useState } from 'react';
import { Pill, Check, Clock, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Medication {
    id: string;
    name: string;
    dosage?: string;
    times?: string[]; // ["08:00", "20:00"]
    [key: string]: any;
}

interface MedicationLog {
    medication_id: string;
    taken_at: string; // ISO string
    [key: string]: any;
}

interface MedicationWidgetProps {
    medications: Medication[];
    logs: MedicationLog[];
    onUpdate: () => void;
}

export const MedicationWidget = ({ medications, logs, onUpdate }: MedicationWidgetProps) => {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    // Calculate next dose
    const nextDose = useMemo(() => {
        const now = new Date();
        const currentTime = format(now, 'HH:mm');
        const today = format(now, 'yyyy-MM-dd');

        let candidates: Array<{ med: Medication, time: string, status: 'overdue' | 'next' }> = [];

        medications.forEach(med => {
            if (!med.times || med.times.length === 0) return;

            med.times.forEach(time => {
                // Check if already taken today
                // Simple logic: if a log exists for this med around this time today
                // For simplicity MVP: just check if ANY log exists for this med today (assuming 1 dose/day or handled loosely)
                // Better: check count. 
                // Let's go with: filteredLogs length < times length -> logic needed to know WHICH time.

                // Precise Logic:
                // We don't track *which* scheduled time was taken, just *that* it was taken.
                // So we assume logs correspond to earliest schedules.
                const takenCount = logs.filter(l => l.medication_id === med.id).length;
                const scheduleIndex = med.times!.indexOf(time);

                if (scheduleIndex >= takenCount) {
                    // This dose is pending
                    if (time < currentTime) {
                        candidates.push({ med, time, status: 'overdue' });
                    } else {
                        candidates.push({ med, time, status: 'next' });
                    }
                }
            });
        });

        // Sort: Overdue first, then by time
        candidates.sort((a, b) => {
            if (a.status !== b.status) return a.status === 'overdue' ? -1 : 1;
            return a.time.localeCompare(b.time);
        });

        return candidates[0] || null;
    }, [medications, logs]);

    const handleTake = async () => {
        if (!nextDose) return;
        setLoadingId(nextDose.med.id);

        try {
            await base44.entities.MedicationLog.create({
                medication_id: nextDose.med.id,
                taken_at: new Date().toISOString(),
                status: 'taken'
            });
            toast.success(`تم تسجيل ${nextDose.med.name}`);
            onUpdate();
        } catch (error) {
            toast.error("فشل تسجيل الدواء");
        } finally {
            setLoadingId(null);
        }
    };

    const totalDoses = medications.reduce((acc, med) => acc + (med.times?.length || 0), 0);
    const takenDoses = logs.length;
    const progress = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

    return (
        <div className="glass rounded-2xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-500">
                        <Pill className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">الأدوية</h3>
                        <p className="text-sm text-slate-500">
                            {takenDoses} / {totalDoses} جرعات ({progress}%)
                        </p>
                    </div>
                </div>
                {nextDose && (
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${nextDose.status === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                        <Clock className="w-3 h-3" />
                        {nextDose.time}
                    </div>
                )}
            </div>

            {nextDose ? (
                <div className="bg-white/50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="font-bold text-slate-800 text-sm">{nextDose.med.name}</p>
                        <p className="text-xs text-slate-500">{nextDose.med.dosage || 'جرعة اعتيادية'}</p>
                    </div>
                    <Button
                        size="sm"
                        className={`${nextDose.status === 'overdue' ? 'bg-red-500 hover:bg-red-600' : 'bg-[#2D9B83] hover:bg-[#258570]'
                            } text-white shadow-md active:scale-95 transition-all`}
                        onClick={handleTake}
                        disabled={!!loadingId}
                    >
                        {loadingId ? <Loader2 className="w-4 h-4 animate-spin" /> : 'أخذ الآن'}
                    </Button>
                </div>
            ) : (
                <div className="bg-green-50 rounded-xl p-3 border border-green-100 flex items-center gap-3 text-green-700">
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-medium">أنت ملتزم بجميع أدويتك!</span>
                </div>
            )}

            {/* Progress Bar */}
            <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};
