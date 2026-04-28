// lib/nutrition/tayyibat-adherence.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Tayyibat Adherence Tracking Store
// ════════════════════════════════════════════════════════════════════════
//
// Tracks daily meal-level adherence to the Tayyibat system.
// Stores per-meal logs, computes daily/weekly scores,
// identifies weakest meals, and suggests corrections.
//
// SSR-safe: all reads return defaults on server.
// ════════════════════════════════════════════════════════════════════════

import { analyzeMeal, classifyFoodItem, getSubstituteSuggestion } from './tayyibat-engine';
import type { FoodClassification } from './tayyibat-engine';
import type { MealTag } from './tayyibat-source';
import { MEAL_TAG_LABELS } from './tayyibat-source';

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

export type AdherenceMealTag = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'drinks';

export interface MealLogItem {
    /** ما كتبه المستخدم */
    raw: string;
    /** التصنيف الآلي */
    classification: FoodClassification;
    /** العنصر المُطابَق (إن وجد) */
    matchedItem?: string;
}

export interface MealLog {
    /** فترة الوجبة */
    mealTag: AdherenceMealTag;
    /** عناصر الوجبة */
    items: MealLogItem[];
    /** عدد المخالفات */
    violationCount: number;
    /** نسبة الالتزام (0–1) */
    adherenceRatio: number;
    /** وقت التسجيل */
    loggedAt: string;
}

export interface TayyibatDailyLog {
    /** التاريخ (YYYY-MM-DD) */
    date: string;
    /** سجلات الوجبات */
    meals: Partial<Record<AdherenceMealTag, MealLog>>;
    /** إجمالي المخالفات */
    totalViolations: number;
    /** نسبة الالتزام الإجمالية (0–1) */
    adherenceScore: number;
    /** أخطر مخالفة */
    worstViolation?: string;
}

export interface WeeklyAdherenceSummary {
    /** عدد الأيام المسجلة */
    daysLogged: number;
    /** متوسط الالتزام */
    averageAdherence: number;
    /** إجمالي المخالفات */
    totalViolations: number;
    /** أضعف وجبة */
    weakestMeal?: AdherenceMealTag;
    /** أكثر مخالفة تكراراً */
    mostRepeatedViolation?: string;
    /** الاتجاه: تحسن / ثبات / تراجع */
    trend: 'improving' | 'stable' | 'declining';
    /** التصحيح الأسهل */
    easiestCorrection?: string;
}

/* ══════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════ */

const KEY_DAILY_LOGS  = 'tibrah_tayyibat_daily_logs';
const MAX_DAYS_STORED = 90; // 3 months

export const ADHERENCE_MEAL_LABELS: Record<AdherenceMealTag, string> = {
    breakfast:        'فطور',
    morning_snack:    'تصبيرة صباح',
    lunch:            'غداء',
    afternoon_snack:  'تصبيرة عصر',
    dinner:           'عشاء',
    drinks:           'مشروبات',
};

/* ══════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════ */

function safeGetJSON<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function safeSetJSON(key: string, value: unknown): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch { /* quota */ }
}

function todayDateString(): string {
    return new Date().toISOString().split('T')[0];
}

/* ══════════════════════════════════════════════════════════
   MEAL LOGGING
   ══════════════════════════════════════════════════════════ */

/**
 * Log a meal — classifies items and stores the result.
 * @param mealTag - which meal period
 * @param rawItems - user-entered food items (comma or newline separated text → pre-split)
 */
export function logMeal(mealTag: AdherenceMealTag, rawItems: string[]): MealLog {
    const items: MealLogItem[] = rawItems
        .map(r => r.trim())
        .filter(Boolean)
        .map(raw => {
            const result = classifyFoodItem(raw);
            return {
                raw,
                classification: result.classification,
                matchedItem: result.matchedItem,
            };
        });

    const violations = items.filter(i => i.classification === 'forbidden');
    const allowed    = items.filter(i => i.classification === 'allowed');
    const total      = items.length || 1;

    const meal: MealLog = {
        mealTag,
        items,
        violationCount: violations.length,
        adherenceRatio: allowed.length / total,
        loggedAt: new Date().toISOString(),
    };

    // Save to daily log
    const today = todayDateString();
    const dailyLog = getDailyLog(today) || createEmptyDailyLog(today);
    dailyLog.meals[mealTag] = meal;
    recalculateDailyScore(dailyLog);
    saveDailyLog(dailyLog);

    return meal;
}

/**
 * Create an empty daily log for a given date.
 */
function createEmptyDailyLog(date: string): TayyibatDailyLog {
    return {
        date,
        meals: {},
        totalViolations: 0,
        adherenceScore: 0,
    };
}

/**
 * Recalculate the daily adherence score from individual meal logs.
 */
function recalculateDailyScore(dailyLog: TayyibatDailyLog): void {
    const meals = Object.values(dailyLog.meals).filter(Boolean) as MealLog[];
    if (meals.length === 0) {
        dailyLog.adherenceScore = 0;
        dailyLog.totalViolations = 0;
        return;
    }

    let totalItems     = 0;
    let allowedItems   = 0;
    let totalViolations = 0;
    let worstViolation: string | undefined;
    let maxViolationCount = 0;

    for (const meal of meals) {
        totalItems += meal.items.length;
        allowedItems += meal.items.filter(i => i.classification === 'allowed').length;
        totalViolations += meal.violationCount;
        if (meal.violationCount > maxViolationCount) {
            maxViolationCount = meal.violationCount;
            const firstViolation = meal.items.find(i => i.classification === 'forbidden');
            worstViolation = firstViolation?.raw;
        }
    }

    dailyLog.totalViolations = totalViolations;
    dailyLog.adherenceScore = totalItems > 0 ? allowedItems / totalItems : 0;
    dailyLog.worstViolation = worstViolation;
}

