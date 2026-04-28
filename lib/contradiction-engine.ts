// lib/contradiction-engine.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Contradiction Intelligence + Confidence Model + Signal Weighting
// ════════════════════════════════════════════════════════════════════════
//
// Rules:
//   1. Contradiction rules are confidence/reasoning MODIFIERS only —
//      they never override routing, escalation, or domain scores.
//   2. User-facing phenotype text is always pattern-based ("يميل إلى…"),
//      never a definitive diagnosis.
//   3. Key signals are capped at 3 items in the UI.
// ════════════════════════════════════════════════════════════════════════

import type { EngineAnswers, TriageResult } from '@/components/health-engine/types';
import { OPTION_META } from '@/components/health-engine/constants';

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

export interface ContradictionFlag {
    /** Internal ID for this rule */
    id: 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6';
    /** How serious this contradiction is */
    severity: 'high' | 'medium' | 'low';
    /** Arabic user-facing consistency note */
    message: string;
    /** Points subtracted from the confidence score (0-20) */
    confidenceImpact: number;
}

export interface ConfidenceModel {
    /** Overall 0-100 score */
    score: number;
    /** 'high' | 'medium' | 'low' label */
    label: 'high' | 'medium' | 'low';
    /** Arabic phrases explaining what drove confidence */
    factors: string[];
}

export interface KeySignal {
    /** Arabic description of the answer/pattern */
    label: string;
    /** Which dimension this signal is strongest in */
    dimension: 'functional' | 'somatic' | 'progression' | 'severity';
    /** Combined weight this signal contributed */
    weight: number;
}

/* ══════════════════════════════════════════════════════════
   PHYSICAL PATHWAYS (same set used in domain-scoring-engine)
   ══════════════════════════════════════════════════════════ */

const PHYSICAL_PATHWAYS = new Set([
    'fatigue', 'hormonal', 'digestion', 'pain', 'immune', 'headache',
]);

/* ══════════════════════════════════════════════════════════
   RULE A: detectContradictions
   6 clinical consistency rules
   ══════════════════════════════════════════════════════════ */

export function detectContradictions(
    answers: EngineAnswers,
    triageResult: TriageResult,
): ContradictionFlag[] {
    const flags: ContradictionFlag[] = [];
    const allValues = Object.values(answers.clinicalAnswers).flat() as string[];

    // ── C1: High severity + no functional signal ──
    // Severe symptom but no functional pattern emerged — unusual, may need conventional workup
    if (answers.severity >= 7 && triageResult.functionalScore < 2 && triageResult.topFunctionalPattern === 'none') {
        flags.push({
            id: 'C1',
            severity: 'medium',
            message: 'شدة الأعراض مرتفعة، لكن النمط الوظيفي غير واضح — قد يستفيد تقييمك من فحص تقليدي للاستبعاد',
            confidenceImpact: 12,
        });
    }

    // ── C2: Worsening + chronic + still manageable level ──
    // Engine said manageable but the trajectory is bad
    const isWorsening = allValues.includes('تسوء تدريجياً');
    if (
        isWorsening &&
        answers.duration === 'months' &&
        (triageResult.level === 'manageable' || triageResult.level === 'review')
    ) {
        flags.push({
            id: 'C2',
            severity: 'high',
            message: 'مسار الأعراض في تدهور مستمر على مدى أشهر — التصنيف الحالي قد يستحق مراجعة طبية استباقية',
            confidenceImpact: 18,
        });
    }

    // ── C3: Red flag present + level is still safe ──
    // Safety signal exists but triage didn't escalate
    if (
        answers.redFlags.length > 0 &&
        !answers.hasEmergencyFlag &&
        (triageResult.level === 'manageable' || triageResult.level === 'review')
    ) {
        flags.push({
            id: 'C3',
            severity: 'high',
            message: 'هناك إشارة تحذيرية في إجاباتك لم تؤثر على مستوى التصعيد — راجع طبيبك للتأكيد',
            confidenceImpact: 20,
        });
    }

    // ── C4: Physical pathway + primary domain routed non-jasadi ──
    // Somatic complaint but engine pointed to non-physical domain
    // NOTE: This is informational only — does NOT change routing
    if (
        PHYSICAL_PATHWAYS.has(answers.pathwayId) &&
        triageResult.topSomaticTheme !== 'none' &&
        triageResult.somaticScore >= 7 &&
        triageResult.functionalScore < 3
    ) {
        flags.push({
            id: 'C4',
            severity: 'medium',
            message: 'الشكوى جسدية لكن الأعراض تحمل بُعداً نفس-جسدياً عالياً — التقييم الجسدي التقليدي مفيد بجانب البُعد النفسي',
            confidenceImpact: 8,
        });
    }

    // ── C5: High somatic score + minimal emotional context ──
    // Body is expressing a lot, but emotional tags are minimal — possible suppression
    // Threshold raised to 8 (from 7) + requires 2+ answered questions to avoid
    // firing on every physical-pathway user who simply selects 'none' in emotional step
    const answeredCount = Object.keys(answers.clinicalAnswers).length;
    const emotionalCount = answers.emotionalContext.filter(e => e !== 'none').length;
    if (triageResult.somaticScore >= 8 && emotionalCount <= 1 && answeredCount >= 2) {
        flags.push({
            id: 'C5',
            severity: 'low',
            message: 'البُعد النفس-جسدي مرتفع، لكن السياق العاطفي المُحدَّد محدود — قد يكون بعض ما تشعر به يصعب الإفصاح عنه',
            confidenceImpact: 5,
        });
    }

    // ── C6: "Nothing helps" + low severity ──
    // Irreconcilable: very low severity but total treatment resistance
    const nothingHelps = allValues.includes('لا شيء يُحسّنها');
    if (nothingHelps && answers.severity < 5) {
        flags.push({
            id: 'C6',
            severity: 'medium',
            message: 'شدة الأعراض منخفضة لكن لا شيء يُحسّنها — هذا النمط يستحق متابعة متخصصة لفهم العوامل المُبقية',
            confidenceImpact: 10,
        });
    }

    return flags;
}

