// lib/outcome-store.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Protocol Outcome Store (Sprint 2)
// ════════════════════════════════════════════════════════════════════════
//
// يخزّن نتيجة كل يوم من البروتوكول بشكل مستقل تماماً.
// لا تعتمد على computeRouting أو care-plan-store — طبقة additive خالصة.
//
// الفرق الجوهري المُطبَّق هنا:
//   adherenceCompleted = هل فعل المستخدم المطلوب؟
//   outcomeScore       = هل تحسّن العرض فعلاً؟ (1-10، 10=أسوأ)
//
// baselineOutcomeScore يُحفظ عند بداية البروتوكول للمقارنة الحقيقية.
// دaysWithNoCheckin: الغياب لا يُعدّ no_response — يُعامَل كـ weak signal.
// ════════════════════════════════════════════════════════════════════════

/* ══════════════════════════════════════════════════════════
   DATA TYPES
   ══════════════════════════════════════════════════════════ */

export interface DayOutcome {
    /** مشتقة من plan.createdAt — مُعرِّف الخطة */
    planId:             string;
    subdomainId:        string;
    /** اليوم الحالي من البروتوكول (1–7) */
    day:                number;
    /** adherence: هل أكمل مهمة اليوم؟ */
    adherenceCompleted: boolean;
    /** outcome: شدة الأعراض اليوم (1=أفضل, 10=أسوأ) */
    outcomeScore:       number;
    /** رأي المستخدم المباشر مقارنة بأمس */
    feltBetter:         'better' | 'same' | 'worse';
    /** ملاحظة اختيارية، حد أقصى 100 حرف */
    note?:              string;
    /** وقت التسجيل */
    checkedAt:          string;
}

export interface ProtocolBaseline {
    planId:              string;
    subdomainId:         string;
    /** درجة الأعراض عند بداية البروتوكول — للمقارنة الحقيقية */
    baselineOutcomeScore: number;
    startedAt:           string;
}

/* ══════════════════════════════════════════════════════════
   STORAGE KEYS
   ══════════════════════════════════════════════════════════ */

const OUTCOMES_PREFIX = 'tibrah_outcomes_';
const BASELINE_PREFIX = 'tibrah_baseline_';

function outcomesKey(planId: string): string {
    return `${OUTCOMES_PREFIX}${planId}`;
}

function baselineKey(planId: string): string {
    return `${BASELINE_PREFIX}${planId}`;
}

/* ══════════════════════════════════════════════════════════
   OUTCOMES CRUD
   ══════════════════════════════════════════════════════════ */

/**
 * يحفظ نتيجة يوم — إذا سجّل نفس اليوم مسبقاً يُحدَّث لا يُضاف.
 */
export function saveDayOutcome(outcome: DayOutcome): void {
    if (typeof window === 'undefined') return;
    try {
        const existing = getDayOutcomes(outcome.planId);
        const idx = existing.findIndex(o => o.day === outcome.day);
        if (idx >= 0) {
            existing[idx] = outcome;
        } else {
            existing.push(outcome);
        }
        localStorage.setItem(outcomesKey(outcome.planId), JSON.stringify(existing));
    } catch { /* quota exceeded — ignore */ }
}

/** كل الـ outcomes لخطة معينة، مرتبة تصاعدياً. */
export function getDayOutcomes(planId: string): DayOutcome[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(outcomesKey(planId));
        const list: DayOutcome[] = raw ? JSON.parse(raw) : [];
        return list.sort((a, b) => a.day - b.day);
    } catch { return []; }
}

/** outcome يوم محدد، أو null إذا لم يُسجَّل. */
export function getDayOutcome(planId: string, day: number): DayOutcome | null {
    return getDayOutcomes(planId).find(o => o.day === day) ?? null;
}

/** هل سجّل المستخدم هذا اليوم بالفعل؟ */
export function hasDayOutcome(planId: string, day: number): boolean {
    return getDayOutcome(planId, day) !== null;
}

/* ══════════════════════════════════════════════════════════
   BASELINE
   ══════════════════════════════════════════════════════════ */

/** يحفظ الـ baseline عند أول check-in. */
export function saveProtocolBaseline(baseline: ProtocolBaseline): void {
    if (typeof window === 'undefined') return;
    try {
        // نحفظ مرة واحدة فقط — لا نُغيّره لاحقاً
        const existing = getProtocolBaseline(baseline.planId);
        if (!existing) {
            localStorage.setItem(baselineKey(baseline.planId), JSON.stringify(baseline));
        }
    } catch { /* quota */ }
}

export function getProtocolBaseline(planId: string): ProtocolBaseline | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(baselineKey(planId));
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

/* ══════════════════════════════════════════════════════════
   UTILS
   ══════════════════════════════════════════════════════════ */

/**
 * يشتق planId ثابت من plan.createdAt.
 * نستخدم أرقام الـ timestamp فقط (16 خانة = دقة الملي-ثانية).
 */
export function getPlanId(createdAt: string): string {
    return createdAt.replace(/[^0-9]/g, '').slice(0, 16);
}

/**
 * عدد الأيام التي مرّت بين يوم 1 والـ currentDay ولم يُسجَّل فيها check-in.
 * الغياب لا يعني no_response — يُعامَل كـ "weak signal" في trend engine.
 */
export function getMissingDays(planId: string, currentDay: number): number {
    const outcomes = getDayOutcomes(planId);
    const checkedDays = new Set(outcomes.map(o => o.day));
    let missing = 0;
    for (let d = 1; d < currentDay; d++) {
        if (!checkedDays.has(d)) missing++;
    }
    return missing;
}

/**
 * هل سجّل المستخدم اليوم الحالي؟ (اليوم بالتاريخ، ليس رقم يوم البروتوكول)
 */
export function hasTodayOutcome(planId: string, protocolDay: number): boolean {
    const outcome = getDayOutcome(planId, protocolDay);
    if (!outcome) return false;
    // تحقق أن التسجيل كان حديثاً (نفس اليوم الميلادي)
    const today = new Date().toDateString();
    const checkedDate = new Date(outcome.checkedAt).toDateString();
    return today === checkedDate;
}
