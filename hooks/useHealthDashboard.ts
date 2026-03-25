/**
 * useHealthDashboard — Central hook for computing REAL live health stats
 * from the user's actual data across the app.
 * 
 * Reads from:
 *   - db.entities.DailyLog       → health score, streak, mood, sleep/energy
 *   - db.entities.WaterLog       → today's water intake
 *   - db.entities.Appointment    → journey step: consultation booked?
 *   - db.entities.TriageRecord   → journey step: assessment done?
 *   - db.entities.DoseLog        → goal: medication taken today?
 *   - localStorage.tibrahRewards → reward points
 *   - localStorage.tibrah_triage_draft → has started triage?
 */

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';

/* ─── Types ─── */
export type JourneyStepStatus = 'done' | 'current' | 'pending';

export interface JourneyStep {
    label: string;
    status: JourneyStepStatus;
}

export interface HealthDashboardData {
    /** Overall health score 0-100, weighted from latest daily log */
    healthScore: number;
    /** Formatted Arabic score string e.g. "٧٢%" */
    healthScoreAr: string;
    /** Glasses of water today */
    waterToday: number;
    /** Water goal (cups) */
    waterGoal: number;
    /** Formatted water string e.g. "٤/٨" */
    waterAr: string;
    /** Consecutive days with a daily log */
    streak: number;
    /** Arabic streak string */
    streakAr: string;
    /** Goals completed / total */
    goalsCompleted: number;
    goalsTotal: number;
    /** Arabic goals string e.g. "٣/٥" */
    goalsAr: string;
    /** Journey progress steps with live status */
    journeySteps: JourneyStep[];
    /** Approximate sleep quality from latest log (mapped to hours) */
    sleepHoursLabel: string;
    /** Latest mood value 1-5 */
    latestMood: number;
    /** Whether user has logged today */
    hasLoggedToday: boolean;
    /** Reward points */
    rewardPoints: number;
    /** Is data still loading? */
    loading: boolean;
}

/* ─── Arabic numeral converter ─── */
const toArabicNumerals = (num: number): string => {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).split('').map(d => {
        const n = parseInt(d, 10);
        return isNaN(n) ? d : arabicDigits[n];
    }).join('');
};

/* ─── Date helpers ─── */
const getTodayString = () => new Date().toISOString().split('T')[0];

const getDateString = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
};

