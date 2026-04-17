'use client';
/**
 * SectionHeroHeader.tsx — طِبرَا Cinematic Domain Hero ✦ WORLD CLASS ✦
 * ─────────────────────────────────────────────────────────────────────
 * مستوى: Apple Health × Calm × Linear
 *
 * تأثيرات:
 *   ① Aurora mesh — 4 orbs ملونة متنفسة
 *   ② Parallax SVG mesh on scroll
 *   ③ Water glass top bar — إطار مائي بارز
 *   ④ Specular rim light على emoji card
 *   ⑤ Liquid shimmer sweep
 *   ⑥ Stats strip زجاجية مع counting animation
 *   ⑦ Depth gradient overlay للعمق الفيزيائي
 */

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, BookOpen, Stethoscope, Wrench, GraduationCap } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import type { SectionDefinition } from './section-tokens';
import { SP } from './section-shared';

/* ─────────────────────────────────────────────────────────────
   Layer Type Counter — عداد الخدمات لكل نوع
───────────────────────────────────────────────────────────── */
function useSectionStats(section: SectionDefinition) {
    let diagnostic = 0, practical = 0, educational = 0, paid = 0, total = 0;
    for (const sub of section.subsections) {
        for (const item of sub.items) {
            total++;
            if (item.type === 'diagnostic') diagnostic++;
            else if (item.type === 'educational') educational++;
            else if (item.type === 'paid') paid++;
            else practical++;
        }
    }
    return { total, diagnostic, practical, educational, paid };
}

/* ─────────────────────────────────────────────────────────────
   Stat Chip
───────────────────────────────────────────────────────────── */
function StatChip({ icon: Icon, label, color }: { icon: React.ElementType; label: string; color: string }) {
    return (
        <div className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-full flex-shrink-0"
            style={{
                background: 'rgba(255,255,255,0.14)',
                border: '1px solid rgba(255,255,255,0.22)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.18) inset',
            }}>
            <Icon className="w-3 h-3" style={{ color }} />
            <span className="text-[9.5px] font-black text-white/85 leading-none whitespace-nowrap">
                {label}
            </span>
        </div>
    );
}

