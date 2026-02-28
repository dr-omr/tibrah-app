import React, { useState, useMemo, useCallback } from 'react';
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
import { emotionalDiseases, organSystems, EmotionalDisease } from '@/data/emotionalMedicineData';
import { aiClient } from '@/components/ai/aiClient';

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
    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [copied, setCopied] = useState(false);

    // AI Analysis state
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

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

    // Speak text
    const speakText = useCallback((text: string) => {
        if (typeof window === 'undefined') return;

        if (isSpeaking) {
            speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.85;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        speechSynthesis.speak(utterance);
    }, [isSpeaking]);

    // Copy text
    const copyText = useCallback((text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, []);

    const getSystemIcon = (systemId: string) => {
        return organSystems.find(s => s.id === systemId)?.icon || '○';
    };

    const getSystemColor = (systemId: string) => {
        return organSystems.find(s => s.id === systemId)?.color || '#94A3B8';
    };

    // AI-Powered Symptom Analysis
    const runAiAnalysis = useCallback(async () => {
        if (!searchQuery.trim()) return;
        setAiLoading(true);
        setAiError(null);
        setAiAnalysis(null);
        try {
            const result = await aiClient.analyzeSymptoms(
                [searchQuery],
                selectedCategory !== 'all' ? selectedCategory : undefined
            );
            setAiAnalysis(result);
        } catch (err: any) {
            setAiError(err.message || 'تعذر إجراء التحليل');
        } finally {
            setAiLoading(false);
        }
    }, [searchQuery, selectedCategory]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-cyan-50/30 pb-24" dir="rtl">
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
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                        هذا التحليل للمساعدة والتوعية فقط ولا يغني عن استشارة الطبيب المختص
                    </p>
                </div>
            </div>

            {/* AI Analysis Section */}
            {searchQuery.trim() && (
                <div className="px-6 mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 rounded-2xl border border-purple-200 overflow-hidden"
                    >
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm">تحليل ذكي بالذكاء الاصطناعي</h3>
                                        <p className="text-xs text-slate-500">تحليل أعراضك من منظور الطب الوظيفي</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={runAiAnalysis}
                                    disabled={aiLoading}
                                    className="bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm px-4 h-9"
                                >
                                    {aiLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                                            جاري التحليل...
                                        </>
                                    ) : (
                                        <>
                                            <Brain className="w-4 h-4 ml-1" />
                                            حلل أعراضي
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* AI Error */}
                            {aiError && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-2">
                                    <p className="text-sm text-red-600">⚠️ {aiError}</p>
                                </div>
                            )}

                            {/* AI Results */}
                            <AnimatePresence>
                                {aiAnalysis && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-3 mt-3"
                                    >
                                        {/* Severity Badge */}
                                        {aiAnalysis.severity && (
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${aiAnalysis.severity === 'high' ? 'bg-red-100 text-red-700' :
                                                    aiAnalysis.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-green-100 text-green-700'
                                                }`}>
                                                {aiAnalysis.severity === 'high' ? '🔴 شدة عالية' :
                                                    aiAnalysis.severity === 'medium' ? '🟡 شدة متوسطة' :
                                                        '🟢 شدة منخفضة'}
                                            </div>
                                        )}

                                        {/* Summary */}
                                        {aiAnalysis.summary && (
                                            <div className="bg-white/80 rounded-xl p-3 border border-purple-100">
                                                <p className="text-sm text-slate-700 leading-relaxed">{aiAnalysis.summary}</p>
                                            </div>
                                        )}

                                        {/* Root Causes */}
                                        {aiAnalysis.root_causes?.length > 0 && (
                                            <div className="bg-white/80 rounded-xl p-3 border border-purple-100">
                                                <h4 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-1">
                                                    <Brain className="w-4 h-4 text-purple-500" /> الأسباب الجذرية
                                                </h4>
                                                <ul className="space-y-1">
                                                    {aiAnalysis.root_causes.map((cause: string, i: number) => (
                                                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                                            <span className="text-purple-400 mt-1">•</span> {cause}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Recommendations */}
                                        {aiAnalysis.recommendations?.length > 0 && (
                                            <div className="bg-white/80 rounded-xl p-3 border border-teal-100">
                                                <h4 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-1">
                                                    <Activity className="w-4 h-4 text-teal-500" /> التوصيات
                                                </h4>
                                                <ul className="space-y-1">
                                                    {aiAnalysis.recommendations.map((rec: string, i: number) => (
                                                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                                            <span className="text-teal-400 mt-1">✓</span> {rec}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Natural Remedies */}
                                        {aiAnalysis.natural_remedies?.length > 0 && (
                                            <div className="bg-white/80 rounded-xl p-3 border border-green-100">
                                                <h4 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-1">
                                                    🌿 العلاجات الطبيعية
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {aiAnalysis.natural_remedies.map((remedy: string, i: number) => (
                                                        <span key={i} className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs border border-green-200">
                                                            {remedy}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Suggested Tests */}
                                        {aiAnalysis.tests_suggested?.length > 0 && (
                                            <div className="bg-white/80 rounded-xl p-3 border border-blue-100">
                                                <h4 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-1">
                                                    🔬 فحوصات مقترحة
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {aiAnalysis.tests_suggested.map((test: string, i: number) => (
                                                        <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs border border-blue-200">
                                                            {test}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Urgency Note */}
                                        {aiAnalysis.urgency_note && (
                                            <div className="bg-amber-50/80 rounded-xl p-3 border border-amber-200">
                                                <p className="text-xs text-amber-700 flex items-start gap-1">
                                                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                                    {aiAnalysis.urgency_note}
                                                </p>
                                            </div>
                                        )}

                                        {/* Disclaimer */}
                                        <p className="text-xs text-slate-400 text-center mt-2">
                                            {aiAnalysis.disclaimer || 'هذا رأي استرشادي ولا يغني عن زيارة الطبيب'}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Results */}
            <div className="px-6 space-y-3">
                <AnimatePresence mode="popLayout">
                    {filteredDiseases.slice(0, 30).map((disease, idx) => (
                        <motion.div
                            key={disease.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.03 }}
                            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
                        >
                            {/* Card Header */}
                            <div
                                className="p-4 cursor-pointer"
                                onClick={() => setExpandedCard(expandedCard === disease.id ? null : disease.id)}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                                        style={{
                                            background: `linear-gradient(135deg, ${getSystemColor(disease.organSystemEn)}20, ${getSystemColor(disease.organSystemEn)}10)`
                                        }}
                                    >
                                        {getSystemIcon(disease.organSystemEn)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 dark:text-white mb-1">{disease.symptom}</h3>
                                        <p className="text-xs text-slate-500 mb-2">
                                            {disease.targetOrgan} • {disease.organSystem}
                                        </p>
                                        <p className="text-sm text-slate-600 line-clamp-2">
                                            {disease.emotionalConflict}
                                        </p>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: expandedCard === disease.id ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronDown className="w-5 h-5 text-slate-400" />
                                    </motion.div>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            <AnimatePresence>
                                {expandedCard === disease.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 pt-0 space-y-4 border-t border-slate-100">
                                            {/* Emotional Conflict */}
                                            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Heart className="w-4 h-4 text-red-500" />
                                                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">السبب الشعوري</h4>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-2 text-red-600"
                                                        onClick={() => speakText(disease.emotionalConflict)}
                                                    >
                                                        {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                                    </Button>
                                                </div>
                                                <p className="text-slate-700 text-sm leading-relaxed">{disease.emotionalConflict}</p>
                                            </div>

                                            {/* Biological Purpose */}
                                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Brain className="w-4 h-4 text-blue-500" />
                                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">الغرض البيولوجي</h4>
                                                </div>
                                                <p className="text-slate-700 text-sm leading-relaxed">{disease.biologicalPurpose}</p>
                                            </div>

                                            {/* Healing Affirmation */}
                                            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Zap className="w-4 h-4 text-amber-600" />
                                                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">التأكيد الشفائي</h4>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 px-2 text-amber-600"
                                                            onClick={() => copyText(disease.healingAffirmation)}
                                                        >
                                                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 px-2 text-amber-600"
                                                            onClick={() => speakText(disease.healingAffirmation)}
                                                        >
                                                            <Volume2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <p className="text-amber-800 text-sm font-medium italic text-center py-2">
                                                    "{disease.healingAffirmation}"
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <Link href={`/emotional-medicine?search=${encodeURIComponent(disease.symptom)}`} className="flex-1">
                                                    <Button variant="outline" className="w-full rounded-xl text-teal-600 border-teal-200 hover:bg-teal-50">
                                                        <BookOpen className="w-4 h-4 ml-2" />
                                                        تفاصيل أكثر
                                                    </Button>
                                                </Link>
                                                <a
                                                    href={`https://wa.me/967771447111?text=مرحباً%20د.%20عمر،%20أعاني%20من%20${encodeURIComponent(disease.symptom)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1"
                                                >
                                                    <Button className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                                        <MessageCircle className="w-4 h-4 ml-2" />
                                                        استشارة
                                                    </Button>
                                                </a>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredDiseases.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">لا توجد نتائج</h3>
                        <p className="text-slate-500 mb-4">جرب وصف الأعراض بشكل مختلف</p>
                        <Button
                            variant="outline"
                            onClick={() => setSearchQuery('')}
                            className="rounded-xl"
                        >
                            مسح البحث
                        </Button>
                    </motion.div>
                )}
            </div>

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

            {/* CTA Section */}
            <div className="mx-6 mt-10">
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
