import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Bell, Settings, ChevronDown, Activity } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VitalityScore from '../components/dashboard/VitalityScore';
import JourneyTimeline from '../components/dashboard/JourneyTimeline';
import UpcomingAppointment from '../components/dashboard/UpcomingAppointment';
import HealthReport from '../components/dashboard/HealthReport';
import LabResults from '../components/dashboard/LabResults';
import DoctorRecommendation from '../components/dashboard/DoctorRecommendation';
import DiagnosticHistory from '../components/dashboard/DiagnosticHistory';
import RemindersWidget from '../components/dashboard/RemindersWidget';
import AIAssistantToday from '../components/dashboard/AIAssistantToday';
import Link from 'next/link';
import { createPageUrl } from '../utils';
import PushNotificationButton from '../components/dashboard/PushNotificationButton';
import { DashboardSkeleton } from '../components/common/Skeletons';
import ErrorState from '../components/common/ErrorState';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => { });
    }, []);

    const { data: userHealth, isLoading: healthLoading, isError: healthError, refetch: refetchHealth } = useQuery({
        queryKey: ['userHealth'],
        queryFn: async () => {
            const data = await base44.entities.UserHealth.list();
            return data[0] || { vitality_score: 65, progress_percentage: 45, journey_stage: 'healing' };
        },
    });

    const { data: appointments = [], isLoading: appLoading, isError: appError, refetch: refetchApp } = useQuery({
        queryKey: ['appointments'],
        queryFn: async () => {
            return base44.entities.Appointment.filter(
                { status: { $in: ['pending', 'confirmed'] } },
                '-date',
                5
            );
        },
    });

    const { data: labResults = [], isLoading: labLoading, isError: labError, refetch: refetchLab } = useQuery({
        queryKey: ['labResults'],
        queryFn: () => base44.entities.LabResult.list('-test_date', 10),
    });

    const { data: recommendations = [], isLoading: recLoading, isError: recError, refetch: refetchRec } = useQuery({
        queryKey: ['recommendations'],
        queryFn: () => base44.entities.DoctorRecommendation.filter({ status: { $ne: 'completed' } }),
    });

    const { data: reminders = [], isLoading: remLoading, isError: remError, refetch: refetchRem } = useQuery({
        queryKey: ['reminders'],
        queryFn: () => base44.entities.Reminder.filter({ is_active: true }),
    });

    const { data: diagnosticHistory = [], isLoading: diagLoading, isError: diagError, refetch: refetchDiag } = useQuery({
        queryKey: ['diagnosticHistory'],
        queryFn: () => base44.entities.DiagnosticResult.list('-created_date', 5),
    });

    const isLoading = healthLoading || appLoading || labLoading || recLoading || remLoading || diagLoading;
    const isError = healthError || appError || labError || recError || remError || diagError;

    const handleRetry = () => {
        refetchHealth();
        refetchApp();
        refetchLab();
        refetchRec();
        refetchRem();
        refetchDiag();
    };

    if (isLoading) return <DashboardSkeleton />;
    if (isError) return <ErrorState onRetry={handleRetry} />;

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'صباح الخير';
        if (hour < 18) return 'مساء الخير';
        return 'مساء النور';
    };

    return (
        <div className="min-h-screen pb-24">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] px-6 py-8">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#D4AF37]/20 rounded-full blur-2xl translate-x-1/2 translate-y-1/2" />

                <div className="relative flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm">{greeting()}</p>
                            <h1 className="text-xl font-bold text-white">
                                {user?.settings?.displayName || user?.full_name || 'مرحباً بك'}
                            </h1>
                        </div>
                        <div className="w-full max-w-[200px] mt-4 sm:mt-0">
                            <PushNotificationButton />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Link href={createPageUrl('Settings')}>
                            <Button size="icon" variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            </Button>
                        </Link>
                        <Link href={createPageUrl('Settings')}>
                            <Button size="icon" variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
                                <Settings className="w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                        <p className="text-3xl font-bold text-white">
                            {userHealth?.vitality_score || 65}%
                        </p>
                        <p className="text-white/70 text-xs">الحيوية</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                        <p className="text-3xl font-bold text-white">
                            {userHealth?.progress_percentage || 45}%
                        </p>
                        <p className="text-white/70 text-xs">التقدم</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                        <p className="text-3xl font-bold text-white">٢١</p>
                        <p className="text-white/70 text-xs">يوم متواصل</p>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-slate-100">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full h-14 bg-transparent rounded-none gap-0 p-0">
                        <TabsTrigger
                            value="overview"
                            className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#2D9B83] data-[state=active]:text-[#2D9B83]"
                        >
                            نظرة عامة
                        </TabsTrigger>
                        <TabsTrigger
                            value="reports"
                            className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#2D9B83] data-[state=active]:text-[#2D9B83]"
                        >
                            التقارير
                        </TabsTrigger>
                        <TabsTrigger
                            value="reminders"
                            className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#2D9B83] data-[state=active]:text-[#2D9B83]"
                        >
                            التذكيرات
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
                {activeTab === 'overview' && (
                    <>
                        {/* AI Assistant Today */}
                        <AIAssistantToday />

                        {/* Vitality Score */}
                        <VitalityScore
                            score={userHealth?.vitality_score || 65}
                            change={5}
                        />

                        {/* Journey Timeline */}
                        <JourneyTimeline events={userHealth?.timeline_events} />

                        {/* Upcoming Appointments */}
                        <UpcomingAppointment appointments={appointments} />

                        {/* Diagnostic History */}
                        <DiagnosticHistory results={diagnosticHistory} />

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 gap-4">
                            <Link href={createPageUrl('HealthTracker')}>
                                <button className="w-full glass rounded-2xl p-4 text-right hover:shadow-glow transition-all duration-300">
                                    <span className="text-3xl mb-2 block">📊</span>
                                    <h4 className="font-semibold text-slate-800">تتبع صحتي</h4>
                                    <p className="text-sm text-slate-500">قياسات وأعراض</p>
                                </button>
                            </Link>
                            <Link href={createPageUrl('BodyMap')}>
                                <button className="w-full glass rounded-2xl p-4 text-right hover:shadow-glow transition-all duration-300">
                                    <span className="text-3xl mb-2 block">🧬</span>
                                    <h4 className="font-semibold text-slate-800">خريطة الجسم</h4>
                                    <p className="text-sm text-slate-500">تحليل تفاعلي</p>
                                </button>
                            </Link>
                            <Link href={createPageUrl('Frequencies')}>
                                <button className="w-full glass rounded-2xl p-4 text-right hover:shadow-glow transition-all duration-300">
                                    <span className="text-3xl mb-2 block">🎵</span>
                                    <h4 className="font-semibold text-slate-800">تردداتي</h4>
                                    <p className="text-sm text-slate-500">الترددات الشفائية</p>
                                </button>
                            </Link>
                            <a href="https://wa.me/967771447111" target="_blank" rel="noopener noreferrer">
                                <button className="w-full glass rounded-2xl p-4 text-right hover:shadow-glow transition-all duration-300">
                                    <span className="text-3xl mb-2 block">📱</span>
                                    <h4 className="font-semibold text-slate-800">تواصل</h4>
                                    <p className="text-sm text-slate-500">دعم فني</p>
                                </button>
                            </a>
                        </div>
                    </>
                )}

                {activeTab === 'reports' && (
                    <>
                        {/* Health Report */}
                        <HealthReport userHealth={userHealth} />

                        {/* Lab Results */}
                        <LabResults results={labResults} />

                        {/* Doctor Recommendations */}
                        <DoctorRecommendation recommendations={recommendations} />
                    </>
                )}

                {activeTab === 'reminders' && (
                    <>
                        {/* Reminders Widget */}
                        <RemindersWidget reminders={reminders} />

                        {/* Upcoming Appointments */}
                        <UpcomingAppointment appointments={appointments} />

                        {/* Supplement Schedule */}
                        <div className="glass rounded-3xl p-5 shadow-lg">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                                    <Activity className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">جدول المكملات اليومي</h3>
                                    <p className="text-sm text-slate-500">التزامك هذا الأسبوع: ٨٥٪</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { time: 'صباحاً', items: ['فيتامين د ٥٠٠٠', 'أوميغا ٣', 'فيتامين C'], done: 2 },
                                    { time: 'مع الغداء', items: ['الحديد', 'B Complex'], done: 0 },
                                    { time: 'مساءً', items: ['المغنيسيوم', 'الزنك'], done: 0 },
                                ].map((schedule, idx) => (
                                    <div key={idx} className="bg-white/50 rounded-xl p-4 border border-slate-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-slate-800">{schedule.time}</span>
                                            <span className="text-sm text-slate-500">
                                                {schedule.done}/{schedule.items.length}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {schedule.items.map((item, itemIdx) => (
                                                <span
                                                    key={itemIdx}
                                                    className={`px-3 py-1 rounded-full text-sm ${itemIdx < schedule.done
                                                        ? 'bg-green-100 text-green-700 line-through'
                                                        : 'bg-slate-100 text-slate-600'
                                                        }`}
                                                >
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
