// components/health-engine/result/shared/design-tokens.ts
// ════════════════════════════════════════════════════════════════
// Tibrah Assessment System — Unified Design Tokens (Sprint F)
// Covers: result pages + all intake/assessment steps
// ════════════════════════════════════════════════════════════════

import type { DomainId } from '../../types';

/* ── Page background ──────────────────────────────────── */
export const PAGE_BG_RESULT =
  'linear-gradient(168deg, #E8F8FB 0%, #D0F0F8 18%, #E2F1FE 42%, #EDF5FF 65%, #F0FAFB 88%, #F5FDFE 100%)';

/* ── Assessment step background ───────────────────────── */
export const PAGE_BG_ASSESSMENT =
  'linear-gradient(158deg, #EBF9FC 0%, #D6EFFA 22%, #E4F2FD 50%, #F0F7FF 78%, #F8FCFE 100%)';

/* ── Water caustic overlays ───────────────────────────── */
export const WATER_CAUSTIC_R = {
  a: 'radial-gradient(ellipse 60% 40% at 80% 15%, rgba(34,211,238,0.16) 0%, transparent 65%)',
  b: 'radial-gradient(ellipse 50% 55% at 15% 70%, rgba(129,140,248,0.12) 0%, transparent 55%)',
  c: 'radial-gradient(ellipse 40% 30% at 60% 90%, rgba(52,211,153,0.10) 0%, transparent 55%)',
};

/* ── Core water-glass token set ────────────────────────── */
export const W = {
  pageBg:       PAGE_BG_RESULT,
  assessBg:     PAGE_BG_ASSESSMENT,
  // Glass surfaces
  glass:        'rgba(255,255,255,0.62)',
  glassHigh:    'rgba(255,255,255,0.78)',
  glassBorder:  'rgba(255,255,255,0.88)',
  glassShadow:  '0 8px 32px rgba(8,145,178,0.10), 0 2px 8px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.94)',
  // Brand colors
  teal:         '#0891B2',
  tealDeep:     '#0E7490',
  tealLight:    '#22D3EE',
  tealXLight:   '#CFFAFE',
  cyan:         '#38BDF8',
  seafoam:      '#34D399',
  lavender:     '#818CF8',
  amber:        '#FBBF24',
  // Text hierarchy
  textPrimary:  '#0C4A6E',
  textSub:      '#0369A1',
  textMuted:    '#7DD3FC',
  textFaint:    '#BAE6FD',
  // Sheen layers
  sheen:        'linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.18) 45%, transparent 100%)',
  sheenStrong:  'linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.28) 42%, transparent 100%)',
  spec:         'radial-gradient(ellipse 50% 25% at 22% 12%, rgba(255,255,255,0.58) 0%, transparent 70%)',
  // Step step-specific backgrounds
  stepWelcome:    'linear-gradient(162deg, rgba(255,255,255,0.92), rgba(186,230,253,0.62) 55%, rgba(8,145,178,0.18) 100%)',
  stepHistory:    'linear-gradient(162deg, rgba(255,255,255,0.90), rgba(233,213,255,0.55) 55%, rgba(129,140,248,0.20) 100%)',
  stepComplaint:  'linear-gradient(162deg, rgba(255,255,255,0.92), rgba(187,247,208,0.58) 55%, rgba(16,185,129,0.18) 100%)',
  stepSeverity:   'linear-gradient(162deg, rgba(255,255,255,0.90), rgba(254,243,199,0.58) 55%, rgba(245,158,11,0.20) 100%)',
  stepRedFlags:   'linear-gradient(162deg, rgba(255,255,255,0.90), rgba(254,226,226,0.55) 55%, rgba(239,68,68,0.16) 100%)',
  stepHopi:       'linear-gradient(162deg, rgba(255,255,255,0.90), rgba(207,250,254,0.58) 55%, rgba(34,211,238,0.20) 100%)',
  stepAnalyzing:  'linear-gradient(162deg, rgba(255,255,255,0.92), rgba(186,230,253,0.62) 55%, rgba(8,145,178,0.24) 100%)',
} as const;

/* ── Assessment step palette ───────────────────────────── */
export interface StepPalette {
  color:      string;
  colorLight: string;
  textColor:  string;
  bg:         string;
  border:     string;
  glow:       string;
  label:      string;
}

