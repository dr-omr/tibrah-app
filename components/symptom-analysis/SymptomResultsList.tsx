import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Heart, VolumeX, Volume2, Brain, Zap, Check, Copy, BookOpen, MessageCircle, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { organSystems, EmotionalDisease } from '@/data/emotionalMedicineData';

interface SymptomResultsListProps {
    filteredDiseases: EmotionalDisease[];
    setSearchQuery: (query: string) => void;
}

export const SymptomResultsList: React.FC<SymptomResultsListProps> = ({ filteredDiseases, setSearchQuery }) => {
    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [copied, setCopied] = useState(false);

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

    return (
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

                                        {/* Quick Relief Cross-sell */}
                                        <div className="bg-gradient-to-br from-indigo-50 to-emerald-50 rounded-xl p-4 border border-indigo-100/50 flex gap-4 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-400/10 rounded-full blur-2xl" />
                                            <div className="w-12 h-12 rounded-xl bg-white border border-indigo-100 flex items-center justify-center flex-shrink-0 z-10 shadow-sm shadow-indigo-100">
                                                <Zap className="w-5 h-5 text-indigo-500" />
                                            </div>
                                            <div className="flex-1 z-10">
                                                <h4 className="font-bold text-indigo-900 text-sm mb-0.5">تسريع التعافي ({disease.organSystem})</h4>
                                                <p className="text-xs text-indigo-700/70 mb-3 leading-relaxed">اكتشف المكملات العشبية والداعمة التي تخفف من حدة أعراض ({disease.symptom}) بشكل طبيعي.</p>
                                                <Link href={`/shop?category=${encodeURIComponent(disease.organSystem)}`}>
                                                    <Button size="sm" className="w-full h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-600/20">
                                                        عرض المنتجات الداعمة
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Link href={`/emotional-medicine?search=${encodeURIComponent(disease.symptom)}`} className="flex-1">
                                                <Button variant="outline" className="w-full rounded-xl text-teal-600 border-teal-200 hover:bg-teal-50">
                                                    <BookOpen className="w-4 h-4 ml-2" />
                                                    تفاصيل أكثر
                                                </Button>
                                            </Link>
                                            <Link href={`/book-appointment?symptom=${encodeURIComponent(disease.symptom)}`} className="flex-1">
                                                <Button className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:opacity-90 transition-opacity">
                                                    <MessageCircle className="w-4 h-4 ml-2" />
                                                    حجز جلسة علاجية
                                                </Button>
                                            </Link>
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
                        className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700"
                    >
                        مسح البحث
                    </Button>
                </motion.div>
            )}
        </div>
    );
};
