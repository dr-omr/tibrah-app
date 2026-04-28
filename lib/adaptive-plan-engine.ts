// lib/adaptive-plan-engine.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Adaptive Plan Engine
// ════════════════════════════════════════════════════════════════════════
//
// Makes the care plan responsive to:
//   - Adherence level (tool completion)
//   - Symptom trend (outcome scores)
//   - Tayyibat violations
//   - Completion behavior
//   - Outcome scores
//
// The plan adapts, not remains static.
// ════════════════════════════════════════════════════════════════════════

import type { SavedCarePlan } from './care-plan-store';
import { getToolEngagement, getProtocolDay } from './care-plan-store';
import { getDayOutcomes, type DayOutcome } from './outcome-store';
import { getWeeklyAdherence, getTodayLog, type WeeklyAdherenceSummary } from './nutrition/tayyibat-adherence';
import { generateBehaviorInsight, type BehaviorInsight } from './nutrition/tayyibat-timing-engine';

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

export type PlanAdaptationLevel = 'on_track' | 'needs_adjustment' | 'needs_intervention' | 'critical';
export type SymptomTrend = 'improving' | 'stable' | 'worsening' | 'insufficient_data';
export type PlanEmphasis = 'nutrition' | 'tools' | 'adherence' | 'reassessment' | 'booking' | 'balanced';

export interface AdaptivePlanState {
    /** Current adaptation level */
    adaptationLevel: PlanAdaptationLevel;
    /** Symptom trend */
    symptomTrend: SymptomTrend;
    /** Where the plan should put emphasis now */
    currentEmphasis: PlanEmphasis;
    /** Today's priority text */
    todayPriority: string;
    /** Weakest area right now */
    weakestArea: string;
    /** Main blocker description */
    mainBlocker: string;
    /** What to do right now */
    nextBestAction: string;
    /** When to reassess */
    reassessmentNote: string;
    /** Summary stats */
    stats: AdaptiveStats;
    /** Adaptation reasons */
    reasons: string[];
}

export interface AdaptiveStats {
    /** Tool completion rate (0-100) */
    toolCompletion: number;
    /** Protocol day */
    protocolDay: number;
    /** Days since plan creation */
    daysSincePlan: number;
    /** Tayyibat weekly adherence (0-100) */
    nutritionAdherence: number;
    /** Outcome trend direction */
    outcomeTrend: SymptomTrend;
    /** Number of outcomes logged */
    outcomesLogged: number;
}

/* ══════════════════════════════════════════════════════════
   MAIN FUNCTION
   ══════════════════════════════════════════════════════════ */

/**
 * Compute the adaptive plan state for the current active plan.
 */
