// components/home/home-tokens.ts
// Tibrah Design System — "Fluent Apple" Edition
// Philosophy: ONE accent, crisp whites, physical depth.

export const T = {
    // ── Single accent (the ONLY brand color used prominently) ──────
    accent: '#0D9488',      // Tibrah Teal
    accentDim: '#0F766E',   // pressed / deeper state
    accentGlow: 'rgba(13,148,136,0.22)',

    // ── Neutral scale (Apple-grade) ───────────────────────────────
    n: {
        '950': '#020817',
        '900': '#0F172A',
        '800': '#1E293B',
        '600': '#475569',
        '400': '#94A3B8',
        '200': '#E2E8F0',
        '100': '#F1F5F9',
        '50':  '#F8FAFC',
        '0':   '#FFFFFF',
    },

    // ── Surfaces (Microsoft Mica / Apple Vibrancy) ────────────────
    surface: {
        base:    'rgba(255,255,255,0.97)',
        raised:  'rgba(255,255,255,1.00)',
        overlay: 'rgba(255,255,255,0.88)',
        blur:    'blur(32px) saturate(200%)',
    },

    // ── Shadows (Apple-grade depth) ───────────────────────────────
    shadow: {
        xs: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)',
        sm: '0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
        md: '0 4px 16px rgba(0,0,0,0.09), 0 2px 6px rgba(0,0,0,0.05)',
        lg: '0 8px 28px rgba(0,0,0,0.11), 0 3px 10px rgba(0,0,0,0.06)',
        xl: '0 16px 48px rgba(0,0,0,0.13), 0 6px 16px rgba(0,0,0,0.07)',
    },

    // ── Spring physics presets ────────────────────────────────────
    spring: {
        snappy: { type: 'spring' as const, stiffness: 500, damping: 30, mass: 0.7 },
        bouncy: { type: 'spring' as const, stiffness: 400, damping: 22, mass: 0.8 },
        smooth: { type: 'spring' as const, stiffness: 280, damping: 32, mass: 1.0 },
    },

    // ── Semantic colors (minimal, purposeful) ─────────────────────
    ok:     '#16A34A',
    warn:   '#D97706',
    danger: '#DC2626',

    // Legacy aliases for components that still use T.card / T.sh
    card:   { bg: 'rgba(255,255,255,0.97)', blur: 'blur(32px) saturate(200%)', border: 'rgba(0,0,0,0.06)', borderLight: 'rgba(0,0,0,0.04)', shadow: '0 4px 16px rgba(0,0,0,0.09)', shadowLg: '0 16px 48px rgba(0,0,0,0.13)' },
    sh:     { sm: '0 2px 8px rgba(0,0,0,0.08)', md: '0 4px 16px rgba(0,0,0,0.09)', lg: '0 8px 28px rgba(0,0,0,0.11)', xl: '0 16px 48px rgba(0,0,0,0.13)' },
    primary: '#0D9488',
    soul:    '#6D4AFF',
    warm:    '#D97706',
    grad:    { primary: 'linear-gradient(135deg, #0F766E, #0D9488)', accent: 'linear-gradient(135deg, #0D9488, #14B8A6)', hero: '', glass: 'rgba(255,255,255,0.08)' },
    glow:    { primary: 'rgba(13,148,136,0.22)', accent: 'rgba(13,148,136,0.22)', soul: 'rgba(109,74,255,0.22)', warm: 'rgba(217,119,6,0.22)' },
    dark:    { bg: '', glass: '', border: '', text: '', muted: '' },
    font:    { display: '', mono: '' },
};

// Score → semantic color
export function scoreColor(s: number): string {
    if (s >= 80) return '#16A34A';
    if (s >= 65) return '#0D9488';
    if (s >= 50) return '#D97706';
    return '#DC2626';
}

export const CARD_SPRING = T.spring.snappy;
