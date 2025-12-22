import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
    Search, X, Heart, Brain, ArrowRight, Sparkles, Copy, Volume2,
    Check, MessageCircle, ChevronLeft, BookOpen, Activity, Zap,
    VolumeX, Mic, Play, Pause, SkipForward, Headphones
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { motion, AnimatePresence } from 'framer-motion';
import { emotionalDiseases, organSystems, getDiseasesBySystem, EmotionalDisease } from '@/data/emotionalMedicineData';

// Related resources
const relatedResources = [
    { title: 'تمارين التنفس الشفائي', icon: '🌬️', link: '/breathe', color: 'from-blue-500 to-cyan-500' },
    { title: 'الترددات الشفائية', icon: '🎵', link: '/frequencies', color: 'from-purple-500 to-pink-500' },
    { title: 'خريطة الجسد', icon: '🧘', link: '/body-map', color: 'from-teal-500 to-green-500' },
    { title: 'تحليل الأعراض', icon: '🔍', link: '/symptom-analysis', color: 'from-orange-500 to-red-500' },
];

export default function EmotionalMedicine() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
    const [selectedDisease, setSelectedDisease] = useState<EmotionalDisease | null>(null);
    const [copied, setCopied] = useState(false);

    // Audio System States
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentSpeakingSection, setCurrentSpeakingSection] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);

    // Stop speech when component unmounts or disease changes
    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && speechSynthesis) {
                speechSynthesis.cancel();
            }
        };
    }, [selectedDisease]);

    const filteredDiseases = useMemo(() => {
        let results = emotionalDiseases;
        if (selectedSystem) {
            results = getDiseasesBySystem(selectedSystem);
        }
        if (searchQuery.trim()) {
            results = results.filter(d =>
                d.symptom.includes(searchQuery) ||
                d.targetOrgan.includes(searchQuery) ||
                d.emotionalConflict.includes(searchQuery)
            );
        }
        return results;
    }, [searchQuery, selectedSystem]);

    const copyAffirmation = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Enhanced Audio System
    const speakText = useCallback((text: string, section: string) => {
        if (typeof window === 'undefined') return;

        // Stop any current speech
        speechSynthesis.cancel();

        if (isSpeaking && currentSpeakingSection === section) {
            setIsSpeaking(false);
            setCurrentSpeakingSection(null);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.85;
        utterance.pitch = 1;

        utterance.onstart = () => {
            setIsSpeaking(true);
            setCurrentSpeakingSection(section);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setCurrentSpeakingSection(null);
        };

        utterance.onerror = () => {
            setIsSpeaking(false);
            setCurrentSpeakingSection(null);
        };

        speechSynthesis.speak(utterance);
    }, [isSpeaking, currentSpeakingSection]);

    const speakAllContent = useCallback((disease: EmotionalDisease) => {
        if (typeof window === 'undefined') return;

        speechSynthesis.cancel();

        const fullText = `
            ${disease.symptom}.
            العضو المستهدف: ${disease.targetOrgan}.
            السبب الشعوري: ${disease.emotionalConflict}.
            الغرض البيولوجي: ${disease.biologicalPurpose}.
            خطوات العلاج: ${disease.treatmentSteps.join('. ')}.
            التأكيد الشفائي: ${disease.healingAffirmation}.
        `;

        const utterance = new SpeechSynthesisUtterance(fullText);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.85;

        utterance.onstart = () => {
            setIsSpeaking(true);
            setCurrentSpeakingSection('all');
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setCurrentSpeakingSection(null);
        };

        speechSynthesis.speak(utterance);
    }, []);

    const stopSpeaking = useCallback(() => {
        if (typeof window !== 'undefined' && speechSynthesis) {
            speechSynthesis.cancel();
            setIsSpeaking(false);
            setCurrentSpeakingSection(null);
        }
    }, []);

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

    const getSystemColor = (systemId: string) => {
        return organSystems.find(s => s.id === systemId)?.color || '#94A3B8';
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50/30 pb-24" dir="rtl">
            {/* Animated Hero Section */}
            <div className="bg-gradient-to-br from-pink-600 via-rose-500 to-amber-500 px-6 pt-12 pb-28 relative overflow-hidden rounded-b-[3rem]">
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
                                الطب الشعوري
                                <Heart className="w-8 h-8" />
                            </h1>
                            <p className="text-rose-100 text-sm">اكتشف الجذور الشعورية للأمراض</p>
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
                                <p className="text-rose-100 text-xs">مرض موثق</p>
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
                                <p className="text-rose-100 text-xs">نظام جسمي</p>
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
                    <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-rose-100">
                        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Search className="w-5 h-5 text-white" />
                        </div>
                        <Input
                            placeholder="ابحث عن مرض، عضو، أو شعور..."
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
                            className={`h-10 w-10 rounded-xl transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-rose-500'}`}
                            onClick={startVoiceSearch}
                        >
                            <Mic className="w-5 h-5" />
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Category Pills */}
            <div className="px-6 mt-12 mb-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6"
                >
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedSystem(null)}
                        className={`px-4 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${!selectedSystem
                            ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/30'
                            : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-rose-200'
                            }`}
                    >
                        <span>✨</span>
                        <span>الكل</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                            {emotionalDiseases.length}
                        </span>
                    </motion.button>
                    {organSystems.map((system, idx) => {
                        const count = emotionalDiseases.filter(d => d.organSystemEn === system.id).length;
                        return (
                            <motion.button
                                key={system.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedSystem(selectedSystem === system.id ? null : system.id)}
                                className={`px-4 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${selectedSystem === system.id
                                    ? 'text-white shadow-lg'
                                    : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-rose-200'
                                    }`}
                                style={{
                                    background: selectedSystem === system.id
                                        ? `linear-gradient(135deg, ${system.color}, ${system.color}dd)`
                                        : undefined,
                                    boxShadow: selectedSystem === system.id
                                        ? `0 8px 24px ${system.color}40`
                                        : undefined
                                }}
                            >
                                <span>{system.icon}</span>
                                <span>{system.name}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${selectedSystem === system.id ? 'bg-white/20' : 'bg-slate-100'
                                    }`}>
                                    {count}
                                </span>
                            </motion.button>
                        );
                    })}
                </motion.div>
            </div>

            {/* Results Count */}
            <div className="px-6 mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">
                    النتائج ({filteredDiseases.length})
                </h2>
                {selectedSystem && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSystem(null)}
                        className="text-rose-500"
                    >
                        إظهار الكل
                    </Button>
                )}
            </div>

            {/* Disease Cards */}
            <div className="px-6 space-y-3">
                <AnimatePresence mode="popLayout">
                    {filteredDiseases.slice(0, 50).map((disease, idx) => (
                        <motion.div
                            key={disease.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.03 }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setSelectedDisease(disease)}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all"
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                                    style={{
                                        background: `linear-gradient(135deg, ${getSystemColor(disease.organSystemEn)}20, ${getSystemColor(disease.organSystemEn)}10)`
                                    }}
                                >
                                    {organSystems.find(s => s.id === disease.organSystemEn)?.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-800 mb-1">{disease.symptom}</h3>
                                    <p className="text-xs text-slate-500 mb-2">
                                        {disease.targetOrgan} • {disease.organSystem}
                                    </p>
                                    <p className="text-sm text-slate-600 line-clamp-2">
                                        {disease.emotionalConflict}
                                    </p>
                                </div>
                                <ChevronLeft className="w-5 h-5 text-slate-400 flex-shrink-0" />
                            </div>
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
                        <h3 className="text-xl font-bold text-slate-800 mb-2">لا توجد نتائج</h3>
                        <p className="text-slate-500">جرب كلمات بحث مختلفة</p>
                    </motion.div>
                )}
            </div>

            {/* Related Resources */}
            <div className="px-6 mt-10">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-rose-500" />
                    موارد مرتبطة
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {relatedResources.map((resource, idx) => (
                        <Link href={resource.link} key={idx}>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`bg-gradient-to-br ${resource.color} rounded-2xl p-4 text-white cursor-pointer`}
                            >
                                <span className="text-3xl">{resource.icon}</span>
                                <p className="text-sm font-bold mt-2">{resource.title}</p>
                            </motion.div>
                        </Link>
                    ))}
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
                        <Heart className="w-16 h-16 text-rose-400 mx-auto mb-6" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-3 relative">تحتاج استشارة خاصة؟</h3>
                    <p className="text-slate-300 text-sm mb-8 max-w-sm mx-auto relative leading-relaxed">
                        د. عمر العماد متخصص في الطب الشعوري والعلاج بالوعي. احجز جلستك الآن.
                    </p>
                    <a
                        href="https://wa.me/967771447111?text=مرحباً%20د.%20عمر،%20أريد%20استشارة%20في%20الطب%20الشعوري"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative block"
                    >
                        <Button className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-2xl h-14 font-bold text-lg shadow-lg shadow-rose-500/30">
                            <MessageCircle className="w-6 h-6 ml-2" />
                            تواصل عبر واتساب
                        </Button>
                    </a>
                </motion.div>
            </div>

            {/* Disease Detail Sheet */}
            <Sheet open={!!selectedDisease} onOpenChange={() => setSelectedDisease(null)}>
                <SheetContent side="bottom" className="h-[92vh] rounded-t-[2rem] p-0 overflow-hidden">
                    {selectedDisease && (
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="h-full overflow-y-auto"
                        >
                            {/* Header */}
                            <div
                                className="p-6 text-white relative overflow-hidden"
                                style={{
                                    background: `linear-gradient(135deg, ${getSystemColor(selectedDisease.organSystemEn)}, ${getSystemColor(selectedDisease.organSystemEn)}cc)`
                                }}
                            >
                                <div className="absolute inset-0 bg-black/10" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl">
                                            {organSystems.find(s => s.id === selectedDisease.organSystemEn)?.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-xl font-bold">{selectedDisease.symptom}</h2>
                                            <p className="text-white/80 text-sm">
                                                {selectedDisease.targetOrgan} • {selectedDisease.organSystem}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Audio Player Controls */}
                                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => isSpeaking ? stopSpeaking() : speakAllContent(selectedDisease)}
                                            className="text-white hover:bg-white/20 gap-2"
                                        >
                                            {isSpeaking && currentSpeakingSection === 'all' ? (
                                                <>
                                                    <Pause className="w-4 h-4" />
                                                    إيقاف
                                                </>
                                            ) : (
                                                <>
                                                    <Headphones className="w-4 h-4" />
                                                    استماع للكل
                                                </>
                                            )}
                                        </Button>
                                        <div className="h-4 w-px bg-white/20" />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => speakText(selectedDisease.emotionalConflict, 'conflict')}
                                            className={`text-white/80 hover:bg-white/20 text-xs ${currentSpeakingSection === 'conflict' ? 'bg-white/20' : ''}`}
                                        >
                                            <Volume2 className="w-3 h-3 ml-1" />
                                            السبب
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => speakText(selectedDisease.biologicalPurpose, 'bio')}
                                            className={`text-white/80 hover:bg-white/20 text-xs ${currentSpeakingSection === 'bio' ? 'bg-white/20' : ''}`}
                                        >
                                            <Volume2 className="w-3 h-3 ml-1" />
                                            البيولوجي
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Emotional Conflict */}
                                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-5 border border-red-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Heart className="w-5 h-5 text-red-500" />
                                        <h4 className="font-bold text-slate-800">السبب الشعوري</h4>
                                    </div>
                                    <p className="text-slate-700 leading-relaxed">{selectedDisease.emotionalConflict}</p>
                                </div>

                                {/* Biological Purpose */}
                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Brain className="w-5 h-5 text-blue-500" />
                                        <h4 className="font-bold text-slate-800">الغرض البيولوجي</h4>
                                    </div>
                                    <p className="text-slate-700 leading-relaxed">{selectedDisease.biologicalPurpose}</p>
                                </div>

                                {/* Treatment Steps */}
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="w-5 h-5 text-green-500" />
                                        <h4 className="font-bold text-slate-800">خطوات العلاج</h4>
                                    </div>
                                    <div className="space-y-2">
                                        {selectedDisease.treatmentSteps.map((step, idx) => (
                                            <div key={idx} className="flex items-start gap-3 bg-white/60 rounded-xl p-3">
                                                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-slate-700 text-sm">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Healing Affirmation */}
                                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-5 border border-amber-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-amber-600" />
                                            <h4 className="font-bold text-slate-800">التأكيد الشفائي</h4>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => copyAffirmation(selectedDisease.healingAffirmation)}
                                                className="text-amber-700 border-amber-300 hover:bg-amber-100"
                                            >
                                                {copied ? <Check className="w-4 h-4 ml-1" /> : <Copy className="w-4 h-4 ml-1" />}
                                                {copied ? 'تم!' : 'نسخ'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => speakText(selectedDisease.healingAffirmation, 'affirmation')}
                                                className={`transition-all ${currentSpeakingSection === 'affirmation' ? 'bg-amber-500 text-white border-amber-500' : 'text-amber-700 border-amber-300 hover:bg-amber-100'}`}
                                            >
                                                {currentSpeakingSection === 'affirmation' ? <VolumeX className="w-4 h-4 ml-1" /> : <Volume2 className="w-4 h-4 ml-1" />}
                                                {currentSpeakingSection === 'affirmation' ? 'إيقاف' : 'استماع'}
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-amber-800 text-lg font-medium leading-relaxed italic text-center py-4">
                                        "{selectedDisease.healingAffirmation}"
                                    </p>
                                    <p className="text-amber-600 text-xs text-center">
                                        ردد هذا التأكيد 3 مرات يومياً أمام المرآة
                                    </p>
                                </div>

                                {/* Source */}
                                <div className="text-center py-2">
                                    <p className="text-xs text-slate-400">المصدر: {selectedDisease.sourceRef}</p>
                                </div>

                                {/* CTA */}
                                <a
                                    href={`https://wa.me/967771447111?text=مرحباً%20د.%20عمر،%20أريد%20استشارة%20بخصوص%20${encodeURIComponent(selectedDisease.symptom)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl h-14 font-bold shadow-lg shadow-green-500/30">
                                        <MessageCircle className="w-5 h-5 ml-2" />
                                        استشارة د. عمر عن هذه الحالة
                                    </Button>
                                </a>
                            </div>
                        </motion.div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
