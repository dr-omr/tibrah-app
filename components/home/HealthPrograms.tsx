// components/home/HealthPrograms.tsx
// Premium Horizontal Auto-Scrolling Carousel

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { createPageUrl } from '../../utils';
import { Check, Crown, Zap, Flame, ArrowLeft, Sparkles, Gift, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProgramRecommendation from '@/components/assessment/ProgramRecommendation';

export default function HealthPrograms() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // عرض الإطلاق - خصم 90% (السعر الجديد = 10% من الأصلي)
    const programs = [
        {
            id: 'weekly',
            title: 'البرنامج الأسبوعي',
            subtitle: 'بداية رحلتك',
            duration: '٧ أيام',
            originalPrice: '٢٩٩',
            promoPrice: '٣٠', // 10% of 299 ≈ 30
            icon: Zap,
            gradient: 'from-blue-500 to-cyan-500',
            bgGradient: 'from-blue-50 to-cyan-50',
            shadowColor: 'shadow-blue-200/50',
            features: [
                'خطة غذائية مبسطة',
                'بروتوكول ديتوكس خفيف',
                'ترددات شفائية يومية',
                'متابعة يومية',
            ],
        },
        {
            id: '21_days',
            title: 'برنامج ٢١ يوم',
            subtitle: 'التحول الحقيقي',
            duration: '٢١ يوم',
            originalPrice: '٧٩٩',
            promoPrice: '٨٠', // 10% of 799 ≈ 80
            icon: Crown,
            gradient: 'from-[#2D9B83] to-[#3FB39A]',
            bgGradient: 'from-emerald-50 to-teal-50',
            shadowColor: 'shadow-emerald-200/50',
            featured: true,
            trial: true,
            features: [
                'تحليل شامل للحالة',
                'بروتوكول ديتوكس متكامل',
                'مكملات غذائية مخصصة',
                'ترددات علاجية يومية',
                'متابعة مستمرة ٢٤/٧',
                'جلسة أسبوعية مع الطبيب',
            ],
        },
        {
            id: '3_months',
            title: 'التحول الشامل',
            subtitle: 'إعادة بناء صحتك',
            duration: '٣ أشهر',
            originalPrice: '١٩٩٩',
            promoPrice: '٢٠٠', // 10% of 1999 ≈ 200
            icon: Flame,
            gradient: 'from-[#D4AF37] to-[#F4D03F]',
            bgGradient: 'from-amber-50 to-yellow-50',
            shadowColor: 'shadow-amber-200/50',
            features: [
                'كل مميزات برنامج ٢١ يوم',
                'تحاليل دورية شاملة',
                'علاج الأسباب الجذرية',
                'إعادة توازن الجسم',
                'دعم نفسي وروحي',
                'ضمان النتائج',
            ],
        },
    ];

    // Auto-play logic
    const startAutoPlay = useCallback(() => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        autoPlayRef.current = setInterval(() => {
            if (!isPaused && !isHovered) {
                setCurrentIndex((prev) => (prev + 1) % programs.length);
            }
        }, 5000); // 5 seconds per slide
    }, [isPaused, isHovered, programs.length]);

    useEffect(() => {
        startAutoPlay();
        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [startAutoPlay]);

    // Navigation
    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        startAutoPlay(); // Reset timer
    };

    const goNext = () => goToSlide((currentIndex + 1) % programs.length);
    const goPrev = () => goToSlide((currentIndex - 1 + programs.length) % programs.length);

    // Handle drag
    const handleDragEnd = (_: any, info: PanInfo) => {
        const threshold = 50;
        if (info.offset.x < -threshold) goNext();
        else if (info.offset.x > threshold) goPrev();
    };

    const program = programs[currentIndex];
    const Icon = program.icon;

    return (
        <section className="py-8 overflow-hidden">
            {/* Section Header */}
            <div className="px-6 flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-1">برامجنا العلاجية</h2>
                    <p className="text-sm text-slate-500">اختار الطريق اللي يناسبك للشفاء</p>
                </div>
                <motion.div
                    className="flex items-center gap-2"
                    whileTap={{ scale: 0.95 }}
                >
                    <Gift className="w-4 h-4 text-[#D4AF37]" />
                    <Badge className="gradient-gold text-white border-0 text-[10px] shadow-md">
                        تجربة مجانية
                    </Badge>
                </motion.div>
            </div>

            {/* AI Recommendation */}
            <motion.div
                className="px-6 mb-5"
                whileTap={{ scale: 0.98 }}
            >
                <ProgramRecommendation />
            </motion.div>

            {/* Carousel Container */}
            <div
                ref={containerRef}
                className="relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
            >
                {/* Cards Carousel */}
                <div className="px-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 30
                            }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={handleDragEnd}
                            className="cursor-grab active:cursor-grabbing"
                        >
                            {/* Premium Card */}
                            <motion.div
                                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${program.bgGradient} ${program.shadowColor} shadow-xl`}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                {/* Featured Badge */}
                                {program.featured && (
                                    <motion.div
                                        className={`absolute top-0 right-0 bg-gradient-to-r ${program.gradient} text-white text-xs font-bold px-4 py-2 rounded-bl-2xl z-10`}
                                        initial={{ x: 100 }}
                                        animate={{ x: 0 }}
                                        transition={{ delay: 0.2, type: 'spring' }}
                                    >
                                        <span className="flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" />
                                            الأكثر طلباً
                                        </span>
                                    </motion.div>
                                )}

                                {/* Decorative Elements */}
                                <div className={`absolute top-0 left-0 w-32 h-32 bg-gradient-to-br ${program.gradient} opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2`} />
                                <div className={`absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br ${program.gradient} opacity-10 rounded-full blur-2xl translate-x-1/2 translate-y-1/2`} />

                                <div className="relative p-6">
                                    {/* Header Row */}
                                    <div className="flex items-start gap-4 mb-5">
                                        <motion.div
                                            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${program.gradient} flex items-center justify-center shadow-lg`}
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: 0.1, type: 'spring' }}
                                            whileTap={{ scale: 0.9, rotate: 10 }}
                                        >
                                            <Icon className="w-8 h-8 text-white" />
                                        </motion.div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-xl font-bold text-slate-800">{program.title}</h3>
                                                {program.trial && (
                                                    <Badge variant="outline" className="text-[10px] border-[#2D9B83] text-[#2D9B83] bg-white/80">
                                                        تجربة مجانية
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-slate-500">{program.subtitle} • {program.duration}</p>
                                        </div>
                                    </div>

                                    {/* Features Grid */}
                                    <div className="grid grid-cols-2 gap-2 mb-5">
                                        {program.features.slice(0, 4).map((feature, i) => (
                                            <motion.div
                                                key={i}
                                                className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl px-3 py-2"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 + i * 0.08 }}
                                            >
                                                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${program.gradient} flex items-center justify-center flex-shrink-0`}>
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                                <span className="text-xs text-slate-700 font-medium">{feature}</span>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Price & CTA */}
                                    <div className="flex items-center justify-between pt-4 border-t border-white/50">
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            {/* عرض الإطلاق */}
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                                    🔥 عرض إطلاق
                                                </span>
                                                <span className="text-red-500 text-xs font-bold">خصم 90%</span>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                {/* السعر الجديد */}
                                                <span className="text-3xl font-bold text-emerald-600">{program.promoPrice}</span>
                                                <span className="text-emerald-600 text-sm">ر.س</span>
                                                {/* السعر القديم مشطوب */}
                                                <span className="text-lg text-slate-400 line-through">{program.originalPrice}</span>
                                            </div>
                                        </motion.div>

                                        <motion.a
                                            href={`https://wa.me/967771447111?text=مرحباً%20د.%20عمر،%20أريد%20الاشتراك%20في%20${encodeURIComponent(program.title)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5, type: 'spring' }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.92 }}
                                        >
                                            <Button
                                                className={`rounded-2xl px-6 py-6 text-base font-bold bg-gradient-to-r ${program.gradient} text-white shadow-lg`}
                                            >
                                                {program.trial ? 'ابدأ التجربة' : 'اشترك الآن'}
                                                <ArrowLeft className="w-5 h-5 mr-2" />
                                            </Button>
                                        </motion.a>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-center gap-4 mt-5 px-6">
                    {/* Prev Button */}
                    <motion.button
                        className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-600"
                        whileHover={{ scale: 1.1, backgroundColor: '#f1f5f9' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={goPrev}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </motion.button>

                    {/* Dots */}
                    <div className="flex items-center gap-2">
                        {programs.map((_, index) => (
                            <motion.button
                                key={index}
                                className={`rounded-full transition-all ${index === currentIndex
                                    ? 'w-8 h-2 bg-gradient-to-r from-[#2D9B83] to-[#3FB39A]'
                                    : 'w-2 h-2 bg-slate-300'
                                    }`}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => goToSlide(index)}
                            />
                        ))}
                    </div>

                    {/* Next Button */}
                    <motion.button
                        className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-600"
                        whileHover={{ scale: 1.1, backgroundColor: '#f1f5f9' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={goNext}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </motion.button>

                    {/* Pause/Play */}
                    <motion.button
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${isPaused ? 'bg-[#2D9B83] text-white' : 'bg-white text-slate-600'
                            }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsPaused(!isPaused)}
                    >
                        {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </motion.button>
                </div>

                {/* Progress Bar */}
                <div className="px-6 mt-4">
                    <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-[#2D9B83] to-[#3FB39A]"
                            initial={{ width: '0%' }}
                            animate={{ width: isPaused || isHovered ? `${((currentIndex + 1) / programs.length) * 100}%` : '100%' }}
                            transition={{
                                duration: isPaused || isHovered ? 0.3 : 5,
                                ease: 'linear',
                                repeat: isPaused || isHovered ? 0 : 0
                            }}
                            key={`${currentIndex}-${isPaused}-${isHovered}`}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}