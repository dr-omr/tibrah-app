import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import {
    Pill, Plus, Clock, Bell, Check, X, ChevronLeft,
    AlertCircle, Calendar, Droplets, BellRing, BellOff, Trash2, Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger
} from "@/components/ui/sheet";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
    showNotification,
    requestNotificationPermission,
    isNotificationSupported,
    getNotificationPermission
} from '@/lib/pushNotifications';
import { motion, AnimatePresence } from 'framer-motion';

// TypeScript Interfaces
interface Medication {
    id: string;
    name: string;
    dosage: string;
    unit: string;
    frequency: string;
    times: string[];
    start_date?: string;
    end_date?: string;
    remaining_quantity?: number;
    refill_reminder: boolean;
    notes?: string;
    color?: string;
    is_active: boolean;
}

interface MedicationLog {
    id: string;
    medication_id: string;
    taken_at: string;
    scheduled_time: string;
    status: 'taken' | 'skipped' | 'late';
}

const MEDICATION_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
];

const FREQUENCY_OPTIONS = [
    { value: 'once_daily', label: 'مرة يومياً', times: 1 },
    { value: 'twice_daily', label: 'مرتين يومياً', times: 2 },
    { value: 'three_times', label: 'ثلاث مرات يومياً', times: 3 },
    { value: 'as_needed', label: 'عند الحاجة', times: 0 },
    { value: 'weekly', label: 'أسبوعياً', times: 1 },
];

