// pages/health-tracker.tsx  ✦ V2 — Command Center Edition
// Redesigned orchestrator using the new modular tracker components.
// Preserved all existing Pro feature tabs, only redesigned the frame.

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

import SEO                  from '@/components/common/SEO';
import ProtectedRoute       from '@/components/common/ProtectedRoute';
import { useHealthTracker } from '@/hooks/useHealthTracker';
import { initializeNotifications } from '@/lib/pushNotifications';
import { DailyLog }        from '@/Entities/DailyLog';
import { type MetricKey }   from '@/components/health-tracker/tracker-tokens';

// ─── New Architecture ─────────────────────────────────────────────
import TrackerHeader                   from '@/components/health-tracker/TrackerHeader';
import { TrackerSummary }              from '@/components/health-tracker/TrackerSummary';
import { TrackerQuickLog }             from '@/components/health-tracker/TrackerQuickLog';
import { type TrackerRingsData }       from '@/components/health-tracker/TrackerMetricRings';

// ─── Preserved Pro Tabs ───────────────────────────────────────────
const WaterTrackerPro      = dynamic(() => import('@/components/health-tracker/WaterTrackerPro'),      { ssr: false });
const SleepTrackerPro      = dynamic(() => import('@/components/health-tracker/SleepTrackerPro'),      { ssr: false });
const MedicationReminderPro= dynamic(() => import('@/components/health-tracker/MedicationReminderPro'),{ ssr: false });
const ActivityFitnessPro   = dynamic(() => import('@/components/health-tracker/ActivityFitnessPro'),   { ssr: false });
const MentalHealthHub      = dynamic(() => import('@/components/health-tracker/MentalHealthHub'),      { ssr: false });
const WeightBodyTrackerPro = dynamic(() => import('@/components/health-tracker/WeightBodyTrackerPro'), { ssr: false });
const BloodPressureTracker = dynamic(() => import('@/components/health-tracker/BloodPressureTracker'), { ssr: false });
const FastingTimerPro      = dynamic(() => import('@/components/health-tracker/FastingTimerPro'),      { ssr: false });
const BreathingExercises   = dynamic(() => import('@/components/health-tracker/BreathingExercises'),   { ssr: false });
const HistoryViewPro       = dynamic(() => import('@/components/health-tracker/HistoryViewPro'),       { ssr: false });
const WeeklyHealthReport   = dynamic(() => import('@/components/health-tracker/WeeklyHealthReport'),   { ssr: false });
const AddMetricSheet       = dynamic(() => import('@/components/health-tracker/AddMetricSheet'),       { ssr: false });
const SymptomLogger        = dynamic(() => import('@/components/health-tracker/SymptomLogger'),        { ssr: false });
const DailyCheckIn         = dynamic(() => import('@/components/health-tracker/DailyCheckIn'),         { ssr: false });

// ─── Tabs ─────────────────────────────────────────────────────────
const VALID_TABS = [
    'summary','activity','water','sleep','meds','mood',
    'weight','bp','fasting','breathing','history','report',
] as const;
type Tab = typeof VALID_TABS[number];

// ─── Tab-to-metric mapping (for QuickLog) ─────────────────────────
const TAB_METRIC: Partial<Record<Tab, MetricKey>> = {
    water: 'water', sleep: 'sleep', activity: 'activity',
    meds: 'meds', mood: 'mood', weight: 'weight', bp: 'bp',
};

/* ── Slide-in page transition ── */
function TabPage({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="pt-4 pb-4">
            {children}
        </motion.div>
    );
}

