// components/health-tracker/MentalHealthHub.tsx
// PREMIUM Interactive Mental Health & Wellbeing with Animated UI

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, Smile, Brain, BookOpen, Sparkles, Lightbulb,
    TrendingUp, Sun, Cloud, Zap, Star, Send, ChevronDown
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';

// Mood options with animations
const MOODS = [
    { value: 1, emoji: '😢', label: 'حزين جداً', color: '#6366F1', bg: 'from-indigo-500 to-purple-600', particle: '💧' },
    { value: 2, emoji: '😔', label: 'حزين', color: '#8B5CF6', bg: 'from-purple-500 to-pink-500', particle: '🌧️' },
    { value: 3, emoji: '😐', label: 'عادي', color: '#F59E0B', bg: 'from-amber-500 to-orange-500', particle: '☁️' },
    { value: 4, emoji: '😊', label: 'سعيد', color: '#10B981', bg: 'from-emerald-500 to-teal-500', particle: '✨' },
    { value: 5, emoji: '😄', label: 'سعيد جداً', color: '#06B6D4', bg: 'from-cyan-500 to-blue-500', particle: '🌟' },
];

// Feelings tags with colors
const FEELINGS = [
    { id: 'happy', emoji: '😊', label: 'سعادة', color: 'from-yellow-400 to-orange-400' },
    { id: 'calm', emoji: '😌', label: 'هدوء', color: 'from-teal-400 to-cyan-400' },
    { id: 'grateful', emoji: '🙏', label: 'امتنان', color: 'from-pink-400 to-rose-400' },
    { id: 'energetic', emoji: '⚡', label: 'نشاط', color: 'from-amber-400 to-yellow-400' },
    { id: 'anxious', emoji: '😰', label: 'قلق', color: 'from-violet-400 to-purple-400' },
    { id: 'tired', emoji: '😴', label: 'تعب', color: 'from-slate-400 to-gray-400' },
    { id: 'angry', emoji: '😤', label: 'غضب', color: 'from-red-400 to-orange-400' },
    { id: 'lonely', emoji: '😔', label: 'وحدة', color: 'from-indigo-400 to-blue-400' },
];

// Gratitude prompts
const GRATITUDE_PROMPTS = [
    'ما الذي تشعر بالامتنان له اليوم؟',
    'من الشخص الذي أسعدك اليوم؟',
    'ما هي اللحظة الجميلة في يومك؟',
    'ما الشيء الصغير الذي جعلك تبتسم؟',
];

interface MentalEntry {
    id?: string;
    date: string;
    mood: number;
    stress: number;
    feelings: string[];
    gratitude?: string;
}

