import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Battery, Moon, Brain, ChevronLeft, ArrowRight,
    Activity, HeartPulse, Sparkles, AlertCircle, CheckCircle2,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

export default function QuickCheckIn() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    // Form Data
    const [formData, setFormData] = useState({
        energy: 3,
        sleep: 3,
        stress: 3,
        physicalSymptoms: '',
        emotionalContext: '',
    });

    const emojis = {
        energy: ['🪫', '🔋', '⚡', '💪', '🚀'],
        sleep: ['😵', '🥱', '😴', '😌', '🌟'],
        stress: ['🤯', '😰', '😟', '😐', '🧘']
    };

    const RatingSelector = ({ label, field, icon: Icon }: { label: string, field: 'energy' | 'sleep' | 'stress', icon: any }) => (
        <div className="mb-6 bg-white dark:bg-slate-800/80 p-5 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200">{label}</span>
            </div>
            <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                    <button
                        key={val}
                        onClick={() => setFormData({ ...formData, [field]: val })}
                        className={`flex-1 py-3 rounded-2xl text-2xl transition-all duration-300 ${
                            formData[field] === val
                                ? 'bg-teal-500 shadow-lg scale-110 shadow-teal-500/30 border-2 border-teal-400'
                                : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-teal-50 dark:hover:bg-teal-900/20 border-2 border-transparent'
                        }`}
                    >
                        {emojis[field][val - 1]}
                    </button>
                ))}
            </div>
        </div>
    );

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        // Simulate AI thinking time to build anticipation
        setTimeout(() => {
            setIsAnalyzing(false);
            setStep(4);
        }, 2500);
    };

    const handleHandoff = () => {
        const triageLevel = formData.stress <= 2 || formData.energy <= 2 ? 'urgent' : 'normal';
        router.push({
            pathname: '/book-appointment',
            query: {
                complaint: formData.physicalSymptoms,
                emotion: formData.emotionalContext,
                triage: triageLevel
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-20 px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="rounded-full">
                        <ArrowRight className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    </Button>
                    <div className="flex gap-1.5">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-6 bg-teal-500' : 'w-2 bg-slate-200 dark:bg-slate-700'}`} />
                        ))}
                    </div>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </div>

            <div className="px-6 py-6">
                <AnimatePresence mode="wait">
                    {/* Step 1: Baseline */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-2"
                        >
                            <div className="mb-8">
                                <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                                    <Activity className="w-6 h-6 text-teal-500" />
                                    مؤشراتك الحيوية
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                    هذا التقييم السريع يساعدنا في فهم حالتك الأساسية لتوجيه الرعاية بشكل أصح.
                                </p>
                            </div>

                            <RatingSelector label="مستوى الطاقة اليوم" field="energy" icon={Battery} />
                            <RatingSelector label="جودة النوم البارحة" field="sleep" icon={Moon} />
                            <RatingSelector label="مستوى التوتر حالياً" field="stress" icon={Brain} />

                            <Button 
                                onClick={() => setStep(2)}
                                className="w-full h-14 bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-2xl font-bold text-lg mt-8 shadow-xl shadow-teal-500/20"
                            >
                                متابعة
                                <ChevronLeft className="w-5 h-5 ml-2 mr-1" />
                            </Button>
                        </motion.div>
                    )}

                    {/* Step 2: Physical Symptoms */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div className="mb-8">
                                <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                                    <HeartPulse className="w-6 h-6 text-rose-500" />
                                    الأعراض الجسدية
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                    اخبرنا بم تشعر؟ وما هو أكثر عرض يزعجك حالياً في جسدك؟
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-800/80 p-1 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm mb-8">
                                <Textarea 
                                    className="border-0 bg-transparent resize-none min-h-[150px] text-lg focus-visible:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                    placeholder="مثال: صداع مستمر من الصباح في مقدمة الرأس، أو ألم في أسفل الظهر..."
                                    value={formData.physicalSymptoms}
                                    onChange={e => setFormData({...formData, physicalSymptoms: e.target.value})}
                                />
                            </div>

                            <Button 
                                onClick={() => setStep(3)}
                                disabled={!formData.physicalSymptoms.trim()}
                                className="w-full h-14 bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-teal-500/20 disabled:opacity-50"
                            >
                                التالي
                                <ChevronLeft className="w-5 h-5 ml-2 mr-1" />
                            </Button>
                        </motion.div>
                    )}

                    {/* Step 3: Emotional Context */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div className="mb-8">
                                <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                                    <Brain className="w-6 h-6 text-indigo-500" />
                                    البعد الشعوري
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                    في طِبرَا، ندرك أن الجسد يتحدث بصوت المشاعر. هل تسبق هذا الألم أي ضغوط أو مواقف معينة؟
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-800/80 p-1 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm mb-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -z-10" />
                                <Textarea 
                                    className="border-0 bg-transparent resize-none min-h-[150px] text-lg focus-visible:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                    placeholder="مثال: أشعر بقلق من مسؤوليات العمل الجديدة، أو هناك نزاع عائلي يزعجني مؤخراً..."
                                    value={formData.emotionalContext}
                                    onChange={e => setFormData({...formData, emotionalContext: e.target.value})}
                                />
                            </div>

                            <Button 
                                onClick={handleAnalyze}
                                className="w-full h-14 bg-gradient-to-l from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/20"
                            >
                                {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : 'تحليل المعطيات بواسطة الذكاء الاصطناعي'}
                                {!isAnalyzing && <Sparkles className="w-5 h-5 ml-2 mr-1" />}
                            </Button>
                        </motion.div>
                    )}

                    {/* Step 4: Analysis Result / Handoff */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-10 h-10 text-teal-500" />
                                </div>
                                <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                                    تم استلام التقييم
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">
                                    هناك ارتباط محتمل بين ({formData.physicalSymptoms.slice(0, 20)}...) والجانب الشعوري الخاص بك.
                                </p>

                                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-3xl p-5 border border-amber-100/50 dark:border-amber-800/20 text-right mb-8">
                                    <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-2">
                                        <AlertCircle className="w-4 h-4" />
                                        توصية النظام
                                    </h3>
                                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                                        ننصحك بحجز جلسة الآن مع د. عمر لمناقشة هذه الأعراض بعمق ووضع خطة علاجية مخصصة تجمع بين الجانب الجسدي والشعوري.
                                    </p>
                                </div>

                                <Button 
                                    onClick={handleHandoff}
                                    className="w-full h-14 bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-teal-500/20"
                                >
                                    حجز موعد مع الطبيب
                                    <ArrowRight className="w-5 h-5 ml-2 mr-1 rotate-180" />
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

