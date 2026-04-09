// components/health-engine/steps/StepResult.tsx
// THIE v2 — "The Verdict" — Triage payoff with animated score explosion

'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, Calendar, CheckCircle, HeartPulse,
    MessageCircle, Phone, RefreshCw, Sparkles, ArrowLeft,
    Activity, Clock, Star,
} from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { PATHWAYS, computeTriage } from '../constants';
import type { EngineAnswers } from '../types';
import { haptic } from '@/lib/HapticFeedback';
import { createPageUrl } from '@/utils';

/* ── Triage config ── */
const CONFIGS = {
    emergency: {
        gradient: 'linear-gradient(145deg, #450a0a 0%, #7f1d1d 50%, #dc2626 100%)',
        glow: 'rgba(220,38,38,0.5)',
        icon: AlertTriangle,
        badge: '⚠️ وضع طارئ',
        title: 'اطلب المساعدة الطبية الآن',
        body: 'الأعراض التي وصفتها تستدعي تدخلاً طبياً عاجلاً.',
        primary: { label: 'اتصل بالإسعاف', href: 'tel:911', icon: Phone, color: '#dc2626' },
        secondary: null,
    },
    urgent: {
        gradient: 'linear-gradient(145deg, #431407 0%, #92400e 50%, #f97316 100%)',
        glow: 'rgba(249,115,22,0.45)',
        icon: AlertTriangle,
        badge: '🟠 عاجل',
        title: 'تحتاج تقييماً طبياً قريباً',
        body: 'حالتك تستدعي رؤية طبيب خلال ٢٤ ساعة القادمة.',
        primary: { label: 'احجز مع د. عمر الآن', href: createPageUrl('BookAppointment'), icon: Calendar, color: '#f97316' },
        secondary: { label: 'تواصل عاجل — واتساب', href: 'https://wa.me/967771447111', icon: MessageCircle },
    },
    needs_doctor: {
        gradient: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 50%, #6366f1 100%)',
        glow: 'rgba(99,102,241,0.40)',
        icon: HeartPulse,
        badge: '🩺 يحتاج متابعة',
        title: 'استشارة د. عمر ستمنحك الوضوح',
        body: 'حالتك مستقرة لكنها تحتاج تقييماً متخصصاً.',
        primary: { label: 'احجز موعداً', href: createPageUrl('BookAppointment'), icon: Calendar, color: '#6366f1' },
        secondary: { label: 'سجّل ملفي الطبي', href: createPageUrl('MedicalHistory'), icon: Activity },
    },
    review: {
        gradient: 'linear-gradient(145deg, #134e4a 0%, #0f766e 50%, #0d9488 100%)',
        glow: 'rgba(13,148,136,0.35)',
        icon: CheckCircle,
        badge: '✅ مستقر — يحتاج مراقبة',
        title: 'مؤشراتك معقولة — ننصح بمراجعة',
        body: 'الوضع لا يستدعي استعجالاً لكن مراجعة دورية ستعطيك راحة بال.',
        primary: { label: 'احجز مراجعة', href: createPageUrl('BookAppointment'), icon: Calendar, color: '#0d9488' },
        secondary: { label: 'تابع يومياتي الصحية', href: createPageUrl('DailyLog'), icon: Clock },
    },
    manageable: {
        gradient: 'linear-gradient(145deg, #052e16 0%, #15803d 50%, #16a34a 100%)',
        glow: 'rgba(22,163,74,0.30)',
        icon: Star,
        badge: '🟢 في النطاق الآمن',
        title: 'حالتك تبدو مطمئنة 🎉',
        body: 'أعراضك قابلة للإدارة. واصل العناية والمراقبة الدورية.',
        primary: { label: 'رعايتي اليومية', href: createPageUrl('DailyLog'), icon: HeartPulse, color: '#16a34a' },
        secondary: { label: 'رحلتي مع د. عمر', href: createPageUrl('MyCare'), icon: Sparkles },
    },
};

/* ── Animated score ring ── */
function ScoreRing({ score, color, glow }: { score: number; color: string; glow: string }) {
    const r = 42;
    const circ = 2 * Math.PI * r;
    return (
        <div className="relative flex-shrink-0" style={{ width: 100, height: 100 }}>
            <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r={r} fill="none"
                    stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                <motion.circle cx="50" cy="50" r={r} fill="none"
                    stroke={color} strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ - (score / 10) * circ }}
                    transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
                    style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring', stiffness: 400, damping: 20 }}
                    className="text-[26px] font-black text-white leading-none">
                    {score}
                </motion.span>
                <span className="text-[9px] text-white/40 font-bold">/10</span>
            </div>
        </div>
    );
}

