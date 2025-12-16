import React from 'react';
import {
    TestTube, TrendingUp, TrendingDown, AlertTriangle,
    CheckCircle, Clock, ArrowLeft, Beaker
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { createPageUrl } from '../../utils';

export default function LabResults({ results = [] }) {
    // Sample data if no results provided
    const sampleResults = results.length > 0 ? results : [
        { id: 1, test_name: 'فيتامين د', value: 28, unit: 'ng/ml', status: 'low', reference_min: 30, reference_max: 100, test_date: '2025-01-15' },
        { id: 2, test_name: 'فيتامين B12', value: 450, unit: 'pg/ml', status: 'normal', reference_min: 200, reference_max: 900, test_date: '2025-01-15' },
        { id: 3, test_name: 'الحديد', value: 45, unit: 'mcg/dL', status: 'low', reference_min: 60, reference_max: 170, test_date: '2025-01-15' },
        { id: 4, test_name: 'TSH', value: 2.5, unit: 'mIU/L', status: 'normal', reference_min: 0.4, reference_max: 4.0, test_date: '2025-01-15' },
    ];

    const getStatusConfig = (status) => {
        switch (status) {
            case 'normal':
                return {
                    color: 'bg-green-100 text-green-700',
                    icon: CheckCircle,
                    label: 'طبيعي',
                    barColor: 'bg-green-500'
                };
            case 'low':
                return {
                    color: 'bg-amber-100 text-amber-700',
                    icon: TrendingDown,
                    label: 'منخفض',
                    barColor: 'bg-amber-500'
                };
            case 'high':
                return {
                    color: 'bg-red-100 text-red-700',
                    icon: TrendingUp,
                    label: 'مرتفع',
                    barColor: 'bg-red-500'
                };
            case 'critical':
                return {
                    color: 'bg-red-100 text-red-700',
                    icon: AlertTriangle,
                    label: 'حرج',
                    barColor: 'bg-red-600'
                };
            default:
                return {
                    color: 'bg-slate-100 text-slate-700',
                    icon: Clock,
                    label: 'قيد الانتظار',
                    barColor: 'bg-slate-400'
                };
        }
    };

    const getValuePosition = (value, min, max) => {
        const range = max - min;
        const position = ((value - min) / range) * 100;
        return Math.max(0, Math.min(100, position));
    };

    return (
        <div className="glass rounded-3xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Beaker className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">نتائج الفحوصات</h3>
                        <p className="text-sm text-slate-500">آخر تحديث: ١٥ يناير ٢٠٢٥</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="text-[#2D9B83]">
                    عرض الكل
                    <ArrowLeft className="w-4 h-4 mr-1" />
                </Button>
            </div>

            <div className="space-y-4">
                {sampleResults.slice(0, 4).map((result) => {
                    const statusConfig = getStatusConfig(result.status);
                    const StatusIcon = statusConfig.icon;
                    const valuePos = getValuePosition(result.value, result.reference_min, result.reference_max);

                    return (
                        <div
                            key={result.id}
                            className="bg-white/50 rounded-2xl p-4 border border-slate-100"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <TestTube className="w-4 h-4 text-slate-400" />
                                    <span className="font-semibold text-slate-800">{result.test_name}</span>
                                </div>
                                <Badge className={`${statusConfig.color} border-0 text-xs`}>
                                    <StatusIcon className="w-3 h-3 ml-1" />
                                    {statusConfig.label}
                                </Badge>
                            </div>

                            <div className="flex items-baseline gap-2 mb-3">
                                <span className="text-2xl font-bold text-slate-800">{result.value}</span>
                                <span className="text-sm text-slate-500">{result.unit}</span>
                            </div>

                            {/* Reference Range Bar */}
                            <div className="relative">
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-200 absolute" style={{ left: '20%', right: '20%' }} />
                                </div>
                                <div
                                    className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 ${statusConfig.barColor} rounded-full border-2 border-white shadow-md`}
                                    style={{ left: `${valuePos}%`, marginLeft: '-6px' }}
                                />
                                <div className="flex justify-between mt-1 text-xs text-slate-400">
                                    <span>{result.reference_min}</span>
                                    <span>{result.reference_max}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}