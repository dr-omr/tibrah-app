// components/home/DailyGreeting.tsx
// Tibrah 2.0 — World-Class Patient Hero Card
// ─────────────────────────────────────────────────────
// PatientGreeting: Live data from useHealthDashboard
//   - Real streak from dashboard.streakAr
//   - Real health score bar
//   - Context-aware time-based gradient
//   - No hardcoded data anywhere
// VisitorHero: Premium landing with doctor card

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
    Sun, Moon, CloudSun, Sunset, Sparkles, Calendar,
    ArrowLeft, HeartPulse, Brain, Droplets, Leaf, Flame,
    Heart, Save, LogIn, Stethoscope, ChevronLeft, Shield,
    Zap, TrendingUp, Activity, Star
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { useHealthDashboard } from '@/hooks/useHealthDashboard';

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 24, mass: 0.8 };
const DOCTOR_PHOTO = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69287e726ff0e068617e81b7/9185440e5_omar.jpg';

// ─── Time-aware greeting ──────────────────────────────────────────
function getGreeting() {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return {
        text: 'صباح الخير', emoji: '☀️', icon: Sun,
        gradient: 'linear-gradient(135deg, #f59e0b22 0%, #ea580c18 50%, #f9731612 100%)',
        accent: '#f59e0b', accentDark: '#f59e0b',
        msg: 'يوم جديد — إن شاء الله يكون يوم صحة وعافية'
    };
    if (h >= 12 && h < 17) return {
        text: 'مساء النور', emoji: '🌤️', icon: CloudSun,
        gradient: 'linear-gradient(135deg, #0ea5e918 0%, #3b82f614 50%, #6366f110 100%)',
        accent: '#0ea5e9', accentDark: '#38bdf8',
        msg: 'كمّل يومك بنشاط — صحتك تهمنا'
    };
    if (h >= 17 && h < 21) return {
        text: 'مساء الخير', emoji: '🌅', icon: Sunset,
        gradient: 'linear-gradient(135deg, #f9731620 0%, #e11d4818 50%, #9333ea12 100%)',
        accent: '#f97316', accentDark: '#fb923c',
        msg: 'ارتاح من تعب اليوم — استمتع بمساك'
    };
    return {
        text: 'ليلة هادية', emoji: '🌙', icon: Moon,
        gradient: 'linear-gradient(135deg, #312e8120 0%, #4c1d9518 50%, #1e1b4b10 100%)',
        accent: '#818cf8', accentDark: '#6366f1',
        msg: 'وقت الراحة — نوم هنيء وعافية إن شاء الله'
    };
}

function getArabicDate(): string {
    return new Date().toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' });
}

// ─── Daily health tip (rotates daily) ────────────────────────────
const INSIGHTS = [
    { icon: Droplets, text: 'اشرب كمية كافية من الماء — يحسّن تركيزك والطاقة بنسبة ٣٠٪', color: '#2563eb' },
    { icon: Moon, text: 'النوم ٧-٩ ساعات يقوّي مناعتك ويسرّع تعافي جسمك', color: '#7c3aed' },
    { icon: Heart, text: 'التدوين اليومي للأعراض يساعد طبيبك في فهم حالتك أسرع', color: '#e11d48' },
    { icon: TrendingUp, text: 'المشي ٣٠ دقيقة يومياً يقلل الالتهابات بنسبة ٤٠٪', color: '#0d9488' },
    { icon: Leaf, text: 'التنفس العميق لـ ٥ دقائق يخفض هرمون التوتر بشكل كبير', color: '#16a34a' },
    { icon: Brain, text: 'الضغط النفسي المستمر يزيد من خطر الأمراض المزمنة', color: '#9333ea' },
    { icon: Flame, text: 'الصيام المتقطع يجدد خلايا جسمك عبر الالتهام الذاتي', color: '#ea580c' },
];

// ─── Journey breadcrumb ───────────────────────────────────────────
function JourneyBreadcrumb() {
    const steps = [
        { label: 'الأعراض', icon: HeartPulse },
        { label: 'التقييم', icon: Brain },
        { label: 'الحجز', icon: Calendar },
        { label: 'الرعاية', icon: Stethoscope },
    ];
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="flex items-center justify-center gap-1 mt-2"
        >
            <Shield className="w-2.5 h-2.5 text-teal-400/50 ml-0.5" />
            {steps.map((step, i) => (
                <React.Fragment key={step.label}>
                    <div className="flex items-center gap-1 px-1">
                        <step.icon className="w-2.5 h-2.5 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-400 tracking-wide">{step.label}</span>
                    </div>
                    {i < steps.length - 1 && (
                        <ChevronLeft className="w-2.5 h-2.5 text-slate-300 dark:text-slate-600" />
                    )}
                </React.Fragment>
            ))}
        </motion.div>
    );
}

