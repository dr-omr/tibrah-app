import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import SEO, { pageSEO } from '../components/common/SEO';
import { HomeStructuredData } from '../components/common/StructuredData';
import { useAuth } from '../contexts/AuthContext';
import DailyGreeting from '../components/home/DailyGreeting';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Stethoscope, Calendar, TrendingUp, Activity, Brain, Sparkles, ArrowLeft, Shield, Award, HeartPulse, Clock, Droplets, Flame, Target, CheckCircle, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { createPageUrl } from '../utils';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { useHealthDashboard, type HealthDashboardData } from '@/hooks/useHealthDashboard';

/* ═══════════════════════════════════════
   PREMIUM SKELETON LOADERS
   ═══════════════════════════════════════ */
const CareSessionHub = dynamic(() => import('../components/care-hub/CareSessionHub'), {
    loading: () => (
        <div className="mx-5 rounded-3xl animate-pulse overflow-hidden">
            <div className="h-[100px] bg-slate-100 dark:bg-slate-800 p-4 flex items-center gap-4">
                <div className="w-[72px] h-[72px] rounded-[24px] bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                <div className="flex-1 space-y-3"><div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-full" /><div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-full" /></div>
            </div>
            <div className="h-[120px] bg-slate-50 dark:bg-slate-900 p-4"><div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl" /></div>
        </div>
    ),
});
const DailyInsight = dynamic(() => import('../components/home/DailyInsight'), {
    loading: () => <div className="h-[90px] card-tibrah animate-pulse mx-5 p-4 mt-6 flex items-center gap-4"><div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-2xl" /><div className="flex-1 space-y-2"><div className="w-3/4 h-3 bg-slate-200 dark:bg-slate-700 rounded-full" /><div className="w-1/2 h-3 bg-slate-200 dark:bg-slate-700 rounded-full" /></div></div>,
});
const ServicesPreview = dynamic(() => import('../components/home/ServicesPreview'), {
    loading: () => (
        <div className="py-8 overflow-hidden">
            <div className="px-5 mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    <div>
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mb-1" />
                        <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
                    </div>
                </div>
            </div>
            <div className="flex gap-4 px-5 overflow-hidden">
                <div className="flex-shrink-0 w-[82vw] max-w-[340px] h-[220px] bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
                <div className="flex-shrink-0 w-[82vw] max-w-[340px] h-[220px] bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
            </div>
        </div>
    ),
});
const TrustAndTestimonials = dynamic(() => import('../components/home/TrustAndTestimonials'), {
    loading: () => <div className="h-[250px] card-tibrah animate-pulse mx-5" />,
});
const FinalCTA = dynamic(() => import('../components/home/FinalCTA'), {
    loading: () => <div className="h-[200px] card-tibrah animate-pulse mx-5" />,
});
const ShopPreview = dynamic(() => import('../components/home/ShopPreview'), {
    loading: () => <div className="h-[180px] card-tibrah animate-pulse mx-5" />,
});

/* ═══════════════════════════════════════
   SHARED UI COMPONENTS
   ═══════════════════════════════════════ */

/* ─── Section Header with optional count badge ─── */
function SectionHeader({ title, subtitle, Icon, accentColor, count }: { title: string; subtitle?: string; Icon?: LucideIcon; accentColor?: string; count?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ type: 'spring' as const, stiffness: 350, damping: 25 }}
            className="px-5 mb-3"
        >
            <div className="flex items-center gap-2.5">
                {Icon && (
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ background: `${accentColor || 'var(--primary)'}15` }}
                    >
                        <Icon className="w-4.5 h-4.5" style={{ color: accentColor || 'var(--primary)' }} />
                    </div>
                )}
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-[16px] font-extrabold text-slate-800 dark:text-white">{title}</h2>
                        {count !== undefined && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                {count}
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-semibold">{subtitle}</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

/* ─── Animated Zone Divider with gradient line ─── */
function ZoneDivider({ label, icon: Icon }: { label?: string; icon?: LucideIcon } = {}) {
    return (
        <div className="px-5 my-7">
            <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                whileInView={{ scaleX: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
                className="relative"
            >
                <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
                {label && (
                    <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white dark:bg-slate-900 px-3.5 py-0.5 rounded-full text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest flex items-center gap-1.5 border border-slate-100/60 dark:border-slate-800/60">
                        {Icon && <Icon className="w-2.5 h-2.5" />}
                        {label}
                    </span>
                )}
            </motion.div>
        </div>
    );
}

/* ─── Scroll Reveal ─── */
function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ type: 'spring' as const, stiffness: 350, damping: 25, delay }}
        >
            {children}
        </motion.div>
    );
}

