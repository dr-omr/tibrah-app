// lib/tayyibat/tayyibat-store.ts
// ══════════════════════════════════════════════════════════
// طبقة الحالة الدائمة لنظام الطيبات (localStorage)
// نمط متوافق مع assessment-session-store.ts الموجود
// ══════════════════════════════════════════════════════════

import type { TayyibatAnswers, TayyibatScoreOutput } from './tayyibat-scoring-engine';
import type { TayyibatMeal, WeeklyInsight }          from './meal-tracker';
import type { ClinicalPattern }                       from './pattern-engine';

// ── Keys ──
const KEYS = {
    SESSION:        'tibrah_tayyibat_session',
    RESULT:         'tibrah_tayyibat_result',
    MEAL_LOGS:      'tibrah_tayyibat_meals',
    DRAFT_ANSWERS:  'tibrah_tayyibat_draft',
} as const;

// ── نوع جلسة التقييم ──
export interface TayyibatSession {
    id:              string;
    mode:            'quick' | 'deep';
    startedAt:       string;
    completedAt?:    string;
    answeredCount:   number;
    answers:         Partial<TayyibatAnswers>;
    rawAnswers:      Record<string, string | string[]>; // إجابات خام (تشمل multi-choice)
    currentStep:     number;
}

// ── نوع النتيجة المحفوظة ──
export interface StoredTayyibatResult {
    sessionId:          string;
    computedAt:         string;
    overallScore:       number;
    primaryPattern:     ClinicalPattern;
    secondaryPatterns:  ClinicalPattern[];
    confidenceScore:    number;
    confidenceLabel:    'low' | 'medium' | 'high';
    topThreeGaps:       string[];
    firstStepToday:     string;
    sevenDayPlan:       string[];
    hasSafetyGate:      boolean;
    mealLogCountAtTime: number;
    fullOutput:         TayyibatScoreOutput;
}

// ── helpers ──
function safeGet<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch { return null; }
}
function safeSet(key: string, val: unknown): void {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(key, JSON.stringify(val)); }
    catch { /* quota */ }
}
function genId(): string {
    return `tay_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
}

// ══════════════════════════════════════════════════════════
// SESSION MANAGEMENT
// ══════════════════════════════════════════════════════════

export function startNewSession(mode: 'quick' | 'deep'): TayyibatSession {
    const session: TayyibatSession = {
        id: genId(), mode, startedAt: new Date().toISOString(),
        answeredCount: 0, answers: {}, rawAnswers: {}, currentStep: 0,
    };
    safeSet(KEYS.SESSION, session);
    return session;
}

export function getActiveSession(): TayyibatSession | null {
    return safeGet<TayyibatSession>(KEYS.SESSION);
}

export function updateSessionAnswer(
    questionId: string,
    value: string | string[],
    mappedKey?: keyof TayyibatAnswers,
    mappedValue?: string,
): void {
    const s = getActiveSession();
    if (!s) return;
    s.rawAnswers[questionId] = value;
    if (mappedKey && mappedValue !== undefined) {
        (s.answers as Record<string, unknown>)[mappedKey] = mappedValue;
    }
    s.answeredCount = Object.keys(s.rawAnswers).length;
    safeSet(KEYS.SESSION, s);
}

export function updateSessionStep(step: number): void {
    const s = getActiveSession();
    if (!s) return;
    s.currentStep = step;
    safeSet(KEYS.SESSION, s);
}

export function completeSession(): TayyibatSession | null {
    const s = getActiveSession();
    if (!s) return null;
    s.completedAt = new Date().toISOString();
    safeSet(KEYS.SESSION, s);
    return s;
}

export function clearSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEYS.SESSION);
}

// ══════════════════════════════════════════════════════════
// RESULT PERSISTENCE
// ══════════════════════════════════════════════════════════

export function saveResult(result: StoredTayyibatResult): void {
    safeSet(KEYS.RESULT, result);
}

export function getStoredResult(): StoredTayyibatResult | null {
    return safeGet<StoredTayyibatResult>(KEYS.RESULT);
}

export function clearResult(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEYS.RESULT);
}

// ══════════════════════════════════════════════════════════
// MEAL LOG PERSISTENCE
// ══════════════════════════════════════════════════════════

export function getMealLogs(): TayyibatMeal[] {
    return safeGet<TayyibatMeal[]>(KEYS.MEAL_LOGS) ?? [];
}

export function addMealLog(meal: Omit<TayyibatMeal, 'id' | 'createdAt'>): TayyibatMeal {
    const logs = getMealLogs();
    const full: TayyibatMeal = {
        ...meal,
        id: genId(),
        createdAt: Date.now(),
        date: new Date().toISOString().split('T')[0],
    };
    logs.unshift(full);
    // احتفظ بآخر 200 وجبة فقط
    if (logs.length > 200) logs.splice(200);
    safeSet(KEYS.MEAL_LOGS, logs);
    return full;
}

export function getMealLogsForDate(date: string): TayyibatMeal[] {
    return getMealLogs().filter(m => m.date === date);
}

export function getMealLogsForLastNDays(n: number): TayyibatMeal[] {
    const cutoff = Date.now() - n * 24 * 60 * 60 * 1000;
    return getMealLogs().filter(m => m.createdAt >= cutoff);
}

export function getMealLogCount(): number {
    return getMealLogs().length;
}

// ══════════════════════════════════════════════════════════
// CONFIDENCE RECALCULATION BASED ON TRACKER DATA
// ══════════════════════════════════════════════════════════

export function getConfidenceWithTrackerData(): {
    score: number; label: 'low' | 'medium' | 'high'; note: string | null;
} {
    const result  = getStoredResult();
    const logCount = getMealLogCount();

    if (!result) return { score: 0, label: 'low', note: null };

    // ارفع الثقة بناءً على عدد الوجبات المسجلة
    const baseScore  = result.confidenceScore;
    const trackerBonus = Math.min(30, logCount * 6); // حتى ٣٠ نقطة
    const newScore = Math.min(100, baseScore + trackerBonus);
    const label: 'low'|'medium'|'high' = newScore >= 65 ? 'high' : newScore >= 35 ? 'medium' : 'low';

    const note = logCount >= 5
        ? 'ارتفعت موثوقية النتيجة لأنك سجّلت بيانات واقعية من وجباتك.'
        : logCount > 0
        ? `سجّلت ${logCount} وجبة — أضف ${5 - logCount} وجبات أخرى لرؤية أوثق.`
        : null;

    return { score: newScore, label, note };
}

// ══════════════════════════════════════════════════════════
// DRAFT (حفظ إجابات جزئية لمنع الفقدان عند التنقل)
// ══════════════════════════════════════════════════════════

export function saveDraftAnswers(answers: Record<string, string | string[]>, step: number): void {
    safeSet(KEYS.DRAFT_ANSWERS, { answers, step, savedAt: Date.now() });
}

export function getDraftAnswers(): { answers: Record<string, string | string[]>; step: number } | null {
    const d = safeGet<{ answers: Record<string, string|string[]>; step: number; savedAt: number }>(KEYS.DRAFT_ANSWERS);
    if (!d) return null;
    // انتهاء صلاحية المسودة بعد ٢٤ ساعة
    if (Date.now() - d.savedAt > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(KEYS.DRAFT_ANSWERS);
        return null;
    }
    return { answers: d.answers, step: d.step };
}

export function clearDraft(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEYS.DRAFT_ANSWERS);
}
