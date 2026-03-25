import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Activity, Moon, Sun, Frown, Smile, Meh, HeartPulse, CheckCircle2, Loader2, Sparkles, Zap, Brain } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createPageUrl } from '../utils';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { aiClient } from '@/components/ai/aiClient';
import { toast } from 'sonner';

// Configuration for Framer Motion
const SPRING_CONFIG: any = { type: 'spring', stiffness: 300, damping: 25, mass: 0.8 };

// Define the steps
type StepType = 'welcome' | 'pain' | 'energy' | 'sleep' | 'mood' | 'analyzing' | 'result';

export default function DailyLog() {
    const router = useRouter();
    const { user } = useAuth();
    
    // State
    const [currentStep, setCurrentStep] = useState<StepType>('welcome');
    const [painLevel, setPainLevel] = useState(0); // 0-10
    const [energyLevel, setEnergyLevel] = useState(5); // 1-10
    const [sleepQuality, setSleepQuality] = useState(5); // 1-10
    const [mood, setMood] = useState<number | null>(null); // 1-5 (Terrible to Great)
    
    const [isSaving, setIsSaving] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [streakCount, setStreakCount] = useState(1);

    // Navigate to next step with haptic feedback
    const goToStep = (step: StepType) => {
        haptic.selection();
        uiSounds.select();
        setCurrentStep(step);
    };

    // Calculate pain description based on value
    const getPainDescription = (level: number) => {
        if (level === 0) return { text: "لا يوجد ألم", color: "text-emerald-500", bg: "bg-emerald-500/10" };
        if (level <= 3) return { text: "ألم خفيف", color: "text-amber-500", bg: "bg-amber-500/10" };
        if (level <= 6) return { text: "ألم متوسط", color: "text-orange-500", bg: "bg-orange-500/10" };
        if (level <= 8) return { text: "ألم شديد", color: "text-red-500", bg: "bg-red-500/10" };
        return { text: "ألم مبرح لا يحتمل", color: "text-rose-600", bg: "bg-rose-600/10" };
    };

    // Submit the form
    const handleSubmit = async () => {
        setIsSaving(true);
        setCurrentStep('analyzing');
        haptic.success();
        
        try {
            // 1. Save to DB
            const today = new Date().toISOString().split('T')[0];
            
            // Check if log already exists for today
            const existingLogs = await db.entities.DailyLog.filter({ date: today, user_id: user?.id });
            
            const logData = {
                date: today,
                pain_level: painLevel,
                energy_level: energyLevel,
                sleep_quality: sleepQuality,
                mood: mood || 3, // Default mood if not set somehow
            };

            if (existingLogs.length > 0) {
                // Update
                await db.entities.DailyLog.update(existingLogs[0].id as string, logData);
            } else {
                // Create
                await db.entities.DailyLog.createForUser(user?.id || '', logData);
                // Increment streak (mock logic for UI, real logic would query previous days)
                setStreakCount(prev => prev + 1);
            }

            // Reward Points
            const savedRewards = JSON.parse(localStorage.getItem('tibrahRewards') || '{"points":0}');
            savedRewards.points = (savedRewards.points || 0) + 10;
            localStorage.setItem('tibrahRewards', JSON.stringify(savedRewards));
            setTimeout(() => {
                toast.success('🎉 رائع! كسبت 10 نقــــاط لاهتمامك بصحتك اليوم');
            }, 500);

            // 2. Fetch AI Analysis
            // Creating a prompt summarizing the user's state
            let promptDescription = `المريض سجل حالته اليومية كالتالي:
            - مستوى الألم: ${painLevel} من 10 (${getPainDescription(painLevel).text})
            - مستوى الطاقة: ${energyLevel} من 10
            - جودة النوم: ${sleepQuality} من 10
            - المزاج: ${mood} من 5 (حيث 1 سيء جداً و 5 ممتاز)
            أعطني نصيحة طبية تشجيعية وعملية جداً (في 3 أسطر كحد أقصى) لتوجيه المريض لهذا اليوم بناءً على هذه المعطيات. خاطبه بصيغة يمنية قريبة ولطيفة.`;

            try {
                // Call AI Companion API
                const textOutput = await db.integrations.Core.InvokeLLM({
                    prompt: promptDescription
                }) as any;
                setAiAnalysis(textOutput?.response || textOutput?.answer || "ممتاز أنك سجلت حالتك اليوم! استمر على هذا الخط العلاجي وبإذن الله بتشوف نتائج ممتازة ومستمرة. 💪");
            } catch (err) {
                console.error("AI Analysis failed:", err);
                setAiAnalysis("ممتاز أنك سجلت حالتك اليوم! استمر على هذا الخط العلاجي وبإذن الله بتشوف نتائج ممتازة ومستمرة. 💪");
            }

            // Move to result screen
            setCurrentStep('result');
            uiSounds.success();

        } catch (error) {
            console.error('Error saving daily log:', error);
            // Fallback immediately to error or try to continue
            setCurrentStep('result'); 
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <div className="min-h-screen bg-slate-900 text-white selection:bg-indigo-500/30 font-sans">
            
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-indigo-900/20 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-900/20 blur-[100px]" />
            </div>

            {/* Header */}
            <div className="relative z-10 px-4 py-6 flex items-center justify-between">
                <motion.div whileTap={{ scale: 0.9 }}>
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="rounded-full bg-white/5 hover:bg-white/10 text-white"
                        onClick={() => {
                            if (currentStep !== 'welcome' && currentStep !== 'result' && currentStep !== 'analyzing') {
                                // Implement back logic if needed, or just go to home
                                router.push('/');
                            } else {
                                router.push('/');
                            }
                        }}
                    >
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                </motion.div>
                
                {/* Progress Indicators */}
                {['pain', 'energy', 'sleep', 'mood'].includes(currentStep) && (
                    <div className="flex gap-1.5">
                        {['pain', 'energy', 'sleep', 'mood'].map((step, idx) => {
                            const stepOrder = ['pain', 'energy', 'sleep', 'mood'];
                            const currentIdx = stepOrder.indexOf(currentStep);
                            return (
                                <div 
                                    key={step} 
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                        idx <= currentIdx ? 'w-6 bg-indigo-500' : 'w-2 bg-white/20'
                                    }`}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 flex flex-col items-center justify-center px-6 min-h-[70vh] pb-24">
                <AnimatePresence mode="wait">
                    
                    {/* --- STEP: WELCOME --- */}
                    {currentStep === 'welcome' && (
                        <motion.div
                            key="welcome"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            className="text-center w-full max-w-sm"
                        >
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[28px] p-1 mb-8 shadow-2xl shadow-indigo-500/30">
                                <div className="w-full h-full bg-slate-900 rounded-[24px] flex items-center justify-center">
                                    <Activity className="w-10 h-10 text-indigo-400" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-black mb-4">كيف كان يومك؟</h1>
                            <p className="text-slate-400 font-medium leading-relaxed mb-10">
                                تسجيل تفاصيل يومك بيساعدنا الذكاء الاصطناعي والدكتور على فهم تطور حالتك بدقة، وتعديل خطتك العلاجية لنتائج أسرع.
                            </p>
                            <Button 
                                onClick={() => goToStep('pain')}
                                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl p-6 text-lg font-bold shadow-lg shadow-indigo-500/20"
                            >
                                نبدأ التسجيل
                            </Button>
                        </motion.div>
                    )}

                    {/* --- STEP: PAIN LEVEL --- */}
                    {currentStep === 'pain' && (
                        <motion.div
                            key="pain"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={SPRING_CONFIG}
                            className="w-full max-w-sm"
                        >
                            <p className="text-indigo-400 font-bold mb-2 text-sm text-center">الخطوة 1 من 4</p>
                            <h2 className="text-2xl font-black mb-8 text-center text-white">كيف هو مستوى الألم اليوم؟</h2>
                            
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
                                <div className="text-center mb-8">
                                    <span className="text-6xl font-black tracking-tighter text-white">{painLevel}</span>
                                    <span className="text-xl text-slate-400 font-bold mx-1">/</span>
                                    <span className="text-xl text-slate-500 font-bold">10</span>
                                </div>
                                
                                <Slider
                                    defaultValue={[0]}
                                    max={10}
                                    step={1}
                                    value={[painLevel]}
                                    onValueChange={(val) => {
                                        setPainLevel(val[0]);
                                        haptic.selection();
                                    }}
                                    className="mb-6"
                                />

                                <div className={`px-4 py-3 rounded-2xl text-center font-bold transition-colors ${getPainDescription(painLevel).bg} ${getPainDescription(painLevel).color}`}>
                                    {getPainDescription(painLevel).text}
                                </div>
                            </div>
                            
                            <Button 
                                onClick={() => goToStep('energy')}
                                className="w-full bg-white text-slate-900 hover:bg-slate-200 rounded-2xl p-6 text-lg font-bold"
                            >
                                التالي
                            </Button>
                        </motion.div>
                    )}

                    {/* --- STEP: ENERGY --- */}
                    {currentStep === 'energy' && (
                        <motion.div
                            key="energy"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={SPRING_CONFIG}
                            className="w-full max-w-sm"
                        >
                            <p className="text-amber-400 font-bold mb-2 text-sm text-center">الخطوة 2 من 4</p>
                            <h2 className="text-2xl font-black mb-8 text-center text-white">كم تعطي مستوى طاقتك؟</h2>
                            
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
                                <div className="flex justify-center mb-6">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                                        <Zap className="w-10 h-10 text-amber-900 fill-amber-900" />
                                    </div>
                                </div>
                                
                                <div className="text-center mb-6">
                                    <span className="text-5xl font-black text-amber-400">{energyLevel}</span>
                                </div>

                                <Slider
                                    defaultValue={[5]}
                                    max={10}
                                    min={1}
                                    step={1}
                                    value={[energyLevel]}
                                    onValueChange={(val) => {
                                        setEnergyLevel(val[0]);
                                        haptic.selection();
                                    }}
                                    className="mb-2"
                                />
                                <div className="flex justify-between text-xs font-bold text-slate-500 px-1 mt-2">
                                    <span>منهك جداً</span>
                                    <span>طاقة عالية</span>
                                </div>
                            </div>
                            
                            <Button 
                                onClick={() => goToStep('sleep')}
                                className="w-full bg-white text-slate-900 hover:bg-slate-200 rounded-2xl p-6 text-lg font-bold"
                            >
                                التالي
                            </Button>
                        </motion.div>
                    )}

                    {/* --- STEP: SLEEP --- */}
                    {currentStep === 'sleep' && (
                        <motion.div
                            key="sleep"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={SPRING_CONFIG}
                            className="w-full max-w-sm"
                        >
                            <p className="text-blue-400 font-bold mb-2 text-sm text-center">الخطوة 3 من 4</p>
                            <h2 className="text-2xl font-black mb-8 text-center text-white">كيف كان جودة نومك؟</h2>
                            
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
                                <div className="flex justify-center mb-6">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-400 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                                        <Moon className="w-9 h-9 text-white fill-white" />
                                    </div>
                                </div>
                                
                                <div className="text-center mb-6">
                                    <span className="text-5xl font-black text-blue-400">{sleepQuality}</span>
                                </div>

                                <Slider
                                    defaultValue={[5]}
                                    max={10}
                                    min={1}
                                    step={1}
                                    value={[sleepQuality]}
                                    onValueChange={(val) => {
                                        setSleepQuality(val[0]);
                                        haptic.selection();
                                    }}
                                    className="mb-2"
                                />
                                <div className="flex justify-between text-xs font-bold text-slate-500 px-1 mt-2">
                                    <span>نوم متقطع/سيء</span>
                                    <span>نوم عميق/مريح</span>
                                </div>
                            </div>
                            
                            <Button 
                                onClick={() => goToStep('mood')}
                                className="w-full bg-white text-slate-900 hover:bg-slate-200 rounded-2xl p-6 text-lg font-bold"
                            >
                                التالي
                            </Button>
                        </motion.div>
                    )}

                     {/* --- STEP: MOOD & SUBMIT --- */}
                     {currentStep === 'mood' && (
                        <motion.div
                            key="mood"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={SPRING_CONFIG}
                            className="w-full max-w-sm"
                        >
                            <p className="text-emerald-400 font-bold mb-2 text-sm text-center">الخطوة 4 من 4</p>
                            <h2 className="text-2xl font-black mb-8 text-center text-white">صف لنا مزاجك العام اليوم</h2>
                            
                            <div className="grid grid-cols-5 gap-2 mb-10">
                                {[
                                    { val: 1, icon: Frown, label: "سيء",  color: "text-red-400", bg: "bg-red-400/20" },
                                    { val: 2, icon: Meh,   label: "محبط", color: "text-orange-400", bg: "bg-orange-400/20" },
                                    { val: 3, icon: Meh,   label: "عادي", color: "text-yellow-400", bg: "bg-yellow-400/20" },
                                    { val: 4, icon: Smile, label: "جيد",  color: "text-emerald-400", bg: "bg-emerald-400/20" },
                                    { val: 5, icon: Smile, label: "ممتاز",color: "text-cyan-400", bg: "bg-cyan-400/20" },
                                ].map((item) => (
                                    <motion.button
                                        key={item.val}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => {
                                            setMood(item.val);
                                            haptic.selection();
                                            uiSounds.select();
                                        }}
                                        className={`flex flex-col items-center justify-center py-4 rounded-2xl border transition-all ${
                                            mood === item.val 
                                            ? `border-white/50 ${item.bg}` 
                                            : 'border-white/5 bg-white/5 hover:bg-white/10'
                                        }`}
                                    >
                                        <item.icon className={`w-8 h-8 mb-2 ${mood === item.val ? item.color : 'text-slate-400'}`} />
                                        <span className={`text-[10px] font-bold ${mood === item.val ? 'text-white' : 'text-slate-500'}`}>{item.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                            
                            <Button 
                                onClick={handleSubmit}
                                disabled={mood === null || isSaving}
                                className={`w-full rounded-2xl p-6 text-lg font-bold transition-all ${
                                    mood !== null 
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/30' 
                                    : 'bg-white/10 text-white/30'
                                }`}
                            >
                                {isSaving ? 'جاري التحليل الحفظ...' : 'حفظ وتحليل يومياتي'}
                            </Button>
                        </motion.div>
                    )}

                    {/* --- STEP: ANALYZING LOADING --- */}
                    {currentStep === 'analyzing' && (
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="text-center w-full max-w-sm"
                        >
                            <div className="relative w-32 h-32 mx-auto mb-8">
                                <motion.div 
                                    className="absolute inset-0 rounded-full bg-purple-500/20"
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center z-10 shadow-[0_0_40px_rgba(139,92,246,0.3)]">
                                    <Brain className="w-12 h-12 text-white" />
                                </div>
                                {/* Orbiting spark */}
                                <motion.div
                                    className="absolute inset-0 z-20"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                >
                                    <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_10px_white] -top-2 left-1/2 -translate-x-1/2" />
                                </motion.div>
                            </div>

                            <h2 className="text-2xl font-black mb-2">جاري المعالجة...</h2>
                            <p className="text-slate-400 font-medium">يقوم الذكاء الاصطناعي السريري بتحليل حالة اليوم 🧠🤖</p>
                        </motion.div>
                    )}

                    {/* --- STEP: RESULT & AI ANALYSIS --- */}
                    {currentStep === 'result' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full max-w-sm flex flex-col items-center"
                        >
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                                transition={{ type: 'spring', damping: 12 }}
                                className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(52,211,153,0.4)]"
                            >
                                <CheckCircle2 className="w-10 h-10 text-white" />
                            </motion.div>

                            <h2 className="text-3xl font-black mb-2 text-white">ممتاز!</h2>
                            <p className="text-emerald-400 font-bold mb-8">تم تسجيل يومك بنجاح</p>

                            {/* Gamification Streak */}
                            <div className="bg-white/5 border border-amber-500/20 rounded-2xl p-4 mb-6 w-full flex items-center justify-center gap-3">
                                <span className="text-2xl">🔥</span>
                                <div className="text-right">
                                    <p className="text-sm text-slate-400 font-bold">حافظت على سجل الدخول لـ</p>
                                    <p className="text-lg font-black text-amber-400">{streakCount} يوم متتالي</p>
                                </div>
                            </div>

                            {/* AI Analysis Card */}
                            {aiAnalysis && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-3xl p-6 mb-8 w-full backdrop-blur-xl relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full" />
                                    <div className="flex items-center gap-2 mb-4 relative z-10">
                                        <Brain className="w-5 h-5 text-indigo-400" />
                                        <h3 className="font-bold text-indigo-300">نصيحة الكونسيرج الذكي</h3>
                                    </div>
                                    <p className="text-slate-200 text-sm leading-relaxed relative z-10 font-medium">
                                        {aiAnalysis}
                                    </p>
                                </motion.div>
                            )}

                            <Link href="/" className="w-full" onClick={() => haptic.success()}>
                                <Button className="w-full bg-white/10 hover:bg-white/20 text-white rounded-2xl p-6 text-lg font-bold border border-white/10">
                                    العودة للرئيسية
                                </Button>
                            </Link>

                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
