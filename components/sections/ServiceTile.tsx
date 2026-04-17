'use client';
/**
 * ServiceTile.tsx — طِبرَا Water Glass Service Card ✦ WORLD CLASS ✦
 * ──────────────────────────────────────────────────────────────────
 * كل بطاقة خدمة مبنية على 7 طبقات فيزيائية:
 *
 *   ① Glass base — backdrop-blur + saturation + multi-gradient
 *   ② Liquid shimmer sweep — موجة ضوء متحركة
 *   ③ Bubble highlights — 3 نقاط ضوئية
 *   ④ Right rim light — شريط لوني جانبي
 *   ⑤ Ambient color pools — بحيرتا ضوء خلفية
 *   ⑥ Specular icon pill — أيقونة بزجاج داخلي
 *   ⑦ Type Badge — نوع المحتوى بصرياً (تشخيص / عملي / تعليمي / مدفوع)
 */

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Stethoscope, Wrench, BookOpen, Sparkles } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import type { SectionItem, ItemType } from './section-tokens';
import { getServiceIcon } from './service-icons';
import { wg } from './section-shared';

/* ─────────────────────────────────────────────────────────────
   Type Badge System
───────────────────────────────────────────────────────────── */
const TYPE_META: Record<NonNullable<ItemType>, {
    icon: React.ElementType; label: string; bg: string; color: string; border: string;
}> = {
    diagnostic: {
        icon: Stethoscope,
        label: 'تشخيص',
        bg: 'rgba(52,211,153,0.11)',
        color: '#059669',
        border: 'rgba(52,211,153,0.25)',
    },
    practical: {
        icon: Wrench,
        label: 'أداة',
        bg: 'rgba(251,191,36,0.10)',
        color: '#D97706',
        border: 'rgba(251,191,36,0.22)',
    },
    educational: {
        icon: BookOpen,
        label: 'مقال',
        bg: 'rgba(96,165,250,0.10)',
        color: '#2563EB',
        border: 'rgba(96,165,250,0.22)',
    },
    paid: {
        icon: Lock,
        label: 'مدفوع',
        bg: 'rgba(167,139,250,0.12)',
        color: '#7C3AED',
        border: 'rgba(167,139,250,0.28)',
    },
};

function TypeBadge({ type }: { type?: ItemType }) {
    if (!type) return null;
    const meta = TYPE_META[type];
    const Icon = meta.icon;
    return (
        <div
            className="flex items-center gap-[3px] px-[5px] py-[3px] rounded-full"
            style={{
                background: meta.bg,
                border: `1px solid ${meta.border}`,
                backdropFilter: 'blur(8px)',
            }}
        >
            <Icon className="w-[9px] h-[9px]" style={{ color: meta.color }} />
            <span className="text-[7px] font-black leading-none" style={{ color: meta.color }}>
                {meta.label}
            </span>
        </div>
    );
}

