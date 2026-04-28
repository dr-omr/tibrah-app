// lib/health-engine/confidence-engine.ts
// ════════════════════════════════════════════════════════════════
// TIBRAH — Unified Assessment Confidence Engine (Phase 3)
//
// Purpose:
//   Computes a holistic confidence score that reflects *data quality*,
//   not just score separation. Builds on top of the existing
//   contradiction-engine.ts computeConfidenceModel (7-factor) by adding:
//   - Required vs optional question coverage
//   - Red flag clarity
//   - Tayyibat/meal log contribution (nutrition-only, not medical)
//   - Missing demographics
//   - Adaptive plan snapshot hints
//
// Architecture:
//   - Does NOT replace computeConfidenceModel in contradiction-engine.ts
//   - Acts as an ADDITIVE layer that wraps it with richer context
//   - The existing RoutingResult.confidenceScore is the engine score;
//     this produces a user-facing AssessmentConfidence object
//
// Rules:
//   - Meal logs improve nutrition confidence only, not global clinical confidence
//   - Emergency/urgent cases cannot be "high confidence" unless red flags are clear
//   - Missing required data always reduces confidence
//   - Output wording is Arabic-safe and non-alarming
// ════════════════════════════════════════════════════════════════

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

export type AssessmentConfidenceLabel = 'low' | 'medium' | 'high';

export interface AssessmentConfidence {
    /** 0-100 overall confidence score */
    score: number;
    label: AssessmentConfidenceLabel;
    /** Arabic phrases explaining what pushed confidence up */
    reasons: string[];
    /** Arabic list of data points that are missing */
    missingData: string[];
    /** Arabic suggestions for improving the result */
    howToImprove: string[];
    /** Internal penalty reasons (for analytics, not shown to user) */
    penalties: string[];
    /** Internal bonus reasons (for analytics, not shown to user) */
    bonuses: string[];
    /** Nutrition-specific confidence (0-100), separate from clinical */
    nutritionConfidence: number;
    /** Whether the result should be presented as preliminary */
    isPreliminary: boolean;
    /** Short Arabic note shown below the confidence strip */
    userNote: string;
}

export interface AssessmentConfidenceInput {
    pathwayId:              string;
    severity?:              number;
    duration?:              string;
    /** Number of required questions the user answered */
    answeredRequiredCount:  number;
    /** Total required questions for this pathway */
    totalRequiredCount:     number;
    /** Number of optional/deep questions answered */
    answeredOptionalCount?: number;
    totalOptionalCount?:    number;
    /** Whether red flags were explicitly ruled out or confirmed */
    redFlagClarity?:        'clear_negative' | 'clear_positive' | 'unknown';
    /** From existing contradiction-engine */
    contradictionCount?:    number;
    majorContradictionCount?: number;
    /** From routing phenotype */
    phenotypeStrength?:     number;  // 0-100
    /** From adaptive orchestrator */
    adaptiveQuestionPlanSnapshot?: {
        nutritionShown:    boolean;
        safetyPrioritized: boolean;
        deepIntakeShown:   boolean;
        foodSignalFound:   boolean;
        burdenMinimized:   boolean;
        triageRiskHint:    string;
    } | null;
    /** From tayyibatVerdict */
    tayyibatVerdict?: {
        confidenceScore:    number;
        mealLogCountUsed:   number;
        safetyGated:        boolean;
        contradictionNotes: string[];
    } | null;
    /** Number of meal log entries used in Tayyibat verdict */
    mealLogCount?:          number;
    /** Whether medical history context is linked */
    hasMedicalHistoryLinked?: boolean;
    /** Demographics that are missing but relevant */
    missingDemographics?:   string[];
    /** The existing engine confidence score (from contradiction-engine) */
    engineConfidenceScore?: number;
    /** Triage level from existing engine */
    triageLevel?:           string;
}

/* ══════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════ */

// These pathways have more required questions — lower coverage threshold
const COMPLEX_PATHWAYS = new Set([
    'fatigue', 'anxiety', 'hormonal', 'immune', 'sleep',
]);

// Required coverage thresholds
const COVERAGE_HIGH   = 0.80;
const COVERAGE_MEDIUM = 0.50;

/* ══════════════════════════════════════════════════════════
   MAIN FUNCTION
   ══════════════════════════════════════════════════════════ */

