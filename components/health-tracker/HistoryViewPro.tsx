// components/health-tracker/HistoryViewPro.tsx
// PREMIUM Professional History View with Timeline & Stats

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, ChevronLeft, ChevronRight, Droplets, Moon,
    Heart, Activity, Pill, Clock, TrendingUp, Filter
} from 'lucide-react';
import { format, subDays, isSameDay, startOfWeek, addDays, isToday } from 'date-fns';
import { ar } from 'date-fns/locale';

// Category filters
const CATEGORIES = [
    { id: 'all', label: 'الكل', icon: Calendar, color: 'bg-slate-500' },
    { id: 'water', label: 'الماء', icon: Droplets, color: 'bg-cyan-500' },
    { id: 'sleep', label: 'النوم', icon: Moon, color: 'bg-indigo-500' },
    { id: 'mood', label: 'المزاج', icon: Heart, color: 'bg-pink-500' },
    { id: 'activity', label: 'النشاط', icon: Activity, color: 'bg-orange-500' },
    { id: 'meds', label: 'الأدوية', icon: Pill, color: 'bg-emerald-500' },
];

interface HistoryViewProProps {
    metrics?: any[];
    dailyLogs?: any[];
    symptoms?: any[];
}

export default function HistoryViewPro({ metrics = [], dailyLogs = [], symptoms = [] }: HistoryViewProProps) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeFilter, setActiveFilter] = useState('all');
    const [weekOffset, setWeekOffset] = useState(0);

    // Generate week days
    const weekDays = useMemo(() => {
        const start = startOfWeek(subDays(new Date(), weekOffset * 7), { weekStartsOn: 6 });
        return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }, [weekOffset]);

    // Helper to get mood value
    const getMoodValue = (log: any) => {
        if (!log?.mood) return 0;
        if (typeof log.mood === 'object') return log.mood.overall || 0;
        return log.mood;
    };

    // Get status for a day
    const getDayStatus = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const log = dailyLogs.find((l: any) => l.date === dateStr);
        if (log) {
            const mood = getMoodValue(log);
            if (mood >= 4) return 'excellent';
            if (mood >= 3) return 'good';
            if (mood >= 2) return 'neutral';
            return 'low';
        }
        return 'empty';
    };

    const statusColors: Record<string, string> = {
        excellent: 'bg-emerald-500',
        good: 'bg-green-400',
        neutral: 'bg-amber-400',
        low: 'bg-red-400',
        empty: 'bg-gray-200'
    };

    // Selected day data
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const selectedLog = dailyLogs.find((l: any) => l.date === selectedDateStr);
    const selectedSymptoms = symptoms.filter((s: any) => s.recorded_at?.startsWith(selectedDateStr));

    // Generate timeline events
    const timelineEvents = useMemo(() => {
        const events: any[] = [];

        // Add daily log info
        if (selectedLog) {
            if (selectedLog.water_glasses) {
                events.push({
                    id: 'water',
                    icon: Droplets,
                    title: 'شرب الماء',
                    value: `${selectedLog.water_glasses} أكواب`,
                    color: 'bg-cyan-500',
                    time: '09:00'
                });
            }
            if (selectedLog.sleep_hours) {
                events.push({
                    id: 'sleep',
                    icon: Moon,
                    title: 'النوم',
                    value: `${selectedLog.sleep_hours} ساعات`,
                    color: 'bg-indigo-500',
                    time: '07:00'
                });
            }
            if (getMoodValue(selectedLog)) {
                const moodVal = getMoodValue(selectedLog);
                const moodLabels = ['', 'سيء جداً', 'سيء', 'معتدل', 'جيد', 'ممتاز'];
                events.push({
                    id: 'mood',
                    icon: Heart,
                    title: 'المزاج',
                    value: moodLabels[moodVal] || 'غير محدد',
                    color: 'bg-pink-500',
                    time: '12:00'
                });
            }
        }

        // Add symptoms
        selectedSymptoms.forEach((s: any, i: number) => {
            events.push({
                id: `symptom-${i}`,
                icon: Activity,
                title: s.symptom_name || 'عرض',
                value: `شدة ${s.severity}/10`,
                color: 'bg-orange-500',
                time: format(new Date(s.recorded_at), 'HH:mm')
            });
        });

        // Filter by category
        if (activeFilter !== 'all') {
            return events.filter(e => e.id.startsWith(activeFilter));
        }

        return events.sort((a, b) => a.time.localeCompare(b.time));
    }, [selectedLog, selectedSymptoms, activeFilter]);

    return (
        <div className="space-y-4">
            {/* Week Navigation */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => setWeekOffset(w => w + 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <h3 className="font-bold text-gray-800">
                        {format(weekDays[0], 'MMM d', { locale: ar })} - {format(weekDays[6], 'MMM d', { locale: ar })}
                    </h3>
                    <button
                        onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
                        disabled={weekOffset === 0}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                </div>

                {/* Week Days */}
                <div className="flex justify-between gap-1">
                    {weekDays.map((day) => {
                        const isSelected = isSameDay(day, selectedDate);
                        const status = getDayStatus(day);
                        const dayIsToday = isToday(day);

                        return (
                            <button
                                key={day.toString()}
                                onClick={() => setSelectedDate(day)}
                                className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all ${isSelected
                                        ? 'bg-emerald-500 text-white shadow-lg'
                                        : dayIsToday
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-[10px] font-medium mb-0.5">
                                    {format(day, 'EEE', { locale: ar })}
                                </span>
                                <span className="text-sm font-bold mb-1">
                                    {format(day, 'd')}
                                </span>
                                <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : statusColors[status]
                                    }`} />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveFilter(cat.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeFilter === cat.id
                                ? `${cat.color} text-white shadow-md`
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <cat.icon className="w-3.5 h-3.5" />
                        <span>{cat.label}</span>
                    </button>
                ))}
            </div>

            {/* Stats Summary Cards */}
            {selectedLog && (
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-3 text-center">
                        <Droplets className="w-5 h-5 mx-auto mb-1 text-cyan-600" />
                        <div className="text-lg font-bold text-cyan-700">{selectedLog.water_glasses || 0}</div>
                        <div className="text-[10px] text-cyan-600">أكواب ماء</div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-3 text-center">
                        <Moon className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                        <div className="text-lg font-bold text-indigo-700">{selectedLog.sleep_hours || 0}</div>
                        <div className="text-[10px] text-indigo-600">ساعات نوم</div>
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-3 text-center">
                        <Heart className="w-5 h-5 mx-auto mb-1 text-pink-600" />
                        <div className="text-lg font-bold text-pink-700">{getMoodValue(selectedLog) || '-'}</div>
                        <div className="text-[10px] text-pink-600">المزاج</div>
                    </div>
                </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-gray-800">الجدول الزمني</h3>
                    <span className="text-xs text-gray-500">
                        {format(selectedDate, 'EEEE d MMMM', { locale: ar })}
                    </span>
                </div>

                {timelineEvents.length > 0 ? (
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute top-0 bottom-0 right-[19px] w-0.5 bg-gray-100" />

                        <div className="space-y-3">
                            {timelineEvents.map((event, index) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-start gap-3 relative"
                                >
                                    <div className={`w-10 h-10 rounded-full ${event.color} flex items-center justify-center shadow-md z-10`}>
                                        <event.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 bg-gray-50 rounded-xl p-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-semibold text-gray-800">{event.title}</div>
                                                <div className="text-sm text-gray-500">{event.value}</div>
                                            </div>
                                            <span className="text-xs text-gray-400">{event.time}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>لا توجد سجلات لهذا اليوم</p>
                        <p className="text-xs mt-1">ابدأ بتسجيل نشاطك اليومي</p>
                    </div>
                )}
            </div>

            {/* Symptoms if any */}
            {selectedSymptoms.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-orange-500" />
                        الأعراض المسجلة
                    </h3>
                    <div className="space-y-2">
                        {selectedSymptoms.map((symptom: any, i: number) => (
                            <div key={i} className="flex items-center justify-between bg-orange-50 rounded-lg p-3">
                                <span className="font-medium text-orange-800">{symptom.symptom_name}</span>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-16 bg-orange-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-orange-500 rounded-full"
                                            style={{ width: `${(symptom.severity / 10) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-orange-600">{symptom.severity}/10</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
