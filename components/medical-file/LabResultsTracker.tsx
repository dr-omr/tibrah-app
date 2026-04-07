'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { 
    Microscope, Plus, TrendingUp, TrendingDown, Minus, 
    AlertCircle, CheckCircle2, Droplets, Droplet, Activity, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from '@/components/notification-engine';

export interface BiomarkerResult {
    id?: string;
    marker_id: string; // e.g., 'vit_d', 'ferritin'
    value: number;
    unit: string;
    date: string;
}

const BIOMARKERS = [
    { id: 'vit_d', name: 'فيتامين د (Vitamin D)', unit: 'ng/mL', min: 30, max: 100, icon: Flame, color: 'text-amber-500', bg: 'bg-amber-100' },
    { id: 'ferritin', name: 'الفيريتين (مخزون الحديد)', unit: 'ng/mL', min: 30, max: 300, icon: Droplet, color: 'text-red-500', bg: 'bg-red-100' },
    { id: 'b12', name: 'فيتامين ب١٢ (Vitamin B12)', unit: 'pg/mL', min: 300, max: 900, icon: Activity, color: 'text-violet-500', bg: 'bg-violet-100' },
    { id: 'hba1c', name: 'السكر التراكمي (HbA1c)', unit: '%', min: 4.0, max: 5.6, icon: Droplets, color: 'text-emerald-500', bg: 'bg-emerald-100', inverse: true },
];

