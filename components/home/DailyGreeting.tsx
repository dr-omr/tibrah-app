// components/home/DailyGreeting.tsx
// For VISITORS: Full-width hero with doctor photo + trust + CTA
// For PATIENTS: Personal greeting with time-based gradient

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Sun, Moon, CloudSun, Sunset, Sparkles, TrendingUp, Calendar, ArrowLeft, Users, Award, Star, Activity, MessageCircle, HeartPulse, Brain, Droplets, Leaf, Flame, Heart, Save, X, ScanFace, LogIn, Stethoscope, ChevronLeft, Shield } from 'lucide-react';
import { createPageUrl } from '@/utils';
import QuickCheckIn from './QuickCheckIn';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';

const SPRING_CONFIG = { type: 'spring' as const, stiffness: 300, damping: 24, mass: 0.8 };
const STAGGER_CONTAINER = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
};
const ITEM_FADE_UP = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: SPRING_CONFIG }
};

const DOCTOR_PHOTO = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69287e726ff0e068617e81b7/9185440e5_omar.jpg';

function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
        return {
            text: 'صباح الخير',
            emoji: '☀️',
            icon: Sun,
            bg: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #dc2626 100%)',
            glow1: 'rgba(245,158,11,0.4)', // Amber
            glow2: 'rgba(220,38,38,0.3)', // Red
            message: 'يوم جديد وإن شاء الله يكون يوم صحة وعافية'
        };
    }
    if (hour >= 12 && hour < 17) {
        return {
            text: 'مساء النور',
            emoji: '🌤️',
            icon: CloudSun,
            bg: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #6366f1 100%)',
            glow1: 'rgba(14,165,233,0.4)', // Sky
            glow2: 'rgba(99,102,241,0.3)', // Indigo
            message: 'كمّل يومك بنشاط، صحتك تهمنا'
        };
    }
    if (hour >= 17 && hour < 21) {
        return {
            text: 'مساء الخير',
            emoji: '🌅',
            icon: Sunset,
            bg: 'linear-gradient(135deg, #f97316 0%, #e11d48 50%, #9333ea 100%)',
            glow1: 'rgba(249,115,22,0.4)', // Orange
            glow2: 'rgba(147,51,234,0.3)', // Purple
            message: 'ارتاح من تعب اليوم واستمتع بمساك'
        };
    }
    return {
        text: 'ليلة هادية',
        emoji: '🌙',
        icon: Moon,
        bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)',
        glow1: 'rgba(49,46,129,0.5)', // Deep Indigo
        glow2: 'rgba(76,29,149,0.4)', // Deep Purple
        message: 'وقت الراحة، نوم هنيء وعافية إن شاء الله'
    };
}

function getArabicDate(): string {
    return new Date().toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' });
}

/* ═══════════════════════════════════════
   SHARED JOURNEY BREADCRUMB — Unifies guest & patient
   ═══════════════════════════════════════ */
