'use client';
/**
 * QuickActionPill.tsx — زر سريع مائي نابض
 * ─────────────────────────────────────────
 * Props:
 *   icon    — emoji or React element
 *   label   — text label
 *   href    — navigation target
 *   color   — brand color
 *   badge?  — notification count
 *   pulse?  — animate dot
 */

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { haptic } from '@/lib/HapticFeedback';

interface QuickActionPillProps {
    icon: string | React.ReactNode;
    label: string;
    href: string;
    color: string;
    badge?: number | string;
    pulse?: boolean;
    gradient?: string;
}

export function QuickActionPill({ icon, label, href, color, badge, pulse, gradient }: QuickActionPillProps) {
    return (
        <Link href={href} onClick={() => haptic.selection()} className="flex-shrink-0">
            <motion.div
                whileTap={{ scale: 0.88, rotate: -0.5 }}
                className="relative flex flex-col items-center gap-[7px] px-3.5 pb-2.5 pt-3 rounded-[18px] overflow-hidden"
                style={{
                    background: gradient ?? [
                        'linear-gradient(148deg,',
                        `  ${color}16 0%,`,
                        '  rgba(255,255,255,0.88) 45%,',
                        '  rgba(255,255,255,0.72) 80%,',
                        `  ${color}0A 100%`,
                        ')',
                    ].join(''),
                    backdropFilter: 'blur(28px) saturate(2)',
                    WebkitBackdropFilter: 'blur(28px) saturate(2)',
                    border: '1px solid rgba(255,255,255,0.76)',
                    borderTop: '1px solid rgba(255,255,255,0.95)',
                    boxShadow: [
                        '0 2px 0 rgba(255,255,255,0.96) inset',
                        `0 8px 22px ${color}12`,
                        '0 2px 8px rgba(0,0,0,0.06)',
                    ].join(', '),
                    minWidth: 68,
                }}
            >
                {/* Shimmer */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(112deg, transparent 28%, rgba(255,255,255,0.28) 48%, transparent 68%)' }}
                    animate={{ x: ['-140%', '140%'] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
                />
                {/* Badge */}
                {badge !== undefined && (
                    <div className="absolute top-2 right-2 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center z-20"
                        style={{ background: color, boxShadow: `0 2px 6px ${color}50` }}>
                        <span className="text-[8px] font-black text-white leading-none">{badge}</span>
                    </div>
                )}
                {/* Pulse dot */}
                {pulse && (
                    <motion.div
                        className="absolute top-2 left-2 w-[7px] h-[7px] rounded-full z-20"
                        style={{ background: '#10B981' }}
                        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.55, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity }}
                    />
                )}
                {/* Icon */}
                <span className="relative z-10 text-[22px] leading-none select-none">
                    {icon}
                </span>
                {/* Label */}
                <span className="relative z-10 text-[9px] font-black text-center leading-tight"
                    style={{ color }}>
                    {label}
                </span>
            </motion.div>
        </Link>
    );
}
