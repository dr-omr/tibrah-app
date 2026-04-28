// lib/health-engine/adaptive-question-orchestrator.ts
// ════════════════════════════════════════════════════════════════
// TIBRAH — Adaptive Question Orchestrator (Phase 2)
//
// Purpose:
//   Decides which question stages appear for a given assessment context.
//   Single source of truth for question-burden logic.
//
// Principles:
//   - Safety always first: emergency signals suppress lifestyle questions
//   - Every question must earn its place — "reason" is required
//   - Tayyibat/nutrition gated by food signals, not pathway alone
//   - User burden capped at a sensible total
//   - Does NOT modify question content — only decides visibility
//   - Compatible with existing ADAPTIVE_FOOD_QUESTIONS & PATHWAYS
//
// Rules:
//   - No UI imports
//   - No React imports
//   - Pure decision function
// ════════════════════════════════════════════════════════════════

import {
    hasFoodRelevantSignals,
    getAdaptiveFoodQuestions,
} from '@/lib/clinical/tayyibat-adaptive-screening';
import type { AnswerValue } from '@/components/health-engine/types';

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

export type AdaptiveQuestionStage =
    | 'core_clinical'
    | 'safety'
    | 'deep_intake'
    | 'emotional'
    | 'nutrition_tayyibat'
    | 'follow_up';

export interface AdaptiveQuestionDecision {
    stage:             AdaptiveQuestionStage;
    shouldShow:        boolean;
    priority:          'critical' | 'high' | 'medium' | 'low';
    reason:            string;
    questionIds:       string[];
    maxQuestions?:     number;
    userFacingLabel?:  string;
    userFacingSubtext?: string;
}

export interface AdaptiveQuestionPlan {
    pathwayId:                string;
    severity:                 number;
    triageRiskHint:           'emergency_possible' | 'urgent_possible' | 'stable' | 'unknown';
    decisions:                AdaptiveQuestionDecision[];
    totalEstimatedQuestions:  number;
    shouldMinimizeBurden:     boolean;
    reasons:                  string[];
    /** Snapshot saved to session for result-page explanation */
    snapshot: {
        nutritionShown:   boolean;
        safetyPrioritized: boolean;
        deepIntakeShown:  boolean;
        foodSignalFound:  boolean;
        burdenMinimized:  boolean;
    };
}

/* ══════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════ */

// Pathways where emergency is highly possible — minimize non-essential questions
const EMERGENCY_RISK_PATHWAYS = new Set([
    'cardiac', 'chest', 'respiratory', 'breathing', 'stroke', 'neuro',
]);

// Pathways where urgent medical review is possible
const URGENT_RISK_PATHWAYS = new Set([
    'pain',       // severe chest pain
    'headache',   // thunderclap
    'hormonal',   // acute hormonal crisis
    'immune',     // severe immune events
]);

// Deep intake is most useful for these chronic pathways
const DEEP_INTAKE_PATHWAYS = new Set([
    'fatigue', 'sleep', 'anxiety', 'digestion', 'digestive',
    'hormonal', 'immune', 'pain', 'headache', 'joint',
]);

// Pathways where safety questions should always be shown
const SAFETY_QUESTION_PATHWAYS = new Set([
    ...EMERGENCY_RISK_PATHWAYS,
    ...URGENT_RISK_PATHWAYS,
    'fatigue', 'headache', 'sleep',
]);

/**
 * Pathways that are "minimal by default" for nutrition — they do NOT
 * permanently block nutrition questions. If strong food/lifestyle signals
 * are explicitly present (e.g., bloating + sugar crash + fatigue after eating),
 * a minimal optional nutrition section is allowed.
 *
 * These pathways NEVER get the full Tayyibat deep-flow — max 2-3 questions.
 * Changed from Phase 2's "impossible" rule per clinical review:
 * dental/vision are localized complaints but the PATIENT is systemic.
 */
const MINIMAL_BY_DEFAULT_PATHWAYS = new Set([
    'dental', 'vision', 'optic',
]);

// Strong food/lifestyle signal keywords that can unlock minimal nutrition
// for minimal-by-default pathways
const STRONG_FOOD_UNLOCK_SIGNALS = [
    'إرهاق بعد الأكل', 'post-meal', 'انتفاخ', 'bloating',
    'سكر', 'sugar', 'حموضة', 'ارتجاع', 'reflux',
    'إمساك', 'constipation', 'غازات', 'gas',
    'رغبة في الحلو', 'قهوة', 'كافيين', 'caffeine',
    'وجبات عشوائية', 'عشاء متأخر', 'أرق', 'نوم سيئ',
];