/* ══════════════════════════════════════════════════════════
   RULE B: computeConfidenceModel
   5-factor weighted confidence (0-100)
   ══════════════════════════════════════════════════════════ */

export function computeConfidenceModel(
    answers: EngineAnswers,
    triageResult: TriageResult,
    normalizedPrimaryScore: number,
    normalizedSecondaryScore: number,
    contradictions: ContradictionFlag[],
    pathwayQuestionCount: number,
): ConfidenceModel {
    const factors: string[] = [];

    // Factor 1: Score gap (22% weight — reduced from 30% to accommodate new factors)
    const scoreGap = normalizedPrimaryScore - normalizedSecondaryScore;
    const gapScore = Math.min(100, scoreGap * 2.5); // 40pt gap → 100
    const factor1 = gapScore * 0.22;
    if (scoreGap >= 30) {
        factors.push('تمايز واضح بين المسارات');
    } else if (scoreGap >= 15) {
        factors.push('تمايز معتدل بين المسارات');
    }

    // Factor 2: Answer completeness (15% weight — reduced from 20%)
    const answeredCount = Object.keys(answers.clinicalAnswers).length;
    const completeness = Math.min(100, (answeredCount / Math.max(1, pathwayQuestionCount)) * 100);
    const factor2 = completeness * 0.15;
    if (completeness >= 80) {
        factors.push('اكتمال الإجابات عالٍ');
    } else if (completeness < 50) {
        factors.push('بعض الأسئلة لم تُجَب');
    }

    // Factor 3: Contradiction penalty (20% weight — reduced from 25%)
    const contradictionPenalty = Math.min(100, contradictions.reduce((sum, c) => sum + c.confidenceImpact, 0));
    const factor3 = Math.max(0, 100 - contradictionPenalty) * 0.20;
    if (contradictions.length === 0) {
        factors.push('لا تناقضات في الإجابات');
    } else if (contradictions.length >= 2) {
        factors.push('تناقضات تحتاج مراجعة');
    }

    // Factor 4: Red flag alignment (8% weight — reduced from 10%)
    let flagScore = 100;
    if (answers.hasEmergencyFlag) {
        flagScore = 50;
    } else if (answers.redFlags.length > 0 && triageResult.level === 'manageable') {
        flagScore = 30;
    } else if (answers.redFlags.length > 0) {
        flagScore = 70;
    }
    const factor4 = flagScore * 0.08;

    // Factor 5: Functional pattern specificity (12% weight — reduced from 15%)
    let specificityScore = 20;
    if (triageResult.functionalScore >= 4) {
        specificityScore = 100;
        factors.push('نمط وظيفي واضح ومحدد');
    } else if (triageResult.functionalScore >= 2) {
        specificityScore = 60;
    }
    const factor5 = specificityScore * 0.12;

    // Factor 6: Pattern Coherence — NEW (13% weight)
    // Measures how well clinical answers align with the detected functional/somatic pattern
    // Higher coherence = answers consistently point to one direction
    const allValues = Object.values(answers.clinicalAnswers).flat() as string[];
    let coherenceScore = 40; // neutral baseline
    if (allValues.length >= 3) {
        // Check if answers cluster around similar themes
        const hasMetabolicCluster = allValues.some(v => v.includes('سكر') || v.includes('أكل') || v.includes('طاقة'));
        const hasNeurologicalCluster = allValues.some(v => v.includes('نوم') || v.includes('ذهنية') || v.includes('تركيز'));
        const hasEmotionalCluster = allValues.some(v => v.includes('قلق') || v.includes('خوف') || v.includes('كبت'));
        const hasInflammCluster = allValues.some(v => v.includes('التهاب') || v.includes('ألم') || v.includes('تيبس'));

        const clusterCount = [hasMetabolicCluster, hasNeurologicalCluster, hasEmotionalCluster, hasInflammCluster]
            .filter(Boolean).length;

        if (clusterCount === 1) {
            coherenceScore = 100; // Highly coherent — answers cluster in one theme
            factors.push('تماسك عالٍ في نمط الإجابات');
        } else if (clusterCount === 2) {
            coherenceScore = 70; // Two related themes
        } else if (clusterCount >= 3) {
            coherenceScore = 30; // Scattered — low coherence
            factors.push('إجابات متعددة الاتجاهات');
        }
    }
    const factor6 = coherenceScore * 0.13;

    // Factor 7: Temporal Trajectory — NEW (10% weight)
    // Progression signals carry high clinical value
    let trajectoryScore = 50; // neutral
    const isWorsening = allValues.includes('تسوء تدريجياً');
    const isStable = allValues.some(v => v.includes('مستقرة'));
    const isImproving = allValues.some(v => v.includes('تتحسن'));
    const nothingHelps = allValues.includes('لا شيء يُحسّنها');

    if (isWorsening && nothingHelps) {
        trajectoryScore = 80; // Clear trajectory = high signal, even if bad
        factors.push('مسار زمني واضح (تدهور مستمر)');
    } else if (isWorsening) {
        trajectoryScore = 70;
        factors.push('مسار تراجعي واضح');
    } else if (isStable && answers.duration === 'months') {
        trajectoryScore = 60;
    } else if (isImproving) {
        trajectoryScore = 85;
        factors.push('تحسن ملحوظ — مسار إيجابي');
    }
    const factor7 = trajectoryScore * 0.10;

    // Total: 22% + 15% + 20% + 8% + 12% + 13% + 10% = 100%
    const rawScore = factor1 + factor2 + factor3 + factor4 + factor5 + factor6 + factor7;
    const score = Math.round(Math.min(100, Math.max(0, rawScore)));

    const label: 'high' | 'medium' | 'low' =
        score >= 75 ? 'high' : score >= 45 ? 'medium' : 'low';

    return { score, label, factors };
}

