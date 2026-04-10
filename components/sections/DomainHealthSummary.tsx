'use client';
/**
 * DomainHealthSummary — طِبرَا Ultra Domain Progress Strip
 * ──────────────────────────────────────────────────────────
 * يُظهر تقدّم المستخدم الصحي عبر الأقسام الخمسة
 * مستوى: Apple rings × iOS 18 Glassmorphism
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '@/lib/HapticFeedback';

/* Domain definition (static for now — hook to real health data later) */
const DOMAINS = [
    {
        emoji: '🫀', label: 'جسدي', color: '#0D9488', href: '/sections/jasadi',
        score: 78, delta: +5, tip: 'سجّل قياساتك اليومية لتحسين النتيجة',
    },
    {
        emoji: '🧠', label: 'نفسي', color: '#7C3AED', href: '/sections/nafsi',
        score: 62, delta: -2, tip: 'جرّب تمرين التنفس لتهدئة الجهاز العصبي',
    },
    {
        emoji: '📚', label: 'فكري', color: '#D97706', href: '/sections/fikri',
        score: 85, delta: +12, tip: 'أنت تتقدم! اقرأ مقالاً جديداً اليوم',
    },
    {
        emoji: '✨', label: 'روحي', color: '#2563EB', href: '/sections/ruhi',
        score: 70, delta: +3, tip: 'جلسة تأمل ٥ دقائق تصنع الفارق',
    },
    {
        emoji: '⚙️', label: 'أخرى', color: '#475569', href: '/sections/other',
        score: 91, delta: 0, tip: 'ملفك الطبي مكتمل تقريباً',
    },
] as const;

/* ── Mini ring arc ── */
function DomainRing({
    score, color, size = 44, strokeWidth = 4.5,
}: {
    score: number; color: string; size?: number; strokeWidth?: number;
}) {
    const r = (size - strokeWidth - 2) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;

    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
            <circle cx={size / 2} cy={size / 2} r={r}
                strokeWidth={strokeWidth} stroke={`${color}18`} fill="none" />
            <motion.circle
                cx={size / 2} cy={size / 2} r={r}
                strokeWidth={strokeWidth}
                stroke={color}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ - dash }}
                transition={{ duration: 1.2, ease: [0.34, 1.1, 0.64, 1], delay: 0.1 }}
            />
        </svg>
    );
}

/* ── Single domain pod ── */
function DomainPod({
    domain, index, onClick,
}: {
    domain: typeof DOMAINS[number];
    index: number;
    onClick: (d: typeof DOMAINS[number]) => void;
}) {
    return (
        <Link href={domain.href} onClick={() => { haptic.tap(); onClick(domain); }} className="flex-shrink-0 block">
            <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 440, damping: 28, delay: 0.06 * index }}
                whileTap={{ scale: 0.91 }}
                className="relative flex flex-col items-center gap-1.5"
                style={{ width: 62 }}
            >
                {/* Ring + emoji */}
                <div className="relative" style={{ width: 44, height: 44 }}>
                    <DomainRing score={domain.score} color={domain.color} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.span
                            animate={{ y: [0, -1.5, 0] }}
                            transition={{ duration: 2.8 + index * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                            className="text-[18px] leading-none"
                        >
                            {domain.emoji}
                        </motion.span>
                    </div>

                    {/* Delta badge */}
                    {domain.delta !== 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 + index * 0.06, type: 'spring', stiffness: 500 }}
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{
                                background: domain.delta > 0 ? '#059669' : '#E11D48',
                                boxShadow: `0 2px 8px ${domain.delta > 0 ? '#05966940' : '#E11D4840'}`,
                                border: '1.5px solid white',
                            }}
                        >
                            <span className="text-white" style={{ fontSize: 7, fontWeight: 900, lineHeight: 1 }}>
                                {domain.delta > 0 ? '↑' : '↓'}
                            </span>
                        </motion.div>
                    )}
                </div>

                {/* Score */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.06 }}
                    className="flex flex-col items-center gap-0.5"
                >
                    <span className="text-[13px] font-black leading-none" style={{ color: domain.color }}>
                        {domain.score}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400 leading-none">{domain.label}</span>
                </motion.div>
            </motion.div>
        </Link>
    );
}

/* ══════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════ */
export default function DomainHealthSummary() {
    const [activeTip, setActiveTip] = useState<typeof DOMAINS[number] | null>(null);
    const overall = Math.round(DOMAINS.reduce((a, d) => a + d.score, 0) / DOMAINS.length);

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30, delay: 0.08 }}
            className="mx-4 rounded-[26px] overflow-hidden"
            style={{
                background: 'rgba(255,255,255,0.84)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(13,148,136,0.10)',
                boxShadow: '0 1px 0 rgba(255,255,255,1) inset, 0 8px 36px rgba(15,23,42,0.07)',
            }}
        >
            {/* ── Top header bar ── */}
            <div
                className="flex items-center justify-between px-4 pt-3.5 pb-2"
                style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
            >
                <div className="flex items-center gap-2">
                    <div className="w-[3px] h-[14px] rounded-full"
                        style={{ background: 'linear-gradient(to bottom, #0D9488, #4F46E5, #7C3AED)' }} />
                    <span className="text-[9.5px] font-black uppercase tracking-[0.14em] text-slate-400">
                        صحتك الشاملة
                    </span>
                </div>

                {/* Overall score pill */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, delay: 0.4 }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.14)' }}
                >
                    <motion.span
                        className="text-[13px] font-black"
                        style={{ color: '#0D9488' }}
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        {overall}
                    </motion.span>
                    <span className="text-[8px] font-semibold text-slate-400">/100</span>
                </motion.div>
            </div>

            {/* ── Domain pods ── */}
            <div className="flex items-center justify-between px-4 py-3.5">
                {DOMAINS.map((d, i) => (
                    <DomainPod
                        key={d.label}
                        domain={d}
                        index={i}
                        onClick={setActiveTip}
                    />
                ))}
            </div>

            {/* ── Tip strip ── */}
            <AnimatePresence mode="wait">
                {activeTip ? (
                    <motion.div
                        key={activeTip.label}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div
                            className="flex items-center gap-2.5 px-4 py-2.5 mx-0"
                            style={{
                                background: `${activeTip.color}08`,
                                borderTop: `1px solid ${activeTip.color}12`,
                            }}
                        >
                            <span className="text-sm">{activeTip.emoji}</span>
                            <p className="text-[11px] font-semibold flex-1 leading-tight"
                                style={{ color: activeTip.color }}>
                                {activeTip.tip}
                            </p>
                            <button
                                onClick={(e) => { e.preventDefault(); setActiveTip(null); }}
                                className="text-[10px] text-slate-300 flex-shrink-0"
                            >✕</button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="nudge"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center pb-2"
                    >
                        <p className="text-[9px] text-slate-300 font-medium tracking-wide">
                            اضغط على أي دائرة لإشارة صحية ←
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
