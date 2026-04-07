import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
    Search, X, Heart, Brain, ArrowRight, Sparkles, Copy, Volume2,
    Check, MessageCircle, ChevronLeft, BookOpen, Activity, Zap,
    VolumeX, Mic, Stethoscope, AlertCircle, ChevronDown, ChevronUp, Info, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from 'framer-motion';
import { emotionalDiseases, organSystems, EmotionalDisease, preloadEmotionalData } from '@/data/emotionalMedicineData';
import MedicalDisclaimer from '@/components/common/MedicalDisclaimer';
import { AiSymptomAnalysis } from '@/components/symptom-analysis/AiSymptomAnalysis';
import { SymptomResultsList } from '@/components/symptom-analysis/SymptomResultsList';

// Popular searches
const popularSearches = [
    'صداع', 'آلام الظهر', 'مشاكل الهضم', 'الأرق', 'التعب', 'القلق',
    'ضيق التنفس', 'الحساسية', 'آلام المفاصل', 'مشاكل الجلد'
];

// Categories based on symptoms
const symptomCategories = [
    { id: 'all', name: 'الكل', icon: '✨', color: '#F43F5E' },
    { id: 'head', name: 'الرأس والأعصاب', icon: '🧠', color: '#8B5CF6' },
    { id: 'chest', name: 'الصدر والقلب', icon: '❤️', color: '#EF4444' },
    { id: 'stomach', name: 'الجهاز الهضمي', icon: '🫃', color: '#F59E0B' },
    { id: 'skin', name: 'الجلد', icon: '🧴', color: '#10B981' },
    { id: 'bones', name: 'العظام والمفاصل', icon: '🦴', color: '#6366F1' },
];

