// components/health-tracker/MoodSymptomPicker.tsx
// Apple/Flo-style emoji mood and symptom picker

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MoodOption {
    emoji: string;
    label: string;
    value: number;
}

interface SymptomOption {
    emoji: string;
    label: string;
    id: string;
}

const moods: MoodOption[] = [
    { emoji: '😊', label: 'ممتاز', value: 5 },
    { emoji: '🙂', label: 'جيد', value: 4 },
    { emoji: '😐', label: 'عادي', value: 3 },
    { emoji: '😔', label: 'سيء', value: 2 },
    { emoji: '😢', label: 'صعب', value: 1 },
];

const symptoms: SymptomOption[] = [
    { emoji: '🤕', label: 'صداع', id: 'headache' },
    { emoji: '😴', label: 'تعب', id: 'fatigue' },
    { emoji: '😰', label: 'قلق', id: 'anxiety' },
    { emoji: '🤢', label: 'غثيان', id: 'nausea' },
    { emoji: '🤧', label: 'زكام', id: 'cold' },
    { emoji: '😖', label: 'ألم', id: 'pain' },
    { emoji: '🌡️', label: 'حرارة', id: 'fever' },
    { emoji: '😮‍💨', label: 'ضيق', id: 'breathing' },
    { emoji: '💔', label: 'حزن', id: 'sadness' },
    { emoji: '😤', label: 'توتر', id: 'stress' },
    { emoji: '🦴', label: 'مفاصل', id: 'joints' },
    { emoji: '💤', label: 'أرق', id: 'insomnia' },
];

interface MoodSymptomPickerProps {
    onMoodChange?: (mood: number) => void;
    onSymptomsChange?: (symptoms: string[]) => void;
    selectedMood?: number;
    selectedSymptoms?: string[];
}

export default function MoodSymptomPicker({
    onMoodChange,
    onSymptomsChange,
    selectedMood: initialMood,
    selectedSymptoms: initialSymptoms = []
}: MoodSymptomPickerProps) {
    const [selectedMood, setSelectedMood] = useState<number | null>(initialMood || null);
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(initialSymptoms);

    const handleMoodSelect = (value: number) => {
        setSelectedMood(value);
        onMoodChange?.(value);
    };

    const handleSymptomToggle = (id: string) => {
        const updated = selectedSymptoms.includes(id)
            ? selectedSymptoms.filter(s => s !== id)
            : [...selectedSymptoms, id];
        setSelectedSymptoms(updated);
        onSymptomsChange?.(updated);
    };

    return (
        <div className="space-y-6">
            {/* Mood Section */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-5">
                <h3 className="text-lg font-bold text-slate-800 mb-1">كيف تشعر اليوم؟</h3>
                <p className="text-sm text-slate-500 mb-4">اختر حالتك المزاجية</p>

                <div className="flex justify-between items-center">
                    {moods.map((mood, index) => (
                        <motion.button
                            key={mood.value}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleMoodSelect(mood.value)}
                            className={`flex flex-col items-center p-2 rounded-2xl transition-all ${selectedMood === mood.value
                                    ? 'bg-white shadow-lg scale-110'
                                    : 'hover:bg-white/50'
                                }`}
                        >
                            <motion.span
                                className="text-3xl mb-1"
                                animate={{
                                    scale: selectedMood === mood.value ? [1, 1.2, 1] : 1
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                {mood.emoji}
                            </motion.span>
                            <span className="text-xs font-medium text-slate-600">
                                {mood.label}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Symptoms Section */}
            <div className="bg-white rounded-3xl p-5 shadow-lg shadow-black/5">
                <h3 className="text-lg font-bold text-slate-800 mb-1">الأعراض</h3>
                <p className="text-sm text-slate-500 mb-4">سجل أي أعراض تشعر بها</p>

                <div className="grid grid-cols-4 gap-3">
                    {symptoms.map((symptom, index) => (
                        <motion.button
                            key={symptom.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.03 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSymptomToggle(symptom.id)}
                            className={`flex flex-col items-center p-3 rounded-2xl transition-all ${selectedSymptoms.includes(symptom.id)
                                    ? 'bg-pink-100 ring-2 ring-pink-400'
                                    : 'bg-slate-50 hover:bg-slate-100'
                                }`}
                        >
                            <span className="text-2xl mb-1">{symptom.emoji}</span>
                            <span className="text-xs font-medium text-slate-600 text-center">
                                {symptom.label}
                            </span>
                        </motion.button>
                    ))}
                </div>

                {/* Selected count */}
                <AnimatePresence>
                    {selectedSymptoms.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-slate-100"
                        >
                            <p className="text-sm text-pink-600 font-medium text-center">
                                تم اختيار {selectedSymptoms.length} أعراض
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
