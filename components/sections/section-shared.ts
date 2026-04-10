/**
 * section-shared.ts — Shared Design Constants for Section Components
 * ───────────────────────────────────────────────────────────────────
 * Spring presets + Water Glass CSS factory
 * استورد من هنا في كل مكون — لا تعرّف springs في كل ملف
 */

import type { Transition } from 'framer-motion';

/* ── Spring presets ─────────────────────────────── */
export const SP: Transition = {
    type: 'spring',
    stiffness: 460,
    damping: 36,
};

export const SP_SLOW: Transition = {
    type: 'spring',
    stiffness: 300,
    damping: 32,
};

export const SP_ENTRY: Transition = {
    type: 'spring',
    stiffness: 380,
    damping: 26,
};

/* ── Water Glass CSS factory ────────────────────── */
/**
 * wg(color, colorAlt) → CSSProperties object
 * يُنشئ تأثير الزجاج المائي المتعدد الطبقات
 */
export const wg = (color: string, colorAlt: string): React.CSSProperties => ({
    background: [
        'linear-gradient(155deg,',
        `  ${color}14 0%,`,
        '  rgba(255,255,255,0.86) 32%,',
        '  rgba(255,255,255,0.72) 65%,',
        `  ${colorAlt}0A 100%`,
        ')',
    ].join(''),
    backdropFilter: 'blur(36px) saturate(1.9) brightness(1.05)',
    WebkitBackdropFilter: 'blur(36px) saturate(1.9) brightness(1.05)',
    border: '1px solid rgba(255,255,255,0.72)',
    borderTop: '1px solid rgba(255,255,255,0.94)',
    boxShadow: [
        '0 2px 0 rgba(255,255,255,0.95) inset',
        `0 -1px 0 ${color}10 inset`,
        '1px 0 0 rgba(255,255,255,0.55) inset',
        `0 12px 38px ${color}14`,
        `0 4px 16px ${color}0A`,
        '0 2px 10px rgba(0,0,0,0.06)',
    ].join(', '),
});

// Required for types
import type React from 'react';
