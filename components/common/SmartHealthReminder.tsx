/**
 * SmartHealthReminder — Context-aware health reminders based on time of day
 * Shows gentle reminders for water, meals, sleep, movement
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplets, Moon, Sun, Utensils, Activity, Clock } from 'lucide-react';

interface Reminder {
    id: string;
    icon: React.ReactNode;
    message: string;
    color: string;
    timeRange: [number, number]; // [startHour, endHour]
}

const reminders: Reminder[] = [
    {
        id: 'morning-water',
        icon: <Droplets className="w-5 h-5" />,
        message: 'صباح الخير! 💧 ابدأ يومك بكوب ماء دافئ',
        color: 'from-blue-400 to-cyan-400',
        timeRange: [6, 9],
    },
    {
        id: 'breakfast',
        icon: <Utensils className="w-5 h-5" />,
        message: '🥗 وقت الفطور! وجبة صحية = يوم مثالي',
        color: 'from-orange-400 to-amber-400',
        timeRange: [7, 10],
    },
    {
        id: 'midday-water',
        icon: <Droplets className="w-5 h-5" />,
        message: '💧 تذكير: هل شربت ما يكفي من الماء اليوم؟',
        color: 'from-blue-400 to-cyan-400',
        timeRange: [11, 13],
    },
    {
        id: 'lunch',
        icon: <Utensils className="w-5 h-5" />,
        message: '🍽️ وقت الغداء! تناول وجبة متوازنة',
        color: 'from-green-400 to-emerald-400',
        timeRange: [12, 14],
    },
    {
        id: 'afternoon-move',
        icon: <Activity className="w-5 h-5" />,
        message: '🚶 حان وقت الحركة! 10 دقائق مشي تصنع فرقاً',
        color: 'from-purple-400 to-violet-400',
        timeRange: [15, 17],
    },
    {
        id: 'evening-water',
        icon: <Droplets className="w-5 h-5" />,
        message: '💧 آخر تذكير: أكمل هدفك اليومي من الماء',
        color: 'from-blue-400 to-cyan-400',
        timeRange: [17, 19],
    },
    {
        id: 'dinner',
        icon: <Utensils className="w-5 h-5" />,
        message: '🥗 وقت العشاء! وجبة خفيفة قبل النوم بـ3 ساعات',
        color: 'from-teal-400 to-emerald-400',
        timeRange: [18, 20],
    },
    {
        id: 'wind-down',
        icon: <Moon className="w-5 h-5" />,
        message: '🌙 وقت الاسترخاء! قلل الشاشات واستعد للنوم',
        color: 'from-indigo-400 to-purple-400',
        timeRange: [21, 23],
    },
    {
        id: 'sleep',
        icon: <Moon className="w-5 h-5" />,
        message: '😴 وقت النوم! 7-8 ساعات نوم = جسم سليم',
        color: 'from-slate-500 to-slate-700',
        timeRange: [23, 24],
    },
];

const DISMISSED_KEY = 'tibrah_dismissed_reminders';

export default function SmartHealthReminder() {
    const [activeReminder, setActiveReminder] = useState<Reminder | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const checkReminder = () => {
            const now = new Date();
            const hour = now.getHours();
            const today = now.toISOString().split('T')[0];

            // Get dismissed reminders for today
            let dismissed: string[] = [];
            try {
                const stored = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '{}');
                dismissed = stored[today] || [];
            } catch { /* ignore */ }

            // Find matching reminder
            const matching = reminders.find(r =>
                hour >= r.timeRange[0] &&
                hour < r.timeRange[1] &&
                !dismissed.includes(r.id)
            );

            if (matching) {
                setActiveReminder(matching);
                // Show after 5 seconds to not interrupt initial load
                setTimeout(() => setIsVisible(true), 5000);
            }
        };

        checkReminder();
        // Re-check every 30 minutes
        const interval = setInterval(checkReminder, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const dismiss = () => {
        if (!activeReminder) return;
        setIsVisible(false);

        const today = new Date().toISOString().split('T')[0];
        try {
            const stored = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '{}');
            stored[today] = [...(stored[today] || []), activeReminder.id];
            localStorage.setItem(DISMISSED_KEY, JSON.stringify(stored));
        } catch { /* ignore */ }

        setTimeout(() => setActiveReminder(null), 300);
    };

    return (
        <AnimatePresence>
            {isVisible && activeReminder && (
                <motion.div
                    initial={{ y: -80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -80, opacity: 0 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="fixed top-16 left-4 right-4 z-[997] max-w-md mx-auto"
                >
                    <div className={`bg-gradient-to-r ${activeReminder.color} rounded-2xl p-4 shadow-xl flex items-center gap-3`}>
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white flex-shrink-0">
                            {activeReminder.icon}
                        </div>
                        <p className="flex-1 text-sm text-white font-medium leading-relaxed" dir="rtl">
                            {activeReminder.message}
                        </p>
                        <button
                            onClick={dismiss}
                            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white/80 hover:text-white flex-shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
