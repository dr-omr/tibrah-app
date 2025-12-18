import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import {
    ChevronLeft, BarChart3, Calendar, FileText, LayoutDashboard, Sparkles,
    Droplets, Moon, Pill, Activity, Heart
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { createPageUrl } from '../utils';
import { format } from 'date-fns';

// Components
import TodayView from '../components/health-tracker/TodayView';
import HistoryView from '../components/health-tracker/HistoryView';
import MetricsView from '../components/health-tracker/MetricsView';
import JournalView from '../components/health-tracker/JournalView';
import AIHealthAnalysis from '../components/health-tracker/AIHealthAnalysis';
import AIContextAssistant from '../components/ai/AIContextAssistant';
import AddMetricSheet from '../components/health-tracker/AddMetricSheet';
import SymptomLogger from '../components/health-tracker/SymptomLogger';
import DailyCheckIn from '../components/health-tracker/DailyCheckIn';
import MedicationReminder from '../components/health-tracker/MedicationReminder';
import WaterTracker from '../components/health-tracker/WaterTracker';
import SleepTracker from '../components/health-tracker/SleepTracker';
import HealthSummary from '../components/health-tracker/HealthSummary';
import ActivityRings from '../components/health-tracker/ActivityRings';
import MoodTracker from '../components/health-tracker/MoodTracker';
import BreathingExercises from '../components/health-tracker/BreathingExercises';
import BloodPressureTracker from '../components/health-tracker/BloodPressureTracker';
import WeightTracker from '../components/health-tracker/WeightTracker';
import FastingTimer from '../components/health-tracker/FastingTimer';
import { DOCTOR_KNOWLEDGE } from '@/components/ai/knowledge';
import { initializeNotifications } from '@/lib/pushNotifications';

// TypeScript interfaces
interface NavItemProps {
    id: string;
    icon: React.ElementType;
    label: string;
}

interface DailyLog {
    id?: string;
    date: string;
    [key: string]: unknown;
}

export default function HealthTracker() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('summary');
    const [showAddMetric, setShowAddMetric] = useState(false);
    const [showSymptomLogger, setShowSymptomLogger] = useState(false);
    const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);
    const [user, setUser] = useState(null);

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

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => { });
    }, []);

    // Data Fetching
    const { data: metrics = [] } = useQuery({
        queryKey: ['healthMetrics'],
        queryFn: () => base44.entities.HealthMetric.list('-recorded_at', 100),
    });

    const { data: symptoms = [] } = useQuery({
        queryKey: ['symptoms'],
        queryFn: () => base44.entities.SymptomLog.list('-recorded_at', 50),
    });

    const { data: dailyLogs = [] } = useQuery<DailyLog[]>({
        queryKey: ['dailyLogs'],
        queryFn: async () => {
            const logs = await base44.entities.DailyLog.list('-date', 30);
            return logs as unknown as DailyLog[];
        },
    });

    // Mutations
    const addMetricMutation = useMutation({
        mutationFn: (data: Record<string, unknown>) => base44.entities.HealthMetric.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['healthMetrics'] });
            setShowAddMetric(false);
        },
    });

    const addSymptomMutation = useMutation({
        mutationFn: (data: Record<string, unknown>) => base44.entities.SymptomLog.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['symptoms'] });
            setShowSymptomLogger(false);
        },
    });

    const addDailyLogMutation = useMutation({
        mutationFn: async (data: DailyLog) => {
            const existing = dailyLogs.find(l => l.date === data.date);
            if (existing?.id) {
                return base44.entities.DailyLog.update(existing.id, data);
            }
            return base44.entities.DailyLog.create(data);
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

    const NavItem = ({ id, icon: Icon, label }: NavItemProps) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300 min-w-[60px] ${activeTab === id
                ? 'bg-white text-[#2D9B83] shadow-md scale-105'
                : 'text-white/70 hover:bg-white/10'
                }`}
        >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-[9px] font-bold">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header Section */}
            <div className="bg-gradient-to-b from-[#2D9B83] to-[#3FB39A] pb-6 pt-6 px-4 rounded-b-[2.5rem] shadow-xl relative z-10">
                <div className="flex justify-between items-center mb-4">
                    <Link href={createPageUrl('Dashboard')}>
                        <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-white font-bold text-lg">تتبع صحتي</h1>
                    <div className="w-10" />
                </div>

                {/* Scrollable Navigation */}
                <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                    <div className="flex gap-2 pb-2">
                        {tabs.map(tab => (
                            <NavItem key={tab.id} id={tab.id} icon={tab.icon} label={tab.label} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="px-4 -mt-4 relative z-20">
                {/* Summary View */}
                {activeTab === 'summary' && (
                    <div className="space-y-6 pt-6">
                        <HealthSummary />
                        <div className="pt-4">
                            <AIContextAssistant
                                contextType="health_tracker"
                                contextData={{ metrics: metrics.slice(0, 5), symptoms: symptoms.slice(0, 5) }}
                                knowledgeBase={DOCTOR_KNOWLEDGE}
                                title="مساعدك الصحي"
                            />
                        </div>
                    </div>
                )}

                {/* Water Tracker */}
                {activeTab === 'water' && (
                    <div className="pt-6">
                        <WaterTracker />
                    </div>
                )}

                {/* Sleep Tracker */}
                {activeTab === 'sleep' && (
                    <div className="pt-6">
                        <SleepTracker />
                    </div>
                )}

                {/* Medications */}
                {activeTab === 'meds' && (
                    <div className="pt-6">
                        <MedicationReminder />
                    </div>
                )}

                {/* Activity Tab - New */}
                {activeTab === 'activity' && (
                    <div className="space-y-6 pt-6">
                        <ActivityRings />
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setActiveTab('weight')}
                                className="glass rounded-2xl p-4 text-center hover:shadow-md transition-shadow"
                            >
                                <span className="text-2xl">⚖️</span>
                                <p className="text-sm font-medium text-slate-700 mt-1">الوزن</p>
                            </button>
                            <button
                                onClick={() => setActiveTab('bp')}
                                className="glass rounded-2xl p-4 text-center hover:shadow-md transition-shadow"
                            >
                                <span className="text-2xl">💓</span>
                                <p className="text-sm font-medium text-slate-700 mt-1">الضغط</p>
                            </button>
                            <button
                                onClick={() => setActiveTab('fasting')}
                                className="glass rounded-2xl p-4 text-center hover:shadow-md transition-shadow"
                            >
                                <span className="text-2xl">⏱️</span>
                                <p className="text-sm font-medium text-slate-700 mt-1">الصيام</p>
                            </button>
                            <button
                                onClick={() => setActiveTab('breathing')}
                                className="glass rounded-2xl p-4 text-center hover:shadow-md transition-shadow"
                            >
                                <span className="text-2xl">🌬️</span>
                                <p className="text-sm font-medium text-slate-700 mt-1">التنفس</p>
                            </button>
                        </div>
                    </div>
                )}

                {/* Mood Tab - New */}
                {activeTab === 'mood' && (
                    <div className="pt-6">
                        <MoodTracker />
                    </div>
                )}

                {/* Weight Tracker - Sub tab */}
                {activeTab === 'weight' && (
                    <div className="pt-6">
                        <button onClick={() => setActiveTab('activity')} className="text-[#2D9B83] text-sm mb-4">
                            ← العودة للنشاط
                        </button>
                        <WeightTracker />
                    </div>
                )}

                {/* Blood Pressure - Sub tab */}
                {activeTab === 'bp' && (
                    <div className="pt-6">
                        <button onClick={() => setActiveTab('activity')} className="text-[#2D9B83] text-sm mb-4">
                            ← العودة للنشاط
                        </button>
                        <BloodPressureTracker />
                    </div>
                )}

                {/* Fasting Timer - Sub tab */}
                {activeTab === 'fasting' && (
                    <div className="pt-6">
                        <button onClick={() => setActiveTab('activity')} className="text-[#2D9B83] text-sm mb-4">
                            ← العودة للنشاط
                        </button>
                        <FastingTimer />
                    </div>
                )}

                {/* Breathing Exercises - Sub tab */}
                {activeTab === 'breathing' && (
                    <div className="pt-6">
                        <button onClick={() => setActiveTab('activity')} className="text-[#2D9B83] text-sm mb-4">
                            ← العودة للنشاط
                        </button>
                        <BreathingExercises />
                    </div>
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

                {/* History View */}
                {activeTab === 'history' && (
                    <div className="pt-6">
                        <HistoryView
                            metrics={metrics}
                            dailyLogs={dailyLogs}
                            symptoms={symptoms}
                        />
                    </div>
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