export default function LabResultsTracker() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    
    // Form state
    const [selectedMarker, setSelectedMarker] = useState<string>('vit_d');
    const [resultValue, setResultValue] = useState<string>('');
    const [resultDate, setResultDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch lab results
    const { data: results = [], isLoading } = useQuery({
        queryKey: ['labResults', user?.id],
        queryFn: () => db.entities.LabResult.listForUser(user?.id || ''),
        enabled: !!user,
    });

    const groupedResults = useMemo(() => {
        const groups: Record<string, BiomarkerResult[]> = {};
        BIOMARKERS.forEach(b => groups[b.id] = []);
        
        results.forEach((r: any) => {
            if (groups[r.marker_id]) {
                groups[r.marker_id].push(r);
            }
        });

        // Sort by date descending
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });

        return groups;
    }, [results]);

    const handleSaveResult = async () => {
        if (!resultValue || isNaN(Number(resultValue))) {
            toast.error('يرجى إدخال قيمة صحيحة');
            return;
        }

        setIsSubmitting(true);
        try {
            const markerDef = BIOMARKERS.find(m => m.id === selectedMarker);
            const newResult = {
                marker_id: selectedMarker,
                value: Number(resultValue),
                unit: markerDef?.unit || '',
                date: resultDate,
                user_id: user?.id,
            };

            await db.entities.LabResult.createForUser(user?.id || '', newResult);
            queryClient.invalidateQueries({ queryKey: ['labResults'] });
            
            toast.success('تم حفظ النتيجة بنجاح');
            setIsAdding(false);
            setResultValue('');
        } catch (error) {
            toast.error('حدث خطأ أثناء الحفظ');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusStyle = (marker: typeof BIOMARKERS[0], value: number) => {
        const isIdeal = marker.inverse 
            ? value <= marker.max && value >= marker.min
            : value >= marker.min && value <= marker.max;
            
        if (isIdeal) return { color: 'text-emerald-600', text: 'مثالي', icon: CheckCircle2, bg: 'bg-emerald-50 border-emerald-200' };
        
        const isLow = value < marker.min;
        if (isLow && !marker.inverse) return { color: 'text-red-500', text: 'منخفض', icon: TrendingDown, bg: 'bg-red-50 border-red-200' };
        if (isLow && marker.inverse) return { color: 'text-amber-500', text: 'منخفض', icon: TrendingDown, bg: 'bg-amber-50 border-amber-200' };
        
        return { color: 'text-amber-500', text: 'مرتفع', icon: TrendingUp, bg: 'bg-amber-50 border-amber-200' };
    };

    if (isLoading) {
        return <div className="py-20 flex justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-bold text-slate-800 dark:text-white">المؤشرات الحيوية</h2>
                    <p className="text-xs text-slate-500 mt-0.5">تتبع التحاليل وقياس فعالية خطة التعافي</p>
                </div>
                <Button 
                    onClick={() => setIsAdding(true)}
                    className="h-9 rounded-full bg-primary text-white shadow-md shadow-primary/20 text-xs font-bold"
                >
                    <Plus className="w-4 h-4 ml-1" />
                    إضافة نتيجة
                </Button>
            </div>

            {/* List of Biomarkers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BIOMARKERS.map((marker) => {
                    const history = groupedResults[marker.id];
                    const latest = history[0];
                    const previous = history[1];
                    const Icon = marker.icon;

                    let trendIcon = null;
                    let trendColor = '';
                    
                    if (latest && previous) {
                        if (latest.value > previous.value) {
                            trendIcon = <TrendingUp className="w-3.5 h-3.5" />;
                            trendColor = marker.inverse ? 'text-red-500' : 'text-emerald-500';
                        } else if (latest.value < previous.value) {
                            trendIcon = <TrendingDown className="w-3.5 h-3.5" />;
                            trendColor = marker.inverse ? 'text-emerald-500' : 'text-red-500';
                        } else {
                            trendIcon = <Minus className="w-3.5 h-3.5 text-slate-400" />;
                            trendColor = 'text-slate-400';
                        }
                    }

                    return (
                        <div key={marker.id} className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/60 dark:border-slate-700/50 shadow-sm relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-2xl ${marker.bg} bg-opacity-50 flex items-center justify-center flex-shrink-0`}>
                                        <Icon className={`w-6 h-6 ${marker.color}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-white text-sm">{marker.name}</h3>
                                        <p className="text-[10px] text-slate-400 font-medium">المدى الطبيعي: {marker.min} - {marker.max} {marker.unit}</p>
                                    </div>
                                </div>
                            </div>

                            {latest ? (
                                <div className="space-y-4">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-black text-slate-800 dark:text-white">{latest.value}</span>
                                                <span className="text-xs font-bold text-slate-500">{marker.unit}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1">
                                                آخر قياس: {format(new Date(latest.date), 'yyyy-MM-dd')}
                                            </p>
                                        </div>
                                        
                                        <div className="flex flex-col items-end gap-2">
                                            {(() => {
                                                const status = getStatusStyle(marker, latest.value);
                                                const StatusIcon = status.icon;
                                                return (
                                                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${status.bg} border`}>
                                                        <StatusIcon className={`w-3 h-3 ${status.color}`} />
                                                        <span className={status.color}>{status.text}</span>
                                                    </span>
                                                );
                                            })()}
                                            
                                            {trendIcon && (
                                                <span className={`flex items-center gap-1 text-[10px] font-bold ${trendColor}`}>
                                                    {trendIcon} عن القراءة السابقة
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Mini Sparkline Visualization */}
                                    {history.length > 1 && (
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                                            {history.slice(0, 5).reverse().map((r, i) => {
                                                // Calculate height roughly based on max
                                                const maxVal = Math.max(...history.map(h => h.value), marker.max);
                                                const pct = Math.min(100, Math.max(10, (r.value / maxVal) * 100));
                                                return (
                                                    <div 
                                                        key={r.id} 
                                                        className="flex-1 border-r border-white/20 last:border-0 relative bg-slate-200 dark:bg-slate-600 flex items-end"
                                                    >
                                                        <div 
                                                            className={`w-full ${getStatusStyle(marker, r.value).color.replace('text-', 'bg-')}`} 
                                                            style={{ height: `${pct}%`, opacity: i === history.length - 1 ? 1 : 0.4 }}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-4 text-center border-t border-slate-50 dark:border-slate-700/50 mt-2">
                                    <p className="text-xs font-medium text-slate-400">لا توجد قراءات مسجلة</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add Result Sheet */}
            <Sheet open={isAdding} onOpenChange={setIsAdding}>
                <SheetContent side="bottom" className="rounded-t-3xl min-h-[50vh]">
                    <SheetHeader className="mb-6">
                        <SheetTitle>تسجيل نتيجة مخبرية جديدة</SheetTitle>
                    </SheetHeader>
                    
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">التحليل</label>
                            <div className="grid grid-cols-2 gap-2">
                                {BIOMARKERS.map(marker => (
                                    <button
                                        key={marker.id}
                                        onClick={() => setSelectedMarker(marker.id)}
                                        className={`p-3 rounded-xl border-2 text-xs font-bold transition-all text-right ${selectedMarker === marker.id 
                                            ? 'border-primary bg-primary/5 text-primary' 
                                            : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <marker.icon className={`w-4 h-4 ${selectedMarker === marker.id ? 'text-primary' : 'text-slate-400'}`} />
                                            {marker.name.split(' ')[0]}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">النتيجة ({BIOMARKERS.find(m => m.id === selectedMarker)?.unit})</label>
                            <Input
                                type="number"
                                placeholder="أدخل القيمة رقماً"
                                value={resultValue}
                                onChange={e => setResultValue(e.target.value)}
                                className="h-12 rounded-xl text-lg font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">تاريخ التحليل</label>
                            <Input
                                type="date"
                                value={resultDate}
                                onChange={e => setResultDate(e.target.value)}
                                className="h-12 rounded-xl text-sm"
                            />
                        </div>

                        <Button 
                            className="w-full h-12 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/20"
                            onClick={handleSaveResult}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'جاري الحفظ...' : 'حفظ النتيجة'}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
