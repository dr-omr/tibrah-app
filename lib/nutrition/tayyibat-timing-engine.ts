// lib/nutrition/tayyibat-timing-engine.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Tayyibat Timing, Fasting & Behavior Intelligence
// ════════════════════════════════════════════════════════════════════════
//
// Models the behavioral dimensions of the Tayyibat system:
//   - Meal spacing & timing adherence
//   - Fasting pattern detection
//   - Hunger-driven vs habit-driven eating
//   - Drinking pattern analysis
//   - Hidden non-adherence from behavioral signals
//
// Principles from the wider Tayyibat ecosystem:
//   - Fasting is foundational
//   - Eat on true hunger, not habit
//   - Drink on thirst, not compulsively
//   - Long spacing between meals matters
//   - Adherence quality matters as much as food category
// ════════════════════════════════════════════════════════════════════════

import type { AdherenceMealTag, TayyibatDailyLog, MealLog } from './tayyibat-adherence';

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

export type TimingIssueType =
    | 'too_many_meals'
    | 'insufficient_spacing'
    | 'late_eating'
    | 'unnecessary_snacking'
    | 'habit_driven_eating'
    | 'no_fasting_window'
    | 'compulsive_drinking';

export type TimingSeverity = 'mild' | 'moderate' | 'significant';

export interface TimingIssue {
    type: TimingIssueType;
    severity: TimingSeverity;
    message: string;
    suggestion: string;
}

export interface MealTimingAnalysis {
    /** Total meals logged today */
    mealCount: number;
    /** Whether meal count is within ideal range (2-3) */
    mealCountOk: boolean;
    /** Detected timing issues */
    issues: TimingIssue[];
    /** Overall timing adherence score (0-100) */
    timingScore: number;
    /** Whether eating appears hunger-driven */
    appearsHungerDriven: boolean;
    /** Has a meaningful fasting window (>= 14 hours) */
    hasFastingWindow: boolean;
    /** Estimated fasting hours (if calculable) */
    estimatedFastingHours: number;
}

export interface FastingAnalysis {
    /** Days with detected fasting in the period */
    fastingDays: number;
    /** Average estimated fasting hours */
    averageFastingHours: number;
    /** Whether fasting pattern is consistent */
    isConsistent: boolean;
    /** Fasting score (0-100) */
    fastingScore: number;
    /** Suggestion */
    suggestion: string;
}

export interface DrinkingPatternResult {
    /** Whether drinking pattern appears aligned */
    isAligned: boolean;
    /** Detected issues */
    issues: string[];
    /** Score (0-100) */
    score: number;
}

export interface HiddenNonAdherenceResult {
    /** Whether hidden non-adherence is detected */
    detected: boolean;
    /** Specific signals found */
    signals: HiddenSignal[];
    /** Overall severity */
    severity: TimingSeverity;
    /** Summary message */
    summary: string;
}

export interface HiddenSignal {
    type: string;
    message: string;
    evidence: string;
}

export interface BehaviorInsight {
    /** Main blocker: food | timing | fasting | behavior */
    mainBlocker: 'food' | 'timing' | 'fasting' | 'behavior' | 'none';
    /** Insight message */
    message: string;
    /** What would help most */
    topCorrection: string;
    /** Confidence in this assessment */
    confidence: 'high' | 'medium' | 'low';
}

/* ══════════════════════════════════════════════════════════
   MEAL TIMING ANALYSIS
   ══════════════════════════════════════════════════════════ */

const IDEAL_MEAL_COUNT_MIN = 2;
const IDEAL_MEAL_COUNT_MAX = 3;
const IDEAL_SPACING_HOURS = 5;
const LATE_EATING_HOUR = 21; // 9 PM
const MIN_FASTING_HOURS = 14;

/**
 * Analyze today's meal timing from a daily log.
 */
