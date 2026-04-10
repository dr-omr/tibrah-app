// components/health-engine/steps/StepResult.tsx
// THIE v5 — CIDS Result: Three-Dimensional Verdict
// Shows: Triage + Functional Pattern + Somatic Theme + Integrative Insight

'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, Calendar, CheckCircle, HeartPulse,
    MessageCircle, Phone, RefreshCw, Sparkles, ArrowLeft,
    Activity, Clock, Star, Brain, FlaskConical, Heart,
} from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { PATHWAYS, computeTriage, FUNCTIONAL_PATTERN_INFO, SOMATIC_THEME_INFO } from '../constants';
import type { EngineAnswers } from '../types';
import { haptic } from '@/lib/HapticFeedback';
import { createPageUrl } from '@/utils';

const TRIAGE_CFG = {
    emergency: {
        pageBg: '#FEF2F2',
        cardBg: 'linear-gradient(145deg, #b91c1c, #dc2626)',
        shadow: 'rgba(220,38,38,0.30)',
        badge: '⚠️ طارئ', icon: AlertTriangle, title: 'اطلب المساعدة الطبية الآن',
        body: 'الأعراض التي وصفتها تستدعي تدخلاً طبياً عاجلاً.',
        primary: { label: 'اتصل بالإسعاف فوراً', href: 'tel:911', icon: Phone, bg: 'linear-gradient(135deg,#dc2626,#b91c1c)', shadow: 'rgba(220,38,38,0.28)' },
        secondary: null,
    },
    urgent: {
        pageBg: '#FFF7ED',
        cardBg: 'linear-gradient(145deg, #ea580c, #f97316)',
        shadow: 'rgba(234,88,12,0.28)',
        badge: '🟠 عاجل', icon: AlertTriangle, title: 'تحتاج تقييماً طبياً قريباً',
        body: 'حالتك تستدعي رؤية طبيب خلال ٢٤ ساعة.',
        primary: { label: 'احجز مع د. عمر الآن', href: createPageUrl('BookAppointment'), icon: Calendar, bg: 'linear-gradient(135deg,#f97316,#ea580c)', shadow: 'rgba(249,115,22,0.28)' },
        secondary: { label: 'تواصل عبر واتساب', href: 'https://wa.me/967771447111', icon: MessageCircle },
    },
    needs_doctor: {
        pageBg: '#F5F3FF',
        cardBg: 'linear-gradient(145deg, #4f46e5, #6366f1)',
        shadow: 'rgba(99,102,241,0.24)',
        badge: '🩺 يحتاج متابعة', icon: HeartPulse, title: 'استشارة د. عمر ستمنحك الوضوح',
        body: 'حالتك مستقرة لكنها تحتاج تقييماً متخصصاً.',
        primary: { label: 'احجز موعداً', href: createPageUrl('BookAppointment'), icon: Calendar, bg: 'linear-gradient(135deg,#6366f1,#4f46e5)', shadow: 'rgba(99,102,241,0.24)' },
        secondary: { label: 'سجّل ملفي الطبي', href: createPageUrl('MedicalHistory'), icon: Activity },
    },
    review: {
        pageBg: '#F0FDFA',
        cardBg: 'linear-gradient(145deg, #0f766e, #0d9488)',
        shadow: 'rgba(13,148,136,0.22)',
        badge: '✅ مستقر', icon: CheckCircle, title: 'مؤشراتك معقولة — ننصح بمراجعة',
        body: 'الوضع لا يستدعي استعجالاً لكن المراجعة الدورية مفيدة.',
        primary: { label: 'احجز مراجعة', href: createPageUrl('BookAppointment'), icon: Calendar, bg: 'linear-gradient(135deg,#0d9488,#0f766e)', shadow: 'rgba(13,148,136,0.22)' },
        secondary: { label: 'يومياتي الصحية', href: createPageUrl('DailyLog'), icon: Clock },
    },
    manageable: {
        pageBg: '#F0FDF4',
        cardBg: 'linear-gradient(145deg, #15803d, #16a34a)',
        shadow: 'rgba(22,163,74,0.20)',
        badge: '🟢 آمن', icon: Star, title: 'حالتك تبدو مطمئنة 🎉',
        body: 'أعراضك قابلة للإدارة. واصل العناية اليومية.',
        primary: { label: 'رعايتي اليومية', href: createPageUrl('DailyLog'), icon: HeartPulse, bg: 'linear-gradient(135deg,#16a34a,#0d9488)', shadow: 'rgba(22,163,74,0.20)' },
        secondary: { label: 'رحلتي مع د. عمر', href: createPageUrl('MyCare'), icon: Sparkles },
    },
};

