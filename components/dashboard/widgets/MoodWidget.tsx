import React, { useState } from 'react';
import { Brain, Loader2 } from 'lucide-react';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface MoodWidgetProps {
    currentMood?: number;
    logId?: string;
    onUpdate: () => void;
}

const MOODS = [
    { score: 1, emoji: '😫', label: 'مرهق' },
    { score: 2, emoji: '😔', label: 'حزين' },
    { score: 3, emoji: '😐', label: 'عادي' },
    { score: 4, emoji: '😊', label: 'جيد' },
    { score: 5, emoji: '🤩', label: 'ممتاز' },
];

export const MoodWidget = ({ currentMood, logId, onUpdate }: MoodWidgetProps) => {
    const [selectedMood, setSelectedMood] = useState<number | undefined>(currentMood);
    const [isUpdating, setIsUpdating] = useState(false);
    const today = format(new Date(), 'yyyy-MM-dd');

    const handleMoodSelect = async (score: number) => {
        if (score === selectedMood) return;

        setSelectedMood(score);
        setIsUpdating(true);

        try {
            if (logId) {
                await db.entities.DailyLog.update(logId, { mood_score: score });
            } else {
                await db.entities.DailyLog.create({
                    date: today,
                    mood_score: score
                });
            }
            toast.success("تم تسجيل حالتك المزاجية");
            onUpdate();
        } catch (error) {
            toast.error("فشل تسجيل الحالة");
            setSelectedMood(currentMood); // Revert
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-500">
                    <Brain className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">كيف تشعر اليوم؟</h3>
                    <p className="text-sm text-slate-500">
                        {selectedMood ? MOODS.find(m => m.score === selectedMood)?.label : 'سجل حالتك للمتابعة'}
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center bg-white/50 rounded-xl p-2">
                {MOODS.map((mood) => (
                    <button
                        key={mood.score}
                        disabled={isUpdating}
                        onClick={() => handleMoodSelect(mood.score)}
                        className={`
                            w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-all
                            ${selectedMood === mood.score
                                ? 'bg-purple-100 scale-125 shadow-md ring-2 ring-purple-200'
                                : 'hover:bg-slate-100 hover:scale-110 grayscale hover:grayscale-0'
                            }
                        `}
                    >
                        {mood.emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};