// Max total questions before minimizing burden
const BURDEN_THRESHOLD = 12;

/* ══════════════════════════════════════════════════════════
   TRIAGE RISK HINT
   ══════════════════════════════════════════════════════════ */

function assessTriageRiskHint(
    pathwayId: string,
    severity:  number,
    hasRedFlag: boolean,
): AdaptiveQuestionPlan['triageRiskHint'] {
    if (hasRedFlag || severity >= 9) return 'emergency_possible';
    if (EMERGENCY_RISK_PATHWAYS.has(pathwayId)) return 'emergency_possible';
    if (URGENT_RISK_PATHWAYS.has(pathwayId) && severity >= 7) return 'urgent_possible';
    if (severity >= 6 || URGENT_RISK_PATHWAYS.has(pathwayId)) return 'urgent_possible';
    if (severity >= 3) return 'stable';
    return 'unknown';
}

/* ══════════════════════════════════════════════════════════
   SAFETY STAGE DECISION
   ══════════════════════════════════════════════════════════ */

function decideSafetyStage(
    pathwayId:  string,
    severity:   number,
    hasRedFlag: boolean,
    triageHint: AdaptiveQuestionPlan['triageRiskHint'],
): AdaptiveQuestionDecision {
    // Safety is CRITICAL only when there is an explicit red flag or emergency signal
    // It should NOT be critical just because the pathway is 'fatigue' or 'headache'
    // without a red flag — those become 'high' priority only
    const isCritical =
        hasRedFlag ||
        severity >= 9 ||
        triageHint === 'emergency_possible';

    const shouldShow =
        isCritical ||
        severity >= 8 ||
        SAFETY_QUESTION_PATHWAYS.has(pathwayId);

    return {
        stage:      'safety',
        shouldShow,
        priority:   isCritical ? 'critical' : shouldShow ? 'high' : 'low',
        reason:     isCritical
            ? `علامة خطر أو حالة طارئة — أسئلة السلامة بأعلى أولوية`
            : shouldShow
            ? `مسار ${pathwayId} مع شدة ${severity} يستلزم مراجعة علامات الخطر`
            : `الحالة مستقرة — أسئلة السلامة اختيارية`,
        questionIds:      shouldShow ? ['safety_red_flags', 'safety_emergency_check'] : [],
        maxQuestions:     shouldShow ? 3 : 0,
        userFacingLabel:  shouldShow ? 'نقاط تحتاج تقييمًا سريعًا' : undefined,
    };
}

/* ══════════════════════════════════════════════════════════
   CORE CLINICAL STAGE DECISION
   ══════════════════════════════════════════════════════════ */

function decideCoreClinicalStage(pathwayId: string): AdaptiveQuestionDecision {
    // Core clinical always shows — these are the non-negotiable pathway questions
    return {
        stage:      'core_clinical',
        shouldShow: true,
        priority:   'critical',
        reason:     `أسئلة المسار الأساسية — دائمًا ضرورية لدقة التقييم`,
        questionIds: [`pathway_${pathwayId}_core`],
        userFacingLabel: 'أسئلة عن أعراضك',
    };
}

/* ══════════════════════════════════════════════════════════
   DEEP INTAKE STAGE DECISION
   ══════════════════════════════════════════════════════════ */

function decideDeepIntakeStage(
    pathwayId:      string,
    severity:       number,
    duration:       string,
    triageHint:     AdaptiveQuestionPlan['triageRiskHint'],
    existingAnswers: Record<string, AnswerValue>,
): AdaptiveQuestionDecision {
    // Emergency possible → skip deep intake (user needs quick path)
    if (triageHint === 'emergency_possible') {
        return {
            stage:      'deep_intake',
            shouldShow: false,
            priority:   'low',
            reason:     'حالة طارئة محتملة — نُقلّل الأسئلة ونُسرّع التوجيه',
            questionIds: [],
        };
    }

    const isChronicPathway   = DEEP_INTAKE_PATHWAYS.has(pathwayId);
    const isChronicDuration  = duration === 'months' || duration === 'weeks';
    const isModerateSevere   = severity >= 5;
    const hasLimitedAnswers  = Object.keys(existingAnswers).length < 2;

    const shouldShow = isChronicPathway && (
        isChronicDuration || isModerateSevere || hasLimitedAnswers
    );

    return {
        stage:      'deep_intake',
        shouldShow,
        priority:   shouldShow ? 'high' : 'low',
        reason:     shouldShow
            ? `مسار مزمن (${pathwayId}) مع شدة ${severity} يستفيد من أسئلة أعمق`
            : `الحالة لا تتطلب تعمقاً إضافياً حتى الآن`,
        questionIds:      shouldShow ? ['deep_history', 'deep_patterns', 'deep_triggers'] : [],
        maxQuestions:     shouldShow ? 3 : 0,
        userFacingLabel:  shouldShow ? 'أسئلة إضافية لفهم أعمق' : undefined,
        userFacingSubtext: shouldShow
            ? 'تساعدنا في رسم صورة أدق — اختياري لكن مفيد'
            : undefined,
    };
}

