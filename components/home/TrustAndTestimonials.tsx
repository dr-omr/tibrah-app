// components/home/TrustAndTestimonials.tsx
// Combined social proof + methodology — compact, powerful trust builder
// Merges old SocialProof + TrustSection into one focused component

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, Shield, Heart, Users, Sparkles, Award } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { haptic } from '@/lib/HapticFeedback';

const testimonials = [
    { name: 'أم عبدالرحمن', text: 'بعد 3 شهور مع الدكتور عمر، حالتي تحسنت بشكل كبير. فهم مشكلتي من أصلها وعالجها.', condition: 'مشاكل هضمية', initial: 'أم', color: 'from-rose-400 to-pink-500' },
    { name: 'صالح اليافعي', text: 'الترددات الشفائية غيرت حياتي. صرت أنام أحسن وطاقتي زادت بشكل ملحوظ.', condition: 'مشاكل نوم', initial: 'صا', color: 'from-blue-400 to-indigo-500' },
    { name: 'نورة المطيري', text: 'أخيراً لقيت دكتور يفهم الطب الوظيفي صح. النتايج رهيبة والمتابعة ممتازة.', condition: 'خلل هرموني', initial: 'نو', color: 'from-violet-400 to-purple-500' },
    { name: 'أبو فهد', text: 'كنت أعاني من تعب دايم، الدكتور عمر عرف السبب الحقيقي. الحمدلله تعافيت.', condition: 'تعب مزمن', initial: 'أب', color: 'from-teal-400 to-emerald-500' },
    { name: 'سعيد القحطاني', text: 'برنامج التنظيف كان نقطة تحول لي. حسيت بفرق كبير في طاقتي وصحتي.', condition: 'سموم متراكمة', initial: 'سع', color: 'from-amber-400 to-orange-500' },
];

const methodology = [
    { icon: Shield, title: 'نعالج السبب مش العرض', step: '١' },
    { icon: Heart, title: 'خطة خاصة لجسمك', step: '٢' },
    { icon: Users, title: 'متابعة مستمرة معاك', step: '٣' },
];



const partners = [
    { name: 'وزارة الصحة', logo: '🏥' },
    { name: 'منظمة الصحة', logo: '🌐' },
    { name: 'جمعية الطب', logo: '⚕️' },
    { name: 'جامعة صنعاء', logo: '🎓' },
    { name: 'المجلس الطبي', logo: '📋' },
];

// Animated counter
function useAnimatedCounter(target: number, isVisible: boolean) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!isVisible) return;
        const startTime = performance.now();
        const animate = (now: number) => {
            const progress = Math.min((now - startTime) / 1500, 1);
            setCount(Math.round(target * (1 - Math.pow(1 - progress, 3))));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [isVisible, target]);
    return count;
}

