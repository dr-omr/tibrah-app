'use client';
/**
 * DomainHeroHeader.tsx — مكوّن Hero المشترك بين الأقسام الأربعة
 * ──────────────────────────────────────────────────────────────
 * صورة الدكتور كخلفية Parallax + زجاج مائي فيزيائي فوقها.
 *
 * الطبقات الفيزيائية:
 *   ① Doctor photo — parallax fill cover
 *   ② Tinted glass overlay  (domain color)
 *   ③ Aurora orb 1 (top-right) + Aurora orb 2 (bottom-left)
 *   ④ Dot texture
 *   ⑤ Liquid shimmer sweep
 *   ⑥ Top specular line
 *   ⑦ Content: back button + emoji pill + title + stat chips
 */

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    ArrowRight, Sparkles, Stethoscope,
    Wrench, BookOpen, GraduationCap,
} from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import type { SectionDefinition, ItemType } from '@/components/sections/section-tokens';
import { SP } from '@/components/sections/section-shared';

const DOCTOR_PHOTO =
    'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69287e726ff0e068617e81b7/9185440e5_omar.jpg';

/* ─── Stat chip ─────────────────────────────────────────────── */
function Chip({ icon: Icon, label, color }: {
    icon: React.ElementType; label: string; color: string;
}) {
    return (
        <div className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-full flex-shrink-0"
            style={{
                background: 'rgba(255,255,255,0.13)',
                border: '1px solid rgba(255,255,255,0.22)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.18) inset',
            }}>
            <Icon className="w-3 h-3 flex-shrink-0" style={{ color }} />
            <span className="text-[9.5px] font-black text-white/85 leading-none whitespace-nowrap">
                {label}
            </span>
        </div>
    );
}

/* ─── Count stats ────────────────────────────────────────────── */
function useSectionStats(section: SectionDefinition) {
    let diagnostic = 0, practical = 0, educational = 0, paid = 0, total = 0;
    for (const sub of section.subsections) {
        for (const item of sub.items) {
            total++;
            const t: ItemType | undefined = item.type;
            if (t === 'diagnostic') diagnostic++;
            else if (t === 'educational') educational++;
            else if (t === 'paid') paid++;
            else practical++;
        }
    }
    return { total, diagnostic, practical, educational, paid };
}

