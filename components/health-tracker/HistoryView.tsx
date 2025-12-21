import React, { useState } from 'react';
import { format, subDays, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, Circle, Brain } from 'lucide-react';
import { Button } from "@/components/ui/button";
import SymptomTrendsChart from './SymptomTrendsChart';
import AIContextAssistant from '@/components/ai/AIContextAssistant';
import { DOCTOR_KNOWLEDGE } from '@/components/ai/knowledge';

export default function HistoryView({ metrics, dailyLogs, symptoms }) {
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Generate last 30 days for horizontal calendar
    const days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), i));

    // Helper to get mood value (handles both object and number types)
    const getMoodValue = (log: any) => {
        if (!log?.mood) return 0;
        if (typeof log.mood === 'object') return log.mood.overall || 0;
        return log.mood;
    };

    const getDayStatus = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const log = dailyLogs.find(l => l.date === dateStr);
        const symptomCount = symptoms.filter(s => s.recorded_at.startsWith(dateStr)).length;

        if (log) {
            const moodVal = getMoodValue(log);
            if (moodVal >= 4 && symptomCount === 0) return 'good';
            if (moodVal <= 2 || symptomCount > 0) return 'bad';
            return 'neutral';
        }
        return 'empty';
    };

    const statusColors = {
        good: 'bg-green-500',
        bad: 'bg-amber-500',
        neutral: 'bg-blue-500',
        empty: 'bg-slate-200'
    };

    const selectedLog = dailyLogs.find(l => l.date === format(selectedDate, 'yyyy-MM-dd'));
    const selectedSymptoms = symptoms.filter(s => s.recorded_at.startsWith(format(selectedDate, 'yyyy-MM-dd')));
    const selectedMetrics = metrics.filter(m => m.recorded_at.startsWith(format(selectedDate, 'yyyy-MM-dd')));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Horizontal Calendar */}
            <div className="bg-white rounded-b-3xl pb-4 shadow-sm -mx-6 px-6 pt-2">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-[#2D9B83]" />
                        السجل الزمني
                    </h2>
                    <span className="text-sm text-slate-500">{format(selectedDate, 'MMMM yyyy', { locale: ar })}</span>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide direction-rtl">
                    {days.map((date) => {
                        const isSelected = isSameDay(date, selectedDate);
                        const status = getDayStatus(date);

                        return (
                            <button
                                key={date.toString()}
                                onClick={() => setSelectedDate(date)}
                                className={`flex flex-col items-center min-w-[50px] p-2 rounded-2xl transition-all ${isSelected
                                    ? 'bg-[#2D9B83] text-white shadow-lg shadow-[#2D9B83]/30 scale-105'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <span className="text-xs font-medium mb-1">{format(date, 'EEE', { locale: ar })}</span>
                                <span className="text-lg font-bold mb-1">{format(date, 'd')}</span>
                                <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : statusColors[status]}`} />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Details for Selected Date */}
            <div className="space-y-4">
                <h3 className="font-bold text-slate-700 px-2">تفاصيل {format(selectedDate, 'EEEE، d MMMM', { locale: ar })}</h3>

                <div className="mb-8">
                    <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-500" />
                        تحليل الأعراض على المدى الطويل
                    </h3>
                    <SymptomTrendsChart symptoms={symptoms} />
                    <div className="mt-4">
                        <AIContextAssistant
                            contextType="symptom_analysis"
                            contextData={{ symptoms: symptoms.slice(0, 20), logs: dailyLogs.slice(0, 10) }}
                            knowledgeBase={DOCTOR_KNOWLEDGE}
                            title="المحلل الطبي الذكي"
                        />
                    </div>
                </div>

                {!selectedLog && selectedSymptoms.length === 0 && selectedMetrics.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-3xl border-dashed border-2 border-slate-200">
                        <p>لا توجد سجلات لهذا اليوم</p>
                    </div>
                ) : (
                    <>
                        {selectedLog && (
                            <div className="glass p-4 rounded-2xl border-l-4 border-[#2D9B83]">
                                <div className="flex justify-between mb-2">
                                    <span className="font-bold text-slate-700">المزاج والطاقة</span>
                                </div>
                                <div className="flex gap-4 text-sm text-slate-600">
                                    <span>المزاج: {getMoodValue(selectedLog)}/5</span>
                                    <span>الطاقة: {selectedLog.energy_level}/5</span>
                                    <span>النوم: {selectedLog.sleep_quality}/5</span>
                                </div>
                                {selectedLog.notes && (
                                    <p className="mt-3 text-sm text-slate-500 bg-white/50 p-2 rounded-lg">"{selectedLog.notes}"</p>
                                )}
                            </div>
                        )}

                        {selectedSymptoms.map(s => (
                            <div key={s.id} className="bg-red-50 p-4 rounded-2xl border border-red-100 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-red-800">{s.symptom}</p>
                                    <p className="text-xs text-red-600">{s.body_area}</p>
                                </div>
                                <span className="px-2 py-1 bg-white rounded-lg text-xs font-bold text-red-700">
                                    شدة {s.severity}/10
                                </span>
                            </div>
                        ))}

                        {selectedMetrics.length > 0 && (
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <p className="font-bold text-slate-700 mb-3">القياسات</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {selectedMetrics.map(m => (
                                        <div key={m.id} className="bg-white p-2 rounded-xl text-center">
                                            <span className="text-xs text-slate-500 block">{m.metric_type}</span>
                                            <span className="font-bold text-[#2D9B83]">{m.value} <small>{m.unit}</small></span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}