export function analyzeMealTiming(dailyLog: TayyibatDailyLog | null): MealTimingAnalysis {
    if (!dailyLog) {
        return {
            mealCount: 0, mealCountOk: true, issues: [],
            timingScore: 100, appearsHungerDriven: true,
            hasFastingWindow: true, estimatedFastingHours: 0,
        };
    }

    const meals = dailyLog.meals;
    const loggedMeals = Object.entries(meals).filter(([, m]) => m && m.items.length > 0);
    const mealCount = loggedMeals.length;
    const issues: TimingIssue[] = [];

    // Check meal count
    const mealCountOk = mealCount >= IDEAL_MEAL_COUNT_MIN && mealCount <= IDEAL_MEAL_COUNT_MAX;
    if (mealCount > IDEAL_MEAL_COUNT_MAX) {
        issues.push({
            type: 'too_many_meals',
            severity: mealCount > 5 ? 'significant' : 'moderate',
            message: `عدد الوجبات اليوم (${mealCount}) أكثر من المثالي`,
            suggestion: 'حاول تقليل الوجبات إلى ٢-٣ وجبات رئيسية فقط',
        });
    }

    // Check for unnecessary snacking
    const hasSnacks = !!(meals.morning_snack || meals.afternoon_snack);
    const mainMealCount = [meals.breakfast, meals.lunch, meals.dinner].filter(Boolean).length;
    if (hasSnacks && mainMealCount >= 3) {
        issues.push({
            type: 'unnecessary_snacking',
            severity: 'mild',
            message: 'تناولت وجبات خفيفة بالإضافة لـ ٣ وجبات رئيسية',
            suggestion: 'في نظام الطيبات، الأفضل تقليل التصبيرات والاكتفاء بالوجبات الرئيسية',
        });
    }

    // Check for late eating
    const hasDinner = !!meals.dinner;
    if (hasDinner && meals.dinner) {
        const dinnerTime = new Date(meals.dinner.loggedAt);
        if (dinnerTime.getHours() >= LATE_EATING_HOUR) {
            issues.push({
                type: 'late_eating',
                severity: 'moderate',
                message: `العشاء بعد الساعة ${LATE_EATING_HOUR}:00 — أكل متأخر`,
                suggestion: 'حاول إنهاء آخر وجبة قبل الساعة ٨ مساءً لتحسين الهضم والنوم',
            });
        }
    }

    // Estimate fasting window
    let estimatedFastingHours = 0;
    let hasFastingWindow = false;
    if (mealCount >= 2) {
        // Simple estimation: assume ~16 hours between last meal and first meal next day
        // if only 2 meals, fasting is likely longer
        estimatedFastingHours = mealCount <= 2 ? 18 : mealCount === 3 ? 14 : 10;
        hasFastingWindow = estimatedFastingHours >= MIN_FASTING_HOURS;
    }

    if (mealCount > 0 && !hasFastingWindow) {
        issues.push({
            type: 'no_fasting_window',
            severity: 'moderate',
            message: 'لا توجد فترة صيام كافية (أقل من ١٤ ساعة)',
            suggestion: 'حاول ترك فترة ١٤-١٦ ساعة بين آخر وجبة وأول وجبة في اليوم التالي',
        });
    }

    // Determine if hunger-driven
    const appearsHungerDriven = mealCount <= IDEAL_MEAL_COUNT_MAX && !hasSnacks;

    if (!appearsHungerDriven && mealCount > 0) {
        issues.push({
            type: 'habit_driven_eating',
            severity: 'mild',
            message: 'نمط الأكل يبدو مدفوعاً بالعادة أكثر من الجوع الحقيقي',
            suggestion: 'قبل كل وجبة، اسأل نفسك: هل أنا جائع فعلاً أم أن هذا وقت الأكل المعتاد؟',
        });
    }

    // Calculate timing score
    let timingScore = 100;
    for (const issue of issues) {
        if (issue.severity === 'significant') timingScore -= 25;
        else if (issue.severity === 'moderate') timingScore -= 15;
        else timingScore -= 8;
    }
    timingScore = Math.max(0, timingScore);

    return {
        mealCount, mealCountOk, issues, timingScore,
        appearsHungerDriven, hasFastingWindow, estimatedFastingHours,
    };
}

/* ══════════════════════════════════════════════════════════
   FASTING ANALYSIS (Multi-day)
   ══════════════════════════════════════════════════════════ */