/* ══════════════════════════════════════════════════════════════
   EXPORT
══════════════════════════════════════════════════════════════ */
export function DomainHeroHeader({
    section,
    onBack,
}: {
    section: SectionDefinition;
    onBack: () => void;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();

    const photoY  = useTransform(scrollY, [0, 300], [0,  55]);
    const orb1Y   = useTransform(scrollY, [0, 300], [0, -38]);
    const orb2Y   = useTransform(scrollY, [0, 300], [0, -18]);
    const glassY  = useTransform(scrollY, [0, 300], [0,  16]);

    const stats = useSectionStats(section);

    return (
        <div ref={ref} className="relative overflow-hidden" style={{ minHeight: 278 }}>

            {/* ① Parallax photo */}
            <motion.div
                style={{
                    y: photoY,
                    position: 'absolute',
                    top: -24, right: 0, bottom: -24, left: 0,
                    zIndex: 0,
                }}
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

            {/* ② Domain-colored glass overlay */}
            <div className="absolute inset-0 z-[1] pointer-events-none"
                style={{
                    background: [
                        'linear-gradient(166deg,',
                        `  color-mix(in srgb, ${section.color} 78%, black) 0%,`,
                        `  color-mix(in srgb, ${section.color} 62%, black) 30%,`,
                        `  color-mix(in srgb, ${section.colorAlt} 52%, black) 65%,`,
                        '  rgba(0,10,30,0.72) 100%',
                        ')',
                    ].join(''),
                }} />

            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-14 z-[1] pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.30))' }} />

            {/* ③ Aurora orb 1 — top-right */}
            <motion.div
                style={{ y: orb1Y, position: 'absolute', top: -48, right: -48, zIndex: 2 }}
                className="pointer-events-none"
                animate={{ scale: [1, 1.13, 1], opacity: [0.48, 0.72, 0.48] }}
                transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
            >
                <div style={{
                    width: 260, height: 260, borderRadius: '50%',
                    background: `radial-gradient(circle, ${section.color}60, transparent 68%)`,
                    filter: 'blur(26px)',
                }} />
            </motion.div>

            {/* ③ Aurora orb 2 — bottom-left */}
            <motion.div
                style={{ y: orb2Y, position: 'absolute', bottom: -20, left: -20, zIndex: 2 }}
                className="pointer-events-none"
                animate={{ scale: [1, 1.09, 1], opacity: [0.28, 0.48, 0.28] }}
                transition={{ duration: 9.5, repeat: Infinity, ease: 'easeInOut', delay: 2.8 }}
            >
                <div style={{
                    width: 200, height: 200, borderRadius: '50%',
                    background: `radial-gradient(circle, ${section.colorAlt}55, transparent 68%)`,
                    filter: 'blur(22px)',
                }} />
            </motion.div>

            {/* ④ Dot texture */}
            <div className="absolute inset-0 z-[2] pointer-events-none opacity-[0.035]"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)',
                    backgroundSize: '14px 14px',
                }} />

            {/* ⑤ Liquid shimmer sweep */}
            <motion.div
                className="absolute inset-0 z-[3] pointer-events-none"
                style={{
                    background: 'linear-gradient(112deg, transparent 24%, rgba(255,255,255,0.07) 48%, rgba(255,255,255,0.02) 55%, transparent 76%)',
                }}
                animate={{ x: ['-120%', '120%'] }}
                transition={{ duration: 5.2, repeat: Infinity, repeatDelay: 4.8, ease: 'easeInOut' }}
            />

            {/* ⑥ Top specular line */}
            <div className="absolute top-0 left-0 right-0 h-px z-[3] pointer-events-none"
                style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.32) 40%, rgba(255,255,255,0.10) 100%)' }} />

            {/* ⑦ Content */}
            <motion.div style={{ y: glassY }} className="relative z-[4] px-5 pt-5 pb-8 flex flex-col">

                {/* Back button */}
                <motion.button
                    className="flex items-center gap-1.5 self-start mb-5"
                    whileTap={{ scale: 0.91 }}
                    onClick={() => { haptic.tap(); onBack(); }}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.28 }}
                >
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{
                            background: 'rgba(255,255,255,0.14)',
                            border: '1px solid rgba(255,255,255,0.24)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            boxShadow: '0 1px 0 rgba(255,255,255,0.22) inset, 0 3px 10px rgba(0,0,0,0.18)',
                        }}>
                        <ArrowRight className="w-3.5 h-3.5 text-white/60" />
                        <span className="text-[10.5px] font-bold text-white/78">رجوع</span>
                    </div>
                </motion.button>

                {/* Identity row */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SP, delay: 0.07 }}
                    className="flex items-center gap-3.5 mb-5"
                >
                    {/* Emoji glass pill */}
                    <motion.div
                        className="w-[72px] h-[72px] rounded-[24px] flex items-center justify-center relative overflow-hidden flex-shrink-0"
                        animate={{ y: [0, -4.5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            background: [
                                'linear-gradient(148deg,',
                                `  ${section.color}3E 0%,`,
                                '  rgba(255,255,255,0.24) 45%,',
                                '  rgba(255,255,255,0.12) 100%',
                                ')',
                            ].join(''),
                            border: '1px solid rgba(255,255,255,0.30)',
                            borderTop: '1px solid rgba(255,255,255,0.52)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            boxShadow: [
                                '0 2px 0 rgba(255,255,255,0.32) inset',
                                `0 14px 36px ${section.color}42`,
                                '0 5px 18px rgba(0,0,0,0.24)',
                            ].join(', '),
                        }}
                    >
                        {/* Specular bubbles */}
                        <div className="absolute top-1.5 left-2 w-2 h-2 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.55)', filter: 'blur(1px)' }} />
                        <div className="absolute top-3 left-4 w-1 h-1 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.35)' }} />
                        {/* Right rim */}
                        <div className="absolute top-3 bottom-3 right-0 w-[2px] rounded-full"
                            style={{ background: `linear-gradient(to bottom, ${section.color}75, transparent 80%)` }} />
                        <span className="text-[36px] leading-none select-none relative z-10">
                            {section.emoji}
                        </span>
                    </motion.div>

                    {/* Title */}
                    <div className="flex flex-col gap-1 min-w-0">
                        <p className="text-[7.5px] font-black uppercase tracking-[0.28em] text-white/42">
                            {section.englishName} · طِبرَا
                        </p>
                        <h1 className="font-black text-white leading-none tracking-tight"
                            style={{ fontSize: 42, textShadow: '0 3px 18px rgba(0,0,0,0.30)' }}>
                            {section.arabicName}
                        </h1>
                        <p className="text-[11px] font-medium text-white/52 leading-tight mt-0.5">
                            {section.tagline}
                        </p>
                    </div>
                </motion.div>

                {/* Stat chips */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SP, delay: 0.15 }}
                    className="flex items-center gap-2 flex-wrap"
                >
                    <Chip icon={Sparkles}      label={`${stats.total} خدمة`}        color="rgba(255,255,255,0.9)" />
                    <Chip icon={Stethoscope}   label={`${stats.diagnostic} تشخيص`}  color="#34D399" />
                    <Chip icon={Wrench}        label={`${stats.practical} أداة`}    color="#FBBF24" />
                    <Chip icon={BookOpen}      label={`${stats.educational} مقال`}  color="#60A5FA" />
                    <Chip icon={GraduationCap} label={`${stats.paid} كورس`}         color="#C084FC" />
                </motion.div>
            </motion.div>
        </div>
    );
}
