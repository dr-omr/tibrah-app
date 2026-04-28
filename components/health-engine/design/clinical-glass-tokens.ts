// components/health-engine/design/clinical-glass-tokens.ts
// ════════════════════════════════════════════════════════════════
// TIBRAH Clinical Glass OS — Unified Design System
// Single source of truth for all assessment visual language.
// ════════════════════════════════════════════════════════════════

// ── CSS Variable Names ────────────────────────────────────────
export const CSS_VARS = {
    bg:            '--tg-bg',
    glass:         '--tg-glass',
    glassStrong:   '--tg-glass-strong',
    glassBorder:   '--tg-glass-border',
    refraction:    '--tg-refraction',
    waterHL:       '--tg-water-highlight',
    shadowSoft:    '--tg-shadow-soft',
    shadowDeep:    '--tg-shadow-deep',
    danger:        '--tg-danger',
    warning:       '--tg-warning',
    stable:        '--tg-stable',
    clinicalBlue:  '--tg-clinical-blue',
    nutrition:     '--tg-nutrition',
    unknown:       '--tg-unknown',
    radiusXl:      '--tg-radius-xl',
    radius2xl:     '--tg-radius-2xl',
} as const;

// ── Page Background ───────────────────────────────────────────
export const PAGE_BG = 'linear-gradient(168deg, #E8F8FB 0%, #D0F0F8 18%, #E2F1FE 42%, #EDF5FF 65%, #F0FAFB 88%, #F5FDFE 100%)';

// ── Glass Surfaces ────────────────────────────────────────────
export const GLASS = {
    primary:   'rgba(255,255,255,0.62)',
    strong:    'rgba(255,255,255,0.82)',
    danger:    'rgba(254,242,242,0.80)',
    education: 'rgba(245,243,255,0.72)',
    hero:      'rgba(255,255,255,0.72)',
    nav:       'rgba(255,255,255,0.88)',
    cta:       'rgba(255,255,255,0.90)',
    border:    'rgba(255,255,255,0.88)',
    borderSel: 'rgba(255,255,255,0.96)',
} as const;

// ── Water / Physical Effects ──────────────────────────────────
export const WATER = {
    sheen:      'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.15) 45%, transparent 100%)',
    spec:       'radial-gradient(ellipse 50% 25% at 22% 12%, rgba(255,255,255,0.55) 0%, transparent 70%)',
    refraction: '1px solid rgba(255,255,255,0.90)',
    innerLight: 'inset 0 1.5px 0 rgba(255,255,255,0.92)',
    shadow: {
        soft:  '0 4px 20px rgba(8,145,178,0.08), 0 1.5px 5px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.90)',
        deep:  '0 8px 32px rgba(8,145,178,0.14), 0 2px 8px rgba(0,0,0,0.05), inset 0 1.5px 0 rgba(255,255,255,0.95)',
        glow:  (color: string) => `0 0 24px ${color}20, 0 4px 16px ${color}14`,
        hero:  '0 16px 48px rgba(8,145,178,0.24), 0 4px 16px rgba(34,211,238,0.18), inset 0 2px 0 rgba(255,255,255,0.95)',
    },
    orbGrad: 'linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(186,230,253,0.85) 30%, rgba(103,232,249,0.70) 65%, rgba(34,211,238,0.80) 100%)',
} as const;

// ── Clinical Semantic Colors ──────────────────────────────────
export const CLINICAL = {
    stable:    { color: '#059669', bg: 'rgba(5,150,105,0.10)',  border: 'rgba(5,150,105,0.22)'  },
    review:    { color: '#0891B2', bg: 'rgba(8,145,178,0.10)',  border: 'rgba(8,145,178,0.22)'  },
    caution:   { color: '#D97706', bg: 'rgba(217,119,6,0.10)',  border: 'rgba(217,119,6,0.22)'  },
    urgent:    { color: '#DC2626', bg: 'rgba(220,38,38,0.10)',  border: 'rgba(220,38,38,0.22)'  },
    knowledge: { color: '#7C3AED', bg: 'rgba(124,58,237,0.10)', border: 'rgba(124,58,237,0.22)' },
    nutrition: { color: '#059669', bg: 'rgba(5,150,105,0.09)',  border: 'rgba(5,150,105,0.20)'  },
    confidence:{ color: '#0891B2', bg: 'rgba(8,145,178,0.09)',  border: 'rgba(8,145,178,0.20)'  },
    unknown:   { color: '#64748B', bg: 'rgba(100,116,139,0.10)',border: 'rgba(100,116,139,0.22)' },
} as const;