/* ─── The Hook ─── */
export function useHealthDashboard(): HealthDashboardData {
    const { user } = useAuth();
    const [data, setData] = useState<HealthDashboardData>({
        healthScore: 0,
        healthScoreAr: '٠%',
        waterToday: 0,
        waterGoal: 8,
        waterAr: '٠/٨',
        streak: 0,
        streakAr: '٠',
        goalsCompleted: 0,
        goalsTotal: 4,
        goalsAr: '٠/٤',
        journeySteps: [
            { label: 'التسجيل', status: 'pending' },
            { label: 'التقييم الأول', status: 'pending' },
            { label: 'الاستشارة', status: 'pending' },
            { label: 'خطة العلاج', status: 'pending' },
            { label: 'المتابعة', status: 'pending' },
        ],
        sleepHoursLabel: '—',
        latestMood: 0,
        hasLoggedToday: false,
        rewardPoints: 0,
        loading: true,
    });

    const fetchData = useCallback(async () => {
        if (!user?.id) {
            setData(prev => ({ ...prev, loading: false }));
            return;
        }

        try {
            const userId = user.id;
            const today = getTodayString();

            // ═══ Fetch all data in parallel ═══
            const [
                dailyLogs,
                waterLogs,
                appointments,
                triageRecords,
                doseLogs,
            ] = await Promise.all([
                db.entities.DailyLog.listForUser(userId, '-date', 60).catch(() => []),
                db.entities.WaterLog.listForUser(userId, '-created_at', 50).catch(() => []),
                db.entities.Appointment.listForUser(userId, '-date', 20).catch(() => []),
                db.entities.TriageRecord.listForUser(userId, '-date', 10).catch(() => []),
                db.entities.DoseLog.listForUser(userId, '-date', 30).catch(() => []),
            ]);

            // ═══ 1. HEALTH SCORE — from latest daily log ═══
            let healthScore = 0;
            let latestMood = 0;
            let sleepHoursLabel = '—';
            let hasLoggedToday = false;

            if (dailyLogs.length > 0) {
                const latest = dailyLogs[0] as any;
                const energy = Number(latest.energy_level || 0);    // 1-10
                const sleep = Number(latest.sleep_quality || 0);    // 1-10
                const mood = Number(latest.mood || 3);              // 1-5
                const pain = Number(latest.pain_level || 0);        // 0-10

                // Weighted score: energy 30%, sleep 30%, mood 25%, inversePain 15%
                const energyPct = (energy / 10) * 100;
                const sleepPct = (sleep / 10) * 100;
                const moodPct = (mood / 5) * 100;
                const painPct = ((10 - pain) / 10) * 100;

                healthScore = Math.round(
                    energyPct * 0.30 +
                    sleepPct * 0.30 +
                    moodPct * 0.25 +
                    painPct * 0.15
                );
                healthScore = Math.min(100, Math.max(0, healthScore));

                latestMood = mood;

                // Map sleep quality (1-10) to approximate hours
                const sleepHours = Math.round(3 + (sleep / 10) * 6); // 3-9 hours
                sleepHoursLabel = `${toArabicNumerals(sleepHours)}`;

                // Check if today is logged
                hasLoggedToday = (latest.date === today);
            }

            // ═══ 2. WATER TODAY — count entries created today ═══
            const waterToday = waterLogs.filter((w: any) => {
                const createdDate = (w.created_at || '').split('T')[0];
                return createdDate === today;
            }).length;

            // ═══ 3. STREAK — consecutive days with a DailyLog ═══
            let streak = 0;
            const logDates = new Set(dailyLogs.map((l: any) => l.date));
            for (let i = 0; i < 365; i++) {
                const checkDate = getDateString(i);
                if (logDates.has(checkDate)) {
                    streak++;
                } else {
                    // Allow skipping today (user may not have logged yet)
                    if (i === 0 && !logDates.has(today)) continue;
                    break;
                }
            }

            // ═══ 4. GOALS — real checks ═══
            const goalsTotal = 4;
            let goalsCompleted = 0;
            // Goal 1: Logged daily check-in today
            if (hasLoggedToday) goalsCompleted++;
            // Goal 2: Drank at least 1 glass of water today
            if (waterToday > 0) goalsCompleted++;
            // Goal 3: Took medication today
            const medsTodayCount = doseLogs.filter((d: any) => d.date === today && d.taken).length;
            if (medsTodayCount > 0) goalsCompleted++;
            // Goal 4: Has at least 3-day streak
            if (streak >= 3) goalsCompleted++;

            // ═══ 5. JOURNEY STEPS — based on real records ═══
            const isRegistered = !!user;
            const hasAssessment = triageRecords.length > 0;
            const hasDraft = typeof window !== 'undefined' && !!localStorage.getItem('tibrah_triage_draft');
            const hasConsultation = appointments.some((a: any) =>
                a.status === 'confirmed' || a.status === 'completed' || a.status === 'delivered'
            );
            const hasAnyAppointment = appointments.length > 0;
            const hasTreatmentPlan = dailyLogs.length >= 5; // Proxy: engaged enough for a plan
            const hasFollowUp = dailyLogs.length >= 14; // Proxy: sustained engagement

            const journeySteps: JourneyStep[] = [
                { label: 'التسجيل', status: isRegistered ? 'done' : 'current' },
                {
                    label: 'التقييم الأول',
                    status: hasAssessment ? 'done' : (hasDraft || isRegistered) ? 'current' : 'pending'
                },
                {
                    label: 'الاستشارة',
                    status: hasConsultation ? 'done' : hasAnyAppointment ? 'current' : (hasAssessment ? 'current' : 'pending')
                },
                {
                    label: 'خطة العلاج',
                    status: hasTreatmentPlan ? 'done' : hasConsultation ? 'current' : 'pending'
                },
                {
                    label: 'المتابعة',
                    status: hasFollowUp ? 'done' : hasTreatmentPlan ? 'current' : 'pending'
                },
            ];

            // ═══ 6. REWARD POINTS — from localStorage ═══
            let rewardPoints = 0;
            try {
                const saved = localStorage.getItem('tibrahRewards');
                if (saved) {
                    rewardPoints = JSON.parse(saved).points || 0;
                }
            } catch { }

            // ═══ Build final data ═══
            const waterGoal = 8;
            setData({
                healthScore,
                healthScoreAr: `${toArabicNumerals(healthScore)}%`,
                waterToday,
                waterGoal,
                waterAr: `${toArabicNumerals(waterToday)}/${toArabicNumerals(waterGoal)}`,
                streak,
                streakAr: toArabicNumerals(streak),
                goalsCompleted,
                goalsTotal,
                goalsAr: `${toArabicNumerals(goalsCompleted)}/${toArabicNumerals(goalsTotal)}`,
                journeySteps,
                sleepHoursLabel,
                latestMood,
                hasLoggedToday,
                rewardPoints,
                loading: false,
            });

        } catch (error) {
            console.error('[useHealthDashboard] Error fetching data:', error);
            setData(prev => ({ ...prev, loading: false }));
        }
    }, [user?.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Re-fetch when window gains focus (user returns from another page)
    useEffect(() => {
        const handleFocus = () => fetchData();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [fetchData]);

    return data;
}

export default useHealthDashboard;
