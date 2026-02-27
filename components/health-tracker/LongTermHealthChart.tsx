import React from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function LongTermHealthCharts({ metrics, dailyLogs, symptoms }: { metrics: any[]; dailyLogs: any[]; symptoms: any[] }) {
    // Helper to get mood value (handles both object and number types)
    const getMoodValue = (log: any) => {
        if (!log?.mood) return 0;
        if (typeof log.mood === 'object') return log.mood.overall || 0;
        return log.mood;
    };

    // Prepare data for logs (Mood & Energy)
    const logsData = dailyLogs
        .slice()
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(log => ({
            date: format(parseISO(log.date), 'dd MMM', { locale: ar }),
            mood: getMoodValue(log),
            energy: log.energy_level,
            sleep: log.sleep_quality,
            fullDate: log.date
        }));

    // Prepare data for Weight trend
    const weightData = metrics
        .filter(m => m.metric_type === 'weight')
        .sort((a: any, b: any) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
        .map(m => ({
            date: format(parseISO(m.recorded_at), 'dd MMM', { locale: ar }),
            value: m.value,
            unit: m.unit
        }));

    // Prepare data for Sleep trend (from metrics if available, or logs)
    const sleepData = metrics
        .filter(m => m.metric_type === 'sleep_hours')
        .sort((a: any, b: any) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
        .map(m => ({
            date: format(parseISO(m.recorded_at), 'dd MMM', { locale: ar }),
            value: m.value,
            unit: 'ساعة'
        }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass rounded-lg p-3 shadow-lg border border-slate-200 text-right dir-rtl">
                    <p className="text-sm font-bold text-slate-700 mb-1">{label}</p>
                    {payload.map((p, idx) => (
                        <p key={idx} className="text-xs" style={{ color: p.color }}>
                            {p.name}: {p.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8">
            {/* Mood & Energy Chart */}
            <div className="glass rounded-2xl p-4">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="text-2xl">☯️</span> توازن المزاج والطاقة
                </h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={logsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                            <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                            <Area type="monotone" dataKey="mood" name="المزاج" stroke="#F59E0B" fillOpacity={1} fill="url(#colorMood)" />
                            <Area type="monotone" dataKey="energy" name="الطاقة" stroke="#10B981" fillOpacity={1} fill="url(#colorEnergy)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Weight Trend */}
            {weightData.length > 1 && (
                <div className="glass rounded-2xl p-4">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="text-2xl">⚖️</span> تطور الوزن
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weightData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="value" name="الوزن (كجم)" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Sleep Trend */}
            {sleepData.length > 1 && (
                <div className="glass rounded-2xl p-4">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="text-2xl">😴</span> ساعات النوم
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sleepData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                <YAxis domain={[0, 12]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" name="ساعات النوم" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}