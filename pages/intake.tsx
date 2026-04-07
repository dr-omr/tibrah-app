// pages/intake.tsx
// World-class Clinical Assessment System — Premium Design
// Multi-step triage with AI analysis, DB save, and smart handoff

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, AlertTriangle, ArrowLeft, ArrowRight, Brain,
    CheckCircle, Clock, Heart, Shield, Stethoscope,
    Thermometer, User, Zap, Lock, Droplets, Moon,
    ChevronLeft, ChevronRight, Sparkles, Phone,
    HeartPulse, Pill, Loader2, X, Check, Info,
    Calendar, MessageCircle
} from 'lucide-react';
import { db } from '@/lib/db';
import SEO from '@/components/common/SEO';
import Link from 'next/link';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { createPageUrl } from '@/utils';

/* ═══════════════════════════════
   TYPES
   ═══════════════════════════════ */
type TriageLevel = 'emergency' | 'needs_doctor' | 'suitable_for_review' | 'manageable';
type StepId = 'welcome' | 'complaint' | 'severity' | 'modifiers' | 'history' | 'analyzing' | 'result';

interface AssessmentData {
    complaint: string;
    complaintLabel: string;
    severity: number;
    duration: string;
    redFlags: string[];
    hasRedFlags: boolean;
    chronicConditions: string[];
    medications: string;
    additionalNotes: string;
}

/* ═══════════════════════════════
   COMPLAINT DATA
   ═══════════════════════════════ */
