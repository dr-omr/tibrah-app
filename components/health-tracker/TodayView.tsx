import React from 'react';
import {
    Sun, Moon, Activity, Battery, Smile, Brain,
    ChevronRight, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import HabitTracker from './HabitTracker';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function TodayView({ metrics, dailyLogs, symptoms, onUpdate, onLogSymptom, onCheckIn, onAddMetric }) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todaysLog = dailyLogs.find(l => l.date === today);

    // Calculate Daily Status
    const getDailyStatus = () => {
        if (!todaysLog) return { text: 'يوم جديد! كيف تشعر؟', color: 'bg-slate-100 text-slate-600', icon: Sun };
        if (todaysLog.mood >= 4 && todaysLog.energy_level >= 4) return { text: 'يوم ممتاز ومشرق 🌟', color: 'bg-green-100 text-green-700', icon: Sun };
        if (todaysLog.mood <= 2 || todaysLog.energy_level <= 2) return { text: 'يوم للراحة والتعافي 🌿', color: 'bg-amber-100 text-amber-700', icon: Moon };
        return { text: 'يوم متوازن وطبيعي ⚖️', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 };
    };

    const status = getDailyStatus();
    const StatusIcon = status.icon;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Today Summary Card */}
            <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2D9B83] to-[#3FB39A]" />

                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 mb-1">نظرة اليوم</h2>
                        <p className="text-sm text-slate-500">{format(new Date(), 'EEEE، d MMMM', { locale: ar })}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.text}
                    </div>
                </div>

                {/* Key Highlights Row */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-slate-50 rounded-2xl p-3 text-center">
                        <Moon className="w-5 h-5 mx-auto mb-1 text-indigo-500" />
                        <span className="block text-lg font-bold text-slate-700">
                            {metrics.find(m => m.metric_type === 'sleep_hours' && m.recorded_at.startsWith(today))?.value || '--'}
                        </span>
                        <span className="text-[10px] text-slate-400">ساعات نوم</span>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3 text-center">
                        <Activity className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                        <span className="block text-lg font-bold text-slate-700">
                            {todaysLog?.exercise?.duration_minutes || 0}
                        </span>
                        <span className="text-[10px] text-slate-400">دقيقة نشاط</span>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3 text-center">
                        <Smile className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                        <span className="block text-lg font-bold text-slate-700">
                            {todaysLog?.mood ? `${todaysLog.mood}/5` : '--'}
                        </span>
                        <span className="text-[10px] text-slate-400">المزاج</span>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3">
                    {!todaysLog ? (
                        <Button onClick={onCheckIn} className="flex-1 bg-[#2D9B83] hover:bg-[#1E7A66] text-white rounded-xl h-12 shadow-lg shadow-[#2D9B83]/20">
                            تسجيل يومي
                        </Button>
                    ) : (
                        <Button onClick={onCheckIn} variant="outline" className="flex-1 border-dashed border-slate-300 text-slate-500 hover:text-[#2D9B83] hover:border-[#2D9B83] rounded-xl h-12">
                            تحديث اليوم
                        </Button>
                    )}
                    <Button onClick={onLogSymptom} variant="ghost" className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl h-12 w-12 p-0">
                        <AlertCircle className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Habit Tracker Integration */}
            <HabitTracker
                metrics={metrics}
                dailyLogs={dailyLogs}
                onUpdate={onUpdate}
            />

            {/* Recent Symptoms */}
            {symptoms.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-700 px-2">أعراض حديثة</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 px-1">
                        {symptoms.slice(0, 5).map(s => (
                            <div key={s.id} className="min-w-[140px] bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-medium text-slate-800 truncate">{s.symptom}</span>
                                    <span className={`w-2 h-2 rounded-full ${s.severity >= 7 ? 'bg-red-500' : s.severity >= 4 ? 'bg-amber-500' : 'bg-green-500'
                                        }`} />
                                </div>
                                <p className="text-xs text-slate-400">{format(new Date(s.recorded_at), 'd MMM', { locale: ar })}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}