// components/health-tracker/MedicationReminderPro.tsx
// PREMIUM Interactive Medication Manager with Pill Box Visual

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Pill, Plus, Check, Clock, Bell, Calendar,
    AlertCircle, Award, Sparkles, X, ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from 'sonner';
import { format, isToday, subDays, isSameDay } from 'date-fns';
import { ar } from 'date-fns/locale';

// Pill colors for visual variety
const PILL_COLORS = [
    { bg: 'from-red-400 to-rose-500', light: 'bg-red-50' },
    { bg: 'from-blue-400 to-indigo-500', light: 'bg-blue-50' },
    { bg: 'from-green-400 to-emerald-500', light: 'bg-green-50' },
    { bg: 'from-purple-400 to-violet-500', light: 'bg-purple-50' },
    { bg: 'from-amber-400 to-orange-500', light: 'bg-amber-50' },
    { bg: 'from-cyan-400 to-teal-500', light: 'bg-cyan-50' },
];

// Time slots
const TIME_SLOTS = [
    { id: 'morning', name: 'صباحاً', icon: '🌅', time: '08:00' },
    { id: 'noon', name: 'ظهراً', icon: '☀️', time: '12:00' },
    { id: 'evening', name: 'مساءً', icon: '🌆', time: '18:00' },
    { id: 'night', name: 'ليلاً', icon: '🌙', time: '22:00' },
];

interface Medication {
    id?: string;
    name: string;
    dosage: string;
    times: string[];
    color: number;
    notes?: string;
}

interface DoseLog {
    id?: string;
    medicationId: string;
    date: string;
    time: string;
    taken: boolean;
}

