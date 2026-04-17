// lib/outcome-trend-engine.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Outcome Trend Engine (Sprint 2)
// ════════════════════════════════════════════════════════════════════════
//
// يحلل بيانات DayOutcome ويعطي إحدى 4 حالات + توصية Handoff.
//
// المبادئ:
//   60% adherence = حد الصلاحية — أقل من ذلك لا يمكن الحكم
//   outcomeScore 1-10 حيث 10 = الأسوأ (مثل severity في المحرك)
//   baseline = نقطة المقارنة الحقيقية (ليس فقط أمس)
//   الغياب = weak signal — لا يُحكَم عليه كـ no_response
//
// الـ Handoff: 4 مسارات فقط (v1):
//   continue / repeat_today_gently / reassess_now / book_session
// ════════════════════════════════════════════════════════════════════════

import type { DayOutcome, ProtocolBaseline } from './outcome-store';

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

export type OutcomeTrend =
    | 'responding'         // adherence جيد + تحسن واضح
    | 'partial_response'   // adherence جيد + تحسن جزئي أو بطيء
    | 'no_response'        // adherence جيد + لا تحسن بعد عدة أيام
    | 'worsening'          // الأعراض تزداد سوءاً أو المستخدم يشعر بتراجع
    | 'insufficient_data'; // أقل من check-in واحد — لا حكم بعد

export type HandoffRecommendation =
    | 'continue'             // استمر في البروتوكول
    | 'repeat_today_gently'  // أعد محاولة أداة اليوم بلطف — adherence أو partial
    | 'reassess_now'         // أعد التقييم الكامل
    | 'book_session';        // تصعيد للمتخصص

export type AdherenceLevel =
    | 'low'     // < 60%  — لا يمكن الحكم على الـ outcome
    | 'usable'  // 60-79% — كافٍ للحكم
    | 'strong'; // ≥ 80%  — موثوق

export interface TrendResult {
    trend:              OutcomeTrend;
    handoff:            HandoffRecommendation;
    adherenceLevel:     AdherenceLevel;
    /** نسبة الأيام التي أكمل فيها check-in (0-100) */
    adherenceRate:      number;
    /** متوسط درجة الأعراض عبر الأيام المُسجَّلة */
    avgOutcomeScore:    number;
    /** الفرق مقارنة بالـ baseline (سالب = تحسن، موجب = تراجع) */
    scoreChange:        number | null;
    /** اتجاه عام بسيط */
    direction:          'improving' | 'worsening' | 'flat' | 'unknown';
    daysAnalyzed:       number;
    /** عدد الأيام المنقضية بلا check-in — لا تُفسَّر كـ no_response */
    daysWithNoCheckin:  number;
    /** هل البيانات غير كافية بعد للحكم؟ */
    hasWeakSignal:      boolean;
}

/* ══════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════ */

function resolveAdherenceLevel(rate: number): AdherenceLevel {
    if (rate >= 80) return 'strong';
    if (rate >= 60) return 'usable';
    return 'low';
}

function resolveDirection(
    outcomes: DayOutcome[],
    baseline: ProtocolBaseline | null,
): TrendResult['direction'] {
    if (outcomes.length < 2) return 'unknown';

    const sorted = [...outcomes].sort((a, b) => a.day - b.day);
    const referenceScore = baseline?.baselineOutcomeScore ?? sorted[0].outcomeScore;
    const latestScore    = sorted[sorted.length - 1].outcomeScore;
    const diff           = latestScore - referenceScore;

    // الحكم: فرق 2 نقاط أو أكثر = تغيّر حقيقي
    if (diff <= -2) return 'improving';
    if (diff >= 2)  return 'worsening';
    return 'flat';
}

function buildResult(
    fields: TrendResult,
): TrendResult {
    return fields;
}

/* ══════════════════════════════════════════════════════════
   MAIN ENGINE
   ══════════════════════════════════════════════════════════ */

/**
 * يحسب TrendResult من بيانات البروتوكول.
 *
 * @param outcomes     - كل الـ DayOutcome المُسجَّلة حتى الآن
 * @param baseline     - الـ baseline عند بداية البروتوكول (قد يكون null)
 * @param currentDay   - اليوم الحالي من البروتوكول (1-7)
 * @param daysWithNoCheckin - عدد الأيام المنقضية بلا check-in
 */