/* ══════════════════════════════════════════════════════════
   EMOTIONAL STAGE DECISION
   ══════════════════════════════════════════════════════════ */

function decideEmotionalStage(
    triageHint: AdaptiveQuestionPlan['triageRiskHint'],
    severity:   number,
): AdaptiveQuestionDecision {
    // Emergency → emotional section becomes minimal/secondary
    const shouldShow = triageHint !== 'emergency_possible';
    const isMinimal  = triageHint === 'urgent_possible' || severity >= 8;

    return {
        stage:      'emotional',
        shouldShow,
        priority:   isMinimal ? 'medium' : 'high',
        reason:     shouldShow
            ? isMinimal
                ? 'سؤال واحد عن السياق العاطفي — سريع وغير مُثقل'
                : 'السياق العاطفي جزء أساسي من التقييم الشامل'
            : 'حالة طارئة — السياق العاطفي يؤجَّل',
        questionIds:     shouldShow ? ['emotional_context'] : [],
        maxQuestions:    isMinimal ? 1 : 4,
        userFacingLabel: shouldShow ? 'السياق العاطفي والنفسي' : undefined,
    };
}

/* ══════════════════════════════════════════════════════════
   NUTRITION / TAYYIBAT STAGE DECISION
   ══════════════════════════════════════════════════════════ */

// Lightweight fallback questions for minimal-by-default pathways
// These bypass tayyibat-adaptive-screening.ts STRICT_MINIMAL_PATHWAYS gating
const MINIMAL_PATHWAY_FALLBACK_QUESTIONS = [
    { id: 'af_bloating',      label: 'هل تشعر بانتفاخ بعد الأكل؟' },
    { id: 'af_sugar_craving', label: 'هل تشتهي الحلويات يومياً؟' },
];

