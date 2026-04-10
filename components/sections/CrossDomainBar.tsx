'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { haptic } from '@/lib/HapticFeedback';
import { ALL_SECTIONS } from './section-tokens';
import { wg } from './section-shared';

/* ════════════════════════════════════════════════════
   CROSS-DOMAIN BAR — أيقونات التنقل العلوية
════════════════════════════════════════════════════ */
export function CrossDomainBar({ currentSlug }: { currentSlug: string }) {
    const others = ALL_SECTIONS.filter(s => s.slug !== currentSlug);
    
    return (
        <div className="px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400 mb-2.5 px-0.5">
                أقسام أخرى
            </p>
            <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {others.map((s, i) => (
                    <Link key={s.id} href={`/sections/${s.slug}`} onClick={() => haptic.selection()}>
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.88 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 26, delay: 0.05 * i }}
                            whileTap={{ scale: 0.90 }}
                            className="flex flex-col items-center gap-1.5 px-3.5 py-2.5 rounded-[16px] flex-shrink-0 relative overflow-hidden"
                            style={wg(s.color, s.colorAlt)}
                        >
                            <motion.div
                                className="absolute inset-0 pointer-events-none"
                                style={{ background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.22) 48%, transparent 66%)' }}
                                animate={{ x: ['-120%', '120%'] }}
                                transition={{ duration: 3.5 + i * 0.5, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
                            />
                            <span className="text-[20px] leading-none relative z-10 select-none">{s.emoji}</span>
                            <span className="text-[10px] font-black relative z-10" style={{ color: s.color }}>
                                {s.arabicName}
                            </span>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
