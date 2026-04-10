'use client';

/**
 * DomainEntryCards — طِبرَا ULTRA Premium 5-Domain Strip
 * ─────────────────────────────────────────────────────
 * مستوى: Apple Health × iOS 18 × Glassmorphism × RTL Native
 */

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { haptic } from '@/lib/HapticFeedback';
import { ALL_SECTIONS } from './section-tokens';

/* ── Domain card component ── */
function DomainCard({
    emoji, arabicName, tagline, color, colorAlt, iconBg, bg, href, index,
}: {
    emoji: string;
    arabicName: string;
    tagline: string;
    color: string;
    colorAlt: string;
    iconBg: string;
    bg: string;
    href: string;
    index: number;
}) {
    return (
        <Link href={href} onClick={() => haptic.tap()} className="flex-shrink-0 block">
            <motion.div
                initial={{ opacity: 0, y: 28, scale: 0.88 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 30, delay: 0.05 + index * 0.07 }}
                whileTap={{ scale: 0.91, rotate: -1 }}
                whileHover={{ y: -3 }}
                className="relative overflow-hidden flex flex-col items-center justify-center gap-2.5 rounded-[24px] cursor-pointer"
                style={{
                    width: 92,
                    height: 104,
                    background: `linear-gradient(160deg, ${color}16 0%, ${colorAlt}08 100%)`,
                    border: `1.5px solid ${color}22`,
                    boxShadow: `0 1px 0 rgba(255,255,255,0.95) inset, 0 8px 32px ${color}14, 0 2px 0 ${color}10`,
                }}
            >
                {/* ── Top shine bar ── */}
                <div
                    className="absolute top-0 left-4 right-4 h-[1px] rounded-full"
                    style={{ background: `linear-gradient(to right, transparent, rgba(255,255,255,0.9), transparent)` }}
                />

                {/* ── Background glow orb ── */}
                <div
                    className="absolute -top-5 -right-5 w-16 h-16 rounded-full pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${color}28, transparent 70%)` }}
                />
                <div
                    className="absolute -bottom-6 -left-4 w-14 h-14 rounded-full pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${colorAlt}18, transparent 70%)` }}
                />

                {/* ── Emoji container ── */}
                <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 3 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative w-11 h-11 flex items-center justify-center rounded-[16px] flex-shrink-0 z-10"
                    style={{
                        background: iconBg,
                        border: `1px solid ${color}22`,
                        boxShadow: `0 2px 12px ${color}18, 0 0 0 1px rgba(255,255,255,0.6) inset`,
                    }}
                >
                    <span className="text-xl leading-none">{emoji}</span>
                </motion.div>

                {/* ── Label ── */}
                <div className="relative z-10 flex flex-col items-center gap-0.5">
                    <p
                        className="text-[14px] font-black leading-none tracking-tight"
                        style={{ color }}
                    >
                        {arabicName}
                    </p>

                    {/* Micro tag */}
                    <motion.div
                        initial={{ opacity: 0, scaleX: 0.6 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ delay: 0.3 + index * 0.07 }}
                        className="px-2 py-[2.5px] rounded-full"
                        style={{
                            background: `${color}14`,
                            border: `1px solid ${color}20`,
                        }}
                    >
                        <span className="text-[8px] font-bold" style={{ color, opacity: 0.8 }}>
                            استكشف ←
                        </span>
                    </motion.div>
                </div>
            </motion.div>
        </Link>
    );
}

/* ═══════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════ */
export default function DomainEntryCards() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28, delay: 0.1 }}
            className="px-4"
        >
            {/* ── Header strip ── */}
            <div className="flex items-center gap-2 mb-3.5 px-0.5">
                <div
                    className="w-[3px] h-[18px] rounded-full flex-shrink-0"
                    style={{ background: 'linear-gradient(to bottom, #0D9488, #4F46E5, #7C3AED)' }}
                />
                <span className="text-[9.5px] font-black uppercase tracking-[0.18em] text-slate-400 flex-1">
                    أقسامك الخمسة
                </span>
                <div className="flex items-center gap-1">
                    {ALL_SECTIONS.map((s) => (
                        <div
                            key={s.id}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: s.color, opacity: 0.4 }}
                        />
                    ))}
                </div>
            </div>

            {/* ── Scrollable cards ── */}
            <div
                className="flex gap-2.5 overflow-x-auto"
                style={{
                    scrollbarWidth: 'none',
                    WebkitOverflowScrolling: 'touch',
                    paddingBottom: 2,
                    paddingRight: 4,
                }}
            >
                {ALL_SECTIONS.map((section, i) => (
                    <DomainCard
                        key={section.id}
                        emoji={section.emoji}
                        arabicName={section.arabicName}
                        tagline={section.tagline}
                        color={section.color}
                        colorAlt={section.colorAlt}
                        iconBg={section.iconBg}
                        bg={section.bg}
                        href={`/sections/${section.slug}`}
                        index={i}
                    />
                ))}
            </div>
        </motion.div>
    );
}