export default function MentalHealthHub() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const queryClient = useQueryClient();

    // State
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [selectedStress, setSelectedStress] = useState(3);
    const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
    const [gratitudeText, setGratitudeText] = useState('');
    const [showGratitude, setShowGratitude] = useState(false);
    const [showParticles, setShowParticles] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Random gratitude prompt
    const [gratitudePrompt] = useState(() =>
        GRATITUDE_PROMPTS[Math.floor(Math.random() * GRATITUDE_PROMPTS.length)]
    );

    // Fetch today's entry
    const { data: todayEntry } = useQuery<MentalEntry | null>({
        queryKey: ['mentalHealth', today],
        queryFn: async () => {
            try {
                const logs = await db.entities.DailyLog.filter({ date: today });
                if (logs?.[0] && logs[0].mood) {
                    const mood = logs[0].mood as any;
                    return {
                        date: today,
                        mood: typeof mood === 'object' ? mood.overall : mood,
                        stress: typeof mood === 'object' ? mood.stress : 3,
                        feelings: [],
                        gratitude: typeof mood === 'object' ? mood.notes : ''
                    };
                }
                return null;
            } catch {
                return null;
            }
        },
    });

    // Fetch weekly mood data
    const { data: weeklyMoods = [] } = useQuery<MentalEntry[]>({
        queryKey: ['mentalHealthWeek'],
        queryFn: async () => {
            try {
                const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
                const logs = await db.entities.DailyLog.filter({ date: { $gte: weekAgo } });
                return logs.map((log: any) => {
                    const mood = log.mood as any;
                    return {
                        date: log.date,
                        mood: typeof mood === 'object' ? mood.overall : (mood || 0),
                        stress: typeof mood === 'object' ? mood.stress : 3,
                        feelings: [],
                        gratitude: ''
                    };
                }) as MentalEntry[];
            } catch {
                return [];
            }
        },
    });

    // Load today's data
    useEffect(() => {
        if (todayEntry) {
            setSelectedMood(todayEntry.mood);
            setSelectedStress(todayEntry.stress || 3);
            setGratitudeText(todayEntry.gratitude || '');
            setIsSaved(true);
        }
    }, [todayEntry]);

    // Weekly average mood
    const moodsWithValue = weeklyMoods.filter(m => m.mood > 0);
    const avgMood = moodsWithValue.length > 0
        ? Math.round(moodsWithValue.reduce((sum, m) => sum + m.mood, 0) / moodsWithValue.length)
        : 0;

    const currentMoodData = MOODS.find(m => m.value === selectedMood);

    // Handle mood selection with particles
    const selectMood = (value: number) => {
        setSelectedMood(value);
        setShowParticles(true);
        setIsSaved(false);
        setTimeout(() => setShowParticles(false), 1000);
    };

    // Save mutation
    const saveMoodMutation = useMutation({
        mutationFn: async () => {
            const moodData = {
                overall: selectedMood,
                stress: selectedStress,
                feelings: selectedFeelings,
                notes: gratitudeText
            };

            const logs = await db.entities.DailyLog.filter({ date: today });
            if (logs?.[0]) {
                return db.entities.DailyLog.update(logs[0].id as string, { mood: moodData as any });
            }
            return db.entities.DailyLog.create({ date: today, mood: moodData as any });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mentalHealth'] });
            queryClient.invalidateQueries({ queryKey: ['mentalHealthWeek'] });
            setIsSaved(true);
            toast.success('تم حفظ حالتك النفسية 💚');
        },
    });

    const toggleFeeling = (id: string) => {
        setSelectedFeelings(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
        setIsSaved(false);
    };

    return (
        <motion.div
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Main Mood Card */}
            <motion.div
                className={`relative rounded-[2.5rem] p-6 text-white overflow-hidden shadow-2xl min-h-[320px] bg-gradient-to-br ${currentMoodData ? currentMoodData.bg : 'from-slate-600 to-slate-700'
                    }`}
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                layout
            >
                {/* Floating particles based on mood */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-2xl"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                y: [0, -50, 0],
                                x: [0, Math.random() * 30 - 15, 0],
                                opacity: [0, 0.6, 0],
                                scale: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 4 + Math.random() * 3,
                                repeat: Infinity,
                                delay: Math.random() * 4,
                            }}
                        >
                            {currentMoodData?.particle || '✨'}
                        </motion.div>
                    ))}
                </div>

                {/* Selection particles burst */}
                <AnimatePresence>
                    {showParticles && currentMoodData && (
                        [...Array(10)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute text-3xl z-30"
                                style={{
                                    top: '50%',
                                    left: '50%',
                                }}
                                initial={{ x: 0, y: 0, opacity: 1 }}
                                animate={{
                                    x: (Math.random() - 0.5) * 200,
                                    y: (Math.random() - 0.5) * 200,
                                    opacity: 0,
                                    scale: [1, 1.5, 0],
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                {currentMoodData.particle}
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <motion.div
                        className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm"
                        animate={{
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                        }}
                    >
                        <Heart className="w-7 h-7" />
                    </motion.div>
                    <div>
                        <h2 className="text-2xl font-bold">حالتك النفسية</h2>
                        <p className="text-white/80 text-sm">كيف تشعر اليوم؟</p>
                    </div>

                    {/* Saved indicator */}
                    {isSaved && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mr-auto bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm"
                        >
                            ✓ محفوظ
                        </motion.div>
                    )}
                </div>

                {/* Mood Selector - Interactive */}
                <div className="flex justify-between gap-2 mb-6 relative z-10">
                    {MOODS.map((mood, index) => (
                        <motion.button
                            key={mood.value}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.15, y: -8 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => selectMood(mood.value)}
                            className={`flex-1 py-4 rounded-2xl text-center transition-all relative ${selectedMood === mood.value
                                    ? 'bg-white shadow-2xl'
                                    : 'bg-white/20 hover:bg-white/30'
                                }`}
                        >
                            <motion.span
                                className="text-4xl block mb-1"
                                animate={selectedMood === mood.value ? {
                                    scale: [1, 1.3, 1],
                                    rotate: [0, -10, 10, 0]
                                } : {}}
                                transition={{ duration: 0.5 }}
                            >
                                {mood.emoji}
                            </motion.span>
                            <span className={`text-[10px] font-medium ${selectedMood === mood.value ? 'text-slate-700' : 'text-white/80'
                                }`}>
                                {mood.label}
                            </span>

                            {/* Selection ring */}
                            {selectedMood === mood.value && (
                                <motion.div
                                    className="absolute inset-0 rounded-2xl border-4 border-white"
                                    initial={{ scale: 1.2, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                />
                            )}
                        </motion.button>
                    ))}
                </div>

                {/* Selected Mood Display */}
                <AnimatePresence mode="wait">
                    {selectedMood && (
                        <motion.div
                            key={selectedMood}
                            className="text-center py-4 relative z-10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <motion.p
                                className="text-white/90 text-xl"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                            >
                                أنت تشعر <span className="font-bold text-2xl underline decoration-wavy">{currentMoodData?.label}</span>
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Stress Level with Visual Slider */}
            <motion.div
                className="bg-white rounded-2xl p-5 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    مستوى التوتر
                </h3>

                {/* Visual stress indicator */}
                <div className="flex justify-center mb-4">
                    <motion.div
                        className="text-6xl"
                        key={selectedStress}
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                    >
                        {selectedStress <= 2 ? '😌' : selectedStress === 3 ? '😐' : selectedStress === 4 ? '😟' : '😰'}
                    </motion.div>
                </div>

                {/* Interactive stress buttons */}
                <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((level) => (
                        <motion.button
                            key={level}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setSelectedStress(level);
                                setIsSaved(false);
                            }}
                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${selectedStress === level
                                    ? level <= 2 ? 'bg-green-500 text-white' :
                                        level === 3 ? 'bg-yellow-500 text-white' :
                                            'bg-red-500 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {level}
                        </motion.button>
                    ))}
                </div>

                <div className="flex justify-between text-xs text-slate-500">
                    <span className="text-green-600">هادئ تماماً</span>
                    <span className="text-red-600">متوتر جداً</span>
                </div>
            </motion.div>

            {/* Feelings Tags with Animation */}
            <motion.div
                className="bg-white rounded-2xl p-5 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
            >
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    ما الذي تشعر به؟
                </h3>

                <div className="flex flex-wrap gap-2">
                    {FEELINGS.map((feeling, i) => (
                        <motion.button
                            key={feeling.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.03 }}
                            whileHover={{ scale: 1.08, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleFeeling(feeling.id)}
                            className={`px-4 py-2.5 rounded-full text-sm flex items-center gap-2 transition-all font-medium ${selectedFeelings.includes(feeling.id)
                                    ? `bg-gradient-to-r ${feeling.color} text-white shadow-lg`
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            <motion.span
                                className="text-lg"
                                animate={selectedFeelings.includes(feeling.id) ? {
                                    rotate: [0, -15, 15, 0]
                                } : {}}
                            >
                                {feeling.emoji}
                            </motion.span>
                            {feeling.label}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Gratitude Section - Expandable */}
            <motion.div
                className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl overflow-hidden shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <motion.button
                    onClick={() => setShowGratitude(!showGratitude)}
                    className="w-full p-5 flex items-center justify-between"
                    whileTap={{ scale: 0.99 }}
                >
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                        >
                            <Lightbulb className="w-5 h-5 text-amber-500" />
                        </motion.div>
                        لحظة امتنان 🙏
                    </h3>
                    <motion.div
                        animate={{ rotate: showGratitude ? 180 : 0 }}
                        className="text-amber-500"
                    >
                        <ChevronDown className="w-5 h-5" />
                    </motion.div>
                </motion.button>

                <AnimatePresence>
                    {showGratitude && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-5 pb-5"
                        >
                            <p className="text-sm text-amber-700 mb-3">
                                {gratitudePrompt}
                            </p>
                            <div className="relative">
                                <textarea
                                    value={gratitudeText}
                                    onChange={(e) => {
                                        setGratitudeText(e.target.value);
                                        setIsSaved(false);
                                    }}
                                    placeholder="اكتب هنا..."
                                    className="w-full p-4 pr-12 rounded-2xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 resize-none h-28 text-slate-700"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => saveMoodMutation.mutate()}
                                    className="absolute bottom-4 left-4 w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg"
                                >
                                    <Send className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Weekly Mood Chart - Visual */}
            <motion.div
                className="bg-white rounded-2xl p-5 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
            >
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    حالتك هذا الأسبوع
                </h3>

                <div className="flex items-center justify-between gap-2">
                    {getLast7Days().map((day, index) => {
                        const dayMood = weeklyMoods.find(m => m.date === day.date);
                        const moodValue = dayMood?.mood || 0;
                        const moodData = MOODS.find(m => m.value === moodValue);
                        const isToday = day.date === today;

                        return (
                            <motion.div
                                key={day.date}
                                className="flex-1 flex flex-col items-center gap-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <motion.div
                                    className={`w-full aspect-square rounded-xl flex items-center justify-center relative ${isToday ? 'ring-2 ring-emerald-400 ring-offset-2' : ''
                                        }`}
                                    style={{
                                        background: moodValue > 0 && moodData
                                            ? `linear-gradient(135deg, ${moodData.color}20, ${moodData.color}40)`
                                            : '#F1F5F9'
                                    }}
                                    whileHover={{ scale: 1.1, y: -3 }}
                                >
                                    {moodValue > 0 ? (
                                        <motion.span
                                            className="text-2xl"
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: 0.2 + index * 0.05, type: 'spring' }}
                                        >
                                            {moodData?.emoji}
                                        </motion.span>
                                    ) : (
                                        <span className="text-slate-300 text-xs">-</span>
                                    )}
                                </motion.div>
                                <span className={`text-[10px] font-medium ${isToday ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                                    {day.label}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>

                {avgMood > 0 && (
                    <motion.div
                        className="mt-4 pt-4 border-t border-slate-100 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <p className="text-sm text-slate-600">
                            متوسط مزاجك:
                            <motion.span
                                className="text-2xl mr-2"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                {MOODS.find(m => m.value === avgMood)?.emoji}
                            </motion.span>
                        </p>
                    </motion.div>
                )}
            </motion.div>

            {/* Save Button */}
            <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => saveMoodMutation.mutate()}
                disabled={!selectedMood || saveMoodMutation.isPending || isSaved}
                className={`w-full rounded-2xl py-5 text-lg font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${isSaved
                        ? 'bg-slate-200 text-slate-500'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                    }`}
            >
                {isSaved ? (
                    <>
                        <Star className="w-5 h-5" />
                        تم الحفظ ✓
                    </>
                ) : (
                    <>
                        <Heart className="w-5 h-5" />
                        حفظ حالتي النفسية
                    </>
                )}
            </motion.button>
        </motion.div>
    );
}

// Helper function
function getLast7Days() {
    const days = [];
    const dayNames = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

    for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        days.push({
            date: format(date, 'yyyy-MM-dd'),
            label: i === 0 ? 'اليوم' : i === 1 ? 'أمس' : dayNames[date.getDay()]
        });
    }
    return days;
}