/**
 * Analyze fasting patterns over multiple days.
 */
export function analyzeFastingPattern(dailyLogs: TayyibatDailyLog[]): FastingAnalysis {
    if (dailyLogs.length === 0) {
        return {
            fastingDays: 0, averageFastingHours: 0,
            isConsistent: false, fastingScore: 0,
            suggestion: 'لم يتم تسجيل وجبات بعد — ابدأ بتسجيل وجباتك اليومية',
        };
    }

    let totalFastingHours = 0;
    let fastingDays = 0;

    for (const log of dailyLogs) {
        const timing = analyzeMealTiming(log);
        if (timing.hasFastingWindow) {
            fastingDays++;
        }
        totalFastingHours += timing.estimatedFastingHours;
    }

    const averageFastingHours = Math.round(totalFastingHours / dailyLogs.length);
    const fastingRatio = fastingDays / dailyLogs.length;
    const isConsistent = fastingRatio >= 0.7;
    const fastingScore = Math.round(fastingRatio * 100);

    let suggestion: string;
    if (fastingScore >= 80) {
        suggestion = 'ممتاز — نمط الصيام منتظم ومتسق مع نظام الطيبات';
    } else if (fastingScore >= 50) {
        suggestion = 'جيد — حاول زيادة أيام الصيام المتقطع للوصول للاتساق';
    } else {
        suggestion = 'نمط الصيام ضعيف — ابدأ بترك فترة ١٤ ساعة بين العشاء والفطور';
    }

    return { fastingDays, averageFastingHours, isConsistent, fastingScore, suggestion };
}

/* ══════════════════════════════════════════════════════════
   DRINKING PATTERN ANALYSIS
   ══════════════════════════════════════════════════════════ */

const FORBIDDEN_DRINKS = ['بيبسي', 'كوكاكولا', 'كولا', 'سفن أب', '7up', 'غازية', 'ببسي', 'فانتا', 'سبرايت'];
const ALLOWED_DRINKS = ['ماء', 'مياه', 'شاي', 'قهوة', 'نسكافيه', 'ينسون', 'كركديه', 'حلبة', 'كاكاو', 'عصير طازج'];

/**
 * Analyze drinking patterns from meal log.
 */
export function analyzeDrinkingPattern(dailyLog: TayyibatDailyLog | null): DrinkingPatternResult {
    if (!dailyLog || !dailyLog.meals.drinks) {
        return { isAligned: true, issues: [], score: 100 };
    }

    const drinkItems = dailyLog.meals.drinks.items;
    const issues: string[] = [];
    let score = 100;

    for (const item of drinkItems) {
        const rawLower = item.raw.toLowerCase();
        // Check for forbidden drinks
        for (const forbidden of FORBIDDEN_DRINKS) {
            if (rawLower.includes(forbidden)) {
                issues.push(`"${item.raw}" — مشروب غازي ممنوع في نظام الطيبات`);
                score -= 20;
            }
        }
    }

    // Check if drink count seems excessive (more than 6 entries)
    if (drinkItems.length > 6) {
        issues.push('عدد المشروبات كثير — تأكد أنك تشرب على العطش لا بالعادة');
        score -= 10;
    }

    return { isAligned: issues.length === 0, issues, score: Math.max(0, score) };
}

/* ══════════════════════════════════════════════════════════
   HIDDEN NON-ADHERENCE DETECTION (Behavioral)
   ══════════════════════════════════════════════════════════ */

/**
 * Detect hidden non-adherence from behavioral patterns across multiple days.
 */
