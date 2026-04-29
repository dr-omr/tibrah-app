// lib/assessment-session-store.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Assessment Session Persistence
// ════════════════════════════════════════════════════════════════════════
//
// Saves complete snapshots of every assessment session so the user can
// navigate to tools, my-plan, protocol pages and return to the original
// result screen without losing context.
//
// Design principles:
//   - Additive only — never removes data from the clinical engine
//   - No dependency on care-plan-store (complementary layer)
//   - Max 10 sessions (FIFO eviction)
//   - SSR-safe: all reads return null/empty on server
// ════════════════════════════════════════════════════════════════════════

import type {
    EngineAnswers,
    TriageResult,
    RoutingResult,
    ResultViewModel,
} from '@/components/health-engine/types';

/* ══════════════════════════════════════════════════════════
   DATA MODEL
   ══════════════════════════════════════════════════════════ */

export type SessionStatus = 'completed' | 'editing' | 'superseded';

export interface AssessmentSession {
    /** Unique session ID (timestamp-based) */
    id: string;
    /** Schema version for future migrations */
    version: number;
    /** ISO timestamp of assessment completion */
    createdAt: string;
    /** ISO timestamp of last time the result was viewed */
    lastViewedAt: string;
    /** Current status */
    status: SessionStatus;

    /* ── Complete input snapshot ── */
    answers: EngineAnswers;

    /* ── Complete output snapshot ── */
    triageResult: TriageResult;
    routing: RoutingResult;

    /* ── Pre-assembled view model (deterministic, so safe to cache) ── */
    resultViewModel: ResultViewModel;

    /* ── Metadata ── */
    /** The care plan ID generated from this session, if any */
    carePlanId?: string;
    /** Whether the user edited symptoms from this session */
    wasEdited?: boolean;
    /** ID of the session that superseded this one (if re-assessed) */
    supersededBy?: string;
    /**
     * Tayyibat domain snapshot — computed from the same answers.
     * Optional: present only when nutrition signals were detected.
     * Stores the key modifier fields used by TayyibatVerdictCard.
     */
    tayyibatSnapshot?: {
        primaryPattern:     string | null;
        primaryPatternLabel: string;
        confidenceScore:    number;
        confidenceLabel:    'low' | 'medium' | 'high';
        topGaps:            string[];
        firstStepToday:     string | null;
        safetyGated:        boolean;
        mealLogCountAtSave: number;
        computedAt:         string;
    };
    /**
     * Adaptive question orchestrator snapshot — stored so the result page
     * can explain WHY certain question stages appeared or were skipped.
     * Optional: absent in sessions created before Phase 2.
     */
    adaptiveQuestionPlanSnapshot?: {
        nutritionShown:    boolean;
        safetyPrioritized: boolean;
        deepIntakeShown:   boolean;
        foodSignalFound:   boolean;
        burdenMinimized:   boolean;
        reasons:           string[];
        triageRiskHint:    string;
    };
}



/* ══════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════ */

const CURRENT_VERSION = 1;
const KEY_SESSIONS = 'tibrah_assessment_sessions';
const KEY_LATEST   = 'tibrah_latest_session_id';
const MAX_SESSIONS = 10;

/* ══════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════ */

function generateSessionId(): string {
    return `as_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

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
    } catch { /* quota exceeded — ignore */ }
}

/* ══════════════════════════════════════════════════════════
   READ OPERATIONS
   ══════════════════════════════════════════════════════════ */

/** Get all saved assessment sessions, newest first. */
export function getAllSessions(): AssessmentSession[] {
    const sessions = safeGetJSON<AssessmentSession[]>(KEY_SESSIONS);
    if (!sessions) return [];
    return sessions.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

/** Get the latest completed session. */
export function getLatestSession(): AssessmentSession | null {
    const latestId = safeGetJSON<string>(KEY_LATEST);
    if (latestId) {
        const session = getSessionById(latestId);
        if (session) return session;
    }
    // Fallback: find newest completed session
    const all = getAllSessions();
    return all.find(s => s.status === 'completed') ?? null;
}

/** Get a specific session by ID. */
export function getSessionById(id: string): AssessmentSession | null {
    const all = getAllSessions();
    return all.find(s => s.id === id) ?? null;
}

/** Check if any completed session exists (for UI gating). */
export function hasCompletedSession(): boolean {
    return getLatestSession() !== null;
}

/* ══════════════════════════════════════════════════════════
   WRITE OPERATIONS
   ══════════════════════════════════════════════════════════ */

/**
 * Save a new assessment session snapshot.
 * Called once when StepResult mounts after engine computation.
 */
export function saveAssessmentSession(
    answers:           EngineAnswers,
    triageResult:      TriageResult,
    routing:           RoutingResult,
    resultViewModel:   ResultViewModel,
    carePlanId?:       string,
    tayyibatSnapshot?: AssessmentSession['tayyibatSnapshot'],
): AssessmentSession {
    const now = new Date().toISOString();
    const session: AssessmentSession = {
        id:              generateSessionId(),
        version:         CURRENT_VERSION,
        createdAt:       now,
        lastViewedAt:    now,
        status:          'completed',
        answers,
        triageResult,
        routing,
        resultViewModel,
        carePlanId,
        tayyibatSnapshot,   // ← always persisted when available
        adaptiveQuestionPlanSnapshot: answers.adaptiveQuestionPlanSnapshot,
    };

    // Mark previous latest session as superseded
    const previousLatest = getLatestSession();
    if (previousLatest && previousLatest.status === 'completed') {
        updateSession(previousLatest.id, { supersededBy: session.id });
    }

    // Add to sessions list
    const all = getAllSessions();
    all.unshift(session);

    // Enforce max limit (FIFO eviction)
    while (all.length > MAX_SESSIONS) {
        all.pop();
    }

    safeSetJSON(KEY_SESSIONS, all);
    safeSetJSON(KEY_LATEST, session.id);

    return session;
}

/**
 * Update fields on an existing session.
 */
export function updateSession(
    id: string,
    updates: Partial<Pick<AssessmentSession, 'status' | 'lastViewedAt' | 'wasEdited' | 'supersededBy' | 'carePlanId'>>,
): void {
    const all = getAllSessions();
    const idx = all.findIndex(s => s.id === id);
    if (idx < 0) return;

    all[idx] = { ...all[idx], ...updates };
    safeSetJSON(KEY_SESSIONS, all);
}

/**
 * Touch the lastViewedAt timestamp (called when user re-opens result).
 */
export function touchSession(id: string): void {
    updateSession(id, { lastViewedAt: new Date().toISOString() });
}

/**
 * Restore a session's answers for symptom editing.
 * Returns a copy of the EngineAnswers ready for the assessment flow.
 * Marks the session as being edited.
 */
export function restoreSessionForEdit(id: string): EngineAnswers | null {
    const session = getSessionById(id);
    if (!session) return null;

    updateSession(id, { status: 'editing', wasEdited: true });

    // Return a deep copy to prevent mutation
    return JSON.parse(JSON.stringify(session.answers));
}

/**
 * Get the session ID that is currently being edited (if any).
 */
export function getEditingSessionId(): string | null {
    const all = getAllSessions();
    const editing = all.find(s => s.status === 'editing');
    return editing?.id ?? null;
}

/**
 * Clear the editing state (called when assessment is completed or cancelled).
 */
export function clearEditingState(): void {
    const all = getAllSessions();
    for (const session of all) {
        if (session.status === 'editing') {
            session.status = 'superseded';
        }
    }
    safeSetJSON(KEY_SESSIONS, all);
}
