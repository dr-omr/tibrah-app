import React, { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, ArrowRight, Brain, CheckCircle2, 
    Crown, Heart, Shield, Sparkles, Star, Stethoscope, 
    TrendingUp, ArrowUpRight, Zap, Target
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { createPageUrl } from '@/utils';

// ═══ ANIMATED COUNTER ═══
function TrustCounter({ end, label, suffix = '', icon: Icon }: any) {
    const [count, setCount] = useState(0);
    const [hasTriggered, setHasTriggered] = useState(false);

    return (
        <motion.div 
            onViewportEnter={() => {
                if (hasTriggered) return;
                setHasTriggered(true);
                let current = 0;
                const totalSteps = 40;
                const stepVal = Math.max(1, Math.floor(end / totalSteps));
                const interval = setInterval(() => {
                    current += stepVal;
                    if (current >= end) {
                        setCount(end);
                        clearInterval(interval);
                    } else { setCount(current); }
                }, 40);
            }}
            className="flex flex-col items-center justify-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all group"
        >
            <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/40 dark:to-emerald-900/40 flex items-center justify-center mb-4 border border-teal-100 dark:border-teal-800 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                <Icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-4xl font-black text-slate-800 dark:text-white mb-1.5 tracking-tighter" dir="ltr">
                {count}{suffix}
            </div>
            <div className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{label}</div>
        </motion.div>
    );
}

// ═══ INTERACTIVE CARE FINDER ═══
function CarePathfinder() {
    const [step, setStep] = useState(0);
    const [goal, setGoal] = useState<string | null>(null);

    const goals = [
        { id: 'chronic', label: 'علاج مرض مزمن', icon: Activity, desc: 'ضغط، سكري، غدة، روماتيزم' },
        { id: 'fatigue', label: 'تعب دائم وإرهاق', icon: Zap, desc: 'خمول، صعوبة تركيز، نقص طاقة' },
        { id: 'weight', label: 'مقاومة نزول الوزن', icon: Target, desc: 'ثبات الوزن، مقاومة إنسولين' },
        { id: 'mental', label: 'قلق واكتئاب', icon: Brain, desc: 'ضغوط نفسية، ارتباط جسدي' }
    ];

    return (
        <div className="bg-white/90 dark:bg-[#0B1121]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-[48px] p-8 md:p-12 max-w-2xl mx-auto relative overflow-hidden shadow-[0_20px_60px_rgb(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgb(0,0,0,0.4)]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/30 dark:to-purple-500/30 flex items-center justify-center border border-indigo-500/20">
                        <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">دليلك الذكي للرعاية</h3>
                        <p className="text-xs text-slate-500 font-bold tracking-wide">مدعوم بالذكاء الاصطناعي</p>
                    </div>
                </div>
                
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div key="step0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                            <p className="text-slate-600 dark:text-slate-300 text-lg font-bold mb-6">ما هو الهدف الرئيسي الذي تسعى لتحقيقه من خلال زيارتك؟</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {goals.map(g => (
                                    <button
                                        key={g.id}
                                        onClick={() => { haptic.selection(); setGoal(g.id); setTimeout(() => setStep(1), 300); }}
                                        className={`p-5 rounded-[24px] border-2 text-right transition-all group ${
                                            goal === g.id 
                                            ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500' 
                                            : 'bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500/50'
                                        }`}
                                    >
                                        <g.icon className={`w-8 h-8 mb-4 ${goal === g.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                                        <h4 className="text-base font-black text-slate-800 dark:text-white mb-1.5">{g.label}</h4>
                                        <p className="text-xs text-slate-500 font-medium">{g.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                    
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-center py-8">
                            <div className="w-24 h-24 rounded-[32px] bg-gradient-to-tr from-teal-400 to-emerald-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-teal-500/30">
                                <CheckCircle2 className="w-12 h-12 text-white" />
                            </div>
                            <h4 className="text-3xl font-black text-slate-800 dark:text-white mb-4">الرعاية الشمولية هي الأنسب لك!</h4>
                            <p className="text-base text-slate-500 dark:text-slate-400 mb-10 max-w-md mx-auto leading-relaxed font-medium">
                                بناءً على هدفك المشكلة تحتاج تحليل للجذور التراكمية، وليس مسكنات للأعراض. الجلسة التشخيصية الأولى ستكشف لك خطة التعافي الكاملة.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-sm mx-auto">
                                <Link href={createPageUrl('BookAppointment')} className="flex-1">
                                    <button className="w-full py-5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-black text-base hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_10px_40px_rgba(13,148,136,0.3)]">
                                        احجز جلستك الأولى
                                    </button>
                                </Link>
                                <button onClick={() => setStep(0)} className="px-8 py-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white font-bold text-base hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    رجوع
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// ═══ MAIN PAGE COMPONENTS ═══
export default function ServicesPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#020617] text-slate-900 dark:text-slate-100 selection:bg-teal-500/30 font-sans pb-32 overflow-hidden">
            <Head>
                <title>طِبرَا | الخدمات والرعاية الفائقة</title>
            </Head>

            {/* ═══ NAV HEADER ═══ */}
            <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-white/70 dark:bg-[#020617]/70 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50">
                <button
                    onClick={() => { haptic.selection(); router.back(); }}
                    className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors bg-white/50 dark:bg-transparent"
                >
                    <ArrowRight className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
                <div className="text-xl font-black tracking-tight text-slate-900 dark:text-white">الخدمات والرعاية</div>
                <div className="w-12" />
            </header>

            {/* ═══ SUPER PREMIUM HERO SECTION ═══ */}
            <section className="relative px-6 pt-32 pb-24 overflow-hidden border-b border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-b from-slate-50 to-white dark:from-[#050B1A] dark:to-[#020617]">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
                <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-[radial-gradient(circle,_rgba(20,184,166,0.08)_0%,_transparent_60%)] dark:bg-[radial-gradient(circle,_rgba(20,184,166,0.15)_0%,_transparent_60%)] blur-[80px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(99,102,241,0.05)_0%,_transparent_60%)] dark:bg-[radial-gradient(circle,_rgba(99,102,241,0.1)_0%,_transparent_60%)] blur-[80px] pointer-events-none" />

                <div className="relative z-10 text-center max-w-5xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full border border-teal-200/60 dark:border-teal-500/30 bg-white/80 dark:bg-teal-500/10 backdrop-blur-md mb-10 shadow-sm"
                    >
                        <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                        <span className="text-xs font-black tracking-widest text-teal-800 dark:text-teal-200 uppercase">المركز الرائد للتشافي الجذري بالشرق الأوسط</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 leading-[1.1] tracking-tighter"
                    >
                        علاج حقيقي للسبب،<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-l from-teal-500 via-emerald-500 to-teal-400">ليس تخديرًا للأعراض.</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                        className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed mb-14"
                    >
                        لا نكتفي ببرمجة مسكنات الآلام، نحن نعيد هندسة صحتك الجسدية والنفسية بأحدث بروتوكولات الطب الوظيفي والترددات الحيوية.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-5"
                    >
                        <Link href={createPageUrl('BookAppointment')} onClick={() => haptic.success()}>
                            <button className="px-10 py-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgb(0,0,0,0.15)] dark:shadow-[0_20px_40px_rgb(255,255,255,0.1)] focus:outline-none">
                                ابدأ رحلة التشافي الآن
                            </button>
                        </Link>
                        <a href="https://wa.me/967771447111?text=السلام%20عليكم%20استفسار%20بخصوص%20الخدمات" target="_blank" rel="noreferrer">
                            <button className="px-10 py-6 rounded-full bg-white dark:bg-[#0B1121] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all flex items-center gap-3 shadow-sm focus:outline-none">
                                تواصل مع المنسق الطبي
                            </button>
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* ═══ TRUST METRICS (Premium Variant) ═══ */}
            <section className="relative z-20 -mt-12 px-6 max-w-6xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
                    <TrustCounter end={87} suffix="%" label="نسبة التحسن الجذري" icon={TrendingUp} />
                    <TrustCounter end={15} suffix="+" label="سنوات خبرة سريرية" icon={Shield} />
                    <TrustCounter end={4} suffix="K+" label="حالة تعافي موثقة" icon={Heart} />
                    <TrustCounter end={5} suffix=".0" label="تقييم المرضى العالمي" icon={Star} />
                </div>
            </section>

            {/* ═══ CORE SERVICES SHOWCASE (Architectural Bento Grid) ═══ */}
            <section className="py-32 px-6 max-w-[1400px] mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">رعاية استثنائية متعددة الأبعاد</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
                        خطوط علاجية متوازية تغطي الجسد، الشعور، والكيمياء الحيوية لضمان بناء صحة قوية لا تنهار مجدداً.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {/* Main Feature - Large */}
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }}
                        className="md:col-span-2 relative h-[500px] rounded-[48px] overflow-hidden group shadow-[0_20px_60px_rgb(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgb(0,0,0,0.4)]"
                    >
                        <div className="absolute inset-0 bg-slate-900 overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2000')] bg-cover bg-center opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-[2s] ease-out" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent" />
                        </div>
                        
                        <div className="absolute bottom-12 left-12 right-12 z-10">
                            <div className="w-16 h-16 rounded-[24px] bg-white/10 backdrop-blur-2xl flex items-center justify-center border border-white/20 mb-8 border-b-white/10">
                                <Stethoscope className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-4xl lg:text-5xl font-black text-white mb-4 tracking-tighter">الطب الوظيفي التشخيصي</h3>
                            <p className="text-slate-300 max-w-2xl text-lg font-medium leading-relaxed mb-8">
                                نغوص في أدق تفاصيل نمط حياتك والتاريخ المرضي لنكتشف الجذر الحقيقي خلف معاناتك. ليس هناك مرض بلا سبب نعجز عن إصلاحه بالمتابعة.
                            </p>
                            <Link href={createPageUrl('BookAppointment')} className="inline-flex items-center gap-2 text-white font-black hover:gap-4 transition-all bg-white/10 px-6 py-3 rounded-full hover:bg-white/20 backdrop-blur-md">
                                احجز جلسة المسار التشخيصية <ArrowUpRight className="w-5 h-5 rtl:-scale-x-100" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Feature 2 - Small */}
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ delay: 0.1 }}
                        className="relative h-[500px] rounded-[48px] bg-white dark:bg-[#0B1121] border border-slate-200/60 dark:border-slate-800 p-10 flex flex-col justify-between shadow-[0_20px_60px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgb(0,0,0,0.2)] hover:shadow-[0_20px_60px_rgb(20,184,166,0.1)] transition-all overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-[80px]" />
                        <div className="relative z-10 w-16 h-16 rounded-[24px] bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center border border-slate-100 dark:border-slate-700">
                            <Brain className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 leading-tight">كونسيرج ذكي<br />يراقبك 24/7</h3>
                            <p className="text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
                                نظام ذكاء اصطناعي سريري يحلل بياناتك اليومية ويعدل بروتوكولك بلمح البصر دون انتظار الموعد القادم.
                            </p>
                            <Link href="/premium" className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 font-black text-lg hover:gap-3 transition-all">
                                اكتشف باقات طِبرَا+ <ArrowRight className="w-5 h-5 rtl:-scale-x-100" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Feature 3 - Small */}
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }}
                        className="relative h-[500px] rounded-[48px] bg-gradient-to-br from-[#FFFBF0] to-[#FFF3DC] dark:from-[#1F150B] dark:to-[#0A0704] border border-amber-200/60 dark:border-amber-900/50 p-10 flex flex-col justify-between shadow-[0_20px_60px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgb(0,0,0,0.2)] hover:shadow-[0_20px_60px_rgb(245,158,11,0.1)] transition-all overflow-hidden"
                    >
                        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-amber-500/20 dark:bg-amber-500/20 rounded-full blur-[80px]" />
                        <div className="relative z-10 w-16 h-16 rounded-[24px] bg-white dark:bg-[#1A1108] shadow-xl flex items-center justify-center border border-amber-100 dark:border-amber-900/50">
                            <Activity className="w-8 h-8 text-amber-600 dark:text-amber-500" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 leading-tight">الطب الشعوري وذبذبات Rife</h3>
                            <p className="text-base text-amber-900/70 dark:text-amber-200/60 font-medium leading-relaxed mb-8">
                                الجسد يخزن الصدمات. من خلال الترددات الحيوية وجلسات التحرر، نعيد ضبط جهازك العصبي للتشافي.
                            </p>
                            <Link href={createPageUrl('RifeFrequencies')} className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-500 font-black text-lg hover:gap-3 transition-all">
                                جرب قوة الترددات <ArrowRight className="w-5 h-5 rtl:-scale-x-100" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Feature 4 - Large */}
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ delay: 0.1 }}
                        className="md:col-span-2 relative h-[500px] rounded-[48px] bg-white dark:bg-[#050B1A] border border-slate-200/60 dark:border-indigo-900/30 p-10 md:p-14 flex flex-col justify-center overflow-hidden shadow-[0_20px_60px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgb(0,0,0,0.2)]"
                    >
                        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('/pharmacy-bg.jpg')] bg-cover bg-left opacity-10 dark:opacity-20 hidden md:block" />
                        <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-transparent dark:from-[#050B1A] dark:via-[#050B1A] dark:to-transparent" />
                        
                        <div className="relative z-10 max-w-xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 mb-6">
                                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <span className="text-sm font-bold text-indigo-800 dark:text-indigo-200 tracking-wide">الصيدلية الداعمة</span>
                            </div>
                            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">مكملات فائقة النقاء.</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-xl font-medium leading-relaxed mb-10">
                                لا نستخدم إلا المكملات عالية الامتصاص من أفضل المعامل العالمية، لتصلك إلى باب المنزل وبجدول جرعات ذكي لا يفوتك.
                            </p>
                            <Link href={createPageUrl('Shop')}>
                                <button className="px-10 py-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-lg hover:scale-[1.03] active:scale-[0.98] transition-all shadow-[0_15px_30px_rgb(0,0,0,0.15)] focus:outline-none">
                                    تصفح المكملات المعتمدة
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══ INTERACTIVE CARE FINDER ═══ */}
            <section className="py-24 px-6 relative bg-slate-50 dark:bg-[#020617] border-y border-slate-200/50 dark:border-slate-800/50">
                 <CarePathfinder />
            </section>

            {/* ═══ VIP CALLOUT ═══ */}
            <section className="py-32 px-6 max-w-4xl mx-auto text-center relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 dark:bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-[32px] bg-gradient-to-br from-amber-400 to-amber-600 shadow-2xl shadow-amber-500/30 mb-10 border border-amber-300">
                        <Crown className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter">هل تبحث عن رعاية للـ VIP؟</h2>
                    <p className="text-2xl text-slate-600 dark:text-slate-400 font-medium mb-14 max-w-3xl mx-auto leading-relaxed">
                        علق مشاكلك الصحية علينا بالكامل. مع باقات <strong className="text-slate-900 dark:text-white font-black">طِبرَا بلس</strong>، نوفر لك متابعة يومية، أولوية قصوى، وكود رعاية يصمم لك خصيصاً.
                    </p>
                    <Link href={createPageUrl('Premium')}>
                        <button className="px-12 py-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xl hover:scale-105 transition-all shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/50">
                            استعرض باقات النخبة
                        </button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
