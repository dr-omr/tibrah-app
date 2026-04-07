// components/home/home-tokens.ts
// Tibrah Home — Design Tokens (Single Source of Truth)
// The only file that defines visual constants for the home screen

export const T = {
    // ── Card Surface ──────────────────────────────────────
    card: {
        bg:     'rgba(255,255,255,0.92)',
        border: 'rgba(0,0,0,0.07)',
        blur:   'blur(40px) saturate(180%)',
    },

    // ── Shadow Scale (barely there, like Apple) ───────────
    sh: {
        xs: '0 1px 2px rgba(0,0,0,0.04)',
        sm: '0 1px 3px rgba(0,0,0,0.05), 0 2px 6px rgba(0,0,0,0.04)',
        md: '0 2px 10px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
        lg: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        xl: '0 16px 48px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.05)',
    },

    // ── Border Radius ─────────────────────────────────────
    r: { sm: 12, md: 18, lg: 22, xl: 28, hero: 32 },

    // ── Brand Color ───────────────────────────────────────
    primary:        '#0d9488',
    primarySoft:    'rgba(13,148,136,0.08)',
    primaryBorder:  'rgba(13,148,136,0.16)',
    primaryGlow:    'rgba(13,148,136,0.25)',

    // ── Semantic Score Colors ─────────────────────────────
    good:    '#16a34a',   // green-600
    caution: '#d97706',   // amber-600
    danger:  '#dc2626',   // red-600
} as const;

// Derives the right color based on a 0–100 health score
export function scoreColor(score: number): string {
    if (score >= 80) return T.good;
    if (score >= 50) return T.caution;
    return T.danger;
}

// Shared spring config
export const CARD_SPRING = {
    type: 'spring' as const,
    stiffness: 380,
    damping: 32,
} as const;