export default function MedicationReminder() {
    const [showAddSheet, setShowAddSheet] = useState(false);
    const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState<string>('default');
    const queryClient = useQueryClient();

    // Check notification permission on mount
    useEffect(() => {
        if (isNotificationSupported()) {
            setNotificationPermission(Notification.permission);
            const saved = localStorage.getItem('medicationNotifications');
            setNotificationsEnabled(saved === 'true' && Notification.permission === 'granted');
        }
    }, []);

    // Medication reminder checker
    useEffect(() => {
        if (!notificationsEnabled) return;

        const checkReminders = () => {
            const now = new Date();
            const currentTime = format(now, 'HH:mm');

            medications.filter(m => m.is_active).forEach(med => {
                med.times?.forEach(time => {
                    // Check if current time matches medication time (within 1 minute)
                    if (time === currentTime) {
                        const taken = todayLogs.some(
                            log => log.medication_id === med.id && log.scheduled_time === time
                        );

                        if (!taken) {
                            sendMedicationNotification(med, time);
                        }
                    }
                });
            });
        };

        // Check every minute
        const interval = setInterval(checkReminders, 60000);

        // Initial check
        checkReminders();

        return () => clearInterval(interval);
    }, [notificationsEnabled]);

    const sendMedicationNotification = (med: Medication, time: string) => {
        const lastNotifKey = `med_notif_${med.id}_${time}_${format(new Date(), 'yyyy-MM-dd')}`;
        const lastNotif = localStorage.getItem(lastNotifKey);

        if (!lastNotif) {
            showNotification(`💊 وقت ${med.name}`, {
                body: `${med.dosage} ${med.unit} - الساعة ${time}`,
                tag: `medication-${med.id}-${time}`,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                vibrate: [200, 100, 200, 100, 200],
                requireInteraction: true,
                silent: false
            });

            localStorage.setItem(lastNotifKey, Date.now().toString());
        }
    };

    const toggleNotifications = async () => {
        if (!notificationsEnabled) {
            // Enable notifications
            const granted = await requestNotificationPermission();
            if (granted) {
                setNotificationsEnabled(true);
                localStorage.setItem('medicationNotifications', 'true');
                setNotificationPermission('granted');
                toast.success('تم تفعيل إشعارات الأدوية 🔔');

                // Send test notification
                showNotification('✅ إشعارات الأدوية مفعلة', {
                    body: 'سيصلك تذكير عند موعد كل دواء',
                    tag: 'medication-enabled'
                });
            } else {
                toast.error('لم يتم منح إذن الإشعارات');
            }
        } else {
            // Disable notifications
            setNotificationsEnabled(false);
            localStorage.setItem('medicationNotifications', 'false');
            toast.info('تم إيقاف إشعارات الأدوية');
        }
    };

    // Fetch medications
    const { data: medications = [], isLoading } = useQuery<Medication[]>({
        queryKey: ['medications'],
        queryFn: async () => {
            try {
                const data = await db.entities.Medication.list();
                return data as unknown as Medication[];
            } catch {
                return [];
            }
        },
    });

    // Fetch today's logs
    const { data: todayLogs = [] } = useQuery<MedicationLog[]>({
        queryKey: ['medicationLogs', format(new Date(), 'yyyy-MM-dd')],
        queryFn: async () => {
            try {
                const today = format(new Date(), 'yyyy-MM-dd');
                const logs = await db.entities.MedicationLog.filter({
                    taken_at: { $gte: today }
                });
                return logs as unknown as MedicationLog[];
            } catch {
                return [];
            }
        },
    });

    // Log medication taken
    const logMedicationMutation = useMutation({
        mutationFn: async ({ medicationId, scheduledTime }: { medicationId: string; scheduledTime: string }) => {
            return db.entities.MedicationLog.create({
                medication_id: medicationId,
                taken_at: new Date().toISOString(),
                scheduled_time: scheduledTime,
                status: 'taken'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medicationLogs'] });
            toast.success('✅ تم تسجيل الجرعة بنجاح');
        },
    });

    // Delete medication
    const deleteMedicationMutation = useMutation({
        mutationFn: async (id: string) => {
            return db.entities.Medication.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medications'] });
            setSelectedMedication(null);
            toast.success('تم حذف الدواء');
        },
    });

    // Get scheduled doses for today
    const getTodaySchedule = () => {
        const schedule: Array<{ medication: Medication; time: string; taken: boolean }> = [];

        medications.filter(m => m.is_active).forEach(med => {
            med.times?.forEach(time => {
                const taken = todayLogs.some(
                    log => log.medication_id === med.id && log.scheduled_time === time
                );
                schedule.push({ medication: med, time, taken });
            });
        });

        return schedule.sort((a, b) => a.time.localeCompare(b.time));
    };

    const schedule = getTodaySchedule();
    const completedDoses = schedule.filter(s => s.taken).length;
    const totalDoses = schedule.length;
    const completionRate = totalDoses > 0 ? Math.round((completedDoses / totalDoses) * 100) : 0;

    // Get next upcoming dose
    const getNextDose = () => {
        const now = format(new Date(), 'HH:mm');
        return schedule.find(s => !s.taken && s.time >= now);
    };

    const nextDose = getNextDose();

    return (
        <div className="space-y-6">
            {/* Header Card - Apple Health Style */}
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                {/* Notification Toggle */}
                <button
                    onClick={toggleNotifications}
                    className={`absolute top-4 left-4 p-2 rounded-full transition-colors ${notificationsEnabled
                        ? 'bg-white/30 text-white'
                        : 'bg-white/10 text-white/60'
                        }`}
                >
                    {notificationsEnabled ? <BellRing className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                </button>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Pill className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">الأدوية</h2>
                            <p className="text-white/80 text-sm">تذكير وتتبع الجرعات</p>
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

                {/* Progress Ring */}
                <div className="flex items-center justify-center py-4">
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="12"
                                fill="none"
                            />
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="white"
                                strokeWidth="12"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${completionRate * 3.52} 352`}
                                className="transition-all duration-500"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold">{completionRate}%</span>
                            <span className="text-xs text-white/80">الالتزام</span>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-white/90">
                        {completedDoses} من {totalDoses} جرعات اليوم
                    </p>
                </div>

                {/* Notification Status Badge */}
                <div className={`mt-4 text-center py-2 rounded-xl ${notificationsEnabled
                    ? 'bg-white/20'
                    : 'bg-white/10'
                    }`}>
                    <span className="text-sm">
                        {notificationsEnabled
                            ? '🔔 الإشعارات مفعلة'
                            : '🔕 الإشعارات معطلة - اضغط على الجرس لتفعيلها'}
                    </span>
                </div>
            </div>

            {/* Next Dose Alert */}
            {nextDose && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: nextDose.medication.color || '#4ECDC4' }}
                        >
                            <Pill className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-amber-600 dark:text-amber-400">الجرعة القادمة</p>
                            <h3 className="font-bold text-amber-800 dark:text-amber-200">{nextDose.medication.name}</h3>
                            <p className="text-sm text-amber-600 dark:text-amber-400">
                                {nextDose.medication.dosage} {nextDose.medication.unit} • {nextDose.time}
                            </p>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => logMedicationMutation.mutate({
                                medicationId: nextDose.medication.id,
                                scheduledTime: nextDose.time
                            })}
                            disabled={logMedicationMutation.isPending}
                            className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                        >
                            <Check className="w-4 h-4 ml-1" />
                            تم
                        </Button>
                    </div>
                </div>
            )}

            {/* Today's Schedule */}
            <div className="glass rounded-3xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-[#2D9B83]" />
                    <h3 className="font-bold text-slate-800 dark:text-white">جدول اليوم</h3>
                </div>

                {schedule.length === 0 ? (
                    <div className="text-center py-8">
                        <Pill className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                        <p className="text-slate-500 dark:text-slate-400">لا توجد أدوية مجدولة</p>
                        <Button
                            variant="outline"
                            className="mt-3"
                            onClick={() => setShowAddSheet(true)}
                        >
                            <Plus className="w-4 h-4 ml-2" />
                            أضف دواء
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {schedule.map((item, index) => (
                            <div
                                key={`${item.medication.id}-${item.time}-${index}`}
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${item.taken
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-[#2D9B83]/30'
                                    }`}
                            >
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: item.medication.color || '#4ECDC4' }}
                                >
                                    <Pill className="w-6 h-6 text-white" />
                                </div>

                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-800 dark:text-white">{item.medication.name}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {item.medication.dosage} {item.medication.unit} • {item.time}
                                    </p>
                                </div>

                                {item.taken ? (
                                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                        <Check className="w-5 h-5 text-white" />
                                    </div>
                                ) : (
                                    <Button
                                        size="icon"
                                        className="w-10 h-10 rounded-full bg-[#2D9B83] hover:bg-[#2D9B83]/90"
                                        onClick={() => logMedicationMutation.mutate({
                                            medicationId: item.medication.id,
                                            scheduledTime: item.time
                                        })}
                                        disabled={logMedicationMutation.isPending}
                                    >
                                        <Check className="w-5 h-5" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Medications List */}
            <div className="glass rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-[#D4AF37]" />
                        <h3 className="font-bold text-slate-800 dark:text-white">قائمة الأدوية</h3>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{medications.length} دواء</span>
                </div>

                <div className="space-y-2">
                    {medications.map(med => (
                        <div
                            key={med.id}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            onClick={() => setSelectedMedication(med)}
                        >
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: med.color || '#4ECDC4' }}
                            >
                                <Pill className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-slate-800 dark:text-white">{med.name}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{med.dosage} • {med.times?.join(', ')}</p>
                            </div>
                            {med.remaining_quantity && med.remaining_quantity < 10 && (
                                <div className="flex items-center gap-1 text-amber-500">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-xs font-medium">{med.remaining_quantity}</span>
                                </div>
                            )}
                            <ChevronLeft className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Medication Sheet */}
            <AddMedicationSheet
                open={showAddSheet}
                onOpenChange={setShowAddSheet}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['medications'] });
                    setShowAddSheet(false);
                }}
            />

            {/* Medication Details Sheet */}
            {selectedMedication && (
                <Sheet open={!!selectedMedication} onOpenChange={() => setSelectedMedication(null)}>
                    <SheetContent side="bottom" className="rounded-t-3xl max-h-[70vh]">
                        <SheetHeader>
                            <SheetTitle className="text-right text-xl">{selectedMedication.name}</SheetTitle>
                        </SheetHeader>
                        <div className="py-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                    style={{ backgroundColor: selectedMedication.color || '#4ECDC4' }}
                                >
                                    <Pill className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-800 dark:text-white">
                                        {selectedMedication.dosage} {selectedMedication.unit}
                                    </p>
                                    <p className="text-slate-500 dark:text-slate-400">
                                        {FREQUENCY_OPTIONS.find(o => o.value === selectedMedication.frequency)?.label}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">أوقات التناول:</p>
                                <div className="flex gap-2 flex-wrap">
                                    {selectedMedication.times?.map((time, i) => (
                                        <span key={i} className="px-3 py-1 bg-white dark:bg-slate-700 rounded-full text-sm font-medium">
                                            {time}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <Button
                                variant="destructive"
                                className="w-full rounded-xl"
                                onClick={() => deleteMedicationMutation.mutate(selectedMedication.id)}
                            >
                                <Trash2 className="w-4 h-4 ml-2" />
                                حذف الدواء
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            )}
        </div>
    );
}

// Add Medication Sheet Component
function AddMedicationSheet({
    open,
    onOpenChange,
    onSuccess
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        unit: 'حبة',
        frequency: 'once_daily',
        times: ['08:00'],
        color: MEDICATION_COLORS[0],
        notes: '',
        refill_reminder: true,
        is_active: true
    });

    const addMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            return db.entities.Medication.create(data);
        },
        onSuccess: () => {
            toast.success('تم إضافة الدواء بنجاح');
            onSuccess();
            setFormData({
                name: '',
                dosage: '',
                unit: 'حبة',
                frequency: 'once_daily',
                times: ['08:00'],
                color: MEDICATION_COLORS[0],
                notes: '',
                refill_reminder: true,
                is_active: true
            });
        },
        onError: () => {
            toast.error('حدث خطأ في إضافة الدواء');
        }
    });

    const handleFrequencyChange = (freq: string) => {
        const option = FREQUENCY_OPTIONS.find(o => o.value === freq);
        let times: string[] = [];

        if (option?.times === 1) times = ['08:00'];
        else if (option?.times === 2) times = ['08:00', '20:00'];
        else if (option?.times === 3) times = ['08:00', '14:00', '20:00'];

        setFormData({ ...formData, frequency: freq, times });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-right text-xl">إضافة دواء جديد</SheetTitle>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    {/* Medication Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">اسم الدواء</label>
                        <Input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="مثال: باراسيتامول"
                            className="h-12 rounded-xl"
                        />
                    </div>

                    {/* Dosage */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الجرعة</label>
                            <Input
                                value={formData.dosage}
                                onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                                placeholder="500mg"
                                className="h-12 rounded-xl"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الوحدة</label>
                            <select
                                value={formData.unit}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-4"
                            >
                                <option value="حبة">حبة</option>
                                <option value="كبسولة">كبسولة</option>
                                <option value="ملعقة">ملعقة</option>
                                <option value="ml">مل</option>
                            </select>
                        </div>
                    </div>

                    {/* Frequency */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">التكرار</label>
                        <div className="grid grid-cols-2 gap-2">
                            {FREQUENCY_OPTIONS.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => handleFrequencyChange(option.value)}
                                    className={`p-3 rounded-xl text-sm font-medium transition-all ${formData.frequency === option.value
                                        ? 'bg-[#2D9B83] text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Times */}
                    {formData.times.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">أوقات التناول</label>
                            <div className="flex flex-wrap gap-2">
                                {formData.times.map((time, index) => (
                                    <Input
                                        key={index}
                                        type="time"
                                        value={time}
                                        onChange={e => {
                                            const newTimes = [...formData.times];
                                            newTimes[index] = e.target.value;
                                            setFormData({ ...formData, times: newTimes });
                                        }}
                                        className="w-32 h-12 rounded-xl text-center"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Color Picker */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">لون التذكير</label>
                        <div className="flex gap-2">
                            {MEDICATION_COLORS.map(color => (
                                <button
                                    key={color}
                                    onClick={() => setFormData({ ...formData, color })}
                                    className={`w-10 h-10 rounded-full transition-all ${formData.color === color ? 'ring-2 ring-offset-2 ring-[#2D9B83] scale-110' : ''
                                        }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={() => addMutation.mutate(formData)}
                        disabled={!formData.name || !formData.dosage || addMutation.isPending}
                        className="w-full h-14 rounded-2xl gradient-primary text-white font-bold text-lg"
                    >
                        <Plus className="w-5 h-5 ml-2" />
                        إضافة الدواء
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