/* ════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════ */
export default function HealthTracker() {
    const router     = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('summary');
    const [quickLogOpen, setQuickLogOpen] = useState(false);

    const {
        metrics, symptoms, dailyLogs,
        showAddMetric, setShowAddMetric,
        showSymptomLogger, setShowSymptomLogger,
        showDailyCheckIn, setShowDailyCheckIn,
        addMetricMutation, addSymptomMutation, addDailyLogMutation,
        handleUpdate,
    } = useHealthTracker();

    // Notifications
    useEffect(() => { initializeNotifications(); }, []);

    // URL tab sync
    useEffect(() => {
        const tab = router.query.tab as string;
        if (tab && (VALID_TABS as readonly string[]).includes(tab)) {
            setActiveTab(tab as Tab);
        }
    }, [router.query.tab]);

    // Derive rings data from real metrics/logs
    // DailyLog fields: water_glasses (number), mood (1-5), sleep_hours, exercise_minutes
    const latestLog = dailyLogs?.[0];
    const ringsData: TrackerRingsData = useMemo(() => {
        const waterGoal   = 8; // glasses per day
        const waterGlasses = latestLog?.water_glasses ?? 4;
        const sleepH       = latestLog?.sleep_hours   ?? 6.5;
        const actMin       = latestLog?.exercise_minutes ?? 15;
        // mood is 1-5, map to 0-10
        const moodScore    = latestLog?.mood != null ? latestLog.mood * 2 : 6;
        const medsM        = (metrics as Record<string, unknown>[]).filter(m => (m as Record<string,unknown>).type === 'medication');
        const medsTaken    = medsM.filter(m => Boolean((m as Record<string,unknown>).taken)).length;

        return {
            waterPct:       waterGlasses / waterGoal,
            sleepHours:     sleepH,
            activityMin:    actMin,
            moodScore:      moodScore,
            medsCount:      medsTaken,
            medsTotalCount: Math.max(medsM.length, 1),
        };
    }, [latestLog, metrics]);

    // Hours since last log
    const lastLogHours = useMemo(() => {
        if (!latestLog?.created_at) return undefined;
        return Math.round((Date.now() - new Date(latestLog.created_at).getTime()) / 3600000);
    }, [latestLog]);

    // QuickLog save handler — maps to correct DailyLog field names
    const handleQuickSave = (key: MetricKey, value: number) => {
        const today = new Date().toISOString().split('T')[0];
        if (key === 'water') {
            // value is glasses
            addDailyLogMutation.mutate({ date: today, water_glasses: Math.round(value) } as DailyLog);
        } else if (key === 'sleep') {
            addDailyLogMutation.mutate({ date: today, sleep_hours: value } as DailyLog);
        } else if (key === 'activity') {
            addDailyLogMutation.mutate({ date: today, exercise_minutes: Math.round(value) } as DailyLog);
        } else if (key === 'mood') {
            // mood picker returns 1-10, store as 1-5
            addDailyLogMutation.mutate({ date: today, mood: Math.round(value / 2) } as DailyLog);
        } else {
            // weight, bp etc → store as raw HealthMetric
            addMetricMutation.mutate({ type: key, value, recorded_at: new Date().toISOString() } as Record<string, unknown>);
        }
    };

    return (
        <ProtectedRoute requireAuth={true}>
            <div className="min-h-screen pb-28"
                style={{ background: 'linear-gradient(160deg, #f8fafc 0%, #ffffff 50%, #f8fafc 100%)' }}>
                <SEO title="تتبّعي — طِبرَا" description="مركز التتبع الصحي الشخصي" />

                {/* ── New Header ── */}
                <TrackerHeader
                    activeTab={activeTab}
                    setActiveTab={(tab) => setActiveTab(tab as Tab)}
                    onQuickLog={() => setQuickLogOpen(true)}
                    lastLogHoursAgo={lastLogHours}
                />

                {/* ── Content ── */}
                <div className="relative">

                    {/* SUMMARY — Command Center */}
                    {activeTab === 'summary' && (
                        <TabPage>
                            <TrackerSummary
                                rings={ringsData}
                                metrics={metrics}
                                symptoms={symptoms}
                            />
                        </TabPage>
                    )}

                    {/* PRO FEATURE TABS — preserved exactly */}
                    {activeTab === 'water'    && <TabPage><WaterTrackerPro /></TabPage>}
                    {activeTab === 'sleep'    && <TabPage><SleepTrackerPro /></TabPage>}
                    {activeTab === 'meds'     && <TabPage><MedicationReminderPro /></TabPage>}
                    {activeTab === 'activity' && <TabPage><ActivityFitnessPro /></TabPage>}
                    {activeTab === 'mood'     && <TabPage><MentalHealthHub /></TabPage>}
                    {activeTab === 'weight'   && <TabPage><WeightBodyTrackerPro /></TabPage>}
                    {activeTab === 'bp'       && <TabPage><BloodPressureTracker /></TabPage>}
                    {activeTab === 'fasting'  && <TabPage><FastingTimerPro /></TabPage>}
                    {activeTab === 'breathing'&& <TabPage><BreathingExercises /></TabPage>}

                    {activeTab === 'history' && (
                        <TabPage>
                            <HistoryViewPro metrics={metrics} dailyLogs={dailyLogs} symptoms={symptoms} />
                        </TabPage>
                    )}
                    {activeTab === 'report' && (
                        <TabPage>
                            <WeeklyHealthReport dailyLogs={dailyLogs} metrics={metrics} />
                        </TabPage>
                    )}
                </div>

                {/* ── Global Sheets & Modals ── */}
                <AddMetricSheet
                    open={showAddMetric}
                    onOpenChange={setShowAddMetric}
                    onSubmit={(data) => addMetricMutation.mutate(data)}
                    selectedMetric={null}
                />
                <SymptomLogger
                    open={showSymptomLogger}
                    onOpenChange={setShowSymptomLogger}
                    onSubmit={(data) => addSymptomMutation.mutate(data)}
                />
                <DailyCheckIn
                    open={showDailyCheckIn}
                    onOpenChange={setShowDailyCheckIn}
                    onSubmit={(data: DailyLog) => addDailyLogMutation.mutate(data)}
                />

                {/* ── Quick Log Sheet (new) ── */}
                <TrackerQuickLog
                    isOpen={quickLogOpen}
                    onClose={() => setQuickLogOpen(false)}
                    onSave={handleQuickSave}
                    initialTab={TAB_METRIC[activeTab] ?? 'water'}
                />
            </div>
        </ProtectedRoute>
    );
}