function decideNutritionStage(
    pathwayId:       string,
    severity:        number,
    clinicalAnswers: Record<string, AnswerValue>,
    triageHint:      AdaptiveQuestionPlan['triageRiskHint'],
): AdaptiveQuestionDecision {
    // Emergency → no nutrition questions
    if (triageHint === 'emergency_possible') {
        return {
            stage:      'nutrition_tayyibat',
            shouldShow: false,
            priority:   'low',
            reason:     'حالة طارئة محتملة — أسئلة التغذية تُؤجَّل للنتيجة',
            questionIds: [],
        };
    }

    // Flatten answers for signal detection
    const flat = Object.values(clinicalAnswers)
        .map(v => Array.isArray(v) ? v.join(' ') : String(v ?? ''))
        .join(' ').toLowerCase();

    // ── Minimal-by-default pathways (dental/vision/optic) ──────
    // Phase 3 correction: not permanently blocked, but minimal unless strong signals
    if (MINIMAL_BY_DEFAULT_PATHWAYS.has(pathwayId)) {
        const hasStrongFoodSignal = STRONG_FOOD_UNLOCK_SIGNALS.some(
            sig => flat.includes(sig.toLowerCase())
        );

        if (!hasStrongFoodSignal) {
            return {
                stage:           'nutrition_tayyibat',
                shouldShow:      false,
                priority:        'low',
                reason:          `مسار ${pathwayId} — لا توجد إشارات غذائية قوية تستدعي أسئلة التغذية`,
                questionIds:     [],
                userFacingLabel: undefined,
            };
        }

        // Strong signals exist → show minimal section using fallback questions
        // We do NOT call getAdaptiveFoodQuestions because STRICT_MINIMAL_PATHWAYS
        // in tayyibat-adaptive-screening.ts would return [] for dental/vision/optic.
        // Instead we provide 2 lightweight screening questions directly.
        const minimalQIds = MINIMAL_PATHWAY_FALLBACK_QUESTIONS.map(q => q.id);
        return {
            stage:             'nutrition_tayyibat',
            shouldShow:        true,
            priority:          'low',
            reason:            `رغم أن المسار ${pathwayId} محدود غذائياً، إشاراتك تستحق سؤالين اختياريين`,
            questionIds:       minimalQIds,
            maxQuestions:      2,
            userFacingLabel:   'رؤية غذائية اختيارية',
            userFacingSubtext: 'هذه الأسئلة اختيارية — تظهر بناءً على إشارات في إجاباتك.',
        };
    }

    // ── Standard pathways: signal-based gating ──────────────
    // For pathways like 'anxiety' that have no inherent food signals,
    // hasFoodRelevantSignals returns true when answer text contains keywords,
    // but getAdaptiveFoodQuestions may still return [] if the triggerKey matching
    // fails (no pathway-specific signal pool). We detect this and use flat text directly.
    const foodSignalFound = hasFoodRelevantSignals(pathwayId, severity, clinicalAnswers);

    if (!foodSignalFound) {
        return {
            stage:           'nutrition_tayyibat',
            shouldShow:      false,
            priority:        'low',
            reason:          'لا توجد إشارات غذائية كافية في الإجابات',
            questionIds:     [],
            userFacingLabel: undefined,
        };
    }

    // Food signal found — get adaptive questions.
    // Use maxQuestions=5 but allow fallback if getAdaptiveFoodQuestions returns empty
    // (can happen for signal-only pathways like 'anxiety' when signalPool doesn't match triggerKeys)
    let adaptiveQs = getAdaptiveFoodQuestions(pathwayId, severity, clinicalAnswers, 5);

    // Fallback: if signal detected but questions returned empty, use the 2 most universal questions
    if (adaptiveQs.length === 0) {
        const UNIVERSAL_QUESTION_IDS = ['af_energy_crash', 'af_sugar_craving', 'af_meal_timing'];
        adaptiveQs = getAdaptiveFoodQuestions('fatigue', severity, clinicalAnswers, 3)
            .filter(q => UNIVERSAL_QUESTION_IDS.includes(q.id))
            .slice(0, 2);

        if (adaptiveQs.length === 0) {
            // Final fallback: return minimal question IDs directly
            return {
                stage:             'nutrition_tayyibat',
                shouldShow:        true,
                priority:          'medium',
                reason:            `إشارات غذائية موجودة في الإجابات`,
                questionIds:       ['af_energy_crash', 'af_sugar_craving'],
                maxQuestions:      2,
                userFacingLabel:   'الغذاء والإيقاع ضمن تقييمك',
                userFacingSubtext: 'ظهرت هذه الأسئلة لأن إجاباتك تشير إلى أن الغذاء قد يؤثر على نمط الأعراض.',
            };
        }
    }

    if (adaptiveQs.length === 0) {
        return {
            stage:           'nutrition_tayyibat',
            shouldShow:      false,
            priority:        'low',
            reason:          'لا توجد أسئلة غذائية مناسبة للحالة',
            questionIds:     [],
            userFacingLabel: undefined,
        };
    }

    // Build reason explaining WHY nutrition appeared
    const reasonParts: string[] = [];
    if (flat.includes('انتفاخ') || flat.includes('bloating'))                          reasonParts.push('انتفاخ');
    if (flat.includes('هبوط') || flat.includes('post-meal') || flat.includes('بعد الأكل')) reasonParts.push('هبوط طاقة بعد الأكل');
    if (flat.includes('سكر') || flat.includes('sugar') || flat.includes('حلو'))        reasonParts.push('رغبة في السكر');
    if (flat.includes('كافيين') || flat.includes('coffee') || flat.includes('قهوة')) reasonParts.push('كافيين مرتفع');
    if (flat.includes('نوم') || flat.includes('sleep') || flat.includes('أرق'))        reasonParts.push('اضطراب النوم');
    if (flat.includes('إمساك') || flat.includes('constipation'))                       reasonParts.push('إمساك');
    if (flat.includes('ارتجاع') || flat.includes('reflux'))                            reasonParts.push('حموضة أو ارتجاع');

    const reason = reasonParts.length > 0
        ? `ظهرت هذه الأسئلة لأن إجاباتك تشير إلى: ${reasonParts.join('، ')}`
        : `إجاباتك تحتوي على إشارات غذائية تستحق الفهم الأعمق`;

    return {
        stage:      'nutrition_tayyibat',
        shouldShow: true,
        priority:   'medium',
        reason,
        questionIds:       adaptiveQs.map(q => q.id),
        maxQuestions:      adaptiveQs.length,
        userFacingLabel:   'الغذاء والإيقاع ضمن تقييمك',
        userFacingSubtext: 'ظهرت هذه الأسئلة لأن إجاباتك تشير إلى أن الغذاء أو توقيت الوجبات قد يؤثران على نمط الأعراض. هذه ليست تشخيصًا غذائيًا، بل طبقة فهم إضافية.',
    };
}



