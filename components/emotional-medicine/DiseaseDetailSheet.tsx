import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Brain, Sparkles, Zap, Copy, Check, Volume2, VolumeX, Pause, Headphones, Loader2, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { organSystems, EmotionalDisease } from '@/data/emotionalMedicineData';

interface DiseaseDetailSheetProps {
    selectedDisease: EmotionalDisease | null;
    setSelectedDisease: (disease: EmotionalDisease | null) => void;
    isSpeaking: boolean;
    currentSpeakingSection: string | null;
    stopSpeaking: () => void;
    speakAllContent: (disease: EmotionalDisease) => void;
    speakText: (text: string, section: string) => void;
    copyAffirmation: (text: string) => void;
    copied: boolean;
    aiLoading: boolean;
    aiInsight: any;
    runAiAnalysis: (disease: EmotionalDisease) => void;
}

export const DiseaseDetailSheet: React.FC<DiseaseDetailSheetProps> = ({
    selectedDisease,
    setSelectedDisease,
    isSpeaking,
    currentSpeakingSection,
    stopSpeaking,
    speakAllContent,
    speakText,
    copyAffirmation,
    copied,
    aiLoading,
    aiInsight,
    runAiAnalysis
}) => {
    const getSystemColor = (systemId: string) => {
        return organSystems.find(s => s.id === systemId)?.color || '#94A3B8';
    };

    return (
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

                            {/* AI Deep Analysis */}
                            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-4 border border-purple-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Brain className="w-5 h-5 text-purple-600" />
                                        <h4 className="font-bold text-slate-800 text-sm">تحليل ذكي</h4>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="bg-purple-600 text-white rounded-xl h-8 text-xs"
                                        disabled={aiLoading}
                                        onClick={() => runAiAnalysis(selectedDisease)}
                                    >
                                        {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 ml-1" />}
                                        {aiLoading ? 'جاري...' : 'تحليل معمق'}
                                    </Button>
                                </div>
                                {aiInsight && (
                                    <div className="space-y-2 mt-2">
                                        {aiInsight.emotional_connection && (
                                            <p className="text-sm text-slate-700 leading-relaxed">{aiInsight.emotional_connection}</p>
                                        )}
                                        {aiInsight.healing_exercises?.length > 0 && (
                                            <div>
                                                <p className="text-xs font-bold text-purple-700 mb-1">🧘 تمارين:</p>
                                                {aiInsight.healing_exercises.map((ex: string, i: number) => (
                                                    <p key={i} className="text-xs text-slate-600 mr-2">• {ex}</p>
                                                ))}
                                            </div>
                                        )}
                                        {aiInsight.affirmations?.length > 0 && (
                                            <div className="bg-white/60 rounded-xl p-3">
                                                <p className="text-xs font-bold text-purple-700 mb-1">✨ تأكيدات:</p>
                                                {aiInsight.affirmations.map((a: string, i: number) => (
                                                    <p key={i} className="text-xs text-purple-600 italic">"{a}"</p>
                                                ))}
                                            </div>
                                        )}
                                        {aiInsight.lifestyle_tips?.length > 0 && (
                                            <div>
                                                <p className="text-xs font-bold text-purple-700 mb-1">💡 نصائح:</p>
                                                {aiInsight.lifestyle_tips.map((t: string, i: number) => (
                                                    <p key={i} className="text-xs text-slate-600 mr-2">• {t}</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
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
    );
};