export function computeAdaptivePlanState(plan: SavedCarePlan): AdaptivePlanState {
    const completionRate = getToolEngagement(plan);
    const protocolDay = getProtocolDay(plan);
    const daysSincePlan = Math.floor(
        (Date.now() - new Date(plan.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Get outcomes
    const outcomes = getDayOutcomes(plan.id);
    const symptomTrend = computeSymptomTrend(outcomes);

    // Get nutrition data
    const weekly = getWeeklyAdherence();
    const todayLog = getTodayLog();
    const behaviorInsight = generateBehaviorInsight(todayLog, []);

    // Build stats
    const stats: AdaptiveStats = {
        toolCompletion: completionRate,
        protocolDay,
        daysSincePlan,
        nutritionAdherence: weekly.averageAdherence,
        outcomeTrend: symptomTrend,
        outcomesLogged: outcomes.length,
    };

    // Compute adaptation
    const reasons: string[] = [];
    let adaptationLevel: PlanAdaptationLevel = 'on_track';
    let currentEmphasis: PlanEmphasis = 'balanced';

    // Rule 1: Poor outcome trend
    if (symptomTrend === 'worsening') {
        adaptationLevel = 'needs_intervention';
        reasons.push('الأعراض في تراجع — يحتاج تدخل');
    }

    // Rule 2: Low tool completion after several days
    if (daysSincePlan >= 3 && completionRate < 20) {
        adaptationLevel = adaptationLevel === 'on_track' ? 'needs_adjustment' : adaptationLevel;
        currentEmphasis = 'adherence';
        reasons.push('تقدم بطيء في الأدوات العلاجية');
    }

    // Rule 3: Poor nutrition adherence
    if (weekly.averageAdherence < 50 && weekly.daysLogged >= 3) {
        if (adaptationLevel === 'on_track') adaptationLevel = 'needs_adjustment';
        currentEmphasis = 'nutrition';
        reasons.push('الالتزام الغذائي ضعيف');
    }

    // Rule 4: Declining nutrition trend
    if (weekly.trend === 'declining') {
        reasons.push('اتجاه الالتزام الغذائي في تراجع');
    }

    // Rule 5: Time-based reassessment
    if (daysSincePlan >= 7 && completionRate < 50) {
        adaptationLevel = 'needs_intervention';
        currentEmphasis = 'reassessment';
        reasons.push('مرت ٧ أيام بدون تقدم كافٍ');
    }

    // Rule 6: Critical escalation
    if (plan.escalationState === 'urgent' || plan.escalationState === 'emergency') {
        adaptationLevel = 'critical';
        currentEmphasis = 'booking';
        reasons.push('حالة تحتاج تدخل طبي');
    }

    // Rule 7: Good outcome + good completion = on track
    if (symptomTrend === 'improving' && completionRate >= 60) {
        adaptationLevel = 'on_track';
        reasons.push('تحسن واضح مع التزام جيد');
    }

    // Determine emphasis if not set
    if (currentEmphasis === 'balanced') {
        if (weekly.averageAdherence < 60) currentEmphasis = 'nutrition';
        else if (completionRate < 40) currentEmphasis = 'tools';
        else currentEmphasis = 'balanced';
    }

    // Generate text
    const todayPriority = generateTodayPriority(currentEmphasis, weekly, completionRate, behaviorInsight);
    const weakestArea = generateWeakestArea(stats, weekly, behaviorInsight);
    const mainBlocker = generateMainBlocker(stats, weekly, behaviorInsight);
    const nextBestAction = generateNextAction(currentEmphasis, weekly, completionRate, plan);
    const reassessmentNote = generateReassessmentNote(adaptationLevel, daysSincePlan, symptomTrend);

    return {
        adaptationLevel,
        symptomTrend,
        currentEmphasis,
        todayPriority,
        weakestArea,
        mainBlocker,
        nextBestAction,
        reassessmentNote,
        stats,
        reasons,
    };
}

/* ══════════════════════════════════════════════════════════
   SYMPTOM TREND
   ══════════════════════════════════════════════════════════ */

function computeSymptomTrend(outcomes: DayOutcome[]): SymptomTrend {
    if (outcomes.length < 2) return 'insufficient_data';

    const sorted = [...outcomes].sort((a, b) => a.day - b.day);
    const mid = Math.ceil(sorted.length / 2);
    const firstHalf = sorted.slice(0, mid);
    const secondHalf = sorted.slice(mid);

    const firstAvg = firstHalf.reduce((s, o) => s + o.outcomeScore, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((s, o) => s + o.outcomeScore, 0) / secondHalf.length;

    // Lower outcome score = better (1=best, 10=worst)
    const diff = secondAvg - firstAvg;
    if (diff <= -1.5) return 'improving';
    if (diff >= 1.5) return 'worsening';
    return 'stable';
}

/* ══════════════════════════════════════════════════════════
   TEXT GENERATORS
   ══════════════════════════════════════════════════════════ */

function generateTodayPriority(
    emphasis: PlanEmphasis,
    weekly: WeeklyAdherenceSummary,
    completion: number,
    behavior: BehaviorInsight,
): string {
    switch (emphasis) {
        case 'nutrition':
            return behavior.message || 'ركّز اليوم على تحسين الالتزام الغذائي';
        case 'tools':
            return 'أولوية اليوم: أكمل أداة علاجية واحدة على الأقل من خطتك';
        case 'adherence':
            return 'أولوية اليوم: ابدأ بخطوة واحدة فقط من الخطة — لا تحاول كل شيء';
        case 'reassessment':
            return 'حان وقت إعادة التقييم — راجع أعراضك وقيّم تقدمك';
        case 'booking':
            return 'أولوية اليوم: حجز جلسة مع الطبيب للمتابعة';
        default:
            if (weekly.averageAdherence < 60) return 'ركّز على الالتزام الغذائي اليوم';
            if (completion < 40) return 'أكمل أداة واحدة من خطتك';
            return 'واصل التقدم — التزامك جيد';
    }
}

function generateWeakestArea(
    stats: AdaptiveStats,
    weekly: WeeklyAdherenceSummary,
    behavior: BehaviorInsight,
): string {
    if (stats.nutritionAdherence < stats.toolCompletion && stats.nutritionAdherence < 60) {
        return 'التغذية — الالتزام بنظام الطيبات هو الأضعف حالياً';
    }
    if (stats.toolCompletion < 30 && stats.daysSincePlan >= 3) {
        return 'الأدوات العلاجية — تقدم بطيء جداً في تنفيذ الخطة';
    }
    if (behavior.mainBlocker === 'timing') {
        return 'توقيت الوجبات — الطعام قد يكون مقبولاً لكن التوقيت يخرق النظام';
    }
    if (behavior.mainBlocker === 'fasting') {
        return 'الصيام — لا توجد فترة صيام كافية يومياً';
    }
    if (weekly.trend === 'declining') {
        return 'الاتجاه العام — الالتزام بدأ يتراجع ويحتاج انتباه';
    }
    return 'لا نقطة ضعف واضحة — حافظ على التوازن الحالي';
}

function generateMainBlocker(
    stats: AdaptiveStats,
    weekly: WeeklyAdherenceSummary,
    behavior: BehaviorInsight,
): string {
    if (stats.outcomeTrend === 'worsening') {
        return 'الأعراض تتفاقم رغم المحاولات — قد يحتاج تغيير في النهج';
    }
    if (behavior.mainBlocker !== 'none') {
        const blockerMap: Record<string, string> = {
            food: 'اختيار الأطعمة',
            timing: 'توقيت الوجبات',
            fasting: 'الصيام المتقطع',
            behavior: 'السلوك الغذائي',
        };
        return blockerMap[behavior.mainBlocker] || 'السلوك الغذائي';
    }
    if (stats.toolCompletion < 20) return 'بطء في تنفيذ الخطة العلاجية';
    return 'لا عائق رئيسي — استمر';
}

function generateNextAction(
    emphasis: PlanEmphasis,
    weekly: WeeklyAdherenceSummary,
    completion: number,
    plan: SavedCarePlan,
): string {
    switch (emphasis) {
        case 'nutrition':
            return weekly.easiestCorrection || 'سجّل وجبتك القادمة في نظام الطيبات';
        case 'tools': {
            const nextTool = plan.routing.recommended_tools.find(
                t => !plan.toolsCompleted.includes(t.id) && !plan.toolsOpened.includes(t.id)
            );
            return nextTool ? `افتح "${nextTool.arabicName}" وابدأ` : 'أكمل أداة مفتوحة لم تنتهِ منها';
        }
        case 'adherence':
            return 'اختر مهمة واحدة فقط من الخطة وأنجزها اليوم';
        case 'reassessment':
            return 'اذهب لـ "أعد التقييم" وأجب بصدق عن أعراضك الحالية';
        case 'booking':
            return 'احجز جلسة مع الطبيب — حالتك تحتاج متابعة';
        default:
            return 'سجّل وجبتك وأكمل أداة واحدة';
    }
}

function generateReassessmentNote(
    level: PlanAdaptationLevel,
    days: number,
    trend: SymptomTrend,
): string {
    if (level === 'critical') return 'إعادة التقييم ضرورية الآن — حالتك تحتاج مراجعة';
    if (trend === 'worsening') return 'الأعراض تتفاقم — أعد التقييم خلال يومين';
    if (days >= 7) return 'مرت ٧ أيام — الوقت مناسب لإعادة التقييم وقياس التقدم';
    if (days >= 5) return `بقي ${7 - days} أيام على موعد إعادة التقييم المثالي`;
    return 'استمر في الخطة — إعادة التقييم بعد إكمال أسبوع كامل';
}
