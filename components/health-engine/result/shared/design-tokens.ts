// components/health-engine/result/shared/design-tokens.ts
// ════════════════════════════════════════════════════════════════
// Tibrah Result System — Design Tokens (Sprint E)
// Extracted from StepResult.tsx to be shared across all result subcomponents.
// DO NOT add new colours here without updating all four domain entries.
// ════════════════════════════════════════════════════════════════

import type { DomainId } from '../../types';

/* ── Page background ──────────────────────────────────── */
export const PAGE_BG_RESULT =
    'linear-gradient(168deg, #E8F8FB 0%, #D0F0F8 18%, #E2F1FE 42%, #EDF5FF 65%, #F0FAFB 88%, #F5FDFE 100%)';

/* ── Water caustic overlays ───────────────────────────── */
export const WATER_CAUSTIC_R = {
    a: 'radial-gradient(ellipse 60% 40% at 80% 15%, rgba(34,211,238,0.16) 0%, transparent 65%)',
    b: 'radial-gradient(ellipse 50% 55% at 15% 70%, rgba(129,140,248,0.12) 0%, transparent 55%)',
    c: 'radial-gradient(ellipse 40% 30% at 60% 90%, rgba(52,211,153,0.10) 0%, transparent 55%)',
};

/* ── Core water-glass token set ────────────────────────── */
export const W = {
    pageBg:       PAGE_BG_RESULT,
    glass:        'rgba(255,255,255,0.58)',
    glassHigh:    'rgba(255,255,255,0.72)',
    glassBorder:  'rgba(255,255,255,0.85)',
    glassShadow:  '0 8px 32px rgba(8,145,178,0.10), 0 2px 8px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.92)',
    teal:         '#0891B2',
    tealDeep:     '#0E7490',
    tealLight:    '#22D3EE',
    cyan:         '#38BDF8',
    seafoam:      '#34D399',
    lavender:     '#818CF8',
    amber:        '#FBBF24',
    textPrimary:  '#0C4A6E',
    textSub:      '#0369A1',
    textMuted:    '#7DD3FC',
    textFaint:    '#BAE6FD',
    // Glass sheen layers
    sheen: 'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.15) 45%, transparent 100%)',
    spec:  'radial-gradient(ellipse 50% 25% at 22% 12%, rgba(255,255,255,0.55) 0%, transparent 70%)',
} as const;

/* ── Domain visual configurations ─────────────────────── */
export interface DomainVisConfig {
    grad:         string;
    glow:         string;
    tint:         string;
    border:       string;
    textColor:    string;
    particleColor:string;
    heroGrad:     string;
    accentSoft:   string;
}

export const DOMAIN_VIS: Record<DomainId, DomainVisConfig> = {
    jasadi: {
        heroGrad:      'linear-gradient(170deg, rgba(255,255,255,0.90) 0%, rgba(186,230,253,0.75) 50%, rgba(8,145,178,0.35) 100%)',
        grad:          'linear-gradient(145deg, rgba(255,255,255,0.88) 0%, rgba(186,230,253,0.65) 60%, rgba(8,145,178,0.25) 100%)',
        glow:          'rgba(8,145,178,0.22)',
        tint:          'rgba(8,145,178,0.06)',
        border:        'rgba(8,145,178,0.18)',
        accentSoft:    'rgba(8,145,178,0.10)',
        textColor:     '#0E7490',
        particleColor: '#0891B2',
    },
    nafsi: {
        heroGrad:      'linear-gradient(170deg, rgba(255,255,255,0.90) 0%, rgba(233,213,255,0.75) 50%, rgba(129,140,248,0.30) 100%)',
        grad:          'linear-gradient(145deg, rgba(255,255,255,0.88) 0%, rgba(233,213,255,0.60) 60%, rgba(129,140,248,0.22) 100%)',
        glow:          'rgba(129,140,248,0.22)',
        tint:          'rgba(129,140,248,0.06)',
        border:        'rgba(129,140,248,0.18)',
        accentSoft:    'rgba(129,140,248,0.10)',
        textColor:     '#5B21B6',
        particleColor: '#818CF8',
    },
    fikri: {
        heroGrad:      'linear-gradient(170deg, rgba(255,255,255,0.90) 0%, rgba(254,243,199,0.75) 50%, rgba(245,158,11,0.28) 100%)',
        grad:          'linear-gradient(145deg, rgba(255,255,255,0.88) 0%, rgba(254,243,199,0.60) 60%, rgba(245,158,11,0.20) 100%)',
        glow:          'rgba(245,158,11,0.22)',
        tint:          'rgba(245,158,11,0.06)',
        border:        'rgba(245,158,11,0.18)',
        accentSoft:    'rgba(245,158,11,0.10)',
        textColor:     '#B45309',
        particleColor: '#F59E0B',
    },
    ruhi: {
        heroGrad:      'linear-gradient(170deg, rgba(255,255,255,0.90) 0%, rgba(207,250,254,0.75) 50%, rgba(34,211,238,0.30) 100%)',
        grad:          'linear-gradient(145deg, rgba(255,255,255,0.88) 0%, rgba(207,250,254,0.60) 60%, rgba(34,211,238,0.22) 100%)',
        glow:          'rgba(34,211,238,0.22)',
        tint:          'rgba(34,211,238,0.06)',
        border:        'rgba(34,211,238,0.18)',
        accentSoft:    'rgba(34,211,238,0.10)',
        textColor:     '#0E7490',
        particleColor: '#06B6D4',
    },
};

/* ── Triage level metadata ─────────────────────────────── */
export const TRIAGE_META: Record<string, { badge: string; accent: string; bg: string }> = {
    emergency:    { badge: '⚠️ طارئ',   accent: '#DC2626', bg: 'rgba(254,242,242,0.9)' },
    urgent:       { badge: '🟠 عاجل',   accent: '#EA580C', bg: 'rgba(255,247,237,0.9)' },
    needs_doctor: { badge: '🩺 متابعة', accent: '#0891B2', bg: 'rgba(240,249,255,0.9)' },
    review:       { badge: '✅ مستقر',  accent: '#0E7490', bg: 'rgba(240,253,250,0.9)' },
    manageable:   { badge: '🟢 آمن',    accent: '#059669', bg: 'rgba(240,253,244,0.9)' },
};

/* ── Tool type labels + accent colors ─────────────────── */
export const TOOL_TYPE_META: Record<string, { label: string; accentIndex: number }> = {
    protocol: { label: 'بروتوكول', accentIndex: 0 },
    practice: { label: 'تطبيق',    accentIndex: 1 },
    test:     { label: 'اختبار',   accentIndex: 2 },
    workshop: { label: 'ورشة',     accentIndex: 3 },
    tracker:  { label: 'متابعة',   accentIndex: 4 },
};

/* ── Duration display map ──────────────────────────────── */
export const DURATION_DISPLAY: Record<string, string> = {
    hours:  'ساعات',
    days:   'أيام',
    weeks:  'أسابيع',
    months: 'مزمن',
};

/* ── Key signal dimension emojis ───────────────────────── */
export const SIGNAL_DIMENSION_EMOJI: Record<string, string> = {
    functional:  '⚙️',
    somatic:     '🫀',
    progression: '📈',
    severity:    '🔴',
};