// ─── VISITOR HERO — Premium landing card ────────────────────────────
function VisitorHero({ onOpenCheckIn }: { onOpenCheckIn: () => void }) {
    const router = useRouter();
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING}
            className="mx-4 mt-3 relative"
        >
            <div className="relative overflow-hidden rounded-[32px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/80 dark:border-white/10 shadow-[0_12px_48px_rgba(16,24,34,0.08)]">
                {/* Premium Ambient Glows */}
                <div className="absolute top-0 right-0 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-400/15 via-emerald-400/5 to-transparent pointer-events-none blur-[60px]" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 pointer-events-none blur-[50px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.025] blend-overlay mix-blend-overlay pointer-events-none" />

                <div className="relative z-10 p-5 pt-6">
                    {/* Live Status — Dynamic Island Style */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, type: 'spring', stiffness: 400, damping: 25 }}
                        className="flex items-center justify-center mb-6"
                    >
                        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-800/90 border border-slate-700/50 shadow-lg shadow-teal-900/10 backdrop-blur-md">
                            <motion.div className="relative w-2 h-2 flex items-center justify-center mr-1">
                                <motion.div className="absolute w-3.5 h-3.5 rounded-full bg-emerald-500/40"
                                    animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                                    transition={{ duration: 2, repeat: Infinity }} />
                                <div className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]" />
                            </motion.div>
                            <span className="text-[10.5px] font-bold text-white tracking-wide">العيادة الرقمية · د. عمر متاح — ردّ في دقيقتين</span>
                        </div>
                    </motion.div>

                    {/* Doctor Info Row */}
                    <div className="flex items-center gap-4 mb-5 bg-white/40 dark:bg-slate-800/40 p-3 rounded-[24px] border border-white/50 dark:border-white/5 shadow-sm backdrop-blur-md">
                        <motion.div className="relative flex-shrink-0" style={{ perspective: 1000 }}>
                            <motion.div
                                className="w-[84px] h-[84px] rounded-[22px] overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-[0_8px_24px_rgba(13,148,136,0.15)] border-2 border-white dark:border-slate-700 relative z-10"
                                whileHover={{ scale: 1.05, rotateZ: 2 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                <Image src={DOCTOR_PHOTO} alt="د. عمر العماد" width={84} height={84} className="w-full h-full object-cover object-top" priority />
                            </motion.div>
                            <motion.div className="absolute -inset-1 rounded-[26px] bg-gradient-to-tr from-teal-400 to-emerald-300 opacity-30 blur-md z-0"
                                animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} />
                            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800 shadow-sm z-20 flex items-center justify-center">
                                <span className="w-1.5 h-1.5 bg-white rounded-full opacity-60"></span>
                            </span>
                        </motion.div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                                <h2 className="text-[19px] font-black text-slate-800 dark:text-white leading-none tracking-tight shadow-sm">د. عمر العماد</h2>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-500/30 flex items-center gap-0.5 shadow-sm backdrop-blur-sm shadow-teal-500/10">
                                    موثّق <Shield className="w-3 h-3 fill-current" />
                                </span>
                            </div>
                            <p className="text-[11.5px] text-teal-600/90 dark:text-teal-400/90 font-bold">الطب الوظيفي والتكاملي</p>
                        </div>
                    </div>

                    {/* Premium Tagline */}
                    <div className="relative mb-6 pb-4">
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 to-emerald-400 rounded-full" />
                        <p className="text-[13px] text-slate-600 dark:text-slate-300 font-bold leading-relaxed pr-3.5">
                            نوصل لأصل المشكلة ونعالج السبب الحقيقي — مش بس مسكّن — ونبني خطة تعافي <span className="text-teal-600 dark:text-teal-400 font-black relative inline-block">مخصصة لك تماماً</span>.
                        </p>
                    </div>

                    {/* Enchanced CTAs */}
                    <div className="space-y-3">
                        <Link href={createPageUrl('BookAppointment')} onClick={() => { haptic.impact(); uiSounds.navigate(); }}>
                            <motion.div whileTap={{ scale: 0.96 }}
                                className="relative overflow-hidden w-full h-[56px] rounded-[20px] bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900 dark:from-teal-600 dark:to-emerald-600 flex items-center justify-between px-5 shadow-[0_8px_30px_rgba(15,23,42,0.2)] dark:shadow-teal-600/20 group">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                <div className="flex items-center gap-2.5 relative z-10">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                                        <Calendar className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-[15px] font-black text-white tracking-wide">احجز جلستك الأولى</span>
                                </div>
                                <motion.div className="relative z-10 bg-white/10 w-8 h-8 rounded-full flex items-center justify-center border border-white/10" animate={{ x: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                                    <ArrowLeft className="w-4 h-4 text-white" />
                                </motion.div>
                            </motion.div>
                        </Link>

                        <div className="flex gap-2.5">
                            <button
                                onClick={() => { haptic.tap(); onOpenCheckIn(); }}
                                className="flex-1 h-[48px] rounded-[16px] bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-100/80 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold text-[13px] flex items-center justify-center gap-2 transition-all active:scale-[0.96]"
                            >
                                <Brain className="w-4 h-4" />
                                حلّل أعراضك
                            </button>
                            <Link href={createPageUrl('Login')}
                                className="flex-[0.7] h-[48px] rounded-[16px] bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 font-bold text-[13px] flex items-center justify-center gap-2 transition-all active:scale-[0.96]">
                                <LogIn className="w-4 h-4 text-slate-400" />
                                دخول
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ─── PATIENT GREETING — World-class personal hero card ─────────────
function PatientGreeting({ onOpenCheckIn }: { onOpenCheckIn: () => void }) {
    const { user } = useAuth();
    const dashboard = useHealthDashboard();
    const [mounted, setMounted] = useState(false);
    const [isDraftAvailable, setIsDraftAvailable] = useState(false);
    const greeting = getGreeting();

    useEffect(() => {
        setMounted(true);
        if (localStorage.getItem('tibrah_triage_draft')) {
            localStorage.removeItem('tibrah_triage_draft');
        }
        setIsDraftAvailable(!!localStorage.getItem('tibrah_medical_history'));
    }, []);

    const displayName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || '';

    // Daily tip — rotates by day-of-year
    const activeInsight = useMemo(() => {
        const now = new Date();
        const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
        return INSIGHTS[dayOfYear % INSIGHTS.length];
    }, []);
    const InsightIcon = activeInsight.icon;

    // Health score percentage (safe fallback)
    const healthPct = Math.min(Math.max(dashboard.healthScore || 0, 0), 100);
    const healthColor = healthPct >= 70 ? '#0d9488' : healthPct >= 45 ? '#f59e0b' : '#ef4444';

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING}
            className="mx-4 mt-3"
        >
            <div
                className="relative overflow-hidden rounded-[28px] backdrop-blur-2xl border border-white/50 dark:border-white/[0.06]"
                style={{
                    background: 'rgba(255,255,255,0.70)',
                    boxShadow: '0 8px 40px rgba(16,24,34,0.07)',
                }}
            >
                {/* Time-aware colour wash */}
                <div className="absolute inset-0 pointer-events-none transition-colors duration-1000"
                    style={{ background: greeting.gradient }} />
                {/* Subtle dot texture */}
                <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.9) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />

                <div className="relative z-10 p-5 pb-4">

                    {/* ── Row 1: Date pill + Streak ── */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-slate-800/60 border border-white/60 dark:border-white/10 shadow-sm">
                            <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                            <span className="text-[11.5px] font-semibold text-slate-600 dark:text-slate-200">
                                {mounted ? getArabicDate() : '─ ─ ─'}
                            </span>
                        </div>
                        {/* Live streak from dashboard */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 500 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/30 shadow-sm"
                        >
                            <Flame className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-[12px] font-black text-amber-700 dark:text-amber-300">
                                {dashboard.loading ? '─' : dashboard.streakAr} يوم
                            </span>
                        </motion.div>
                    </div>

                    {/* ── Row 2: Avatar + Greeting ── */}
                    <div className="flex items-center gap-4 pb-4 border-b border-slate-100/60 dark:border-white/[0.05] mb-4">
                        {/* Avatar with animated health ring */}
                        <div className="relative flex-shrink-0 w-[76px] h-[76px]">
                            {/* SVG ring */}
                            <svg width="76" height="76" className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="38" cy="38" r="34" fill="none" stroke="rgba(13,148,136,0.15)" strokeWidth="3" />
                                <motion.circle
                                    cx="38" cy="38" r="34"
                                    fill="none"
                                    stroke={healthColor}
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    strokeDasharray={2 * Math.PI * 34}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - healthPct / 100) }}
                                    transition={{ duration: 1.6, delay: 0.5, ease: 'easeOut' }}
                                />
                            </svg>
                            {/* Avatar */}
                            <div className="absolute inset-[5px] rounded-[18px] overflow-hidden border-2 border-white dark:border-slate-700 shadow-md">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                                        <span className="text-xl font-black text-white">{displayName ? displayName.charAt(0).toUpperCase() : 'U'}</span>
                                    </div>
                                )}
                            </div>
                            {/* Online dot */}
                            <motion.div
                                animate={{ scale: [1, 1.4, 1] }}
                                transition={{ duration: 2.2, repeat: Infinity }}
                                className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 z-20"
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h1 className="text-[22px] font-black text-slate-800 dark:text-white leading-tight tracking-tight">
                                {greeting.text}{displayName ? ` يا ${displayName}` : ''} {greeting.emoji}
                            </h1>
                            <p className="text-[13px] text-slate-500 dark:text-slate-300 mt-1 font-medium flex items-center gap-1.5">
                                <HeartPulse className="w-4 h-4 text-rose-400 flex-shrink-0" />
                                {greeting.msg}
                            </p>
                        </div>
                    </div>

                    {/* ── Row 3: Live Health Score Bar ── */}
                    {!dashboard.loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            className="mb-4"
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <Activity className="w-3 h-3" />
                                    مؤشر الصحة اليوم
                                </span>
                                <span className="text-[13px] font-black" style={{ color: healthColor }}>
                                    {dashboard.healthScoreAr}
                                </span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700/60 overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ background: `linear-gradient(to left, ${healthColor}, ${healthColor}99)` }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${healthPct}%` }}
                                    transition={{ duration: 1.4, delay: 0.6, ease: 'easeOut' }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* ── Row 4: Daily Insight ── */}
                    <div className="flex items-start gap-3 mb-4 p-3 rounded-2xl bg-white/40 dark:bg-white/[0.04] border border-white/50 dark:border-white/[0.05]">
                        <div className="mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${activeInsight.color}18`, border: `1px solid ${activeInsight.color}30` }}>
                            <InsightIcon className="w-4 h-4" style={{ color: activeInsight.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="block text-[11px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider">نصيحة اليوم</span>
                            <p className="text-[12.5px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{activeInsight.text}</p>
                        </div>
                    </div>

                    {/* ── Row 5: Primary CTA ── */}
                    <motion.button
                        id="clinical-assessment-btn"
                        onClick={() => { haptic.success(); uiSounds.navigate(); onOpenCheckIn(); }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full relative group overflow-hidden rounded-[18px] bg-gradient-to-l from-teal-600 via-teal-600 to-emerald-600 shadow-lg shadow-teal-600/20 mb-3"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/8 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="flex items-center justify-between px-5 py-4">
                            <div className="flex flex-col items-start">
                                <span className="text-[14px] font-black text-white tracking-wide">
                                    {isDraftAvailable ? 'استكمال التاريخ المرضي' : 'التاريخ المرضي الشامل'}
                                </span>
                                <span className="text-[11px] text-teal-100/80 font-medium mt-0.5 flex items-center gap-1">
                                    <Brain className="w-3 h-3" />
                                    تحليل سريري دقيق
                                </span>
                            </div>
                            <motion.div
                                className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center border border-white/20"
                                animate={{ x: [0, -3, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                {isDraftAvailable ? <Save className="w-4 h-4 text-white" /> : <ArrowLeft className="w-4 h-4 text-white" />}
                            </motion.div>
                        </div>
                    </motion.button>

                    <JourneyBreadcrumb />
                </div>
            </div>
        </motion.div>
    );
}

// ─── Export ───────────────────────────────────────────────────────
export default function DailyGreeting() {
    const { user, loading } = useAuth();
    const router = useRouter();
    return (
        <>
            {user && !loading
                ? <PatientGreeting onOpenCheckIn={() => router.push('/medical-history')} />
                : <VisitorHero onOpenCheckIn={() => router.push('/medical-history')} />
            }
        </>
    );
}