/* M3 Score Ring */
function ScoreRing({ score }: { score: number }) {
    const r = 38; const circ = 2 * Math.PI * r;
    return (
        <div className="relative flex-shrink-0" style={{ width: 88, height: 88 }}>
            <svg width="88" height="88" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="5.5" />
                <motion.circle cx="44" cy="44" r={r} fill="none" stroke="white" strokeWidth="5.5"
                    strokeLinecap="round" strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ - (score / 10) * circ }}
                    transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
                    style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span className="m3-headline-sm text-white leading-none"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.55, type: 'spring', stiffness: 400 }}>
                    {score}
                </motion.span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', fontWeight: 700 }}>/10</span>
            </div>
        </div>
    );
}

/* Dimension mini-bar */
function DimensionBar({ label, icon: Icon, score, color, delay }: {
    label: string; icon: typeof Brain; score: number; color: string; delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, type: 'spring', stiffness: 280, damping: 28 }}
            className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-[9px] flex items-center justify-center flex-shrink-0"
                style={{ background: color + '18', border: `1px solid ${color}28` }}>
                <Icon className="w-3.5 h-3.5" style={{ color }} />
            </div>
            <div className="flex-1">
                <div className="flex justify-between mb-1">
                    <span className="m3-label-sm text-slate-600" style={{ textTransform: 'none', fontSize: 10 }}>{label}</span>
                    <span className="m3-label-sm" style={{ color, textTransform: 'none', fontSize: 10 }}>{score}/10</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
                    <motion.div className="h-full rounded-full"
                        style={{ background: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${score * 10}%` }}
                        transition={{ delay: delay + 0.2, duration: 0.7, ease: [0.05, 0.7, 0.1, 1] }}
                    />
                </div>
            </div>
        </motion.div>
    );
}

export function StepResult({ answers, onRestart }: { answers: EngineAnswers; onRestart: () => void }) {
    const result   = computeTriage(answers);
    const cfg      = TRIAGE_CFG[result.level];
    const pathway  = PATHWAYS.find(p => p.id === answers.pathwayId);
    const funcInfo = FUNCTIONAL_PATTERN_INFO[result.topFunctionalPattern];
    const somInfo  = SOMATIC_THEME_INFO[result.topSomaticTheme];
    const [on, setOn] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setOn(true);
            haptic.trigger('heavy');
            if (result.level === 'manageable' || result.level === 'review') {
                confetti({ particleCount: 55, spread: 72, origin: { y: 0.38 },
                    colors: ['#0d9488', '#6366f1', '#10b981', '#a78bfa'] });
            }
        }, 280);
    }, [result.level]);

    const durMap: Record<string, string> = { hours: 'ساعات', days: 'أيام', weeks: 'أسابيع', months: 'مزمن' };

    return (
        <div className="px-4 pb-12" dir="rtl" style={{ background: cfg.pageBg, minHeight: '100svh' }}>
            <p className="m3-label-sm text-slate-400 pt-2 mb-3" style={{ textTransform: 'none', fontSize: 10 }}>
                بصمتك الصحية · نظام طِبرَا التكاملي
            </p>

            {/* ── Hero Verdict Card ── */}
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={on ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                className="rounded-[28px] overflow-hidden mb-4"
                style={{ background: cfg.cardBg, boxShadow: `0 14px 44px ${cfg.shadow}` }}>
                <div className="h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)' }} />

                <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <motion.span initial={{ opacity: 0 }} animate={on ? { opacity: 1 } : {}} transition={{ delay: 0.18 }}
                                className="m3-label-sm text-white/85 px-3 py-1.5 rounded-full inline-block mb-3"
                                style={{ background: 'rgba(0,0,0,0.18)', textTransform: 'none', fontSize: 10.5 }}>
                                {cfg.badge}
                            </motion.span>
                            <motion.h2 initial={{ opacity: 0, y: 8 }} animate={on ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.24 }}
                                className="m3-headline-sm text-white leading-tight max-w-[195px]">
                                {cfg.title}
                            </motion.h2>
                        </div>
                        <motion.div initial={{ opacity: 0 }} animate={on ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}>
                            <ScoreRing score={result.score} />
                        </motion.div>
                    </div>

                    <motion.p initial={{ opacity: 0 }} animate={on ? { opacity: 1 } : {}} transition={{ delay: 0.3 }}
                        className="m3-body-lg text-white/65 leading-relaxed mb-4">{cfg.body}</motion.p>

                    <motion.div initial={{ opacity: 0 }} animate={on ? { opacity: 1 } : {}} transition={{ delay: 0.36 }}
                        className="grid grid-cols-3 gap-[1px] rounded-[18px] overflow-hidden"
                        style={{ background: 'rgba(0,0,0,0.18)' }}>
                        {[
                            { l: 'الشكوى', v: `${pathway?.emoji} ${pathway?.label ?? '—'}` },
                            { l: 'الشدة',  v: `${answers.severity}/١٠` },
                            { l: 'المدة',  v: durMap[answers.duration] ?? '—' },
                        ].map((d, i) => (
                            <div key={i} className="text-center py-3 px-1" style={{ background: 'rgba(0,0,0,0.12)' }}>
                                <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d.l}</p>
                                <p className="m3-label-lg text-white mt-0.5" style={{ textTransform: 'none' }}>{d.v}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* ── Three-Dimension Analysis Card ── */}
            {(result.topFunctionalPattern !== 'none' || result.topSomaticTheme !== 'none') && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }} animate={on ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }}
                    className="rounded-[24px] p-4 mb-4"
                    style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg,#0d9488,#6366f1)' }}>
                            <Brain className="w-3.5 h-3.5 text-white" />
                        </div>
                        <p className="m3-label-sm text-slate-700" style={{ textTransform: 'none', fontSize: 11 }}>
                            البصمة الصحية الثلاثية الأبعاد
                        </p>
                    </div>

                    <div className="space-y-3.5 mb-4">
                        {/* Conventional urgency */}
                        <DimensionBar label="المستوى الاعتيادي" icon={Activity}
                            score={result.score} color="#0d9488" delay={0.42} />
                        {/* Functional score */}
                        <DimensionBar label="العمق الوظيفي والجذر" icon={FlaskConical}
                            score={result.functionalScore} color="#7c3aed" delay={0.48} />
                        {/* Somatic score */}
                        <DimensionBar label="البُعد الشعوري للجسد" icon={Heart}
                            score={result.somaticScore} color="#db2777" delay={0.54} />
                    </div>

                    {/* Patterns detected */}
                    <div className="space-y-2">
                        {result.topFunctionalPattern !== 'none' && (
                            <div className="flex items-start gap-2.5 p-3 rounded-[14px]"
                                style={{ background: funcInfo.color + '0a', border: `1px solid ${funcInfo.color}18` }}>
                                <span className="text-base leading-none flex-shrink-0 mt-0.5">{funcInfo.emoji}</span>
                                <div>
                                    <p className="m3-label-sm" style={{ color: funcInfo.color, textTransform: 'none', fontSize: 10.5 }}>
                                        النمط الوظيفي الأبرز
                                    </p>
                                    <p className="m3-title-md text-slate-900 mt-0.5">{funcInfo.label}</p>
                                    <p className="m3-body-md text-slate-400 mt-0.5">{funcInfo.summary}</p>
                                </div>
                            </div>
                        )}

                        {result.topSomaticTheme !== 'none' && (
                            <div className="flex items-start gap-2.5 p-3 rounded-[14px]"
                                style={{ background: somInfo.color + '0a', border: `1px solid ${somInfo.color}18` }}>
                                <span className="text-base leading-none flex-shrink-0 mt-0.5">{somInfo.emoji}</span>
                                <div>
                                    <p className="m3-label-sm" style={{ color: somInfo.color, textTransform: 'none', fontSize: 10.5 }}>
                                        الصدى الشعوري الأبرز
                                    </p>
                                    <p className="m3-title-md text-slate-900 mt-0.5">{somInfo.label}</p>
                                    <p className="m3-body-md text-slate-400 mt-0.5">{somInfo.summary}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Integrative insight */}
                    {result.integrativeInsight && (
                        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                            <p className="m3-label-sm text-teal-600 mb-1.5" style={{ textTransform: 'none', fontSize: 10 }}>
                                النظرة التكاملية — للطبيب
                            </p>
                            <p className="m3-body-md text-slate-500 leading-relaxed">{result.integrativeInsight}</p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* ── Emotional context ── */}
            {answers.emotionalContext.length > 0 && !answers.emotionalContext.includes('none') && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={on ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.56 }}
                    className="rounded-[22px] p-4 mb-4"
                    style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', boxShadow: '0 2px 6px rgba(99,102,241,0.07)' }}>
                    <div className="flex items-center gap-2 mb-2.5">
                        <Heart className="w-3.5 h-3.5 text-indigo-400" />
                        <p className="m3-label-sm text-indigo-500" style={{ textTransform: 'none', fontSize: 10 }}>
                            السياق العاطفي المُرفق
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {answers.emotionalContext.map(id => {
                            const M: Record<string, string> = {
                                work_stress: '💼 ضغط عمل', family: '👨‍👩‍👧 توترات', loneliness: '🌑 وحدة',
                                grief: '🕊️ حزن', financial: '📉 مالي', identity: '🔒 هوية',
                                anger: '🔥 غضب', fear: '🌀 خوف', burnout: '🪫 إرهاق',
                                trauma: '🌊 صدمة', shame: '🫣 خجل', disconnected: '🌫️ انفصال',
                            };
                            return M[id] ? (
                                <span key={id} className="m3-label-lg px-2.5 py-1 rounded-xl text-indigo-700"
                                    style={{ background: '#ede9fe', textTransform: 'none', fontSize: 11 }}>{M[id]}</span>
                            ) : null;
                        })}
                    </div>
                    <p className="m3-body-md text-slate-400 mt-2">د. عمر سيدمج هذا السياق في خطة علاجك.</p>
                </motion.div>
            )}

            {/* ── CTAs ── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={on ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.6 }}
                className="space-y-3">
                <Link href={cfg.primary.href} onClick={() => haptic.impact()}>
                    <motion.div whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                        className="w-full h-14 rounded-[28px] flex items-center gap-3 px-5 m3-state cursor-pointer"
                        style={{ background: cfg.primary.bg, boxShadow: `0 4px 20px ${cfg.primary.shadow}` }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(255,255,255,0.22)' }}>
                            <cfg.primary.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="m3-title-lg text-white flex-1 text-right">{cfg.primary.label}</span>
                        <ArrowLeft className="w-4 h-4 text-white/65" />
                    </motion.div>
                </Link>

                {cfg.secondary && (
                    <Link href={cfg.secondary.href} onClick={() => haptic.selection()}>
                        <motion.div whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                            className="w-full h-12 rounded-[20px] flex items-center justify-center gap-2.5 m3-state cursor-pointer"
                            style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.12)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                            <cfg.secondary.icon className="w-4 h-4 text-slate-500" />
                            <span className="m3-title-md text-slate-600">{cfg.secondary.label}</span>
                        </motion.div>
                    </Link>
                )}

                <div className="rounded-[18px] p-3.5 flex items-start gap-2.5"
                    style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)' }}>
                    <Sparkles className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mt-0.5" />
                    <p className="m3-body-md text-slate-400 leading-relaxed">
                        هذا التحليل استرشادي — ليس تشخيصاً طبياً. في الطوارئ توجه فوراً.
                    </p>
                </div>

                <motion.button whileTap={{ scale: 0.97 }} onClick={() => { haptic.selection(); onRestart(); }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[20px] m3-state"
                    style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)' }}>
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    <span className="m3-title-md text-slate-500">تحليل حالة جديدة</span>
                </motion.button>
            </motion.div>
        </div>
    );
}
