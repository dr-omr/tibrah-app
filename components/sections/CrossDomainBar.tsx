'use client';
/**
 * CrossDomainBar.tsx — شريط التنقل بين الأقسام الأربعة ✦ PREMIUM ✦
 * ────────────────────────────────────────────────────────────────────
 * يعرض الأقسام الأربعة دائماً — القسم الحالي مميز بـ active pill
 * الباقون: water-glass cards قابلة للنقر
 *
 * UI layers:
 *   ① Active tab — filled gradient + glow + shimmer
 *   ② Inactive tabs — glass backdrop + subtle color
 *   ③ Liquid shimmer sweep on each inactive card
 *   ④ Scale spring on tap
 */

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { haptic } from '@/lib/HapticFeedback';
import { ALL_SECTIONS } from './section-tokens';

export function CrossDomainBar({ currentSlug }: { currentSlug: string }) {
    return (
        <div className="px-4 py-3">
            <p className="text-[8.5px] font-black uppercase tracking-[0.18em] text-slate-400 mb-2.5 px-0.5">
                الأقسام الصحية الأربعة
            </p>

            <div
                className="flex gap-2 pb-1"
                style={{ scrollbarWidth: 'none', overflowX: 'auto' }}
            >
                {ALL_SECTIONS.map((s, i) => {
                    const isActive = s.slug === currentSlug;

                    return (
                        <Link
                            key={s.id}
                            href={`/sections/${s.slug}`}
                            onClick={() => haptic.selection()}
                            className="flex-shrink-0"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.88 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{
                                    type: 'spring', stiffness: 420, damping: 28,
                                    delay: 0.04 * i,
                                }}
                                whileTap={{ scale: 0.88, rotate: -0.5 }}
                                className="relative flex flex-col items-center gap-[5px] px-4 py-2.5 rounded-[16px] overflow-hidden"
                                style={
                                    isActive
                                        ? {
                                              /* Active — filled glass */
                                              background: [
                                                  'linear-gradient(148deg,',
                                                  `  ${s.color}E8 0%,`,
                                                  `  ${s.colorAlt}CC 100%`,
                                                  ')',
                                              ].join(''),
                                              border: '1px solid rgba(255,255,255,0.30)',
                                              borderTop: '1px solid rgba(255,255,255,0.50)',
                                              boxShadow: [
                                                  '0 2px 0 rgba(255,255,255,0.26) inset',
                                                  `0 8px 24px ${s.color}44`,
                                                  '0 2px 8px rgba(0,0,0,0.12)',
                                              ].join(', '),
                                              backdropFilter: 'blur(16px)',
                                              WebkitBackdropFilter: 'blur(16px)',
                                              minWidth: 68,
                                          }
                                        : {
                                              /* Inactive — light glass */
                                              background: [
                                                  'linear-gradient(148deg,',
                                                  `  ${s.color}14 0%,`,
                                                  '  rgba(255,255,255,0.72) 50%,',
                                                  `  ${s.color}0A 100%`,
                                                  ')',
                                              ].join(''),
                                              border: '1px solid rgba(255,255,255,0.70)',
                                              borderTop: '1px solid rgba(255,255,255,0.88)',
                                              boxShadow: [
                                                  '0 1.5px 0 rgba(255,255,255,0.85) inset',
                                                  `0 4px 14px ${s.color}0E`,
                                                  '0 1px 4px rgba(0,0,0,0.05)',
                                              ].join(', '),
                                              backdropFilter: 'blur(20px) saturate(1.6)',
                                              WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
                                              minWidth: 64,
                                          }
                                }
                            >
                                {/* Shimmer on inactive */}
                                {!isActive && (
                                    <motion.div
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                            background:
                                                'linear-gradient(112deg, transparent 25%, rgba(255,255,255,0.30) 48%, transparent 70%)',
                                        }}
                                        animate={{ x: ['-130%', '130%'] }}
                                        transition={{
                                            duration: 3.5 + i * 0.6,
                                            repeat: Infinity,
                                            repeatDelay: 4.5 + i * 0.8,
                                            ease: 'easeInOut',
                                        }}
                                    />
                                )}

                                {/* Active inner glow */}
                                {isActive && (
                                    <div
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                            background:
                                                'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.22), transparent 70%)',
                                        }}
                                    />
                                )}

                                {/* Emoji */}
                                <motion.span
                                    className="text-[20px] leading-none select-none relative z-10"
                                    animate={isActive ? { y: [0, -2, 0] } : {}}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                    {s.emoji}
                                </motion.span>

                                {/* Name */}
                                <span
                                    className="text-[10px] font-black relative z-10 leading-none"
                                    style={{ color: isActive ? 'rgba(255,255,255,0.95)' : s.color }}
                                >
                                    {s.arabicName}
                                </span>

                                {/* Active indicator dot */}
                                {isActive && (
                                    <motion.div
                                        className="w-[5px] h-[5px] rounded-full relative z-10"
                                        style={{ background: 'rgba(255,255,255,0.85)' }}
                                        animate={{ opacity: [1, 0.45, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
