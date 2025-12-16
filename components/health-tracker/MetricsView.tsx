import React, { useState } from 'react';
import MetricCard from './MetricCard';
import MetricChart from './MetricChart';
import SymptomTrendsChart from './SymptomTrendsChart';
import { TrendingUp, Plus, Info, Activity } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function MetricsView({ metrics, symptoms, onAddMetric }) {
    const [selectedMetric, setSelectedMetric] = useState(null);

    const metricTypes = ['weight', 'blood_pressure_systolic', 'blood_pressure_diastolic', 'blood_sugar', 'heart_rate', 'oxygen', 'sleep_hours', 'water_intake', 'steps'];

    const getLatestMetric = (type) => {
        const filtered = metrics.filter(m => m.metric_type === type);
        return filtered.length > 0 ? filtered[0] : null;
    };

    const getPreviousMetric = (type) => {
        const filtered = metrics.filter(m => m.metric_type === type);
        return filtered.length > 1 ? filtered[1] : null;
    };

    const normalRanges = {
        weight: { min: 18.5, max: 25 },
        blood_pressure_systolic: { min: 90, max: 120 },
        blood_pressure_diastolic: { min: 60, max: 80 },
        blood_sugar: { min: 70, max: 100 },
        heart_rate: { min: 60, max: 100 },
        oxygen: { min: 95, max: 100 },
        sleep_hours: { min: 7, max: 9 },
        water_intake: { min: 2, max: 3 },
        steps: { min: 7000, max: 10000 },
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex justify-between items-center">
                <h2 className="font-bold text-slate-800 text-lg">جميع المؤشرات</h2>
                <Button onClick={onAddMetric} size="sm" className="bg-[#2D9B83] hover:bg-[#1E7A66] text-white rounded-full px-4">
                    <Plus className="w-4 h-4 ml-1" />
                    قياس جديد
                </Button>
            </div>

            {/* Selected Metric Detail View */}
            {selectedMetric && (
                <div className="bg-white rounded-3xl p-5 shadow-lg border border-slate-100 animate-in zoom-in-95 duration-300 sticky top-20 z-20">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                {selectedMetric}
                                <Info className="w-4 h-4 text-slate-400" />
                            </h3>
                            <p className="text-sm text-slate-500">آخر 30 يوم</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedMetric(null)} className="text-slate-400">إغلاق</Button>
                    </div>

                    <MetricChart
                        data={metrics.filter(m => m.metric_type === selectedMetric)}
                        metricType={selectedMetric}
                        normalRange={normalRanges[selectedMetric]}
                    />
                </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
                {metricTypes.map((type) => {
                    const latest = getLatestMetric(type);
                    const previous = getPreviousMetric(type);
                    const isSelected = selectedMetric === type;

                    return (
                        <div key={type} className={isSelected ? 'ring-2 ring-[#2D9B83] rounded-2xl' : ''}>
                            <MetricCard
                                metric={type}
                                latestValue={latest?.value}
                                previousValue={previous?.value}
                                onClick={() => setSelectedMetric(selectedMetric === type ? null : type)}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Symptom Correlation Section */}
            <div className="pt-8 border-t border-slate-100 mt-8">
                <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-rose-500" />
                    علاقة الأعراض بالمؤشرات
                </h3>
                <SymptomTrendsChart symptoms={symptoms} />
            </div>
        </div>
    );
}