export function computeAssessmentConfidence(
    input: AssessmentConfidenceInput,
): AssessmentConfidence {
    const {
        pathwayId,
        severity               = 5,
        duration               = 'unknown',
        answeredRequiredCount,
        totalRequiredCount,
        answeredOptionalCount  = 0,
        totalOptionalCount     = 0,
        redFlagClarity         = 'unknown',
        contradictionCount     = 0,
        majorContradictionCount = 0,
        phenotypeStrength      = 0,
        adaptiveQuestionPlanSnapshot,
        tayyibatVerdict,
        mealLogCount           = 0,
        hasMedicalHistoryLinked = false,
        missingDemographics    = [],
        engineConfidenceScore,
        triageLevel            = 'manageable',
    } = input;

    const reasons:       string[] = [];
    const missingData:   string[] = [];
    const howToImprove:  string[] = [];
    const penalties:     string[] = [];
    const bonuses:       string[] = [];

    // ── Baseline: start from engine score or 50 ──────────────
    let score = engineConfidenceScore ?? 50;

    // ── Factor A: Required question coverage ─────────────────
    const coverage = totalRequiredCount > 0
        ? answeredRequiredCount / totalRequiredCount
        : 1.0;

    if (coverage >= COVERAGE_HIGH) {
        score += 10;
        reasons.push('اكتمال الإجابات المطلوبة مرتفع');
        bonuses.push('coverage_high');
    } else if (coverage >= COVERAGE_MEDIUM) {
        // No change — neutral
    } else {
        score -= 15;
        penalties.push('coverage_low');
        missingData.push('بعض أسئلة المسار الأساسية لم تُجَب');
        howToImprove.push('أجب على الأسئلة الإلزامية لرفع الدقة');
    }

    // ── Factor B: Optional/deep question bonus ────────────────
    if (totalOptionalCount > 0 && answeredOptionalCount >= 2) {
        score += 5;
        bonuses.push('optional_answered');
        reasons.push('أسئلة إضافية أضافت عمقاً للتحليل');
    } else if (totalOptionalCount > 0 && answeredOptionalCount === 0) {
        missingData.push('لم تُجَب الأسئلة الاختيارية التي تزيد الدقة');
        howToImprove.push('الإجابة على أسئلة التعمق تحسّن النتيجة');
    }

    // ── Factor C: Red flag clarity ────────────────────────────
    if (redFlagClarity === 'clear_negative') {
        score += 8;
        reasons.push('علامات الخطر غُيِّبت بشكل واضح');
        bonuses.push('red_flag_clear_negative');
    } else if (redFlagClarity === 'clear_positive') {
        // Red flags present + confirmed — high clinical signal
        score += 5;
        reasons.push('العلامات التحذيرية محددة بوضوح');
        bonuses.push('red_flag_clear_positive');
    } else {
        score -= 8;
        penalties.push('red_flag_unknown');
        missingData.push('لم يتضح وجود أو غياب علامات الخطر');
        howToImprove.push('وضّح إذا كانت العلامات التحذيرية موجودة أم لا');
    }

    // ── Factor D: Contradictions penalty ─────────────────────
    if (contradictionCount === 0) {
        score += 5;
        reasons.push('لا تناقضات في الإجابات');
        bonuses.push('no_contradictions');
    } else {
        const penalty = Math.min(20, (majorContradictionCount * 12) + ((contradictionCount - majorContradictionCount) * 5));
        score -= penalty;
        penalties.push(`contradictions_detected_${contradictionCount}`);
        if (majorContradictionCount > 0) {
            missingData.push('بعض الإجابات تتناقض وتحتاج توضيحاً');
            howToImprove.push('راجع إجاباتك للتأكد من اتساقها');
        }
    }

    // ── Factor E: Phenotype strength ─────────────────────────
    if (phenotypeStrength >= 60) {
        score += 8;
        reasons.push('نمط سريري واضح ومحدد');
        bonuses.push('phenotype_strong');
    } else if (phenotypeStrength >= 30) {
        score += 3;
    } else if (phenotypeStrength < 15 && answeredRequiredCount >= 3) {
        score -= 5;
        penalties.push('phenotype_weak');
        missingData.push('النمط السريري لم يتضح بعد');
    }

    // ── Factor F: Duration clarity ────────────────────────────
    if (duration === 'unknown' || !duration) {
        score -= 7;
        penalties.push('duration_unknown');
        missingData.push('مدة الأعراض غير محددة');
        howToImprove.push('حدّد منذ متى تعاني من هذه الأعراض');
    } else if (duration === 'months' || duration === 'years') {
        score += 4;
        reasons.push('المدة الزمنية محددة (مزمن)');
    }

    // ── Factor G: Emergency/urgent safety gate ────────────────
    // Emergency cases cannot show "high confidence" unless red flags are clear
    const isHighRisk = triageLevel === 'emergency' || triageLevel === 'urgent';
    if (isHighRisk && redFlagClarity !== 'clear_positive') {
        score = Math.min(score, 70); // cap at 70 for urgent without clarity
        penalties.push('high_triage_without_clear_flags');
    }

    // ── Factor H: Adaptive plan — burden minimized ────────────
    if (adaptiveQuestionPlanSnapshot?.burdenMinimized) {
        // Fewer questions were asked for safety reasons — acknowledge this
        missingData.push('بعض الأسئلة لم تُطرح لأن حالتك تتطلب تقييمًا سريعًا');
        howToImprove.push('بعد استقرار الحالة، أكمل التقييم التفصيلي');
        penalties.push('burden_minimized');
        score = Math.min(score, 75);
    }

    // ── Factor I: Medical history linkage ─────────────────────
    if (hasMedicalHistoryLinked) {
        score += 5;
        reasons.push('التاريخ الطبي مرتبط ويُضيف سياقاً');
        bonuses.push('medical_history_linked');
    } else if (COMPLEX_PATHWAYS.has(pathwayId)) {
        missingData.push('التاريخ الطبي والأدوية الحالية غير مدخلة');
    }

    // ── Factor J: Missing demographics ───────────────────────
    if (missingDemographics.length > 0) {
        score -= missingDemographics.length * 3;
        penalties.push(`missing_demographics_${missingDemographics.length}`);
        missingData.push(...missingDemographics.map(d => `${d} غير متوفر`));
    }

    // ── Nutrition confidence (separate from clinical) ─────────
    let nutritionConfidence = 40; // default neutral
    if (tayyibatVerdict) {
        // Start from Tayyibat engine score
        nutritionConfidence = tayyibatVerdict.confidenceScore;
        // Meal logs improve nutrition insight — they do NOT affect global clinical confidence
        if (mealLogCount >= 14) {
            nutritionConfidence = Math.min(100, nutritionConfidence + 20);
            reasons.push('سجل وجبات غني يدعم دقة الرؤية الغذائية');
        } else if (mealLogCount >= 5) {
            nutritionConfidence = Math.min(100, nutritionConfidence + 10);
        } else if (mealLogCount === 0 && adaptiveQuestionPlanSnapshot?.nutritionShown) {
            nutritionConfidence = Math.max(20, nutritionConfidence - 10);
            howToImprove.push('أضف سجل وجباتك اليومية لرفع دقة الرؤية الغذائية');
        }
        // Tayyibat contradictions slightly affect global (max -4)
        if (tayyibatVerdict.contradictionNotes.length > 0) {
            score -= Math.min(4, tayyibatVerdict.contradictionNotes.length * 2);
            penalties.push('tayyibat_contradictions');
        }
    } else if (adaptiveQuestionPlanSnapshot?.nutritionShown) {
        // Nutrition section was shown but no verdict — data incomplete
        nutritionConfidence = 25;
        missingData.push('الرؤية الغذائية أولية — لم تُكتمل بيانات الطيبات');
    }

    // ── Final score bounds ────────────────────────────────────
    score = Math.round(Math.min(100, Math.max(0, score)));

    const label: AssessmentConfidenceLabel =
        score >= 72 ? 'high' :
        score >= 45 ? 'medium' : 'low';

    // ── Preliminary flag ──────────────────────────────────────
    const isPreliminary = label === 'low' || (label === 'medium' && missingData.length >= 3);

    // ── User-facing note ─────────────────────────────────────
    let userNote: string;
    if (label === 'high') {
        userNote = 'هذه النتيجة مبنية على بيانات كافية ونمط واضح.';
    } else if (label === 'medium') {
        userNote = 'هذه النتيجة مفيدة كتوجيه أولي. إجابة أسئلة إضافية ترفع دقتها.';
    } else {
        userNote = 'هذه النتيجة مبدئية لكنها مفيدة. البيانات المتوفرة لا تزال محدودة.';
    }

    return {
        score,
        label,
        reasons,
        missingData,
        howToImprove,
        penalties,
        bonuses,
        nutritionConfidence: Math.round(Math.min(100, Math.max(0, nutritionConfidence))),
        isPreliminary,
        userNote,
    };
}
