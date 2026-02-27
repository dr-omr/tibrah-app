import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function MetricChart({ data, metricType, normalRange }: { data: any[]; metricType: string; normalRange?: { min: number; max: number } }) {
    const metricConfig = {
        weight: { color: '#06b6d4', name: 'الوزن' },
        blood_pressure_systolic: { color: '#ef4444', name: 'الضغط الانقباضي' },
        blood_pressure_diastolic: { color: '#f43f5e', name: 'الضغط الانبساطي' },
        blood_sugar: { color: '#f59e0b', name: 'السكر' },
        heart_rate: { color: '#ec4899', name: 'النبض' },
        oxygen: { color: '#0ea5e9', name: 'الأكسجين' },
        temperature: { color: '#f97316', name: 'الحرارة' },
        sleep_hours: { color: '#8b5cf6', name: 'النوم' },
        water_intake: { color: '#14b8a6', name: 'الماء' },
        steps: { color: '#22c55e', name: 'الخطوات' },
    };

    const config = metricConfig[metricType] || { color: '#6b7280', name: metricType };

    const chartData = data.map(item => ({
        ...item,
        date: format(new Date(item.recorded_at), 'MM/dd', { locale: ar }),
        fullDate: format(new Date(item.recorded_at), 'yyyy-MM-dd')
    })).sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass rounded-lg p-3 shadow-lg border border-slate-200">
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="text-lg font-bold text-slate-800">
                        {payload[0].value} <span className="text-sm font-normal">{payload[0].payload.unit}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    if (!chartData.length) {
        return (
            <div className="h-48 flex items-center justify-center text-slate-400">
                لا توجد بيانات لعرضها
            </div>
        );
    }

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`gradient-${metricType}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                        axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                        axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {normalRange && (
                        <>
                            <ReferenceLine
                                y={normalRange.min}
                                stroke="#22c55e"
                                strokeDasharray="5 5"
                                label={{ value: 'الحد الأدنى', position: 'left', fontSize: 10, fill: '#22c55e' }}
                            />
                            <ReferenceLine
                                y={normalRange.max}
                                stroke="#22c55e"
                                strokeDasharray="5 5"
                                label={{ value: 'الحد الأقصى', position: 'left', fontSize: 10, fill: '#22c55e' }}
                            />
                        </>
                    )}

                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={config.color}
                        strokeWidth={2}
                        fill={`url(#gradient-${metricType})`}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}