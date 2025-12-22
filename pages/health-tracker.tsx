import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import {
    ChevronLeft, BarChart3, Calendar, FileText, LayoutDashboard, Sparkles,
    Droplets, Moon, Pill, Activity, Heart, Brain, Timer, Scale, Stethoscope
} from 'lucide-react';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '../utils';
import HealthSummary from '@/components/health-tracker/HealthSummary';
// Legacy components (keeping for reference)
import WaterTracker from '@/components/health-tracker/WaterTracker';
import SleepTracker from '@/components/health-tracker/SleepTracker';
import MedicationReminder from '@/components/health-tracker/MedicationReminder';
import ActivityRings from '@/components/health-tracker/ActivityRings';
import MoodTracker from '@/components/health-tracker/MoodTracker';
import WeightTracker from '@/components/health-tracker/WeightTracker';
import BloodPressureTracker from '@/components/health-tracker/BloodPressureTracker';
import FastingTimer from '@/components/health-tracker/FastingTimer';
import BreathingExercises from '@/components/health-tracker/BreathingExercises';
import TodayView from '@/components/health-tracker/TodayView';
import AIHealthAnalysis from '@/components/health-tracker/AIHealthAnalysis';
import HistoryView from '@/components/health-tracker/HistoryView';
import HistoryViewPro from '@/components/health-tracker/HistoryViewPro';
import MetricsView from '@/components/health-tracker/MetricsView';
import JournalView from '@/components/health-tracker/JournalView';
import AddMetricSheet from '@/components/health-tracker/AddMetricSheet';
import SymptomLogger from '@/components/health-tracker/SymptomLogger';
import DailyCheckIn from '@/components/health-tracker/DailyCheckIn';
import AIContextAssistant from '@/components/ai/AIContextAssistant';
import { DOCTOR_KNOWLEDGE } from '@/lib/doctorContext';
import { DailyLog } from '@/Entities/DailyLog';
import { initializeNotifications } from '@/lib/pushNotifications';
import InsightCard from '@/components/health-tracker/InsightCard';
import ActionGrid from '@/components/health-tracker/ActionGrid';
import MoodSymptomPicker from '@/components/health-tracker/MoodSymptomPicker';
import { motion, AnimatePresence } from 'framer-motion';

// NEW PRO COMPONENTS - Complete Rebuild
import WaterTrackerPro from '@/components/health-tracker/WaterTrackerPro';
import SleepTrackerPro from '@/components/health-tracker/SleepTrackerPro';
import ActivityFitnessPro from '@/components/health-tracker/ActivityFitnessPro';
import MentalHealthHub from '@/components/health-tracker/MentalHealthHub';
import WeightBodyTrackerPro from '@/components/health-tracker/WeightBodyTrackerPro';
import FastingTimerPro from '@/components/health-tracker/FastingTimerPro';
import MedicationReminderPro from '@/components/health-tracker/MedicationReminderPro';

interface NavItemProps {
    id: string;
    icon: any;
    label: string;
}

