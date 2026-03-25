import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

import SEO from '@/components/common/SEO';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { useHealthTracker } from '@/hooks/useHealthTracker';
import HealthTrackerNav from '@/components/health-tracker/HealthTrackerNav';
import { initializeNotifications } from '@/lib/pushNotifications';
import { DOCTOR_KNOWLEDGE } from '@/lib/doctorContext';
import { DailyLog } from '@/Entities/DailyLog';

// Dynamic imports - only loaded when user navigates to tab
const HealthSummary = dynamic(() => import('@/components/health-tracker/HealthSummary'), { ssr: false });
const ActivityRings = dynamic(() => import('@/components/health-tracker/ActivityRings'), { ssr: false });
const MoodTracker = dynamic(() => import('@/components/health-tracker/MoodTracker'), { ssr: false });
const BloodPressureTracker = dynamic(() => import('@/components/health-tracker/BloodPressureTracker'), { ssr: false });
const BreathingExercises = dynamic(() => import('@/components/health-tracker/BreathingExercises'), { ssr: false });
const TodayView = dynamic(() => import('@/components/health-tracker/TodayView'), { ssr: false });
const AIHealthAnalysis = dynamic(() => import('@/components/health-tracker/AIHealthAnalysis'), { ssr: false });
const HistoryViewPro = dynamic(() => import('@/components/health-tracker/HistoryViewPro'), { ssr: false });
const MetricsView = dynamic(() => import('@/components/health-tracker/MetricsView'), { ssr: false });
const JournalView = dynamic(() => import('@/components/health-tracker/JournalView'), { ssr: false });
const AddMetricSheet = dynamic(() => import('@/components/health-tracker/AddMetricSheet'), { ssr: false });
const SymptomLogger = dynamic(() => import('@/components/health-tracker/SymptomLogger'), { ssr: false });
const DailyCheckIn = dynamic(() => import('@/components/health-tracker/DailyCheckIn'), { ssr: false });
const AIContextAssistant = dynamic(() => import('@/components/ai/AIContextAssistant'), { ssr: false });
const InsightCard = dynamic(() => import('@/components/health-tracker/InsightCard'), { ssr: false });
const ActionGrid = dynamic(() => import('@/components/health-tracker/ActionGrid'), { ssr: false });
const MoodSymptomPicker = dynamic(() => import('@/components/health-tracker/MoodSymptomPicker'), { ssr: false });
const WeeklyHealthReport = dynamic(() => import('@/components/health-tracker/WeeklyHealthReport'), { ssr: false });
const WearablesSync = dynamic(() => import('@/components/health-tracker/WearablesSync'), { ssr: false });

// PRO Components
const WaterTrackerPro = dynamic(() => import('@/components/health-tracker/WaterTrackerPro'), { ssr: false });
const SleepTrackerPro = dynamic(() => import('@/components/health-tracker/SleepTrackerPro'), { ssr: false });
const ActivityFitnessPro = dynamic(() => import('@/components/health-tracker/ActivityFitnessPro'), { ssr: false });
const MentalHealthHub = dynamic(() => import('@/components/health-tracker/MentalHealthHub'), { ssr: false });
const WeightBodyTrackerPro = dynamic(() => import('@/components/health-tracker/WeightBodyTrackerPro'), { ssr: false });
const FastingTimerPro = dynamic(() => import('@/components/health-tracker/FastingTimerPro'), { ssr: false });
const MedicationReminderPro = dynamic(() => import('@/components/health-tracker/MedicationReminderPro'), { ssr: false });

