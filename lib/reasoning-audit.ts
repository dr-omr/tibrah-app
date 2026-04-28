// lib/reasoning-audit.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Reasoning Audit + Observability + Protocol Match Precision
// ════════════════════════════════════════════════════════════════════════
//
// Phase 2: Audit utilities — detect false certainty in engine outputs
// Phase 3: Observability — internal metric events for analytics
// Phase 4: Protocol match precision — primary + secondary + rationale
//
// Rules:
//   - No scoring thresholds modified
//   - No routing logic changed
//   - Read-only analysis layer on top of existing engine output
// ════════════════════════════════════════════════════════════════════════

import type { RoutingResult, EngineAnswers, TriageResult } from '@/components/health-engine/types';
import type { ContradictionFlag } from '@/lib/contradiction-engine';

/* ══════════════════════════════════════════════════════════
   PHASE 2 — REASONING AUDIT
   Detect false certainty patterns
   ══════════════════════════════════════════════════════════ */

export type AuditFlag =
    | 'FALSE_HIGH_CONFIDENCE'       // High confidence but low data / high ambiguity
    | 'WEAK_PHENOTYPE_WITH_STRONG_LABEL'  // matchScore < 25 but label is shown
    | 'CONTRADICTION_UNDER_DETECTED'  // Signals suggest contradictions but none found
    | 'OVER_EXPLAINING_LOW_DATA'      // Rich explanation text but very few answers
    | 'ESCALATION_INCONSISTENCY';     // Worsening/flags present but no escalation

export interface AuditResult {
    flag: AuditFlag;
    severity: 'critical' | 'warning' | 'info';
    message: string;
    recommendation: string;
}

export function auditReasoningOutput(
    answers: EngineAnswers,
    triageResult: TriageResult,
    routing: RoutingResult,
    contradictions: ContradictionFlag[],
): AuditResult[] {
    const results: AuditResult[] = [];
    const answeredCount = Object.keys(answers.clinicalAnswers).length;
    const allValues = Object.values(answers.clinicalAnswers).flat() as string[];

    // ── Audit 1: False high confidence ──
    // High confidence badge with low answer completeness or high contradictions
    if (
        routing.confidence === 'high' &&
        (answeredCount < 2 || contradictions.some(c => c.severity === 'high'))
    ) {
        results.push({
            flag: 'FALSE_HIGH_CONFIDENCE',
            severity: 'critical',
            message: `Confidence labeled 'high' but only ${answeredCount} questions answered with ${contradictions.length} contradiction(s)`,
            recommendation: 'Lower confidence band threshold or add minimum answer completeness requirement',
        });
    }

    // ── Audit 2: Weak phenotype with strong label shown ──
    // If phenotype matchScore is very low, the label may mislead the user
    if (routing.phenotype.matchScore < 20 && routing.phenotype.label !== '') {
        results.push({
            flag: 'WEAK_PHENOTYPE_WITH_STRONG_LABEL',
            severity: 'warning',
            message: `Phenotype '${routing.phenotype.id}' shown with match score ${routing.phenotype.matchScore}%`,
            recommendation: 'Hide or soften phenotype label when matchScore < 20. Consider showing "نمط غير محدد بعد" instead',
        });
    }

    // ── Audit 3: Contradiction under-detection ──
    // Worsening + high severity + near-manageable triage with no contradictions flagged
    const isWorsening = allValues.includes('تسوء تدريجياً');
    const nothingHelps = allValues.includes('لا شيء يُحسّنها');
    if (
        answers.severity >= 7 &&
        isWorsening &&
        contradictions.length === 0 &&
        triageResult.level !== 'urgent'
    ) {
        results.push({
            flag: 'CONTRADICTION_UNDER_DETECTED',
            severity: 'warning',
            message: `Severity ${answers.severity} + worsening trajectory + no contradictions flagged — possible C2 miss`,
            recommendation: 'Review C2 rule threshold: add check for severity >= 7 + worsening as standalone contradiction',
        });
    }

    // ── Audit 4: Over-explaining low-data cases ──
    // Rich clinical explanation generated but very few answers were given
    if (answeredCount < 2 && routing.clinical_explanation.length > 80) {
        results.push({
            flag: 'OVER_EXPLAINING_LOW_DATA',
            severity: 'info',
            message: `Detailed explanation generated with only ${answeredCount} answer(s)`,
            recommendation: 'Consider a minimal explanation fallback when answeredCount < 2',
        });
    }

    // ── Audit 5: Escalation inconsistency ──
    // Red flags present or worsening+chronic + severity >= 7 but not escalated
    if (
        answers.redFlags.length > 0 &&
        !answers.hasEmergencyFlag &&
        !routing.escalation_needed
    ) {
        results.push({
            flag: 'ESCALATION_INCONSISTENCY',
            severity: 'critical',
            message: `${answers.redFlags.length} red flag(s) detected but escalation_needed = false`,
            recommendation: 'Red flag presence with any triage level should trigger escalation_needed = true',
        });
    }

    return results;
}