export default function TrustAndTestimonials() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    // Intersection observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
            { threshold: 0.15 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    // Auto-rotate testimonials
    useEffect(() => {
        if (!isAutoPlaying) return;
        const timer = setInterval(() => setActiveIndex(prev => (prev + 1) % testimonials.length), 5000);
        return () => clearInterval(timer);
    }, [isAutoPlaying]);

    const counter300 = useAnimatedCounter(300, isVisible);
    const counter87 = useAnimatedCounter(87, isVisible);
    const counter2000 = useAnimatedCounter(2000, isVisible);

    return (
        <section ref={sectionRef} className="px-5">
            {/* ━━━ PART 1: Animated Stats Bar ━━━ */}
            <div className="grid grid-cols-3 gap-2.5 mb-6">
                {[
                    { value: `+${counter300.toLocaleString('ar-SA')}`, label: 'شخص تعافى', icon: Users, gradient: 'from-teal-500 to-emerald-500' },
                    { value: `${counter87.toLocaleString('ar-SA')}%`, label: 'نسبة التحسّن', icon: Sparkles, gradient: 'from-violet-500 to-purple-500' },
                    { value: `+${counter2000.toLocaleString('ar-SA')}`, label: 'ساعة محتوى', icon: Award, gradient: 'from-amber-500 to-orange-500' },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 15 }}
                            animate={isVisible ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.1 + i * 0.1, type: 'spring' as const, stiffness: 300, damping: 25 }}
                            className="text-center p-3.5 card-tibrah hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className={`w-8 h-8 mx-auto mb-1.5 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                                <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-base font-extrabold text-slate-800 dark:text-white tabular-nums">{stat.value}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{stat.label}</div>
                        </motion.div>
                    );
                })}
            </div>

            {/* ━━━ NEW: Trusted By Marquee ━━━ */}
             <div className="mb-8 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                <p className="text-center text-[10.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">شركاء النجاح والثقة</p>
                <div className="relative flex overflow-hidden w-full bg-slate-50/50 dark:bg-slate-900/20 py-3.5 rounded-[28px] border border-slate-200/60 dark:border-white/[0.04]">
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-[#0F172A] to-transparent z-10" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-[#0F172A] to-transparent z-10" />
                    
                    <motion.div 
                        className="flex whitespace-nowrap gap-6 px-4"
                        animate={{ x: [0, -1000] }}
                        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    >
                        {/* Double the array for seamless loop */}
                        {[...partners, ...partners].map((partner, i) => (
                            <div key={i} className="flex items-center gap-2 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                                <span className="text-xl">{partner.logo}</span>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{partner.name}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* ━━━ PART 2: Testimonials Carousel ━━━ */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                            <Star className="w-4 h-4 text-white fill-white" />
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-200">شهادات اللي تعافوا</h3>
                    </div>
                    <div className="flex gap-1.5">
                        <Button variant="outline" size="icon" className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700"
                            onClick={() => { haptic.selection(); setIsAutoPlaying(false); setActiveIndex(prev => prev > 0 ? prev - 1 : testimonials.length - 1); setTimeout(() => setIsAutoPlaying(true), 10000); }}>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                        </Button>
                        <Button variant="outline" size="icon" className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700"
                            onClick={() => { haptic.selection(); setIsAutoPlaying(false); setActiveIndex(prev => prev < testimonials.length - 1 ? prev + 1 : 0); setTimeout(() => setIsAutoPlaying(true), 10000); }}>
                            <ChevronLeft className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                        </Button>
                    </div>
                </div>

                <div className="card-tibrah p-5 relative overflow-hidden transition-all duration-300">
                    <Quote className="absolute top-3 left-3 w-6 h-6 text-primary/15" />

                    <div className="flex gap-0.5 mb-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -15 }}
                            transition={{ duration: 0.25 }}
                        >
                            <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed mb-3 font-semibold">
                                "{testimonials[activeIndex].text}"
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${testimonials[activeIndex].color} flex items-center justify-center shadow-sm`}>
                                        <span className="text-white text-[10px] font-bold">{testimonials[activeIndex].initial}</span>
                                    </div>
                                    <div>
                                        <p className="font-extrabold text-slate-800 dark:text-white text-xs">{testimonials[activeIndex].name}</p>
                                        <p className="text-[10px] text-slate-400">{testimonials[activeIndex].condition}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {testimonials.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`rounded-full transition-all cursor-pointer ${i === activeIndex ? 'bg-amber-500 w-4 h-1.5' : 'bg-slate-200 dark:bg-slate-700 w-1.5 h-1.5 hover:bg-slate-300'}`}
                                            onClick={() => { haptic.selection(); setActiveIndex(i); setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 10000); }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* ━━━ PART 3: Methodology — Compact 3 Pillars ━━━ */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 px-1">
                    <Shield className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300">كيف نعالجك</h3>
                </div>
                <div className="flex gap-2.5">
                    {methodology.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 15 }}
                                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 0.3 + i * 0.1, type: 'spring' as const, stiffness: 350, damping: 25 }}
                                className="flex-1 text-center p-3.5 card-tibrah hover:-translate-y-1 transition-transform duration-300"
                            >
                                <div className="w-9 h-9 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Icon className="w-4.5 h-4.5 text-primary" />
                                </div>
                                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200 leading-snug">{item.title}</p>
                                <span className="text-[9px] text-primary/50 font-bold">خطوة {item.step}</span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

        </section>
    );
}
