// components/common/OnboardingFlow.tsx
// Premium animated onboarding experience for new users

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import {
    Heart, Activity, Brain, Sparkles, ChevronLeft,
    Shield, Zap, Star, CheckCircle2, ArrowRight,
    Stethoscope, Utensils, Moon, Droplets, Flame
} from 'lucide-react';

// ============================================
// ONBOARDING STEPS DATA
// ============================================

interface OnboardingStep {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    color: string;
    gradient: string;
    content: React.ReactNode;
}

const healthInterests = [
    { id: 'nutrition', label: 'التغذية الصحية', icon: Utensils, color: '#22C55E', emoji: '🥗' },
    { id: 'mental', label: 'الصحة النفسية', icon: Brain, color: '#8B5CF6', emoji: '🧠' },
    { id: 'fitness', label: 'اللياقة البدنية', icon: Activity, color: '#EF4444', emoji: '💪' },
    { id: 'sleep', label: 'جودة النوم', icon: Moon, color: '#6366F1', emoji: '😴' },
    { id: 'fasting', label: 'الصيام المتقطع', icon: Flame, color: '#F59E0B', emoji: '🔥' },
    { id: 'hydration', label: 'شرب الماء', icon: Droplets, color: '#0EA5E9', emoji: '💧' },
    { id: 'chronic', label: 'الأمراض المزمنة', icon: Stethoscope, color: '#EC4899', emoji: '🏥' },
    { id: 'weight', label: 'إدارة الوزن', icon: Activity, color: '#14B8A6', emoji: '⚖️' },
];

// ============================================
// ANIMATED PARTICLES
// ============================================

function FloatingParticles({ color }: { color: string }) {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: Math.random() * 8 + 4,
                        height: Math.random() * 8 + 4,
                        backgroundColor: `${color}30`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, Math.random() * 20 - 10, 0],
                        opacity: [0.3, 0.8, 0.3],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: Math.random() * 3 + 3,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
}

// ============================================
// PROGRESS INDICATOR
// ============================================

