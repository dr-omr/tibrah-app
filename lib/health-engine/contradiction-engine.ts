// lib/health-engine/contradiction-engine.ts
// ════════════════════════════════════════════════════════════════
// TIBRAH — Unified Assessment Contradiction Engine (Phase 3)
//
// Purpose:
//   Extends the existing lib/contradiction-engine.ts (C1-C6 rules) with
//   a richer, typed contradiction model. Operates as an ADDITIVE layer.
//
// Key differences from the existing engine:
//   - Returns AssessmentContradiction (with user-facing Arabic message)
//     instead of ContradictionFlag (internal)
//   - Covers Tayyibat/nutrition contradictions
//   - Covers adaptive plan contradictions (emergency + lifestyle questions)
//   - Gentle, non-blaming Arabic copy
//   - affectedConfidence is per-contradiction penalty
//
// Rules:
//   - Never blame the user. Always frame as "needs clarification"
//   - Major contradictions affect confidence significantly
//   - Minor contradictions are informational only
//   - This engine DOES NOT override triage or routing
// ════════════════════════════════════════════════════════════════

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

export type AssessmentContradictionSeverity = 'minor' | 'moderate' | 'major';

export interface AssessmentContradiction {
    id:                  string;
    severity:            AssessmentContradictionSeverity;
    /** Gentle Arabic message — shown to user in consistency note */
    messageForUser:      string;
    /** Technical reason — for analytics/logging only */
    technicalReason:     string;
    /** Confidence points deducted (0-20) */
    affectedConfidence:  number;
}

export interface AssessmentContradictionInput {
    pathwayId:     string;
    severity?:     number;
    duration?:     string;
    answers:       Record<string, unknown>;
    clinicalAnswers?: Record<string, unknown>;
    emotionalAnswer?: string | null;
    adaptiveQuestionPlanSnapshot?: {
        burdenMinimized: boolean;
        safetyPrioritized: boolean;
    } | null;
    tayyibatVerdict?: {
        primaryPattern:      string | null;
        safetyGated:         boolean;
        contradictionNotes:  string[];
        confidenceScore:     number;
    } | null;
    triageLevel?: string;
}

/* ══════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════ */

function flattenAnswers(answers: Record<string, unknown>): string[] {
    return Object.values(answers)
        .flatMap(v => Array.isArray(v) ? v : [String(v ?? '')])
        .map(s => String(s).toLowerCase())
        .filter(Boolean);
}

function includesAny(flat: string[], terms: string[]): boolean {
    return terms.some(t => flat.some(f => f.includes(t.toLowerCase())));
}

/* ══════════════════════════════════════════════════════════
   MAIN FUNCTION
   ══════════════════════════════════════════════════════════ */

