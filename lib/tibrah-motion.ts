/**
 * tibrah-motion.ts — نظام الحركة المركزي لطِبرَا
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * استخدم هذه القيم في كل المكوّنات بدل تعريف
 * spring physics يدوياً في كل مكان.
 *
 * مبني على:
 * - Apple HIG spring curves
 * - iOS native feel (stiffness 400-500, damping 25-32)
 * - Framer Motion v10+ API
 */

import type { Transition } from 'framer-motion';

/* ─── Spring Presets ────────────────────────────── */

/** Bouncy — للبطاقات والـ chips عند الدخول */
export const SPRING_BOUNCY: Transition = {
    type: 'spring',
    stiffness: 420,
    damping: 22,
    mass: 0.85,
};

/** Smooth — للـ modals والـ sheets */
export const SPRING_SMOOTH: Transition = {
    type: 'spring',
    stiffness: 320,
    damping: 28,
    mass: 1.0,
};

/** Snappy — للـ tab bar والـ navigation */
export const SPRING_SNAPPY: Transition = {
    type: 'spring',
    stiffness: 520,
    damping: 32,
    mass: 0.7,
};

/** Gentle — للـ background والـ ambient elements */
export const SPRING_GENTLE: Transition = {
    type: 'spring',
    stiffness: 200,
    damping: 30,
    mass: 1.2,
};

/** iOS-grade scale press (whileTap) */
export const TAP_SCALE = { scale: 0.96 };
export const TAP_SCALE_HARD = { scale: 0.93 };
export const TAP_SCALE_SUBTLE = { scale: 0.98 };

/* ─── Entry Animations ──────────────────────────── */

/** Card entrance — slides up + fade */
export const CARD_ENTER = {
    initial: { opacity: 0, y: 16, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: SPRING_BOUNCY,
};

/** Modal entrance — slides up from bottom */
export const MODAL_ENTER = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 24 },
    transition: SPRING_SMOOTH,
};

/** Item stagger — for lists */
export const STAGGER_CONTAINER = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.07,
            delayChildren: 0.1,
        },
    },
};

export const STAGGER_ITEM = {
    hidden: { opacity: 0, y: 12, scale: 0.97 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: SPRING_BOUNCY,
    },
};

/* ─── Micro-interactions ────────────────────────── */

/** Pulse animation for live indicators */
export const PULSE_LIVE = {
    animate: {
        scale: [1, 1.5, 1],
        opacity: [1, 0.3, 1],
    },
    transition: {
        duration: 1.8,
        repeat: Infinity,
        ease: 'easeInOut' as const,
    },
};

/** Ring pulse for active center tab */
export const PULSE_RING = {
    animate: { scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] },
    transition: { duration: 2.4, repeat: Infinity },
};

/** Shimmer (horizontal sweep) — for CTA buttons */
export const SHIMMER_SWEEP = {
    animate: { x: ['-100%', '100%'] },
    transition: { duration: 1.6, repeat: Infinity, ease: 'linear' as const, repeatDelay: 1.5 },
};

/** Arrow bounce — for navigation arrows */
export const ARROW_BOUNCE = {
    animate: { x: [0, -4, 0] },
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
};

/* ─── Easing Curves ─────────────────────────────── */

export const EASE_IOS         = [0.25, 0.46, 0.45, 0.94] as const;
export const EASE_SPRING_OUT  = [0.175, 0.885, 0.32, 1.275] as const;
export const EASE_SNAPPY      = [0.68, -0.55, 0.265, 1.55] as const;
