import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ChevronLeft, BarChart3, Calendar, FileText, LayoutDashboard, Sparkles
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
import { DOCTOR_KNOWLEDGE } from '@/components/ai/knowledge';

export default function HealthTracker() {
    const [activeTab, setActiveTab] = useState('today');
    const [showAddMetric, setShowAddMetric] = useState(false);
    const [showSymptomLogger, setShowSymptomLogger] = useState(false);
    const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);
    const [user, setUser] = useState(null);

    const queryClient = useQueryClient();

    React.useEffect(() => {
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

    const { data: dailyLogs = [] } = useQuery({
        queryKey: ['dailyLogs'],
        queryFn: () => base44.entities.DailyLog.list('-date', 30),
    });

    // Mutations
    const addMetricMutation = useMutation({
        mutationFn: (data) => base44.entities.HealthMetric.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['healthMetrics'] });
            setShowAddMetric(false);
        },
    });

    const addSymptomMutation = useMutation({
        mutationFn: (data) => base44.entities.SymptomLog.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['symptoms'] });
            setShowSymptomLogger(false);
        },
    });

    const addDailyLogMutation = useMutation({
        mutationFn: async (data) => {
            // Check if log exists for date
            const existing = dailyLogs.find(l => l.date === data.date);
            if (existing) {
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

    const NavItem = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-300 ${activeTab === id
                ? 'bg-white text-[#2D9B83] shadow-md scale-105'
                : 'text-white/70 hover:bg-white/10'
                }`}
        >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header Section */}
            <div className="bg-gradient-to-b from-[#2D9B83] to-[#3FB39A] pb-8 pt-6 px-4 rounded-b-[2.5rem] shadow-xl relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <Link href={createPageUrl('Dashboard')}>
                        <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-white font-bold text-lg">تتبع صحتي</h1>
                    <div className="w-10" />
                </div>

                {/* Top Navigation - Segmented Control style */}
                <div className="flex justify-between items-center px-2">
                    <NavItem id="today" icon={LayoutDashboard} label="اليوم" />
                    <NavItem id="history" icon={Calendar} label="السجل" />
                    <NavItem id="metrics" icon={BarChart3} label="القياسات" />
                    <NavItem id="journal" icon={FileText} label="التدوين" />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="px-4 -mt-4 relative z-20">
                {activeTab === 'today' && (
                    <div className="space-y-6">
                        <TodayView
                            metrics={metrics}
                            dailyLogs={dailyLogs}
                            symptoms={symptoms}
                            onUpdate={handleUpdate}
                            onLogSymptom={() => setShowSymptomLogger(true)}
                            onCheckIn={() => setShowDailyCheckIn(true)}
                            onAddMetric={() => setShowAddMetric(true)}
                        />

                        {/* AI Analysis Section */}
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
                            <div className="mt-4">
                                <AIContextAssistant
                                    contextType="health_tracker"
                                    contextData={{ metrics: metrics.slice(0, 5), symptoms: symptoms.slice(0, 5) }}
                                    knowledgeBase={DOCTOR_KNOWLEDGE}
                                    title="مساعدك الصحي"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <HistoryView
                        metrics={metrics}
                        dailyLogs={dailyLogs}
                        symptoms={symptoms}
                    />
                )}

                {activeTab === 'metrics' && (
                    <MetricsView
                        metrics={metrics}
                        symptoms={symptoms}
                        onAddMetric={() => setShowAddMetric(true)}
                    />
                )}

                {activeTab === 'journal' && (
                    <JournalView
                        onSubmitLog={(data) => addDailyLogMutation.mutate(data)}
                        onSubmitSymptom={(data) => addSymptomMutation.mutate(data)}
                    />
                )}
            </div>

            {/* Global Sheets */}
            <AddMetricSheet
                open={showAddMetric}
                onOpenChange={setShowAddMetric}
                onSubmit={(data) => addMetricMutation.mutate(data)}
            />

            <SymptomLogger
                open={showSymptomLogger}
                onOpenChange={setShowSymptomLogger}
                onSubmit={(data) => addSymptomMutation.mutate(data)}
            />

            <DailyCheckIn
                open={showDailyCheckIn}
                onOpenChange={setShowDailyCheckIn}
                onSubmit={(data) => addDailyLogMutation.mutate(data)}
            />
        </div>
    );
}
