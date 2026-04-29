// components/health-tracker/tracker-tokens.ts
// Tibrah Health Tracker — Design Tokens
// Single source of truth for every tracker component.

export const METRIC = {
    water:    { color: '#2563eb', bg: 'rgba(37,99,235,0.07)',   border: 'rgba(37,99,235,0.15)',  g: 'linear-gradient(135deg,#2563eb,#3b82f6)', label: 'الماء',     emoji: '💧' },
    sleep:    { color: '#7c3aed', bg: 'rgba(124,58,237,0.07)',  border: 'rgba(124,58,237,0.15)', g: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', label: 'النوم',     emoji: '🌙' },
    activity: { color: '#0891B2', bg: 'rgba(8,145,178,0.07)',  border: 'rgba(8,145,178,0.15)', g: 'linear-gradient(135deg,#0891B2,#22D3EE)', label: 'النشاط',    emoji: '🏃' },
    mood:     { color: '#d97706', bg: 'rgba(217,119,6,0.07)',   border: 'rgba(217,119,6,0.15)',  g: 'linear-gradient(135deg,#d97706,#f59e0b)', label: 'المزاج',    emoji: '😊' },
    meds:     { color: '#dc2626', bg: 'rgba(220,38,38,0.07)',   border: 'rgba(220,38,38,0.15)',  g: 'linear-gradient(135deg,#dc2626,#ef4444)', label: 'الأدوية',   emoji: '💊' },
    weight:   { color: '#64748b', bg: 'rgba(100,116,139,0.07)', border: 'rgba(100,116,139,0.15)',g: 'linear-gradient(135deg,#64748b,#94a3b8)', label: 'الوزن',     emoji: '⚖️' },
    bp:       { color: '#e11d48', bg: 'rgba(225,29,72,0.07)',   border: 'rgba(225,29,72,0.15)',  g: 'linear-gradient(135deg,#e11d48,#f43f5e)', label: 'الضغط',     emoji: '❤️' },
    fasting:  { color: '#c2410c', bg: 'rgba(194,65,12,0.07)',   border: 'rgba(194,65,12,0.15)',  g: 'linear-gradient(135deg,#c2410c,#ea580c)', label: 'الصيام',    emoji: '⏱️' },
    calories: { color: '#15803d', bg: 'rgba(21,128,61,0.07)',   border: 'rgba(21,128,61,0.15)',  g: 'linear-gradient(135deg,#15803d,#16a34a)', label: 'السعرات',   emoji: '🔥' },
} as const;

export type MetricKey = keyof typeof METRIC;

// Card surface — Liquid Glass Light (matches F0FAF8 canvas)
export const TC = {
    canvas: '#F0FAF8',
    card: {
        bg:       'rgba(255,255,255,0.88)',
        border:   'rgba(255,255,255,0.82)',
        borderTop:'rgba(255,255,255,0.98)',
        blur:     'blur(32px) saturate(180%)',
        shadow:   '0 2px 0 rgba(255,255,255,1) inset, 0 6px 24px rgba(15,23,42,0.07), 0 1px 4px rgba(0,0,0,0.04)',
        shadowLg: '0 2px 0 rgba(255,255,255,1) inset, 0 12px 40px rgba(15,23,42,0.09), 0 4px 12px rgba(0,0,0,0.05)',
    },
    r: { sm: 14, md: 18, lg: 22, xl: 28 },
} as const;

// Score to color
export function scoreToColor(score: number): string {
    if (score >= 80) return '#16a34a';
    if (score >= 60) return '#d97706';
    return '#dc2626';
}

// Body score calculation from multiple metrics (0–100 each)
export function calcBodyScore(metrics: Partial<Record<MetricKey, number>>): number {
    const weights: Partial<Record<MetricKey, number>> = {
        sleep: 0.30, activity: 0.25, water: 0.20, mood: 0.15, meds: 0.10,
    };
    let total = 0; let wSum = 0;
    for (const [k, w] of Object.entries(weights)) {
        const v = metrics[k as MetricKey];
        if (v !== undefined) { total += v * (w as number); wSum += w as number; }
    }
    return wSum > 0 ? Math.round(total / wSum) : 0;
}
