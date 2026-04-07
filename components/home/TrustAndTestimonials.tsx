// components/home/TrustAndTestimonials.tsx
// Story-card testimonials + doctor reply + animated stats + methodology

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, Shield, Heart, Users, Sparkles, Award, CheckCircle, Stethoscope, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';

const testimonials = [
    {
        name: 'أم عبدالرحمن',
        text: 'بعد 3 شهور مع الدكتور عمر، حالتي تحسنت بشكل كبير. فهم مشكلتي من أصلها وعالجها بخطة مخصصة.',
        condition: 'مشاكل هضمية',
        initial: 'أم',
        color: 'from-rose-400 to-pink-500',
        accentColor: '#f43f5e',
        doctorReply: 'الحمد لله، حالتك كانت تستجيب بشكل ممتاز للعلاج الوظيفي. استمري على النظام الغذائي.',
        rating: 5,
        months: 3,
    },
    {
        name: 'صالح اليافعي',
        text: 'الترددات الشفائية غيرت حياتي. صرت أنام أحسن وطاقتي زادت بشكل ملحوظ خلال الشهر الأول.',
        condition: 'مشاكل نوم',
        initial: 'صا',
        color: 'from-blue-400 to-indigo-500',
        accentColor: '#6366f1',
        doctorReply: 'النوم العميق مرتبط مباشرة بتوازن الكورتيزول — البروتوكول نجح لأنك التزمت.',
        rating: 5,
        months: 2,
    },
    {
        name: 'نورة المطيري',
        text: 'أخيراً لقيت دكتور يفهم الطب الوظيفي صح. النتايج رهيبة والمتابعة ممتازة.',
        condition: 'خلل هرموني',
        initial: 'نو',
        color: 'from-violet-400 to-purple-500',
        accentColor: '#8b5cf6',
        doctorReply: 'الخلل الهرموني يحتاج صبر — لكن جسمك الآن في مسار التوازن الحقيقي.',
        rating: 5,
        months: 4,
    },
    {
        name: 'أبو فهد',
        text: 'كنت أعاني من تعب دايم، الدكتور عمر عرف السبب الحقيقي. الحمدلله تعافيت بعد 6 أسابيع.',
        condition: 'تعب مزمن',
        initial: 'أب',
        color: 'from-teal-400 to-emerald-500',
        accentColor: '#10b981',
        doctorReply: 'التعب المزمن غالباً مرتبط بعدة عوامل — اكتشفنا السبب الجذري وعالجناه.',
        rating: 5,
        months: 2,
    },
];

const methodology = [
    { icon: Shield, title: 'نعالج السبب مش العرض', desc: 'تحليل شامل لجذر المشكلة', step: '١', color: '#0d9488' },
    { icon: Heart, title: 'خطة خاصة لجسمك', desc: 'بروتوكول علاجي مخصص', step: '٢', color: '#e11d48' },
    { icon: Users, title: 'متابعة مستمرة معاك', desc: 'دعم حتى التعافي الكامل', step: '٣', color: '#7c3aed' },
];

