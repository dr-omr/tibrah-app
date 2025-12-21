// components/home/ServicesHighlight.tsx
// Premium Services Carousel - Yemeni Style with Professional Design

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { createPageUrl } from '../../utils';
import { motion, AnimatePresence, PanInfo, useReducedMotion } from 'framer-motion';
import {
    Stethoscope, Calendar, Radio, BookOpen, ArrowLeft, ArrowRight,
    Sparkles, Play, Pause, ChevronLeft, ChevronRight, MessageCircle,
    Clock, Star, Gift, Zap, Heart
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ServicesHighlight() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [direction, setDirection] = useState(0);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

    // تحسين الأداء: احترام تفضيلات المستخدم للحركة المخفضة
    const prefersReducedMotion = useReducedMotion();

    // الخدمات باللهجة اليمنية
    const services = [
        {
            id: 'diagnostic',
            icon: Stethoscope,
            titleYemeni: 'أبسر وش عندك',
            titleArabic: 'الجلسة التشخيصية',
            description: 'نشوف السبب الحقيقي مش الظاهر بس',
            longDescription: 'جلسة شاملة نفهم فيها جسمك ونحدد جذور المشكلة الصحية',
            features: ['تحليل شامل', 'خطة علاجية', 'متابعة فورية'],
            originalPrice: '350',
            promoPrice: '35',
            currency: 'ر.س',
            duration: '45-60 دقيقة',
            gradient: 'from-[#2D9B83] to-[#3FB39A]',
            bgGradient: 'from-[#2D9B83]/10 to-[#3FB39A]/10',
            shadowColor: 'shadow-emerald-200/50',
            page: 'BookAppointment',
            badge: 'عرض إطلاق',
            badgeColor: 'bg-red-500',
            cta: 'احجز الآن',
            ctaIcon: MessageCircle,
        },
        {
            id: 'programs',
            icon: Calendar,
            titleYemeni: 'نمشي معك خطوة خطوة',
            titleArabic: 'برامج المتابعة',
            description: 'متابعة يومية حتى تتعافى بإذن الله',
            longDescription: 'رفقة كاملة في رحلة التعافي - مش بس وصفة وخلاص',
            features: ['متابعة 24/7', 'خطة مخصصة', 'دعم مستمر'],
            badge: '3 أيام مجانية',
            badgeColor: 'bg-amber-500',
            gradient: 'from-purple-500 to-pink-500',
            bgGradient: 'from-purple-500/10 to-pink-500/10',
            shadowColor: 'shadow-purple-200/50',
            page: 'Services',
            cta: 'جرب مجاناً',
            ctaIcon: Gift,
        },
        {
            id: 'frequencies',
            icon: Radio,
            titleYemeni: 'صيدلية الروح',
            titleArabic: 'مكتبة الترددات',
            description: 'ترددات شفائية مجانية لجسمك وروحك',
            longDescription: 'أكثر من 50 تردد علاجي للنوم والاسترخاء والشفاء',
            features: ['متجددة دائماً', 'مجانية 100%', 'بدون إعلانات'],
            badge: 'مجانية',
            badgeColor: 'bg-blue-500',
            gradient: 'from-blue-500 to-cyan-500',
            bgGradient: 'from-blue-500/10 to-cyan-500/10',
            shadowColor: 'shadow-blue-200/50',
            page: 'Frequencies',
            cta: 'استمع الآن',
            ctaIcon: Play,
        },
        {
            id: 'courses',
            icon: BookOpen,
            titleYemeni: 'تعلم وافهم جسمك',
            titleArabic: 'الدورات التعليمية',
            description: 'علم حقيقي ينفعك مش كلام فاضي',
            longDescription: 'دورات من الصفر تخليك تفهم جسمك وكيف تحافظ عليه',
            features: ['محتوى حصري', 'شهادات', 'وصول مدى الحياة'],
            badge: 'جديد',
            badgeColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
            isNew: true,
            gradient: 'from-amber-500 to-orange-500',
            bgGradient: 'from-amber-500/10 to-orange-500/10',
            shadowColor: 'shadow-amber-200/50',
            page: 'Courses',
            cta: 'تصفح الدورات',
            ctaIcon: BookOpen,
        },
    ];

    // Auto-play logic
    const startAutoPlay = useCallback(() => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        autoPlayRef.current = setInterval(() => {
            if (!isPaused) {
                setDirection(1);
                setCurrentIndex((prev) => (prev + 1) % services.length);
            }
        }, 4000);
    }, [isPaused, services.length]);

    useEffect(() => {
        startAutoPlay();
        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [startAutoPlay]);

    const goToSlide = (index: number) => {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
        startAutoPlay();
    };

    const goNext = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % services.length);
        startAutoPlay();
    };

    const goPrev = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);
        startAutoPlay();
    };

    // Swipe handlers
    const handleDragEnd = (event: any, info: PanInfo) => {
        const threshold = 50;
        if (info.offset.x > threshold) {
            goPrev();
        } else if (info.offset.x < -threshold) {
            goNext();
        }
    };

    // تحريكات الشرائح - مع دعم الحركة المخفضة للوصولية
    const slideVariants = prefersReducedMotion
        ? {
            // حركات مبسطة لمن يفضل تقليل الحركة
            enter: { opacity: 0 },
            center: { opacity: 1, transition: { duration: 0.15 } },
            exit: { opacity: 0, transition: { duration: 0.1 } },
        }
        : {
            enter: (direction: number) => ({
                x: direction > 0 ? 300 : -300,
                opacity: 0,
                scale: 0.9,
            }),
            center: {
                x: 0,
                opacity: 1,
                scale: 1,
                transition: {
                    duration: 0.4,
                    ease: 'easeOut' as const,
                },
            },
            exit: (direction: number) => ({
                x: direction < 0 ? 300 : -300,
                opacity: 0,
                scale: 0.9,
                transition: {
                    duration: 0.3,
                },
            }),
        };

    const currentService = services[currentIndex];
    const Icon = currentService.icon;
    const CtaIcon = currentService.ctaIcon;

    return (
        <section className="py-8">
            {/* Section Header */}
            <div className="px-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.div
                            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] flex items-center justify-center shadow-lg"
                            whileTap={{ scale: 0.9, rotate: -10 }}
                        >
                            <Stethoscope className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">خدماتنا</h2>
                            <p className="text-sm text-slate-500">اختر ما يناسب رحلتك الصحية</p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        <motion.button
                            className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center border border-slate-100"
                            onClick={() => setIsPaused(!isPaused)}
                            whileTap={{ scale: 0.9 }}
                            aria-label={isPaused ? 'تشغيل التنقل التلقائي' : 'إيقاف التنقل التلقائي'}
                            aria-pressed={!isPaused}
                        >
                            {isPaused ? (
                                <Play className="w-3.5 h-3.5 text-slate-600 mr-[-1px]" aria-hidden="true" />
                            ) : (
                                <Pause className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Carousel Container */}
            <div
                className="relative overflow-hidden"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div className="px-6">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={currentIndex}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={handleDragEnd}
                            className="cursor-grab active:cursor-grabbing"
                        >
                            {/* Service Card */}
                            <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${currentService.bgGradient} p-1`}>
                                <div className="relative overflow-hidden rounded-[22px] bg-white/80 backdrop-blur-sm">
                                    {/* Badge */}
                                    {currentService.badge && (
                                        <div className="absolute top-4 right-4 z-10">
                                            <motion.div
                                                initial={{ scale: 0, rotate: -20 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ delay: 0.2, type: 'spring' }}
                                            >
                                                <Badge className={`${currentService.badgeColor} text-white border-0 px-3 py-1.5 text-sm font-bold shadow-lg`}>
                                                    {currentService.isNew && <Sparkles className="w-3.5 h-3.5 ml-1" />}
                                                    {currentService.badge}
                                                </Badge>
                                            </motion.div>
                                        </div>
                                    )}

                                    <div className="p-6">
                                        {/* Icon and Title */}
                                        <div className="flex items-start gap-4 mb-5">
                                            <motion.div
                                                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentService.gradient} flex items-center justify-center shadow-xl`}
                                                animate={{
                                                    scale: [1, 1.05, 1],
                                                    rotate: [0, 2, -2, 0]
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            >
                                                <Icon className="w-8 h-8 text-white" />
                                            </motion.div>
                                            <div className="flex-1">
                                                <motion.h3
                                                    className="text-2xl font-bold text-slate-800 mb-1"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 }}
                                                >
                                                    {currentService.titleYemeni}
                                                </motion.h3>
                                                <motion.p
                                                    className="text-sm text-slate-500"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.2 }}
                                                >
                                                    {currentService.titleArabic}
                                                </motion.p>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <motion.p
                                            className="text-slate-600 mb-5 leading-relaxed"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.15 }}
                                        >
                                            {currentService.longDescription}
                                        </motion.p>

                                        {/* Features */}
                                        <div className="flex flex-wrap gap-2 mb-5">
                                            {currentService.features.map((feature, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${currentService.bgGradient} border border-white/50`}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                                >
                                                    <Star className="w-3.5 h-3.5 text-amber-500" />
                                                    <span className="text-sm font-medium text-slate-700">{feature}</span>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Pricing (if available) */}
                                        {currentService.promoPrice && (
                                            <motion.div
                                                className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-100"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                <div className="flex items-center gap-1">
                                                    <span className="text-red-500 text-xs font-bold bg-red-100 px-2 py-0.5 rounded-full animate-pulse">
                                                        🔥 خصم 90%
                                                    </span>
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-bold text-emerald-600">
                                                        {currentService.promoPrice}
                                                    </span>
                                                    <span className="text-emerald-600 text-sm">{currentService.currency}</span>
                                                    <span className="text-slate-400 line-through text-sm">
                                                        {currentService.originalPrice}
                                                    </span>
                                                </div>
                                                {currentService.duration && (
                                                    <div className="flex items-center gap-1 mr-auto text-slate-500 text-sm">
                                                        <Clock className="w-4 h-4" />
                                                        {currentService.duration}
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}

                                        {/* CTA Button */}
                                        <Link href={createPageUrl(currentService.page)}>
                                            <motion.button
                                                className={`w-full py-4 rounded-2xl bg-gradient-to-r ${currentService.gradient} text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2`}
                                                whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(45, 155, 131, 0.3)' }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                {currentService.cta}
                                                <CtaIcon className="w-5 h-5" />
                                            </motion.button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation Arrows */}
                <motion.button
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center border border-slate-100 z-10"
                    onClick={goPrev}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="الخدمة السابقة"
                >
                    <ChevronRight className="w-5 h-5 text-slate-700" aria-hidden="true" />
                </motion.button>
                <motion.button
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center border border-slate-100 z-10"
                    onClick={goNext}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="الخدمة التالية"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-700" aria-hidden="true" />
                </motion.button>
            </div>

            {/* Dots Navigation */}
            <div className="flex items-center justify-center gap-2 mt-5 px-6">
                {services.map((service, index) => (
                    <motion.button
                        key={service.id}
                        onClick={() => goToSlide(index)}
                        className={`relative h-2 rounded-full transition-all duration-300 ${index === currentIndex
                            ? `w-8 bg-gradient-to-r ${service.gradient}`
                            : 'w-2 bg-slate-200 hover:bg-slate-300'
                            }`}
                        whileTap={{ scale: 1.2 }}
                        aria-label={`انتقل إلى ${service.titleArabic}`}
                        aria-current={index === currentIndex ? 'true' : undefined}
                    >
                        {index === currentIndex && !isPaused && (
                            <motion.div
                                className="absolute inset-0 rounded-full bg-white/50"
                                initial={{ scaleX: 0, originX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 4, ease: 'linear' }}
                                aria-hidden="true"
                            />
                        )}
                    </motion.button>
                ))}
            </div>

            {/* Quick Access Cards */}
            <div className="px-6 mt-6">
                <div className="grid grid-cols-4 gap-2">
                    {services.map((service, index) => {
                        const ServiceIcon = service.icon;
                        const isActive = index === currentIndex;
                        return (
                            <motion.button
                                key={service.id}
                                onClick={() => goToSlide(index)}
                                className={`p-3 rounded-2xl transition-all duration-300 ${isActive
                                    ? `bg-gradient-to-br ${service.bgGradient} ring-2 ring-offset-2 ring-slate-200`
                                    : 'bg-white/50 hover:bg-white/80 border border-slate-100'
                                    }`}
                                whileTap={{ scale: 0.95 }}
                                aria-label={`عرض ${service.titleArabic}`}
                                aria-pressed={isActive}
                            >
                                <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-2 ${isActive ? 'shadow-lg' : 'opacity-70'
                                    }`} aria-hidden="true">
                                    <ServiceIcon className="w-5 h-5 text-white" />
                                </div>
                                <p className={`text-[10px] font-medium text-center ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                                    {service.titleArabic}
                                </p>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* View All Link */}
            <div className="px-6 mt-5">
                <Link href={createPageUrl('Services')}>
                    <motion.div
                        className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 hover:text-[#2D9B83] hover:border-[#2D9B83] transition-colors"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <span className="font-medium">عرض جميع الخدمات</span>
                        <ArrowLeft className="w-4 h-4" />
                    </motion.div>
                </Link>
            </div>
        </section>
    );
}