/* ═══════════════════════════════════════
   PATIENT QUICK HEALTH STATS DASHBOARD
   ═══════════════════════════════════════ */
function QuickHealthStats({ dashboard }: { dashboard: HealthDashboardData }) {
    const stats = [
        { icon: HeartPulse, label: 'الصحة العامة', value: dashboard.healthScoreAr, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-500/10', border: 'border-teal-100 dark:border-teal-800/40' },
        { icon: Droplets, label: 'الماء اليوم', value: dashboard.waterAr, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-800/40' },
        { icon: Flame, label: 'سلسلة', value: dashboard.streakAr, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-800/40' },
        { icon: Target, label: 'الأهداف', value: dashboard.goalsAr, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-100 dark:border-indigo-800/40' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
            className="px-4"
        >
            <div className="grid grid-cols-4 gap-2">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.05 * i, type: 'spring', stiffness: 400, damping: 25 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl ${stat.bg} border ${stat.border} shadow-sm cursor-pointer`}
                    >
                        <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center`}>
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <span className={`text-[15px] font-black ${stat.color}`}>{stat.value}</span>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">{stat.label}</span>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════
   HEALTH JOURNEY PROGRESS TIMELINE
   ═══════════════════════════════════════ */
function HealthJourneyTimeline({ dashboard }: { dashboard: HealthDashboardData }) {
    const icons = [CheckCircle, Brain, Stethoscope, Target, TrendingUp];

    // Compute progress line width based on completed steps
    const doneCount = dashboard.journeySteps.filter(s => s.status === 'done').length;
    const progressWidth = `${Math.round((doneCount / Math.max(dashboard.journeySteps.length - 1, 1)) * 100)}%`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="px-5"
        >
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 p-4 shadow-sm">
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-15 bg-teal-400 pointer-events-none" />

                <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                        <Activity className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-bold text-slate-800 dark:text-white">رحلتك العلاجية</h3>
                        <p className="text-[10px] text-slate-400">تتبع تقدمك في البرنامج</p>
                    </div>
                </div>

                <div className="flex items-center justify-between relative">
                    {/* Connecting line */}
                    <div className="absolute top-4 right-4 left-4 h-[2px] bg-slate-100 dark:bg-slate-700 z-0" />
                    <div className="absolute top-4 right-4 h-[2px] bg-gradient-to-l from-teal-500 to-teal-400 z-0" style={{ width: progressWidth }} />

                    {dashboard.journeySteps.map((step, i) => {
                        const Icon = icons[i] || CheckCircle;
                        const color = step.status === 'done' ? 'bg-teal-500' : step.status === 'current' ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600';
                        return (
                            <div key={step.label} className="flex flex-col items-center gap-1.5 relative z-10">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 * i, type: 'spring', stiffness: 400, damping: 15 }}
                                    className={`w-8 h-8 rounded-full ${color} flex items-center justify-center shadow-sm ${step.status === 'current' ? 'ring-4 ring-amber-200 dark:ring-amber-900/40' : ''}`}
                                >
                                    <Icon className={`w-3.5 h-3.5 ${step.status === 'pending' ? 'text-slate-500 dark:text-slate-400' : 'text-white'}`} />
                                </motion.div>
                                <span className={`text-[9px] font-bold ${step.status === 'current' ? 'text-amber-600 dark:text-amber-400' : step.status === 'done' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════
   DAILY MOTIVATION / HEALTH TIP CARD
   ═══════════════════════════════════════ */
function DailyMotivation() {
    const tips = [
        { text: 'كل خطوة صغيرة نحو صحتك تصنع فرق كبير على المدى البعيد', icon: Sparkles, gradient: 'from-violet-500 to-indigo-600' },
        { text: 'جسمك يقدر يتعافى — بس يحتاج منك الالتزام والصبر', icon: Heart, gradient: 'from-rose-500 to-pink-600' },
        { text: 'الطب الوظيفي يعالج السبب الحقيقي، مش بس الأعراض', icon: Brain, gradient: 'from-teal-500 to-emerald-600' },
        { text: 'صحتك النفسية والجسدية مرتبطين — اهتم بالاثنين', icon: HeartPulse, gradient: 'from-amber-500 to-orange-600' },
    ];

    const dayOfYear = useMemo(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }, []);

    const tip = tips[dayOfYear % tips.length];
    const TipIcon = tip.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="px-5"
        >
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tip.gradient} p-4 shadow-lg`}>
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl bg-white/10" />
                <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full blur-2xl bg-white/5" />
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '14px 14px' }} />

                <div className="relative z-10 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                        <TipIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1.5">💡 إلهام اليوم</p>
                        <p className="text-[13px] text-white font-bold leading-relaxed">{tip.text}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════
   QUICK ACTIONS BAR — Patient Only
   ═══════════════════════════════════════ */
function QuickActionsBar() {
    const actions = [
        { label: 'احجز موعد', icon: Calendar, href: createPageUrl('BookAppointment'), gradient: 'from-teal-600 to-emerald-600', shadow: 'shadow-teal-600/15' },
        { label: 'سجل أعراضك', icon: Activity, href: createPageUrl('BodyMap'), gradient: 'from-indigo-600 to-violet-600', shadow: 'shadow-indigo-600/15' },
        { label: 'ملفك الطبي', icon: Shield, href: createPageUrl('MedicalFile'), gradient: 'from-slate-700 to-slate-800', shadow: 'shadow-slate-700/15' },
    ];

    return (
        <div className="px-4">
            <div className="flex gap-2.5">
                {actions.map((action, i) => (
                    <Link key={action.label} href={action.href} className="flex-1" onClick={() => { haptic.tap(); uiSounds.navigate(); }}>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.05 * i, type: 'spring', stiffness: 400, damping: 25 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex flex-col items-center gap-2 py-3.5 px-3 rounded-2xl bg-gradient-to-br ${action.gradient} shadow-lg ${action.shadow} relative overflow-hidden`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0" />
                            <action.icon className="w-5 h-5 text-white relative z-10" />
                            <span className="text-[10.5px] font-bold text-white relative z-10">{action.label}</span>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════
   TRUST METRICS BAR — Visitor Only
   ═══════════════════════════════════════ */
function TrustMetricsBar() {
    const metrics = [
        { value: '+٣٠٠', label: 'مريض سعيد', icon: Heart },
        { value: '٨٧%', label: 'نسبة التحسن', icon: TrendingUp },
        { value: '+١٥', label: 'سنة خبرة', icon: Award },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="px-5"
        >
            <div className="flex items-center justify-between bg-white dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-700/60 shadow-sm">
                {metrics.map((m, i) => (
                    <React.Fragment key={m.label}>
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1">
                                <m.icon className="w-3.5 h-3.5 text-teal-500" />
                                <span className="text-[16px] font-black text-slate-800 dark:text-white">{m.value}</span>
                            </div>
                            <span className="text-[9.5px] font-bold text-slate-400">{m.label}</span>
                        </div>
                        {i < metrics.length - 1 && <div className="w-px h-8 bg-slate-100 dark:bg-slate-700" />}
                    </React.Fragment>
                ))}
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════
   VISITOR FLOW — Conversion-optimized funnel
   Hero → Trust Metrics → Care → Services → Social Proof → Shop → CTA
   ═══════════════════════════════════════════════ */
function VisitorFlow() {
    return (
        <div className="flex flex-col gap-7 pb-8">
            <DailyGreeting />

            {/* Trust metrics immediately after hero */}
            <TrustMetricsBar />

            <ZoneDivider icon={Stethoscope} label="خدماتنا" />

            <div className="content-visibility-auto" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 800px' }}>
                <ScrollReveal>
                    <ServicesPreview />
                </ScrollReveal>

                <ZoneDivider label="ثقة ونتائج" icon={Heart} />

                <div className="space-y-4">
                    <SectionHeader
                        title="قصص نجاح ومنهجنا"
                        subtitle="ناس تعافت بفضل الله"
                        Icon={Heart}
                        accentColor="var(--section-community)"
                    />
                    <ScrollReveal>
                        <TrustAndTestimonials />
                    </ScrollReveal>
                </div>

                {/* Daily Motivation for visitors */}
                <div className="my-7">
                    <DailyMotivation />
                </div>

                <ScrollReveal>
                    <ShopPreview />
                </ScrollReveal>

                <ScrollReveal>
                    <FinalCTA />
                </ScrollReveal>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   LOG TODAY PROMPT — When user hasn't logged yet
   ═══════════════════════════════════════════════ */
function LogTodayPrompt() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5"
        >
            <Link href="/quick-check-in" onClick={() => { haptic.tap(); uiSounds.navigate(); }}>
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-4 shadow-lg shadow-indigo-500/15">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[13px] font-bold text-white">التقييم الذكي السريع</p>
                            <p className="text-[10.5px] text-white/60 mt-0.5">دع النظام يحلل أعراضك ويوجهك للخطوة القادمة بدقة</p>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-white/60" />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════
   PATIENT FLOW — Prioritized patient experience
   Greeting → Quick Stats → Quick Actions → Care Hub →
   Journey Timeline → Services → Motivation → Shop
   ═══════════════════════════════════════════════ */
function PatientFlow() {
    const dashboard = useHealthDashboard();

    return (
        <div className="flex flex-col gap-7 pb-8">
            {/* 1. الترحيب والتقييم السريري (Daily Health Brief) */}
            <DailyGreeting />

            {/* 2. Quick Health Dashboard Stats — REAL DATA */}
            <QuickHealthStats dashboard={dashboard} />

            {/* Prompt to log today if not done yet */}
            {!dashboard.loading && !dashboard.hasLoggedToday && <LogTodayPrompt />}

            {/* 3. Quick Action Buttons */}
            <QuickActionsBar />

            {/* ═══ ZONE C: CARE & GUIDANCE ═══ */}
            <ZoneDivider label="رعايتك" icon={HeartPulse} />

            {/* 4. رعايتك الطبية — مركز متابعة الرعاية */}
            <div className="space-y-4">
                <SectionHeader
                    title="رعايتك الطبية"
                    subtitle="طبيبك ومواعيدك"
                    Icon={Stethoscope}
                    accentColor="var(--section-medical)"
                />
                <ScrollReveal>
                    <div className="px-5">
                        <CareSessionHub />
                    </div>
                </ScrollReveal>
            </div>

            {/* 5. Health Journey Timeline — REAL DATA */}
            <ScrollReveal delay={0.1}>
                <HealthJourneyTimeline dashboard={dashboard} />
            </ScrollReveal>

            {/* ═══ ZONE D: CONVERSION & VALUE ═══ */}
            <div className="content-visibility-auto" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 600px' }}>
                <ZoneDivider label="الرعاية الداعمة والصيدلية" icon={Sparkles} />

                {/* Daily Motivation Card */}
                <DailyMotivation />

                {/* 6. البرامج والخدمات */}
                <div className="mt-6">
                    <ScrollReveal>
                        <ServicesPreview />
                    </ScrollReveal>
                </div>

                {/* 7. صيدلية طِبرَا */}
                <ScrollReveal>
                    <ShopPreview />
                </ScrollReveal>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════ */
export default function HomePage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 pb-6">
            <SEO {...pageSEO.home} />
            <HomeStructuredData />

            {user ? <PatientFlow /> : <VisitorFlow />}
        </div>
    );
}
