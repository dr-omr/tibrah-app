// components/my-plan/plan-tokens.ts
// ════════════════════════════════════════════════════════════════════
// TIBRAH — My Plan Design System Tokens
// ════════════════════════════════════════════════════════════════════

import type { DomainId, ToolType } from '@/components/health-engine/types';
import { BookOpen, Shield, Zap, TestTube2, BarChart3, PlayCircle } from 'lucide-react';

export const PAGE_BG = 'linear-gradient(168deg, #E8F8FB 0%, #D0F0F8 18%, #E2F1FE 42%, #EDF5FF 65%, #F0FAFB 88%, #F5FDFE 100%)';

export const WATER_CAUSTIC = {
    a: 'radial-gradient(ellipse 60% 40% at 80% 20%, rgba(34,211,238,0.16) 0%, transparent 65%)',
    b: 'radial-gradient(ellipse 50% 60% at 20% 70%, rgba(129,140,248,0.12) 0%, transparent 55%)',
    c: 'radial-gradient(ellipse 40% 35% at 60% 85%, rgba(52,211,153,0.10) 0%, transparent 60%)',
};

export const GLASS = {
    base:   'rgba(255,255,255,0.58)',
    border: 'rgba(255,255,255,0.85)',
    sheen:  'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.15) 45%, transparent 100%)',
    spec:   'radial-gradient(ellipse 50% 25% at 22% 12%, rgba(255,255,255,0.55) 0%, transparent 70%)',
    shadow: '0 8px 32px rgba(8,145,178,0.10), 0 2px 8px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.92)',
    shadowSm: '0 6px 20px rgba(8,145,178,0.08), 0 1.5px 6px rgba(0,0,0,0.03), inset 0 1.5px 0 rgba(255,255,255,0.90)',
};

export const TXT = {
    primary: '#0C4A6E',
    secondary: '#0369A1',
    muted:   '#7DD3FC',
    accent:  '#0891B2',
};

export const DOMAIN_GLASS: Record<DomainId, {
    glow: string; tint: string; accent: string; accentSoft: string;
    heroGrad: string; borderGlow: string;
}> = {
    jasadi: {
        glow:       'rgba(8,145,178,0.18)',
        tint:       'rgba(8,145,178,0.06)',
        accent:     '#0891B2',
        accentSoft: 'rgba(8,145,178,0.12)',
        heroGrad:   'linear-gradient(170deg, rgba(255,255,255,0.90) 0%, rgba(186,230,253,0.75) 50%, rgba(8,145,178,0.30) 100%)',
        borderGlow: 'rgba(8,145,178,0.25)',
    },
    nafsi: {
        glow:       'rgba(129,140,248,0.18)',
        tint:       'rgba(129,140,248,0.06)',
        accent:     '#818CF8',
        accentSoft: 'rgba(129,140,248,0.12)',
        heroGrad:   'linear-gradient(170deg, rgba(255,255,255,0.90) 0%, rgba(233,213,255,0.75) 50%, rgba(129,140,248,0.28) 100%)',
        borderGlow: 'rgba(129,140,248,0.25)',
    },
    fikri: {
        glow:       'rgba(245,158,11,0.16)',
        tint:       'rgba(245,158,11,0.05)',
        accent:     '#F59E0B',
        accentSoft: 'rgba(245,158,11,0.10)',
        heroGrad:   'linear-gradient(170deg, rgba(255,255,255,0.90) 0%, rgba(254,243,199,0.75) 50%, rgba(245,158,11,0.26) 100%)',
        borderGlow: 'rgba(245,158,11,0.22)',
    },
    ruhi: {
        glow:       'rgba(34,211,238,0.18)',
        tint:       'rgba(34,211,238,0.06)',
        accent:     '#22D3EE',
        accentSoft: 'rgba(34,211,238,0.12)',
        heroGrad:   'linear-gradient(170deg, rgba(255,255,255,0.90) 0%, rgba(207,250,254,0.75) 50%, rgba(34,211,238,0.28) 100%)',
        borderGlow: 'rgba(34,211,238,0.22)',
    },
};

export const TOOL_ICON: Record<ToolType, typeof BookOpen> = {
    protocol: Shield, practice: Zap, test: TestTube2,
    workshop: PlayCircle, tracker: BarChart3,
};

export const TOOL_LABEL: Record<ToolType, string> = {
    protocol: 'بروتوكول', practice: 'تطبيق',
    test: 'اختبار', workshop: 'ورشة', tracker: 'متابعة',
};
