import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function AddMetricSheet({ open, onOpenChange, onSubmit, selectedMetric }) {
    const [formData, setFormData] = useState({
        metric_type: selectedMetric || '',
        value: '',
        notes: ''
    });

    const metrics = [
        { id: 'weight', name: 'الوزن', unit: 'كجم', icon: '⚖️' },
        { id: 'blood_pressure_systolic', name: 'ضغط الدم الانقباضي', unit: 'mmHg', icon: '❤️' },
        { id: 'blood_pressure_diastolic', name: 'ضغط الدم الانبساطي', unit: 'mmHg', icon: '💗' },
        { id: 'blood_sugar', name: 'سكر الدم', unit: 'mg/dL', icon: '🩸' },
        { id: 'heart_rate', name: 'نبضات القلب', unit: 'bpm', icon: '💓' },
        { id: 'oxygen', name: 'نسبة الأكسجين', unit: '%', icon: '🫁' },
        { id: 'temperature', name: 'درجة الحرارة', unit: '°C', icon: '🌡️' },
        { id: 'sleep_hours', name: 'ساعات النوم', unit: 'ساعة', icon: '😴' },
        { id: 'water_intake', name: 'شرب الماء', unit: 'لتر', icon: '💧' },
        { id: 'steps', name: 'الخطوات', unit: 'خطوة', icon: '👟' },
    ];

    const selectedMetricConfig = metrics.find(m => m.id === formData.metric_type);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            value: parseFloat(formData.value),
            unit: selectedMetricConfig?.unit || '',
            recorded_at: new Date().toISOString()
        });
        setFormData({ metric_type: '', value: '', notes: '' });
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="rounded-t-3xl h-auto max-h-[90vh]">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-right text-xl">تسجيل قياس جديد</SheetTitle>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">نوع القياس</label>
                        <Select
                            value={formData.metric_type}
                            onValueChange={(v) => setFormData({ ...formData, metric_type: v })}
                        >
                            <SelectTrigger className="h-14 rounded-xl">
                                <SelectValue placeholder="اختر نوع القياس" />
                            </SelectTrigger>
                            <SelectContent>
                                {metrics.map((metric) => (
                                    <SelectItem key={metric.id} value={metric.id}>
                                        <span className="flex items-center gap-2">
                                            <span>{metric.icon}</span>
                                            <span>{metric.name}</span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            القيمة {selectedMetricConfig && `(${selectedMetricConfig.unit})`}
                        </label>
                        <Input
                            type="number"
                            step="0.1"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            placeholder={`أدخل القيمة ${selectedMetricConfig ? `بـ ${selectedMetricConfig.unit}` : ''}`}
                            className="h-14 rounded-xl text-lg"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">ملاحظات (اختياري)</label>
                        <Textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="أضف أي ملاحظات..."
                            className="rounded-xl"
                            rows={3}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-14 rounded-xl gradient-primary text-white text-lg font-bold"
                        disabled={!formData.metric_type || !formData.value}
                    >
                        <Plus className="w-5 h-5 ml-2" />
                        حفظ القياس
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    );
}