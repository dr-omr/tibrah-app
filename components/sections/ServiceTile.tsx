'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { haptic } from '@/lib/HapticFeedback';
import type { SectionItem } from './section-tokens';
import { getServiceIcon } from './service-icons';
import { wg } from './section-shared';

/* ════════════════════════════════════════════════════
   SERVICE TILE — بطاقة الخدمة الزجاجية (الماسة)
════════════════════════════════════════════════════ */
export function ServiceTile({ item, color, colorAlt, index }: {
    item: SectionItem; color: string; colorAlt: string; index: number;
}) {
    /* كل خدمة تملك أيقونة ولون مخصص — لا يتكرر */
    const { icon: svcIcon, color: iconColor } = getServiceIcon(item.href, item.label);

    return (
        <Link href={item.href} onClick={() => haptic.tap()} className="block h-full">
            <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 26, delay: 0.04 + index * 0.05 }}
                whileTap={{ scale: 0.928 }}
                className="relative flex flex-col justify-between p-3.5 rounded-[22px] overflow-hidden h-full"
                style={{ minHeight: 118, ...wg(color, colorAlt) }}
            >
                {/* ── Liquid shimmer sweep ── */}
                <motion.div
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{
                        background: 'linear-gradient(118deg, transparent 20%, rgba(255,255,255,0.28) 42%, rgba(255,255,255,0.06) 54%, transparent 76%)',
                    }}
                    animate={{ x: ['-140%', '140%'] }}
                    transition={{ duration: 4 + index * 0.7, repeat: Infinity, repeatDelay: 5.5 + index * 0.9, ease: 'easeInOut' }}
                />

                {/* ── Subtle RIGHT accent bar ── */}
                <div className="absolute top-3 bottom-3 right-0 w-[3px] rounded-full pointer-events-none z-0"
                    style={{ background: `linear-gradient(to bottom, ${iconColor}55, ${iconColor}22, transparent 85%)` }} />

                {/* ── Bubble highlights ── */}
                <div className="absolute top-2.5 left-3 w-2 h-2 rounded-full pointer-events-none z-0"
                    style={{ background: 'rgba(255,255,255,0.70)', filter: 'blur(1px)' }} />
                <div className="absolute top-4 left-5 w-1 h-1 rounded-full pointer-events-none z-0"
                    style={{ background: 'rgba(255,255,255,0.50)' }} />
                <div className="absolute bottom-3 right-5 w-1 h-1 rounded-full pointer-events-none z-0"
                    style={{ background: 'rgba(255,255,255,0.32)' }} />

                {/* ── Ambient color pools ── */}
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none z-0"
                    style={{ background: `radial-gradient(circle, ${iconColor}1A, transparent 70%)`, filter: 'blur(12px)' }} />
                <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full pointer-events-none z-0"
                    style={{ background: `radial-gradient(circle, ${iconColor}0E, transparent 70%)`, filter: 'blur(8px)' }} />

                {/* ── TOP ROW: Glass icon + badge ── */}
                <div className="flex items-start justify-between relative z-10 w-full shrink-0">
                    
                    {/* Glass Tile (Icon) */}
                    <motion.div
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 2.8 + index * 0.35, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative"
                    >
                        {/* Glow halo */}
                        <div className="absolute inset-[-7px] rounded-[17px] pointer-events-none"
                            style={{
                                background: `radial-gradient(ellipse at center, ${iconColor}22, transparent 70%)`,
                                filter: 'blur(5px)',
                            }} />

                        {/* Physical glass pill */}
                        <div
                            className="w-10 h-10 rounded-[13px] flex items-center justify-center relative overflow-hidden"
                            style={{
                                background: [
                                    'linear-gradient(148deg,',
                                    `  ${iconColor}1E 0%,`,
                                    '  rgba(255,255,255,0.93) 50%,',
                                    `  ${iconColor}0D 100%`,
                                    ')',
                                ].join(''),
                                border: '1px solid rgba(255,255,255,0.82)',
                                borderTop: '1px solid rgba(255,255,255,0.97)',
                                boxShadow: [
                                    '0 1.5px 0 rgba(255,255,255,0.96) inset',
                                    `0 6px 18px ${iconColor}24`,
                                    '0 1px 5px rgba(0,0,0,0.07)',
                                ].join(', '),
                            }}
                        >
                            <div className="absolute top-0.5 left-1 w-1 h-1 rounded-full pointer-events-none"
                                style={{ background: 'rgba(255,255,255,0.70)' }} />
                            <span className="text-[19px] leading-none relative z-10 select-none">
                                {svcIcon}
                            </span>
                        </div>
                    </motion.div>

                    {/* Badge */}
                    <div className="flex flex-col items-end gap-1">
                        {item.isNew && (
                            <motion.span
                                animate={{ opacity: [1, 0.52, 1], scale: [1, 1.07, 1] }}
                                transition={{ duration: 2.4, repeat: Infinity }}
                                className="text-[7px] font-black px-1.5 py-[2.5px] rounded-full text-white leading-none whitespace-nowrap"
                                style={{
                                    background: `linear-gradient(135deg, ${iconColor}, ${iconColor}BB)`,
                                    boxShadow: `0 2px 8px ${iconColor}35`,
                                }}
                            >
                                ✦ جديد
                            </motion.span>
                        )}
                        {item.badge && !item.isNew && (
                            <span className="text-[7px] font-bold px-1.5 py-[2.5px] rounded-full leading-none whitespace-nowrap"
                                style={{
                                    background: `${iconColor}10`,
                                    color: iconColor,
                                    border: `1px solid ${iconColor}22`,
                                }}>
                                {item.badge}
                            </span>
                        )}
                    </div>
                </div>

                {/* ── BOTTOM ROW: Label + Sub ── */}
                <div className="relative z-10 mt-2 flex flex-col justify-end grow">
                    <p className="text-[12.5px] font-black text-slate-800 leading-snug line-clamp-2 tracking-tight">
                        {item.label}
                    </p>
                    <p className="text-[9.5px] text-slate-400 leading-tight mt-[3px] line-clamp-1 font-medium">
                        {item.sub}
                    </p>
                </div>
            </motion.div>
        </Link>
    );
}