/* ═════════════════════════════════════════════════════════════
   MAIN EXPORT
═════════════════════════════════════════════════════════════ */
export function SectionHeroHeader({ section, onBack }: {
    section: SectionDefinition;
    onBack: () => void;
}) {
    const headerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();

    /* Parallax layers */
    const orb1Y  = useTransform(scrollY, [0, 280], [0, -50]);
    const orb2Y  = useTransform(scrollY, [0, 280], [0, -28]);
    const contentY = useTransform(scrollY, [0, 280], [0, 22]);

    const stats = useSectionStats(section);

    return (
        <div
            ref={headerRef}
            className="relative overflow-hidden"
            style={{
                /* Rich dark base tinted with domain color */
                background: [
                    'linear-gradient(168deg,',
                    `  color-mix(in srgb, ${section.color} 90%, black) 0%,`,
                    `  color-mix(in srgb, ${section.colorAlt} 80%, black) 55%,`,
                    `  color-mix(in srgb, ${section.colorAlt} 60%, #1a0040) 100%`,
                    ')',
                ].join(''),
                paddingBottom: 36,
            }}
        >
            {/* ══ DEPTH GRADIENT OVERLAY ══ */}
            <div className="absolute inset-0 pointer-events-none"
                style={{
                    background: [
                        'linear-gradient(to bottom,',
                        '  rgba(0,0,0,0.22) 0%,',
                        '  transparent 40%,',
                        '  rgba(0,0,0,0.10) 100%',
                        ')',
                    ].join(''),
                }} />

            {/* ══ AURORA ORB 1 — top-right (big) ══ */}
            <motion.div
                style={{ y: orb1Y }}
                className="absolute -top-16 -right-16 w-80 h-80 rounded-full pointer-events-none"
                animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
                <div style={{
                    width: '100%', height: '100%', borderRadius: '50%',
                    background: `radial-gradient(circle, ${section.color}60, transparent 70%)`,
                    filter: 'blur(28px)',
                }} />
            </motion.div>

            {/* ══ AURORA ORB 2 — bottom-left ══ */}
            <motion.div
                style={{ y: orb2Y }}
                className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full pointer-events-none"
                animate={{ scale: [1, 1.12, 1], opacity: [0.20, 0.38, 0.20] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            >
                <div style={{
                    width: '100%', height: '100%', borderRadius: '50%',
                    background: `radial-gradient(circle, ${section.colorAlt}55, transparent 70%)`,
                    filter: 'blur(22px)',
                }} />
            </motion.div>

            {/* ══ AURORA ORB 3 — mid center ══ */}
            <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full pointer-events-none"
                style={{
                    background: `radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)`,
                    filter: 'blur(20px)',
                    transform: 'translateY(-50%)',
                }} />

            {/* ══ DOT TEXTURE ══ */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                }} />

            {/* ══ LIQUID SHIMMER SWEEP ══ */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(108deg, transparent 25%, rgba(255,255,255,0.07) 48%, rgba(255,255,255,0.02) 55%, transparent 75%)',
                }}
                animate={{ x: ['-120%', '120%'] }}
                transition={{ duration: 5.5, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
            />

            {/* ══ TOP SPECULAR LINE ══ */}
            <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.30) 40%, rgba(255,255,255,0.12) 100%)' }} />

            {/* ════ CONTENT ════ */}
            <motion.div style={{ y: contentY }} className="relative z-10 px-5 pt-5">

                {/* ── Back button ── */}
                <motion.button
                    className="flex items-center gap-1.5 mb-5"
                    whileTap={{ scale: 0.91 }}
                    onClick={() => { haptic.tap(); onBack(); }}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...SP, delay: 0 }}
                >
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{
                            background: 'rgba(255,255,255,0.12)',
                            border: '1px solid rgba(255,255,255,0.20)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            boxShadow: '0 1px 0 rgba(255,255,255,0.18) inset, 0 2px 8px rgba(0,0,0,0.14)',
                        }}>
                        <ArrowRight className="w-3.5 h-3.5 text-white/60" />
                        <span className="text-[10.5px] font-bold text-white/75">رجوع</span>
                    </div>
                </motion.button>

                {/* ── Identity row ── */}
                <div className="flex items-end gap-4 mb-5">

                    {/* Emoji card — Water Glass Physics */}
                    <motion.div
                        initial={{ scale: 0.55, opacity: 0, rotate: -14 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 480, damping: 24, delay: 0.04 }}
                        className="relative flex-shrink-0"
                    >
                        {/* Outer glow ring */}
                        <div className="absolute inset-[-6px] rounded-[34px]"
                            style={{
                                background: `radial-gradient(circle, ${section.color}45, transparent 70%)`,
                                filter: 'blur(10px)',
                            }} />

                        {/* Card face */}
                        <div className="w-[88px] h-[88px] rounded-[30px] flex items-center justify-center relative overflow-hidden"
                            style={{
                                background: [
                                    'linear-gradient(148deg,',
                                    `  ${section.color}35 0%,`,
                                    '  rgba(255,255,255,0.18) 38%,',
                                    '  rgba(255,255,255,0.10) 62%,',
                                    `  ${section.colorAlt}20 100%`,
                                    ')',
                                ].join(''),
                                border: '1px solid rgba(255,255,255,0.28)',
                                borderTop: '1px solid rgba(255,255,255,0.48)',
                                boxShadow: [
                                    '0 2px 0 rgba(255,255,255,0.30) inset',
                                    '1px 0 0 rgba(255,255,255,0.14) inset',
                                    '-1px -1px 0 rgba(0,0,0,0.25) inset',
                                    `0 20px 50px ${section.color}35`,
                                    '0 8px 24px rgba(0,0,0,0.22)',
                                ].join(', '),
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                            }}
                        >
                            {/* Specular bubble top-left */}
                            <div className="absolute top-2 left-3 w-2.5 h-2.5 rounded-full pointer-events-none"
                                style={{ background: 'rgba(255,255,255,0.55)', filter: 'blur(1.5px)' }} />
                            <div className="absolute top-3.5 left-5 w-1.5 h-1.5 rounded-full pointer-events-none"
                                style={{ background: 'rgba(255,255,255,0.35)' }} />

                            {/* Right rim specular */}
                            <div className="absolute top-4 bottom-4 right-0 w-[2px] rounded-full pointer-events-none"
                                style={{ background: `linear-gradient(to bottom, ${section.color}70, transparent 80%)` }} />

                            <motion.span
                                animate={{ y: [0, -5, 0], rotate: [0, 2.5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                className="text-[44px] leading-none relative z-10 select-none"
                            >
                                {section.emoji}
                            </motion.span>
                        </div>
                    </motion.div>

                    {/* Title block */}
                    <motion.div
                        initial={{ opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...SP, delay: 0.08 }}
                        className="flex-1 min-w-0"
                    >
                        <p className="text-[8.5px] font-black uppercase tracking-[0.24em] mb-1.5"
                            style={{ color: 'rgba(255,255,255,0.48)' }}>
                            {section.englishName} · طِبرَا
                        </p>
                        <h1 className="font-black leading-none tracking-tight text-white"
                            style={{ fontSize: 44, textShadow: '0 3px 16px rgba(0,0,0,0.28)' }}>
                            {section.arabicName}
                        </h1>
                        <p className="text-[12px] font-medium leading-relaxed mt-1.5"
                            style={{ color: 'rgba(255,255,255,0.58)' }}>
                            {section.tagline}
                        </p>
                    </motion.div>
                </div>

                {/* ── Stats strip ── */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SP, delay: 0.16 }}
                    className="flex items-center gap-2 flex-wrap"
                >
                    <StatChip icon={Sparkles}      label={`${stats.total} خدمة`}           color="rgba(255,255,255,0.9)" />
                    <StatChip icon={Stethoscope}   label={`${stats.diagnostic} تشخيص`}      color="#34D399" />
                    <StatChip icon={Wrench}        label={`${stats.practical} أداة`}        color="#FBBF24" />
                    <StatChip icon={BookOpen}      label={`${stats.educational} مقال`}      color="#60A5FA" />
                    <StatChip icon={GraduationCap} label={`${stats.paid} كورس`}             color="#A78BFA" />
                </motion.div>
            </motion.div>

            {/* ══ BOTTOM FADE to page background ══ */}
            <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
                style={{
                    background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.08))',
                }} />
        </div>
    );
}