/* ══════════════════════════════════════════════════════════
   PHASE 3 — OBSERVABILITY
   Internal metric events for analytics
   ══════════════════════════════════════════════════════════ */

export interface ReasoningMetricEvent {
    event: string;
    properties: Record<string, string | number | boolean>;
}

/**
 * Generates all observability events for a completed assessment.
 * These events are designed to feed into the existing analytics system
 * (trackEvent calls in StepResult.tsx).
 */
export function buildReasoningMetrics(
    answers: EngineAnswers,
    triageResult: TriageResult,
    routing: RoutingResult,
    contradictions: ContradictionFlag[],
    auditResults: AuditResult[],
): ReasoningMetricEvent[] {
    const events: ReasoningMetricEvent[] = [];

    // ── Phenotype frequency tracking ──
    events.push({
        event: 'reasoning_phenotype_inferred',
        properties: {
            pathway:       answers.pathwayId,
            phenotype_id:  routing.phenotype.id,
            match_score:   routing.phenotype.matchScore,
            is_confident:  routing.phenotype.matchScore >= 50,
        },
    });

    // ── Confidence distribution ──
    events.push({
        event: 'reasoning_confidence_computed',
        properties: {
            pathway:          answers.pathwayId,
            confidence_band:  routing.confidence,
            confidence_score: routing.confidenceScore,
            factors_count:    routing.confidenceFactors.length,
            factors:          routing.confidenceFactors.join(' | '),
        },
    });

    // ── Contradiction frequency ──
    if (contradictions.length > 0) {
        events.push({
            event: 'reasoning_contradiction_detected',
            properties: {
                pathway:             answers.pathwayId,
                contradiction_count: contradictions.length,
                contradiction_ids:   contradictions.map(c => c.id).join(','),
                highest_severity:    contradictions.some(c => c.severity === 'high') ? 'high'
                    : contradictions.some(c => c.severity === 'medium') ? 'medium' : 'low',
            },
        });
    }

    // ── Low confidence rate ──
    if (routing.confidence === 'low') {
        events.push({
            event: 'reasoning_low_confidence',
            properties: {
                pathway:          answers.pathwayId,
                confidence_score: routing.confidenceScore,
                answered_count:   Object.keys(answers.clinicalAnswers).length,
                severity:         answers.severity,
                duration:         answers.duration,
            },
        });
    }

    // ── Audit flag tracking ──
    for (const audit of auditResults) {
        events.push({
            event: 'reasoning_audit_flag',
            properties: {
                pathway:         answers.pathwayId,
                flag:            audit.flag,
                audit_severity:  audit.severity,
            },
        });
    }

    // ── Key signal tracking ──
    events.push({
        event: 'reasoning_key_signals',
        properties: {
            pathway:       answers.pathwayId,
            signal_count:  routing.key_signals.length,
            signals:       routing.key_signals.map(s => `${s.dimension}:${s.label.slice(0, 30)}`).join(' | '),
            top_dimension: routing.key_signals[0]?.dimension ?? 'none',
        },
    });

    // ── Escalation tracking ──
    events.push({
        event: 'reasoning_escalation',
        properties: {
            pathway:            answers.pathwayId,
            escalation_needed:  routing.escalation_needed,
            triage_level:       triageResult.level,
            triage_score:       triageResult.score,
            has_red_flags:      answers.redFlags.length > 0,
            is_worsening:       Object.values(answers.clinicalAnswers).flat().includes('تسوء تدريجياً'),
        },
    });

    return events;
}

/**
 * Dispatch all reasoning metric events through the existing analytics layer.
 * Call this in StepResult after routing is computed.
 */
export function dispatchReasoningMetrics(
    events: ReasoningMetricEvent[],
    trackFn: (event: string, props: Record<string, string | number | boolean>) => void,
): void {
    for (const e of events) {
        try {
            trackFn(e.event, e.properties);
        } catch {
            // Silent — analytics must never crash the UI
        }
    }
}

/* ══════════════════════════════════════════════════════════
   PHASE 4 — PROTOCOL MATCH PRECISION
   Primary + secondary protocol candidate + match rationale
   ══════════════════════════════════════════════════════════ */

export interface ProtocolMatchResult {
    /** Primary recommended protocol ID from routing tools */
    primaryProtocolId: string;
    /** 0-100 match score for primary protocol */
    primaryMatchScore: number;
    /** Arabic rationale for why this protocol fits */
    primaryRationale: string;
    /** Fallback protocol ID if confidence is medium/low */
    secondaryProtocolId: string;
    /** Arabic rationale for secondary candidate */
    secondaryRationale: string;
    /** Whether a second opinion protocol is recommended */
    showSecondaryCandidate: boolean;
}

