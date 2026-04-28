// lib/nutrition/tayyibat-decision-engine.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Tayyibat Smart Decision Engine
// ════════════════════════════════════════════════════════════════════════
//
// Generates clinician-grade Arabic insights by combining:
//   - Food adherence data
//   - Timing/fasting behavior
//   - Symptom-food correlations
//   - Hidden non-adherence signals
//
// Output: actionable decision text, not just statistics.
// ════════════════════════════════════════════════════════════════════════

import type { TayyibatDailyLog, WeeklyAdherenceSummary } from './tayyibat-adherence';
import { getWeeklyAdherence, getTodayLog, getDailyLog } from './tayyibat-adherence';
import { correlateSymptomWithFood, type SymptomFoodCorrelation } from './tayyibat-engine';
import type { FoodCategory } from './tayyibat-source';
import {
    analyzeMealTiming,
    analyzeFastingPattern,
    analyzeDrinkingPattern,
    detectBehavioralNonAdherence,
    generateBehaviorInsight,
    getEasiestNextCorrection,
    type BehaviorInsight,
    type NextCorrection,
    type MealTimingAnalysis,
    type FastingAnalysis,
    type HiddenNonAdherenceResult,
} from './tayyibat-timing-engine';

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

export interface TayyibatDecisionReport {
    /** Generated timestamp */
    generatedAt: string;
    /** Overall adherence assessment text */
    overallAssessment: string;
    /** Overall score (0-100) combining food + timing + fasting */
    compositeScore: number;
    /** Is the user truly following Tayyibat? */
    trueAdherenceLevel: 'full' | 'mostly' | 'partial' | 'weak' | 'not_following';
    /** Main problem area */
    mainProblem: 'food_selection' | 'food_behavior' | 'timing' | 'fasting' | 'hidden' | 'none';
    /** Actionable insights (Arabic) */
    insights: DecisionInsight[];
    /** The single most impactful correction */
    topCorrection: NextCorrection;
    /** Symptom-food correlations if any */
    symptomCorrelations: SymptomFoodCorrelation[];
    /** Whether nutrition appears to be sustaining symptoms */
    nutritionSustainingSymptoms: boolean;
    /** Summary for my-plan integration */
    planSummary: PlanNutritionSummary;
}

export interface DecisionInsight {
    /** Category */
    category: 'food' | 'timing' | 'fasting' | 'behavior' | 'correlation' | 'progress';
    /** Icon emoji */
    emoji: string;
    /** Title */
    title: string;
    /** Body text */
    body: string;
    /** Priority */
    priority: 'critical' | 'important' | 'informational';
}

export interface PlanNutritionSummary {
    /** Today's adherence score (0-100) */
    todayScore: number;
    /** Weekly trend */
    weeklyTrend: 'improving' | 'stable' | 'declining';
    /** Weakest meal label */
    weakestMeal: string;
    /** Current nutrition priority text */
    currentPriority: string;
    /** Next action text */
    nextAction: string;
    /** Main blocker */
    mainBlocker: string;
}

/* ══════════════════════════════════════════════════════════
   MAIN DECISION FUNCTION
   ══════════════════════════════════════════════════════════ */

/**
 * Generate a comprehensive Tayyibat decision report.
 * This is the primary function called by UI components.
 */
