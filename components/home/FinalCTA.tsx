// components/home/FinalCTA.tsx
// Premium conversion engine — rich dark card with social proof, animated testimonials, urgency system

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Calendar, ArrowLeft, Shield, MessageCircle, Clock, Sparkles, Heart, Star, Users, Activity, CheckCircle, TrendingUp, Stethoscope, Award, Brain, Phone, Zap, Timer } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';

/* ═══════════════════════════════════════
   ANIMATED TRUST COUNTER
   ═══════════════════════════════════════ */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);

    return (
        <motion.span
            onViewportEnter={() => {
                if (hasAnimated) return;
                setHasAnimated(true);
                let current = 0;
                const step = Math.max(1, Math.floor(target / 40));
                const interval = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        setCount(target);
                        clearInterval(interval);
                    } else {
                        setCount(current);
                    }
                }, 30);
            }}
            className="tabular-nums"
        >
            {count}{suffix}
        </motion.span>
    );
}

/* ═══════════════════════════════════════
   COUNTDOWN TIMER — till end of day
   ═══════════════════════════════════════ */
function CountdownTimer() {
    const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
    useEffect(() => {
        const calc = () => {
            const now = new Date();
            const end = new Date();
            end.setHours(23, 59, 59, 999);
            const diff = end.getTime() - now.getTime();
            setTimeLeft({
                h: Math.floor(diff / 3600000),
                m: Math.floor((diff % 3600000) / 60000),
                s: Math.floor((diff % 60000) / 1000),
            });
        };
        calc();
        const t = setInterval(calc, 1000);
        return () => clearInterval(t);
    }, []);
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
        <div className="flex items-center gap-1 font-black tabular-nums text-emerald-100" dir="ltr">
            {[pad(timeLeft.h), pad(timeLeft.m), pad(timeLeft.s)].map((v, i) => (
                <React.Fragment key={i}>
                    <motion.span key={v} initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} className="text-[13px] bg-white/10 rounded-lg px-1.5 py-0.5 min-w-[26px] text-center">{v}</motion.span>
                    {i < 2 && <span className="text-emerald-400/50 text-[12px]">:</span>}
                </React.Fragment>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════
   FLOATING TESTIMONIAL CARD
   ═══════════════════════════════════════ */
function TestimonialRotator() {

    const testimonials = [
        { name: 'أحمد', text: 'بعد ٣ أشهر تغيرت حياتي — الحمد لله', rating: 5 },
        { name: 'سارة', text: 'الدكتور عمر فهم حالتي من أول جلسة', rating: 5 },
        { name: 'محمد', text: 'أخيراً لقيت اللي يعالج السبب مش العرض', rating: 5 },
        { name: 'نورة', text: 'أفضل تجربة طبية مريت عليها بصراحة', rating: 5 },
        { name: 'خالد', text: 'النتائج بعد شهرين كانت مذهلة فعلاً', rating: 5 },
    ];

    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % testimonials.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const t = testimonials[current];

    return (
        <div className="relative h-[68px]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0 bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-xl p-3"
                >
                    <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400/20 to-teal-400/20 flex items-center justify-center flex-shrink-0 border border-white/[0.08]">
                            <span className="text-[12px] font-black text-emerald-200">{t.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[11px] font-bold text-white/80">{t.name}</span>
                                <div className="flex gap-0.5">
                                    {[...Array(t.rating)].map((_, i) => (
                                        <Star key={i} className="w-2.5 h-2.5 text-amber-400" fill="#fbbf24" />
                                    ))}
                                </div>
                            </div>
                            <p className="text-[11px] text-white/50 leading-relaxed truncate">{t.text}</p>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {testimonials.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1 rounded-full transition-all duration-300 ${i === current ? 'w-4 bg-emerald-400' : 'w-1 bg-white/20'}`}
                    />
                ))}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════
   MAIN FINAL CTA COMPONENT
   ═══════════════════════════════════════ */
export default function FinalCTA() {
    const [urgentText, setUrgentText] = useState('باقي 3 مواعيد بس هالأسبوع');

    // 3D Tilt State for the Massive CTA Card
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["3.5deg", "-3.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-3.5deg", "3.5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        x.set(mouseX / width - 0.5);
        y.set(mouseY / height - 0.5);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour > 18) {
            setUrgentText('احجز الحين قبل ما يمتلي جدول بكرة');
        } else if (hour < 12) {
            setUrgentText('مواعيد الصباح تخلص بسرعة');
        } else {
            setUrgentText('باقي مواعيد قليلة هالأسبوع');
        }
    }, []);

    return (
        <section className="px-5 py-6">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="perspective-[1200px]"
            >
                <motion.div
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseLeave}
                    className="relative overflow-hidden rounded-3xl text-center shadow-[0_16px_40px_rgba(4,47,46,0.3)] border border-emerald-900/30"
                    style={{
                        background: 'linear-gradient(145deg, #042f2e 0%, #064e3b 30%, #065f46 60%, #047857 100%)',
                        rotateX,
                        rotateY,
                        transformStyle: 'preserve-3d'
                    }}
                >
                    {/* ═══ Rich Decorative Layer ═══ */}
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl" style={{ background: 'rgba(16,185,129,0.12)' }} />
                    <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full blur-3xl" style={{ background: 'rgba(99,102,241,0.08)' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl" style={{ background: 'rgba(45,212,191,0.05)' }} />
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />

                    {/* ═══ Main Content ═══ */}
                    <div className="relative z-10 p-6 pb-5">

                        {/* Top Trust Metrics Row */}
                        <div className="flex items-center justify-center gap-4 mb-5">
                            {[
                                { value: 300, suffix: '+', label: 'مريض', icon: Users },
                                { value: 87, suffix: '%', label: 'تحسن', icon: TrendingUp },
                                { value: 15, suffix: '+', label: 'سنة', icon: Award },
                            ].map((m, i) => (
                                <div key={m.label} className="flex flex-col items-center gap-0.5">
                                    <div className="flex items-center gap-1">
                                        <m.icon className="w-3 h-3 text-emerald-400/60" />
                                        <span className="text-[16px] font-black text-white">
                                            <AnimatedCounter target={m.value} suffix={m.suffix} />
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-bold text-white/30">{m.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Badge */}
                        <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 mb-5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Shield className="w-3.5 h-3.5 text-emerald-300" />
                            <span className="text-[11px] text-emerald-200 font-bold">الجلسة الأولى بس ٣٠٠ ر.ي</span>
                        </div>

                        {/* Main Heading */}
                        <h2 className="text-[22px] font-extrabold text-white mb-2 leading-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                            جاهز تبدأ رحلتك مع صحتك؟
                        </h2>
                        <p className="text-[13px] text-white/50 font-medium mb-5 max-w-xs mx-auto leading-relaxed">
                            نوصل لأصل المشكلة ونعالج السبب الحقيقي، مش بس نسكّن الأعراض
                        </p>

                        {/* Urgency Bar with Countdown */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-emerald-900/40 border border-emerald-400/20 backdrop-blur-md rounded-2xl py-2.5 px-4 mb-5 shadow-inner"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                                        <Clock className="w-4 h-4 text-emerald-300" />
                                    </motion.div>
                                    <span className="text-[11px] font-bold text-emerald-100">{urgentText}</span>
                                </div>
                                <CountdownTimer />
                            </div>
                        </motion.div>

                        {/* Testimonial Rotator */}
                        <div className="mb-8">
                            <TestimonialRotator />
                        </div>

                        {/* ═══ CTA Buttons ═══ */}
                        <div className="flex gap-2.5 max-w-sm mx-auto">
                            <Link href={createPageUrl('BookAppointment')} className="flex-1" onClick={() => { haptic.success(); uiSounds.navigate(); }}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.96 }}
                                    className="w-full h-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-extrabold transition-all relative overflow-hidden group"
                                    style={{ background: 'white', color: '#047857', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-100/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />

                                    <Calendar className="w-4 h-4 z-10" />
                                    <span className="z-10">احجز جلستك</span>
                                    <motion.div
                                        animate={{ x: [0, -4, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                        className="z-10 bg-emerald-50 rounded-full p-1 border border-emerald-100/50"
                                    >
                                        <ArrowLeft className="w-3 h-3" />
                                    </motion.div>
                                </motion.button>
                            </Link>
                            <a
                                href="https://wa.me/967771447111?text=السلام%20عليكم%20دكتور%20عمر%20أبغى%20أحجز%20جلسة"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => haptic.selection()}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.96 }}
                                    className="flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl text-[13px] font-bold transition-colors h-full"
                                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    واتساب
                                </motion.button>
                            </a>
                        </div>

                        {/* WhatsApp Quick Chat Preview */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="mt-5 flex items-center justify-center gap-2"
                        >
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-900/30 border border-green-500/15">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <Phone className="w-3 h-3 text-green-400/70" />
                                <span className="text-[10px] font-bold text-green-300/70">الدكتور متواجد الآن — رد سريع</span>
                            </div>
                        </motion.div>

                        {/* Process Steps */}
                        <div className="mt-5 flex items-center justify-center gap-3">
                            {[
                                { icon: Brain, label: 'تقييم' },
                                { icon: Stethoscope, label: 'استشارة' },
                                { icon: CheckCircle, label: 'علاج' },
                            ].map((step, i) => (
                                <React.Fragment key={step.label}>
                                    <div className="flex items-center gap-1">
                                        <div className="w-5 h-5 rounded-md bg-white/[0.06] flex items-center justify-center">
                                            <step.icon className="w-2.5 h-2.5 text-emerald-300/60" />
                                        </div>
                                        <span className="text-[9px] font-bold text-white/30">{step.label}</span>
                                    </div>
                                    {i < 2 && <ArrowLeft className="w-2.5 h-2.5 text-white/15" />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Footer trust line */}
                    <div className="relative z-10 flex items-center justify-center gap-1.5 pb-5 mt-2" style={{ transform: 'translateZ(10px)' }}>
                        <Shield className="w-3 h-3 text-emerald-300 opacity-50" />
                        <p className="text-white/30 text-[9px] max-w-xs mx-auto font-medium">
                            المعلومات هنا للتثقيف بس ولا تغني عن زيارة الطبيب
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}