function ProgressDots({ total, current }: { total: number; current: number }) {
    return (
        <div className="flex items-center gap-2 justify-center">
            {Array.from({ length: total }).map((_, i) => (
                <motion.div
                    key={i}
                    className="rounded-full"
                    animate={{
                        width: i === current ? 24 : 8,
                        height: 8,
                        backgroundColor: i === current ? '#2D9B83' : i < current ? '#2D9B8380' : '#E2E8F0',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />
            ))}
        </div>
    );
}

// ============================================
// MAIN ONBOARDING COMPONENT
// ============================================

interface OnboardingFlowProps {
    onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [userName, setUserName] = useState('');
    const [direction, setDirection] = useState(1);

    const totalSteps = 4;

    const nextStep = () => {
        if (step < totalSteps - 1) {
            setDirection(1);
            setStep(s => s + 1);
        } else {
            // Complete onboarding
            if (typeof window !== 'undefined') {
                localStorage.setItem('onboardingComplete', 'true');
                localStorage.setItem('healthInterests', JSON.stringify(selectedInterests));
                if (userName) localStorage.setItem('userName', userName);
            }
            onComplete();
        }
    };

    const prevStep = () => {
        if (step > 0) {
            setDirection(-1);
            setStep(s => s - 1);
        }
    };

    const toggleInterest = (id: string) => {
        setSelectedInterests(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const skipOnboarding = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('onboardingComplete', 'true');
        }
        onComplete();
    };

    const slideVariants = {
        enter: (dir: number) => ({
            x: dir > 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 0.9,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (dir: number) => ({
            x: dir < 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 0.9,
        }),
    };

    return (
        <motion.div
            className="fixed inset-0 z-[9998] bg-white dark:bg-slate-950 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-6 pb-2 safe-top">
                {step > 0 ? (
                    <motion.button
                        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                        onClick={prevStep}
                        whileTap={{ scale: 0.9 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-500 rotate-180" />
                    </motion.button>
                ) : (
                    <div className="w-10" />
                )}

                <ProgressDots total={totalSteps} current={step} />

                <motion.button
                    className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    onClick={skipOnboarding}
                    whileTap={{ scale: 0.95 }}
                >
                    تخطي
                </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="flex-1 flex flex-col px-6"
                    >
                        {/* Step 0: Welcome */}
                        {step === 0 && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center relative">
                                <FloatingParticles color="#2D9B83" />

                                <motion.div
                                    className="relative mb-8"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', delay: 0.2, damping: 12 }}
                                >
                                    <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-2xl shadow-primary/30">
                                        <span className="text-white text-5xl font-bold">ط</span>
                                    </div>
                                    <motion.div
                                        className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg"
                                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </motion.div>
                                </motion.div>

                                <motion.h1
                                    className="text-3xl font-black text-slate-900 dark:text-white mb-3"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    مرحباً بك في طِبرَا
                                </motion.h1>
                                <motion.p
                                    className="text-slate-500 dark:text-slate-400 text-lg max-w-xs leading-relaxed"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    عيادتك الرقمية المتكاملة — صحتك تبدأ من هنا 💚
                                </motion.p>

                                {/* Feature highlights */}
                                <motion.div
                                    className="mt-10 space-y-3 w-full max-w-sm"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    {[
                                        { icon: Shield, text: 'تتبع صحتك بالذكاء الاصطناعي', color: '#2D9B83' },
                                        { icon: Zap, text: 'ترددات علاجية متقدمة', color: '#8B5CF6' },
                                        { icon: Star, text: 'وصفات وخطط غذائية مخصصة', color: '#F59E0B' },
                                    ].map((item, idx) => {
                                        const Icon = item.icon;
                                        return (
                                            <motion.div
                                                key={idx}
                                                className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 rounded-2xl p-4"
                                                initial={{ opacity: 0, x: -30 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.8 + idx * 0.15 }}
                                            >
                                                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                                                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                                                </div>
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{item.text}</span>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            </div>
                        )}

                        {/* Step 1: Name */}
                        {step === 1 && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center relative">
                                <FloatingParticles color="#8B5CF6" />

                                <motion.div
                                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-8 shadow-xl shadow-violet-500/25"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.1 }}
                                >
                                    <Heart className="w-9 h-9 text-white" />
                                </motion.div>

                                <motion.h2
                                    className="text-2xl font-bold text-slate-900 dark:text-white mb-2"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    ما اسمك الجميل؟
                                </motion.h2>
                                <motion.p
                                    className="text-slate-500 dark:text-slate-400 mb-8"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    عشان نخاطبك باسمك 😊
                                </motion.p>

                                <motion.div
                                    className="w-full max-w-sm"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <input
                                        value={userName}
                                        onChange={e => setUserName(e.target.value)}
                                        placeholder="أدخل اسمك هنا..."
                                        className="w-full text-center text-xl font-semibold bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-primary border-2 border-transparent focus:border-primary/20 text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 transition-all"
                                        dir="rtl"
                                        autoFocus
                                    />
                                </motion.div>

                                {userName && (
                                    <motion.p
                                        className="text-emerald-600 dark:text-emerald-400 font-semibold mt-4 text-lg"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                    >
                                        أهلاً {userName}! 👋
                                    </motion.p>
                                )}
                            </div>
                        )}

                        {/* Step 2: Health Interests */}
                        {step === 2 && (
                            <div className="flex-1 flex flex-col items-center pt-8 relative">
                                <FloatingParticles color="#10B981" />

                                <motion.div
                                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/25"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.1 }}
                                >
                                    <Activity className="w-9 h-9 text-white" />
                                </motion.div>

                                <motion.h2
                                    className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    ما الذي يهمك صحياً؟
                                </motion.h2>
                                <motion.p
                                    className="text-slate-500 dark:text-slate-400 mb-6 text-center"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    اختر اهتماماتك ونخصص لك التجربة
                                </motion.p>

                                <motion.div
                                    className="grid grid-cols-2 gap-3 w-full max-w-sm overflow-y-auto flex-1 pb-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    {healthInterests.map((interest, idx) => {
                                        const isSelected = selectedInterests.includes(interest.id);
                                        const Icon = interest.icon;
                                        return (
                                            <motion.button
                                                key={interest.id}
                                                className={`relative p-4 rounded-2xl border-2 transition-all text-right ${isSelected
                                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700'
                                                    }`}
                                                onClick={() => toggleInterest(interest.id)}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.4 + idx * 0.06 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {isSelected && (
                                                    <motion.div
                                                        className="absolute top-2 left-2"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: 'spring', stiffness: 500 }}
                                                    >
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                    </motion.div>
                                                )}
                                                <div className="text-2xl mb-2">{interest.emoji}</div>
                                                <div className="font-semibold text-sm text-slate-800 dark:text-white">{interest.label}</div>
                                            </motion.button>
                                        );
                                    })}
                                </motion.div>

                                {selectedInterests.length > 0 && (
                                    <motion.div
                                        className="text-center py-2"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                                            {selectedInterests.length} اهتمامات محددة ✓
                                        </span>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Ready */}
                        {step === 3 && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center relative">
                                <FloatingParticles color="#F59E0B" />

                                <motion.div
                                    className="relative mb-8"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.1, damping: 10 }}
                                >
                                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/30">
                                        <Sparkles className="w-12 h-12 text-white" />
                                    </div>
                                    <motion.div
                                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5, type: 'spring' }}
                                    >
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                    </motion.div>
                                </motion.div>

                                <motion.h2
                                    className="text-3xl font-black text-slate-900 dark:text-white mb-3"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    {userName ? `${userName}، كل شيء جاهز!` : 'كل شيء جاهز!'}
                                </motion.h2>
                                <motion.p
                                    className="text-slate-500 dark:text-slate-400 text-lg max-w-xs leading-relaxed"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    تجربتك الصحية المخصصة بانتظارك. يلا نبدأ! 🚀
                                </motion.p>

                                {/* Stats preview */}
                                <motion.div
                                    className="mt-10 grid grid-cols-3 gap-4 w-full max-w-sm"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    {[
                                        { num: '25+', label: 'أداة صحية', color: '#2D9B83' },
                                        { num: '100+', label: 'وصفة طبية', color: '#8B5CF6' },
                                        { num: 'AI', label: 'ذكاء اصطناعي', color: '#F59E0B' },
                                    ].map((stat, idx) => (
                                        <motion.div
                                            key={idx}
                                            className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 text-center"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.7 + idx * 0.1 }}
                                        >
                                            <div className="text-2xl font-black" style={{ color: stat.color }}>{stat.num}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom CTA */}
            <div className="px-6 pb-8 safe-bottom">
                <motion.button
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-lg shadow-xl shadow-primary/25 flex items-center justify-center gap-2"
                    onClick={nextStep}
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {step === totalSteps - 1 ? (
                        <>
                            <Sparkles className="w-5 h-5" />
                            ابدأ تجربتك
                        </>
                    ) : (
                        <>
                            التالي
                            <ArrowRight className="w-5 h-5 rotate-180" />
                        </>
                    )}
                </motion.button>
            </div>
        </motion.div>
    );
}
