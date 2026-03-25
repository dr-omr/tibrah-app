import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
    Search, X, Heart, Brain, ArrowRight, Sparkles, Copy, Volume2,
    Check, MessageCircle, ChevronLeft, BookOpen, Activity, Zap,
    VolumeX, Mic, Play, Pause, SkipForward, Headphones, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { motion } from 'framer-motion';
import { emotionalDiseases, EmotionalDisease, preloadEmotionalData } from '@/data/emotionalMedicineData';
import { aiClient } from '@/components/ai/aiClient';
import { HeroSection } from '@/components/emotional-medicine/HeroSection';
import { CategoryPills } from '@/components/emotional-medicine/CategoryPills';
import { DiseaseList } from '@/components/emotional-medicine/DiseaseList';
import { DiseaseDetailSheet } from '@/components/emotional-medicine/DiseaseDetailSheet';

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
    const [aiInsight, setAiInsight] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [dataReady, setDataReady] = useState(false);

    // Preload emotional data from JSON
    useEffect(() => {
        preloadEmotionalData().then(() => setDataReady(true));
    }, []);

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
            results = emotionalDiseases.filter(d => d.organSystemEn === selectedSystem);
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 pb-24">
            {/* Animated Hero Section */}
            <HeroSection
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isListening={isListening}
                startVoiceSearch={startVoiceSearch}
                onBack={() => router.back()}
            />

            {/* Category Pills */}
            <CategoryPills
                selectedSystem={selectedSystem}
                setSelectedSystem={setSelectedSystem}
            />

            {/* Results Count */}
            <div className="px-6 mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
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
            <DiseaseList
                filteredDiseases={filteredDiseases}
                setSelectedDisease={setSelectedDisease}
            />

            {/* Related Resources */}
            <div className="px-6 mt-10">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
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
            <DiseaseDetailSheet
                selectedDisease={selectedDisease}
                setSelectedDisease={setSelectedDisease}
                isSpeaking={isSpeaking}
                currentSpeakingSection={currentSpeakingSection}
                stopSpeaking={stopSpeaking}
                speakAllContent={speakAllContent}
                speakText={speakText}
                copyAffirmation={copyAffirmation}
                copied={copied}
                aiLoading={aiLoading}
                aiInsight={aiInsight}
                runAiAnalysis={async (disease) => {
                    setAiLoading(true);
                    try {
                        const result = await aiClient.analyzeBodyMap(
                            disease.targetOrgan,
                            [disease.symptom, disease.emotionalConflict]
                        );
                        setAiInsight(result);
                    } catch { }
                    finally { setAiLoading(false); }
                }}
            />
        </div>
    );
}