export function detectAssessmentContradictions(
    input: AssessmentContradictionInput,
): AssessmentContradiction[] {
    const contradictions: AssessmentContradiction[] = [];

    const {
        severity         = 5,
        duration         = 'unknown',
        answers,
        clinicalAnswers  = answers,
        emotionalAnswer,
        tayyibatVerdict,
        triageLevel      = 'manageable',
    } = input;

    const flat = flattenAnswers(clinicalAnswers as Record<string, unknown>);
    const adaptiveSnapshot = input.adaptiveQuestionPlanSnapshot;


    /* ── AC1: Low severity + explicit red flag present ─────── */
    const hasRedFlagAnswers = includesAny(flat, [
        'ألم صدر', 'chest pain', 'ضيق تنفس', 'دم في البراز', 'فقدان وزن',
        'إغماء', 'صداع مفاجئ شديد', 'تنميل', 'ضعف شديد مفاجئ',
    ]);
    if (severity < 5 && hasRedFlagAnswers) {
        contradictions.push({
            id:                 'AC1',
            severity:           'major',
            messageForUser:     'توجد نقطة تحتاج توضيحاً: الأعراض تبدو خفيفة، لكن بعض الإجابات تشير لإشارات تستحق انتباهاً أكبر.',
            technicalReason:    `severity=${severity} but red-flag terms present in answers`,
            affectedConfidence: 18,
        });
    }

    /* ── AC2: High severity + impact reported as minimal ─────  */
    const lowImpactTerms = ['لا يؤثر على حياتي', 'لا تأثير', 'يسيرة', 'خفيفة جداً'];
    if (severity >= 8 && includesAny(flat, lowImpactTerms)) {
        contradictions.push({
            id:                 'AC2',
            severity:           'moderate',
            messageForUser:     'بعض إجاباتك تبدو غير متسقة، وهذا لا يعني خطأ منك؛ فقط نحتاج فهمًا أدق — الشدة مرتفعة لكن التأثير الوظيفي يُذكر كبسيط.',
            technicalReason:    `severity=${severity} >= 8 but functional impact marked minimal`,
            affectedConfidence: 12,
        });
    }

    /* ── AC3: Chronic duration + "started today" conflict ───── */
    const acuteTerms = ['منذ اليوم', 'بدأت اليوم', 'حادة', 'مفاجئة'];
    if ((duration === 'months' || duration === 'years') && includesAny(flat, acuteTerms)) {
        contradictions.push({
            id:                 'AC3',
            severity:           'moderate',
            messageForUser:     'نحتاج توضيح: الأعراض وُصفت على أنها مستمرة أشهراً، لكن بعض الإجابات تصفها كحادة أو مفاجئة.',
            technicalReason:    `duration=${duration} (chronic) but acute-onset terms detected`,
            affectedConfidence: 10,
        });
    }

    /* ── AC4: Severe fatigue + sleep/activity deny impairment ─ */
    const sevFatigueTerms  = ['إرهاق شديد', 'لا أستطيع الحركة', 'طاقة صفر', 'منهك تماماً'];
    const normalSleepTerms = ['نوم جيد', 'أنام جيداً', 'نشاطي طبيعي', 'لا مشكلة في النوم'];
    if (includesAny(flat, sevFatigueTerms) && includesAny(flat, normalSleepTerms)) {
        contradictions.push({
            id:                 'AC4',
            severity:           'minor',
            messageForUser:     'توجد نقطة مثيرة للاهتمام: ذكرت إرهاقاً شديداً لكن أيضاً نوماً جيداً. هذا ليس خطأ — فقط نريد فهم النمط أدق.',
            technicalReason:    'Severe fatigue signals + adequate sleep/activity signals coexist',
            affectedConfidence: 6,
        });
    }

    /* ── AC5: No digestive symptoms + nutrition mentions digestion ─ */
    const noDigestTerms  = ['لا مشاكل هضمية', 'هضم جيد', 'لا انتفاخ'];
    const hasDigestInNut = includesAny(flat, ['انتفاخ', 'إمساك', 'إسهال', 'حرقة', 'ارتجاع', 'bloating', 'reflux']);
    if (includesAny(flat, noDigestTerms) && hasDigestInNut) {
        contradictions.push({
            id:                 'AC5',
            severity:           'minor',
            messageForUser:     'في إجاباتك، ذكرت عدم وجود مشاكل هضمية، لكن ظهرت أعراض هضمية في إجابات أخرى. يرجى مراجعة ذلك.',
            technicalReason:    'No digestive symptoms claimed but digestive signals in other answers',
            affectedConfidence: 7,
        });
    }

    /* ── AC6: High Tayyibat adherence + sugar/late meals reported ─ */
    if (tayyibatVerdict?.primaryPattern === 'high_adherence') {
        const poorHabits = includesAny(flat, [
            'سكر يومياً', 'وجبات سريعة', 'عشاء متأخر', 'حلويات يومياً',
            'مشروبات سكرية', 'وجبات عشوائية',
        ]);
        if (poorHabits) {
            contradictions.push({
                id:                 'AC6',
                severity:           'moderate',
                messageForUser:     'نمط التزامك الغذائي يبدو جيداً، لكن بعض الإجابات تشير لعادات قد تؤثر على الالتزام. هذا مفيد للتوضيح.',
                technicalReason:    'Tayyibat high-adherence pattern + poor habit signals in clinical answers',
                affectedConfidence: 9,
            });
        }
    }

    /* ── AC7: Urgent/emergency triage + user described as manageable ─ */
    const manageable = includesAny(flat, ['خفيف', 'لا يزعجني', 'أتحكم به', 'يسير']);
    if ((triageLevel === 'urgent' || triageLevel === 'emergency') && manageable && severity >= 8) {
        contradictions.push({
            id:                 'AC7',
            severity:           'major',
            messageForUser:     'توجد نقطة تحتاج توضيحاً قبل أن نرفع دقة النتيجة: الأعراض تشير لحالة تتطلب انتباهاً، لكن بعض الإجابات تصفها كخفيفة.',
            technicalReason:    `triageLevel=${triageLevel} + severity=${severity} but manageable language used`,
            affectedConfidence: 15,
        });
    }

    /* ── AC8: High emotional stress + physical-only answers ───── */
    const highStressEmotional = emotionalAnswer && [
        'قلق شديد', 'اكتئاب', 'ضغط نفسي', 'حزن عميق',
    ].some(t => emotionalAnswer.toLowerCase().includes(t.toLowerCase()));
    const onlyPhysical = !includesAny(flat, [
        'قلق', 'خوف', 'حزن', 'توتر', 'ضغط',
    ]);
    if (highStressEmotional && onlyPhysical && severity >= 6) {
        contradictions.push({
            id:                 'AC8',
            severity:           'minor',
            messageForUser:     'ذكرت ضغطاً نفسياً/عاطفياً كبيراً، لكن إجاباتك السريرية تركّز على الجسد فقط. الربط بين الجانبين يُغني النتيجة.',
            technicalReason:    'High emotional stress + purely physical clinical answers',
            affectedConfidence: 5,
        });
    }

    /* ── AC9: Missing critical answer after severe symptom ─────── */
    if (severity >= 8 && Object.keys(clinicalAnswers as Record<string, unknown>).length < 2) {
        contradictions.push({
            id:                 'AC9',
            severity:           'moderate',
            messageForUser:     'نحتاج معلومات إضافية: الأعراض شديدة لكن الإجابات قليلة جداً. الإجابة على أسئلة أكثر ترفع دقة نتيجتك.',
            technicalReason:    `severity=${severity} >= 8 but only ${Object.keys(clinicalAnswers as Record<string, unknown>).length} clinical answers provided`,
            affectedConfidence: 14,
        });
    }

    /* ── AC10: Tayyibat safety gated + lifestyle questions answered ─ */
    if (tayyibatVerdict?.safetyGated && !adaptiveSnapshot?.burdenMinimized) {

        contradictions.push({
            id:                 'AC10',
            severity:           'minor',
            messageForUser:     'ظهرت علامة تحذيرية في الجانب الغذائي — التوصيات الغذائية أُجِّلت لحين مراجعة طبية أولاً.',
            technicalReason:    'Tayyibat safety gate triggered',
            affectedConfidence: 3,
        });
    }

    return contradictions;
}

