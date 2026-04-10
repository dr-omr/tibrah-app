'use client';
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import type { SectionDefinition } from './section-tokens';
import { SP } from './section-shared';

/* ════════════════════════════════════════════════════
   HERO HEADER — الهيدر السينمائي
════════════════════════════════════════════════════ */
export function SectionHeroHeader({ section, onBack }: { section: SectionDefinition; onBack: () => void }) {
    const headerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();
    const bgY = useTransform(scrollY, [0, 200], [0, 40]);
    const totalItems = section.subsections.reduce((a, s) => a + s.items.length, 0);

    return (
        <div
            ref={headerRef}
            className="relative overflow-hidden pt-5 pb-8 px-5"
            style={{
                background: `linear-gradient(170deg, ${section.color} 0%, ${section.colorAlt} 100%)`,
                boxShadow: `0 16px 48px ${section.color}30, 0 4px 16px rgba(0,0,0,0.12)`,
            }}
        >
            {/* ── Background Elements ── */}
            <motion.div style={{
                y: bgY,
                background: 'radial-gradient(circle at 75% 25%, rgba(255,255,255,0.14), transparent 62%)',
                position: 'absolute', top: 0, right: 0,
                width: 320, height: 320, borderRadius: '50%', pointerEvents: 'none',
            }} />
            <div className="absolute -bottom-10 -left-10 w-52 h-52 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.10), transparent 65%)' }} />
            <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)',
                    backgroundSize: '18px 18px',
                }} />
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(105deg, transparent 28%, rgba(255,255,255,0.08) 50%, transparent 72%)' }}
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
            />

            {/* ── Back button ── */}
            <motion.button
                className="relative z-10 flex items-center gap-1.5 mb-5"
                whileTap={{ scale: 0.93 }}
                onClick={() => { haptic.tap(); onBack(); }}
            >
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{
                        background: 'rgba(255,255,255,0.18)',
                        border: '1px solid rgba(255,255,255,0.28)',
                        backdropFilter: 'blur(12px)',
                    }}>
                    <ArrowRight className="w-3 h-3 text-white/70" />
                    <span className="text-[11px] font-semibold text-white/80">رجوع</span>
                </div>
            </motion.button>

            {/* ── Domain identity ── */}
            <div className="relative z-10 flex items-end gap-4">
                <motion.div
                    initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 26, delay: 0.05 }}
                >
                    <div className="w-[80px] h-[80px] rounded-[28px] flex items-center justify-center relative overflow-hidden"
                        style={{
                            background: 'rgba(255,255,255,0.20)',
                            border: '2px solid rgba(255,255,255,0.32)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 1px 0 rgba(255,255,255,0.30) inset',
                        }}>
                        <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full"
                            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.20), transparent 70%)' }} />
                        <motion.span
                            animate={{ y: [0, -4, 0], rotate: [0, 3, 0] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                            className="text-[40px] leading-none relative z-10 select-none"
                        >
                            {section.emoji}
                        </motion.span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...SP, delay: 0.1 }}
                    className="flex-1"
                >
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] mb-1 text-white/50">
                        {section.englishName}
                    </p>
                    <h1 className="text-[40px] font-black leading-none tracking-tight mb-1.5 text-white"
                        style={{ textShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>
                        {section.arabicName}
                    </h1>
                    <p className="text-[12.5px] font-medium text-white/65 leading-tight">
                        {section.tagline}
                    </p>
                </motion.div>
            </div>

            {/* ── Stats strip ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SP, delay: 0.18 }}
                className="relative z-10 flex items-center gap-2 mt-5"
            >
                <div className="flex items-center gap-1.5 px-3 py-[6px] rounded-full"
                    style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.28)' }}>
                    <Sparkles className="w-3 h-3 text-white" />
                    <span className="text-[10px] font-black text-white">{totalItems} خدمة</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-[6px] rounded-full"
                    style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.20)' }}>
                    <span className="text-[10px] font-black text-white/80">{section.subsections.length} أقسام</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-[6px] rounded-full mr-auto"
                    style={{ background: 'rgba(52,211,153,0.22)', border: '1px solid rgba(52,211,153,0.35)' }}>
                    <TrendingUp className="w-3 h-3 text-emerald-300" />
                    <span className="text-[9px] font-black text-emerald-300">↑ +5 هذا الأسبوع</span>
                </div>
            </motion.div>
        </div>
    );
}
