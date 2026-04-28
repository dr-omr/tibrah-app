// lib/result-engine/rank-recommendations.ts
// ════════════════════════════════════════════════════════════════
// Sprint E — Recommendation Ranking + Grouping
//
// Converts raw ToolRecommendation[] into ranked, enriched,
// grouped cards with Arabic rationale, effort, and CTA labels.
//
// RULES:
// - protocol  → always group 'primary', priority 1
// - test       → group 'tools',   priority 2
// - practice   → group 'tools',   priority 3
// - workshop   → group 'tools',   priority 4
// - tracker    → group 'tracking', priority 5
//
// rationale copy is pathway + phenotype aware.
// Fully deterministic: same inputs → same output.
// ════════════════════════════════════════════════════════════════

import type {
    RoutingResult,
    TriageResult,
    ToolRecommendation,
    RankedRecommendation,
    RecommendationGroup,
} from '@/components/health-engine/types';

import { DOMAIN_VIS } from '@/components/health-engine/result/shared/design-tokens';

/* ── Effort mapping by type ────────────────────────────── */
const EFFORT_BY_TYPE: Record<string, RankedRecommendation['effortLevel']> = {
    protocol: 'medium',
    test:     'low',
    practice: 'low',
    workshop: 'medium',
    tracker:  'low',
};

const EFFORT_LABEL_AR: Record<RankedRecommendation['effortLevel'], string> = {
    low:    'سهل',
    medium: 'متوسط',
    high:   'مكثّف',
};

/* ── Priority by type ──────────────────────────────────── */
const PRIORITY_BY_TYPE: Record<string, number> = {
    protocol: 1,
    test:     2,
    practice: 3,
    workshop: 4,
    tracker:  5,
};

/* ── Group by type ──────────────────────────────────────── */
const GROUP_BY_TYPE: Record<string, RankedRecommendation['group']> = {
    protocol: 'primary',
    test:     'tools',
    practice: 'tools',
    workshop: 'tools',
    tracker:  'tracking',
};

/* ── CTA label by type ─────────────────────────────────── */
const CTA_LABEL_BY_TYPE: Record<string, string> = {
    protocol: 'ابدأ البروتوكول',
    test:     'ابدأ الاختبار',
    practice: 'افتح التطبيق',
    workshop: 'ادخل الورشة',
    tracker:  'افتح السجل',
};

/* ── Duration hint by duration minutes ─────────────────── */
function buildDurationHint(minutes: number): string {
    if (minutes <= 0)  return '';
    if (minutes < 10)  return `${minutes} دقائق`;
    if (minutes <= 30) return `${minutes} دقيقة`;
    if (minutes <= 60) return 'ساعة';
    const days = Math.round(minutes / (60 * 24));
    if (days <= 1)  return 'يوم واحد';
    if (days <= 7)  return `${days} أيام`;
    if (days <= 14) return 'أسبوعان';
    return `${Math.round(days / 7)} أسابيع`;
}

/* ── Rationale copy by (type, pathway, phenotype) ─────── */
function buildWhyNow(
    tool:     ToolRecommendation,
    routing:  RoutingResult,
    triage:   TriageResult,
): string {
    const phenotypeDesc = routing.phenotype?.description ?? '';
    const pathwayId     = routing.primary_domain;
    const confidence    = routing.confidence;

    const RATIONALE: Partial<Record<string, string>> = {
        protocol:
            phenotypeDesc
                ? `ظهر لك هذا البروتوكول لأن نمطك السريري يُشير إلى ${phenotypeDesc.split('—')[0]?.trim() ?? 'نمط محدد'}.`
                : `هذا البروتوكول صُمّم للتعامل مع النمط الرئيسي الذي يعاني منه جسمك الآن.`,
        test:
            confidence === 'low'
                ? 'هذا الاختبار يُساعد في توضيح الصورة السريرية وتقليل الغموض في التوجيه.'
                : 'هذا الاختبار يمنحك قياساً موضوعياً يُعزز فهم نمطك الصحي.',
        practice:
            triage.somaticScore >= 5
                ? 'هذا التطبيق يُساعدك على مراقبة التغيرات الجسدية والشعورية يومياً.'
                : 'يساعدك هذا التطبيق على تتبع التقدم وتحديد محفزات الأعراض.',
        workshop:
            triage.topSomaticTheme !== 'none'
                ? 'هذه الورشة تُعالج الجانب العاطفي للأعراض الذي يظهر في نمطك من خلال ممارسة موجّهة.'
                : 'هذه الورشة تُعمّق الوعي بالعلاقة بين أسلوب الحياة وأعراضك.',
        tracker:
            `هذا السجل يساعدك على التقاط ${pathwayId === 'jasadi' ? 'الأنماط الجسدية' : 'التحولات الشعورية'} بدل الاعتماد على التذكر فقط.`,
    };

    return RATIONALE[tool.type] ?? 'هذه الأداة تُكمّل خطتك وتدعم تقدمك بشكل عملي.';
}

