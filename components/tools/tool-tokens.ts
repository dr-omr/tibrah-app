// components/tools/tool-tokens.ts
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Universal Tool Renderer Design Tokens
// ════════════════════════════════════════════════════════════════════

export const DOMAIN_COLORS: Record<string, { color: string; colorAlt: string; bg: string }> = {
    jasadi: { color: '#00B7EB', colorAlt: '#0EA5E9', bg: 'rgba(0,183,235,0.07)' },
    nafsi:  { color: '#8B5CF6', colorAlt: '#7C3AED', bg: 'rgba(139,92,246,0.07)' },
    fikri:  { color: '#10B981', colorAlt: '#059669', bg: 'rgba(16,185,129,0.07)' },
    ruhi:   { color: '#F59E0B', colorAlt: '#D97706', bg: 'rgba(245,158,11,0.07)' },
};

export const DOMAIN_NAMES: Record<string, { ar: string; emoji: string }> = {
    jasadi: { ar: 'الجسدي',  emoji: '🫀' },
    nafsi:  { ar: 'النفسي',  emoji: '🧠' },
    fikri:  { ar: 'الفكري',  emoji: '💭' },
    ruhi:   { ar: 'الروحي',  emoji: '🕊️' },
};

export const TYPE_LABELS: Record<string, { ar: string; emoji: string }> = {
    practice: { ar: 'تمرين',     emoji: '⚡' },
    test:     { ar: 'اختبار',    emoji: '📋' },
    workshop: { ar: 'ورشة',     emoji: '📖' },
    tracker:  { ar: 'متابعة',   emoji: '📊' },
    protocol: { ar: 'بروتوكول', emoji: '🗓️' },
};
