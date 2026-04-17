'use client';
/**
 * JasadiHeroHeader.tsx — طِبرَا جسدي Domain Cinematic Header
 * ─────────────────────────────────────────────────────────────
 * ✦ صورة الدكتور كخلفية ضبابية + زجاج مائي فوقها ✦
 *
 * Physics layers:
 *   ① Doctor photo — absolute fill, cover, heavy blur + tint
 *   ② Aurora orbs — colored breath on top of photo
 *   ③ Water-glass card — backdrop-blur reads from photo below
 *   ④ Liquid shimmer sweep across the glass layer
 *   ⑤ Specular rim highlights + bubble dots
 *   ⑥ Parallax scroll on aurora orbs
 *   ⑦ Stat chips — live counts per service type
 */

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Stethoscope, Wrench, BookOpen, GraduationCap } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import type { SectionDefinition } from '@/components/sections/section-tokens';
import { SP } from '@/components/sections/section-shared';

const DOCTOR_PHOTO = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69287e726ff0e068617e81b7/9185440e5_omar.jpg';

/* ─────────────────────────────────────────────────────────────
   Stat chip
───────────────────────────────────────────────────────────── */
function Chip({ icon: Icon, label, color }: { icon: React.ElementType; label: string; color: string }) {
    return (
        <div className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-full flex-shrink-0"
            style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.20)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.16) inset',
            }}>
            <Icon className="w-3 h-3 flex-shrink-0" style={{ color }} />
            <span className="text-[9.5px] font-black text-white/85 leading-none whitespace-nowrap">
                {label}
            </span>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Count stats from subsections
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

