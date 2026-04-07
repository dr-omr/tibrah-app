// pages/my-care.tsx
// Clinical Care Hub — premium patient care command center
// Enhanced: richer appointment card, premium tabs, denser action cards, better hierarchy

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import {
    Calendar, FileText, Pill, TestTube2, MessageCircle,
    ChevronLeft, Clock, Plus, Stethoscope, Shield, Heart,
    ArrowLeft, AlertCircle, Video, Sparkles, Activity,
    CheckCircle2, User, Zap, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import SEO from '@/components/common/SEO';
import { evaluateCrisisState, CrisisState } from '@/lib/crisisEngine';
import dynamic from 'next/dynamic';

const TodayCarePlan = dynamic(() => import('@/components/care-hub/TodayCarePlan').then(mod => mod.TodayCarePlan), { ssr: false });
const SOSRescueView = dynamic(() => import('@/components/care-hub/SOSRescueView'), { ssr: false });

// Tab configuration
const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: Heart },
    { id: 'medications', label: 'خطتي العلاجية', icon: Sparkles },
    { id: 'appointments', label: 'المواعيد', icon: Calendar },
    { id: 'files', label: 'ملفي الطبي', icon: FileText },
];

// Quick action configuration — richer with subtitles and accent colors
const quickActions = [
    {
        href: 'MedicalFile',
        icon: FileText,
        iconGradient: 'from-blue-500 to-blue-600',
        iconGlow: 'shadow-blue-500/25',
        title: 'ملفي الطبي',
        subtitle: 'السجل والحساسيات',
        accent: 'border-blue-100 dark:border-blue-800/30',
    },
    {
        href: 'BookAppointment',
        icon: Calendar,
        iconGradient: 'from-teal-500 to-emerald-500',
        iconGlow: 'shadow-teal-500/25',
        title: 'احجز جلسة',
        subtitle: 'تشخيصية أو متابعة',
        accent: 'border-emerald-100 dark:border-emerald-800/30',
    },
    {
        href: 'SymptomAnalysis',
        icon: Stethoscope,
        iconGradient: 'from-violet-500 to-purple-600',
        iconGlow: 'shadow-violet-500/25',
        title: 'فحص الأعراض',
        subtitle: 'تحليل بالذكاء الاصطناعي',
        accent: 'border-purple-100 dark:border-purple-800/30',
    },
    {
        href: 'HealthTracker',
        icon: Activity,
        iconGradient: 'from-orange-500 to-red-500',
        iconGlow: 'shadow-orange-500/25',
        title: 'تتبع صحتي',
        subtitle: 'المزاج والطاقة والنوم',
        accent: 'border-orange-100 dark:border-orange-800/30',
    },
];