export default function HealthTracker() {
    const router = useRouter();
    const { user } = useAuth(); // Use Auth Context
    const [activeTab, setActiveTab] = useState('summary');
    const [showAddMetric, setShowAddMetric] = useState(false);
    const [showSymptomLogger, setShowSymptomLogger] = useState(false);
    const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);

    const queryClient = useQueryClient();

    // Initialize notifications
    useEffect(() => {
        initializeNotifications();
    }, []);

    // Handle URL tab parameter
    useEffect(() => {
        const tab = router.query.tab as string;
        if (tab && ['summary', 'today', 'water', 'sleep', 'meds', 'history', 'metrics', 'journal'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [router.query.tab]);

    // Data Fetching directly from db
    const { data: metrics = [] } = useQuery({
        queryKey: ['healthMetrics'],
        queryFn: () => db.entities.HealthMetric.list('-recorded_at', 100),
    });

    const { data: symptoms = [] } = useQuery({
        queryKey: ['symptoms'],
        queryFn: () => db.entities.SymptomLog.list('-recorded_at', 50),
    });

    const { data: dailyLogs = [] } = useQuery<DailyLog[]>({
        queryKey: ['dailyLogs'],
        queryFn: async () => {
            const logs = await db.entities.DailyLog.list('-date', 30);
            return logs as unknown as DailyLog[];
        },
    });

    // Mutations
    const addMetricMutation = useMutation({
        mutationFn: (data: Record<string, unknown>) => db.entities.HealthMetric.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['healthMetrics'] });
            setShowAddMetric(false);
        },
    });

    const addSymptomMutation = useMutation({
        mutationFn: (data: Record<string, unknown>) => db.entities.SymptomLog.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['symptoms'] });
            setShowSymptomLogger(false);
        },
    });

    const addDailyLogMutation = useMutation({
        mutationFn: async (data: DailyLog) => {
            const existing = dailyLogs.find(l => l.date === data.date);
            if (existing?.id) {
                return db.entities.DailyLog.update(existing.id, data);
            }
            return db.entities.DailyLog.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dailyLogs'] });
            setShowDailyCheckIn(false);
        },
    });

    const handleUpdate = () => {
        queryClient.invalidateQueries({ queryKey: ['healthMetrics'] });
        queryClient.invalidateQueries({ queryKey: ['dailyLogs'] });
    };

    // Navigation tabs configuration - More tabs for comprehensive health
    const tabs = [
        { id: 'summary', icon: Heart, label: 'ملخص' },
        { id: 'activity', icon: Activity, label: 'النشاط' },
        { id: 'water', icon: Droplets, label: 'الماء' },
        { id: 'sleep', icon: Moon, label: 'النوم' },
        { id: 'meds', icon: Pill, label: 'الأدوية' },
        { id: 'mood', icon: Heart, label: 'المزاج' },
        { id: 'history', icon: Calendar, label: 'السجل' },
    ];

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    // Simple professional NavItem
    const NavItem = ({ id, icon: Icon, label }: NavItemProps) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 min-w-[56px] ${activeTab === id
                ? 'bg-white text-emerald-600 shadow-lg'
                : 'text-white/80 hover:bg-white/10'
                }`}
        >
            <Icon className={`w-5 h-5 mb-1 ${activeTab === id ? 'text-emerald-600' : ''}`} />
            <span className={`text-[10px] font-semibold ${activeTab === id ? 'text-emerald-600' : ''}`}>{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Clean Professional Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 pb-4 pt-safe relative">
                {/* Top Bar - Title & Actions */}
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/">
                        <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                    </Link>

                    <h1 className="text-white font-bold text-lg">تتبع صحتي</h1>

                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>

                {/* Search Bar - Expandable */}
                {showSearch && (
                    <div className="px-4 pb-3">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث في السجلات الصحية..."
                                className="w-full bg-white/20 backdrop-blur-sm text-white placeholder-white/60 rounded-xl py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-white/50"
                                autoFocus
                            />
                            <svg className="w-5 h-5 text-white/60 absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                )}

                {/* Quick Actions Row - Premium Pills */}
                <div className="px-3 pb-3">
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => setActiveTab('weight')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeTab === 'weight'
                                ? 'bg-white text-emerald-600 shadow-lg'
                                : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                        >
                            <span className="text-sm">⚖️</span>
                            <span>الوزن</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('bp')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeTab === 'bp'
                                ? 'bg-white text-emerald-600 shadow-lg'
                                : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                        >
                            <span className="text-sm">💓</span>
                            <span>الضغط</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('fasting')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeTab === 'fasting'
                                ? 'bg-white text-emerald-600 shadow-lg'
                                : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                        >
                            <span className="text-sm">⏱️</span>
                            <span>الصيام</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('breathing')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeTab === 'breathing'
                                ? 'bg-white text-emerald-600 shadow-lg'
                                : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                        >
                            <span className="text-sm">🌬️</span>
                            <span>التنفس</span>
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs - Scrollable */}
                <div className="overflow-x-auto scrollbar-hide">
                    <div className="flex gap-1.5 px-3 pb-2 min-w-max">
                        {tabs.map((tab) => (
                            <NavItem key={tab.id} id={tab.id} icon={tab.icon} label={tab.label} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="px-4 -mt-4 relative z-20">
                {/* Summary View - Apple Style */}
                {activeTab === 'summary' && (
                    <motion.div
                        className="space-y-6 pt-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Hero Insight Cards Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <InsightCard
                                title="اعرف نفسك"
                                subtitle="اكتشف عوائق فقدان الوزن"
                                emoji="🧠"
                                color="purple"
                                size="large"
                                onClick={() => setActiveTab('mood')}
                            />
                            <InsightCard
                                title="نتائج مرئية"
                                subtitle="تابع تقدمك"
                                emoji="📊"
                                color="blue"
                                size="large"
                                onClick={() => setActiveTab('history')}
                            />
                        </div>

                        {/* Action Grid */}
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

                        {/* Secondary Insight Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <InsightCard
                                title="اختبار اللياقة"
                                subtitle="اكتشف مستواك"
                                emoji="💪"
                                color="orange"
                                onClick={() => setActiveTab('activity')}
                            />
                            <InsightCard
                                title="تخطيط الوجبات"
                                subtitle="خطة غذائية مخصصة"
                                emoji="🥗"
                                color="green"
                                onClick={() => router.push('/meal-planner')}
                            />
                        </div>

                        {/* Quick Health Summary */}
                        <HealthSummary />

                        {/* AI Assistant */}
                        <div className="pt-2">
                            <AIContextAssistant
                                contextType="health_tracker"
                                contextData={{ metrics: metrics.slice(0, 5), symptoms: symptoms.slice(0, 5) }}
                                knowledgeBase={DOCTOR_KNOWLEDGE}
                                title="مساعدك الصحي"
                            />
                        </div>
                    </motion.div>
                )}

                {/* Water Tracker - PRO */}
                {activeTab === 'water' && (
                    <motion.div
                        className="pt-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <WaterTrackerPro />
                    </motion.div>
                )}

                {/* Sleep Tracker - PRO */}
                {activeTab === 'sleep' && (
                    <motion.div
                        className="pt-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <SleepTrackerPro />
                    </motion.div>
                )}

                {/* Medications - PRO */}
                {activeTab === 'meds' && (
                    <motion.div
                        className="pt-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <MedicationReminderPro />
                    </motion.div>
                )}

                {/* Activity Tab - PRO */}
                {activeTab === 'activity' && (
                    <motion.div
                        className="space-y-6 pt-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <ActivityFitnessPro />
                    </motion.div>
                )}

                {/* Mood Tab - PRO Mental Health Hub */}
                {activeTab === 'mood' && (
                    <motion.div
                        className="pt-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <MentalHealthHub />
                    </motion.div>
                )}

                {/* Weight Tracker - PRO */}
                {activeTab === 'weight' && (
                    <motion.div
                        className="pt-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <WeightBodyTrackerPro />
                    </motion.div>
                )}

                {/* Blood Pressure */}
                {activeTab === 'bp' && (
                    <motion.div
                        className="pt-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <BloodPressureTracker />
                    </motion.div>
                )}

                {/* Fasting Timer - PRO */}
                {activeTab === 'fasting' && (
                    <motion.div
                        className="pt-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <FastingTimerPro />
                    </motion.div>
                )}

                {/* Breathing Exercises */}
                {activeTab === 'breathing' && (
                    <motion.div
                        className="pt-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <BreathingExercises />
                    </motion.div>
                )}

                {/* Today View (Original) */}
                {activeTab === 'today' && (
                    <div className="space-y-6 pt-6">
                        <TodayView
                            metrics={metrics}
                            dailyLogs={dailyLogs}
                            symptoms={symptoms}
                            onUpdate={handleUpdate}
                            onLogSymptom={() => setShowSymptomLogger(true)}
                            onCheckIn={() => setShowDailyCheckIn(true)}
                            onAddMetric={() => setShowAddMetric(true)}
                        />
                        <div className="pt-4">
                            <div className="flex items-center gap-2 mb-4 px-2">
                                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                                <h3 className="font-bold text-slate-700">تحليل الذكاء الاصطناعي</h3>
                            </div>
                            <AIHealthAnalysis
                                metrics={metrics}
                                symptoms={symptoms}
                                dailyLogs={dailyLogs}
                            />
                        </div>
                    </div>
                )}

                {/* History View - Premium */}
                {activeTab === 'history' && (
                    <motion.div
                        className="pt-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <HistoryViewPro
                            metrics={metrics}
                            dailyLogs={dailyLogs}
                            symptoms={symptoms}
                        />
                    </motion.div>
                )}

                {/* Metrics View */}
                {activeTab === 'metrics' && (
                    <div className="pt-6">
                        <MetricsView
                            metrics={metrics}
                            symptoms={symptoms}
                            onAddMetric={() => setShowAddMetric(true)}
                        />
                    </div>
                )}

                {/* Journal View */}
                {activeTab === 'journal' && (
                    <div className="pt-6">
                        <JournalView
                            onSubmitLog={(data: DailyLog) => addDailyLogMutation.mutate(data)}
                            onSubmitSymptom={(data: Record<string, unknown>) => addSymptomMutation.mutate(data)}
                        />
                    </div>
                )}
            </div>

            {/* Global Sheets */}
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
    );
}

