import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

export default function MetricCard({ metric, latestValue, previousValue, onClick }) {
    const metricConfig = {
        weight: {
            name: 'الوزن',
            unit: 'كجم',
            icon: '⚖️',
            normalRange: { min: 18.5, max: 25, unit: 'BMI' },
            color: 'from-blue-500 to-cyan-500'
        },
        blood_pressure_systolic: {
            name: 'ضغط الدم الانقباضي',
            unit: 'mmHg',
            icon: '❤️',
            normalRange: { min: 90, max: 120 },
            color: 'from-red-500 to-pink-500'
        },
        blood_pressure_diastolic: {
            name: 'ضغط الدم الانبساطي',
            unit: 'mmHg',
            icon: '💗',
            normalRange: { min: 60, max: 80 },
            color: 'from-rose-500 to-red-500'
        },
        blood_sugar: {
            name: 'سكر الدم',
            unit: 'mg/dL',
            icon: '🩸',
            normalRange: { min: 70, max: 100 },
            color: 'from-amber-500 to-orange-500'
        },
        heart_rate: {
            name: 'نبضات القلب',
            unit: 'bpm',
            icon: '💓',
            normalRange: { min: 60, max: 100 },
            color: 'from-pink-500 to-rose-500'
        },
        oxygen: {
            name: 'الأكسجين',
            unit: '%',
            icon: '🫁',
            normalRange: { min: 95, max: 100 },
            color: 'from-sky-500 to-blue-500'
        },
        temperature: {
            name: 'الحرارة',
            unit: '°C',
            icon: '🌡️',
            normalRange: { min: 36.1, max: 37.2 },
            color: 'from-orange-500 to-red-500'
        },
        sleep_hours: {
            name: 'ساعات النوم',
            unit: 'ساعة',
            icon: '😴',
            normalRange: { min: 7, max: 9 },
            color: 'from-indigo-500 to-purple-500'
        },
        water_intake: {
            name: 'شرب الماء',
            unit: 'لتر',
            icon: '💧',
            normalRange: { min: 2, max: 3 },
            color: 'from-cyan-500 to-teal-500'
        },
        steps: {
            name: 'الخطوات',
            unit: 'خطوة',
            icon: '👟',
            normalRange: { min: 7000, max: 10000 },
            color: 'from-green-500 to-emerald-500'
        },
    };

    const config = metricConfig[metric] || { name: metric, unit: '', icon: '📊', color: 'from-slate-500 to-slate-600' };

    const getStatus = () => {
        if (!latestValue || !config.normalRange) return 'unknown';
        if (latestValue < config.normalRange.min) return 'low';
        if (latestValue > config.normalRange.max) return 'high';
        return 'normal';
    };

    const getTrend = () => {
        if (!previousValue || !latestValue) return 'stable';
        if (latestValue > previousValue) return 'up';
        if (latestValue < previousValue) return 'down';
        return 'stable';
    };

    const status = getStatus();
    const trend = getTrend();
    const change = previousValue ? ((latestValue - previousValue) / previousValue * 100).toFixed(1) : 0;

    const statusColors = {
        normal: 'bg-green-100 text-green-700',
        high: 'bg-red-100 text-red-700',
        low: 'bg-amber-100 text-amber-700',
        unknown: 'bg-slate-100 text-slate-500'
    };

    const statusLabels = {
        normal: 'طبيعي',
        high: 'مرتفع',
        low: 'منخفض',
        unknown: 'غير محدد'
    };

    return (
        <div
            onClick={onClick}
            className="glass rounded-2xl p-4 hover:shadow-glow transition-all duration-300 cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}>
                    {config.icon}
                </div>
                {status !== 'unknown' && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
                        {statusLabels[status]}
                    </span>
                )}
            </div>

            <h4 className="font-semibold text-slate-800 mb-1">{config.name}</h4>

            <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold text-slate-800">
                    {latestValue ? latestValue.toLocaleString('ar-EG') : '--'}
                </span>
                <span className="text-sm text-slate-500">{config.unit}</span>
            </div>

            {previousValue && (
                <div className="flex items-center gap-1 text-sm">
                    {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                    {trend === 'stable' && <Minus className="w-4 h-4 text-slate-400" />}
                    <span className={trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-slate-500'}>
                        {change > 0 ? '+' : ''}{change}%
                    </span>
                </div>
            )}

            {config.normalRange && (
                <p className="text-xs text-slate-400 mt-2">
                    الطبيعي: {config.normalRange.min} - {config.normalRange.max} {config.unit}
                </p>
            )}
        </div>
    );
}