/* ══════════════════════════════════════════════════════════
   MAIN EXPORT — buildAdaptiveQuestionPlan
   ══════════════════════════════════════════════════════════ */

export interface AdaptiveQuestionPlanInput {
    pathwayId:         string;
    severity?:         number;
    duration?:         string;
    existingAnswers:   Record<string, AnswerValue>;
    clinicalAnswers?:  Record<string, AnswerValue>;
    emotionalAnswer?:  string | null;
    hasRedFlagSignal?: boolean;
    userKnownTayyibat?: boolean;
}

export function buildAdaptiveQuestionPlan(
    input: AdaptiveQuestionPlanInput,
): AdaptiveQuestionPlan {
    const {
        pathwayId,
        severity        = 5,
        duration        = 'unknown',
        existingAnswers = {},
        clinicalAnswers  = existingAnswers,
        hasRedFlagSignal = false,
    } = input;

    const reasons: string[] = [];

    // ── Step 1: Triage risk hint ──────────────────────────────
    const triageRiskHint = assessTriageRiskHint(pathwayId, severity, hasRedFlagSignal);

    const shouldMinimizeBurden =
        triageRiskHint === 'emergency_possible' ||
        (triageRiskHint === 'urgent_possible' && severity >= 8);

    if (shouldMinimizeBurden) {
        reasons.push('لم نُطِل الأسئلة لأن حالتك تحتاج توجيهًا سريعًا');
    }

    // ── Step 2: Build each stage decision ────────────────────
    const safety       = decideSafetyStage(pathwayId, severity, hasRedFlagSignal, triageRiskHint);
    const core         = decideCoreClinicalStage(pathwayId);
    const deepIntake   = decideDeepIntakeStage(pathwayId, severity, duration, triageRiskHint, existingAnswers);
    const emotional    = decideEmotionalStage(triageRiskHint, severity);
    const nutrition    = decideNutritionStage(pathwayId, severity, clinicalAnswers, triageRiskHint);

    const decisions: AdaptiveQuestionDecision[] = [
        safety,
        core,
        deepIntake,
        emotional,
        nutrition,
    ];

    // ── Step 3: Count total questions ────────────────────────
    const totalEstimatedQuestions = decisions
        .filter(d => d.shouldShow)
        .reduce((sum, d) => sum + (d.maxQuestions ?? d.questionIds.length), 0);

    // ── Step 4: Enforce burden cap ───────────────────────────
    if (totalEstimatedQuestions > BURDEN_THRESHOLD && !shouldMinimizeBurden) {
        // If over threshold, cap nutrition to 3 and drop follow-up
        if (nutrition.shouldShow && nutrition.maxQuestions && nutrition.maxQuestions > 3) {
            nutrition.maxQuestions = 3;
            nutrition.questionIds  = nutrition.questionIds.slice(0, 3);
            reasons.push('حصرنا الأسئلة الغذائية في ٣ فقط — يمكن الاستزادة من التقرير');
        }
    }

    // ── Step 5: Build reason for nutrition appearance ────────
    if (nutrition.shouldShow) {
        reasons.push(nutrition.reason);
    } else if (triageRiskHint !== 'emergency_possible') {
        reasons.push('الرؤية الغذائية أولية لأنك لم تُدخل إشارات غذائية كافية');
    }

    const snapshot: AdaptiveQuestionPlan['snapshot'] = {
        nutritionShown:    nutrition.shouldShow,
        safetyPrioritized: safety.shouldShow,
        deepIntakeShown:   deepIntake.shouldShow,
        foodSignalFound:   hasFoodRelevantSignals(pathwayId, severity, clinicalAnswers),
        burdenMinimized:   shouldMinimizeBurden,
    };

    return {
        pathwayId,
        severity,
        triageRiskHint,
        decisions,
        totalEstimatedQuestions,
        shouldMinimizeBurden,
        reasons,
        snapshot,
    };
}

/* ══════════════════════════════════════════════════════════
   HELPER — get a specific stage decision from a plan
   ══════════════════════════════════════════════════════════ */

export function getStageDecision(
    plan:  AdaptiveQuestionPlan,
    stage: AdaptiveQuestionStage,
): AdaptiveQuestionDecision | undefined {
    return plan.decisions.find(d => d.stage === stage);
}

export function stageIsVisible(
    plan:  AdaptiveQuestionPlan,
    stage: AdaptiveQuestionStage,
): boolean {
    return getStageDecision(plan, stage)?.shouldShow ?? false;
}