export function generateDecisionReport(
    reportedSymptoms: string[],
    selfReportedAdherence: string,
    recentLogs: TayyibatDailyLog[],
): TayyibatDecisionReport {
    const todayLog = recentLogs.length > 0 ? recentLogs[recentLogs.length - 1] : null;
    const weekly = getWeeklyAdherence();
    const timing = analyzeMealTiming(todayLog);
    const fasting = analyzeFastingPattern(recentLogs);
    const drinking = analyzeDrinkingPattern(todayLog);
    const hidden = detectBehavioralNonAdherence(recentLogs, selfReportedAdherence);
    const behavior = generateBehaviorInsight(todayLog, recentLogs);
    const correction = getEasiestNextCorrection(todayLog, recentLogs);

    // Compute composite score
    const foodScore = weekly.averageAdherence;
    const timingScore = timing.timingScore;
    const fastingScore = fasting.fastingScore;
    const compositeScore = Math.round(
        foodScore * 0.5 + timingScore * 0.3 + fastingScore * 0.2
    );

    // Determine true adherence level
    const trueAdherenceLevel = deriveAdherenceLevel(compositeScore, hidden);

    // Determine main problem
    const mainProblem = deriveMainProblem(foodScore, timingScore, fastingScore, hidden);

    // Build insights
    const insights = buildInsights(weekly, timing, fasting, hidden, behavior);

    // Symptom-food correlations
    const violatedCategories: FoodCategory[] = [];
    for (const log of recentLogs) {
        for (const meal of Object.values(log.meals)) {
            if (meal) {
                for (const item of meal.items) {
                    if (item.classification === 'forbidden' && item.matchedItem) {
                        // Try to infer category from matched item
                        // Simple heuristic
                        if (['لبن', 'زبادي', 'حليب', 'رايب', 'قريش', 'جبنة بيضاء'].some(k => item.matchedItem!.includes(k))) {
                            if (!violatedCategories.includes('dairy')) violatedCategories.push('dairy');
                        }
                        if (['بيض'].some(k => item.matchedItem!.includes(k))) {
                            if (!violatedCategories.includes('protein_other')) violatedCategories.push('protein_other');
                        }
                        if (['مكرونة', 'قمح', 'شوفان', 'ذرة', 'برغل'].some(k => item.matchedItem!.includes(k))) {
                            if (!violatedCategories.includes('grains')) violatedCategories.push('grains');
                        }
                    }
                }
            }
        }
    }

    const symptomCorrelations = correlateSymptomWithFood(reportedSymptoms, violatedCategories);
    const nutritionSustainingSymptoms = symptomCorrelations.length > 0 &&
        symptomCorrelations.some(c => c.correlationStrength === 'strong' || c.correlationStrength === 'moderate');

    // Overall assessment text
    const overallAssessment = generateOverallAssessment(
        trueAdherenceLevel, mainProblem, compositeScore, hidden, nutritionSustainingSymptoms
    );

    // Plan summary
    const mealLabels: Record<string, string> = {
        breakfast: 'الفطور', lunch: 'الغداء', dinner: 'العشاء',
        morning_snack: 'تصبيرة الصباح', afternoon_snack: 'تصبيرة العصر',
    };
    const planSummary: PlanNutritionSummary = {
        todayScore: todayLog ? Math.round(todayLog.adherenceScore * 100) : 0,
        weeklyTrend: weekly.trend,
        weakestMeal: weekly.weakestMeal ? (mealLabels[weekly.weakestMeal] || weekly.weakestMeal) : '—',
        currentPriority: correction.what,
        nextAction: correction.how,
        mainBlocker: behavior.mainBlocker === 'none' ? 'لا يوجد' :
            behavior.mainBlocker === 'food' ? 'اختيار الأطعمة' :
            behavior.mainBlocker === 'timing' ? 'توقيت الوجبات' :
            behavior.mainBlocker === 'fasting' ? 'الصيام' : 'السلوك الغذائي',
    };

    return {
        generatedAt: new Date().toISOString(),
        overallAssessment,
        compositeScore,
        trueAdherenceLevel,
        mainProblem,
        insights,
        topCorrection: correction,
        symptomCorrelations,
        nutritionSustainingSymptoms,
        planSummary,
    };
}

/* ══════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════ */

function deriveAdherenceLevel(
    score: number,
    hidden: HiddenNonAdherenceResult,
): TayyibatDecisionReport['trueAdherenceLevel'] {
    if (hidden.severity === 'significant') return 'weak';
    if (score >= 85) return 'full';
    if (score >= 65) return 'mostly';
    if (score >= 40) return 'partial';
    if (score >= 15) return 'weak';
    return 'not_following';
}

function deriveMainProblem(
    food: number, timing: number, fasting: number,
    hidden: HiddenNonAdherenceResult,
): TayyibatDecisionReport['mainProblem'] {
    if (hidden.detected && hidden.severity === 'significant') return 'hidden';
    if (food < 50) return 'food_selection';
    if (timing < 50) return 'timing';
    if (fasting < 40) return 'fasting';
    if (food < 70 && timing < 70) return 'food_behavior';
    return 'none';
}