const partners = [
    { name: 'وزارة الصحة', logo: '🏥' },
    { name: 'منظمة الصحة العالمية', logo: '🌐' },
    { name: 'جمعية الطب الوظيفي', logo: '⚕️' },
    { name: 'جامعة صنعاء', logo: '🎓' },
    { name: 'المجلس الطبي', logo: '📋' },
];

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
    const [showDoctorReply, setShowDoctorReply] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
            { threshold: 0.15 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isAutoPlaying) return;
        const timer = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % testimonials.length);
            setShowDoctorReply(false);
        }, 6000);
        return () => clearInterval(timer);
    }, [isAutoPlaying]);

    const goTo = (i: number) => {
        haptic.selection(); uiSounds.select();
        setActiveIndex(i); setShowDoctorReply(false);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 12000);
    };

    const counter300 = useAnimatedCounter(300, isVisible);
    const counter87 = useAnimatedCounter(87, isVisible);
    const counter2000 = useAnimatedCounter(2000, isVisible);

    const t = testimonials[activeIndex];

    return (
        <div ref={sectionRef} className="px-5 space-y-6">

            {/* ── Animated Stats Bar ── */}
            <div className="grid grid-cols-3 gap-2.5">
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
                            className="text-center p-3.5 card-tibrah"
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

            {/* ── Trusted By Marquee ── */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/50">
                <p className="text-center text-[10.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">شركاء النجاح والثقة</p>
                <div className="relative flex overflow-hidden w-full bg-slate-50/50 dark:bg-slate-900/20 py-3.5 rounded-[28px] border border-slate-200/60 dark:border-white/[0.04]">
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-[#0F172A] to-transparent z-10" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-[#0F172A] to-transparent z-10" />
                    <motion.div className="flex whitespace-nowrap gap-6 px-4" animate={{ x: [0, -800] }} transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}>
                        {[...partners, ...partners].map((partner, i) => (
                            <div key={i} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-all duration-300">
                                <span className="text-xl">{partner.logo}</span>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{partner.name}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* ── Story-Style Testimonial Card ── */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                            <Star className="w-4 h-4 text-white fill-white" />
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-200">شهادات اللي تعافوا</h3>
                    </div>
                    {/* Navigation */}
                    <div className="flex items-center gap-2">
                        <button onClick={() => goTo(activeIndex > 0 ? activeIndex - 1 : testimonials.length - 1)} className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => goTo(activeIndex < testimonials.length - 1 ? activeIndex + 1 : 0)} className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Story Card */}
                <div className="relative overflow-hidden rounded-3xl border border-slate-100 dark:border-white/[0.06] bg-white dark:bg-slate-900/60 shadow-sm">
                    {/* Colored top accent */}
                    <AnimatePresence mode="wait">
                        <motion.div key={activeIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className={`h-1 bg-gradient-to-r ${t.color}`} />
                    </AnimatePresence>

                    <div className="p-5">
                        <Quote className="w-6 h-6 mb-2" style={{ color: `${t.accentColor}30` }} />

                        {/* Stars */}
                        <div className="flex gap-0.5 mb-3">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div key={activeIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                                <p className="text-[13.5px] text-slate-600 dark:text-slate-300 leading-relaxed mb-4 font-medium">"{t.text}"</p>

                                {/* User info */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center shadow-sm relative`}>
                                            <span className="text-white text-[11px] font-black">{t.initial}</span>
                                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                                                <CheckCircle className="w-3 h-3 text-emerald-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-slate-800 dark:text-white text-sm">{t.name}</p>
                                            <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: t.accentColor }} />
                                                {t.condition} · {t.months} شهور علاج
                                            </p>
                                        </div>
                                    </div>
                                    {/* Dots */}
                                    <div className="flex gap-1.5">
                                        {testimonials.map((_, i) => (
                                            <button key={i} onClick={() => goTo(i)} className="rounded-full transition-all duration-300" style={{ width: i === activeIndex ? 16 : 6, height: 6, backgroundColor: i === activeIndex ? t.accentColor : '#e2e8f0' }} />
                                        ))}
                                    </div>
                                </div>

                                {/* Doctor Reply Toggle */}
                                <button
                                    onClick={() => { setShowDoctorReply(!showDoctorReply); haptic.tap(); }}
                                    className="flex items-center gap-2 text-[11px] font-bold w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                                >
                                    <Stethoscope className="w-3.5 h-3.5" />
                                    {showDoctorReply ? 'إخفاء رد الدكتور' : 'رد د. عمر على هذه الحالة'}
                                    <MessageCircle className="w-3 h-3 mr-auto" />
                                </button>

                                <AnimatePresence>
                                    {showDoctorReply && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-3 p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-500/20">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center">
                                                        <Stethoscope className="w-3 h-3 text-white" />
                                                    </div>
                                                    <span className="text-[11px] font-black text-teal-700 dark:text-teal-400">د. عمر العماد</span>
                                                    <span className="text-[9px] text-teal-500 bg-teal-100 dark:bg-teal-900/40 px-1.5 py-0.5 rounded-full font-bold">طبيب معالج</span>
                                                </div>
                                                <p className="text-[12px] text-teal-700 dark:text-teal-300 leading-relaxed font-medium">{t.doctorReply}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* ── Methodology — 3 Pillars ── */}
            <div>
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
                                <div className="w-9 h-9 mx-auto mb-2 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${item.color}15` }}>
                                    <Icon className="w-4 h-4" style={{ color: item.color }} />
                                </div>
                                <p className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 leading-snug mb-1">{item.title}</p>
                                <p className="text-[9px] text-slate-400 font-medium">{item.desc}</p>
                                <span className="text-[9px] font-black mt-1 block" style={{ color: item.color }}>خطوة {item.step}</span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
