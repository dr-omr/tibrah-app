import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Activity, AlertCircle } from 'lucide-react';

export default function SymptomTrendsChart({ symptoms }: { symptoms: any[] }) {
    if (!symptoms || symptoms.length === 0) return null;

    // Process data for Frequency Chart (Top 5 symptoms)
    const symptomCounts = symptoms.reduce((acc, curr) => {
        acc[curr.symptom] = (acc[curr.symptom] || 0) + 1;
        return acc;
    }, {});

    const frequencyData = Object.entries(symptomCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a: any, b: any) => (b.count as number) - (a.count as number))
        .slice(0, 5);

    // Process data for Severity Scatter Chart
    const severityData = symptoms.map(s => ({
        date: new Date(s.recorded_at).getTime(),
        dateStr: format(parseISO(s.recorded_at), 'dd MMM', { locale: ar }),
        severity: s.severity,
        name: s.symptom,
        body_area: s.body_area
    })).sort((a, b) => a.date - b.date);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="glass rounded-lg p-3 shadow-lg border border-slate-200 text-right dir-rtl">
                    <p className="font-bold text-slate-700">{data.name || data.payload.name}</p>
                    {data.severity && <p className="text-sm text-rose-500">الشدة: {data.severity}/10</p>}
                    {data.count && <p className="text-sm text-slate-600">التكرار: {data.count} مرات</p>}
                    {data.dateStr && <p className="text-xs text-slate-400">{data.dateStr}</p>}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Frequency Chart */}
            <div className="glass rounded-2xl p-4">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-500" />
                    الأعراض الأكثر تكراراً
                </h4>
                <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={frequencyData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Severity Over Time */}
            <div className="glass rounded-2xl p-4">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                    تطور شدة الأعراض
                </h4>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                domain={['auto', 'auto']}
                                name="Time"
                                tickFormatter={(unixTime) => format(new Date(unixTime), 'dd MMM', { locale: ar })}
                                type="number"
                                tick={{ fontSize: 10 }}
                            />
                            <YAxis dataKey="severity" name="Severity" domain={[0, 10]} tick={{ fontSize: 10 }} />
                            <ZAxis dataKey="name" range={[60, 400]} name="Symptom" />
                            <Tooltip content={<CustomTooltip />} />
                            <Scatter name="الأعراض" data={severityData} fill="#F43F5E" fillOpacity={0.6} />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}