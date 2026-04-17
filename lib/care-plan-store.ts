// lib/care-plan-store.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Care Plan Persistence Layer
// ════════════════════════════════════════════════════════════════════════
//
// Single source of truth: localStorage
// - One active plan at a time
// - New assessment archives the previous automatically
// - Cloud sync (Firestore) is NOT a dependency — added later
// ════════════════════════════════════════════════════════════════════════

import type {
    RoutingResult,
    TriageResult,
    EngineAnswers,
    DomainId,
    SubdomainId,
    TriageLevel,
} from '@/components/health-engine/types';

/* ══════════════════════════════════════════════════════════
   DATA MODEL
   ══════════════════════════════════════════════════════════ */

export type EscalationState = 'none' | 'review' | 'needs_doctor' | 'urgent' | 'emergency';
export type PlanConfidence = 'high' | 'medium' | 'low';
export type PlanStatus = 'active' | 'archived';

export interface SavedCarePlan {
    /** Unique ID (timestamp-based) */
    id: string;
    /** Schema version for future migrations */
    version: number;
    /** ISO timestamp of creation */
    createdAt: string;
    /** ISO timestamp of last view */
    lastViewedAt: string;
    /** Current status */
    status: PlanStatus;

    /* ── Routing output ── */
    routing: RoutingResult;
    triage: TriageResult;

    /* ── Input snapshot ── */
    answers: EngineAnswers;

    /* ── Tool engagement tracking ── */
    /** IDs of recommended tools (snapshot from routing) */
    recommendedToolIds: string[];
    /** IDs of tools the user has opened */
    toolsOpened: string[];
    /** IDs of tools the user has *fully completed* */
    toolsCompleted: string[];
    /** Daily checklist state: date → completed task IDs */
    dailyChecklist: Record<string, string[]>;

    /* ── Safety ── */
    escalationState: EscalationState;
    confidence: PlanConfidence;
}

/* ══════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════ */

const CURRENT_VERSION = 1;
const KEY_ACTIVE  = 'tibrah_care_plan_active';
const KEY_HISTORY = 'tibrah_care_plan_history';
const MAX_HISTORY = 20;

/* ══════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════ */