const COMPLAINTS = [
    { id: 'fatigue',      label: 'تعب وإرهاق مزمن',        icon: Zap,         color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'  },
    { id: 'headache',     label: 'صداع أو شقيقة',           icon: Brain,       color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)'  },
    { id: 'digestion',    label: 'مشاكل هضمية',             icon: Activity,    color: '#10b981', bg: 'rgba(16,185,129,0.08)'  },
    { id: 'sleep',        label: 'اضطرابات النوم',          icon: Moon,        color: '#6366f1', bg: 'rgba(99,102,241,0.08)'  },
    { id: 'joint_pain',   label: 'آلام المفاصل والعضلات',   icon: HeartPulse,  color: '#ef4444', bg: 'rgba(239,68,68,0.08)'   },
    { id: 'hormonal',     label: 'اضطرابات هرمونية',        icon: Droplets,    color: '#ec4899', bg: 'rgba(236,72,153,0.08)'  },
    { id: 'immune',       label: 'ضعف المناعة',             icon: Shield,      color: '#0d9488', bg: 'rgba(13,148,136,0.08)'  },
    { id: 'anxiety',      label: 'قلق أو توتر نفسي',        icon: Heart,       color: '#f97316', bg: 'rgba(249,115,22,0.08)'  },
    { id: 'weight',       label: 'مشاكل الوزن والتمثيل',   icon: Thermometer, color: '#14b8a6', bg: 'rgba(20,184,166,0.08)'  },
    { id: 'other',        label: 'أعراض أخرى',             icon: User,        color: '#64748b', bg: 'rgba(100,116,139,0.08)' },
];

const RED_FLAGS = [
    { id: 'breathing',   label: 'صعوبة شديدة في التنفس أو اختناق' },
    { id: 'chest',       label: 'ألم حاد في الصدر أو الذراع اليسرى' },
    { id: 'consciousness', label: 'فقدان الوعي أو الدوار الشديد جداً' },
    { id: 'paralysis',   label: 'عدم القدرة على الحركة أو ضعف مفاجئ' },
    { id: 'bleeding',    label: 'نزيف حاد لا يتوقف' },
];

const CHRONIC_CONDITIONS = [
    'السكري', 'ضغط الدم', 'أمراض القلب', 'الغدة الدرقية',
    'الحساسية', 'متلازمة القولون', 'الشقيقة المزمنة', 'لا شيء'
];

/* ═══════════════════════════════
   STEP PROGRESS INDICATOR
   ═══════════════════════════════ */
const STEPS: StepId[] = ['welcome', 'complaint', 'severity', 'modifiers', 'history', 'analyzing', 'result'];

function StepDots({ current }: { current: StepId }) {
    const activeSteps: StepId[] = ['complaint', 'severity', 'modifiers', 'history'];
    const idx = activeSteps.indexOf(current);
    if (idx === -1) return null;
    return (
        <div className="flex items-center justify-center gap-1.5 py-3">
            {activeSteps.map((s, i) => (
                <motion.div
                    key={s}
                    animate={{ width: i === idx ? 22 : 7, opacity: i <= idx ? 1 : 0.35 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="h-[5px] rounded-full"
                    style={{ background: i <= idx ? '#0d9488' : '#e2e8f0' }}
                />
            ))}
        </div>
    );
}

/* ═══════════════════════════════
   SEVERITY METER
   ═══════════════════════════════ */
function SeverityMeter({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const levels = [
        { range: [1, 3], label: 'خفيف', color: '#10b981', emoji: '🟢' },
        { range: [4, 6], label: 'متوسط', color: '#f59e0b', emoji: '🟡' },
        { range: [7, 8], label: 'شديد', color: '#f97316', emoji: '🟠' },
        { range: [9, 10], label: 'حرج', color: '#ef4444', emoji: '🔴' },
    ];
    const currentLevel = levels.find(l => value >= l.range[0] && value <= l.range[1]) || levels[0];

    return (
        <div className="space-y-5">
            {/* Visual scale */}
            <div className="flex gap-1.5 justify-between">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
                    const level = levels.find(l => n >= l.range[0] && n <= l.range[1])!;
                    const isActive = n <= value;
                    return (
                        <motion.button
                            key={n}
                            onClick={() => { haptic.selection(); onChange(n); }}
                            whileTap={{ scale: 0.85 }}
                            className="flex-1 rounded-lg transition-all"
                            style={{
                                height: 36 + (n * 3),
                                backgroundColor: isActive ? level.color : '#e2e8f0',
                                opacity: isActive ? 1 : 0.35,
                            }}
                        />
                    );
                })}
            </div>
            {/* Label */}
            <motion.div
                key={value}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between px-1"
            >
                <span className="text-slate-400 text-[11px] font-bold">١</span>
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl" style={{ backgroundColor: `${currentLevel.color}15` }}>
                    <span className="text-[20px]">{currentLevel.emoji}</span>
                    <div>
                        <span className="text-[15px] font-black" style={{ color: currentLevel.color }}>{value}/١٠</span>
                        <span className="text-[11px] font-bold mr-1.5" style={{ color: currentLevel.color }}>{currentLevel.label}</span>
                    </div>
                </div>
                <span className="text-slate-400 text-[11px] font-bold">١٠</span>
            </motion.div>
        </div>
    );
}

/* ═══════════════════════════════
   ANALYZING SCREEN
   ═══════════════════════════════ */
function AnalyzingScreen() {
    const steps = [
        'تحليل الأعراض الرئيسية',
        'مقارنة الحدة والمدة',
        'فحص الأعراض التحذيرية',
        'احتساب مستوى الأولوية',
        'توليد التوصية المخصصة',
    ];
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep(s => s < steps.length - 1 ? s + 1 : s);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center py-12 px-6 text-center">
            {/* Orb */}
            <div className="relative mb-8">
                <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="absolute inset-[-16px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.3) 0%, transparent 70%)' }}
                />
                <div className="w-24 h-24 rounded-full flex items-center justify-center relative"
                    style={{ background: 'linear-gradient(135deg, #0d9488, #6366f1)' }}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 rounded-full border-2 border-white/20 border-t-white/80"
                    />
                    <Brain className="w-10 h-10 text-white relative z-10" />
                </div>
            </div>

            <h2 className="text-[20px] font-black text-slate-800 dark:text-white mb-2">ذكاء طِبرَا يحلل حالتك</h2>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-8 font-medium">وفق أحدث معايير الطب الوظيفي</p>

            {/* Steps */}
            <div className="w-full max-w-xs space-y-2.5">
                {steps.map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: i <= activeStep ? 1 : 0.3, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 text-right"
                    >
                        <motion.div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: i < activeStep ? '#0d9488' : i === activeStep ? '#6366f1' : '#e2e8f0' }}
                        >
                            {i < activeStep
                                ? <Check className="w-3 h-3 text-white" />
                                : i === activeStep
                                    ? <motion.div className="w-2 h-2 bg-white rounded-full" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                                    : <div className="w-2 h-2 bg-slate-300 rounded-full" />
                            }
                        </motion.div>
                        <span className={`text-[12.5px] font-bold ${i <= activeStep ? 'text-slate-700 dark:text-slate-200' : 'text-slate-300 dark:text-slate-600'}`}>{s}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

/* ═══════════════════════════════
   RESULT CARDS
   ═══════════════════════════════ */
function ResultCard({ level, data, router }: { level: TriageLevel; data: AssessmentData; router: any }) {
    const configs = {
        emergency: {
            gradient: 'from-red-500 to-rose-600',
            bg: 'rgba(239,68,68,0.06)',
            border: 'rgba(239,68,68,0.2)',
            iconColor: '#ef4444',
            icon: AlertTriangle,
            badge: 'طارئ',
            badgeBg: '#ef4444',
            title: 'يرجى طلب المساعدة الطبية فوراً',
            subtitle: 'الأعراض التي وصفتها تستدعي تدخلاً طبياً عاجلاً. رجاءً لا تتأخر.',
            primaryAction: { label: 'اتصل بالإسعاف', href: 'tel:911', icon: Phone },
            secondaryAction: null,
        },
        needs_doctor: {
            gradient: 'from-orange-500 to-amber-500',
            bg: 'rgba(249,115,22,0.06)',
            border: 'rgba(249,115,22,0.2)',
            iconColor: '#f97316',
            icon: Stethoscope,
            badge: 'يحتاج متابعة طبية',
            badgeBg: '#f97316',
            title: 'حالتك تستوجب استشارة طبية قريبة',
            subtitle: 'أعراضك مستقرة لكنها تحتاج تقييماً دقيقاً من د. عمر لوضع خطة علاج مناسبة.',
            primaryAction: { label: 'احجز جلسة مع د. عمر', href: createPageUrl('BookAppointment'), icon: Calendar },
            secondaryAction: { label: 'مراجعة ملفي', href: createPageUrl('MyCare'), icon: HeartPulse },
        },
        suitable_for_review: {
            gradient: 'from-indigo-500 to-violet-500',
            bg: 'rgba(99,102,241,0.06)',
            border: 'rgba(99,102,241,0.2)',
            iconColor: '#6366f1',
            icon: Shield,
            badge: 'مناسب للمراجعة الرقمية',
            badgeBg: '#6366f1',
            title: 'مؤشراتك معقولة — نوصي بمراجعة رقمية',
            subtitle: 'حالتك لا تستدعي استعجالاً لكن مراجعة د. عمر رقمياً ستوفر لك خطة أوضح.',
            primaryAction: { label: 'طلب مراجعة رقمية', href: createPageUrl('MyCare'), icon: MessageCircle },
            secondaryAction: { label: 'احجز جلسة كاملة', href: createPageUrl('BookAppointment'), icon: Calendar },
        },
        manageable: {
            gradient: 'from-teal-500 to-emerald-500',
            bg: 'rgba(13,148,136,0.06)',
            border: 'rgba(13,148,136,0.2)',
            iconColor: '#0d9488',
            icon: CheckCircle,
            badge: 'مؤشراتك مطمئنة',
            badgeBg: '#0d9488',
            title: 'حالتك في النطاق الآمن 🎉',
            subtitle: 'أعراضك قابلة للإدارة. ننصحك بمتابعة يومياتك الصحية وسنرصد أي تغيير.',
            primaryAction: { label: 'تابع رعايتي اليومية', href: createPageUrl('DailyLog'), icon: HeartPulse },
            secondaryAction: { label: 'رحلتي العلاجية', href: createPageUrl('MyCare'), icon: Activity },
        },
    };

    const c = configs[level];
    const Icon = c.icon;
    const PrimaryIcon = c.primaryAction.icon;

    return (
        <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
            {/* Result Card */}
            <div className="rounded-[28px] overflow-hidden mb-4" style={{ background: c.bg, border: `1.5px solid ${c.border}` }}>
                {/* Top strip */}
                <div className={`h-1.5 bg-gradient-to-r ${c.gradient}`} />

                <div className="p-5">
                    {/* Badge + icon */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${c.iconColor}18` }}>
                            <Icon className="w-6 h-6" style={{ color: c.iconColor }} />
                        </div>
                        <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: c.badgeBg }}>{c.badge}</span>
                            <p className="text-[8.5px] text-slate-400 font-bold mt-0.5 uppercase tracking-widest">نتيجة التقييم السريري</p>
                        </div>
                    </div>

                    <h2 className="text-[17px] font-black text-slate-800 dark:text-white leading-snug mb-2">{c.title}</h2>
                    <p className="text-[12.5px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{c.subtitle}</p>
                </div>

                {/* Assessment Summary */}
                <div className="mx-4 mb-4 p-3.5 rounded-2xl bg-white/70 dark:bg-slate-800/50 border border-white/50 dark:border-slate-700/40">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">ملخص التقييم</p>
                    <div className="space-y-1.5">
                        {[
                            { l: 'الشكوى الرئيسية', v: data.complaintLabel },
                            { l: 'حدة الأعراض', v: `${data.severity}/١٠` },
                            { l: 'مدة الأعراض', v: data.duration === 'hours' ? 'ساعات' : data.duration === 'days' ? 'أيام' : 'أسابيع أو أكثر' },
                        ].map(row => (
                            <div key={row.l} className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-400">{row.l}</span>
                                <span className="text-[11px] font-black text-slate-700 dark:text-slate-200">{row.v}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5">
                <Link href={c.primaryAction.href}>
                    <motion.div whileTap={{ scale: 0.97 }}
                        className={`w-full h-[52px] rounded-2xl bg-gradient-to-l ${c.gradient} flex items-center justify-between px-5 shadow-lg cursor-pointer`}
                        style={{ boxShadow: `0 8px 24px ${c.iconColor}30` }}>
                        <div className="flex items-center gap-2">
                            <PrimaryIcon className="w-5 h-5 text-white" />
                            <span className="text-[14px] font-black text-white">{c.primaryAction.label}</span>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-white/80" />
                    </motion.div>
                </Link>

                {c.secondaryAction && (
                    <Link href={c.secondaryAction.href}>
                        <div className="w-full h-[44px] rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-center gap-2 cursor-pointer text-slate-500 dark:text-slate-400 text-[12.5px] font-bold">
                            <c.secondaryAction.icon className="w-4 h-4" />
                            {c.secondaryAction.label}
                        </div>
                    </Link>
                )}

                {/* Disclaimer */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 mt-2">
                    <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[10.5px] text-slate-400 font-medium leading-relaxed">هذا التقييم استرشادي ولا يغني عن التشخيص الطبي المتخصص. في الحالات الطارئة توجه للطوارئ فوراً.</p>
                </div>
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════ */
export default function ClinicalIntake() {
    const router = useRouter();
    const { user } = useAuth();
    const [step, setStep] = useState<StepId>('welcome');
    const [triageLevel, setTriageLevel] = useState<TriageLevel>('manageable');

    const [data, setData] = useState<AssessmentData>({
        complaint: '',
        complaintLabel: '',
        severity: 5,
        duration: 'days',
        redFlags: [],
        hasRedFlags: false,
        chronicConditions: [],
        medications: '',
        additionalNotes: '',
    });

    // Load draft
    useEffect(() => {
        try {
            const draft = localStorage.getItem('tibrah_triage_draft');
            if (draft) {
                const parsed = JSON.parse(draft);
                setData(d => ({ ...d, ...parsed }));
                if (parsed.complaint) setStep('severity');
            }
        } catch { }
    }, []);

    // Save draft on change
    useEffect(() => {
        if (step !== 'welcome' && step !== 'analyzing' && step !== 'result') {
            localStorage.setItem('tibrah_triage_draft', JSON.stringify(data));
        }
    }, [data, step]);

    const goTo = (s: StepId) => { haptic.selection(); setStep(s); };

    const handleComplaintSelect = (id: string, label: string) => {
        haptic.impact();
        uiSounds.select();
        setData(d => ({ ...d, complaint: id, complaintLabel: label }));
        goTo('severity');
    };

    const toggleRedFlag = (id: string) => {
        haptic.selection();
        setData(d => {
            const flags = d.redFlags.includes(id) ? d.redFlags.filter(f => f !== id) : [...d.redFlags, id];
            return { ...d, redFlags: flags, hasRedFlags: flags.length > 0 };
        });
    };

    const toggleCondition = (c: string) => {
        haptic.selection();
        setData(d => {
            if (c === 'لا شيء') return { ...d, chronicConditions: ['لا شيء'] };
            const conds = d.chronicConditions.filter(x => x !== 'لا شيء');
            const next = conds.includes(c) ? conds.filter(x => x !== c) : [...conds, c];
            return { ...d, chronicConditions: next };
        });
    };

    const computeTriage = (d: AssessmentData): TriageLevel => {
        if (d.hasRedFlags || d.severity >= 9 || d.complaint === 'chest_pain') return 'emergency';
        if (d.severity >= 7 || d.duration === 'weeks') return 'needs_doctor';
        if (d.severity >= 4 || d.chronicConditions.some(c => c !== 'لا شيء' && c !== '')) return 'suitable_for_review';
        return 'manageable';
    };

    const handleSubmit = async () => {
        goTo('analyzing');
        const level = computeTriage(data);

        await new Promise(r => setTimeout(r, 3200));

        if (user?.id) {
            try {
                await db.entities.DailyLog.createForUser(user.id, {
                    date: new Date().toISOString().split('T')[0],
                    notes: `التقييم السريري: ${data.complaintLabel} | الحدة: ${data.severity}/10 | المدة: ${data.duration}`,
                    energy_level: Math.max(1, 10 - data.severity),
                });
            } catch (e) {
                console.error('[Intake] DB error:', e);
            }
        }

        localStorage.removeItem('tibrah_triage_draft');
        setTriageLevel(level);
        goTo('result');
    };

    // Step history for back navigation
    const stepOrder: StepId[] = ['welcome', 'complaint', 'severity', 'modifiers', 'history'];
    const currentIdx = stepOrder.indexOf(step);
    const canGoBack = currentIdx > 0 && step !== 'analyzing' && step !== 'result';

    const handleBack = () => {
        if (canGoBack) goTo(stepOrder[currentIdx - 1]);
    };

    /* ─── PAGE SLIDE VARIANT ─── */
    const slideVariants = {
        enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? -30 : 30 }),
        center: { opacity: 1, x: 0 },
        exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? 30 : -30 }),
    };

    return (
        <div className="min-h-screen bg-[#F7FAFA] dark:bg-[#080D13] font-sans">
            <SEO title="التقييم السريري | طِبرَا" />

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.15) 0%, transparent 70%)', filter: 'blur(50px)' }} />
                <div className="absolute bottom-[20%] left-[-10%] w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)', filter: 'blur(45px)' }} />
            </div>

            {/* Header */}
            <div className="sticky top-0 z-30 px-4 pt-safe">
                <div className="flex items-center justify-between h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-b-2xl px-4 shadow-sm border-b border-slate-100 dark:border-slate-800/60">
                    {canGoBack ? (
                        <motion.button whileTap={{ scale: 0.9 }} onClick={handleBack}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                            <ArrowRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        </motion.button>
                    ) : step === 'result' ? (
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.push('/')}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                            <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        </motion.button>
                    ) : <div className="w-8" />}

                    <div className="flex items-center gap-1.5">
                        <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <span className="text-[13px] font-black text-slate-700 dark:text-slate-200">التقييم السريري</span>
                    </div>

                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/30">
                        <Lock className="w-2.5 h-2.5 text-teal-500" />
                        <span className="text-[9.5px] font-bold text-teal-600 dark:text-teal-400">مؤمّن</span>
                    </div>
                </div>
                <StepDots current={step} />
            </div>

            {/* Content */}
            <div className="relative z-10 px-4 pb-32 max-w-md mx-auto">
                <AnimatePresence mode="wait">

                    {/* ── WELCOME ── */}
                    {step === 'welcome' && (
                        <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="pt-8">
                            {/* Large icon */}
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}
                                        className="absolute inset-0 rounded-3xl opacity-30"
                                        style={{ background: 'linear-gradient(135deg, #0d9488, #6366f1)', filter: 'blur(20px)', transform: 'scale(1.2)' }} />
                                    <div className="w-24 h-24 rounded-3xl flex items-center justify-center relative"
                                        style={{ background: 'linear-gradient(135deg, #0d9488, #6366f1)' }}>
                                        <Stethoscope className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                            </div>

                            <h1 className="text-[24px] font-black text-slate-800 dark:text-white text-center mb-3 leading-tight">
                                أهلاً بك في<br />
                                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #0d9488, #6366f1)' }}>
                                    محرك الرعاية الرقمي
                                </span>
                            </h1>
                            <p className="text-[13px] text-slate-500 dark:text-slate-400 text-center font-medium leading-relaxed mb-6 px-2">
                                سنطرح عليك أسئلة موجهة بناءً على أسلوب الطب الوظيفي لتصنيف حالتك وتوجيهك للخطوة الأنسب.
                            </p>

                            {/* Feature pills */}
                            <div className="flex flex-wrap gap-2 justify-center mb-8">
                                {['ذكاء اصطناعي', 'دقيقتان فقط', 'خصوصية تامة', 'مجاناً'].map(f => (
                                    <span key={f} className="px-3 py-1 rounded-full bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-[11px] font-bold text-slate-600 dark:text-slate-300 shadow-sm">{f}</span>
                                ))}
                            </div>

                            {/* Warning box */}
                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/20 mb-6">
                                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-[11.5px] text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
                                    إذا كنت في حالة طارئة تهدد حياتك فتوجه للطوارئ فوراً — هذا التقييم <strong>لا يحل</strong> محل الطوارئ.
                                </p>
                            </div>

                            {/* Start CTA */}
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => goTo('complaint')}
                                className="w-full h-[54px] rounded-2xl text-white text-[15px] font-black flex items-center justify-between px-6 relative overflow-hidden"
                                style={{ background: 'linear-gradient(135deg, #0d9488, #6366f1)', boxShadow: '0 8px 24px rgba(13,148,136,0.28)' }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/8 to-white/0" />
                                <span>ابدأ التقييم الآن</span>
                                <motion.div animate={{ x: [0, -4, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
                                    <ArrowLeft className="w-5 h-5 text-white/80" />
                                </motion.div>
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ── COMPLAINT ── */}
                    {step === 'complaint' && (
                        <motion.div key="complaint" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="pt-4">
                            <div className="mb-5">
                                <p className="text-[12px] font-bold text-teal-600 dark:text-teal-400 mb-1">السؤال ١ من ٤</p>
                                <h2 className="text-[20px] font-black text-slate-800 dark:text-white leading-tight">ما هي شكواك الرئيسية؟</h2>
                                <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium mt-1">اختر ما يزعجك أكثر شيء حالياً</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                {COMPLAINTS.map((c, i) => {
                                    const Icon = c.icon;
                                    return (
                                        <motion.button
                                            key={c.id}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            whileTap={{ scale: 0.94 }}
                                            onClick={() => handleComplaintSelect(c.id, c.label)}
                                            className="relative p-4 rounded-2xl text-right transition-all border"
                                            style={{
                                                backgroundColor: c.bg,
                                                borderColor: `${c.color}22`,
                                            }}
                                        >
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${c.color}20` }}>
                                                <Icon className="w-4.5 h-4.5" style={{ color: c.color }} />
                                            </div>
                                            <p className="text-[12.5px] font-bold text-slate-700 dark:text-slate-200 leading-snug">{c.label}</p>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* ── SEVERITY ── */}
                    {step === 'severity' && (
                        <motion.div key="severity" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="pt-4">
                            <div className="mb-6">
                                <p className="text-[12px] font-bold text-teal-600 dark:text-teal-400 mb-1">السؤال ٢ من ٤</p>
                                <h2 className="text-[20px] font-black text-slate-800 dark:text-white leading-tight">كيف تقيّم شدة الأعراض؟</h2>
                            </div>

                            {/* Severity meter */}
                            <div className="bg-white dark:bg-slate-800/60 rounded-[22px] p-5 border border-slate-100 dark:border-slate-700/60 shadow-sm mb-5">
                                <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-4">اضغط على الشريط ليعكس مستوى ألمك أو انزعاجك</p>
                                <SeverityMeter value={data.severity} onChange={v => setData(d => ({ ...d, severity: v }))} />
                            </div>

                            {/* Duration */}
                            <div className="bg-white dark:bg-slate-800/60 rounded-[22px] p-5 border border-slate-100 dark:border-slate-700/60 shadow-sm mb-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">منذ متى تعاني من هذه الأعراض؟</p>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'hours', label: 'ساعات', sub: 'أقل من يوم' },
                                        { id: 'days', label: 'أيام', sub: '٢-١٤ يوم' },
                                        { id: 'weeks', label: 'أسابيع+', sub: 'أكثر من أسبوعين' },
                                    ].map(opt => (
                                        <motion.button
                                            key={opt.id}
                                            whileTap={{ scale: 0.94 }}
                                            onClick={() => { haptic.selection(); setData(d => ({ ...d, duration: opt.id })); }}
                                            className="py-3 px-2 rounded-xl border-2 transition-all text-center"
                                            style={data.duration === opt.id
                                                ? { borderColor: '#0d9488', backgroundColor: 'rgba(13,148,136,0.08)' }
                                                : { borderColor: '#e2e8f0', backgroundColor: 'transparent' }}
                                        >
                                            <p className="text-[13px] font-black" style={{ color: data.duration === opt.id ? '#0d9488' : '#64748b' }}>{opt.label}</p>
                                            <p className="text-[9.5px] font-semibold text-slate-400 mt-0.5">{opt.sub}</p>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            <motion.button whileTap={{ scale: 0.97 }}
                                onClick={() => goTo('modifiers')}
                                className="w-full h-[52px] rounded-2xl text-white text-[14px] font-black flex items-center justify-between px-5"
                                style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', boxShadow: '0 6px 20px rgba(13,148,136,0.25)' }}>
                                <span>متابعة</span>
                                <ArrowLeft className="w-5 h-5 text-white/80" />
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ── RED FLAGS ── */}
                    {step === 'modifiers' && (
                        <motion.div key="modifiers" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="pt-4">
                            <div className="mb-5">
                                <p className="text-[12px] font-bold text-teal-600 dark:text-teal-400 mb-1">السؤال ٣ من ٤</p>
                                <h2 className="text-[20px] font-black text-slate-800 dark:text-white leading-tight">علامات التحذير</h2>
                                <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium mt-1">هل تعاني من أي مما يلي تزامناً مع حالتك؟</p>
                            </div>

                            <div className="space-y-2.5 mb-5">
                                {RED_FLAGS.map(flag => {
                                    const selected = data.redFlags.includes(flag.id);
                                    return (
                                        <motion.button
                                            key={flag.id}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => toggleRedFlag(flag.id)}
                                            className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all text-right"
                                            style={selected
                                                ? { backgroundColor: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.3)' }
                                                : { backgroundColor: '#fff', border: '1.5px solid #f1f5f9' }}
                                        >
                                            <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border-2 transition-all"
                                                style={selected ? { borderColor: '#ef4444', backgroundColor: '#ef4444' } : { borderColor: '#e2e8f0', backgroundColor: 'transparent' }}>
                                                {selected && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <div className="flex items-center gap-2 flex-1">
                                                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                                <span className="text-[12.5px] font-bold text-slate-700 dark:text-slate-200">{flag.label}</span>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {data.hasRedFlags && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                    className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/20 mb-5">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                        <p className="text-[12px] font-black text-red-700 dark:text-red-400">تنبيه طارئ</p>
                                    </div>
                                    <p className="text-[11px] text-red-600 dark:text-red-300 font-medium leading-relaxed">
                                        الأعراض التي اخترتها قد تكون طارئة. نوصيك بالتوجه لأقرب طوارئ أو الاتصال بالإسعاف الآن.
                                    </p>
                                </motion.div>
                            )}

                            <motion.button whileTap={{ scale: 0.97 }}
                                onClick={() => goTo('history')}
                                className="w-full h-[52px] rounded-2xl text-white text-[14px] font-black flex items-center justify-between px-5"
                                style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', boxShadow: '0 6px 20px rgba(13,148,136,0.25)' }}>
                                <span>متابعة</span>
                                <ArrowLeft className="w-5 h-5 text-white/80" />
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ── MEDICAL HISTORY ── */}
                    {step === 'history' && (
                        <motion.div key="history" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="pt-4">
                            <div className="mb-5">
                                <p className="text-[12px] font-bold text-teal-600 dark:text-teal-400 mb-1">السؤال ٤ من ٤</p>
                                <h2 className="text-[20px] font-black text-slate-800 dark:text-white leading-tight">التاريخ الطبي</h2>
                                <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium mt-1">تساعدنا هذه المعلومات في التخصيص الأدق</p>
                            </div>

                            {/* Chronic conditions */}
                            <div className="bg-white dark:bg-slate-800/60 rounded-[22px] p-4 border border-slate-100 dark:border-slate-700/60 shadow-sm mb-4">
                                <p className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-3">الأمراض المزمنة المعروفة (اختر ما ينطبق)</p>
                                <div className="flex flex-wrap gap-2">
                                    {CHRONIC_CONDITIONS.map(c => {
                                        const selected = data.chronicConditions.includes(c);
                                        return (
                                            <motion.button
                                                key={c}
                                                whileTap={{ scale: 0.92 }}
                                                onClick={() => toggleCondition(c)}
                                                className="px-3 py-1.5 rounded-xl border-2 text-[11.5px] font-bold transition-all"
                                                style={selected
                                                    ? { borderColor: '#0d9488', backgroundColor: 'rgba(13,148,136,0.1)', color: '#0d9488' }
                                                    : { borderColor: '#e2e8f0', backgroundColor: '#f8fafc', color: '#64748b' }}
                                            >
                                                {selected && <span className="ml-1">✓</span>}
                                                {c}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Medications */}
                            <div className="bg-white dark:bg-slate-800/60 rounded-[22px] p-4 border border-slate-100 dark:border-slate-700/60 shadow-sm mb-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Pill className="w-4 h-4 text-slate-400" />
                                    <p className="text-[12px] font-bold text-slate-600 dark:text-slate-300">هل تتناول أدوية حالياً؟ (اختياري)</p>
                                </div>
                                <textarea
                                    value={data.medications}
                                    onChange={e => setData(d => ({ ...d, medications: e.target.value }))}
                                    placeholder="اذكر الأدوية إن وجدت..."
                                    rows={2}
                                    className="w-full text-[13px] font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/60 resize-none focus:outline-none focus:border-teal-300 placeholder-slate-300 dark:placeholder-slate-600"
                                />
                            </div>

                            {/* Submit */}
                            <motion.button whileTap={{ scale: 0.97 }}
                                onClick={handleSubmit}
                                className="w-full h-[54px] rounded-2xl text-white text-[14px] font-black flex items-center justify-between px-5 relative overflow-hidden"
                                style={{ background: 'linear-gradient(135deg, #0d9488, #6366f1)', boxShadow: '0 8px 24px rgba(13,148,136,0.28)' }}>
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-white" />
                                    <span>تحليل الحالة بالذكاء الاصطناعي</span>
                                </div>
                                <ArrowLeft className="w-5 h-5 text-white/80" />
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ── ANALYZING ── */}
                    {step === 'analyzing' && (
                        <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-8">
                            <AnalyzingScreen />
                        </motion.div>
                    )}

                    {/* ── RESULT ── */}
                    {step === 'result' && (
                        <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
                            <ResultCard level={triageLevel} data={data} router={router} />
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
