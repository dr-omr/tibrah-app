import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import {
    Smile, Meh, Frown, Heart, Angry,
    TrendingUp, Calendar, ChevronLeft, Plus, Sparkles
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';

interface MoodEntry {
    mood: number;
    emotions: string[];
    note: string;
    date: string;
}

const MOODS = [
    { value: 1, emoji: '😫', label: 'سيء جداً', color: '#EF4444' },
    { value: 2, emoji: '😔', label: 'سيء', color: '#F97316' },
    { value: 3, emoji: '😐', label: 'عادي', color: '#EAB308' },
    { value: 4, emoji: '😊', label: 'جيد', color: '#22C55E' },
    { value: 5, emoji: '😄', label: 'ممتاز', color: '#10B981' }
];

const EMOTIONS = [
    { id: 'happy', label: 'سعيد', emoji: '😊' },
    { id: 'calm', label: 'هادئ', emoji: '😌' },
    { id: 'grateful', label: 'ممتن', emoji: '🙏' },
    { id: 'energetic', label: 'نشيط', emoji: '⚡' },
    { id: 'anxious', label: 'قلق', emoji: '😰' },
    { id: 'stressed', label: 'متوتر', emoji: '😣' },
    { id: 'sad', label: 'حزين', emoji: '😢' },
    { id: 'tired', label: 'متعب', emoji: '😴' },
    { id: 'angry', label: 'غاضب', emoji: '😠' },
    { id: 'hopeful', label: 'متفائل', emoji: '🌟' }
];

export default function MoodTracker() {
    const queryClient = useQueryClient();
    const today = format(new Date(), 'yyyy-MM-dd');

    const [selectedMood, setSelectedMood] = useState(0);
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
    const [note, setNote] = useState('');
    const [showForm, setShowForm] = useState(false);

    // Load today's mood
    const { data: todaysMood } = useQuery({
        queryKey: ['moodLog', today],
        queryFn: async () => {
            try {
                const logs = await db.entities.DailyLog.filter({ date: today });
                const log = logs?.[0];
                if (log?.mood_score) {
                    return {
                        mood: log.mood_score as number,
                        emotions: (log.emotions as string[]) || [],
                        note: (log.mood_note as string) || ''
                    };
                }
                return null;
            } catch {
                return null;
            }
        }
    });

    // Load mood history
    const { data: moodHistory = [] } = useQuery({
        queryKey: ['moodHistory'],
        queryFn: async () => {
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
                const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
                last7Days.push(date);
            }

            const logs = await db.entities.DailyLog.filter({
                date: { $in: last7Days }
            });

            return last7Days.map(date => {
                const log = logs?.find((l: { date: string }) => l.date === date);
                return {
                    date,
                    mood: Number(log?.mood_score) || 0,
                    day: format(new Date(date), 'EEE', { locale: ar })
                };
            });
        }
    });

    const toggleEmotion = (emotionId: string) => {
        setSelectedEmotions(prev =>
            prev.includes(emotionId)
                ? prev.filter(e => e !== emotionId)
                : [...prev, emotionId]
        );
    };

    const saveMoodMutation = useMutation({
        mutationFn: async () => {
            const logs = await db.entities.DailyLog.filter({ date: today });
            const data = {
                mood_score: selectedMood,
                emotions: selectedEmotions,
                mood_note: note,
                date: today
            };

            if (logs?.[0]) {
                await db.entities.DailyLog.update(logs[0].id as string, data);
            } else {
                await db.entities.DailyLog.create(data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['moodLog', today] });
            queryClient.invalidateQueries({ queryKey: ['moodHistory'] });
            setShowForm(false);

            // Mood Analysis & Suggestion
            if (selectedMood <= 2 || selectedEmotions.includes('anxious') || selectedEmotions.includes('sad') || selectedEmotions.includes('stress')) {
                toast.success('تم حفظ مزاجك', {
                    description: 'تشعر بضيق؟ جرب الاستماع لترددات السولفيجيو لرفع ذبذباتك.',
                    action: {
                        label: '🎶 استمع للشفاء',
                        onClick: () => window.location.href = '/frequencies?id=4' // 528Hz Miracle
                    },
                    duration: 6000
                });
            } else {
                toast.success('تم حفظ مزاجك! 🌟');
            }
        }
    });

    const averageMood = moodHistory.length > 0
        ? (moodHistory.filter(m => m.mood > 0).reduce((sum, m) => sum + m.mood, 0) /
            moodHistory.filter(m => m.mood > 0).length).toFixed(1)
        : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    <h2 className="text-lg font-bold text-slate-800">مزاجك اليوم</h2>
                </div>
                {!todaysMood && !showForm && (
                    <Button
                        size="sm"
                        onClick={() => setShowForm(true)}
                        className="gradient-primary rounded-xl"
                    >
                        <Plus className="w-4 h-4 ml-1" />
                        سجل مزاجك
                    </Button>
                )}
            </div>

            {/* Today's Mood Display */}
            {todaysMood && !showForm && (
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-5 border border-pink-100">
                    <div className="flex items-center gap-4">
                        <span className="text-5xl">
                            {MOODS.find(m => m.value === todaysMood.mood)?.emoji || '😐'}
                        </span>
                        <div>
                            <p className="font-bold text-lg text-slate-800">
                                {MOODS.find(m => m.value === todaysMood.mood)?.label || 'عادي'}
                            </p>
                            <p className="text-sm text-slate-500">
                                سجلت اليوم: {todaysMood.emotions.map(e =>
                                    EMOTIONS.find(em => em.id === e)?.emoji
                                ).join(' ')}
                            </p>
                        </div>
                    </div>
                    {todaysMood.note && (
                        <p className="mt-3 text-sm text-slate-600 bg-white/50 rounded-xl p-3">
                            "{todaysMood.note}"
                        </p>
                    )}
                </div>
            )}

            {/* Mood Entry Form */}
            {showForm && (
                <div className="glass rounded-2xl p-5 space-y-5">
                    {/* Mood Selection */}
                    <div>
                        <p className="font-medium text-slate-700 mb-3">كيف تشعر الآن؟</p>
                        <div className="flex justify-between">
                            {MOODS.map(mood => (
                                <button
                                    key={mood.value}
                                    onClick={() => setSelectedMood(mood.value)}
                                    className={`flex flex-col items-center p-3 rounded-xl transition-all ${selectedMood === mood.value
                                        ? 'bg-slate-100 scale-110 shadow-md'
                                        : 'hover:bg-slate-50'
                                        }`}
                                >
                                    <span className="text-3xl">{mood.emoji}</span>
                                    <span className="text-[10px] text-slate-500 mt-1">{mood.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Emotions */}
                    <div>
                        <p className="font-medium text-slate-700 mb-3">ما الذي تشعر به؟ (اختر عدة مشاعر)</p>
                        <div className="flex flex-wrap gap-2">
                            {EMOTIONS.map(emotion => (
                                <button
                                    key={emotion.id}
                                    onClick={() => toggleEmotion(emotion.id)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all ${selectedEmotions.includes(emotion.id)
                                        ? 'bg-[#2D9B83] text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    <span>{emotion.emoji}</span>
                                    <span>{emotion.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Note */}
                    <div>
                        <p className="font-medium text-slate-700 mb-2">ملاحظة (اختياري)</p>
                        <Textarea
                            placeholder="كيف كان يومك؟ ما الذي أثر على مزاجك؟"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="min-h-[80px] resize-none rounded-xl"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowForm(false)}
                            className="flex-1 rounded-xl"
                        >
                            إلغاء
                        </Button>
                        <Button
                            onClick={() => saveMoodMutation.mutate()}
                            disabled={selectedMood === 0 || saveMoodMutation.isPending}
                            className="flex-1 gradient-primary rounded-xl"
                        >
                            {saveMoodMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Weekly Mood Chart */}
            <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-700">مزاجك هذا الأسبوع</h3>
                    <div className="flex items-center gap-1 text-sm text-[#2D9B83]">
                        <Sparkles className="w-4 h-4" />
                        <span>المتوسط: {averageMood}</span>
                    </div>
                </div>

                <div className="flex justify-between items-end h-24">
                    {moodHistory.map((day, index) => (
                        <div key={index} className="flex flex-col items-center gap-2">
                            <div
                                className="w-10 rounded-t-lg transition-all"
                                style={{
                                    height: day.mood > 0 ? `${day.mood * 16}px` : '8px',
                                    backgroundColor: day.mood > 0
                                        ? MOODS.find(m => m.value === day.mood)?.color || '#94A3B8'
                                        : '#E2E8F0'
                                }}
                            />
                            <span className="text-[10px] text-slate-500">{day.day}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
