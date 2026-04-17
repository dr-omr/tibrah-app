'use client';
/**
 * DomainGrid.tsx — طِبرَا Water Glass Domain Grid  ✦ WORLD CLASS ✦
 * ──────────────────────────────────────────────────────────────────
 * 5 بطاقات مائية زجاجية خرافية — كل بطاقة بوابة لعالم كامل
 *
 * تأثير المياه الزجاجية:
 *  ① Glass base: backdrop-blur(40px) saturate(2) + multilayer
 *  ② Liquid shimmer sweep — موجة ضوء أفقية متحركة
 *  ③ Bubble highlights — نقاط ضوئية دائرية تحاكي فقاعات الزجاج
 *  ④ Chromatic top stripe — شريط لوني ملون أعلى كل بطاقة
 *  ⑤ Colored ambient pools — بحيرات ضوء ملونة خلف الزجاج
 *  ⑥ 3D Tilt — إمالة فيزيائية مع حركة الإصبع
 *  ⑦ Multi-layer physical shadow system
 *
 * Layout (Bento):
 *  [──── جسدي (tall) ────][── نفسي ──]
 *  [── فكري ──][──── روحي (tall) ────]
 *  [──────────── أخرى (full) ─────────]
 */

import React, { useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowLeft, ChevronLeft, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { STAGGER_ITEM } from '@/lib/tibrah-motion';
import { DOMAINS, DomainDefinition } from './domain-data';
import { useHealthDashboard } from '@/hooks/useHealthDashboard';

/* ─────────────────────────────────────────────────────────────
   Animated Score Ring
───────────────────────────────────────────────────────────── */
function ScoreRing({
    score, color, size = 52, sw = 4.5,
}: { score: number; color: string; size?: number; sw?: number }) {
    const r    = (size - sw - 2) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;

    return (
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            {/* Colored glow behind ring */}
            <div className="absolute inset-0 rounded-full pointer-events-none"
                style={{ boxShadow: `0 0 ${size * 0.5}px ${color}20` }} />
            <svg width={size} height={size}
                style={{ transform: 'rotate(-90deg)', display: 'block', overflow: 'visible' }}>
                <defs>
                    <linearGradient id={`rg-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.5" />
                        <stop offset="100%" stopColor={color} stopOpacity="1" />
                    </linearGradient>
                </defs>
                {/* Track */}
                <circle cx={size / 2} cy={size / 2} r={r}
                    strokeWidth={sw} stroke={`${color}18`} fill="none" />
                {/* Progress */}
                <motion.circle
                    cx={size / 2} cy={size / 2} r={r}
                    strokeWidth={sw}
                    stroke={`url(#rg-${color.replace('#', '')})`}
                    fill="none" strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ - dash }}
                    transition={{ duration: 1.5, ease: [0.34, 1.1, 0.64, 1], delay: 0.2 }}
                />
            </svg>
            {/* Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-black leading-none" style={{ color, fontSize: size * 0.27 }}>
                    {score}
                </span>
                <span className="font-bold leading-none" style={{ color, fontSize: size * 0.14, opacity: 0.5 }}>
                    %
                </span>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Progress Bar
───────────────────────────────────────────────────────────── */
function ProgressBar({ score, color }: { score: number; color: string }) {
    return (
        <div className="w-full h-[3px] rounded-full overflow-hidden"
            style={{ background: `${color}14` }}>
            <motion.div className="h-full rounded-full"
                style={{ background: `linear-gradient(to left, ${color}, ${color}70)` }}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1.3, ease: [0.34, 1.1, 0.64, 1], delay: 0.45 }}
            />
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Quick Action Pill (inside card)
───────────────────────────────────────────────────────────── */
function QuickPill({ label, href, color, isNew }: {
    label: string; href: string; color: string; isNew?: boolean;
}) {
    return (
        <Link href={href} onClick={() => haptic.tap()}>
            <motion.div
                whileTap={{ scale: 0.93 }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px]"
                style={{
                    background: 'rgba(255,255,255,0.65)',
                    border: `1px solid ${color}18`,
                    boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset',
                }}
            >
                <span className="text-[11px] font-bold text-slate-700 leading-none whitespace-nowrap">{label}</span>
                {isNew && (
                    <span className="text-[7px] font-black px-1 py-[2px] rounded-full text-white leading-none"
                        style={{ background: color }}>
                        ✦
                    </span>
                )}
            </motion.div>
        </Link>
    );
}

/* ═══════════════════════════════════════════════════════════════
   WATER GLASS DOMAIN CARD — البطاقة الأسطورية
═══════════════════════════════════════════════════════════════ */
function DomainCard({
    domain, index, realScore
}: {
    domain: DomainDefinition;
    index: number;
    realScore: number;
}) {
    const H = 210;
    const safeScore = Math.max(0, Math.min(100, realScore));

    /* 3D Tilt */
    const cardRef = useRef<HTMLDivElement>(null);
    const rx = useMotionValue(0);
    const ry = useMotionValue(0);
    const srx = useSpring(rx, { stiffness: 450, damping: 32 });
    const sry = useSpring(ry, { stiffness: 450, damping: 32 });

    const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        const el = cardRef.current;
        if (!el) return;
        const { left, top, width, height } = el.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        rx.set(-y * 9);
        ry.set(x * 9);
    }, [rx, ry]);

    const onLeave = useCallback(() => { rx.set(0); ry.set(0); }, [rx, ry]);

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 22, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28, delay: 0.05 + index * 0.08 }}
            className={`min-w-0`}
            style={{ height: H }}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
        >
            <Link href={domain.sectionHref} onClick={() => haptic.selection()} className="block h-full min-w-0">
                <motion.div
                    className="relative h-full rounded-[28px] overflow-hidden"
                    style={{
                        rotateX: srx,
                        rotateY: sry,
                        transformPerspective: 900,

                        /* ── WATER GLASS ── */
                        background: [
                            'linear-gradient(158deg,',
                            `  ${domain.color}18 0%,`,
                            '  rgba(255,255,255,0.84) 30%,',
                            '  rgba(255,255,255,0.72) 65%,',
                            `  ${domain.colorAlt}10 100%`,
                            ')',
                        ].join(''),
                        backdropFilter: 'blur(40px) saturate(2.0) brightness(1.06)',
                        WebkitBackdropFilter: 'blur(40px) saturate(2.0) brightness(1.06)',

                        /* ── Glass border system ── */
                        border: '1px solid rgba(255,255,255,0.72)',
                        borderTop: '1px solid rgba(255,255,255,0.95)',
                        borderLeft: '1px solid rgba(255,255,255,0.80)',

                        /* ── Physical multi-layer shadow ── */
                        boxShadow: [
                            // Top specular highlight
                            '0 2px 0 rgba(255,255,255,0.95) inset',
                            // Bottom color tint
                            `0 -1px 0 ${domain.color}12 inset`,
                            // Left edge shine
                            '1px 0 0 rgba(255,255,255,0.60) inset',
                            // Colored depth glow
                            `0 16px 50px ${domain.color}18`,
                            `0 6px 20px ${domain.color}0E`,
                            // Far ambient
                            '0 2px 12px rgba(0,0,0,0.07)',
                        ].join(', '),
                    }}
                    whileTap={{ scale: 0.952 }}
                >
                    {/* ── LIQUID SHIMMER SWEEP ── */}
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: [
                                'linear-gradient(115deg,',
                                '  transparent 25%,',
                                '  rgba(255,255,255,0.32) 44%,',
                                '  rgba(255,255,255,0.12) 52%,',
                                '  transparent 72%)',
                            ].join(''),
                        }}
                        animate={{ x: ['-140%', '140%'] }}
                        transition={{
                            duration: 4 + index * 0.6,
                            repeat: Infinity,
                            repeatDelay: 3 + index * 1.5,
                            ease: 'easeInOut',
                        }}
                    />

                    {/* ── BUBBLE HIGHLIGHTS (glass effect) ── */}
                    <div className="absolute top-3 left-4 w-2 h-2 rounded-full pointer-events-none"
                        style={{ background: 'rgba(255,255,255,0.60)', filter: 'blur(1px)' }} />
                    <div className="absolute top-5 left-7 w-1 h-1 rounded-full pointer-events-none"
                        style={{ background: 'rgba(255,255,255,0.40)' }} />
                    <div className="absolute top-8 left-5 w-1.5 h-1.5 rounded-full pointer-events-none"
                        style={{ background: 'rgba(255,255,255,0.30)', filter: 'blur(0.5px)' }} />

                    {/* ── SUBTLE LEFT ACCENT (no harsh top line) ── */}
                    <div
                        className="absolute top-4 bottom-4 right-0 w-[3.5px] rounded-full pointer-events-none"
                        style={{
                            background: `linear-gradient(to bottom, ${domain.color}60, ${domain.colorAlt}25, transparent 85%)`,
                        }}
                    />

                    {/* ── COLOR AMBIENT POOLS ── */}
                    <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full pointer-events-none"
                        style={{
                            background: `radial-gradient(circle, ${domain.color}22, transparent 70%)`,
                            filter: 'blur(16px)',
                        }} />
                    <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full pointer-events-none"
                        style={{
                            background: `radial-gradient(circle, ${domain.colorAlt}14, transparent 70%)`,
                            filter: 'blur(12px)',
                        }} />

                    {/* ════ CARD CONTENT ════ */}
                    <TallOrNormalContent domain={domain} index={index} safeScore={safeScore} />
                </motion.div>
            </Link>
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Full-width card content (أخرى)
───────────────────────────────────────────────────────────── */
function FullCardContent({ domain, safeScore }: { domain: DomainDefinition; safeScore: number }) {
    return (
        <div className="relative z-10 h-full flex items-center gap-4 px-5">
            {/* Emoji */}
            <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="flex-shrink-0 relative"
            >
                <div className="absolute inset-[-8px] rounded-full"
                    style={{ background: `radial-gradient(circle, ${domain.color}18, transparent 70%)` }} />
                <span className="text-[34px] leading-none relative">{domain.emoji}</span>
            </motion.div>

            {/* Score ring */}
            <ScoreRing score={safeScore} color={domain.color} size={48} sw={4} />

            {/* Identity */}
            <div className="flex-1 min-w-0">
                <p className="text-[8px] font-black uppercase tracking-[0.16em] mb-0.5"
                    style={{ color: domain.color, opacity: 0.60 }}>{domain.nameEn}</p>
                <h2 className="text-[20px] font-black text-slate-800 leading-none">{domain.name}</h2>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{domain.tagline}</p>
                <ProgressBar score={safeScore} color={domain.color} />
            </div>

            {/* Arrow */}
            <motion.div
                animate={{ x: [0, -3, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `${domain.color}12`, border: `1.5px solid ${domain.color}22` }}
            >
                <ArrowLeft className="w-4 h-4" style={{ color: domain.color }} />
            </motion.div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Tall / Normal card content
───────────────────────────────────────────────────────────── */
function TallOrNormalContent({
    domain, index, safeScore
}: { domain: DomainDefinition; index: number; safeScore: number }) {
    const emojiSize = 32;
    const ringSize  = 50;

    return (
        <div className="relative z-10 flex flex-col h-full p-4 gap-0">

            {/* ── TOP: emoji + ring + delta ── */}
            <div className="flex items-start justify-between flex-shrink-0">
                {/* Emoji with halo */}
                <motion.div
                    className="relative"
                    animate={{ y: [0, -4, 0], rotate: [0, 2, 0] }}
                    transition={{ duration: 3.5 + index * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <div className="absolute inset-[-10px] rounded-full"
                        style={{ background: `radial-gradient(circle, ${domain.color}1C, transparent 70%)` }} />
                    <span style={{ fontSize: emojiSize }} className="relative leading-none select-none">
                        {domain.emoji}
                    </span>
                </motion.div>

                {/* Ring + delta stacked */}
                <div className="flex flex-col items-end gap-1">
                    <ScoreRing score={safeScore} color={domain.color} size={ringSize} sw={4.5} />
                    {domain.delta !== 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, delay: 0.5 + index * 0.06 }}
                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
                            style={{
                                background: domain.delta > 0 ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.08)',
                                border: `1px solid ${domain.delta > 0 ? 'rgba(16,185,129,0.22)' : 'rgba(239,68,68,0.18)'}`,
                            }}
                        >
                            {domain.delta > 0
                                ? <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
                                : <TrendingDown className="w-2.5 h-2.5 text-rose-500" />
                            }
                            <span className="text-[8px] font-black"
                                style={{ color: domain.delta > 0 ? '#059669' : '#DC2626' }}>
                                {domain.delta > 0 ? `+${domain.delta}` : domain.delta}
                            </span>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* ── SPACER ── */}
            <div className="flex-1" />

            {/* ── BOTTOM: identity + progress + actions ── */}
            <div className="flex-shrink-0 flex flex-col gap-2">

                {/* Name + arrow */}
                <div className="flex items-end justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-[0.15em] mb-0.5"
                            style={{ color: domain.color, opacity: 0.55 }}>
                            {domain.nameEn}
                        </p>
                        <h2 className="font-black leading-none tracking-tight text-slate-800"
                            style={{ fontSize: 18 }}>
                            {domain.name}
                        </h2>
                        <p className="font-medium leading-tight mt-[3px]"
                            style={{ fontSize: 9.5, color: '#94a3b8' }}>
                            {domain.tagline}
                        </p>
                    </div>

                    <motion.div
                        animate={{ x: [0, -2.5, 0] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5"
                        style={{ background: `${domain.color}10`, border: `1.5px solid ${domain.color}22` }}
                    >
                        <ArrowLeft className="w-3.5 h-3.5" style={{ color: domain.color }} />
                    </motion.div>
                </div>

                {/* Progress bar uses the REAL global score */}
                <ProgressBar score={safeScore} color={domain.color} />

                {/* Quick pills (tall cards only) */}
                {domain.quickActions.length > 0 && (
                    <div className="flex gap-1.5 overflow-hidden">
                        {domain.quickActions.slice(0, 2).map((qa) => (
                            <QuickPill
                                key={qa.href}
                                label={qa.label}
                                href={qa.href}
                                color={domain.color}
                                isNew={qa.isNew}
                            />
                        ))}
                    </div>
                )}

                {/* Feature count row — now enriched with stats chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1">
                        <Sparkles className="w-2 h-2" style={{ color: domain.color, opacity: 0.55 }} />
                        <span className="text-[8.5px] font-bold" style={{ color: domain.color, opacity: 0.55 }}>
                            {domain.quickActions.length} خدمات
                        </span>
                    </div>
                    {'stats' in domain && (
                        <>
                            <div className="w-[3px] h-[3px] rounded-full bg-slate-300 flex-shrink-0" />
                            <span className="text-[7.5px] font-bold text-slate-400">
                                {(domain as any).stats.programs} برامج
                            </span>
                            <div className="w-[3px] h-[3px] rounded-full bg-slate-300 flex-shrink-0" />
                            <span className="text-[7.5px] font-bold text-slate-400">
                                {(domain as any).stats.tools} أدوات
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Composite Stats Banner — يعرض إجمالي المنصة فوق الشبكة
───────────────────────────────────────────────────────────── */
function CompositeBanner({ domains }: { domains: typeof DOMAINS }) {
    const totalServices = domains.reduce((s, d) => s + d.stats.services, 0);
    const totalPrograms = domains.reduce((s, d) => s + d.stats.programs, 0);
    const totalTools    = domains.reduce((s, d) => s + d.stats.tools,    0);
    const domainColors  = domains.map(d => d.color);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30, delay: 0.02 }}
            className="relative overflow-hidden rounded-[20px] mb-3 px-4 py-3"
            style={{
                background: [
                    'linear-gradient(148deg,',
                    '  rgba(255,255,255,0.92) 0%,',
                    '  rgba(255,255,255,0.82) 55%,',
                    '  rgba(255,255,255,0.70) 100%',
                    ')',
                ].join(''),
                border: '1px solid rgba(255,255,255,0.78)',
                borderTop: '1px solid rgba(255,255,255,0.96)',
                backdropFilter: 'blur(32px) saturate(2)',
                WebkitBackdropFilter: 'blur(32px) saturate(2)',
                boxShadow: [
                    '0 2px 0 rgba(255,255,255,0.96) inset',
                    '0 6px 20px rgba(0,0,0,0.05)',
                ].join(', '),
            }}
        >
            {/* Shimmer */}
            <motion.div className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(108deg, transparent 28%, rgba(255,255,255,0.25) 48%, transparent 68%)' }}
                animate={{ x: ['-140%', '140%'] }}
                transition={{ duration: 5, repeat: Infinity, repeatDelay: 8, ease: 'easeInOut' }} />

            <div className="relative z-10 flex items-center gap-3">
                {/* Color blob row */}
                <div className="flex items-center">
                    {domainColors.map((c, i) => (
                        <div key={c}
                            className="w-6 h-6 rounded-full flex-shrink-0 -mr-1.5"
                            style={{ background: c, border: '2px solid rgba(255,255,255,0.92)', boxShadow: `0 2px 8px ${c}30` }} />
                    ))}
                </div>

                {/* Stats */}
                <div className="flex-1 flex items-center gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                    {[
                        { v: totalServices, label: 'خدمة تشخيصية' },
                        { v: totalPrograms, label: 'برنامج علاجي'  },
                        { v: totalTools,    label: 'أداة يومية'     },
                    ].map(({ v, label }) => (
                        <div key={label} className="flex items-baseline gap-1 flex-shrink-0">
                            <motion.span className="text-[15px] font-black text-slate-800 leading-none"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                                {v}
                            </motion.span>
                            <span className="text-[8.5px] font-bold text-slate-400">{label}</span>
                        </div>
                    ))}
                </div>

                <Sparkles className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
            </div>
        </motion.div>
    );
}

export default function DomainGrid() {
    const [jasadi, nafsi, fikri, ruhi] = DOMAINS;
    const dashboardData = useHealthDashboard();

    // Fall back to 0 if loading, ensuring NO 100% fake values exist
    const realScore = dashboardData.loading ? 0 : dashboardData.healthScore;

    return (
        <motion.div variants={STAGGER_ITEM} className="mx-4">
            {/* Section header */}
            <div className="flex items-center gap-2 mb-3 px-0.5">
                <div className="w-[3px] h-[14px] rounded-full"
                    style={{ background: 'linear-gradient(to bottom, #0D9488, #4F46E5)' }} />
                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                    أقسامك الصحية الأربعة
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.04)' }} />
                <span className="text-[8px] font-semibold text-slate-300">اضغط للدخول →</span>
            </div>

            {/* ── Composite Stats Banner ── */}
            <CompositeBanner domains={DOMAINS} />

            {/* 2×2 equal grid */}
            <div className="grid gap-2.5" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <DomainCard domain={jasadi} index={0} realScore={realScore} />
                <DomainCard domain={nafsi}  index={1} realScore={realScore} />
                <DomainCard domain={fikri}  index={2} realScore={realScore} />
                <DomainCard domain={ruhi}   index={3} realScore={realScore} />
            </div>
        </motion.div>
    );
}