export function StepResult({ answers, onRestart }: { answers: EngineAnswers; onRestart: () => void }) {
    const { level, score } = computeTriage(answers);
    const cfg = CONFIGS[level];
    const Icon = cfg.icon;
    const pathway = PATHWAYS.find(p => p.id === answers.pathwayId);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setRevealed(true);
            haptic.trigger('heavy');
            // Confetti for manageable/review
            if (level === 'manageable' || level === 'review') {
                confetti({
                    particleCount: 60,
                    spread: 80,
                    origin: { y: 0.4 },
                    colors: ['#0d9488', '#6366f1', '#10b981', '#a78bfa'],
                });
            }
        }, 300);
    }, [level]);

    const durationLabel: Record<string, string> = {
        hours: 'ساعات', days: 'أيام', weeks: 'أسابيع', months: 'مزمن',
    };

    return (
        <div className="px-4 pb-12 pt-20" dir="rtl">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-3 mb-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    نتيجة التحليل الشخصي
                </p>
            </motion.div>

            {/* Main verdict card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 30 }}
                animate={revealed ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                className="rounded-[28px] overflow-hidden mb-4 relative"
                style={{
                    background: cfg.gradient,
                    boxShadow: `0 20px 60px ${cfg.glow}, 0 1px 0 rgba(255,255,255,0.15) inset`,
                }}>
                {/* Top shimmer */}
                <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />

                {/* Sheen animation */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(125deg, rgba(255,255,255,0.08) 0%, transparent 50%)' }}
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />

                <div className="p-5 relative z-10">
                    {/* Badge + Ring row */}
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={revealed ? { opacity: 1, x: 0 } : {}}
                                transition={{ delay: 0.2 }}
                                className="text-[11px] font-black text-white/70 px-3 py-1.5 rounded-full block mb-3"
                                style={{ background: 'rgba(0,0,0,0.25)' }}>
                                {cfg.badge}
                            </motion.span>
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={revealed ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 0.3 }}
                                className="text-[18px] font-black text-white leading-tight max-w-[200px]">
                                {cfg.title}
                            </motion.h2>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={revealed ? { opacity: 1, scale: 1 } : {}}
                            transition={{ delay: 0.25, type: 'spring' }}>
                            <ScoreRing score={score} color="rgba(255,255,255,0.9)" glow="rgba(255,255,255,0.4)" />
                        </motion.div>
                    </div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={revealed ? { opacity: 1 } : {}}
                        transition={{ delay: 0.4 }}
                        className="text-[12px] text-white/60 leading-relaxed mb-4">
                        {cfg.body}
                    </motion.p>

                    {/* Data summary strip */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={revealed ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.45 }}
                        className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden"
                        style={{ background: 'rgba(0,0,0,0.20)' }}>
                        {[
                            { l: 'الشكوى', v: pathway?.emoji + ' ' + (pathway?.label ?? '—') },
                            { l: 'الشدة', v: `${answers.severity}/١٠` },
                            { l: 'المدة', v: durationLabel[answers.duration] ?? '—' },
                        ].map((row, i) => (
                            <div key={i} className="text-center py-3 px-2"
                                style={{ background: 'rgba(0,0,0,0.15)' }}>
                                <p className="text-[8.5px] text-white/35 font-bold uppercase tracking-wider">{row.l}</p>
                                <p className="text-[11px] font-black text-white mt-0.5">{row.v}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* Emotional summary */}
            {answers.emotionalContext.length > 0 && !answers.emotionalContext.includes('none') && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={revealed ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.5 }}
                    className="rounded-[22px] p-4 mb-4"
                    style={{
                        background: 'rgba(15,23,42,0.6)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        backdropFilter: 'blur(12px)',
                    }}>
                    <div className="flex items-center gap-2 mb-2.5">
                        <div className="w-5 h-5 rounded-lg flex items-center justify-center"
                            style={{ background: 'rgba(99,102,241,0.2)' }}>
                            <span className="text-[10px]">🧠</span>
                        </div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                            السياق العاطفي المرصود
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {answers.emotionalContext.map(id => {
                            const MAP: Record<string, string> = {
                                work_stress: '💼 ضغط عمل', family: '👨‍👩‍👧 توترات', loneliness: '🌑 وحدة',
                                grief: '🕊 حزن', financial: '📉 مالي', identity: '🔒 عجز',
                                anger: '🔥 غضب', fear: '🌀 خوف', burnout: '🪫 إرهاق',
                            };
                            return MAP[id] ? (
                                <span key={id}
                                    className="text-[11px] font-bold px-2.5 py-1 rounded-xl text-indigo-300"
                                    style={{ background: 'rgba(99,102,241,0.12)' }}>
                                    {MAP[id]}
                                </span>
                            ) : null;
                        })}
                    </div>
                    <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">
                        هذه المعطيات مرصودة في تقريرك — د. عمر سيأخذها بعين الاعتبار.
                    </p>
                </motion.div>
            )}

            {/* CTAs */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={revealed ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.55 }}
                className="space-y-3">
                {/* Primary CTA */}
                <Link href={cfg.primary.href} onClick={() => haptic.impact()}>
                    <motion.div
                        whileTap={{ scale: 0.97 }}
                        className="w-full h-[56px] rounded-2xl flex items-center justify-between px-5 cursor-pointer"
                        style={{
                            background: `linear-gradient(135deg, ${cfg.primary.color}, ${cfg.primary.color}aa)`,
                            boxShadow: `0 12px 40px ${cfg.primary.color}45`,
                        }}>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <cfg.primary.icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-[14px] font-black text-white">{cfg.primary.label}</span>
                        </div>
                        <ArrowLeft className="w-5 h-5 text-white/70" />
                    </motion.div>
                </Link>

                {/* Secondary CTA */}
                {cfg.secondary && (
                    <Link href={cfg.secondary.href} onClick={() => haptic.selection()}>
                        <motion.div
                            whileTap={{ scale: 0.97 }}
                            className="w-full h-[48px] rounded-2xl flex items-center justify-center gap-2.5 cursor-pointer"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}>
                            <cfg.secondary.icon className="w-4 h-4 text-slate-400" />
                            <span className="text-[13px] font-bold text-slate-400">{cfg.secondary.label}</span>
                        </motion.div>
                    </Link>
                )}

                {/* Disclaimer */}
                <div className="rounded-2xl p-3.5 flex items-start gap-2.5"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <Sparkles className="w-3.5 h-3.5 text-slate-700 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-700 leading-relaxed">
                        هذا التحليل استرشادي وليس تشخيصاً طبياً.  في الحالات الطارئة توجه للطوارئ فوراً.
                    </p>
                </div>

                {/* Restart */}
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { haptic.selection(); onRestart(); }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-[12px] font-bold text-slate-600">تحليل حالة جديدة</span>
                </motion.button>
            </motion.div>
        </div>
    );
}