/* ═════════════════════════════════════════════════════════════
   MAIN EXPORT
═════════════════════════════════════════════════════════════ */
export function JasadiHeroHeader({ section, onBack }: {
    section: SectionDefinition;
    onBack: () => void;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();
    const photoY  = useTransform(scrollY, [0, 300], [0, 60]);   // parallax photo
    const orb1Y   = useTransform(scrollY, [0, 300], [0, -40]);
    const orb2Y   = useTransform(scrollY, [0, 300], [0, -20]);
    const glassY  = useTransform(scrollY, [0, 300], [0, 18]);

    const stats = useSectionStats(section);

    return (
        <div ref={ref} className="relative overflow-hidden" style={{ minHeight: 280 }}>

            {/* ══ ① PARALLAX DOCTOR PHOTO ══ */}
            <motion.div
                style={{ y: photoY, position: 'absolute', inset: '-20px', zIndex: 0, top: '-20px', right: '-20px', bottom: '-20px', left: '-20px' }}
                className="pointer-events-none"
            >
                <Image
                    src={DOCTOR_PHOTO}
                    alt="د. عمر العماد"
                    fill
                    className="object-cover object-top"
                    unoptimized
                    priority
                />
            </motion.div>

            {/* ══ ② STRONG TEAL OVERLAY — يجعل الصورة زجاجية ومائية ══ */}
            <div className="absolute inset-0 z-[1] pointer-events-none"
                style={{
                    background: [
                        'linear-gradient(165deg,',
                        `  ${section.color}CC 0%,`,
                        `  ${section.color}A8 30%,`,
                        `  ${section.colorAlt}88 65%,`,
                        '  rgba(0,20,40,0.70) 100%',
                        ')',
                    ].join(''),
                }} />
            {/* bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-16 z-[1] pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.35))' }} />

            {/* ══ ③ AURORA ORB 1 — teal bloom ══ */}
            <motion.div
                style={{ y: orb1Y, position: 'absolute', top: -40, right: -40, zIndex: 2 }}
                className="pointer-events-none"
                animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.75, 0.5] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
                <div style={{ width: 240, height: 240, borderRadius: '50%',
                    background: `radial-gradient(circle, ${section.color}55, transparent 68%)`,
                    filter: 'blur(24px)' }} />
            </motion.div>

            {/* ══ ④ AURORA ORB 2 — deep bottom-left ══ */}
            <motion.div
                style={{ y: orb2Y, position: 'absolute', bottom: -20, left: -20, zIndex: 2 }}
                className="absolute pointer-events-none"
                animate={{ scale: [1, 1.10, 1], opacity: [0.30, 0.50, 0.30] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
            >
                <div style={{ width: 180, height: 180, borderRadius: '50%',
                    background: `radial-gradient(circle, ${section.colorAlt}50, transparent 68%)`,
                    filter: 'blur(20px)' }} />
            </motion.div>

            {/* ══ ⑤ DOT TEXTURE ══ */}
            <div className="absolute inset-0 z-[2] pointer-events-none opacity-[0.035]"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)',
                    backgroundSize: '14px 14px',
                }} />

            {/* ══ ⑥ LIQUID SHIMMER ══ */}
            <motion.div
                className="absolute inset-0 z-[3] pointer-events-none"
                style={{ background: 'linear-gradient(112deg, transparent 25%, rgba(255,255,255,0.08) 48%, rgba(255,255,255,0.02) 55%, transparent 75%)' }}
                animate={{ x: ['-120%', '120%'] }}
                transition={{ duration: 5, repeat: Infinity, repeatDelay: 4.5, ease: 'easeInOut' }}
            />

            {/* ══ ⑦ TOP SPECULAR LINE ══ */}
            <div className="absolute top-0 left-0 right-0 h-px z-[3] pointer-events-none"
                style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.35) 40%, rgba(255,255,255,0.12) 100%)' }} />

            {/* ══ CONTENT ══ */}
            <motion.div style={{ y: glassY }} className="relative z-[4] px-5 pt-5 pb-8 flex flex-col">

                {/* Back button */}
                <motion.button
                    className="flex items-center gap-1.5 self-start mb-5"
                    whileTap={{ scale: 0.91 }}
                    onClick={() => { haptic.tap(); onBack(); }}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{
                            background: 'rgba(255,255,255,0.15)',
                            border: '1px solid rgba(255,255,255,0.25)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            boxShadow: '0 1px 0 rgba(255,255,255,0.20) inset, 0 3px 10px rgba(0,0,0,0.18)',
                        }}>
                        <ArrowRight className="w-3.5 h-3.5 text-white/65" />
                        <span className="text-[10.5px] font-bold text-white/80">رجوع</span>
                    </div>
                </motion.button>

                {/* Identity */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SP, delay: 0.06 }}
                    className="flex flex-col gap-1 mb-5"
                >
                    <p className="text-[8.5px] font-black uppercase tracking-[0.26em] text-white/45">
                        {section.englishName} · طِبرَا
                    </p>
                    <div className="flex items-center gap-3">
                        {/* Emoji glass pill */}
                        <motion.div
                            className="w-16 h-16 rounded-[22px] flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            style={{
                                background: [
                                    'linear-gradient(145deg,',
                                    `  ${section.color}40 0%,`,
                                    '  rgba(255,255,255,0.22) 45%,',
                                    '  rgba(255,255,255,0.12) 100%',
                                    ')',
                                ].join(''),
                                border: '1px solid rgba(255,255,255,0.30)',
                                borderTop: '1px solid rgba(255,255,255,0.50)',
                                backdropFilter: 'blur(24px)',
                                WebkitBackdropFilter: 'blur(24px)',
                                boxShadow: [
                                    '0 2px 0 rgba(255,255,255,0.30) inset',
                                    `0 16px 40px ${section.color}40`,
                                    '0 6px 20px rgba(0,0,0,0.25)',
                                ].join(', '),
                            }}>
                            {/* bubbles */}
                            <div className="absolute top-1.5 left-2 w-2 h-2 rounded-full"
                                style={{ background: 'rgba(255,255,255,0.55)', filter: 'blur(1px)' }} />
                            <span className="text-[34px] leading-none select-none relative z-10">
                                {section.emoji}
                            </span>
                        </motion.div>

                        <div className="flex flex-col gap-1">
                            <h1 className="text-[40px] font-black text-white leading-none tracking-tight"
                                style={{ textShadow: '0 3px 18px rgba(0,0,0,0.32)' }}>
                                {section.arabicName}
                            </h1>
                            <p className="text-[11.5px] font-medium text-white/55 leading-tight">
                                {section.tagline}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Stats strip */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SP, delay: 0.14 }}
                    className="flex items-center gap-2 flex-wrap"
                >
                    <Chip icon={Sparkles}      label={`${stats.total} خدمة`}       color="white" />
                    <Chip icon={Stethoscope}   label={`${stats.diagnostic} تشخيص`} color="#34D399" />
                    <Chip icon={Wrench}        label={`${stats.practical} أداة`}   color="#FBBF24" />
                    <Chip icon={BookOpen}      label={`${stats.educational} مقال`} color="#60A5FA" />
                    <Chip icon={GraduationCap} label={`${stats.paid} كورس`}        color="#C084FC" />
                </motion.div>
            </motion.div>
        </div>
    );
}