/* ══════════════════════════════════════════════════════════
   RULE C: identifyKeySignals
   Top 3 high-weight answer signals
   ══════════════════════════════════════════════════════════ */

export function identifyKeySignals(
    answers: EngineAnswers,
    triageResult: TriageResult,
): KeySignal[] {
    const signals: KeySignal[] = [];
    const allValues = Object.values(answers.clinicalAnswers).flat() as string[];

    // Score each answer by its total clinical weight
    const scored: Array<{ value: string; weight: number; dimension: KeySignal['dimension'] }> = [];

    for (const v of allValues) {
        const meta = OPTION_META[v];
        if (!meta) continue;
        const totalWeight = meta.functionalWeight + meta.somaticWeight + meta.conventionalWeight;
        if (totalWeight === 0) continue;

        const dimension: KeySignal['dimension'] =
            meta.functionalWeight >= meta.somaticWeight ? 'functional' : 'somatic';

        scored.push({ value: v, weight: totalWeight, dimension });
    }

    // Progression signals (always high value)
    const allClinical = Object.values(answers.clinicalAnswers).flat() as string[];
    if (allClinical.includes('تسوء تدريجياً')) {
        signals.push({ label: 'مسار الأعراض في تراجع مستمر', dimension: 'progression', weight: 10 });
    }
    if (allClinical.includes('لا شيء يُحسّنها')) {
        signals.push({ label: 'مقاومة كاملة للتحسّن التلقائي', dimension: 'progression', weight: 9 });
    }

    // Top functional signals
    const topFunc = scored
        .filter(s => s.dimension === 'functional')
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 2);
    for (const s of topFunc) {
        signals.push({ label: s.value, dimension: 'functional', weight: s.weight });
    }

    // Top somatic signals
    const topSom = scored
        .filter(s => s.dimension === 'somatic')
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 1);
    for (const s of topSom) {
        signals.push({ label: s.value, dimension: 'somatic', weight: s.weight });
    }

    // Severity signal — only added if fewer than 2 signals already found
    // This prevents a generic severity label from crowding out more clinically specific signals
    if (answers.severity >= 7 && signals.length < 2) {
        signals.push({ label: `شدة الأعراض مرتفعة (${answers.severity}/١٠)`, dimension: 'severity', weight: answers.severity });
    }

    // Deduplicate + sort by weight + cap at 3
    const unique = signals
        .filter((s, i, arr) => arr.findIndex(x => x.label === s.label) === i)
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 3);

    return unique;
}
