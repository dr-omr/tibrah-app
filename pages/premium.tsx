import React, { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, ShieldCheck, PhoneCall,
    Crown, CheckCircle2, Star, Zap,
    ChevronDown, ChevronUp, Lock, ArrowRight, PlayCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';

// ═══ Types & Data ═══
type BillingCycle = 'monthly' | 'yearly';

const plans = [
    {
        id: 'advanced',
        name: 'العناية المتقدمة',
        badge: 'الأكثر شعبية',
        color: 'indigo',
        price: { monthly: 149, yearly: 1490 },
        description: 'المتابعة الذكية لحالتك مع دعم الذكاء الاصطناعي',
        features: [
            'جلسة استشارية قصيرة (15 د) شهرياً',
            '3 تشخيصات ذكية عبر طِبرَا AI',
            'خصم 15% على المكملات الغذائية',
            'أولوية متوسطة في الحجوزات'
        ]
    },
    {
        id: 'vip',
        name: 'الرعاية الشمولية VIP',
        badge: 'النخبة',
        color: 'amber',
        price: { monthly: 499, yearly: 4990 },
        description: 'تغطية صحية وشعورية كاملة بمتابعة شخصية مستمرة',
        features: [
            'جلستين استشارية (45 د) شهرياً',
            'تحليل أعراض غير محدود بـ AI',
            'توصيل مجاني لجميع المكملات',
            'أولوية قصوى في الحجوزات',
            'متابعة يومية عبر واتساب المباشر',
            'خطة تعافي مخصصة تتحدث أسبوعياً'
        ]
    }
];

const faqs = [
    { q: 'هل يمكنني إلغاء الاشتراك في أي وقت؟', a: 'نعم، بكل تأكيد. يمكنك إلغاء التجديد التلقائي في أي وقت من إعدادات حسابك بدون أي رسوم إضافية.' },
    { q: 'كيف تعمل ميزة طِبرَا AI؟', a: 'طِبرَا AI هو مساعدك الطبي الذكي، يقوم بتحليل أعراضك ويومياتك لتقديم نصائح استباقية وتنبيه الدكتور لأي تغييرات تتطلب تدخلاً.' },
    { q: 'هل الجلسات الاستشارية تشمل الطب الوظيفي؟', a: 'نعم، جميع الجلسات مع د. عمر تركز على الطب الوظيفي والتشخيص الشعوري للوصول لجذر المشكلة.' }
];

export default function Premium() {
    const router = useRouter();
    const [cycle, setCycle] = useState<BillingCycle>('yearly');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

    const toggleCycle = (selected: BillingCycle) => {
        if (cycle === selected) return;
        haptic.selection();
        setCycle(selected);
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#020617] text-slate-800 dark:text-slate-200 selection:bg-amber-500/30 overflow-hidden pb-24 font-sans relative">
            <Head>
                <title>طِبرَا+ | باقات العناية الفائقة</title>
            </Head>

            {/* SUPER PREMIUM GLOW EFFECTS */}
            <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-[radial-gradient(circle,_rgba(245,158,11,0.08)_0%,_transparent_60%)] dark:bg-[radial-gradient(circle,_rgba(245,158,11,0.12)_0%,_transparent_60%)] blur-[80px] pointer-events-none" />
            <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(99,102,241,0.05)_0%,_transparent_60%)] dark:bg-[radial-gradient(circle,_rgba(99,102,241,0.08)_0%,_transparent_60%)] blur-[80px] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />

            {/* ═══ Navigation ═══ */}
            <div className="sticky top-0 z-50 px-6 py-4 flex flex-row-reverse items-center justify-between backdrop-blur-2xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50">
                <button
                    onClick={() => { haptic.selection(); router.back(); }}
                    className="w-12 h-12 rounded-full bg-white/50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                >
                    <ArrowRight className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">طِبرَا</span>
                    <span className="px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-400 to-amber-600 text-[10px] font-black tracking-widest text-white shadow-lg shadow-amber-500/20">PLUS</span>
                </div>
            </div>

            <main className="relative z-10 px-5 pt-12 max-w-5xl mx-auto">
                
                {/* ═══ Hero Section ═══ */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-amber-200/60 dark:border-amber-500/30 bg-white/80 dark:bg-amber-500/10 backdrop-blur-md mb-8 shadow-sm">
                        <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                        <span className="text-sm font-black tracking-wide text-amber-800 dark:text-amber-200">الرعاية الصحية التي تستحقها</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tighter">
                        استثمر في صحتك،
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-400 via-amber-600 to-amber-500">
                            واستعد حياتك.
                        </span>
                    </h1>
                    
                    <p className="text-lg md:text-xl font-medium text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        دخول لا محدود لاستشارات الطب الوظيفي، تحليل الذكاء الاصطناعي، ورعاية مخصصة تصمم خصيصاً لك بأعلى معايير الجودة العالمية.
                    </p>
                </motion.div>

                {/* ═══ Billing Cycle Toggle ═══ */}
                <div className="flex justify-center mb-16">
                    <div className="p-1.5 rounded-[20px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700 shadow-sm inline-flex relative">
                        <div 
                            className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-slate-900 dark:bg-slate-700 rounded-2xl shadow-md transition-transform duration-300 ease-spring"
                            style={{ transform: cycle === 'yearly' ? 'translateX(0)' : 'translateX(-100%)', right: cycle === 'monthly' ? 'auto' : '6px', left: cycle === 'monthly' ? '6px' : 'auto' }}
                        />
                        
                        <button 
                            onClick={() => toggleCycle('yearly')}
                            className={`relative z-10 px-8 py-3.5 rounded-2xl text-base font-bold transition-colors flex items-center gap-2 ${cycle === 'yearly' ? 'text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
                        >
                            سنوي
                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${cycle === 'yearly' ? 'bg-amber-500/20 text-amber-100 border-amber-400/30' : 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'}`}>وفر 20%</span>
                        </button>
                        <button 
                            onClick={() => toggleCycle('monthly')}
                            className={`relative z-10 px-8 py-3.5 rounded-2xl text-base font-bold transition-colors ${cycle === 'monthly' ? 'text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
                        >
                            شهري
                        </button>
                    </div>
                </div>

                {/* ═══ Pricing Cards ═══ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24 max-w-4xl mx-auto">
                    {plans.map((plan, index) => {
                        const isVip = plan.id === 'vip';
                        const price = plan.price[cycle];
                        const oldPrice = cycle === 'yearly' ? Math.round(plan.price.monthly * 12) : null;

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.15 + 0.2 }}
                                className={`relative rounded-[40px] overflow-hidden group ${
                                    isVip 
                                    ? 'p-[3px] shadow-[0_20px_60px_rgba(245,158,11,0.15)] dark:shadow-[0_20px_60px_rgba(245,158,11,0.2)] hover:shadow-[0_20px_60px_rgba(245,158,11,0.25)]' 
                                    : 'border border-slate-200/80 dark:border-slate-700/50 shadow-[0_20px_60px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]'
                                } transition-all`}
                                style={isVip ? { background: 'linear-gradient(135deg, #fde68a 0%, #f59e0b 50%, #b45309 100%)' } : {}}
                            >
                                <div className={`h-full w-full rounded-[37px] p-8 md:p-10 relative flex flex-col ${
                                    isVip 
                                    ? 'bg-gradient-to-b from-[#FFFBF0] to-white dark:from-[#1F150B] dark:to-[#0A0704]' 
                                    : 'bg-white/90 dark:bg-[#0B1121]/90 backdrop-blur-xl'
                                }`}>
                                    
                                    {isVip && <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-amber-400/30 transition-colors" />}

                                    <div className="flex justify-between items-start mb-8 relative z-10">
                                        <div>
                                            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase mb-4 border shadow-sm"
                                                 style={isVip ? { borderColor: 'rgba(217,119,6,0.3)', backgroundColor: 'rgba(251,191,36,0.15)', color: '#b45309' } : { borderColor: 'rgba(99,102,241,0.2)', backgroundColor: 'rgba(238,242,255,1)', color: '#4f46e5' }}
                                            >
                                                {isVip ? <Crown className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                                                {plan.badge}
                                            </div>
                                            <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{plan.name}</h3>
                                        </div>
                                    </div>

                                    <div className="mb-8 relative z-10">
                                        <div className="flex items-baseline gap-2" dir="ltr">
                                            <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{price}</span>
                                            <span className="text-base font-bold text-slate-400">SAR / {cycle === 'yearly' ? 'سنة' : 'شهر'}</span>
                                        </div>
                                        {oldPrice && (
                                            <div className="text-sm font-bold text-slate-400 line-through mt-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                                بدلاً من {oldPrice} SAR
                                            </div>
                                        )}
                                        <p className="text-base text-slate-600 dark:text-slate-400 font-medium mt-4 leading-relaxed">
                                            {plan.description}
                                        </p>
                                    </div>

                                    <ul className="space-y-5 mb-10 relative z-10 flex-1">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-4">
                                                <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner ${isVip ? 'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40' : 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40'}`}>
                                                    <CheckCircle2 className={`w-4 h-4 ${isVip ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'}`} />
                                                </div>
                                                <span className="text-base font-bold text-slate-700 dark:text-slate-300 leading-snug">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => { haptic.success(); uiSounds.success(); }}
                                        className={`w-full py-5 rounded-[20px] text-lg font-black transition-all active:scale-[0.98] shadow-xl relative z-10 ${
                                            isVip 
                                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-500/30 hover:shadow-amber-500/40 hover:scale-[1.02]' 
                                            : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-slate-900/10 hover:shadow-slate-900/20 hover:scale-[1.02]'
                                        }`}
                                    >
                                        اشترك الآن
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* ═══ Security & Trust ═══ */}
                <div className="flex flex-col items-center gap-4 mb-24 max-w-md mx-auto">
                    <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 shadow-sm">
                        <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">دفع آمن ومشفّر 100% بخوارزميات بنكية</span>
                    </div>
                    <p className="text-sm text-slate-400 font-medium text-center leading-relaxed">
                        شفافية تامة، يمكنك إلغاء التجديد في أي وقت بنقرة واحدة من الإعدادات.
                    </p>
                </div>

                {/* ═══ FAQ Accordion ═══ */}
                <div className="mb-16 max-w-3xl mx-auto">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-10 text-center">الأسئلة الشائعة</h3>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div 
                                key={i} 
                                className={`rounded-[24px] border transition-all duration-300 overflow-hidden ${
                                    expandedFaq === i 
                                    ? 'bg-white dark:bg-slate-800/80 border-slate-300 dark:border-slate-600 shadow-lg shadow-slate-200/50 dark:shadow-none' 
                                    : 'bg-white/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-800/60'
                                }`}
                            >
                                <button 
                                    onClick={() => { haptic.selection(); setExpandedFaq(expandedFaq === i ? null : i); }}
                                    className="w-full p-6 md:p-8 flex items-center justify-between text-right"
                                >
                                    <span className="font-bold text-lg text-slate-800 dark:text-slate-200">{faq.q}</span>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${expandedFaq === i ? 'bg-slate-100 dark:bg-slate-700' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                                        {expandedFaq === i ? <ChevronUp className="w-6 h-6 text-slate-600 dark:text-slate-400" /> : <ChevronDown className="w-6 h-6 text-slate-400" />}
                                    </div>
                                </button>
                                <AnimatePresence>
                                    {expandedFaq === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="px-6 md:px-8 pb-8 text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium"
                                        >
                                            {faq.a}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    );
}