// Protocol match rules per pathway
const PATHWAY_PROTOCOL_RATIONALE: Record<string, {
    primary: string;
    secondary: string;
    match_signals: string[];  // Answer strings that boost match score
}> = {
    fatigue: {
        primary: 'تقييم الطاقة الوظيفي',
        secondary: 'بروتوكول الدعم النفسي-الجسدي',
        match_signals: ['أستيقظ منهكاً', 'هبوط طاقة منتصف النهار', 'تسوء بالضغط النفسي'],
    },
    headache: {
        primary: 'بروتوكول الصداع والشقيقة',
        secondary: 'بروتوكول إدارة التوتر',
        match_signals: ['نبضات من جانب واحد', 'تسوء مع الضوء والأصوات', 'ضغط حول الرأس'],
    },
    digestion: {
        primary: 'بروتوكول صحة الجهاز الهضمي',
        secondary: 'بروتوكول المحور العصبي-المعوي',
        match_signals: ['الأمعاء تنفعل في مواقف الإجبار', 'انتفاخ بعد الأكل', 'حرقة أو ارتجاع'],
    },
    sleep: {
        primary: 'بروتوكول تحسين النوم',
        secondary: 'بروتوكول التنظيم العصبي',
        match_signals: ['العقل يظل نشطاً عند النوم', 'شاشات حتى وقت النوم', 'أنام ثم أستيقظ مرات'],
    },
    pain: {
        primary: 'بروتوكول إدارة الألم المزمن',
        secondary: 'بروتوكول العلاج الجسدي-النفسي',
        match_signals: ['صباحي يتحسن بالحركة', 'مستمر لا يتوقف', 'يتحسن بالتدليك أو اللمس'],
    },
    anxiety: {
        primary: 'بروتوكول التنظيم العاطفي',
        secondary: 'بروتوكول الجهاز العصبي اللاإرادي',
        match_signals: ['نوبات مفاجئة من الخوف', 'قلق مستمر والتفكير لا يتوقف', 'تعلّمت القلق في بيئة غير آمنة'],
    },
    hormonal: {
        primary: 'بروتوكول التوازن الهرموني',
        secondary: 'بروتوكول دعم الكظريتين',
        match_signals: ['TSH مرتفع أو منخفض', 'اضطراب الدورة الشهرية', 'الاضطراب الهرموني بدأ بعد إجهاد'],
    },
    immune: {
        primary: 'بروتوكول دعم المناعة',
        secondary: 'بروتوكول الاستجابة الالتهابية',
        match_signals: ['نزلات برد وعدوى متكررة', 'أمراض مناعية ذاتية', 'أمرض بعد كل إجازة أو راحة'],
    },
};

export function computeProtocolMatch(
    answers: EngineAnswers,
    routing: RoutingResult,
): ProtocolMatchResult {
    const allValues = Object.values(answers.clinicalAnswers).flat() as string[];
    const pathwayDef = PATHWAY_PROTOCOL_RATIONALE[answers.pathwayId];

    // Find primary protocol tool from routing
    const primaryTool = routing.recommended_tools.find(t => t.type === 'protocol');
    const primaryProtocolId = primaryTool?.id ?? answers.pathwayId + '_protocol';

    // Find fallback protocol from second tool or use pathway default
    const allTools = routing.recommended_tools;
    const secondaryTool = allTools.find(t => t.type === 'workshop' || t.type === 'practice');
    const secondaryProtocolId = secondaryTool?.id ?? '';

    if (!pathwayDef) {
        return {
            primaryProtocolId,
            primaryMatchScore: 50,
            primaryRationale: 'البروتوكول مختار بناءً على المسار المحدد',
            secondaryProtocolId,
            secondaryRationale: 'بديل تكميلي مناسب للنمط الثانوي',
            showSecondaryCandidate: routing.confidence === 'low',
        };
    }

    // Match signals count
    const signalMatches = pathwayDef.match_signals.filter(s => allValues.includes(s)).length;
    const signalMatchPct = Math.round((signalMatches / Math.max(1, pathwayDef.match_signals.length)) * 100);

    // Blend with routing confidence score
    const primaryMatchScore = Math.round((signalMatchPct * 0.6) + (routing.confidenceScore * 0.4));

    const primaryRationale = signalMatches >= 2
        ? `${signalMatches} إشارات محددة من إجاباتك تتوافق مع ${pathwayDef.primary} بشكل مباشر`
        : `تم اختيار ${pathwayDef.primary} بناءً على المسار العام والنمط الوظيفي`;

    const secondaryRationale = routing.confidence !== 'high'
        ? `لأن الثقة في التوجيه ${routing.confidence === 'medium' ? 'متوسطة' : 'منخفضة'}، ${pathwayDef.secondary} يُوفّر دعماً تكميلياً مهماً`
        : `${pathwayDef.secondary} كخيار ثانٍ إذا لم يستجب النمط للبروتوكول الأول`;

    return {
        primaryProtocolId,
        primaryMatchScore,
        primaryRationale,
        secondaryProtocolId,
        secondaryRationale,
        showSecondaryCandidate: routing.confidence !== 'high' || primaryMatchScore < 60,
    };
}
