// lib/health-engine/triage-refinement.ts
// ════════════════════════════════════════════════════════════════
// TIBRAH — Triage Refinement Layer (Phase 3)
//
// Purpose:
//   Wraps the existing computeTriage() output with safer clinical rules.
//   Does NOT rewrite computeTriage — acts as a post-processing refinement.
//
// Rules:
//   - emergency/urgent always dominate
//   - Nutrition/Tayyibat NEVER downgrades emergency/urgent
//   - Chronic severe but non-red-flag → needs_doctor or review, not emergency
//   - Lifestyle questions allowed only when safe
//   - Nutrition questions allowed only when not emergency
//   - True high-risk red flags list is explicit and conservative
// ════════════════════════════════════════════════════════════════

import type { AssessmentContradiction } from './contradiction-engine';

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

export type RefinedTriageLevel =
    | 'emergency'
    | 'urgent'
    | 'needs_doctor'
    | 'review'
    | 'manageable';

export interface RefinedTriage {
    level:               RefinedTriageLevel;
    /** Arabic clinical reason for this triage level */
    reason:              string;
    /** Key signals that determined this level */
    dominantSignals:     string[];
    /** Safety message — null if not urgent */
    safetyMessage:       string | null;
    /** Whether lifestyle/wellness questions are appropriate */
    lifestyleAllowed:    boolean;
    /** Whether nutrition/Tayyibat questions are appropriate */
    nutritionAllowed:    boolean;
    /** Arabic recommended next action */
    recommendedAction:   string;
    /** Whether the refinement changed the base triage */
    wasRefined:          boolean;
    /** What the base triage level was before refinement */
    baseLevelWas:        string;
}

export interface TriageRefinementInput {
    baseTriage: {
        level:   string;
        score:   number;
    };
    pathwayId:           string;
    severity?:           number;
    answers:             Record<string, unknown>;
    explicitRedFlags?:   string[];
    contradictions?:     AssessmentContradiction[];
}

/* ══════════════════════════════════════════════════════════
   TRUE HIGH-RISK RED FLAGS
   These are the only signals that can trigger emergency level
   without explicit hasEmergencyFlag=true
   ══════════════════════════════════════════════════════════ */

const TRUE_HIGH_RISK_RED_FLAGS = [
    'ألم صدر شديد', 'chest pain',
    'ضيق تنفس شديد', 'severe shortness of breath',
    'إغماء', 'loss of consciousness', 'syncope',
    'دم في البراز', 'blood in stool',
    'فقدان وزن غير مبرر', 'unexplained weight loss',
    'قيء متواصل', 'persistent vomiting',
    'ألم بطن شديد', 'severe abdominal pain',
    'حمى مستمرة', 'persistent fever',
    'فقر دم غير مبرر', 'unexplained anemia',
    'صعوبة بلع', 'difficulty swallowing',
    'صداع مفاجئ شديد', 'thunderclap headache',
    'ضعف شديد مفاجئ في طرف', 'focal neurological',
    'جفاف شديد', 'severe dehydration',
    'تنميل وجه أو طرف', 'facial numbness',
];

// Pathways where emergency is structurally unlikely
const NON_EMERGENCY_PATHWAYS = new Set([
    'dental', 'vision', 'optic', 'skin', 'hair',
]);

/* ══════════════════════════════════════════════════════════
   MAIN FUNCTION
   ══════════════════════════════════════════════════════════ */

