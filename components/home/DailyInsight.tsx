// components/home/DailyInsight.tsx
// Premium auto-rotating health insights — mini carousel with slide transitions

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Droplets, Moon, Heart, TrendingUp, Leaf, Brain, Flame, Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { haptic } from '@/lib/HapticFeedback';
import { toast } from 'sonner';

const insights = [
    {
        icon: Droplets,
        text: 'اشرب ماي بانتظام — يحسّن تركيزك وطاقتك لحد ٣٠٪',
        bgClass: 'from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/15',
        iconBgClass: 'from-cyan-400 to-blue-500',
        borderClass: 'border-cyan-100/60 dark:border-cyan-800/30',
        link: '/health-tracker',
        color: '#0ea5e9',
    },
    {
        icon: Moon,
        text: 'نام ٧-٩ ساعات — يقوي مناعتك ويسرّع تعافي جسمك',
        bgClass: 'from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/15',
        iconBgClass: 'from-indigo-400 to-purple-500',
        borderClass: 'border-indigo-100/60 dark:border-indigo-800/30',
        link: '/health-tracker',
        color: '#8b5cf6',
    },
    {
        icon: Heart,
        text: 'سجّل أعراضك يومياً — يساعد د. عمر يفهم حالتك أحسن ٣×',
        bgClass: 'from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/15',
        iconBgClass: 'from-rose-400 to-pink-500',
        borderClass: 'border-rose-100/60 dark:border-rose-800/30',
        link: '/symptom-analysis',
        color: '#f43f5e',
    },
    {
        icon: TrendingUp,
        text: 'امشي ٣٠ دقيقة كل يوم — يقلل الالتهابات بنسبة ٤٠٪',
        bgClass: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/15',
        iconBgClass: 'from-emerald-400 to-teal-500',
        borderClass: 'border-emerald-100/60 dark:border-emerald-800/30',
        link: '/health-tracker',
        color: '#10b981',
    },
    {
        icon: Leaf,
        text: 'تنفس بعمق ٥ دقايق — يخفض التوتر ويهدي أعصابك',
        bgClass: 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/15',
        iconBgClass: 'from-green-400 to-emerald-500',
        borderClass: 'border-green-100/60 dark:border-green-800/30',
        link: '/breathe',
        color: '#22c55e',
    },
    {
        icon: Brain,
        text: 'الضغط النفسي الدايم يسبب ٧٠٪ من الأمراض المزمنة حسب منظمة الصحة',
        bgClass: 'from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/15',
        iconBgClass: 'from-violet-400 to-purple-500',
        borderClass: 'border-violet-100/60 dark:border-violet-800/30',
        link: '/symptom-analysis',
        color: '#8b5cf6',
    },
    {
        icon: Flame,
        text: 'الصيام ١٦ ساعة يجدد خلايا جسمك ويعزز الالتهام الذاتي',
        bgClass: 'from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/15',
        iconBgClass: 'from-orange-400 to-red-500',
        borderClass: 'border-orange-100/60 dark:border-red-800/30',
        link: '/health-tracker',
        color: '#f97316',
    },
];

export default function DailyInsight() {
    const ROTATION_INTERVAL = 8000; // 8 seconds
    const dayOfYear = useMemo(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }, []);

    // Show 3 insights starting from today's index
    const visibleInsights = useMemo(() => {
        const start = dayOfYear % insights.length;
        return [0, 1, 2].map(offset => insights[(start + offset) % insights.length]);
    }, [dayOfYear]);

    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Start/restart auto-rotate timer
    useEffect(() => {
        if (isPaused) return;
        const id = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % visibleInsights.length);
        }, ROTATION_INTERVAL);
        timerRef.current = id;
        return () => clearInterval(id);
    }, [visibleInsights.length, isPaused, activeIndex]);

    const handleDotClick = (index: number) => {
        setActiveIndex(index);
        haptic.selection();
    };

    const handleShare = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();
        haptic.selection();
        
        const text = `نصيحة طِبرَا اليوم:\n"${current.text}"\n\nحمل تطبيق طِبرَا لرحلة تعافي متكاملة 🌱`;
        
        if (navigator.share) {
            navigator.share({
                title: 'نصيحة طِبرَا الطبية',
                text: text,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(text);
            toast.success('تم نسخ النصيحة!');
        }
    };

    const current = visibleInsights[activeIndex];
    const Icon = current.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="px-5 mt-6"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
        >
            <Link href={current.link} className="block active:scale-[0.98] transition-transform">
                <div className="card-tibrah relative overflow-hidden transition-all duration-300">
                    {/* Decorative Background Blob */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-[0.08] blur-3xl transition-colors duration-1000" style={{ background: current.color || '#0d9488' }} />

                    <div className="p-4 relative z-10">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-3.5 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full" />
                                <span className="text-[12px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    هل تعلم؟
                                </span>
                            </div>
                            
                            <button 
                                onClick={handleShare}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-700/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                aria-label="مشاركة النصيحة"
                            >
                                <Share2 className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Content Carousel */}
                        <div className="min-h-[70px]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeIndex}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.05 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="flex items-start gap-3.5"
                                >
                                    {/* Dynamic Icon */}
                                    <div className={`w-12 h-12 rounded-3xl bg-gradient-to-br ${current.iconBgClass} flex items-center justify-center shadow-md shadow-black/5 flex-shrink-0 relative overflow-hidden`}>
                                        <div className="absolute inset-0 bg-white/20 dark:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Icon className="w-6 h-6 text-white drop-shadow-sm" />
                                    </div>
                                    
                                    <div className="flex-1 mt-0.5">
                                        <p className="text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed font-bold">
                                            {current.text}
                                        </p>
                                        <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-slate-400">
                                            <span>اعرف أكثر</span>
                                            <ArrowLeft className="w-3 h-3" />
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        
                        {/* Progress Bar & Dots */}
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                            {/* Animated Progress Bar */}
                            <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div 
                                    key={`${activeIndex}-${isPaused ? 'paused' : 'playing'}`}
                                    initial={{ width: isPaused ? '100%' : '0%' }}
                                    animate={{ width: isPaused ? '100%' : '100%' }}
                                    transition={{ 
                                        duration: isPaused ? 0 : ROTATION_INTERVAL / 1000, 
                                        ease: "linear" 
                                    }}
                                    className="h-full bg-slate-300 dark:bg-slate-500 rounded-full"
                                    style={{
                                        background: isPaused ? '#cbd5e1' : current.color
                                    }}
                                />
                            </div>
                            
                            {/* Pagination dots */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                {visibleInsights.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => { e.preventDefault(); handleDotClick(i); }}
                                        className={`rounded-full transition-all ${
                                            i === activeIndex
                                                ? 'w-4 h-1.5'
                                                : 'w-1.5 h-1.5 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300'
                                        }`}
                                        style={{ backgroundColor: i === activeIndex ? current.color : undefined }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