/* ══════════════════════════════════════════════════════════
   HELPER: merge with existing ContradictionFlag[]
   ══════════════════════════════════════════════════════════ */

/**
 * Converts existing ContradictionFlag[] (from contradiction-engine.ts)
 * into AssessmentContradiction[] so both systems can be combined.
 */
export function fromLegacyContradictions(
    flags: Array<{ id: string; severity: string; message: string; confidenceImpact: number }>,
): AssessmentContradiction[] {
    return flags.map(f => ({
        id:                `LEGACY_${f.id}`,
        severity:          f.severity === 'high' ? 'major' : f.severity === 'medium' ? 'moderate' : 'minor',
        messageForUser:    f.message,
        technicalReason:   `Legacy rule ${f.id}`,
        affectedConfidence: f.confidenceImpact,
    } as AssessmentContradiction));
}

/** Total confidence penalty from a list of contradictions */
export function totalContradictionPenalty(
    contradictions: AssessmentContradiction[],
): number {
    return Math.min(40, contradictions.reduce((sum, c) => sum + c.affectedConfidence, 0));
}

/** Major contradiction count (for confidence gating) */
export function majorContradictionCount(
    contradictions: AssessmentContradiction[],
): number {
    return contradictions.filter(c => c.severity === 'major').length;
}