function generateId(): string {
    return `cp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function deriveEscalationState(triage: TriageResult, routing: RoutingResult): EscalationState {
    if (triage.level === 'emergency') return 'emergency';
    if (triage.level === 'urgent') return 'urgent';
    if (triage.level === 'needs_doctor' || triage.score >= 8) return 'needs_doctor';
    if (routing.escalation_needed) return 'review';
    return 'none';
}

function deriveConfidence(routing: RoutingResult): PlanConfidence {
    const scores = routing.domain_scores;
    const sorted = Object.values(scores).sort((a, b) => b - a);
    const gap = sorted[0] - sorted[1]; // gap between primary and secondary

    if (gap >= 30) return 'high';
    if (gap >= 15) return 'medium';
    return 'low';
}

function safeGetJSON<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

function safeSetJSON(key: string, value: unknown): boolean {
    if (typeof window === 'undefined') return false;
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        console.warn(`[CarePlanStore] Failed to write ${key}`);
        return false;
    }
}

/* ══════════════════════════════════════════════════════════
   PUBLIC API
   ══════════════════════════════════════════════════════════ */

/**
 * Save a new care plan from an assessment result.
 * - Archives any existing active plan automatically.
 * - Returns the saved plan.
 */
export function saveCarePlan(
    routing: RoutingResult,
    triage: TriageResult,
    answers: EngineAnswers,
): SavedCarePlan {
    const now = new Date().toISOString();

    // 1. Archive existing active plan
    const existing = getActiveCarePlan();
    if (existing) {
        archivePlan(existing);
    }

    // 2. Create new plan
    const plan: SavedCarePlan = {
        id: generateId(),
        version: CURRENT_VERSION,
        createdAt: now,
        lastViewedAt: now,
        status: 'active',
        routing,
        triage,
        answers,
        recommendedToolIds: routing.recommended_tools.map(t => t.id),
        toolsOpened: [],
        toolsCompleted: [],
        dailyChecklist: {},
        escalationState: deriveEscalationState(triage, routing),
        confidence: deriveConfidence(routing),
    };

    // 3. Persist
    safeSetJSON(KEY_ACTIVE, plan);

    return plan;
}

/**
 * Get the current active care plan (if any).
 */
export function getActiveCarePlan(): SavedCarePlan | null {
    return safeGetJSON<SavedCarePlan>(KEY_ACTIVE);
}

/**
 * Check if an active care plan exists.
 */
export function hasActiveCarePlan(): boolean {
    return getActiveCarePlan() !== null;
}

/**
 * Mark a tool as opened in the active plan.
 */
export function markToolOpened(toolId: string): void {
    const plan = getActiveCarePlan();
    if (!plan) return;
    if (plan.toolsOpened.includes(toolId)) return;

    plan.toolsOpened = [...plan.toolsOpened, toolId];
    plan.lastViewedAt = new Date().toISOString();
    safeSetJSON(KEY_ACTIVE, plan);
}

/**
 * Mark a tool as *completed* (user finished the tool, not just opened it).
 */
export function markToolCompleted(toolId: string): void {
    const plan = getActiveCarePlan();
    if (!plan) return;

    // Also mark as opened
    if (!plan.toolsOpened.includes(toolId)) {
        plan.toolsOpened = [...plan.toolsOpened, toolId];
    }
    if (!plan.toolsCompleted.includes(toolId)) {
        plan.toolsCompleted = [...plan.toolsCompleted, toolId];
    }
    plan.lastViewedAt = new Date().toISOString();
    safeSetJSON(KEY_ACTIVE, plan);
}

/**
 * Get completion rate: 0-100 based on fully completed tools.
 */
export function getCompletionRate(plan: SavedCarePlan): number {
    const total = plan.recommendedToolIds.length;
    if (total === 0) return 0;
    const completed = (plan.toolsCompleted ?? []).length;
    return Math.round((completed / total) * 100);
}

/**
 * Save daily checklist state for today.
 * @param taskIds - completed task IDs for today
 */
export function saveDailyChecklist(taskIds: string[]): void {
    const plan = getActiveCarePlan();
    if (!plan) return;
    const today = new Date().toDateString();
    plan.dailyChecklist = { ...(plan.dailyChecklist ?? {}), [today]: taskIds };
    plan.lastViewedAt = new Date().toISOString();
    safeSetJSON(KEY_ACTIVE, plan);
}

/**
 * Get today's checklist completions.
 */
export function getTodayChecklist(plan: SavedCarePlan): string[] {
    const today = new Date().toDateString();
    return (plan.dailyChecklist ?? {})[today] ?? [];
}

/**
 * Calculate user's daily streak based on their dailyChecklist history.
 * Streak counts consecutive days where at least one task was fully completed.
 */
export function getStreak(plan: SavedCarePlan): number {
    if (!plan.dailyChecklist) return 0;
    
    // Get all dates where the user checked off at least one item
    const datesWithActivity = Object.entries(plan.dailyChecklist)
        .filter(([_, tasks]) => tasks.length > 0)
        .map(([date]) => new Date(date).setHours(0, 0, 0, 0))
        .sort((a, b) => b - a); // Sort descending

    if (datesWithActivity.length === 0) return 0;

    let streak = 0;
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = today - 86400000;

    // Check if streak is currently active (activity today or yesterday)
    let currentDate = datesWithActivity[0];
    if (currentDate !== today && currentDate !== yesterday) {
        return 0; // Streak broken
    }

    // Traverse backwards to count consecutive days
    for (let i = 0; i < datesWithActivity.length; i++) {
        if (i === 0) {
            streak++;
            continue;
        }

        const diff = datesWithActivity[i - 1] - datesWithActivity[i];
        if (diff === 86400000) { // Exactly 1 day diff
            streak++;
        } else if (diff > 86400000) { // Gap in days, streak ends
            break;
        }
        // If diff === 0, it means multiple activities on the same day, which is fine, keep going
    }

    return streak;
}
/**
 * Update lastViewedAt on the active plan.
 */
export function touchCarePlan(): void {
    const plan = getActiveCarePlan();
    if (!plan) return;
    plan.lastViewedAt = new Date().toISOString();
    safeSetJSON(KEY_ACTIVE, plan);
}

/**
 * Get the full history of archived plans (newest first).
 */
export function getCarePlanHistory(): SavedCarePlan[] {
    return safeGetJSON<SavedCarePlan[]>(KEY_HISTORY) ?? [];
}

/**
 * Clear the active plan (without archiving).
 */
export function clearActiveCarePlan(): void {
    if (typeof window === 'undefined') return;
    try { localStorage.removeItem(KEY_ACTIVE); } catch { /* noop */ }
}

/**
 * Compute engagement percentage: how many of 5 tools opened.
 */
export function getToolEngagement(plan: SavedCarePlan): number {
    const total = plan.recommendedToolIds.length;
    if (total === 0) return 0;
    return Math.round((plan.toolsOpened.length / total) * 100);
}

/**
 * Check if a reassessment is recommended (> 7 days old).
 */
export function shouldReassess(plan: SavedCarePlan): boolean {
    const created = new Date(plan.createdAt).getTime();
    const now = Date.now();
    const daysSince = (now - created) / (1000 * 60 * 60 * 24);
    return daysSince >= 7;
}

/**
 * Get a human-readable summary of the active plan.
 */
export function getPlanSummary(plan: SavedCarePlan): {
    primaryDomain: DomainId;
    secondaryDomain: DomainId;
    primarySubdomain: SubdomainId;
    triageLevel: TriageLevel;
    toolsTotal: number;
    toolsOpened: number;
    daysSinceCreation: number;
    needsReassessment: boolean;
    escalation: EscalationState;
    confidence: PlanConfidence;
} {
    const daysSinceCreation = Math.floor(
        (Date.now() - new Date(plan.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
        primaryDomain: plan.routing.primary_domain,
        secondaryDomain: plan.routing.secondary_domain,
        primarySubdomain: plan.routing.primary_subdomain,
        triageLevel: plan.triage.level,
        toolsTotal: plan.recommendedToolIds.length,
        toolsOpened: plan.toolsOpened.length,
        daysSinceCreation,
        needsReassessment: shouldReassess(plan),
        escalation: plan.escalationState,
        confidence: plan.confidence,
    };
}

/* ══════════════════════════════════════════════════════════
   PROTOCOL ENGINE HELPERS
   لا تمس computeRouting أو scoring — تقرأ فقط من care-plan-store
   ══════════════════════════════════════════════════════════ */

import type { SubdomainProtocol, ProtocolPhase } from './protocol-engine';

/**
 * احسب اليوم الحالي من البروتوكول (1-based، مثبّت على 7 كحد أقصى في v1).
 * اليوم 1 = نفس يوم إنشاء الخطة.
 */
export function getProtocolDay(plan: SavedCarePlan): number {
    const created = new Date(plan.createdAt).setHours(0, 0, 0, 0);
    const today   = new Date().setHours(0, 0, 0, 0);
    const elapsed = Math.floor((today - created) / 86400000);
    return Math.min(elapsed + 1, 7); // v1 cap: 7 days
}

/**
 * احسب تقدم المستخدم داخل البروتوكول.
 * completedDays = عدد الأيام التي أكمل فيها المستخدم checklist واحداً على الأقل.
 * adherencePercent = نسبة الإنجاز (adherence — هل فعل؟).
 * phase = المرحلة الحالية (understand / practice / measure / assess).
 */
export function getProtocolProgress(
    plan: SavedCarePlan,
    protocol: SubdomainProtocol,
): {
    completedDays: number;
    totalDays: number;
    adherencePercent: number;
    phase: ProtocolPhase;
} {
    const activeDays = Object.values(plan.dailyChecklist ?? {})
        .filter(tasks => tasks.length > 0).length;
    const completedDays     = Math.min(activeDays, protocol.totalDays);
    const adherencePercent  = Math.round((completedDays / protocol.totalDays) * 100);

    // المرحلة بحسب اليوم الحالي
    const currentDay = getProtocolDay(plan);
    let phase: ProtocolPhase = 'understand';
    if (currentDay <= 2)      phase = 'understand';
    else if (currentDay <= 4) phase = 'practice';
    else if (currentDay <= 6) phase = 'measure';
    else                      phase = 'assess';

    return { completedDays, totalDays: protocol.totalDays, adherencePercent, phase };
}

/**
 * هل يجب إعادة التقييم الآن؟
 *
 * ثلاثة محفزات مستقلة:
 *   time-based       — وصل اليوم 7
 *   completion-based — أكمل 71% مبكراً
 *   symptom-based    — لا شيء بحلول اليوم المحدد (إشارة سيئة)
 */
export function getProtocolReassessment(
    plan: SavedCarePlan,
    protocol: SubdomainProtocol,
): {
    needed: boolean;
    reason: 'time' | 'completion' | 'bad_outcome' | 'none';
    daysTill: number;
    urgency: 'low' | 'high';
} {
    const currentDay = getProtocolDay(plan);
    const { completedDays, adherencePercent } = getProtocolProgress(plan, protocol);

    // symptom-based: لا إنجاز بحلول الموعد المحدد → عائق حقيقي
    if (
        currentDay >= protocol.reassessAt.earlyEscalateIfNoActionByDay &&
        completedDays === 0
    ) {
        return { needed: true, reason: 'bad_outcome', daysTill: 0, urgency: 'high' };
    }

    // time-based: وصل اليوم المحدد
    if (currentDay >= protocol.reassessAt.afterDay) {
        return { needed: true, reason: 'time', daysTill: 0, urgency: 'low' };
    }

    // completion-based: أكمل بنسبة كافية مبكراً
    if (adherencePercent >= protocol.reassessAt.afterCompletionPercent) {
        return { needed: true, reason: 'completion', daysTill: 0, urgency: 'low' };
    }

    const daysTill = Math.max(0, protocol.reassessAt.afterDay - currentDay);
    return { needed: false, reason: 'none', daysTill, urgency: 'low' };
}

/* ══════════════════════════════════════════════════════════
   PRIVATE: Archive management
   ══════════════════════════════════════════════════════════ */

function archivePlan(plan: SavedCarePlan): void {
    plan.status = 'archived';

    const history = getCarePlanHistory();
    history.unshift(plan); // newest first

    // Cap history
    if (history.length > MAX_HISTORY) {
        history.length = MAX_HISTORY;
    }

    safeSetJSON(KEY_HISTORY, history);
}