export function computeTrend(
    outcomes: DayOutcome[],
    baseline: ProtocolBaseline | null,
    currentDay: number,
    daysWithNoCheckin: number,
): TrendResult {

    const daysAnalyzed  = outcomes.length;
    const hasWeakSignal = daysAnalyzed < 1; // لا يوجد check-in واحد بعد

    // ── Insufficient data ──────────────────
    if (hasWeakSignal) {
        return buildResult({
            trend:           'insufficient_data',
            handoff:         'continue',
            adherenceLevel:  'low',
            adherenceRate:   0,
            avgOutcomeScore: baseline?.baselineOutcomeScore ?? 5,
            scoreChange:     null,
            direction:       'unknown',
            daysAnalyzed,
            daysWithNoCheckin,
            hasWeakSignal:   true,
        });
    }

    // ── Compute core metrics ───────────────
    const elapsedDays    = Math.max(1, currentDay - 1); // أيام مضت (يوم 1 = يوم أول)
    const adherenceRate  = Math.min(100, Math.round((daysAnalyzed / elapsedDays) * 100));
    const adherenceLevel = resolveAdherenceLevel(adherenceRate);
    const avgOutcomeScore = Math.round(
        (outcomes.reduce((s, o) => s + o.outcomeScore, 0) / outcomes.length) * 10,
    ) / 10;

    const referenceScore = baseline?.baselineOutcomeScore ?? outcomes[0].outcomeScore;
    const scoreChange    = +(avgOutcomeScore - referenceScore).toFixed(1);
    const direction      = resolveDirection(outcomes, baseline);

    // Count explicit felt signals
    const worseVotes    = outcomes.filter(o => o.feltBetter === 'worse').length;
    const betterVotes   = outcomes.filter(o => o.feltBetter === 'better').length;
    const worseThreshold = Math.max(1, Math.ceil(daysAnalyzed * 0.4)); // 40%

    // ── WORSENING — safety first ───────────
    // Triggers: directional worsening OR significant "worse" votes OR score spike
    const avgIsWorsening = scoreChange >= 2;
    const votesAreWorse  = worseVotes >= worseThreshold;
    if (direction === 'worsening' || avgIsWorsening || votesAreWorse) {
        return buildResult({
            trend:           'worsening',
            handoff:         'book_session',
            adherenceLevel,
            adherenceRate,
            avgOutcomeScore,
            scoreChange,
            direction:       'worsening',
            daysAnalyzed,
            daysWithNoCheckin,
            hasWeakSignal:   false,
        });
    }

    // ── LOW ADHERENCE — لا يمكن الحكم على outcome ──
    // لا نعاقب المستخدم باستنتاج no_response — بل نُشجّع على التطبيق
    if (adherenceLevel === 'low') {
        return buildResult({
            trend:           'partial_response',
            handoff:         'repeat_today_gently',
            adherenceLevel,
            adherenceRate,
            avgOutcomeScore,
            scoreChange,
            direction,
            daysAnalyzed,
            daysWithNoCheckin,
            hasWeakSignal:   false,
        });
    }

    // ── USABLE/STRONG ADHERENCE — يمكن الحكم الآن ──

    // RESPONDING: تحسن واضح
    const clearImprovement = direction === 'improving' && scoreChange <= -2;
    const majorityBetter   = betterVotes > daysAnalyzed / 2;
    if (clearImprovement || majorityBetter) {
        return buildResult({
            trend:           'responding',
            handoff:         'continue',
            adherenceLevel,
            adherenceRate,
            avgOutcomeScore,
            scoreChange,
            direction,
            daysAnalyzed,
            daysWithNoCheckin,
            hasWeakSignal:   false,
        });
    }

    // PARTIAL RESPONSE: تحسن بسيط (تطوّر إيجابي لكن بطيء)
    const slightImprovement = (direction === 'improving' && scoreChange > -2 && scoreChange < 0)
        || (direction === 'flat' && betterVotes >= 1 && worseVotes === 0);
    if (slightImprovement) {
        return buildResult({
            trend:           'partial_response',
            handoff:         'repeat_today_gently',
            adherenceLevel,
            adherenceRate,
            avgOutcomeScore,
            scoreChange,
            direction,
            daysAnalyzed,
            daysWithNoCheckin,
            hasWeakSignal:   false,
        });
    }

    // NO RESPONSE: adherence جيد لكن لا تحسن بعد عدة أيام
    return buildResult({
        trend:           'no_response',
        handoff:         'reassess_now',
        adherenceLevel,
        adherenceRate,
        avgOutcomeScore,
        scoreChange,
        direction,
        daysAnalyzed,
        daysWithNoCheckin,
        hasWeakSignal:   false,
    });
}

/* ══════════════════════════════════════════════════════════
   TREND DISPLAY HELPERS
   ══════════════════════════════════════════════════════════ */

export const TREND_INFO: Record<OutcomeTrend, {
    emoji: string;
    label: string;
    color: string;
}> = {
    responding:        { emoji: '✅', label: 'تتحسن',           color: 'rgba(0,200,140,0.9)' },
    partial_response:  { emoji: '📈', label: 'تتحسن ببطء',      color: '#D97706' },
    no_response:       { emoji: '🔍', label: 'لا تغيير واضح',   color: '#64748B' },
    worsening:         { emoji: '🚨', label: 'تراجع ملحوظ',     color: '#DC2626' },
    insufficient_data: { emoji: '📋', label: 'ابدأ تسجيل يومك', color: '#7DD3FC' },
};

export const HANDOFF_INFO: Record<HandoffRecommendation, {
    emoji: string;
    label: string;
    description: string;
    href: string;
}> = {
    continue: {
        emoji: '🎯',
        label: 'استمر في المسار',
        description: 'أنت تتحسن — واصل الأدوات اليومية',
        href: '/my-plan',
    },
    repeat_today_gently: {
        emoji: '🔄',
        label: 'أعد اليوم بلطف',
        description: 'لا بأس — أعطِ نفسك يوماً آخر مع نفس الأداة',
        href: '/my-plan',
    },
    reassess_now: {
        emoji: '🔍',
        label: 'أعد التقييم',
        description: 'التزامك جيد لكن النتائج تشير لمسار مختلف',
        href: '/protocol-reassessment',
    },
    book_session: {
        emoji: '📞',
        label: 'احجز جلسة',
        description: 'وضعك يحتاج متخصص — لا تواصل وحدك',
        href: '/book-appointment',
    },
};