export function detectBehavioralNonAdherence(
    dailyLogs: TayyibatDailyLog[],
    selfReportedAdherence: string, // 'full' | 'partial' | 'inconsistent' | etc
): HiddenNonAdherenceResult {
    const signals: HiddenSignal[] = [];

    if (dailyLogs.length === 0) {
        return { detected: false, signals: [], severity: 'mild', summary: '' };
    }

    // Signal 1: Claims full adherence but violations exist
    const totalViolations = dailyLogs.reduce((s, l) => s + l.totalViolations, 0);
    if (selfReportedAdherence === 'full' && totalViolations > 0) {
        signals.push({
            type: 'self_report_mismatch',
            message: 'أبلغت عن التزام كامل لكن يوجد مخالفات في السجل',
            evidence: `${totalViolations} مخالفة مسجلة مع تقرير "التزام كامل"`,
        });
    }

    // Signal 2: Violations cluster in one meal repeatedly
    const mealViolationMap: Record<string, number> = {};
    for (const log of dailyLogs) {
        for (const [tag, meal] of Object.entries(log.meals)) {
            if (meal && meal.violationCount > 0) {
                mealViolationMap[tag] = (mealViolationMap[tag] || 0) + meal.violationCount;
            }
        }
    }
    const worstMealEntry = Object.entries(mealViolationMap).sort(([, a], [, b]) => b - a)[0];
    if (worstMealEntry && worstMealEntry[1] >= 3) {
        const mealLabels: Record<string, string> = {
            breakfast: 'الفطور', lunch: 'الغداء', dinner: 'العشاء',
            morning_snack: 'تصبيرة الصباح', afternoon_snack: 'تصبيرة العصر', drinks: 'المشروبات',
        };
        signals.push({
            type: 'meal_cluster_violation',
            message: `المخالفات تتركز في "${mealLabels[worstMealEntry[0]] || worstMealEntry[0]}" بشكل متكرر`,
            evidence: `${worstMealEntry[1]} مخالفات في هذه الوجبة خلال ${dailyLogs.length} أيام`,
        });
    }

    // Signal 3: Good food categories but problematic timing
    const avgAdherence = dailyLogs.reduce((s, l) => s + l.adherenceScore, 0) / dailyLogs.length;
    const timingIssueCount = dailyLogs.reduce((s, l) => {
        const timing = analyzeMealTiming(l);
        return s + timing.issues.length;
    }, 0);
    if (avgAdherence > 0.7 && timingIssueCount > dailyLogs.length * 2) {
        signals.push({
            type: 'timing_undermining',
            message: 'الطعام مسموح لكن التوقيت يخرق النظام',
            evidence: 'التزام جيد بالأصناف لكن التوقيت والتباعد ضعيف',
        });
    }

    // Signal 4: Symptom persistence despite "adherence"
    // This would need symptom data — placeholder for integration
    if (selfReportedAdherence === 'full' && avgAdherence < 0.6) {
        signals.push({
            type: 'low_actual_adherence',
            message: 'الالتزام الفعلي أقل مما تم الإبلاغ عنه',
            evidence: `متوسط الالتزام الفعلي: ${Math.round(avgAdherence * 100)}% رغم الإبلاغ عن التزام كامل`,
        });
    }

    const detected = signals.length > 0;
    let severity: TimingSeverity = 'mild';
    if (signals.length >= 3) severity = 'significant';
    else if (signals.length >= 1) severity = 'moderate';

    let summary = '';
    if (detected) {
        if (severity === 'significant') {
            summary = 'يوجد عدة مؤشرات على عدم التزام خفي — مراجعة دقيقة لنمط الأكل ستساعد كثيراً';
        } else {
            summary = 'يوجد مؤشر على عدم التزام جزئي — تصحيح بسيط قد يُحدث فرقاً كبيراً';
        }
    }

    return { detected, signals, severity, summary };
}

/* ══════════════════════════════════════════════════════════
   BEHAVIOR INSIGHT — Main Blocker Detection
   ══════════════════════════════════════════════════════════ */

/**
 * Determine the main blocker and provide actionable insight.
 */