export function refineTriage(
    input: TriageRefinementInput,
): RefinedTriage {
    const {
        baseTriage,
        pathwayId,
        severity            = 5,
        answers,
        explicitRedFlags    = [],
        contradictions      = [],
    } = input;

    const baseLevel   = baseTriage.level as RefinedTriageLevel;
    const dominantSignals: string[] = [];
    let   level       = baseLevel;
    let   wasRefined  = false;

    // Flatten all answer text
    const flatAnswers = Object.values(answers)
        .flatMap(v => Array.isArray(v) ? v : [String(v ?? '')])
        .map(s => String(s).toLowerCase());

    // Check for true high-risk signals in answers
    const hasHighRiskSignal = TRUE_HIGH_RISK_RED_FLAGS.some(flag =>
        flatAnswers.some(a => a.includes(flag.toLowerCase())) ||
        explicitRedFlags.some(rf => rf.toLowerCase().includes(flag.toLowerCase()))
    );

    const hasMajorContradiction = contradictions.some(c => c.severity === 'major');

    /* ── Rule 1: Non-emergency pathway cannot be emergency ── */
    if (NON_EMERGENCY_PATHWAYS.has(pathwayId) && level === 'emergency') {
        level       = 'needs_doctor';
        wasRefined  = true;
        dominantSignals.push('المسار لا يصنّف كطارئ بدون إشارات جهازية');
    }

    /* ── Rule 2: Chronic severe + no true red flags → needs_doctor, not emergency ── */
    if (
        level === 'emergency' &&
        !hasHighRiskSignal &&
        explicitRedFlags.length === 0 &&
        (input.baseTriage.score < 8)
    ) {
        level      = 'needs_doctor';
        wasRefined = true;
        dominantSignals.push('أعراض مزمنة شديدة بدون علامات طارئة حقيقية');
    }

    /* ── Rule 3: High-risk signal present → at least urgent ── */
    if (
        hasHighRiskSignal &&
        (level === 'manageable' || level === 'review')
    ) {
        level      = 'urgent';
        wasRefined = true;
        dominantSignals.push('علامة خطر مرتفعة الأهمية');
    }

    /* ── Rule 3b: Chronic moderate symptoms without true red flags → doctor review, not urgent ── */
    if (
        level === 'urgent' &&
        !hasHighRiskSignal &&
        explicitRedFlags.length === 0 &&
        ((answers as Record<string, unknown>).duration === 'months' || (answers as Record<string, unknown>).duration === 'years') &&
        severity <= 7
    ) {
        level      = 'needs_doctor';
        wasRefined = true;
        dominantSignals.push('أعراض مزمنة متوسطة أو مرتفعة بدون علامات خطر حقيقية');
    }

    /* ── Rule 4: Major contradiction + review → needs_doctor ── */
    if (hasMajorContradiction && level === 'review') {
        level      = 'needs_doctor';
        wasRefined = true;
        dominantSignals.push('تناقض جوهري في الإجابات يستدعي تقييماً طبياً');
    }

    /* ── Rule 5: Severity ≥ 8 + duration months → at least needs_doctor ── */
    if (
        severity >= 8 &&
        (answers as Record<string, unknown>).duration === 'months' &&
        level === 'manageable'
    ) {
        level      = 'needs_doctor';
        wasRefined = true;
        dominantSignals.push(`شدة ${severity}/١٠ مع مدة مزمنة`);
    }

    /* ── Determine lifestyle/nutrition permissions ── */
    const lifestyleAllowed  = level !== 'emergency';
    const nutritionAllowed  = level !== 'emergency' && level !== 'urgent';

    /* ── Build output ── */
    const safetyMessage = buildSafetyMessage(level, hasHighRiskSignal, dominantSignals);
    const reason        = buildReason(level, wasRefined, dominantSignals, pathwayId);
    const recommendedAction = buildRecommendedAction(level, pathwayId, hasHighRiskSignal);

    return {
        level,
        reason,
        dominantSignals,
        safetyMessage,
        lifestyleAllowed,
        nutritionAllowed,
        recommendedAction,
        wasRefined,
        baseLevelWas: baseLevel,
    };
}

/* ══════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════ */

function buildSafetyMessage(
    level:         RefinedTriageLevel,
    hasHighRisk:   boolean,
    signals:       string[],
): string | null {
    if (level === 'emergency') {
        return 'توجد إشارة طارئة — يُنصح بالتوجه لأقرب مركز صحي أو طوارئ فوراً.';
    }
    if (level === 'urgent') {
        return hasHighRisk
            ? 'ظهرت علامة تستحق تقييماً طبياً خلال ٢٤ ساعة.'
            : 'يُنصح بمراجعة طبيب في أقرب وقت.';
    }
    if (level === 'needs_doctor') {
        return 'هذه النتيجة توجيهية. مراجعة طبيب مختص تُوصى به لتأكيد الصورة.';
    }
    return null;
}

function buildReason(
    level:      RefinedTriageLevel,
    wasRefined: boolean,
    signals:    string[],
    pathway:    string,
): string {
    const prefix = wasRefined ? 'تم تعديل مستوى التصنيف بناءً على: ' : 'مستوى التصنيف مبني على: ';

    if (level === 'emergency') {
        return `${prefix}علامة طارئة حقيقية أو خطر حيوي مباشر`;
    }
    if (level === 'urgent') {
        return signals.length > 0
            ? `${prefix}${signals.join('، ')}`
            : `${prefix}شدة أعراض مرتفعة في مسار ${pathway}`;
    }
    if (level === 'needs_doctor') {
        return `${prefix}الأعراض تتجاوز النطاق الذي يمكن إدارته ذاتياً`;
    }
    if (level === 'review') {
        return `${prefix}الأعراض تحتاج مراجعة دورية وتقييم موسّع`;
    }
    return `${prefix}الأعراض قابلة للإدارة مع المتابعة`;
}

function buildRecommendedAction(
    level:      RefinedTriageLevel,
    pathway:    string,
    hasHighRisk: boolean,
): string {
    switch (level) {
        case 'emergency':
            return 'اتصل بالطوارئ أو توجه لأقرب مستشفى الآن.';
        case 'urgent':
            return hasHighRisk
                ? 'راجع طبيباً أو عيادة خلال ٢٤ ساعة.'
                : 'حدد موعداً طبياً هذا الأسبوع.';
        case 'needs_doctor':
            return 'احجز زيارة عند طبيبك لمراجعة هذه الأعراض بشكل أعمق.';
        case 'review':
            return 'تابع الأعراض وأعد التقييم إذا ازدادت سوءاً أو استمرت أكثر من ٣ أسابيع.';
        default:
            return 'ابدأ بالخطوات اليومية الموصى بها واستمر بالمتابعة.';
    }
}