export default function MedicationReminderPro() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const queryClient = useQueryClient();

    // State
    const [showAddSheet, setShowAddSheet] = useState(false);
    const [newMedName, setNewMedName] = useState('');
    const [newMedDosage, setNewMedDosage] = useState('');
    const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
    const [selectedColor, setSelectedColor] = useState(0);
    const [showCelebration, setShowCelebration] = useState(false);

    // Fetch medications
    const { data: medications = [] } = useQuery<Medication[]>({
        queryKey: ['medicationsPro'],
        queryFn: async () => {
            try {
                const meds = await db.entities.Medication.list();
                return meds as unknown as Medication[];
            } catch {
                return [];
            }
        },
    });

    // Fetch today's dose logs
    const { data: todayLogs = [] } = useQuery<DoseLog[]>({
        queryKey: ['doseLogs', today],
        queryFn: async () => {
            try {
                const logs = await db.entities.DoseLog.filter({ date: today });
                return logs as unknown as DoseLog[];
            } catch {
                return [];
            }
        },
    });

    // Calculate adherence score
    const totalDosesToday = medications.reduce((sum, med) => sum + med.times.length, 0);
    const takenDosesToday = todayLogs.filter(log => log.taken).length;
    const adherenceScore = totalDosesToday > 0 ? Math.round((takenDosesToday / totalDosesToday) * 100) : 0;

    // Check if dose taken
    const isDoseTaken = (medicationId: string, timeSlot: string) => {
        return todayLogs.some(log =>
            log.medicationId === medicationId &&
            log.time === timeSlot &&
            log.taken
        );
    };

    // Add medication
    const addMedication = useMutation({
        mutationFn: async () => {
            return db.entities.Medication.create({
                name: newMedName,
                dosage: newMedDosage,
                times: selectedTimes,
                color: selectedColor,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medicationsPro'] });
            setShowAddSheet(false);
            setNewMedName('');
            setNewMedDosage('');
            setSelectedTimes([]);
            toast.success('تمت إضافة الدواء 💊');
        },
    });

    // Log dose
    const logDose = useMutation({
        mutationFn: async ({ medicationId, time }: { medicationId: string; time: string }) => {
            const existing = todayLogs.find(log =>
                log.medicationId === medicationId && log.time === time
            );

            if (existing) {
                return db.entities.DoseLog.update(existing.id as string, { taken: !existing.taken });
            }

            return db.entities.DoseLog.create({
                medicationId,
                date: today,
                time,
                taken: true
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doseLogs'] });

            // Check if all doses taken
            const newTaken = takenDosesToday + 1;
            if (newTaken >= totalDosesToday && totalDosesToday > 0) {
                setShowCelebration(true);
                setTimeout(() => setShowCelebration(false), 3000);
                toast.success('🎉 ممتاز! أخذت كل أدويتك اليوم');
            } else {
                toast.success('تم ✓');
            }
        },
    });

    // Delete medication
    const deleteMedication = useMutation({
        mutationFn: async (id: string) => {
            return db.entities.Medication.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medicationsPro'] });
            toast.success('تم حذف الدواء');
        },
    });

    // Group medications by time
    const getMedicationsForTime = (timeSlot: string) => {
        return medications.filter(med => med.times.includes(timeSlot));
    };

    return (
        <motion.div
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Main Card */}
            <motion.div
                className="relative bg-gradient-to-br from-teal-500 via-emerald-500 to-green-600 rounded-[2.5rem] p-6 text-white overflow-hidden shadow-2xl"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
            >
                {/* Floating pills */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-2xl"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                y: [0, -20, 0],
                                x: [0, Math.random() * 10 - 5, 0],
                                rotate: [0, 10, -10, 0],
                                opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        >
                            💊
                        </motion.div>
                    ))}
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <motion.div
                            className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm"
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <Pill className="w-7 h-7" />
                        </motion.div>
                        <div>
                            <h2 className="text-2xl font-bold">أدويتي</h2>
                            <p className="text-white/80 text-sm">{medications.length} دواء مسجل</p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowAddSheet(true)}
                        className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center backdrop-blur-sm"
                    >
                        <Plus className="w-6 h-6" />
                    </motion.button>
                </div>

                {/* Adherence Circle */}
                <div className="flex justify-center mb-6 relative z-10">
                    <motion.div
                        className="relative w-40 h-40"
                        whileHover={{ scale: 1.02 }}
                    >
                        {/* Glow */}
                        {adherenceScore === 100 && (
                            <motion.div
                                className="absolute inset-0 rounded-full bg-white/30 blur-xl"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        )}

                        {/* Ring */}
                        <svg className="w-full h-full transform -rotate-90">
                            <defs>
                                <linearGradient id="adherenceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#34D399" />
                                    <stop offset="100%" stopColor="#10B981" />
                                </linearGradient>
                            </defs>
                            <circle
                                cx="80" cy="80" r="70"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="12"
                                fill="none"
                            />
                            <motion.circle
                                cx="80" cy="80" r="70"
                                stroke="url(#adherenceGrad)"
                                strokeWidth="12"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 70}
                                initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - adherenceScore / 100) }}
                                transition={{ duration: 1 }}
                            />
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span
                                className="text-4xl font-bold"
                                key={adherenceScore}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                            >
                                {adherenceScore}%
                            </motion.span>
                            <span className="text-sm text-white/80">الالتزام</span>
                        </div>
                    </motion.div>
                </div>

                {/* Today's Progress */}
                <div className="text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                        <Check className="w-5 h-5" />
                        <span>{takenDosesToday} من {totalDosesToday} جرعات اليوم</span>
                    </div>
                </div>

                {/* Celebration */}
                <AnimatePresence>
                    {showCelebration && (
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-20 rounded-[2.5rem]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="text-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                            >
                                <motion.div
                                    className="text-7xl mb-4"
                                    animate={{ rotate: [0, -10, 10, 0] }}
                                    transition={{ repeat: 2 }}
                                >
                                    🏆
                                </motion.div>
                                <div className="text-2xl font-bold">ممتاز!</div>
                                <div className="text-white/80">أكملت كل أدويتك اليوم</div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Time Slots */}
            {TIME_SLOTS.map((slot, slotIndex) => {
                const slotMeds = getMedicationsForTime(slot.id);
                if (slotMeds.length === 0) return null;

                return (
                    <motion.div
                        key={slot.id}
                        className="bg-white rounded-2xl p-5 shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: slotIndex * 0.1 }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">{slot.icon}</span>
                            <div>
                                <h3 className="font-bold text-slate-800">{slot.name}</h3>
                                <p className="text-sm text-slate-500">{slot.time}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {slotMeds.map((med, medIndex) => {
                                const taken = isDoseTaken(med.id || '', slot.id);
                                const colorScheme = PILL_COLORS[med.color % PILL_COLORS.length];

                                return (
                                    <motion.div
                                        key={med.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: medIndex * 0.05 }}
                                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${taken ? 'bg-green-50' : colorScheme.light
                                            }`}
                                    >
                                        {/* Pill indicator */}
                                        <motion.div
                                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorScheme.bg} flex items-center justify-center text-white shadow-lg`}
                                            whileHover={{ rotate: 10 }}
                                        >
                                            {taken ? (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                >
                                                    <Check className="w-6 h-6" />
                                                </motion.div>
                                            ) : (
                                                <Pill className="w-6 h-6" />
                                            )}
                                        </motion.div>

                                        {/* Medication info */}
                                        <div className="flex-1">
                                            <h4 className={`font-bold ${taken ? 'text-green-700 line-through' : 'text-slate-800'}`}>
                                                {med.name}
                                            </h4>
                                            <p className={`text-sm ${taken ? 'text-green-600' : 'text-slate-500'}`}>
                                                {med.dosage}
                                            </p>
                                        </div>

                                        {/* Take button */}
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => logDose.mutate({ medicationId: med.id || '', time: slot.id })}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center ${taken
                                                ? 'bg-green-500 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            <Check className="w-5 h-5" />
                                        </motion.button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                );
            })}

            {/* Empty State */}
            {medications.length === 0 && (
                <motion.div
                    className="bg-white rounded-2xl p-8 text-center shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-6xl mb-4"
                    >
                        💊
                    </motion.div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">لا توجد أدوية مسجلة</h3>
                    <p className="text-slate-500 mb-4">أضف أدويتك لتتبع مواعيدها</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAddSheet(true)}
                        className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-full font-bold shadow-lg"
                    >
                        <Plus className="w-5 h-5 inline ml-2" />
                        إضافة دواء
                    </motion.button>
                </motion.div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                <motion.div
                    className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-4 text-center shadow-lg"
                    whileHover={{ y: -3, scale: 1.02 }}
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2.5 }}
                    >
                        <Award className="w-7 h-7 mx-auto mb-2 text-emerald-500" />
                    </motion.div>
                    <div className="text-2xl font-bold text-emerald-700">{adherenceScore}%</div>
                    <div className="text-[10px] text-emerald-600 font-medium">الالتزام اليوم</div>
                </motion.div>

                <motion.div
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 text-center shadow-lg"
                    whileHover={{ y: -3, scale: 1.02 }}
                >
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <Pill className="w-7 h-7 mx-auto mb-2 text-blue-500" />
                    </motion.div>
                    <div className="text-2xl font-bold text-blue-700">{medications.length}</div>
                    <div className="text-[10px] text-blue-600 font-medium">أدوية مسجلة</div>
                </motion.div>

                <motion.div
                    className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 text-center shadow-lg"
                    whileHover={{ y: -3, scale: 1.02 }}
                >
                    <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        <Bell className="w-7 h-7 mx-auto mb-2 text-amber-500" />
                    </motion.div>
                    <div className="text-2xl font-bold text-amber-700">{totalDosesToday}</div>
                    <div className="text-[10px] text-amber-600 font-medium">جرعات اليوم</div>
                </motion.div>
            </div>

            {/* Add Medication Sheet */}
            <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
                <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-auto">
                    <SheetHeader className="pb-4">
                        <SheetTitle className="text-center text-xl">إضافة دواء جديد 💊</SheetTitle>
                    </SheetHeader>

                    <div className="space-y-6 py-4">
                        {/* Name Input */}
                        <div>
                            <label className="text-sm font-medium text-slate-600 mb-2 block">اسم الدواء</label>
                            <input
                                type="text"
                                value={newMedName}
                                onChange={(e) => setNewMedName(e.target.value)}
                                placeholder="مثال: فيتامين د"
                                className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-lg"
                            />
                        </div>

                        {/* Dosage Input */}
                        <div>
                            <label className="text-sm font-medium text-slate-600 mb-2 block">الجرعة</label>
                            <input
                                type="text"
                                value={newMedDosage}
                                onChange={(e) => setNewMedDosage(e.target.value)}
                                placeholder="مثال: حبة واحدة"
                                className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>

                        {/* Time Selection */}
                        <div>
                            <label className="text-sm font-medium text-slate-600 mb-3 block">أوقات الدواء</label>
                            <div className="grid grid-cols-2 gap-3">
                                {TIME_SLOTS.map((slot, i) => (
                                    <motion.button
                                        key={slot.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => {
                                            setSelectedTimes(prev =>
                                                prev.includes(slot.id)
                                                    ? prev.filter(t => t !== slot.id)
                                                    : [...prev, slot.id]
                                            );
                                        }}
                                        className={`p-4 rounded-2xl flex items-center gap-3 transition-all ${selectedTimes.includes(slot.id)
                                            ? 'bg-emerald-500 text-white shadow-lg'
                                            : 'bg-slate-100 hover:bg-slate-200'
                                            }`}
                                    >
                                        <span className="text-2xl">{slot.icon}</span>
                                        <div className="text-right">
                                            <div className="font-bold">{slot.name}</div>
                                            <div className={`text-sm ${selectedTimes.includes(slot.id) ? 'text-white/80' : 'text-slate-500'}`}>
                                                {slot.time}
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Color Selection */}
                        <div>
                            <label className="text-sm font-medium text-slate-600 mb-3 block">لون الدواء</label>
                            <div className="flex gap-3 justify-center">
                                {PILL_COLORS.map((color, i) => (
                                    <motion.button
                                        key={i}
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setSelectedColor(i)}
                                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${color.bg} ${selectedColor === i ? 'ring-4 ring-offset-2 ring-slate-300' : ''
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Save Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => addMedication.mutate()}
                            disabled={!newMedName || selectedTimes.length === 0 || addMedication.isPending}
                            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-2xl py-5 text-lg font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Pill className="w-5 h-5" />
                            إضافة الدواء
                        </motion.button>
                    </div>
                </SheetContent>
            </Sheet>
        </motion.div>
    );
}
