// components/home/HealthTrackerDiscovery.tsx
// Premium Auto-Scrolling Carousel with Custom Images

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
    Activity, Droplets, Moon, Apple, Brain,
    TrendingUp, ChevronLeft, ChevronRight, Timer,
    Pause, Play
} from 'lucide-react';

export default function HealthTrackerDiscovery() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

    const trackerSlides = [
        {
            id: 'water',
            icon: Droplets,
            title: 'تتبع الماء 💧',
            subtitle: 'حافظ على ترطيب جسمك',
            description: 'سجل كمية الماء اليومية وتلقى تذكيرات ذكية للشرب',
            stat: '8 أكواب',
            statLabel: 'الهدف اليومي',
            gradient: 'from-cyan-500 via-teal-500 to-blue-500',
            iconColor: '#06B6D4',
            image: '/images/health-tracker/water.png'
        },
        {
            id: 'sleep',
            icon: Moon,
            title: 'تتبع النوم 🌙',
            subtitle: 'نم أفضل، عش أفضل',
            description: 'تحليل جودة نومك وتحسين عاداتك الليلية',
            stat: '7-9 ساعات',
            statLabel: 'النوم المثالي',
            gradient: 'from-violet-500 via-purple-500 to-indigo-500',
            iconColor: '#8B5CF6',
            image: '/images/health-tracker/sleep.png'
        },
        {
            id: 'meals',
            icon: Apple,
            title: 'تخطيط الوجبات 🥗',
            subtitle: 'تغذية صحية متوازنة',
            description: 'وصفات مخصصة لحالتك الصحية وتتبع السعرات',
            stat: '2000 سعرة',
            statLabel: 'السعرات اليومية',
            gradient: 'from-green-500 via-emerald-500 to-teal-500',
            iconColor: '#22C55E',
            image: '/images/health-tracker/meals.png'
        },
        {
            id: 'fasting',
            icon: Timer,
            title: 'الصيام المتقطع ⏱️',
            subtitle: 'جدد خلاياك بالصيام',
            description: 'مؤقت ذكي لفترات الصيام مع إحصائيات مفصلة',
            stat: '16:8',
            statLabel: 'النظام الشائع',
            gradient: 'from-amber-500 via-orange-500 to-yellow-500',
            iconColor: '#F59E0B',
            image: '/images/health-tracker/fasting.png'
        },
        {
            id: 'mental',
            icon: Brain,
            title: 'الصحة النفسية 🧠',
            subtitle: 'اهتم بصحتك الذهنية',
            description: 'تتبع مزاجك وتمارين تنفس مع جلسات تأمل',
            stat: 'يومياً',
            statLabel: 'تمارين التنفس',
            gradient: 'from-pink-500 via-rose-500 to-red-400',
            iconColor: '#EC4899',
            image: '/images/health-tracker/mental.png'
        },
        {
            id: 'activity',
            icon: Activity,
            title: 'النشاط البدني 🏃',
            subtitle: 'تحرك أكثر، عش أطول',
            description: 'سجل تمارينك وخطواتك مع تحليل اللياقة',
            stat: '10,000',
            statLabel: 'خطوة يومياً',
            gradient: 'from-red-500 via-rose-500 to-pink-500',
            iconColor: '#EF4444',
            image: '/images/health-tracker/activity.png'
        },
    ];

    // Auto-play logic
    const startAutoPlay = useCallback(() => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        autoPlayRef.current = setInterval(() => {
            if (!isPaused && !isHovered) {
                setCurrentIndex((prev) => (prev + 1) % trackerSlides.length);
            }
        }, 4000); // 4 seconds per slide
    }, [isPaused, isHovered, trackerSlides.length]);

    useEffect(() => {
        startAutoPlay();
        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [startAutoPlay]);

    // Navigation
    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        startAutoPlay();
    };

    const goNext = () => goToSlide((currentIndex + 1) % trackerSlides.length);
    const goPrev = () => goToSlide((currentIndex - 1 + trackerSlides.length) % trackerSlides.length);

    // Handle drag
    const handleDragEnd = (_: any, info: PanInfo) => {
        const threshold = 50;
        if (info.offset.x < -threshold) goNext();
        else if (info.offset.x > threshold) goPrev();
    };

    const slide = trackerSlides[currentIndex];
    const Icon = slide.icon;

    return (
        <section className="px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <motion.div
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg"
                        whileTap={{ scale: 0.9, rotate: -10 }}
                    >
                        <TrendingUp className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">متتبع صحتك 📊</h2>
                        <p className="text-xs text-slate-500">راقب صحتك يومياً بذكاء</p>
                    </div>
                </div>
                <Link href="/health-tracker">
                    <motion.div
                        className="flex items-center gap-1 text-emerald-600 text-sm font-medium"
                        whileTap={{ x: -5 }}
                    >
                        <span>اكتشف</span>
                        <ChevronLeft className="w-4 h-4" />
                    </motion.div>
                </Link>
            </div>

            {/* Carousel Container */}
            <div
                className="relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
            >
                {/* Main Carousel Slide */}
                <Link href="/health-tracker">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 80 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -80 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={handleDragEnd}
                            className="cursor-grab active:cursor-grabbing"
                        >
                            <motion.div
                                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${slide.gradient} min-h-[200px]`}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0">
                                    <Image
                                        src={slide.image}
                                        alt={slide.title}
                                        fill
                                        className="object-cover opacity-30"
                                        priority={currentIndex === 0}
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-80`} />
                                </div>

                                {/* Background Decorations */}
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

                                {/* Content */}
                                <div className="relative z-10 p-5 flex flex-col h-full min-h-[200px]">
                                    {/* Top Section */}
                                    <div className="flex items-start gap-4 mb-auto">
                                        {/* Icon */}
                                        <motion.div
                                            className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: 0.1, type: 'spring' }}
                                            whileTap={{ scale: 0.9, rotate: 10 }}
                                        >
                                            <Icon className="w-7 h-7 text-white" />
                                        </motion.div>

                                        {/* Text Content */}
                                        <div className="flex-1">
                                            <motion.h3
                                                className="text-xl font-bold text-white mb-1"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.15 }}
                                            >
                                                {slide.title}
                                            </motion.h3>
                                            <motion.p
                                                className="text-white/90 text-sm font-medium"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                {slide.subtitle}
                                            </motion.p>
                                        </div>

                                        {/* Slide Counter */}
                                        <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                                            <span className="text-white text-xs font-medium">
                                                {currentIndex + 1}/{trackerSlides.length}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <motion.p
                                        className="text-white/80 text-sm leading-relaxed my-3"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                    >
                                        {slide.description}
                                    </motion.p>

                                    {/* Bottom Stats */}
                                    <motion.div
                                        className="flex items-center justify-between mt-auto"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2">
                                            <span className="text-2xl font-bold text-white">{slide.stat}</span>
                                            <span className="text-white/70 text-xs block">{slide.statLabel}</span>
                                        </div>

                                        <motion.div
                                            className="bg-white/30 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <span className="text-white text-sm font-bold">ابدأ الآن</span>
                                            <ChevronLeft className="w-4 h-4 text-white" />
                                        </motion.div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </Link>

                {/* Navigation Controls */}
                <div className="flex items-center justify-center gap-3 mt-4">
                    {/* Prev Button */}
                    <motion.button
                        className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-slate-500"
                        whileHover={{ scale: 1.1, backgroundColor: '#f1f5f9' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.preventDefault(); goPrev(); }}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </motion.button>

                    {/* Dots */}
                    <div className="flex items-center gap-1.5">
                        {trackerSlides.map((_, index) => (
                            <motion.button
                                key={index}
                                className={`rounded-full transition-all ${index === currentIndex
                                        ? 'w-6 h-2 bg-gradient-to-r from-emerald-500 to-teal-500'
                                        : 'w-2 h-2 bg-slate-300'
                                    }`}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => { e.preventDefault(); goToSlide(index); }}
                            />
                        ))}
                    </div>

                    {/* Next Button */}
                    <motion.button
                        className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-slate-500"
                        whileHover={{ scale: 1.1, backgroundColor: '#f1f5f9' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.preventDefault(); goNext(); }}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </motion.button>

                    {/* Pause/Play */}
                    <motion.button
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${isPaused ? 'bg-emerald-500 text-white' : 'bg-white text-slate-500'
                            }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.preventDefault(); setIsPaused(!isPaused); }}
                    >
                        {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    </motion.button>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                    <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                            initial={{ width: '0%' }}
                            animate={{
                                width: isPaused || isHovered
                                    ? `${((currentIndex + 1) / trackerSlides.length) * 100}%`
                                    : '100%'
                            }}
                            transition={{
                                duration: isPaused || isHovered ? 0.3 : 4,
                                ease: 'linear'
                            }}
                            key={`${currentIndex}-${isPaused}-${isHovered}`}
                        />
                    </div>
                </div>
            </div>

            {/* Quick Feature Icons */}
            <div className="grid grid-cols-6 gap-2 mt-5">
                {trackerSlides.map((feature, index) => {
                    const FeatureIcon = feature.icon;
                    const isActive = index === currentIndex;
                    return (
                        <motion.button
                            key={index}
                            className={`relative p-3 rounded-2xl text-center transition-all ${isActive
                                    ? 'bg-gradient-to-br ' + feature.gradient + ' shadow-lg'
                                    : 'bg-white dark:bg-slate-800 border border-slate-100'
                                }`}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => goToSlide(index)}
                        >
                            <FeatureIcon
                                className={`w-5 h-5 mx-auto ${isActive ? 'text-white' : ''}`}
                                style={{ color: isActive ? undefined : feature.iconColor }}
                            />
                            {isActive && (
                                <motion.div
                                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                                    layoutId="activeIndicator"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </section>
    );
}