// ── Base Palette ──────────────────────────────────────────────
export const PALETTE = {
    teal:       '#0891B2',
    tealLight:  '#22D3EE',
    tealDeep:   '#0E7490',
    cyan:       '#38BDF8',
    lavender:   '#818CF8',
    amber:      '#FBBF24',
    textPrimary:'#0C4A6E',
    textSub:    '#0369A1',
    textMuted:  '#7DD3FC',
    textLight:  '#BAE6FD',
} as const;

// ── Typography Scale ──────────────────────────────────────────
export const TYPE = {
    heroTitle:   { fontSize: 30, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15 },
    sectionTitle:{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2  },
    questionTitle:{ fontSize: 16, fontWeight: 800, lineHeight: 1.45 },
    body:        { fontSize: 13, fontWeight: 500, lineHeight: 1.65 },
    bodyBold:    { fontSize: 13, fontWeight: 700, lineHeight: 1.55 },
    disclaimer:  { fontSize: 10.5, fontWeight: 500, lineHeight: 1.55 },
    microcopy:   { fontSize: 10, fontWeight: 700, lineHeight: 1.4  },
    badge:       { fontSize: 9,  fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase' as const },
    label:       { fontSize: 11, fontWeight: 700, lineHeight: 1.4  },
} as const;

// ── Motion ────────────────────────────────────────────────────
export const MOTION = {
    stepTransition: { duration: 0.35, ease: [0.05, 0.7, 0.1, 1] as [number,number,number,number] },
    cardReveal:     { type: 'spring', stiffness: 280, damping: 28 },
    optionPress:    { type: 'spring', stiffness: 500, damping: 26 },
    reducedMotion:  { duration: 0, transition: 'none' },
} as const;

// ── Border Radii ──────────────────────────────────────────────
export const RADIUS = {
    sm:  14,
    md:  18,
    lg:  22,
    xl:  26,
    '2xl': 32,
    pill: 999,
} as const;

// ── Backdrop ─────────────────────────────────────────────────
export const BACKDROP = 'blur(22px) saturate(130%)';

// ── Helper: build glass card style ────────────────────────────
export function glassCard(opts: {
    selected?: boolean;
    accentColor?: string;
    danger?: boolean;
    education?: boolean;
    radius?: number;
} = {}): React.CSSProperties {
    const { selected, accentColor, danger, education, radius = RADIUS.lg } = opts;
    const bg = danger   ? GLASS.danger
              : education ? GLASS.education
              : selected  ? GLASS.strong
              : GLASS.primary;
    const border = selected
        ? `1.5px solid ${GLASS.borderSel}`
        : danger
        ? `1.5px solid rgba(220,38,38,0.25)`
        : education
        ? `1.5px solid rgba(124,58,237,0.22)`
        : `1.5px solid ${GLASS.border}`;
    const shadow = selected
        ? `${WATER.shadow.deep}${accentColor ? `, 0 0 22px ${accentColor}18` : ''}`
        : WATER.shadow.soft;
    return {
        background: selected && accentColor
            ? `linear-gradient(155deg, rgba(255,255,255,0.86) 0%, ${accentColor}12 70%, ${accentColor}07 100%)`
            : bg,
        border,
        backdropFilter: BACKDROP,
        WebkitBackdropFilter: BACKDROP,
        boxShadow: shadow,
        borderRadius: radius,
    };
}