export default function MyCare() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [crisisState, setCrisisState] = useState<CrisisState | null>(null);

    // Evaluate crisis state on load
    React.useEffect(() => {
        if (user?.id) {
            evaluateCrisisState(user.id).then(setCrisisState);
        }
    }, [user?.id]);

    // Fetch appointments
    const { data: appointments = [] } = useQuery({
        queryKey: ['appointments', user?.id],
        queryFn: () => db.entities.Appointment.listForUser(user?.id || ''),
        enabled: !!user,
    });

    // Fetch medications
    const { data: medications = [] } = useQuery({
        queryKey: ['medications', user?.id],
        queryFn: () => db.entities.Medication.listForUser(user?.id || ''),
        enabled: !!user,
    });

    // Fetch active clinical cases
    const { data: activeCases = [] } = useQuery({
        queryKey: ['clinical_cases', user?.id],
        queryFn: () => db.entities.ClinicalCase.listForUser(user?.id || ''),
        enabled: !!user,
    });
    const activeCase = activeCases.find((c: any) => c.status !== 'closed');

    const upcomingAppointments = appointments.filter(
        (a: any) => new Date(a.date) >= new Date()
    );

    // ─── Extract Latest Psychosomatic Protocol ───
    const latestAptWithEmotion = [...appointments]
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .find((a: any) => a.emotional_diagnostic);

    const psychosomaticProtocol = latestAptWithEmotion?.emotional_diagnostic || null;

    // ─── NOT LOGGED IN — Premium auth gate ───
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center max-w-sm">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg shadow-primary/20">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                        سجّل الدخول لإدارة رعايتك
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                        تتبع مواعيدك، خطة علاجك، أدويتك، وملفك الطبي في مكان واحد
                    </p>
                    <Link href={createPageUrl('Login')}>
                        <Button className="w-full h-13 rounded-3xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-base shadow-lg shadow-primary/20">
                            تسجيل الدخول
                            <ArrowLeft className="w-4 h-4 mr-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // ─── LOGGED IN — Full care hub ───
    return (
        <div className="min-h-screen pb-8 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
            <SEO title="رعايتي — طِبرَا" description="إدارة رعايتك الصحية مع د. عمر العماد" />

            {/* ─── STICKY HEADER with premium tab bar ─── */}
            <div className="sticky top-0 z-30" style={{ background: 'rgba(240,253,250,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(13,148,136,0.08)' }}>
                {/* Title area with patient greeting */}
                <div className="px-5 pt-4 pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-[20px] font-black text-slate-800">رعايتي</h1>
                            <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">
                                متابعة صحتك مع د. عمر العماد
                            </p>
                        </div>
                        {/* Patient avatar */}
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md shadow-primary/20">
                            <span className="text-white font-bold text-sm">
                                {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tab bar — pill style with stronger active indicator */}
                <div className="flex px-4 gap-1.5 pb-2.5 overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all min-w-fit ${isActive
                                    ? 'text-white bg-primary shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                                    }`}
                            >
                                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : ''}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ─── CONTENT AREA ─── */}
            <div className="px-4 pt-4">
                <AnimatePresence mode="wait">

                    {/* 🚨 CRISIS OVERRIDE 🚨 */}
                    {crisisState?.level === 'CRISIS' && (
                        <motion.div
                            key="crisis"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mb-8"
                        >
                            <SOSRescueView
                                crisisState={crisisState}
                                onDismiss={() => setCrisisState({ ...crisisState, level: 'NORMAL' })}
                            />
                        </motion.div>
                    )}

                    {/* ╔═══ OVERVIEW TAB ═══╗ */}
                    {activeTab === 'overview' && crisisState?.level !== 'CRISIS' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-5"
                        >
                            {/* ─── ACTIVE CASE TRACKER ─── */}
                            {activeCase && (
                                <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-3xl p-5 shadow-lg shadow-indigo-900/20 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
                                    
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="bg-indigo-500/30 text-indigo-100 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                                <Activity className="w-3 h-3" />
                                                ملف طبي نشط
                                            </span>
                                            <span className="text-xs font-bold text-indigo-200">
                                                {activeCase.triage_level === 'manageable' ? 'مستقر' : 
                                                 activeCase.triage_level === 'emergency' ? 'حرج' : 'يتطلب مراجعة'}
                                            </span>
                                        </div>
                                        
                                        <h3 className="font-bold text-lg mb-1">{activeCase.chief_complaint === 'chest_pain' ? 'ألم في الصدر' : 'تقييم سريري قيد المعالجة'}</h3>
                                        <p className="text-indigo-200 text-xs leading-relaxed mb-4">
                                            لقد قمت بإرسال بيانتك السريرية مؤخراً. يرجى المتابعة لإكمال خطة الرعاية الخاصة بك.
                                        </p>
                                        
                                        <div className="flex gap-2">
                                            <Button className="flex-1 bg-white hover:bg-slate-50 text-indigo-900 font-bold h-10 text-xs rounded-xl" onClick={() => window.location.href = '/digital-services'}>
                                                الخدمات المتاحة
                                            </Button>
                                            <Button variant="outline" className="flex-1 border-indigo-400 text-indigo-100 hover:bg-indigo-700/50 hover:text-white font-bold h-10 text-xs rounded-xl bg-transparent">
                                                تحديث الحالة
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ─── NEXT APPOINTMENT — iOS grouped card ─── */}
                            <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            موعدك القادم
                                        </h3>
                                        <Link href={createPageUrl('MyAppointments')} className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline">
                                            عرض الكل
                                            <ChevronLeft className="w-3 h-3" />
                                        </Link>
                                    </div>

                                    {upcomingAppointments.length > 0 ? (
                                        <div className="bg-slate-50/80 dark:bg-slate-700/30 rounded-xl p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-11 h-11 rounded-3xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center flex-shrink-0">
                                                    <Stethoscope className="w-5 h-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                                                        {(upcomingAppointments[0] as any).session_type || 'جلسة تشخيصية'}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{(upcomingAppointments[0] as any).date}</span>
                                                        {(upcomingAppointments[0] as any).time && <>
                                                            <span className="text-slate-300 dark:text-slate-600">|</span>
                                                            <Clock className="w-3 h-3" />
                                                            <span>{(upcomingAppointments[0] as any).time}</span>
                                                        </>}
                                                    </p>
                                                    {/* Status + preparation hint */}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            مؤكد
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                                                            <Video className="w-3 h-3" />
                                                            عبر الفيديو
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Preparation note */}
                                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-600/30">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                                                    <Sparkles className="w-3 h-3 text-amber-500" />
                                                    جهّز أسئلتك وأي تحاليل سابقة قبل الموعد
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Empty state — encouraging CTA */
                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 text-center">
                                            <div className="w-14 h-14 mx-auto mb-3 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                                                <Calendar className="w-7 h-7 text-slate-400" />
                                            </div>
                                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">لا توجد مواعيد قادمة</p>
                                            <p className="text-xs text-slate-400 mb-4">ابدأ رحلتك مع د. عمر بجلسة تشخيصية شاملة</p>
                                            <Link href={createPageUrl('BookAppointment')} className="inline-block">
                                                <Button className="h-10 rounded-full bg-primary text-white text-sm font-semibold px-6">
                                                    <Plus className="w-4 h-4 ml-1" />
                                                    احجز جلسة
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ─── TODAY'S CARE PLAN ─── */}
                            <TodayCarePlan userId={user.id} psychosomaticProtocol={psychosomaticProtocol} />

                            {/* ─── SESSION AGENDA (What will the doctor discuss?) ─── */}
                            {psychosomaticProtocol && (
                                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-3xl p-5 border border-amber-100/50 dark:border-amber-800/20 relative overflow-hidden">
                                    {/* Decorative element */}
                                    <div className="absolute -top-4 -left-4 w-16 h-16 bg-amber-400/10 rounded-full blur-xl" />

                                    <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-2 relative z-10">
                                        <MessageCircle className="w-4 h-4" />
                                        أجندة الجلسة القادمة
                                    </h3>
                                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium relative z-10">
                                        سيقوم د. عمر بمناقشة مدى تحسن الارتباط بين ({psychosomaticProtocol.physical_complaint || 'الأعراض الجسدية'}) وبين محفزات ({psychosomaticProtocol.emotional_diagnostic_pattern}). يرجى تدوين أي ملاحظات أو مواقف حدثت لك هذا الأسبوع تتعلق بهذا النمط في دفتر يومياتك.
                                    </p>
                                </div>
                            )}

                            {/* ─── QUICK ACTIONS — premium action modules ─── */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-3 px-1">
                                    <Zap className="w-3.5 h-3.5 text-primary" />
                                    إجراءات سريعة
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {quickActions.map((action, i) => {
                                        const Icon = action.icon;
                                        return (
                                            <Link
                                                key={i}
                                                href={createPageUrl(action.href)}
                                                className="bg-white dark:bg-slate-800/80 rounded-3xl p-4 border border-slate-200/60 dark:border-slate-700/50 shadow-sm active:scale-[0.97] transition-transform"
                                            >
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.iconGradient} flex items-center justify-center mb-2.5`}>
                                                    <Icon className="w-5 h-5 text-white" />
                                                </div>
                                                <h4 className="text-sm font-bold text-slate-800 dark:text-white">{action.title}</h4>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">{action.subtitle}</p>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ─── WHATSAPP DIRECT — full-width CTA ─── */}
                            <a
                                href="https://wa.me/967771447111?text=مرحباً%20د.%20عمر"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-white dark:bg-slate-800/80 rounded-3xl p-4 border border-slate-200/60 dark:border-slate-700/50 shadow-sm active:scale-[0.98] transition-transform"
                            >
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                                    <MessageCircle className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">تواصل مع د. عمر</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">رسالة مباشرة عبر واتساب</p>
                                </div>
                                <ChevronLeft className="w-4 h-4 text-green-400 flex-shrink-0" />
                            </a>

                            {/* ─── MEDICAL DISCLAIMER ─── */}
                            <div className="bg-amber-50/80 dark:bg-amber-900/15 rounded-xl p-3 flex gap-2.5 items-start border border-amber-100/50 dark:border-amber-800/20">
                                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed font-medium">
                                    هذه الأدوات مساعدة ولا تغني عن الاستشارة الطبية المباشرة. استشر د. عمر للتشخيص والعلاج.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* ╔═══ APPOINTMENTS TAB ═══╗ */}
                    {activeTab === 'appointments' && (
                        <motion.div
                            key="appointments"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-slate-800 dark:text-white">المواعيد</h3>
                                <Link href={createPageUrl('BookAppointment')}>
                                    <Button size="sm" className="h-9 rounded-full bg-primary text-white text-xs font-semibold">
                                        <Plus className="w-3.5 h-3.5 ml-1" />
                                        حجز جديد
                                    </Button>
                                </Link>
                            </div>

                            {appointments.length > 0 ? (
                                <div className="space-y-3">
                                    {appointments.map((apt: any) => (
                                        <div key={apt.id} className="bg-white dark:bg-slate-800/80 rounded-3xl p-4 border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center flex-shrink-0">
                                                    <Stethoscope className="w-5 h-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                                                        {apt.session_type === 'consultation' ? 'استشارة طب وظيفي' : apt.session_type === 'therapy' ? 'علاج بالترددات' : 'متابعة دورية'}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                                                        <Clock className="w-3 h-3" />
                                                        {apt.date} — {apt.time}
                                                    </p>
                                                    {/* DISPLAY DUAL DIMENSION */}
                                                    {(apt.health_concern || apt.emotional_diagnostic || apt.emotional_context) && (
                                                        <div className="mt-3 space-y-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 text-[11px]">
                                                            {apt.health_concern && (
                                                                <div>
                                                                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">الشكوى الجسدية:</span>
                                                                    <p className="text-slate-500 line-clamp-2">{apt.health_concern}</p>
                                                                </div>
                                                            )}
                                                            {(apt.emotional_diagnostic || apt.emotional_context) && (
                                                                <div className={apt.health_concern ? 'pt-2 border-t border-slate-200 dark:border-slate-700/50' : ''}>
                                                                    <span className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1 mb-0.5">
                                                                        <Heart className="w-3 h-3" />
                                                                        النمط التشخيصي الشعوري:
                                                                    </span>
                                                                    <p className="text-slate-500 line-clamp-2">
                                                                        {apt.emotional_diagnostic ? apt.emotional_diagnostic.emotional_diagnostic_pattern : ''}
                                                                        {apt.emotional_diagnostic?.psychosomatic_dimension ? ` — ${apt.emotional_diagnostic.psychosomatic_dimension}` : (!apt.emotional_diagnostic && apt.emotional_context ? apt.emotional_context : '')}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${apt.status === 'confirmed'
                                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                    : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                                                    }`}>
                                                    {apt.status === 'confirmed' ? 'مؤكد' : 'معلّق'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm font-semibold mb-1">لا توجد مواعيد بعد</p>
                                    <p className="text-slate-400 text-xs mb-4">احجز جلستك الأولى مع د. عمر</p>
                                    <Link href={createPageUrl('BookAppointment')}>
                                        <Button className="h-10 rounded-full bg-primary text-white text-sm font-semibold px-6">
                                            <Plus className="w-4 h-4 ml-1" />
                                            احجز الآن
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ╔═══ TREATMENT PLAN & MEDICATIONS TAB ═══╗ */}
                    {activeTab === 'medications' && (
                        <motion.div
                            key="medications"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {/* ─── Treatment Status (Dual-Dimension) ─── */}
                            {medications.length > 0 || psychosomaticProtocol ? (
                                <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-5 text-white shadow-lg shadow-violet-500/30 relative overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-1.5 opacity-90 bg-black/20 px-2.5 py-1 rounded-full w-fit mb-2">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold">البروتوكول العلاجي المزدوج</span>
                                        </div>
                                        <h2 className="text-[18px] font-black leading-tight mb-2 text-white">الخطة المدمجة (جسدية ونفس-جسدية)</h2>
                                        <p className="text-[12px] text-violet-100 leading-relaxed max-w-[90%]">
                                            تتضمن خطتك مسارين متوازيين لضمان التشافي الجذري: المسار العضوي (المكملات) والمسار الشعوري (التنظيم العصبي).
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
                                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-violet-400" />
                                    </div>
                                    <h3 className="text-[15px] font-bold text-slate-800 dark:text-white mb-1">لم يتم تحديد بروتوكول علاجي بعد</h3>
                                    <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4 max-w-[280px] mx-auto">
                                        احجز جلسة تشخيصية مع د. عمر لوضع خطة علاجية مخصصة لحالتك.
                                    </p>
                                    <Link href={createPageUrl('BookAppointment')}>
                                        <Button className="h-10 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-6 shadow-sm">
                                            احجز جلسة تشخيصية
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            {/* ─── Psychosomatic Track ─── */}
                            {psychosomaticProtocol && (
                                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl p-5 border border-indigo-100 dark:border-indigo-800/30">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                            <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-[15px] font-bold text-indigo-900 dark:text-indigo-100">المسار النفس-جسدي والشعوري</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Heart className="w-4 h-4 text-rose-500" />
                                                <h4 className="font-bold text-sm text-slate-800 dark:text-white">التركيز العلاجي الحالي</h4>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                                                {psychosomaticProtocol.emotional_diagnostic_pattern}
                                            </p>
                                        </div>

                                        {psychosomaticProtocol.behavioral_contributors && psychosomaticProtocol.behavioral_contributors.length > 0 && (
                                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                                                <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-2">أهداف المراقبة الذاتية (Somatic Tracking)</h4>
                                                <ul className="space-y-2">
                                                    {psychosomaticProtocol.behavioral_contributors.map((bc: string, i: number) => (
                                                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                            <div className="min-w-[4px] h-[4px] disabled rounded-full bg-indigo-400 mt-1.5" />
                                                            {bc}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-3 border border-amber-100/50 dark:border-amber-800/20 flex flex-col gap-1.5">
                                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">أجندة الجلسة القادمة — نقاش مقترح مع د.عمر</span>
                                            <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                                                ما مدى تحسن الارتباط بين ({psychosomaticProtocol.physical_complaint}) والمؤثر الشعوري الذي تم تشخيصه؟
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ─── Prescriptions tailored for this phase ─── */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[15px] font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        <Pill className="w-5 h-5 text-violet-500" />
                                        المسار العضوي (المكملات)
                                    </h3>
                                    {medications.length > 0 && (
                                        <Link href={createPageUrl('Shop')}>
                                            <Button size="sm" variant="ghost" className="h-8 text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/30 text-[11px] font-bold px-2">
                                                تسوق البدائل
                                            </Button>
                                        </Link>
                                    )}
                                </div>

                                {medications.length > 0 ? (
                                    <div className="space-y-3">
                                        {/* Clinical Insight */}
                                        <div className="bg-emerald-50/80 rounded-2xl p-3.5 border border-emerald-100/50 flex items-start gap-2.5">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                            <p className="text-[11px] text-emerald-800 leading-relaxed font-semibold mt-0.5">
                                                هذه المكملات تم تحديدها بناءً على جلستك التشخيصية. الالتزام بالجرعات اليومية ضروري لتحقيق أفضل النتائج.
                                            </p>
                                        </div>

                                        {medications.map((med: any) => (
                                            <div key={med.id} className="bg-white dark:bg-slate-800/80 rounded-3xl p-4 border border-slate-200/60 dark:border-slate-700/50 shadow-sm relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-violet-400 to-purple-500" />
                                                <div className="flex items-start gap-3 pl-2">
                                                    <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100 transition-colors">
                                                        <Pill className="w-6 h-6 text-violet-500" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-0.5">
                                                            <p className="text-[14px] font-bold text-slate-800 dark:text-white leading-tight">{med.name}</p>
                                                            <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-100">متوفر بالصيدلية</span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 font-semibold mb-1">{med.dosage} — {med.frequency}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700/50 border-dashed">
                                        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                            <Pill className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 text-sm font-bold mb-1">لا توجد مكملات محددة</p>
                                        <p className="text-slate-400 text-[11px] mb-4 max-w-[200px] mx-auto leading-relaxed">لم يتم إدراج مكملات خاصة بهذه المرحلة بعد.</p>
                                        <Link href={createPageUrl('BookAppointment')}>
                                            <Button className="h-9 rounded-full bg-slate-800 text-white text-xs font-bold px-5 shadow-sm">
                                                احجز جلسة للتقييم
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ╔═══ FILES TAB ═══╗ */}
                    {activeTab === 'files' && (
                        <motion.div
                            key="files"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-slate-800 dark:text-white">ملفي الطبي</h3>
                                <Link href={createPageUrl('MedicalFile')}>
                                    <Button size="sm" variant="outline" className="h-9 rounded-full text-xs font-semibold border-slate-200 dark:border-slate-700 text-primary">
                                        عرض التفاصيل
                                        <ChevronLeft className="w-3 h-3 mr-1" />
                                    </Button>
                                </Link>
                            </div>

                            {/* Quick medical info cards */}
                            <div className="grid grid-cols-2 gap-3">
                                <Link href={createPageUrl('MedicalFile')}
                                    className="bg-white dark:bg-slate-800/80 rounded-3xl p-4 border border-slate-200/60 dark:border-slate-700/50 shadow-sm active:scale-[0.97] transition-transform"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-blue-100/80 dark:bg-blue-900/20 flex items-center justify-center mb-2.5">
                                        <User className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">البيانات الشخصية</p>
                                    <p className="text-xs text-slate-400 mt-0.5 font-medium">فصيلة الدم، الطول، الوزن</p>
                                </Link>
                                <Link href={createPageUrl('MedicalFile')}
                                    className="bg-white dark:bg-slate-800/80 rounded-3xl p-4 border border-slate-200/60 dark:border-slate-700/50 shadow-sm active:scale-[0.97] transition-transform"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/20 flex items-center justify-center mb-2.5">
                                        <TestTube2 className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">التحاليل</p>
                                    <p className="text-xs text-slate-400 mt-0.5 font-medium">رفع وعرض نتائج التحاليل</p>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
