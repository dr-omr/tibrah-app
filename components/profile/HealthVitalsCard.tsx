import React, { useState } from 'react';
import {
    Scale, Moon, Droplets, Smile, TrendingUp, TrendingDown, Minus, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface HealthVital {
    id: string;
    label: string;
    value: number;
    unit: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
    min?: number;
    max?: number;
    target?: number;
}

interface HealthVitalsCardProps {
    vitals?: HealthVital[];
    onSaveVital?: (id: string, value: number) => void;
}

const defaultVitals: HealthVital[] = [
    {
        id: 'weight',
        label: 'الوزن',
        value: 75.5,
        unit: 'كجم',
        icon: Scale,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        trend: 'down',
        trendValue: '-0.5',
        min: 40,
        max: 150,
        target: 70
    },
    {
        id: 'sleep',
        label: 'ساعات النوم',
        value: 7,
        unit: 'ساعة',
        icon: Moon,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        trend: 'up',
        trendValue: '+1',
        min: 0,
        max: 12,
        target: 8
    },
    {
        id: 'water',
        label: 'شرب الماء',
        value: 6,
        unit: 'أكواب',
        icon: Droplets,
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-100',
        trend: 'stable',
        trendValue: '0',
        min: 0,
        max: 12,
        target: 8
    },
    {
        id: 'mood',
        label: 'المزاج',
        value: 4,
        unit: '/ 5',
        icon: Smile,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        trend: 'up',
        trendValue: '+1',
        min: 1,
        max: 5,
        target: 5
    }
];

export default function HealthVitalsCard({ vitals = defaultVitals, onSaveVital }: HealthVitalsCardProps) {
    const [selectedVital, setSelectedVital] = useState<HealthVital | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const getTrendIcon = (trend?: string) => {
        switch (trend) {
            case 'up': return <TrendingUp className="w-3.5 h-3.5 text-green-500" />;
            case 'down': return <TrendingDown className="w-3.5 h-3.5 text-red-500" />;
            default: return <Minus className="w-3.5 h-3.5 text-slate-400" />;
        }
    };

    const getProgressPercentage = (vital: HealthVital) => {
        if (!vital.target || !vital.max) return 0;
        return Math.min(100, (vital.value / vital.target) * 100);
    };

    const handleSave = () => {
        if (selectedVital && inputValue) {
            onSaveVital?.(selectedVital.id, parseFloat(inputValue));
            setIsDialogOpen(false);
            setInputValue('');
            setSelectedVital(null);
        }
    };

    const openEditDialog = (vital: HealthVital) => {
        setSelectedVital(vital);
        setInputValue(vital.value.toString());
        setIsDialogOpen(true);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-slate-800">المؤشرات الصحية</h3>
                <span className="text-sm text-slate-400">اليوم</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {vitals.map((vital) => {
                    const Icon = vital.icon;
                    const progress = getProgressPercentage(vital);

                    return (
                        <button
                            key={vital.id}
                            onClick={() => openEditDialog(vital)}
                            className="group relative bg-slate-50 hover:bg-slate-100 rounded-2xl p-4 text-right transition-all duration-200 hover:shadow-md"
                        >
                            {/* Icon */}
                            <div className={`w-10 h-10 ${vital.bgColor} rounded-xl flex items-center justify-center mb-3`}>
                                <Icon className={`w-5 h-5 ${vital.color}`} />
                            </div>

                            {/* Label */}
                            <p className="text-sm text-slate-500 mb-1">{vital.label}</p>

                            {/* Value */}
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-slate-800">{vital.value}</span>
                                <span className="text-sm text-slate-400">{vital.unit}</span>
                            </div>

                            {/* Trend */}
                            <div className="flex items-center gap-1 mt-2">
                                {getTrendIcon(vital.trend)}
                                <span className={`text-xs ${vital.trend === 'up' ? 'text-green-500' :
                                        vital.trend === 'down' ? 'text-red-500' :
                                            'text-slate-400'
                                    }`}>
                                    {vital.trendValue}
                                </span>
                            </div>

                            {/* Progress Ring */}
                            <div className="absolute top-4 left-4 w-8 h-8">
                                <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-slate-200"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className={vital.color.replace('text-', 'text-')}
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        fill="none"
                                        strokeDasharray={`${progress}, 100`}
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                            </div>

                            {/* Edit Hint */}
                            <div className="absolute inset-0 bg-[#2D9B83]/0 group-hover:bg-[#2D9B83]/5 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                <Plus className="w-6 h-6 text-[#2D9B83]" />
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="text-right">تحديث {selectedVital?.label}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="flex items-center gap-3">
                            <Input
                                type="number"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="text-center text-2xl h-14"
                                min={selectedVital?.min}
                                max={selectedVital?.max}
                            />
                            <span className="text-lg text-slate-500">{selectedVital?.unit}</span>
                        </div>
                        {selectedVital?.target && (
                            <p className="text-sm text-slate-400 text-center mt-3">
                                الهدف: {selectedVital.target} {selectedVital.unit}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            className="flex-1"
                        >
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="flex-1 bg-[#2D9B83] hover:bg-[#2D9B83]/90"
                        >
                            حفظ
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