export const STEP_PALETTE: Record<string, StepPalette> = {
  welcome: {
    color:      '#0891B2',
    colorLight: '#CFFAFE',
    textColor:  '#0E7490',
    bg:         'rgba(8,145,178,0.08)',
    border:     'rgba(8,145,178,0.20)',
    glow:       'rgba(8,145,178,0.22)',
    label:      'البداية',
  },
  history: {
    color:      '#7C3AED',
    colorLight: '#EDE9FE',
    textColor:  '#5B21B6',
    bg:         'rgba(124,58,237,0.07)',
    border:     'rgba(124,58,237,0.18)',
    glow:       'rgba(124,58,237,0.20)',
    label:      'التاريخ الشخصي',
  },
  complaint: {
    color:      '#059669',
    colorLight: '#D1FAE5',
    textColor:  '#047857',
    bg:         'rgba(5,150,105,0.08)',
    border:     'rgba(5,150,105,0.20)',
    glow:       'rgba(5,150,105,0.22)',
    label:      'الشكوى الرئيسية',
  },
  severity: {
    color:      '#D97706',
    colorLight: '#FEF3C7',
    textColor:  '#B45309',
    bg:         'rgba(217,119,6,0.08)',
    border:     'rgba(217,119,6,0.20)',
    glow:       'rgba(217,119,6,0.22)',
    label:      'شدة الأعراض',
  },
  modifiers: {
    color:      '#DC2626',
    colorLight: '#FEE2E2',
    textColor:  '#991B1B',
    bg:         'rgba(220,38,38,0.07)',
    border:     'rgba(220,38,38,0.18)',
    glow:       'rgba(220,38,38,0.20)',
    label:      'علامات التحذير',
  },
  hopi: {
    color:      '#0E7490',
    colorLight: '#CFFAFE',
    textColor:  '#155E75',
    bg:         'rgba(14,116,144,0.08)',
    border:     'rgba(14,116,144,0.20)',
    glow:       'rgba(14,116,144,0.22)',
    label:      'قصة العرض',
  },
  tayyibat: {
    color:      '#10B981',
    colorLight: '#D1FAE5',
    textColor:  '#047857',
    bg:         'rgba(16,185,129,0.08)',
    border:     'rgba(16,185,129,0.20)',
    glow:       'rgba(16,185,129,0.22)',
    label:      'الطيبات',
  },
  review: {
    color:      '#6366F1',
    colorLight: '#E0E7FF',
    textColor:  '#4338CA',
    bg:         'rgba(99,102,241,0.08)',
    border:     'rgba(99,102,241,0.20)',
    glow:       'rgba(99,102,241,0.22)',
    label:      'المراجعة',
  },
  analyzing: {
    color:      '#0891B2',
    colorLight: '#CFFAFE',
    textColor:  '#0E7490',
    bg:         'rgba(8,145,178,0.08)',
    border:     'rgba(8,145,178,0.20)',
    glow:       'rgba(8,145,178,0.28)',
    label:      'التحليل',
  },
};

/* ── Domain visual configurations ─────────────────────── */
export interface DomainVisConfig {
  grad:          string;
  glow:          string;
  tint:          string;
  border:        string;
  textColor:     string;
  particleColor: string;
  heroGrad:      string;
  accentSoft:    string;
}

export const DOMAIN_VIS: Record<DomainId, DomainVisConfig> = {
  jasadi: {
    heroGrad:      'linear-gradient(170deg, rgba(255,255,255,0.92) 0%, rgba(186,230,253,0.78) 50%, rgba(8,145,178,0.38) 100%)',
    grad:          'linear-gradient(145deg, rgba(255,255,255,0.90) 0%, rgba(186,230,253,0.68) 60%, rgba(8,145,178,0.28) 100%)',
    glow:          'rgba(8,145,178,0.26)',
    tint:          'rgba(8,145,178,0.07)',
    border:        'rgba(8,145,178,0.20)',
    accentSoft:    'rgba(8,145,178,0.12)',
    textColor:     '#0E7490',
    particleColor: '#0891B2',
  },
  nafsi: {
    heroGrad:      'linear-gradient(170deg, rgba(255,255,255,0.92) 0%, rgba(233,213,255,0.78) 50%, rgba(129,140,248,0.34) 100%)',
    grad:          'linear-gradient(145deg, rgba(255,255,255,0.90) 0%, rgba(233,213,255,0.62) 60%, rgba(129,140,248,0.25) 100%)',
    glow:          'rgba(129,140,248,0.26)',
    tint:          'rgba(129,140,248,0.07)',
    border:        'rgba(129,140,248,0.20)',
    accentSoft:    'rgba(129,140,248,0.12)',
    textColor:     '#5B21B6',
    particleColor: '#818CF8',
  },
  fikri: {
    heroGrad:      'linear-gradient(170deg, rgba(255,255,255,0.92) 0%, rgba(254,243,199,0.78) 50%, rgba(245,158,11,0.32) 100%)',
    grad:          'linear-gradient(145deg, rgba(255,255,255,0.90) 0%, rgba(254,243,199,0.62) 60%, rgba(245,158,11,0.23) 100%)',
    glow:          'rgba(245,158,11,0.26)',
    tint:          'rgba(245,158,11,0.07)',
    border:        'rgba(245,158,11,0.20)',
    accentSoft:    'rgba(245,158,11,0.12)',
    textColor:     '#B45309',
    particleColor: '#F59E0B',
  },
  ruhi: {
    heroGrad:      'linear-gradient(170deg, rgba(255,255,255,0.92) 0%, rgba(207,250,254,0.78) 50%, rgba(34,211,238,0.34) 100%)',
    grad:          'linear-gradient(145deg, rgba(255,255,255,0.90) 0%, rgba(207,250,254,0.62) 60%, rgba(34,211,238,0.25) 100%)',
    glow:          'rgba(34,211,238,0.26)',
    tint:          'rgba(34,211,238,0.07)',
    border:        'rgba(34,211,238,0.20)',
    accentSoft:    'rgba(34,211,238,0.12)',
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

/* ── Glass surface style helper (returns plain object) ─── */
export function makeGlassStyle(color: string, strong = false) {
  return {
    background: strong
      ? `linear-gradient(155deg, rgba(255,255,255,0.94), rgba(255,255,255,0.76) 42%, rgba(238,252,255,0.56))`
      : `linear-gradient(150deg, rgba(255,255,255,0.86), rgba(255,255,255,0.60) 46%, rgba(232,250,255,0.42))`,
    border: '1px solid rgba(255,255,255,0.90)',
    backdropFilter: 'blur(36px) saturate(182%)',
    WebkitBackdropFilter: 'blur(36px) saturate(182%)',
    boxShadow: `0 24px 72px ${color}1A, 0 10px 32px rgba(6,54,75,0.08), inset 0 1.5px 0 rgba(255,255,255,0.98), inset 0 -20px 44px ${color}09`,
  };
}
