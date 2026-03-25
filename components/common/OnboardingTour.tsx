/**
 * OnboardingTour — Interactive feature tour for new users
 * Shows tooltips highlighting key features on first visit
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ChevronLeft, ArrowLeft, Sparkles,
    Heart, ShoppingBag, BookOpen, Bot, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TourStep {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

const TOUR_KEY = 'tibrah_tour_completed';

const tourSteps: TourStep[] = [
    {
        title: 'أهلاً بك في طِبرَا! 🌿',
        description: 'عيادتك الرقمية المتكاملة. دعنا نأخذك في جولة سريعة.',
        icon: <Sparkles className="w-8 h-8" />,
        color: 'from-primary to-primary-light',
    },
    {
        title: 'المتابع الصحي 💊',
        description: 'تابع شرب الماء، النوم، الوزن، والمزاج يومياً مع تحليلات ذكية بالذكاء الاصطناعي.',
        icon: <Heart className="w-8 h-8" />,
        color: 'from-red-400 to-pink-500',
    },
    {
        title: 'المساعد الذكي 🤖',
        description: 'اسأل أي سؤال صحي واحصل على إجابة مدعومة بالذكاء الاصطناعي. اضغط Ctrl+/ للوصول السريع.',
        icon: <Bot className="w-8 h-8" />,
        color: 'from-purple-400 to-violet-500',
    },
    {
        title: 'الصيدلية والمكملات 🛒',
        description: 'مكملات غذائية ومنتجات صحية معتمدة مع شحن مباشر.',
        icon: <ShoppingBag className="w-8 h-8" />,
        color: 'from-amber-400 to-orange-500',
    },
    {
        title: 'الاستشارات والحجوزات 📅',
        description: 'احجز استشارة طب وظيفي أو جلسة علاج بالترددات مباشرة.',
        icon: <Calendar className="w-8 h-8" />,
        color: 'from-blue-400 to-cyan-500',
    },
    {
        title: 'المكتبة والدورات 📚',
        description: 'أكثر من 30 مقال ودورات تعليمية في الطب الشمولي والتغذية.',
        icon: <BookOpen className="w-8 h-8" />,
        color: 'from-green-400 to-emerald-500',
    },
];

export default function OnboardingTour() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // Show only on first visit
        const completed = localStorage.getItem(TOUR_KEY);
        if (!completed) {
            // Delay to let the page load
            const timer = setTimeout(() => setIsOpen(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handleSkip = () => {
        handleClose();
    };

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem(TOUR_KEY, 'true');
    };

    if (!isOpen) return null;

    const step = tourSteps[currentStep];
    const isLast = currentStep === tourSteps.length - 1;
    const progress = ((currentStep + 1) / tourSteps.length) * 100;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                dir="rtl"
            >
                <motion.div
                    key={currentStep}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Progress bar */}
                    <div className="h-1 bg-slate-100 dark:bg-slate-800">
                        <motion.div
                            className="h-full bg-primary"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    {/* Close button */}
                    <div className="flex justify-end p-3">
                        <button onClick={handleSkip} className="text-slate-400 hover:text-slate-600 text-xs">
                            تخطي
                        </button>
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg`}>
                            {step.icon}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-4 text-center">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                            {step.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                            {step.description}
                        </p>
                    </div>

                    {/* Dots */}
                    <div className="flex justify-center gap-2 mb-4">
                        {tourSteps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-primary' :
                                        idx < currentStep ? 'bg-primary/40' : 'bg-slate-200 dark:bg-slate-700'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="px-6 pb-6">
                        <Button
                            onClick={handleNext}
                            className="w-full h-14 gradient-primary rounded-2xl text-lg font-bold"
                        >
                            {isLast ? (
                                <>
                                    <Sparkles className="w-5 h-5 ml-2" />
                                    ابدأ الآن!
                                </>
                            ) : (
                                <>
                                    التالي
                                    <ArrowLeft className="w-5 h-5 mr-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
