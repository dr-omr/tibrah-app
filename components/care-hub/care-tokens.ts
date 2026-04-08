// components/care-hub/care-tokens.ts
// Tibrah "رعايتي" Design Tokens — unified across the entire care hub
// Color philosophy:
//   Teal   = Physical healing (Tibrah brand)
//   Violet = Psychosomatic/emotional dimension
//   Amber  = Spiritual wellness (Islamic holistic care)
//   Red    = Urgency / crisis
//   Green  = Recovery / healthy state

export const CT = {
    // ── Tibrah brand primary ──────────────────────────────
    teal:   { c: '#2D9B83', light: '#14b8a6', dark: '#0d7a67', glow: 'rgba(45,155,131,0.35)' },
    // ── Psychosomatic / emotional track ───────────────────
    soul:   { c: '#7c3aed', light: '#8b5cf6', dark: '#5b21b6', glow: 'rgba(124,58,237,0.32)' },
    // ── Spiritual / holistic wellness ─────────────────────
    warm:   { c: '#d97706', light: '#f59e0b', dark: '#b45309', glow: 'rgba(217,119,6,0.30)' },
    // ── Recovery / success states ─────────────────────────
    green:  { c: '#16a34a', light: '#22c55e', dark: '#15803d', glow: 'rgba(22,163,74,0.30)' },
    // ── Urgency / red flags ───────────────────────────────
    red:    { c: '#dc2626', light: '#ef4444', dark: '#b91c1c', glow: 'rgba(220,38,38,0.35)' },
    // ── Neutral glass card ────────────────────────────────
    card: {
        bg:     'rgba(255,255,255,0.92)',
        blur:   'blur(24px)',
        border: 'rgba(0,0,0,0.07)',
        shadow: '0 4px 20px rgba(0,0,0,0.07)',
    },
    // ── Three-dimension care pillars ──────────────────────
    pillars: {
        physical:  { color: '#2D9B83', emoji: '🌿', label: 'الجسد' },
        emotional: { color: '#7c3aed', emoji: '💫', label: 'الشعور' },
        spiritual: { color: '#d97706', emoji: '✨', label: 'الروح' },
    },
} as const;

// ── Adherence levels ────────────────────────────────────────
export function adherenceColor(pct: number): string {
    if (pct >= 90) return CT.green.c;
    if (pct >= 70) return CT.warm.c;
    return CT.red.c;
}

// ── Session type display ─────────────────────────────────────
export const SESSION_LABELS: Record<string, string> = {
    consultation:  'جلسة تشخيصية',
    therapy:       'علاج بالترددات',
    followup:      'متابعة دورية',
    emotional:     'جلسة شعورية',
    nutrition:     'تقييم تغذوي',
    default:       'جلسة مع د. عمر',
};