export default function SymptomAnalysis() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isListening, setIsListening] = useState(false);

    // Preload emotional data from JSON
    useEffect(() => {
        preloadEmotionalData();
    }, []);

    // Filter diseases based on search and category
    const filteredDiseases = useMemo(() => {
        let results = emotionalDiseases;

        if (selectedCategory !== 'all') {
            const categoryMap: Record<string, string[]> = {
                'head': ['nervous', 'sensory'],
                'chest': ['cardiovascular', 'respiratory'],
                'stomach': ['digestive'],
                'skin': ['skin'],
                'bones': ['musculoskeletal'],
            };
            const systems = categoryMap[selectedCategory] || [];
            results = results.filter(d => systems.includes(d.organSystemEn));
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            results = results.filter(d =>
                d.symptom.includes(searchQuery) ||
                d.targetOrgan.includes(searchQuery) ||
                d.emotionalConflict.includes(searchQuery)
            );
        }

        return results;
    }, [searchQuery, selectedCategory]);

    // Voice Search
    const startVoiceSearch = useCallback(() => {
        if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            alert('متصفحك لا يدعم البحث الصوتي');
            return;
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'ar-SA';
        recognition.continuous = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript);
        };

        recognition.start();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-cyan-50/30 pb-24">
            {/* Animated Hero Section */}
            <div className="bg-gradient-to-br from-teal-600 via-cyan-500 to-blue-500 px-6 pt-12 pb-28 relative overflow-hidden rounded-b-[3rem]">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute -top-20 -right-20 w-60 h-60 bg-white rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute bottom-10 left-10 w-40 h-40 bg-yellow-300/20 rounded-full blur-2xl"
                    />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="text-white hover:bg-white/20 rounded-full backdrop-blur-sm"
                        >
                            <ArrowRight className="w-6 h-6" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                                تحليل الأعراض
                                <Stethoscope className="w-8 h-8" />
                            </h1>
                            <p className="text-teal-100 text-sm">اكتشف الأسباب الشعورية لأعراضك</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 flex-wrap">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/15 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center gap-3"
                        >
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg">{emotionalDiseases.length}+</p>
                                <p className="text-teal-100 text-xs">عرض مُحلل</p>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/15 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center gap-3"
                        >
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg">{organSystems.length}</p>
                                <p className="text-teal-100 text-xs">نظام جسمي</p>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Floating Search Bar */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute -bottom-7 left-6 right-6"
                >
                    <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-teal-100">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Search className="w-5 h-5 text-white" />
                        </div>
                        <Input
                            placeholder="صف الأعراض التي تشعر بها..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-none shadow-none text-base flex-1 focus-visible:ring-0"
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setSearchQuery('')}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                        {/* Voice Search Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-10 w-10 rounded-xl transition-all ${isListening ? 'bg-teal-500 text-white animate-pulse' : 'text-slate-400 hover:text-teal-500'}`}
                            onClick={startVoiceSearch}
                        >
                            <Mic className="w-5 h-5" />
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Popular Searches */}
            <div className="px-6 mt-12 mb-4">
                <p className="text-sm text-slate-500 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-500" />
                    بحث شائع
                </p>
                <div className="flex flex-wrap gap-2">
                    {popularSearches.map((term, idx) => (
                        <motion.button
                            key={term}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            onClick={() => setSearchQuery(term)}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-teal-300 hover:text-teal-600 transition-colors"
                        >
                            {term}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Category Pills */}
            <div className="px-6 mb-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6"
                >
                    {symptomCategories.map((category, idx) => (
                        <motion.button
                            key={category.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-4 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${selectedCategory === category.id
                                ? 'text-white shadow-lg'
                                : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-teal-200'
                                }`}
                            style={{
                                background: selectedCategory === category.id
                                    ? `linear-gradient(135deg, ${category.color}, ${category.color}dd)`
                                    : undefined,
                                boxShadow: selectedCategory === category.id
                                    ? `0 8px 24px ${category.color}40`
                                    : undefined
                            }}
                        >
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                        </motion.button>
                    ))}
                </motion.div>
            </div>

            {/* Results Count */}
            <div className="px-6 mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-teal-500" />
                    النتائج ({filteredDiseases.length})
                </h2>
            </div>

            {/* Disclaimer */}
            <div className="px-6 mb-4">
                <MedicalDisclaimer variant="banner" />
            </div>

            {/* AI Analysis Section */}
            <AiSymptomAnalysis searchQuery={searchQuery} selectedCategory={selectedCategory} />

            {/* Results */}
            <SymptomResultsList filteredDiseases={filteredDiseases} setSearchQuery={setSearchQuery} />

            {/* Related Resources */}
            <div className="px-6 mt-10">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-teal-500" />
                    استكشف المزيد
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <Link href="/emotional-medicine">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl p-4 text-white cursor-pointer"
                        >
                            <span className="text-3xl">💗</span>
                            <p className="text-sm font-bold mt-2">الطب الشعوري</p>
                        </motion.div>
                    </Link>
                    <Link href="/body-map">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-gradient-to-br from-teal-500 to-green-500 rounded-2xl p-4 text-white cursor-pointer"
                        >
                            <span className="text-3xl">🧘</span>
                            <p className="text-sm font-bold mt-2">خريطة الجسد</p>
                        </motion.div>
                    </Link>
                    <Link href="/breathe">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-4 text-white cursor-pointer"
                        >
                            <span className="text-3xl">🌬️</span>
                            <p className="text-sm font-bold mt-2">تمارين التنفس</p>
                        </motion.div>
                    </Link>
                    <Link href="/frequencies">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 text-white cursor-pointer"
                        >
                            <span className="text-3xl">🎵</span>
                            <p className="text-sm font-bold mt-2">الترددات الشفائية</p>
                        </motion.div>
                    </Link>
                </div>
            </div>

            {/* Intake Flow CTA */}
            <div className="mx-6 mt-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 rounded-3xl p-8 text-white text-center shadow-xl shadow-purple-900/20"
                >
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center">
                        <Activity className="w-8 h-8 text-purple-300" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">التقييم السريري الشامل</h3>
                    <p className="text-sm text-purple-200 mb-6 max-w-sm mx-auto leading-relaxed">
                        احصل على تقييم دقيق لحالتك وتوجيه طبي متخصص من خلال محرك الرعاية الرقمي. سجل أعراضك بالتفصيل الآن.
                    </p>
                    <Link href="/intake" className="block">
                        <Button className="w-full bg-white text-indigo-900 hover:bg-slate-100 rounded-2xl h-14 font-bold text-lg shadow-lg">
                            <Sparkles className="w-5 h-5 ml-2 text-indigo-600" />
                            ابدأ التقييم الآن
                        </Button>
                    </Link>
                </motion.div>
            </div>

            {/* CTA Section */}
            <div className="mx-6 mt-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0aDEydjEySDM2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="relative"
                    >
                        <Stethoscope className="w-16 h-16 text-teal-400 mx-auto mb-6" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-3 relative">لا تواجه الألم وحدك</h3>
                    <p className="text-slate-300 text-sm mb-8 max-w-sm mx-auto relative leading-relaxed">
                        د. عمر العماد متخصص في فهم الرسائل الخفية وراء الأعراض الجسدية
                    </p>
                    <a
                        href="https://wa.me/967771447111?text=مرحباً%20د.%20عمر،%20أريد%20استشارة%20بخصوص%20أعراض%20أعاني%20منها"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative block"
                    >
                        <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-2xl h-14 font-bold text-lg shadow-lg shadow-teal-500/30">
                            <MessageCircle className="w-6 h-6 ml-2" />
                            تواصل الآن
                        </Button>
                    </a>
                </motion.div>
            </div>
        </div>
    );
}