export default function HealthTracker() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('summary');

    const {
        metrics,
        symptoms,
        dailyLogs,
        showAddMetric,
        setShowAddMetric,
        showSymptomLogger,
        setShowSymptomLogger,
        showDailyCheckIn,
        setShowDailyCheckIn,
        addMetricMutation,
        addSymptomMutation,
        addDailyLogMutation,
        handleUpdate
    } = useHealthTracker();

    // Initialize notifications
    useEffect(() => {
        initializeNotifications();
    }, []);

    // Handle URL tab parameter
    useEffect(() => {
        const tab = router.query.tab as string;
        if (tab && ['summary', 'activity', 'water', 'sleep', 'meds', 'mood', 'history', 'report', 'weight', 'bp', 'fasting', 'breathing'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [router.query.tab]);

    return (
        <ProtectedRoute requireAuth={true}>
            <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 pb-24">
                <SEO title="تتبع صحتي — طِبرَا" description="مركز التتبع الصحي الشامل" />

                {/* Extracted Global Top Navigation Header */}
                <HealthTrackerNav activeTab={activeTab} setActiveTab={setActiveTab} />

                {/* ╔════════════════════════════════════╗
                   ║  CONTENT ROUTER                    ║
                   ╚════════════════════════════════════╝ */}
                <div className="px-4 pt-5">

                    {/* ━━━ SUMMARY TAB ━━━ */}
                    {activeTab === 'summary' && (
                        <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                            
                            {/* WEARABLES SYNC WIDGET */}
                            <WearablesSync />

                            {/* Hero Insight Cards Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <InsightCard title="اعرف نفسك" subtitle="اكتشف عوائق فقدان الوزن" emoji="🧠" color="purple" size="large" onClick={() => setActiveTab('mood')} />
                                <InsightCard title="نتائج مرئية" subtitle="تابع تقدمك" emoji="📊" color="blue" size="large" onClick={() => setActiveTab('history')} />
                            </div>

                            <ActionGrid
                                onActionClick={(id) => {
                                    if (id === 'water') setActiveTab('water');
                                    else if (id === 'sleep') setActiveTab('sleep');
                                    else if (id === 'meds') setActiveTab('meds');
                                    else if (id === 'weight') setActiveTab('weight');
                                    else if (id === 'workout') setActiveTab('activity');
                                    else if (id === 'heart') setActiveTab('bp');
                                }}
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <InsightCard title="اختبار اللياقة" subtitle="اكتشف مستواك" emoji="💪" color="orange" onClick={() => setActiveTab('activity')} />
                                <InsightCard title="تخطيط الوجبات" subtitle="خطة غذائية مخصصة" emoji="🥗" color="green" onClick={() => router.push('/meal-planner')} />
                            </div>

                            <HealthSummary />

                            <AIContextAssistant
                                contextType="health_tracker"
                                contextData={{ metrics: metrics.slice(0, 5), symptoms: symptoms.slice(0, 5) }}
                                knowledgeBase={DOCTOR_KNOWLEDGE}
                                title="مساعدك الصحي"
                            />
                        </motion.div>
                    )}

                    {/* ━━━ DIRECT FEATURE TABS ━━━ */}
                    {activeTab === 'water' && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><WaterTrackerPro /></motion.div>}
                    {activeTab === 'sleep' && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><SleepTrackerPro /></motion.div>}
                    {activeTab === 'meds' && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><MedicationReminderPro /></motion.div>}
                    {activeTab === 'activity' && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><ActivityFitnessPro /></motion.div>}
                    {activeTab === 'mood' && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><MentalHealthHub /></motion.div>}
                    {activeTab === 'weight' && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><WeightBodyTrackerPro /></motion.div>}
                    {activeTab === 'bp' && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><BloodPressureTracker /></motion.div>}
                    {activeTab === 'fasting' && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><FastingTimerPro /></motion.div>}
                    {activeTab === 'breathing' && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><BreathingExercises /></motion.div>}

                    {/* ━━━ TODAY VIEW ━━━ */}
                    {activeTab === 'today' && (
                        <div className="space-y-5">
                            <TodayView
                                metrics={metrics}
                                dailyLogs={dailyLogs}
                                symptoms={symptoms}
                                onUpdate={handleUpdate}
                                onLogSymptom={() => setShowSymptomLogger(true)}
                                onCheckIn={() => setShowDailyCheckIn(true)}
                                onAddMetric={() => setShowAddMetric(true)}
                            />
                            <div>
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <Sparkles className="w-4 h-4 text-amber-500" />
                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">تحليل الذكاء الاصطناعي</h3>
                                </div>
                                <AIHealthAnalysis metrics={metrics} symptoms={symptoms} dailyLogs={dailyLogs} />
                            </div>
                        </div>
                    )}

                    {/* ━━━ HISTORY ━━━ */}
                    {activeTab === 'history' && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                            <HistoryViewPro metrics={metrics} dailyLogs={dailyLogs} symptoms={symptoms} />
                        </motion.div>
                    )}

                    {/* ━━━ WEEKLY REPORT ━━━ */}
                    {activeTab === 'report' && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                            <WeeklyHealthReport dailyLogs={dailyLogs} metrics={metrics} />
                        </motion.div>
                    )}

                    {/* ━━━ METRICS VIEW ━━━ */}
                    {activeTab === 'metrics' && (
                        <MetricsView metrics={metrics} symptoms={symptoms} onAddMetric={() => setShowAddMetric(true)} />
                    )}

                    {/* ━━━ JOURNAL VIEW ━━━ */}
                    {activeTab === 'journal' && (
                        <JournalView
                            onSubmitLog={(data: DailyLog) => addDailyLogMutation.mutate(data)}
                            onSubmitSymptom={(data: Record<string, unknown>) => addSymptomMutation.mutate(data)}
                        />
                    )}
                </div>

                {/* ─── Global Modals & Sheets ─── */}
                <AddMetricSheet
                    open={showAddMetric}
                    onOpenChange={setShowAddMetric}
                    onSubmit={(data: Record<string, unknown>) => addMetricMutation.mutate(data)}
                    selectedMetric={null}
                />

                <SymptomLogger
                    open={showSymptomLogger}
                    onOpenChange={setShowSymptomLogger}
                    onSubmit={(data: Record<string, unknown>) => addSymptomMutation.mutate(data)}
                />

                <DailyCheckIn
                    open={showDailyCheckIn}
                    onOpenChange={setShowDailyCheckIn}
                    onSubmit={(data: DailyLog) => addDailyLogMutation.mutate(data)}
                />
            </div>
        </ProtectedRoute>
    );
}