function JourneyBreadcrumb({ compact = false }: { compact?: boolean } = {}) {
    const steps = [
        { label: 'الأعراض', icon: HeartPulse },
        { label: 'التقييم', icon: Brain },
        { label: 'الحجز', icon: Calendar },
        { label: 'الرعاية', icon: Stethoscope },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className={`flex items-center justify-center gap-1.5 ${compact ? 'mt-2' : 'mt-3'}`}
        >
            <Shield className="w-2.5 h-2.5 text-teal-400/50 dark:text-teal-500/40 ml-1" />
            {steps.map((step, i) => (
                <React.Fragment key={step.label}>
                    <div className="flex items-center gap-1 px-1.5 py-0.5">
                        <step.icon className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500" />
                        <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 tracking-wide">{step.label}</span>
                    </div>
                    {i < steps.length - 1 && (
                        <ChevronLeft className="w-2.5 h-2.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                    )}
                </React.Fragment>
            ))}
        </motion.div>
    );
}

/* ═══════════════════════════════════════
   VISITOR HERO — Premium Clean Landing Design
   ═══════════════════════════════════════ */
function VisitorHero({ onOpenCheckIn }: { onOpenCheckIn: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="mx-4 mt-4"
        >
            <div className="relative overflow-hidden rounded-[30px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                
                {/* Clean Subtle Glows */}
                <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[80px] opacity-[0.15] dark:opacity-30 bg-teal-400 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[70px] opacity-10 dark:opacity-20 bg-indigo-400 pointer-events-none" />

                <div className="relative z-10 p-6 pb-7 flex flex-col items-center text-center">
                    {/* Top badge */}
                    <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-7 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold tracking-wide">العيادة الرقمية للطب الوظيفي</span>
                    </div>

                    {/* Doctor Avatar - Clean and Premium */}
                    <div className="relative mb-5">
                        <div className="w-24 h-24 rounded-[30px] p-1.5 bg-white dark:bg-slate-900 shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-slate-100/80 dark:border-slate-800 z-10 relative">
                            <div className="w-full h-full rounded-[24px] overflow-hidden bg-slate-100 dark:bg-slate-800">
                                <Image
                                    src={DOCTOR_PHOTO}
                                    alt="د. عمر العماد"
                                    width={96}
                                    height={96}
                                    className="w-full h-full object-cover object-top"
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    {/* Title & Info */}
                    <h1 className="text-[26px] sm:text-[30px] font-black text-slate-800 dark:text-white leading-tight mb-2 tracking-tight">
                        د. عمر العماد
                    </h1>
                    <p className="text-[13px] text-teal-600 dark:text-teal-400 font-bold tracking-wide mb-4">الطب الوظيفي والتكاملي</p>
                    
                    <p className="text-[13.5px] text-slate-500 dark:text-slate-400 font-medium leading-[1.8] max-w-[280px] mb-8">
                        نوصل لأصل المشكلة ونعالج السبب الحقيقي، مش بس مسكّن للأعراض — نبني خطة تعافي مخصصة لك.
                    </p>

                    {/* Interactive Stats Row */}
                    <div className="flex gap-3 w-full mb-8">
                        <div className="flex flex-col items-center gap-1.5 flex-1 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-700/60">
                            <Activity className="w-4 h-4 text-teal-500 mb-0.5" />
                            <span className="text-[19px] font-black text-slate-800 dark:text-white">٨٧٪</span>
                            <span className="text-[10px] font-bold tracking-wide text-slate-400">تحسن إكلينيكي</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 flex-1 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-700/60">
                            <Users className="w-4 h-4 text-indigo-500 mb-0.5" />
                            <span className="text-[19px] font-black text-slate-800 dark:text-white">+٣٠٠</span>
                            <span className="text-[10px] font-bold tracking-wide text-slate-400">مريض سعيد</span>
                        </div>
                    </div>

                    {/* Call To Actions */}
                    <div className="w-full space-y-3.5">
                        {/* Primary Assessment CTA */}
                        <button
                            onClick={() => { haptic.success(); uiSounds.navigate(); onOpenCheckIn(); }}
                            className="w-full h-[56px] rounded-[20px] bg-slate-800 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold flex items-center justify-between px-5 transition-all shadow-lg shadow-slate-200 dark:shadow-none active:scale-[0.98]"
                        >
                            <span className="flex items-center gap-2.5">
                                <Sparkles className="w-[18px] h-[18px]" />
                                <span className="text-[14px]">التقييم الصحي الذكي</span>
                            </span>
                            <ArrowLeft className="w-5 h-5 opacity-60" />
                        </button>

                        <div className="flex gap-3">
                            <Link href={createPageUrl('Register')} className="flex-1">
                                <button className="w-full h-[52px] rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 font-bold text-[13.5px] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all active:scale-[0.98]">
                                    إنشاء حساب
                                </button>
                            </Link>
                            <Link href={createPageUrl('Login')} className="flex-1">
                                <button className="w-full h-[52px] rounded-2xl text-teal-700 dark:text-teal-400 font-bold text-[13.5px] bg-teal-50 dark:bg-teal-500/10 hover:bg-teal-100 dark:hover:bg-teal-500/20 transition-all active:scale-[0.98]">
                                    تسجيل الدخول
                                </button>
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════
   PATIENT GREETING — Premium personal dashboard
   ═══════════════════════════════════════ */
const insights = [
    { icon: Droplets, text: 'اشرب كمية كافية من الماء — يحسّن تركيزك والطاقة بنسبة ٣٠٪' },
    { icon: Moon, text: 'النوم ٧-٩ ساعات يقوي مناعتك ويسرّع تعافي جسمك' },
    { icon: Heart, text: 'التدوين اليومي للأعراض يساعد طبيبك في فهم حالتك أسرع' },
    { icon: TrendingUp, text: 'المشي ٣٠ دقيقة يومياً يقلل الالتهابات بنسبة ٤٠٪' },
    { icon: Leaf, text: 'التنفس العميق لـ ٥ دقائق يخفض هرمون التوتر بشكل كبير' },
    { icon: Brain, text: 'الضغط النفسي المستمر يزيد من خطر الأمراض المزمنة' },
    { icon: Flame, text: 'الصيام المتقطع يجدد خلايا جسمك بشكل طبيعي عبر الالتهام الذاتي' }
];

function PatientGreeting({ onOpenCheckIn }: { onOpenCheckIn: () => void }) {
    const { user } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [isDraftAvailable, setIsDraftAvailable] = useState(false);
    const greeting = getGreeting();

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('tibrah_triage_draft');
        if (saved && JSON.parse(saved)?.chiefComplaintCategories) {
            setIsDraftAvailable(true);
        }
    }, []);

    const displayName = user?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || '';

    // Rotate insight daily
    const dayOfYear = useMemo(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }, []);
    const activeInsight = insights[dayOfYear % insights.length];
    const InsightIcon = activeInsight.icon;

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={SPRING_CONFIG} className="mx-4 mt-3">
            <div className="relative overflow-hidden rounded-3xl shadow-[0_2px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_24px_rgba(0,0,0,0.25)] bg-white dark:bg-slate-800/95 border border-slate-100 dark:border-slate-700/80">
                <div className="absolute inset-0 opacity-25 dark:opacity-15 pointer-events-none" style={{ background: greeting.bg }} />
                <div className="absolute inset-0 opacity-8" style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

                <div className="relative z-10 p-5 pb-5">
                    {/* Header: Date + Streak */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 bg-white/80 dark:bg-white/5 border border-slate-100 dark:border-white/10 backdrop-blur-sm shadow-sm">
                            <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                            <span className="text-[11.5px] font-semibold text-slate-600 dark:text-white/90">{mounted ? getArabicDate() : ''}</span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/30" title="سلسلة الالتزام">
                            <span className="text-amber-500">🔥</span>
                            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-50">١٢ يوم</span>
                        </div>
                    </div>

                    {/* Greeting & Avatar */}
                    <div className="flex items-center gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
                        <div className="w-[64px] h-[64px] rounded-2xl p-[2px] shadow-md border-2 border-white dark:border-transparent ring-1 ring-slate-100 dark:ring-transparent overflow-hidden flex-shrink-0">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover rounded-[14px]" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-500 rounded-[14px]">
                                    <span className="text-xl font-black text-white">{displayName ? displayName.charAt(0) : 'U'}</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-[22px] font-black text-slate-800 dark:text-white leading-tight">
                                {greeting.text}{displayName ? ` يا ${displayName}` : ''} {greeting.emoji}
                            </h1>
                            <p className="text-[13px] text-slate-500 dark:text-white/80 mt-1 font-medium flex items-center gap-1.5">
                                <HeartPulse className="w-4 h-4 text-rose-400" /> صحتك أولويتنا اليوم
                            </p>
                        </div>
                    </div>
                </div>

                {/* Insight Bar */}
                <div className="relative z-10 px-5 pb-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-500 dark:text-indigo-300">
                            <InsightIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 mb-0.5 uppercase tracking-wider">نصيحة اليوم</span>
                            <p className="text-[12px] text-slate-600 dark:text-white/95 font-medium leading-relaxed">{activeInsight.text}</p>
                        </div>
                    </div>
                </div>

                {/* ═══ Enhanced Health Action Area — unified with visitor CTA ═══ */}
                <div className="relative z-10 px-5 pb-5 space-y-3">
                    {/* Primary CTA — same gradient button as visitor hero */}
                    <motion.button
                        id="clinical-assessment-btn"
                        onClick={() => { haptic.success(); uiSounds.navigate(); onOpenCheckIn(); }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-l from-teal-600 via-teal-600 to-emerald-600 shadow-lg shadow-teal-600/20 dark:shadow-teal-900/30"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite]" />
                        <div className="flex items-center justify-between px-5 py-4">
                            <div className="flex flex-col items-start">
                                <span className="text-[14px] font-bold text-white tracking-wide">{isDraftAvailable ? 'استكمال التقييم' : 'التقييم السريري'}</span>
                                <span className="text-[10.5px] text-teal-100/80 font-medium mt-0.5 flex items-center gap-1">
                                    <Brain className="w-3 h-3" /> تقييم ذكي بالذكاء الاصطناعي
                                </span>
                            </div>
                            <motion.div
                                className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center"
                                animate={{ x: [0, -3, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                {isDraftAvailable ? <Save className="w-4 h-4 text-white" /> : <ArrowLeft className="w-4 h-4 text-white" />}
                            </motion.div>
                        </div>
                    </motion.button>

                    {/* Journey breadcrumb — shared with visitor hero */}
                    <JourneyBreadcrumb compact />

                    {/* Secondary actions: Book + Symptom Analysis */}
                    <div className="flex gap-2.5">
                        <Link href={createPageUrl('BookAppointment')} className="flex-1">
                            <motion.div
                                whileTap={{ scale: 0.97 }}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600/60 text-slate-600 dark:text-slate-300 font-bold text-[12.5px] hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                احجز موعد
                            </motion.div>
                        </Link>
                        <Link href={createPageUrl('BodyMap')} className="flex-1" onClick={() => { haptic.success(); uiSounds.navigate(); }}>
                            <motion.div
                                whileTap={{ scale: 0.97 }}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-indigo-200 dark:border-indigo-700/50 text-indigo-600 dark:text-indigo-300 font-bold text-[12.5px] bg-indigo-50/50 dark:bg-indigo-500/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                            >
                                <ScanFace className="w-3.5 h-3.5" />
                                تحليل الأعراض
                            </motion.div>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}


/* ═══════════════════════════════════════ */
/* Full-Screen Clinical Assessment Overlay */
function CheckInOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="checkin-overlay"
                    initial={{ opacity: 0, y: '100%' }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: '100%' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                    className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-slate-950 flex flex-col"
                    style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                >
                    {/* Drag handle + close */}
                    <div className="flex-shrink-0 flex items-center justify-between px-5 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                        <button
                            onClick={() => { haptic.tap(); onClose(); }}
                            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        <div className="w-9" />
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <QuickCheckIn />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* ═══════════════════════════════════════ */
export default function DailyGreeting() {
    const { user, loading } = useAuth();
    const [checkInOpen, setCheckInOpen] = useState(false);

    // Prevent body scroll when overlay is open
    useEffect(() => {
        if (checkInOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [checkInOpen]);

    if (loading) {
        return (
            <div className="mx-4 mt-3 rounded-[24px] bg-slate-800 animate-pulse h-[220px]" />
        );
    }

    return (
        <>
            {user
                ? <PatientGreeting onOpenCheckIn={() => setCheckInOpen(true)} />
                : <VisitorHero onOpenCheckIn={() => setCheckInOpen(true)} />}
            <CheckInOverlay isOpen={checkInOpen} onClose={() => setCheckInOpen(false)} />
        </>
    );
}