function buildInsights(
    weekly: WeeklyAdherenceSummary,
    timing: MealTimingAnalysis,
    fasting: FastingAnalysis,
    hidden: HiddenNonAdherenceResult,
    behavior: BehaviorInsight,
): DecisionInsight[] {
    const insights: DecisionInsight[] = [];

    // Food adherence insight
    if (weekly.averageAdherence < 60) {
        insights.push({
            category: 'food', emoji: '🔴',
            title: 'الالتزام الغذائي ضعيف',
            body: `متوسط الالتزام ${weekly.averageAdherence}% — المخالفات الغذائية تُضعف النتائج بشكل كبير`,
            priority: 'critical',
        });
    } else if (weekly.averageAdherence < 80) {
        insights.push({
            category: 'food', emoji: '🟡',
            title: 'الالتزام الغذائي جزئي',
            body: `متوسط الالتزام ${weekly.averageAdherence}% — تصحيح مخالفة واحدة قد يرفعه كثيراً`,
            priority: 'important',
        });
    }

    // Timing insight
    if (timing.issues.length > 0) {
        insights.push({
            category: 'timing', emoji: '⏰',
            title: 'مشاكل في توقيت الوجبات',
            body: timing.issues[0].message,
            priority: timing.timingScore < 50 ? 'critical' : 'important',
        });
    }

    // Fasting insight
    if (!fasting.isConsistent && fasting.fastingDays > 0) {
        insights.push({
            category: 'fasting', emoji: '🌙',
            title: 'الصيام غير منتظم',
            body: fasting.suggestion,
            priority: 'important',
        });
    }

    // Hidden non-adherence
    if (hidden.detected) {
        insights.push({
            category: 'behavior', emoji: '🔍',
            title: 'مؤشر على عدم التزام خفي',
            body: hidden.summary,
            priority: hidden.severity === 'significant' ? 'critical' : 'important',
        });
    }

    // Weakest meal
    if (weekly.weakestMeal) {
        const mealLabels: Record<string, string> = {
            breakfast: 'الفطور', lunch: 'الغداء', dinner: 'العشاء',
            morning_snack: 'تصبيرة الصباح', afternoon_snack: 'تصبيرة العصر',
        };
        insights.push({
            category: 'food', emoji: '📍',
            title: `أضعف وجبة: ${mealLabels[weekly.weakestMeal] || weekly.weakestMeal}`,
            body: 'ركّز على تحسين هذه الوجبة تحديداً — الأثر سيكون واضحاً',
            priority: 'important',
        });
    }

    // Trend insight
    if (weekly.trend === 'improving') {
        insights.push({
            category: 'progress', emoji: '📈',
            title: 'اتجاه التحسن واضح',
            body: 'التزامك يتحسن — استمر على هذا النمط',
            priority: 'informational',
        });
    } else if (weekly.trend === 'declining') {
        insights.push({
            category: 'progress', emoji: '📉',
            title: 'تراجع في الالتزام',
            body: 'الالتزام بدأ يتراجع — راجع نمطك الغذائي اليوم',
            priority: 'critical',
        });
    }

    return insights.sort((a, b) => {
        const pri = { critical: 0, important: 1, informational: 2 };
        return pri[a.priority] - pri[b.priority];
    });
}

function generateOverallAssessment(
    level: TayyibatDecisionReport['trueAdherenceLevel'],
    problem: TayyibatDecisionReport['mainProblem'],
    score: number,
    hidden: HiddenNonAdherenceResult,
    nutritionSustaining: boolean,
): string {
    if (level === 'full') {
        return 'التزامك بنظام الطيبات ممتاز — الأصناف والتوقيت والسلوك متوافقة. حافظ على هذا النمط وراقب أعراضك.';
    }

    if (level === 'mostly') {
        if (problem === 'timing') {
            return 'التزامك بالأصناف جيد، لكن توقيت الوجبات يحتاج تحسين. ضبط التوقيت قد يُحسّن النتائج بشكل ملحوظ.';
        }
        return 'التزامك جيد بشكل عام مع مخالفات بسيطة. تصحيح مخالفة واحدة متكررة قد يرفع مستواك كثيراً.';
    }

    if (hidden.detected && hidden.severity === 'significant') {
        return 'يوجد فجوة بين ما تعتقد أنك ملتزم به وما يظهره السجل الفعلي. مراجعة دقيقة لنمط أكلك ستساعد في كشف المخالفات الخفية.';
    }

    if (nutritionSustaining) {
        return 'المخالفات الغذائية الحالية مرتبطة بشكل واضح بالأعراض التي تعاني منها. تصحيح النظام الغذائي قد يكون المفتاح الأساسي لتحسن حالتك.';
    }

    if (level === 'partial') {
        if (problem === 'food_selection') {
            return 'مشكلتك الرئيسية ليست في التوقيت بل في اختيار الأطعمة — مخالفات متكررة في الأصناف تُضعف النتائج.';
        }
        if (problem === 'food_behavior') {
            return 'الالتزام جزئي — المشكلة في مزيج من الاختيارات والسلوك الغذائي. تصحيح واحد يومياً سيُحدث فرقاً.';
        }
        return 'الالتزام جزئي — هناك مساحة واضحة للتحسن. ابدأ بأسهل تصحيح ممكن.';
    }

    return 'الالتزام ضعيف حالياً. لا تحاول تغيير كل شيء دفعة واحدة — ابدأ بتصحيح واحد فقط وراقب الأثر خلال ٣ أيام.';
}