/* ═════════════════════════════════════════════════════════════
   MAIN EXPORT
═════════════════════════════════════════════════════════════ */
export function ServiceTile({ item, color, colorAlt, index }: {
    item: SectionItem;
    color: string;
    colorAlt: string;
    index: number;
}) {
    const { icon: svcIcon, color: iconColor } = getServiceIcon(item.href, item.label);
    const isPaid = item.type === 'paid';

    return (
        <Link href={item.href} onClick={() => haptic.tap()} className="block h-full">
            <motion.div
                initial={{ opacity: 0, scale: 0.86, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                    type: 'spring', stiffness: 400, damping: 28,
                    delay: 0.03 + index * 0.045,
                }}
                whileTap={{ scale: 0.928, rotate: -0.5 }}
                className="relative flex flex-col justify-between rounded-[22px] overflow-hidden h-full"
                style={{
                    minHeight: 120,
                    padding: '13px 12px 12px',
                    /* ── WATER GLASS BASE ── */
                    background: [
                        'linear-gradient(152deg,',
                        `  ${iconColor}16 0%,`,
                        '  rgba(255,255,255,0.88) 28%,',
                        '  rgba(255,255,255,0.76) 58%,',
                        `  ${iconColor}0C 100%`,
                        ')',
                    ].join(''),
                    backdropFilter: 'blur(40px) saturate(2.0) brightness(1.05)',
                    WebkitBackdropFilter: 'blur(40px) saturate(2.0) brightness(1.05)',
                    /* ── Glass border ── */
                    border: '1px solid rgba(255,255,255,0.72)',
                    borderTop: '1px solid rgba(255,255,255,0.95)',
                    borderLeft: '1px solid rgba(255,255,255,0.80)',
                    /* ── Physical multi-layer shadow ── */
                    boxShadow: [
                        '0 2px 0 rgba(255,255,255,0.96) inset',       // top specular
                        `0 -1px 0 ${iconColor}10 inset`,               // bottom color tint
                        '1px 0 0 rgba(255,255,255,0.60) inset',        // left edge
                        `0 10px 32px ${iconColor}16`,                  // colored depth
                        `0 4px 14px ${iconColor}0A`,
                        '0 2px 8px rgba(0,0,0,0.06)',                  // ambient
                    ].join(', '),
                    /* lock opacity for paid items */
                    ...(isPaid ? { opacity: 0.92 } : {}),
                }}
            >
                {/* ── ① LIQUID SHIMMER SWEEP ── */}
                <motion.div
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{
                        background: [
                            'linear-gradient(118deg,',
                            '  transparent 20%,',
                            '  rgba(255,255,255,0.30) 42%,',
                            '  rgba(255,255,255,0.08) 54%,',
                            '  transparent 76%)',
                        ].join(''),
                    }}
                    animate={{ x: ['-150%', '150%'] }}
                    transition={{
                        duration: 3.8 + index * 0.65,
                        repeat: Infinity,
                        repeatDelay: 5 + index * 1.1,
                        ease: 'easeInOut',
                    }}
                />

                {/* ── ② BUBBLE HIGHLIGHTS ── */}
                <div className="absolute top-2.5 left-3 w-[7px] h-[7px] rounded-full pointer-events-none z-0"
                    style={{ background: 'rgba(255,255,255,0.72)', filter: 'blur(1px)' }} />
                <div className="absolute top-4 left-5 w-[4px] h-[4px] rounded-full pointer-events-none z-0"
                    style={{ background: 'rgba(255,255,255,0.52)' }} />
                <div className="absolute top-3 left-8 w-[3px] h-[3px] rounded-full pointer-events-none z-0"
                    style={{ background: 'rgba(255,255,255,0.32)' }} />

                {/* ── ③ RIGHT RIM LIGHT ── */}
                <div className="absolute top-4 bottom-4 right-0 w-[3px] rounded-full pointer-events-none z-0"
                    style={{
                        background: `linear-gradient(to bottom, ${iconColor}65, ${iconColor}28, transparent 85%)`,
                    }} />

                {/* ── ④ AMBIENT COLOR POOLS ── */}
                <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full pointer-events-none z-0"
                    style={{
                        background: `radial-gradient(circle, ${iconColor}20, transparent 70%)`,
                        filter: 'blur(10px)',
                    }} />
                <div className="absolute -bottom-6 -left-6 w-14 h-14 rounded-full pointer-events-none z-0"
                    style={{
                        background: `radial-gradient(circle, ${iconColor}10, transparent 70%)`,
                        filter: 'blur(8px)',
                    }} />

                {/* ── ⑤ TOP ROW: Icon + Badges ── */}
                <div className="relative z-10 flex items-start justify-between w-full shrink-0">

                    {/* Floating icon pill */}
                    <motion.div
                        animate={{ y: [0, -2.5, 0] }}
                        transition={{ duration: 2.8 + index * 0.35, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative"
                    >
                        {/* Glow halo */}
                        <div className="absolute inset-[-8px] rounded-[18px] pointer-events-none"
                            style={{
                                background: `radial-gradient(ellipse at center, ${iconColor}24, transparent 70%)`,
                                filter: 'blur(6px)',
                            }} />

                        {/* Glass pill */}
                        <div
                            className="w-10 h-10 rounded-[14px] flex items-center justify-center relative overflow-hidden"
                            style={{
                                background: [
                                    'linear-gradient(148deg,',
                                    `  ${iconColor}20 0%,`,
                                    '  rgba(255,255,255,0.95) 48%,',
                                    `  ${iconColor}0E 100%`,
                                    ')',
                                ].join(''),
                                border: '1px solid rgba(255,255,255,0.84)',
                                borderTop: '1px solid rgba(255,255,255,0.97)',
                                boxShadow: [
                                    '0 1.5px 0 rgba(255,255,255,0.97) inset',
                                    `0 5px 16px ${iconColor}26`,
                                    '0 1px 4px rgba(0,0,0,0.07)',
                                ].join(', '),
                            }}
                        >
                            {/* Inner specular bubble */}
                            <div className="absolute top-0.5 left-1 w-1 h-1 rounded-full"
                                style={{ background: 'rgba(255,255,255,0.72)' }} />
                            <span className="text-[19px] leading-none relative z-10 select-none">
                                {svcIcon}
                            </span>
                        </div>
                    </motion.div>

                    {/* Badge column: type + isNew/badge */}
                    <div className="flex flex-col items-end gap-[4px] flex-shrink-0">
                        <TypeBadge type={item.type} />
                        {item.isNew && (
                            <motion.span
                                animate={{ opacity: [1, 0.55, 1], scale: [1, 1.06, 1] }}
                                transition={{ duration: 2.2, repeat: Infinity }}
                                className="text-[7px] font-black px-[5px] py-[3px] rounded-full text-white leading-none"
                                style={{
                                    background: `linear-gradient(135deg, ${iconColor}, ${iconColor}CC)`,
                                    boxShadow: `0 2px 8px ${iconColor}38`,
                                }}
                            >
                                ✦ جديد
                            </motion.span>
                        )}
                        {item.badge && !item.isNew && (
                            <span
                                className="text-[7px] font-bold px-[5px] py-[3px] rounded-full leading-none whitespace-nowrap"
                                style={{
                                    background: `${iconColor}12`,
                                    color: iconColor,
                                    border: `1px solid ${iconColor}24`,
                                }}
                            >
                                {item.badge}
                            </span>
                        )}
                    </div>
                </div>

                {/* ── ⑥ BOTTOM ROW: Label + Sub ── */}
                <div className="relative z-10 mt-2 flex flex-col justify-end grow">
                    <p className="text-[12px] font-black text-slate-800 leading-snug line-clamp-2 tracking-tight">
                        {item.label}
                    </p>
                    <p className="text-[9px] text-slate-400 leading-tight mt-[3px] line-clamp-2 font-medium">
                        {item.sub}
                    </p>
                </div>

                {/* ── ⑦ Paid lock overlay ── */}
                {isPaid && (
                    <div className="absolute inset-0 rounded-[22px] pointer-events-none z-20 flex items-end justify-end p-2.5"
                        style={{
                            background: 'linear-gradient(to top, rgba(124,58,237,0.04) 0%, transparent 50%)',
                        }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{
                                background: 'rgba(124,58,237,0.14)',
                                border: '1px solid rgba(124,58,237,0.25)',
                            }}>
                            <Lock className="w-2.5 h-2.5" style={{ color: '#7C3AED' }} />
                        </div>
                    </div>
                )}
            </motion.div>
        </Link>
    );
}
