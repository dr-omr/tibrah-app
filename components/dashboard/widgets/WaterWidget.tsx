import React, { useState, useEffect } from 'react';
import { Droplets, Plus, Minus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface WaterWidgetProps {
    initialGlasses: number;
    goal: number;
    logId?: string;
    onUpdate: () => void;
}

export const WaterWidget = ({ initialGlasses, goal, logId, onUpdate }: WaterWidgetProps) => {
    const [glasses, setGlasses] = useState(initialGlasses);
    const [isUpdating, setIsUpdating] = useState(false);
    const today = format(new Date(), 'yyyy-MM-dd');

    // Sync prop changes
    useEffect(() => {
        setGlasses(initialGlasses);
    }, [initialGlasses]);

    const updateWater = async (newAmount: number) => {
        if (newAmount < 0) return;
        setGlasses(newAmount); // Optimistic update
        setIsUpdating(true);

        try {
            if (logId) {
                await db.entities.WaterLog.update(logId, { glasses: newAmount });
            } else {
                await db.entities.WaterLog.create({
                    date: today,
                    glasses: newAmount,
                    goal: goal
                });
            }
            onUpdate();
        } catch (error) {
            toast.error("فشل تحديث سجل الماء");
            setGlasses(initialGlasses); // Revert
        } finally {
            setIsUpdating(false);
        }
    };

    const percentage = Math.min(100, Math.round((glasses / goal) * 100));

    return (
        <div className="glass rounded-2xl p-4 relative overflow-hidden group">
            {/* Background Animation */}
            <div
                className="absolute bottom-0 left-0 right-0 bg-cyan-500/10 transition-all duration-700 ease-out"
                style={{ height: `${percentage}%` }}
            />

            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-500">
                        <Droplets className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">شرب الماء</h3>
                        <p className="text-sm text-slate-500">
                            {glasses} / {goal} أكواب
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 rounded-full border-slate-200 hover:border-cyan-500 hover:text-cyan-500"
                        onClick={() => updateWater(glasses - 1)}
                        disabled={isUpdating || glasses <= 0}
                    >
                        <Minus className="w-4 h-4" />
                    </Button>
                    <Button
                        size="icon"
                        className="h-10 w-10 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20"
                        onClick={() => updateWater(glasses + 1)}
                        disabled={isUpdating}
                    >
                        {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    </Button>
                </div>
            </div>
        </div>
    );
};
