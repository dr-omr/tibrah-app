// components/health-engine/steps/StepResult.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH v8 — Liquid Glass Water Result Screen
// مائي زجاجي عميق — ملمس فيزيائي — بدون أي لون أسود
// ════════════════════════════════════════════════════════════════════
'use client';
import { useEffect, useState, useMemo } from 'react';
import { motion, animate, useMotionValue } from 'framer-motion';
import {
    ArrowLeft, RefreshCw, Sparkles, Clock, Calendar, Phone,
    MessageCircle, ChevronLeft, Zap, Shield,
    BookOpen, TestTube2, BarChart3, PlayCircle, Star,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import confetti from 'canvas-confetti';
import { PATHWAYS, computeTriage, FUNCTIONAL_PATTERN_INFO, SOMATIC_THEME_INFO } from '../constants';
import { computeRouting } from '@/lib/domain-scoring-engine';
import { DOMAIN_BY_ID } from '@/lib/domain-routing-map';
import type { EngineAnswers, ToolRecommendation, DomainId } from '../types';
import { haptic } from '@/lib/HapticFeedback';
import { createPageUrl } from '@/utils';
import { saveCarePlan, markToolOpened } from '@/lib/care-plan-store';
import { trackEvent } from '@/lib/analytics';

/* ══════════════════════════════════════════════════════════════════
   DESIGN SYSTEM — Light Water Glass · Physical · Native
   ══════════════════════════════════════════════════════════════════ */

const PAGE_BG_RESULT = 'linear-gradient(168deg, #E8F8FB 0%, #D0F0F8 18%, #E2F1FE 42%, #EDF5FF 65%, #F0FAFB 88%, #F5FDFE 100%)';

const WATER_CAUSTIC_R = {
    a: 'radial-gradient(ellipse 60% 40% at 80% 15%, rgba(34,211,238,0.16) 0%, transparent 65%)',
    b: 'radial-gradient(ellipse 50% 55% at 15% 70%, rgba(129,140,248,0.12) 0%, transparent 55%)',
    c: 'radial-gradient(ellipse 40% 30% at 60% 90%, rgba(52,211,153,0.10) 0%, transparent 55%)',
};

const W = {
    pageBg:       PAGE_BG_RESULT,
    glass:        'rgba(255,255,255,0.58)',
    glassHigh:    'rgba(255,255,255,0.72)',
    glassBorder:  'rgba(255,255,255,0.85)',
    glassShadow:  '0 8px 32px rgba(8,145,178,0.10), 0 2px 8px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.92)',
    teal:         '#0891B2',
    tealDeep:     '#0E7490',
    tealLight:    '#22D3EE',
    cyan:         '#38BDF8',
    seafoam:      '#34D399',
    lavender:     '#818CF8',
    amber:        '#FBBF24',
    textPrimary:  '#0C4A6E',
    textSub:      '#0369A1',
    textMuted:    '#7DD3FC',
    textFaint:    '#BAE6FD',

    // Glass sheen layers
    sheen: 'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.15) 45%, transparent 100%)',
    spec:  'radial-gradient(ellipse 50% 25% at 22% 12%, rgba(255,255,255,0.55) 0%, transparent 70%)',
};

/* Domain → light water glass visual config */
const DOMAIN_VIS: Record<DomainId, {
    grad: string; glow: string; tint: string; border: string;
    textColor: string; particleColor: string;
    heroGrad: string; accentSoft: string;
}> = {
    jasadi: {
        heroGrad:     'linear-gradient(170deg, rgba(255,255,255,0.90) 0%, rgba(186,230,253,0.75) 50%, rgba(8,145,178,0.35) 100%)',
        grad:         'linear-gradient(145deg, rgba(255,255,255,0.88) 0%, rgba(186,230,253,0.65) 60%, rgba(8,145,178,0.25) 100%)',
        glow:         'rgba(8,145,178,0.22)',
        tint:         'rgba(8,145,178,0.06)',
        border:       'rgba(8,145,178,0.18)',
        accentSoft:   'rgba(8,145,178,0.10)',
        textColor:    '#0E7490',
        particleColor:'#0891B2',
    },
    nafsi: {
        heroGrad:     'linear-gradient(170deg, rgba(255,255,255,0.90) 0%, rgba(233,213,255,0.75) 50%, rgba(129,140,248,0.30) 100%)',
        grad:         'linear-gradient(145deg, rgba(255,255,255,0.88) 0%, rgba(233,213,255,0.60) 60%, rgba(129,140,248,0.22) 100%)',
        glow:         'rgba(129,140,248,0.22)',
        tint:         'rgba(129,140,248,0.06)',
        border:       'rgba(129,140,248,0.18)',
        accentSoft:   'rgba(129,140,248,0.10)',
        textColor:    '#5B21B6',
        particleColor:'#818CF8',
    },
    fikri: {
        heroGrad:     'linear-gradient(170deg, rgba(255,255,255,0.90) 0%, rgba(254,243,199,0.75) 50%, rgba(245,158,11,0.28) 100%)',
        grad:         'linear-gradient(145deg, rgba(255,255,255,0.88) 0%, rgba(254,243,199,0.60) 60%, rgba(245,158,11,0.20) 100%)',
        glow:         'rgba(245,158,11,0.22)',
        tint:         'rgba(245,158,11,0.06)',
        border:       'rgba(245,158,11,0.18)',
        accentSoft:   'rgba(245,158,11,0.10)',
        textColor:    '#B45309',
        particleColor:'#F59E0B',
    },
    ruhi: {
        heroGrad:     'linear-gradient(170deg, rgba(255,255,255,0.90) 0%, rgba(207,250,254,0.75) 50%, rgba(34,211,238,0.30) 100%)',
        grad:         'linear-gradient(145deg, rgba(255,255,255,0.88) 0%, rgba(207,250,254,0.60) 60%, rgba(34,211,238,0.22) 100%)',
        glow:         'rgba(34,211,238,0.22)',
        tint:         'rgba(34,211,238,0.06)',
        border:       'rgba(34,211,238,0.18)',
        accentSoft:   'rgba(34,211,238,0.10)',
        textColor:    '#0E7490',
        particleColor:'#06B6D4',
    },
};

const TRIAGE_META = {
    emergency:    { badge: '⚠️ طارئ',   accent: '#DC2626', bg: 'rgba(254,242,242,0.9)' },
    urgent:       { badge: '🟠 عاجل',   accent: '#EA580C', bg: 'rgba(255,247,237,0.9)' },
    needs_doctor: { badge: '🩺 متابعة', accent: '#0891B2', bg: 'rgba(240,249,255,0.9)' },
    review:       { badge: '✅ مستقر',  accent: '#0E7490', bg: 'rgba(240,253,250,0.9)' },
    manageable:   { badge: '🟢 آمن',    accent: '#059669', bg: 'rgba(240,253,244,0.9)' },
};

const TOOL_META: Record<string, { icon: typeof BookOpen; label: string }> = {
    protocol: { icon: Shield,     label: 'بروتوكول' },
    practice: { icon: Zap,        label: 'تطبيق'    },
    test:     { icon: TestTube2,  label: 'اختبار'   },
    workshop: { icon: PlayCircle, label: 'ورشة'     },
    tracker:  { icon: BarChart3,  label: 'متابعة'   },
};

/* ══════════════════════════════════════════════════════ */
/* ANIMATED COUNTER                                       */
/* ══════════════════════════════════════════════════════ */
function AnimatedNum({ value, delay = 0, suffix = '' }: { value: number; delay?: number; suffix?: string }) {
    const mv = useMotionValue(0);
    const [disp, setDisp] = useState(0);
    useEffect(() => {
        const c = animate(mv, value, { duration: 1.1, ease: 'easeOut', delay, onUpdate: v => setDisp(Math.round(v)) });
        return c.stop;
    }, [value, delay, mv]);
    return <>{disp}{suffix}</>;
}

/* ══════════════════════════════════════════════════════════════════
   WATER AMBIENT — جزيئات المياه داخل البطاقة
   ══════════════════════════════════════════════════════════════════ */
function WaterAmbient({ domainColor }: { domainColor: string }) {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ borderRadius: 'inherit' }}>
            {/* caustic glow spot */}
            <div style={{
                position: 'absolute', top: -20, right: -30,
                width: 180, height: 120,
                borderRadius: '50%',
                background: `radial-gradient(ellipse, ${domainColor}28 0%, transparent 70%)`,
                filter: 'blur(30px)',
            }} />
            {/* floating micro-bubbles */}
            {[...Array(4)].map((_, i) => (
                <motion.div key={i}
                    className="absolute rounded-full"
                    style={{
                        width: 3 + i,
                        height: 3 + i,
                        background: domainColor,
                        opacity: 0.35 - i * 0.06,
                        left: `${18 + i * 20}%`,
                        top: `${30 + (i % 2) * 28}%`,
                        filter: 'blur(0.5px)',
                    }}
                    animate={{ y: [-3, 3, -3] }}
                    transition={{ duration: 2.5 + i * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                />
            ))}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   DeepGlassCard — زجاج بعمق فيزيائي حقيقي
   ══════════════════════════════════════════════════════════════════ */
function GlassCard({ children, className = '', style = {}, delay = 0, on }: {
    children: React.ReactNode; className?: string; style?: React.CSSProperties; delay?: number; on: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={on ? { opacity: 1, y: 0 } : {}}
            transition={{ delay, type: 'spring', stiffness: 240, damping: 26 }}
            className={`relative overflow-hidden ${className}`}
            style={{
                borderRadius: 26,
                background: W.glass,
                border: `1px solid ${W.glassBorder}`,
                backdropFilter: 'blur(24px) saturate(160%)',
                WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                boxShadow: W.glassShadow,
                ...style,
            }}>
            {/* وميض الحافة العلوية */}
            <div className="absolute inset-x-0 top-0 pointer-events-none"
                style={{ height: '50%', background: W.sheen, borderRadius: '26px 26px 0 0' }} />
            {/* انعكاس نقطي */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: W.spec, borderRadius: 26 }} />
            {children}
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════ */
/* LIQUID GLASS SCORE RING                                */
/* ══════════════════════════════════════════════════════ */
function WaterScoreRing({ score, color }: { score: number; color: string }) {
    const r = 40; const circ = 2 * Math.PI * r;
    return (
        <div className="relative flex-shrink-0" style={{ width: 96, height: 96 }}>
            {/* Outer glass panel — زجاج عميق */}
            <div className="absolute inset-0 rounded-full"
                style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: `0 8px 28px rgba(0,0,0,0.4), 0 0 20px ${color}22, inset 0 1px 0 rgba(255,255,255,0.20)`,
                }} />
            <svg width="96" height="96" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                <defs>
                    <linearGradient id="ring-wg" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                        <stop offset="100%" stopColor={W.tealLight} stopOpacity="0.7" />
                    </linearGradient>
                    <filter id="ring-glow-w">
                        <feGaussianBlur stdDeviation="2" result="b" />
                        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                </defs>
                <circle cx="48" cy="48" r={r} fill="none" stroke={`${color}18`} strokeWidth="5" />
                <motion.circle cx="48" cy="48" r={r} fill="none"
                    stroke="url(#ring-wg)" strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ * (1 - score / 10) }}
                    transition={{ duration: 1.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.35 }}
                    filter="url(#ring-glow-w)"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span style={{ fontSize: 22, fontWeight: 900, color: W.textPrimary, lineHeight: 1, textShadow: `0 0 20px ${color}60` }}>
                    <AnimatedNum value={score} delay={0.6} />
                </span>
                <span style={{ fontSize: 8, color: W.textMuted, fontWeight: 800 }}>/10</span>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════ */
/* HERO TRIAGE CARD                                       */
/* ══════════════════════════════════════════════════════ */
function HeroCard({ triageResult, answers, routing, on }: {
    triageResult: ReturnType<typeof computeTriage>;
    answers: EngineAnswers;
    routing: ReturnType<typeof computeRouting>;
    on: boolean;
}) {
    const meta       = TRIAGE_META[triageResult.level];
    const pathway    = PATHWAYS.find(p => p.id === answers.pathwayId);
    const primary    = DOMAIN_BY_ID[routing.primary_domain];
    const vis        = DOMAIN_VIS[routing.primary_domain];
    const durMap: Record<string, string> = { hours: 'ساعات', days: 'أيام', weeks: 'أسابيع', months: 'مزمن' };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={on ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ type: 'spring', stiffness: 210, damping: 26, delay: 0.1 }}
            className="relative overflow-hidden rounded-[32px] mx-4 mb-4"
            style={{
                background: vis.heroGrad,
                boxShadow: `0 28px 65px ${vis.glow}, 0 8px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.22)`,
                border: `1px solid ${vis.border}`,
            }}>
            <WaterAmbient domainColor={vis.particleColor} />
            {/* وميض الحافة العليا */}
            <div className="absolute inset-x-0 top-0 pointer-events-none"
                style={{ height: '52%', background: 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 40%, transparent 100%)', borderRadius: '32px 32px 0 0' }} />
            {/* نقطة الانعكاس */}
            <div className="absolute pointer-events-none"
                style={{ top: 10, right: 16, width: 55, height: 28, background: 'radial-gradient(ellipse, rgba(255,255,255,0.20) 0%, transparent 70%)', filter: 'blur(5px)' }} />
            {/* حبيبات لامعة */}
            <div className="absolute rounded-full" style={{ top: 18, right: 100, width: 5, height: 5, background: `${vis.particleColor}80`, filter: 'blur(1px)' }} />
            <div className="absolute rounded-full" style={{ top: 30, right: 120, width: 3, height: 3, background: `rgba(255,255,255,0.35)` }} />

            <div className="relative z-10 p-5 pb-4">
                {/* Header row */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <motion.div initial={{ opacity: 0, x: -8 }} animate={on ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2.5"
                            style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: `1px solid ${vis.border}` }}>
                            <span style={{ fontSize: 10, fontWeight: 900, color: vis.textColor }}>{meta.badge}</span>
                        </motion.div>
                        <motion.h1 initial={{ opacity: 0, y: 6 }} animate={on ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.25 }}
                            style={{ fontSize: 20, fontWeight: 900, color: W.textPrimary, letterSpacing: '-0.02em', lineHeight: 1.25, maxWidth: 200 }}>
                            خريطة توجيهك
                            <span className="block" style={{ fontSize: 12.5, fontWeight: 600, color: vis.textColor, lineHeight: 1.5 }}>
                                نظام طِبرَا · {primary?.arabicName}
                            </span>
                        </motion.h1>
                    </div>
                    <motion.div initial={{ opacity: 0, scale: 0.55 }} animate={on ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: 0.22, type: 'spring', stiffness: 350, damping: 20 }}>
                        <WaterScoreRing score={triageResult.score} color={vis.particleColor} />
                    </motion.div>
                </div>

                {/* Stats row */}
                <motion.div initial={{ opacity: 0 }} animate={on ? { opacity: 1 } : {}} transition={{ delay: 0.36 }}
                    className="grid grid-cols-3 gap-[1px] rounded-[18px] overflow-hidden"
                    style={{ background: `rgba(0,0,0,0.25)` }}>
                    {[
                        { l: 'الشكوى', v: `${pathway?.emoji ?? '⚕️'} ${pathway?.label ?? '—'}` },
                        { l: 'الشدة',  v: `${answers.severity}/١٠` },
                        { l: 'المدة',  v: durMap[answers.duration] ?? '—' },
                    ].map((d, i) => (
                        <div key={i} className="text-center py-2.5 px-1"
                            style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}>
                            <p style={{ fontSize: 7.5, color: vis.textColor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{d.l}</p>
                            <p style={{ fontSize: 12, fontWeight: 800, color: W.textPrimary, marginTop: 2 }}>{d.v}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════ */
/* DOMAIN COMPASS CARD                                    */
/* ══════════════════════════════════════════════════════ */
function DomainCompassCard({ routing, on }: {
    routing: ReturnType<typeof computeRouting>; on: boolean;
}) {
    const primary   = DOMAIN_BY_ID[routing.primary_domain];
    const secondary = DOMAIN_BY_ID[routing.secondary_domain];
    const vis       = DOMAIN_VIS[routing.primary_domain];
    const secVis    = DOMAIN_VIS[routing.secondary_domain];
    const domains: DomainId[] = ['jasadi', 'nafsi', 'fikri', 'ruhi'];
    const maxScore  = Math.max(...domains.map(d => routing.domain_scores[d] ?? 0), 1);

    return (
        <GlassCard delay={0.34} on={on} className="mx-4 mb-4 p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 relative z-10">
                {/* Domain composite orb */}
                <div className="relative w-11 h-11 flex-shrink-0">
                    <div className="w-11 h-11 rounded-[14px] flex items-center justify-center relative overflow-hidden"
                        style={{
                            background: vis.grad,
                            border: '1.5px solid rgba(255,255,255,0.88)',
                            boxShadow: `0 4px 16px ${vis.glow}`,
                        }}>
                        <div className="absolute top-0 left-0 right-0 h-[48%]"
                            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)', borderRadius: '12px 12px 0 0' }} />
                        <span style={{ fontSize: 18, position: 'relative', zIndex: 1 }}>{primary?.emoji}</span>
                    </div>
                    {/* Secondary mini */}
                    <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                            background: secVis.grad,
                            border: '2px solid rgba(255,255,255,0.9)',
                            width: 20, height: 20, fontSize: 10,
                        }}>
                        {secondary?.emoji}
                    </div>
                </div>
                <div>
                    <p style={{ fontSize: 9, fontWeight: 900, color: W.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em' }}>خريطة الأقسام الأربعة</p>
                    <p style={{ fontSize: 13, fontWeight: 900, color: W.textPrimary }}>
                        {primary?.arabicName}
                        <span style={{ fontSize: 11, fontWeight: 600, color: W.textSub }}> + {secondary?.arabicName}</span>
                    </p>
                </div>
            </div>

            {/* Primary/Secondary chips */}
            <div className="flex gap-2 mb-4 relative z-10">
                <div className="flex-1 rounded-[16px] p-3 relative overflow-hidden"
                    style={{ background: vis.tint, border: `1px solid ${vis.border}`, backdropFilter: 'blur(8px)' }}>
                    <div className="absolute top-0 left-0 right-0 h-[40%]"
                        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%)', borderRadius: '14px 14px 0 0' }} />
                    <p style={{ fontSize: 7, fontWeight: 900, color: vis.textColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3, position: 'relative', zIndex: 1 }}>رئيسي</p>
                    <div className="flex items-center gap-1.5" style={{ position: 'relative', zIndex: 1 }}>
                        <span style={{ fontSize: 15 }}>{primary?.emoji}</span>
                        <span style={{ fontSize: 13, fontWeight: 900, color: W.textPrimary }}>{primary?.arabicName}</span>
                    </div>
                </div>
                <div className="flex-1 rounded-[16px] p-3 relative overflow-hidden"
                    style={{ background: secVis.tint, border: `1px solid ${secVis.border}`, backdropFilter: 'blur(8px)' }}>
                    <div className="absolute top-0 left-0 right-0 h-[40%]"
                        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)', borderRadius: '14px 14px 0 0' }} />
                    <p style={{ fontSize: 7, fontWeight: 900, color: secVis.textColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3, position: 'relative', zIndex: 1 }}>مساند</p>
                    <div className="flex items-center gap-1.5" style={{ position: 'relative', zIndex: 1 }}>
                        <span style={{ fontSize: 15 }}>{secondary?.emoji}</span>
                        <span style={{ fontSize: 13, fontWeight: 900, color: W.textPrimary }}>{secondary?.arabicName}</span>
                    </div>
                </div>
            </div>

            {/* Score bars */}
            <div className="space-y-2.5 relative z-10">
                {domains.map((domId, i) => {
                    const dom  = DOMAIN_BY_ID[domId];
                    const dv   = DOMAIN_VIS[domId];
                    const score = routing.domain_scores[domId] ?? 0;
                    const pct  = maxScore > 0 ? (score / maxScore) * 100 : 0;
                    const isPrimary = domId === routing.primary_domain;

                    return (
                        <motion.div key={domId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={on ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 0.42 + i * 0.07, type: 'spring', stiffness: 280, damping: 28 }}
                            style={{ opacity: score === 0 ? 0.35 : 1 }}
                            className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 flex-shrink-0" style={{ width: 70 }}>
                                <span style={{ fontSize: 14 }}>{dom?.emoji}</span>
                                <span style={{ fontSize: 9.5, fontWeight: 800, color: isPrimary ? dv.textColor : W.textMuted }}>
                                    {dom?.arabicName}
                                </span>
                            </div>
                            {/* Bar — water liquid style */}
                            <div className="flex-1 h-[7px] rounded-full overflow-hidden"
                                style={{ background: `${dv.particleColor}12` }}>
                                <motion.div className="h-full rounded-full"
                                    style={{
                                        background: isPrimary
                                            ? `linear-gradient(90deg, ${dv.particleColor}, ${W.tealLight})`
                                            : `${dv.particleColor}55`,
                                        boxShadow: isPrimary ? `0 0 8px ${dv.particleColor}40` : 'none',
                                    }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ delay: 0.48 + i * 0.07, duration: 1.0, ease: [0.05, 0.7, 0.1, 1] }}
                                />
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 900, color: isPrimary ? dv.textColor : W.textMuted, width: 34, textAlign: 'right' }}>
                                {isPrimary ? <AnimatedNum value={score} delay={0.5 + i * 0.07} suffix="%" /> : `${score}%`}
                            </span>
                        </motion.div>
                    );
                })}
            </div>

            {/* Why divider */}
            <div className="h-px my-4 relative z-10" style={{ background: `linear-gradient(90deg, transparent, ${vis.particleColor}30, transparent)` }} />

            {/* Why text */}
            <div className="relative z-10 rounded-[16px] p-3"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.10)` }}>
                <p style={{ fontSize: 9, fontWeight: 900, color: vis.textColor, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }}>
                    لماذا هذا التوجيه؟
                </p>
                <p style={{ fontSize: 12, color: W.textSub, lineHeight: 1.75, fontWeight: 500 }}>{routing.why}</p>
            </div>
        </GlassCard>
    );
}

/* ══════════════════════════════════════════════════════ */
/* PRIORITY CARD                                          */
/* ══════════════════════════════════════════════════════ */
function PriorityCard({ priority, domainColor, delay, on }: {
    priority: string; domainColor: string; delay: number; on: boolean;
}) {
    return (
        <GlassCard delay={delay} on={on} className="mx-4 mb-4 p-4">
            <div className="absolute top-0 bottom-0 right-0 w-1 rounded-l-full"
                style={{ background: `linear-gradient(to bottom, ${domainColor}, ${domainColor}50)` }} />
            <div className="flex items-start gap-3 relative z-10">
                <div className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                    style={{ background: `${domainColor}12`, border: `1px solid ${domainColor}22` }}>
                    <div className="absolute top-0 left-0 right-0 h-[45%]"
                        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)' }} />
                    <Star style={{ width: 16, height: 16, color: domainColor, position: 'relative', zIndex: 1 }} />
                </div>
                <div>
                    <p style={{ fontSize: 9, fontWeight: 900, color: domainColor, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
                        أولويتك هذا الأسبوع
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: W.textPrimary, lineHeight: 1.65 }}>{priority}</p>
                </div>
            </div>
        </GlassCard>
    );
}

/* ══════════════════════════════════════════════════════ */
/* 3D METRIC BADGES                                       */
/* ══════════════════════════════════════════════════════ */
function TriDimBadges({ triageResult, delay, on }: {
    triageResult: ReturnType<typeof computeTriage>; delay: number; on: boolean;
}) {
    const func = FUNCTIONAL_PATTERN_INFO[triageResult.topFunctionalPattern];
    const som  = SOMATIC_THEME_INFO[triageResult.topSomaticTheme];

    const dims = [
        { l: 'الاعتيادي', v: `${triageResult.score}/10`,          color: W.teal,      sub: 'طب تقليدي' },
        { l: 'الوظيفي',   v: `${triageResult.functionalScore}/10`, color: '#7C3AED',   sub: func?.label ?? '—' },
        { l: 'الشعوري',   v: `${triageResult.somaticScore}/10`,    color: '#DB2777',   sub: som?.label  ?? '—' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={on ? { opacity: 1, y: 0 } : {}} transition={{ delay }}
            className="mx-4 mb-4">
            <p style={{ fontSize: 9, fontWeight: 900, color: W.textMuted, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>
                البصمة الصحية الثلاثية
            </p>
            <div className="grid grid-cols-3 gap-2">
                {dims.map((d, i) => (
                    <motion.div key={d.l}
                        initial={{ opacity: 0, scale: 0.87 }}
                        animate={on ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: delay + i * 0.07, type: 'spring', stiffness: 300, damping: 25 }}
                        className="relative overflow-hidden rounded-[20px] p-3"
                        style={{
                            background: W.glass,
                            border: `1px solid ${W.glassBorder}`,
                            backdropFilter: 'blur(24px) saturate(160%)',
                            boxShadow: `0 16px 40px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.18)`,
                        }}>
                        {/* وميض علوي */}
                        <div className="absolute inset-x-0 top-0" style={{ height: '48%', background: W.sheen, borderRadius: '20px 20px 0 0' }} />
                        {/* Accent top strip */}
                        <div className="absolute top-0 left-[15%] right-[15%] h-[2.5px] rounded-b-full"
                            style={{ background: `linear-gradient(90deg, ${d.color}40, ${d.color}, ${d.color}40)`, boxShadow: `0 0 8px ${d.color}60` }} />
                        <p style={{ fontSize: 20, fontWeight: 900, color: d.color, lineHeight: 1, marginBottom: 3, textShadow: `0 0 16px ${d.color}60` }}>{d.v}</p>
                        <p style={{ fontSize: 8.5, fontWeight: 800, color: d.color, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d.l}</p>
                        <p className="line-clamp-2" style={{ fontSize: 8, color: W.textSub, lineHeight: 1.4, fontWeight: 500 }}>{d.sub}</p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════ */
/* TOOL CARD — liquid glass                               */
/* ══════════════════════════════════════════════════════ */
function LiquidToolCard({ tool, index, domainColor, on, primaryDomain }: {
    tool: ToolRecommendation; index: number; domainColor: string; on: boolean; primaryDomain?: DomainId;
}) {
    const meta = TOOL_META[tool.type] ?? TOOL_META['test'];
    const Icon = meta.icon;

    const accentColors = [domainColor, '#7C3AED', '#0284C7', '#DB2777', '#D97706'];
    const accent = accentColors[index % accentColors.length];

    const handleToolClick = () => {
        haptic.tap();
        markToolOpened(tool.id);
        trackEvent('routing_tool_opened', {
            tool_id: tool.id,
            tool_type: tool.type,
            tool_name: tool.englishName,
            domain: primaryDomain ?? 'unknown',
            is_free: tool.isFree,
        });
    };

    return (
        <Link href={tool.href} onClick={handleToolClick}>
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={on ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.72 + index * 0.08, type: 'spring', stiffness: 250, damping: 26 }}
                whileTap={{ scale: 0.97 }}
                className="relative overflow-hidden rounded-[22px] cursor-pointer mb-2.5"
                style={{
                    background: W.glass,
                    border: `1.5px solid ${W.glassBorder}`,
                    backdropFilter: 'blur(26px)',
                    boxShadow: W.glassShadow,
                }}>
                {/* Glass shimmer */}
                <div className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)' }} />
                {/* Top-left caustic */}
                <div className="absolute top-0 left-0 w-[45%] h-[55%]"
                    style={{ background: 'linear-gradient(140deg, rgba(255,255,255,0.4) 0%, transparent 70%)' }} />
                {/* Right accent edge */}
                <div className="absolute top-0 bottom-0 right-0 w-[3px] rounded-l-full"
                    style={{ background: `linear-gradient(to bottom, ${accent}, ${accent}50)` }} />

                <div className="flex items-center gap-3 p-3.5 pr-5 relative z-10">
                    {/* Emoji icon */}
                    <div className="relative flex-shrink-0 w-11 h-11 rounded-[14px] flex items-center justify-center overflow-hidden"
                        style={{ background: `${accent}12`, border: `1px solid ${accent}22` }}>
                        <div className="absolute top-0 left-0 right-0 h-[45%]"
                            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)', borderRadius: '12px 12px 0 0' }} />
                        <span style={{ fontSize: 20, position: 'relative', zIndex: 1 }}>{tool.emoji}</span>
                        {/* Type badge */}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: `${accent}`, border: '1.5px solid rgba(255,255,255,0.85)', width: 16, height: 16 }}>
                            <Icon className="text-white" style={{ width: 8, height: 8 }} />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <span style={{ fontSize: 8.5, fontWeight: 900, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{meta.label}</span>
                            {!tool.isFree && (
                                <span className="px-1.5 py-0.5 rounded-full"
                                    style={{ fontSize: 7, fontWeight: 800, background: 'rgba(251,191,36,0.15)', color: '#92400E', border: '1px solid rgba(251,191,36,0.3)' }}>
                                    PRO
                                </span>
                            )}
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 800, color: W.textPrimary, lineHeight: 1.3, marginBottom: 2 }}>{tool.arabicName}</p>
                        <p className="line-clamp-1" style={{ fontSize: 10, color: W.textSub, fontWeight: 500 }}>{tool.description}</p>
                    </div>

                    {/* Duration + arrow */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                        {tool.durationMinutes > 0 && (
                            <div className="flex items-center gap-0.5">
                                <Clock style={{ width: 9, height: 9, color: W.textMuted }} />
                                <span style={{ fontSize: 8.5, fontWeight: 700, color: W.textMuted }}>{tool.durationMinutes}د</span>
                            </div>
                        )}
                        <div className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ background: `${accent}14`, border: `1px solid ${accent}20` }}>
                            <ChevronLeft style={{ width: 11, height: 11, color: accent }} />
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

/* ══════════════════════════════════════════════════════ */
/* CTA SECTION                                            */
/* ══════════════════════════════════════════════════════ */
function WaterCTA({ routing, triageResult, on }: {
    routing: ReturnType<typeof computeRouting>;
    triageResult: ReturnType<typeof computeTriage>;
    on: boolean;
}) {
    const primary = DOMAIN_BY_ID[routing.primary_domain];
    const vis     = DOMAIN_VIS[routing.primary_domain];
    const isEmergency = triageResult.level === 'emergency';

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={on ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.1 }}
            className="mx-4 mb-4 space-y-3">

            {routing.escalation_needed ? (
                <>
                    <Link href={isEmergency ? 'tel:911' : createPageUrl('BookAppointment')} onClick={() => haptic.impact()}>
                        <motion.div whileTap={{ scale: 0.97 }}
                            className="relative overflow-hidden h-14 rounded-[26px] flex items-center gap-3 px-5 cursor-pointer"
                            style={{
                                background: isEmergency
                                    ? 'linear-gradient(145deg, rgba(255,255,255,0.85) 0%, rgba(254,202,202,0.85) 40%, rgba(220,38,38,0.65) 100%)'
                                    : vis.grad,
                                boxShadow: isEmergency
                                    ? '0 6px 28px rgba(220,38,38,0.25), 0 2px 0 rgba(255,255,255,0.9) inset'
                                    : `0 6px 28px ${vis.glow}, 0 2px 0 rgba(255,255,255,0.9) inset`,
                                border: '1.5px solid rgba(255,255,255,0.88)',
                            }}>
                            <div className="absolute top-0 left-0 w-[55%] h-[55%]"
                                style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.45) 0%, transparent 70%)', borderRadius: 26 }} />
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                                style={{ background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.7)' }}>
                                {isEmergency ? <Phone className="w-4 h-4" style={{ color: '#DC2626' }} /> : <Calendar className="w-4 h-4" style={{ color: vis.textColor }} />}
                            </div>
                            <span style={{ fontSize: 15, fontWeight: 900, color: isEmergency ? '#7F1D1D' : W.textPrimary, flex: 1, textAlign: 'right', position: 'relative', zIndex: 1 }}>
                                {isEmergency ? 'اتصل بالإسعاف فوراً' : 'احجز مع د. عمر الآن'}
                            </span>
                            <ArrowLeft style={{ width: 16, height: 16, color: isEmergency ? '#DC2626' : vis.textColor, opacity: 0.7, position: 'relative', zIndex: 1 }} />
                        </motion.div>
                    </Link>

                    <Link href="https://wa.me/967771447111" onClick={() => haptic.selection()}>
                        <motion.div whileTap={{ scale: 0.97 }}
                            className="relative overflow-hidden h-12 rounded-[20px] flex items-center justify-center gap-2.5 cursor-pointer"
                            style={{ background: 'rgba(240,253,244,0.9)', border: '1.5px solid rgba(187,247,208,0.7)', backdropFilter: 'blur(16px)' }}>
                            <MessageCircle style={{ width: 16, height: 16, color: '#16A34A' }} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>تواصل عبر واتساب</span>
                        </motion.div>
                    </Link>
                </>
            ) : (
                <Link href={`/sections/${routing.primary_domain}`} onClick={() => haptic.impact()}>
                    <motion.div whileTap={{ scale: 0.97 }}
                        className="relative overflow-hidden h-14 rounded-[26px] flex items-center gap-3 px-5 cursor-pointer"
                        style={{
                            background: vis.grad,
                            boxShadow: `0 6px 28px ${vis.glow}, 0 2px 0 rgba(255,255,255,0.9) inset`,
                            border: '1.5px solid rgba(255,255,255,0.88)',
                        }}>
                        <div className="absolute top-0 left-0 w-[55%] h-[55%]"
                            style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.4) 0%, transparent 70%)', borderRadius: 26 }} />
                        {/* Caustic dots */}
                        <div className="absolute top-3 right-[100px] w-2 h-2 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.7)', filter: 'blur(1px)' }} />
                        <div className="w-9 h-9 rounded-[13px] flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.42)', border: '1px solid rgba(255,255,255,0.7)' }}>
                            <span style={{ fontSize: 18, position: 'relative', zIndex: 1 }}>{primary?.emoji}</span>
                        </div>
                        <div className="flex-1 text-right" style={{ position: 'relative', zIndex: 1 }}>
                            <p style={{ fontSize: 15, fontWeight: 900, color: W.textPrimary, lineHeight: 1.2 }}>
                                ادخل قسم {primary?.arabicName}
                            </p>
                            <p style={{ fontSize: 10, color: vis.textColor, fontWeight: 600 }}>
                                {primary?.englishName} Care Portal
                            </p>
                        </div>
                        <ArrowLeft style={{ width: 16, height: 16, color: vis.textColor, opacity: 0.7, position: 'relative', zIndex: 1 }} />
                    </motion.div>
                </Link>
            )}

            {/* Disclaimer glass */}
            <div className="flex items-start gap-2.5 rounded-[18px] p-3.5"
                style={{ background: W.glass, border: `1px solid ${W.glassBorder}`, backdropFilter: 'blur(18px)' }}>
                <Sparkles style={{ width: 13, height: 13, color: W.textMuted, flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 10, color: W.textSub, lineHeight: 1.6, fontWeight: 500 }}>
                    هذا التحليل استرشادي وليس تشخيصاً طبياً. في الحالات الطارئة، توجه للطوارئ فوراً.
                </p>
            </div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════ */
/* MAIN EXPORT                                            */
/* ══════════════════════════════════════════════════════ */
export function StepResult({ answers, onRestart }: { answers: EngineAnswers; onRestart: () => void }) {
    const router       = useRouter();
    const triageResult = useMemo(() => computeTriage(answers), [answers]);
    const routing      = useMemo(() => computeRouting(answers, triageResult), [answers, triageResult]);
    const vis          = DOMAIN_VIS[routing.primary_domain];
    const [on, setOn]  = useState(false);
    const [saved, setSaved] = useState(false);

    // ── Auto-save care plan on mount ──
    useEffect(() => {
        if (!saved) {
            try {
                saveCarePlan(routing, triageResult, answers);
                setSaved(true);
                trackEvent('assessment_completed', {
                    primary_domain: routing.primary_domain,
                    secondary_domain: routing.secondary_domain,
                    triage_level: triageResult.level,
                    triage_score: triageResult.score,
                    escalation_needed: routing.escalation_needed,
                });
                trackEvent('routing_result_viewed', {
                    primary_domain: routing.primary_domain,
                    secondary_domain: routing.secondary_domain,
                    primary_subdomain: routing.primary_subdomain,
                    tools_count: routing.recommended_tools.length,
                });
            } catch (e) {
                console.warn('[CarePlan] Save failed:', e);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Escalation analytics ──
    useEffect(() => {
        if (routing.escalation_needed && on) {
            trackEvent('routing_escalation_shown', {
                triage_level: triageResult.level,
                severity: answers.severity,
                duration: answers.duration,
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [on]);

    useEffect(() => {
        const t = setTimeout(() => {
            setOn(true);
            haptic.trigger('heavy');
            if (triageResult.level === 'manageable' || triageResult.level === 'review') {
                confetti({
                    particleCount: 80, spread: 88, origin: { y: 0.3 },
                    colors: [W.tealLight, '#FFFFFF', W.lavender, W.seafoam, W.cyan],
                    ticks: 180,
                });
            }
        }, 300);
        return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div dir="rtl" style={{ background: PAGE_BG_RESULT, minHeight: '100svh', paddingBottom: 52, position: 'relative' }}>
            {/* طبقة المياه الكونية */}
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                {/* Caustic water lights */}
                {Object.values(WATER_CAUSTIC_R).map((g, i) => (
                    <div key={i} className="absolute inset-0" style={{ background: g }} />
                ))}
                {/* Domain glow orb */}
                <motion.div
                    animate={{ scale: [1, 1.10, 1], opacity: [0.6, 0.95, 0.6] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute', top: -120, right: -80,
                        width: 360, height: 360, borderRadius: '50%',
                        background: `radial-gradient(circle, ${vis.particleColor}22 0%, transparent 65%)`,
                        filter: 'blur(55px)',
                    }}
                />
                <div style={{
                    position: 'absolute', bottom: -60, left: -50,
                    width: 280, height: 280, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(34,211,238,0.10) 0%, transparent 65%)',
                    filter: 'blur(50px)',
                }} />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Watermark */}
                <motion.p initial={{ opacity: 0 }} animate={on ? { opacity: 1 } : {}} transition={{ delay: 0.07 }}
                    style={{ fontSize: 9, fontWeight: 800, color: W.textMuted, textAlign: 'center',
                        paddingTop: 12, paddingBottom: 8, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    طِبرَا · محرك الرعاية الذكي
                </motion.p>

                {/* ⓪ Escalation Banner */}
                {routing.escalation_needed && on && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05, type: 'spring', stiffness: 300, damping: 26 }}
                        className="mx-4 mb-3 relative overflow-hidden rounded-[22px] p-4"
                        style={{
                            background: triageResult.level === 'emergency'
                                ? 'linear-gradient(145deg, rgba(80,10,10,0.92) 0%, rgba(140,15,15,0.82) 100%)'
                                : 'linear-gradient(145deg, rgba(60,30,5,0.92) 0%, rgba(110,50,5,0.82) 100%)',
                            border: triageResult.level === 'emergency'
                                ? '1px solid rgba(255,80,80,0.38)'
                                : '1px solid rgba(245,158,11,0.35)',
                            boxShadow: triageResult.level === 'emergency'
                                ? '0 16px 40px rgba(200,0,0,0.30), inset 0 1px 0 rgba(255,120,120,0.18)'
                                : '0 16px 40px rgba(180,80,0,0.25), inset 0 1px 0 rgba(245,158,11,0.15)',
                        }}>
                        {/* وميض علوي */}
                        <div className="absolute inset-x-0 top-0" style={{ height: '45%', background: triageResult.level === 'emergency' ? 'linear-gradient(180deg, rgba(255,120,120,0.16) 0%, transparent 100%)' : 'linear-gradient(180deg, rgba(255,200,80,0.12) 0%, transparent 100%)', borderRadius: '22px 22px 0 0' }} />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <motion.div animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>
                                    <Shield style={{ width: 16, height: 16, color: triageResult.level === 'emergency' ? '#FF6B6B' : '#F59E0B' }} />
                                </motion.div>
                                <span style={{ fontSize: 12, fontWeight: 900, color: triageResult.level === 'emergency' ? 'rgba(255,160,160,0.95)' : 'rgba(255,200,80,0.95)' }}>
                                    {triageResult.level === 'emergency' ? '⚠️ حالة طارئة — تحتاج تدخل فوري'
                                        : triageResult.level === 'urgent' ? '🟠 حالة عاجلة — تحتاج تقييم طبي'
                                        : '🩺 هذه الحالة تحتاج تقييماً مباشراً مع الطبيب'}
                                </span>
                            </div>
                            <p style={{ fontSize: 11, color: triageResult.level === 'emergency' ? 'rgba(255,180,180,0.85)' : 'rgba(255,200,100,0.85)', fontWeight: 500, lineHeight: 1.6, marginBottom: 10 }}>
                                {triageResult.level === 'emergency'
                                    ? 'أعراضك تشير لحالة تحتاج رعاية طبية فورية. لا تعتمد على هذا التقييم وحده.'
                                    : answers.severity >= 8 && answers.duration === 'months'
                                    ? 'شدة الأعراض مرتفعة مع مدة طويلة. نوصي بجلسة تشخيصية مباشرة مع د. عمر.'
                                    : 'بناءً على تقييمك، ننصحك بمتابعة مع أخصائي لضمان التشخيص الدقيق.'}
                            </p>
                            <Link href={triageResult.level === 'emergency' ? 'tel:911' : createPageUrl('BookAppointment')}
                                onClick={() => {
                                    haptic.impact();
                                    trackEvent('booking_from_routing', {
                                        triage_level: triageResult.level,
                                        from: 'escalation_banner',
                                    });
                                }}>
                                <motion.div whileTap={{ scale: 0.97 }}
                                    className="flex items-center justify-center gap-2 h-10 rounded-[14px]"
                                    style={{
                                        background: triageResult.level === 'emergency'
                                            ? 'rgba(220,0,0,0.85)'
                                            : 'rgba(200,120,0,0.75)',
                                        border: triageResult.level === 'emergency'
                                            ? '1px solid rgba(255,100,100,0.45)'
                                            : '1px solid rgba(245,158,11,0.40)',
                                        boxShadow: triageResult.level === 'emergency'
                                            ? '0 4px 16px rgba(220,0,0,0.40)'
                                            : '0 4px 16px rgba(180,90,0,0.35)',
                                    }}>
                                    {triageResult.level === 'emergency'
                                        ? <Phone style={{ width: 14, height: 14, color: '#fff' }} />
                                        : <Calendar style={{ width: 14, height: 14, color: '#78350F' }} />}
                                    <span style={{
                                        fontSize: 13, fontWeight: 900,
                                        color: triageResult.level === 'emergency' ? '#fff' : '#78350F',
                                    }}>
                                        {triageResult.level === 'emergency' ? 'اتصل بالإسعاف' : 'احجز الآن'}
                                    </span>
                                </motion.div>
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* ① Hero */}
                <HeroCard triageResult={triageResult} answers={answers} routing={routing} on={on} />

                {/* ② Domain Compass */}
                <DomainCompassCard routing={routing} on={on} />

                {/* ③ Priority */}
                <PriorityCard priority={routing.priority} domainColor={vis.particleColor} delay={0.66} on={on} />

                {/* ④ 3D Badges */}
                <TriDimBadges triageResult={triageResult} delay={0.74} on={on} />

                {/* ⑤ Tools */}
                {routing.recommended_tools.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={on ? { opacity: 1 } : {}} transition={{ delay: 0.68 }}>
                        <div className="flex items-center gap-3 mx-4 mb-3">
                            <div className="flex-1 h-px"
                                style={{ background: `linear-gradient(to right, transparent, ${vis.particleColor}25)` }} />
                            <p style={{ fontSize: 8.5, fontWeight: 900, color: W.textMuted, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
                                افتح الآن · {routing.recommended_tools.length} أدوات
                            </p>
                            <div className="flex-1 h-px"
                                style={{ background: `linear-gradient(to left, transparent, ${vis.particleColor}25)` }} />
                        </div>
                        <div className="mx-4">
                            {routing.recommended_tools.map((tool, i) => (
                                <LiquidToolCard key={tool.id} tool={tool} index={i}
                                    domainColor={vis.particleColor} on={on}
                                    primaryDomain={routing.primary_domain} />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ⑥ CTA */}
                <WaterCTA routing={routing} triageResult={triageResult} on={on} />

                {/* ⑦ My Plan CTA */}
                <motion.div initial={{ opacity: 0 }} animate={on ? { opacity: 1 } : {}} transition={{ delay: 1.15 }}
                    className="mx-4 mb-3">
                    <Link href="/my-plan" onClick={() => {
                        haptic.impact();
                        trackEvent('routing_tool_opened', { tool_id: 'my_plan', tool_type: 'plan', tool_name: 'My Plan Page', domain: routing.primary_domain, is_free: true });
                    }}>
                        <motion.div whileTap={{ scale: 0.97 }}
                            className="relative overflow-hidden h-13 rounded-[22px] flex items-center gap-3 px-5 cursor-pointer py-3.5"
                            style={{
                                background: vis.grad,
                                boxShadow: `0 6px 24px ${vis.glow}, 0 2px 0 rgba(255,255,255,0.9) inset`,
                                border: '1.5px solid rgba(255,255,255,0.88)',
                            }}>
                            <div className="absolute top-0 left-0 w-[50%] h-[50%]"
                                style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.45) 0%, transparent 70%)', borderRadius: 20 }} />
                            <Star style={{ width: 18, height: 18, color: vis.textColor, position: 'relative', zIndex: 1 }} />
                            <div className="flex-1 text-right" style={{ position: 'relative', zIndex: 1 }}>
                                <p style={{ fontSize: 14, fontWeight: 900, color: W.textPrimary }}>خطتي العلاجية</p>
                                <p style={{ fontSize: 10, fontWeight: 600, color: vis.textColor }}>عرض الأدوات والمتابعة</p>
                            </div>
                            <ChevronLeft style={{ width: 14, height: 14, color: vis.textColor, opacity: 0.7, position: 'relative', zIndex: 1 }} />
                        </motion.div>
                    </Link>
                </motion.div>

                {/* ⑧ Restart */}
                <motion.div initial={{ opacity: 0 }} animate={on ? { opacity: 0.75 } : {}} transition={{ delay: 1.22 }} className="mx-4">
                    <motion.button whileTap={{ scale: 0.97 }}
                        onClick={() => { haptic.selection(); onRestart(); }}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[18px]"
                        style={{ background: W.glass, border: `1px solid ${W.glassBorder}`, backdropFilter: 'blur(16px)' }}>
                        <RefreshCw style={{ width: 13, height: 13, color: W.textMuted }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: W.textSub }}>تحليل حالة جديدة</span>
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
}