/* ══════════════════════════════════════════════════════════
   STORAGE
   ══════════════════════════════════════════════════════════ */

function getAllDailyLogs(): TayyibatDailyLog[] {
    return safeGetJSON<TayyibatDailyLog[]>(KEY_DAILY_LOGS) || [];
}

function saveDailyLog(log: TayyibatDailyLog): void {
    const all = getAllDailyLogs();
    const idx = all.findIndex(l => l.date === log.date);
    if (idx >= 0) {
        all[idx] = log;
    } else {
        all.unshift(log);
    }

    // Enforce max storage
    while (all.length > MAX_DAYS_STORED) {
        all.pop();
    }

    safeSetJSON(KEY_DAILY_LOGS, all);
}

/* ══════════════════════════════════════════════════════════
   READ — DAILY
   ══════════════════════════════════════════════════════════ */

/** Get daily log for a specific date (YYYY-MM-DD). */
export function getDailyLog(date: string): TayyibatDailyLog | null {
    const all = getAllDailyLogs();
    return all.find(l => l.date === date) || null;
}

/** Get today's daily log. */
export function getTodayLog(): TayyibatDailyLog | null {
    return getDailyLog(todayDateString());
}

/** Get daily adherence score for a specific date (0–100). */
export function getDailyAdherence(date: string): number {
    const log = getDailyLog(date);
    return log ? Math.round(log.adherenceScore * 100) : 0;
}

/** Get today's adherence score (0–100). */
export function getTodayAdherence(): number {
    return getDailyAdherence(todayDateString());
}

/* ══════════════════════════════════════════════════════════
   READ — MULTI-DAY SUMMARIES
   ══════════════════════════════════════════════════════════ */

/** Get logs for the last N days. */
function getLastNDaysLogs(n: number): TayyibatDailyLog[] {
    const all = getAllDailyLogs();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - n);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return all.filter(l => l.date >= cutoffStr).sort((a, b) => a.date.localeCompare(b.date));
}

/** 3-day adherence summary. */
export function getThreeDayAdherence(): { average: number; days: Array<{ date: string; score: number }> } {
    const logs = getLastNDaysLogs(3);
    const days = logs.map(l => ({ date: l.date, score: Math.round(l.adherenceScore * 100) }));
    const average = days.length > 0
        ? Math.round(days.reduce((sum, d) => sum + d.score, 0) / days.length)
        : 0;
    return { average, days };
}

/** Weekly adherence summary with trend analysis. */
export function getWeeklyAdherence(): WeeklyAdherenceSummary {
    const logs = getLastNDaysLogs(7);

    if (logs.length === 0) {
        return {
            daysLogged: 0,
            averageAdherence: 0,
            totalViolations: 0,
            trend: 'stable',
        };
    }

    // Compute averages
    const totalAdherence   = logs.reduce((sum, l) => sum + l.adherenceScore, 0);
    const averageAdherence = Math.round((totalAdherence / logs.length) * 100);
    const totalViolations  = logs.reduce((sum, l) => sum + l.totalViolations, 0);

    // Find weakest meal
    const mealViolations: Record<string, number> = {};
    for (const log of logs) {
        for (const [tag, meal] of Object.entries(log.meals)) {
            if (meal) {
                mealViolations[tag] = (mealViolations[tag] || 0) + meal.violationCount;
            }
        }
    }
    const weakestMeal = Object.entries(mealViolations)
        .sort(([, a], [, b]) => b - a)[0]?.[0] as AdherenceMealTag | undefined;

    // Find most repeated violation
    const violationCounts: Record<string, number> = {};
    for (const log of logs) {
        for (const meal of Object.values(log.meals)) {
            if (meal) {
                for (const item of meal.items) {
                    if (item.classification === 'forbidden') {
                        const key = item.matchedItem || item.raw;
                        violationCounts[key] = (violationCounts[key] || 0) + 1;
                    }
                }
            }
        }
    }
    const mostRepeatedViolation = Object.entries(violationCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0];

    // Trend: compare first half vs second half
    const midpoint = Math.ceil(logs.length / 2);
    const firstHalf  = logs.slice(0, midpoint);
    const secondHalf = logs.slice(midpoint);
    const firstAvg  = firstHalf.reduce((s, l) => s + l.adherenceScore, 0) / (firstHalf.length || 1);
    const secondAvg = secondHalf.reduce((s, l) => s + l.adherenceScore, 0) / (secondHalf.length || 1);
    const trendDiff = secondAvg - firstAvg;
    const trend: 'improving' | 'stable' | 'declining' =
        trendDiff > 0.08 ? 'improving' :
        trendDiff < -0.08 ? 'declining' : 'stable';

    // Easiest correction: the most frequent violation with available substitutes
    let easiestCorrection: string | undefined;
    if (mostRepeatedViolation) {
        const subs = getSubstituteSuggestion(mostRepeatedViolation);
        if (subs.length > 0) {
            easiestCorrection = `استبدل "${mostRepeatedViolation}" بـ "${subs[0]}"`;
        }
    }

    return {
        daysLogged: logs.length,
        averageAdherence,
        totalViolations,
        weakestMeal,
        mostRepeatedViolation,
        trend,
        easiestCorrection,
    };
}

/** Get violation trend over the last N days. */
export function getViolationTrend(days: number = 7): Array<{ date: string; violations: number }> {
    const logs = getLastNDaysLogs(days);
    return logs.map(l => ({ date: l.date, violations: l.totalViolations }));
}

/** Check if any log exists (for showing/hiding UI elements). */
export function hasAnyTayyibatLog(): boolean {
    return getAllDailyLogs().length > 0;
}