/* ── Expected benefit by type ──────────────────────────── */
function buildExpectedBenefit(tool: ToolRecommendation): string {
    const BENEFITS: Partial<Record<string, string>> = {
        protocol: 'تقليل الأعراض وبناء روتين علاجي واضح خلال ٧ أيام.',
        test:     'قياس موضوعي محدد يُوجّه الخطوات التالية.',
        practice: 'مرافقة يومية تُساعدك على الالتزام وقياس التحسن.',
        workshop: 'فهم أعمق للنمط المرتبط بالأعراض وأدوات تعديله.',
        tracker:  'رؤية مرئية لتقدمك مع الزمن تُحفّزك على الاستمرار.',
    };
    return BENEFITS[tool.type] ?? 'أداة تدعم خطتك الشاملة.';
}

/* ── Accent colors for cards ───────────────────────────── */
const ACCENT_PALETTE = ['#0891B2', '#7C3AED', '#0284C7', '#DB2777', '#D97706'];

/* ══════════════════════════════════════════════════════════
   MAIN EXPORT — rank + group
   ══════════════════════════════════════════════════════════ */
export function buildRankedRecommendationGroups(
    routing:  RoutingResult,
    triage:   TriageResult,
): RecommendationGroup[] {
    const domainColor =
        DOMAIN_VIS[routing.primary_domain]?.particleColor ?? ACCENT_PALETTE[0];

    // 1. Rank each tool
    const ranked: RankedRecommendation[] = routing.recommended_tools.map((tool, i) => {
        const effortLevel = EFFORT_BY_TYPE[tool.type] ?? 'low';
        return {
            ...tool,
            priority:       PRIORITY_BY_TYPE[tool.type] ?? 9,
            group:          GROUP_BY_TYPE[tool.type]    ?? 'tools',
            whyNow:         buildWhyNow(tool, routing, triage),
            expectedBenefit:buildExpectedBenefit(tool),
            effortLevel,
            effortLabel:    EFFORT_LABEL_AR[effortLevel],
            durationHint:   buildDurationHint(tool.durationMinutes),
            ctaLabel:       CTA_LABEL_BY_TYPE[tool.type] ?? 'افتح',
            accentColor:    i === 0 ? domainColor : ACCENT_PALETTE[i % ACCENT_PALETTE.length],
        };
    });

    // 2. Sort by priority
    const sorted = [...ranked].sort((a, b) => a.priority - b.priority);

    // 3. Group
    const primaryItems  = sorted.filter(r => r.group === 'primary');
    const toolItems     = sorted.filter(r => r.group === 'tools');
    const trackingItems = sorted.filter(r => r.group === 'tracking');

    const groups: RecommendationGroup[] = [];

    if (primaryItems.length > 0) {
        groups.push({
            key:             'primary',
            header:          'ابدأ بهذا أولاً',
            recommendations: primaryItems,
        });
    }
    if (toolItems.length > 0) {
        groups.push({
            key:             'tools',
            header:          'أدوات تكمّل الخطة',
            recommendations: toolItems,
        });
    }
    if (trackingItems.length > 0) {
        groups.push({
            key:             'tracking',
            header:          'ما يفيدك في التتبع هذا الأسبوع',
            recommendations: trackingItems,
        });
    }

    return groups;
}
