'use client';

import { useEffect, useRef } from 'react';
import { useNotifications } from '@/components/notification-engine';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { format } from 'date-fns';

export default function PredictiveEngine() {
    const { user } = useAuth();
    const { notifications, addNotification } = useNotifications();
    const checkedRef = useRef(false);

    useEffect(() => {
        // Only run for authenticated users and only once per session/mount
        if (!user || checkedRef.current) return;
        
        const runPredictiveChecks = async () => {
            try {
                // Fetch today's health metrics
                const healthMetrics = await db.entities.HealthMetric.listForUser(user.id);
                const dailyLogs = await db.entities.DailyLog.listForUser(user.id);
                const today = format(new Date(), 'yyyy-MM-dd');

                const todayMetrics = healthMetrics.filter(m => m.recorded_at.startsWith(today));
                
                // Track completed habits
                const todayWater = todayMetrics.filter(m => m.metric_type === 'water_intake').reduce((acc, curr) => acc + curr.value, 0);
                const hasBreathing = todayMetrics.some(m => m.metric_type === 'breathing_minutes');
                const hasMeds = todayMetrics.some(m => m.metric_type === 'medication_taken');
                const hasExercise = dailyLogs.some(l => l.date === today && l.exercise);

                // Helper to check if a notification with a specific title was already added today
                const hasNotificationToday = (title: string) => {
                    return notifications.some(n => 
                        n.title === title && 
                        format(new Date(n.timestamp), 'yyyy-MM-dd') === today
                    );
                };

                // Helper to safely add notification
                const checkAndNotify = (title: string, body: string, actionHref: string) => {
                    if (!hasNotificationToday(title)) {
                        addNotification(title, {
                            body,
                            type: 'info',
                            addToFeed: true,
                        });
                    }
                };

                // Time-based checks
                const hour = new Date().getHours();

                // 1. Water Reminder (If afternoon and water < 1.5L)
                if (hour >= 14 && todayWater < 1.5) {
                    checkAndNotify(
                        'تذكير بشرب الماء 💧',
                        'كمية الماء التي شربتها اليوم قليلة، لا تنسَ ترطيب جسمك.',
                        '/my-care'
                    );
                }

                // 2. Medication Reminder (If evening and meds not taken)
                if (hour >= 18 && !hasMeds) {
                    checkAndNotify(
                        'تذكير المكملات الغذائية 💊',
                        'حان وقت أخذ مكملاتك الغذائية الموصوفة لك اليوم.',
                        '/my-care'
                    );
                }

                // 3. Activity / Breathing check (End of day)
                if (hour >= 20 && !hasBreathing) {
                    checkAndNotify(
                        'جلسة استرخاء مسائية 🌬️',
                        'يوم طويل؟ خصص ٥ دقائق الآن لجلسة تنفس عميق قبل النوم.',
                        '/breathe'
                    );
                }

                // 4. Missing check-in
                const hasCheckin = dailyLogs.some(l => l.date === today && l.mood);
                if (hour >= 16 && !hasCheckin) {
                    checkAndNotify(
                        'كيف كان يومك؟ 🧠',
                        'لم تقم بتسجيل حالتك المزاجية اليوم، شاركنا شعورك الآن لنتتبع تقدمك.',
                        '/'
                    );
                }

            } catch (error) {
                console.error('Error running predictive engine:', error);
            } finally {
                checkedRef.current = true;
            }
        };

        // Delay checking slightly to ensure DB is loaded and context is ready
        const timeout = setTimeout(runPredictiveChecks, 3000);
        return () => clearTimeout(timeout);
    }, [user, notifications, addNotification]);

    return null; // This is a headless component
}