export function generateBehaviorInsight(
    dailyLog: TayyibatDailyLog | null,
    weeklyLogs: TayyibatDailyLog[],
): BehaviorInsight {
    if (!dailyLog && weeklyLogs.length === 0) {
        return {
            mainBlocker: 'none',
            message: 'ابدأ بتسجيل وجباتك لتحصل على تحليل سلوكي مفصّل',
            topCorrection: 'سجّل وجبة واحدة على الأقل اليوم',
            confidence: 'low',
        };
    }

    // Analyze current state
    const timing = analyzeMealTiming(dailyLog);
    const foodAdherence = dailyLog ? dailyLog.adherenceScore : 0;
    const weeklyViolations = weeklyLogs.reduce((s, l) => s + l.totalViolations, 0);
    const weeklyTimingIssues = weeklyLogs.reduce((s, l) => {
        return s + analyzeMealTiming(l).issues.length;
    }, 0);

    // Determine main blocker
    if (foodAdherence < 0.5 && weeklyViolations > 5) {
        return {
            mainBlocker: 'food',
            message: 'المشكلة الرئيسية في اختيار الأطعمة — مخالفات متكررة في الأصناف',
            topCorrection: dailyLog?.worstViolation
                ? `ابدأ بإزالة "${dailyLog.worstViolation}" — هذا أكبر مخالفة`
                : 'راجع قائمة المسموح والممنوع وابدأ بأسهل بديل',
            confidence: 'high',
        };
    }

    if (timing.timingScore < 50) {
        return {
            mainBlocker: 'timing',
            message: 'الأصناف قد تكون مقبولة لكن التوقيت يخرق النظام',
            topCorrection: timing.issues[0]?.suggestion || 'قلل الوجبات إلى ٢-٣ وزد المسافة بينها',
            confidence: 'high',
        };
    }

    if (!timing.hasFastingWindow && weeklyLogs.length >= 3) {
        return {
            mainBlocker: 'fasting',
            message: 'لا توجد فترة صيام كافية — الجسم لا يحصل على وقت للراحة الهضمية',
            topCorrection: 'اجعل آخر وجبة قبل ٨ مساءً وأول وجبة بعد ١٠ صباحاً',
            confidence: 'medium',
        };
    }

    if (weeklyTimingIssues > 3) {
        return {
            mainBlocker: 'behavior',
            message: 'نمط الأكل مدفوع بالعادة أكثر من الجوع — تعديل السلوك أولاً',
            topCorrection: 'قبل كل وجبة: هل أنا جائع فعلاً؟ إذا لا، انتظر ساعة',
            confidence: 'medium',
        };
    }

    return {
        mainBlocker: 'none',
        message: 'الأداء جيد — حافظ على هذا النمط وراقب الأعراض',
        topCorrection: 'استمر في التسجيل اليومي لمتابعة التقدم',
        confidence: 'high',
    };
}

/* ══════════════════════════════════════════════════════════
   EASIEST NEXT CORRECTION
   ══════════════════════════════════════════════════════════ */

export interface NextCorrection {
    /** What to fix */
    what: string;
    /** Why it matters */
    why: string;
    /** How to fix it */
    how: string;
    /** Expected impact */
    expectedImpact: 'high' | 'medium' | 'low';
}

/**
 * Identify the single easiest correction that would have the highest impact.
 */
export function getEasiestNextCorrection(
    dailyLog: TayyibatDailyLog | null,
    weeklyLogs: TayyibatDailyLog[],
): NextCorrection {
    const insight = generateBehaviorInsight(dailyLog, weeklyLogs);

    if (insight.mainBlocker === 'food') {
        return {
            what: 'إزالة أكثر عنصر ممنوع تكراراً',
            why: 'المخالفات الغذائية المتكررة تُبطل أثر باقي الالتزام',
            how: insight.topCorrection,
            expectedImpact: 'high',
        };
    }

    if (insight.mainBlocker === 'timing') {
        return {
            what: 'ضبط توقيت الوجبات',
            why: 'حتى لو الطعام مسموح، التوقيت الخاطئ يُضعف النتائج',
            how: insight.topCorrection,
            expectedImpact: 'high',
        };
    }

    if (insight.mainBlocker === 'fasting') {
        return {
            what: 'إنشاء فترة صيام يومية',
            why: 'الصيام المتقطع ركن أساسي في نظام الطيبات',
            how: insight.topCorrection,
            expectedImpact: 'medium',
        };
    }

    return {
        what: 'الاستمرار في التسجيل اليومي',
        why: 'التسجيل المنتظم يكشف الأنماط الخفية',
        how: 'سجّل كل وجبة فور تناولها',
        expectedImpact: 'medium',
    };
}
