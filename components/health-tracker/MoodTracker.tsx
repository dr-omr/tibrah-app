import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import {
    Smile, Meh, Frown, Heart, Angry,
    TrendingUp, Calendar, ChevronLeft, Plus, Sparkles,
    Brain, Loader2
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from '@/components/notification-engine';
import { aiClient } from '@/components/ai/aiClient';
import { motion } from 'framer-motion';

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
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const today = format(new Date(), 'yyyy-MM-dd');

    const [selectedMood, setSelectedMood] = useState(0);
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
    const [note, setNote] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [aiMoodInsight, setAiMoodInsight] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(false);

    // Load today's mood
    const { data: todaysMood } = useQuery({
        queryKey: ['moodLog', today, user?.id],
        queryFn: async () => {
            try {
                const logs = await db.entities.DailyLog.filter({ date: today, user_id: user?.id });
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
        },
        enabled: !!user?.id,
    });

    // Load mood history
    const { data: moodHistory = [] } = useQuery({
        queryKey: ['moodHistory', user?.id],
        queryFn: async () => {
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
                const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
                last7Days.push(date);
            }

            const logs = await db.entities.DailyLog.filter({
                date: { $in: last7Days }, user_id: user?.id
            });

            return last7Days.map(date => {
                const log = logs?.find((l: { date: string }) => l.date === date);
                return {
                    date,
                    mood: Number(log?.mood_score) || 0,
                    day: format(new Date(date), 'EEE', { locale: ar })
                };
            });
        },
        enabled: !!user?.id,
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
            const logs = await db.entities.DailyLog.filter({ date: today, user_id: user?.id });
            const data = {
                mood_score: selectedMood,
                emotions: selectedEmotions,
                mood_note: note,
                date: today
            };

            if (logs?.[0]) {
                await db.entities.DailyLog.update(logs[0].id as string, data);
            } else {
                await db.entities.DailyLog.createForUser(user?.id || '', data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['moodLog', today] });
            queryClient.invalidateQueries({ queryKey: ['moodHistory'] });
            setShowForm(false);

            // Mood Analysis & Suggestion
            if (selectedMood <= 2 || selectedEmotions.includes('anxious') || selectedEmotions.includes('sad') || selectedEmotions.includes('stress')) {
                toast.success('تم حفظ مزاجك', {
                    body: 'تشعر بضيق؟ جرب الاستماع لترددات السولفيجيو لرفع ذبذباتك.',
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
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-[var(--radius-xl)] p-5 border border-pink-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-4">
                            <span className="text-5xl drop-shadow-md">
                                {MOODS.find(m => m.value === todaysMood.mood)?.emoji || '😐'}
                            </span>
                            <div>
                                <p className="font-black text-lg text-slate-800">
                                    {MOODS.find(m => m.value === todaysMood.mood)?.label || 'عادي'}
                                </p>
                                <p className="text-sm font-medium text-slate-500 mt-0.5">
                                    {todaysMood.emotions.length > 0 ? 'المشاعر: ' : ''}
                                    {todaysMood.emotions.map(e =>
                                        EMOTIONS.find(em => em.id === e)?.label
                                    ).join('، ')}
                                </p>
                            </div>
                        </div>
                        {todaysMood.note && (
                            <div className="mt-4 text-sm text-slate-700 bg-white/60 rounded-xl p-3 border border-pink-200/50 backdrop-blur-sm">
                                <p className="italic">"{todaysMood.note}"</p>
                            </div>
                        )}
                    </div>

                    {/* Auto-suggest Cross-sell */}
                    {(todaysMood.mood <= 2 || todaysMood.emotions.some(e => ['anxious', 'stressed', 'sad', 'tired', 'angry'].includes(e))) && (
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                            className="bg-white border border-rose-100/50 rounded-[var(--radius-xl)] p-4 shadow-[var(--shadow-premium)] flex gap-4"
                        >
                            <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 border border-orange-100">
                                <span className="text-3xl">🌿</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-1">
                                    <Sparkles className="w-4 h-4 text-orange-500" />
                                    اقتراح مخصص لحالتك
                                </h4>
                                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                                    يبدو أنك مستنزف اليوم. مستخلص <span className="font-bold text-slate-700">الأشواغاندا النقي (KSM-66)</span> أثبت فعاليته في خفض هرمون التوتر وتحسين المزاج.
                                </p>
                                <Button 
                                    className="w-full h-9 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-600/20"
                                    onClick={() => window.location.href = '/product-details?id=ashwagandha-ksm66'}
                                >
                                    اكتشف العلاج في الصيدلية
                                </Button>
                            </div>
                        </motion.div>
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
                                    <span className="text-xs text-slate-500 mt-1">{mood.label}</span>
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
                                        ? 'bg-primary text-white'
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
                    <div className="flex items-center gap-1 text-sm text-primary">
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
                            <span className="text-xs text-slate-500">{day.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Mood Analysis */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-200">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-rose-600" />
                        <span className="font-bold text-slate-800 text-sm">تحليل ذكي للمزاج</span>
                    </div>
                    <Button
                        size="sm"
                        className="bg-rose-600 text-white rounded-xl h-8 text-xs"
                        disabled={aiLoading}
                        onClick={async () => {
                            setAiLoading(true);
                            try {
                                const result = await aiClient.analyzeMood({
                                    current_mood: todaysMood?.mood || selectedMood,
                                    emotions: todaysMood?.emotions || selectedEmotions,
                                    note: todaysMood?.note || note,
                                    weekly_average: Number(averageMood),
                                    history: moodHistory.map(h => ({ day: h.day, mood: h.mood }))
                                });
                                setAiMoodInsight(result);
                            } catch { }
                            finally { setAiLoading(false); }
                        }}
                    >
                        {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 ml-1" />}
                        {aiLoading ? 'جاري...' : 'حلل مزاجي'}
                    </Button>
                </div>
                {aiMoodInsight && (
                    <div className="space-y-2 mt-2">
                        {aiMoodInsight.analysis && <p className="text-sm text-slate-700">{aiMoodInsight.analysis}</p>}
                        {aiMoodInsight.coping_strategies?.map((t: string, i: number) => (
                            <p key={i} className="text-xs text-slate-600">• {t}</p>
                        ))}
                        {aiMoodInsight.affirmation && (
                            <p className="text-xs text-pink-600 italic text-center">✨ "{aiMoodInsight.affirmation}"</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
