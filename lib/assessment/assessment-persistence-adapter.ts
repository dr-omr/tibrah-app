// lib/assessment/assessment-persistence-adapter.ts
// ════════════════════════════════════════════════════════════════
// TIBRAH — Assessment Persistence Adapter (Phase 1)
//
// Purpose:
//   Abstraction layer over localStorage so that future cloud sync
//   can be added without rewriting engine code.
//
// Architecture:
//   - Interface: AssessmentPersistenceAdapter (contract)
//   - Concrete: LocalStorageAdapter (current primary)
//   - Future: FirebaseAdapter (skeleton — wires up when auth is ready)
//
// Usage pattern:
//   import { getPersistenceAdapter } from '@/lib/assessment/assessment-persistence-adapter';
//   const store = getPersistenceAdapter();
//   await store.saveAssessment(session);
//
// Rules:
//   - All methods are async (for future network compat).
//   - LocalStorage adapter wraps synchronous ops in resolved promises.
//   - No UI imports.
//   - SSR-safe: all localStorage reads guarded by typeof window.
// ════════════════════════════════════════════════════════════════

import {
    getAllSessions,
    getSessionById,
    getLatestSession,
    saveAssessmentSession,
    updateSession,
    type AssessmentSession,
} from '@/lib/assessment-session-store';
import type { EngineAnswers, TriageResult, RoutingResult, ResultViewModel } from '@/components/health-engine/types';

/* ══════════════════════════════════════════════════════════
   ADAPTER INTERFACE
   ══════════════════════════════════════════════════════════ */

export interface AssessmentPersistenceAdapter {
    /**
     * Save a fully computed assessment session.
     * Returns the saved session id.
     */
    saveAssessment(
        answers:           EngineAnswers,
        triageResult:      TriageResult,
        routing:           RoutingResult,
        resultViewModel:   ResultViewModel,
        carePlanId?:       string,
        tayyibatSnapshot?: AssessmentSession['tayyibatSnapshot'],
    ): Promise<string>;

    /** Retrieve a single session by id. Returns null if not found. */
    getAssessment(id: string): Promise<AssessmentSession | null>;

    /** Retrieve the most recent completed session. */
    getLatestAssessment(): Promise<AssessmentSession | null>;

    /** List all saved sessions, newest first. Max 10. */
    listAssessments(): Promise<AssessmentSession[]>;

    /** Partial-update an existing session (status, lastViewedAt, etc.). */
    updateAssessment(
        id: string,
        updates: Partial<Pick<AssessmentSession, 'status' | 'lastViewedAt' | 'wasEdited' | 'supersededBy' | 'carePlanId'>>,
    ): Promise<void>;

    /**
     * If the user is logged in and Firebase is configured, push the session
     * to the cloud. Otherwise, no-op.
     * Returns true if sync occurred.
     */
    syncAssessmentIfUserLoggedIn(sessionId: string): Promise<boolean>;
}

/* ══════════════════════════════════════════════════════════
   LOCAL STORAGE ADAPTER (Current Primary Implementation)
   ══════════════════════════════════════════════════════════ */

class LocalStorageAdapter implements AssessmentPersistenceAdapter {
    async saveAssessment(
        answers:           EngineAnswers,
        triageResult:      TriageResult,
        routing:           RoutingResult,
        resultViewModel:   ResultViewModel,
        carePlanId?:       string,
        tayyibatSnapshot?: AssessmentSession['tayyibatSnapshot'],
    ): Promise<string> {
        const session = saveAssessmentSession(
            answers, triageResult, routing, resultViewModel, carePlanId, tayyibatSnapshot,
        );
        return session.id;
    }

    async getAssessment(id: string): Promise<AssessmentSession | null> {
        return getSessionById(id);
    }

    async getLatestAssessment(): Promise<AssessmentSession | null> {
        return getLatestSession();
    }

    async listAssessments(): Promise<AssessmentSession[]> {
        return getAllSessions();
    }

    async updateAssessment(
        id: string,
        updates: Partial<Pick<AssessmentSession, 'status' | 'lastViewedAt' | 'wasEdited' | 'supersededBy' | 'carePlanId'>>,
    ): Promise<void> {
        updateSession(id, updates);
    }

    async syncAssessmentIfUserLoggedIn(_sessionId: string): Promise<boolean> {
        // Cloud sync not yet implemented.
        // When Firebase auth is confirmed, this method will:
        //   1. Check if user is logged in (firebaseAuth.currentUser).
        //   2. Load session by id.
        //   3. Push to /users/{uid}/assessments/{sessionId} in Firestore.
        // For now: no-op.
        return false;
    }
}

/* ══════════════════════════════════════════════════════════
   FUTURE: FIREBASE ADAPTER SKELETON
   (Uncomment and complete when auth/Firestore is confirmed)
   ══════════════════════════════════════════════════════════ */

// class FirebaseAdapter implements AssessmentPersistenceAdapter {
//     // ... implement using Firestore SDK
//     // Requires: auth.currentUser, db from lib/firebase.ts
// }

/* ══════════════════════════════════════════════════════════
   SINGLETON — swap adapter here when cloud sync is ready
   ══════════════════════════════════════════════════════════ */

let _adapter: AssessmentPersistenceAdapter | null = null;

export function getPersistenceAdapter(): AssessmentPersistenceAdapter {
    if (!_adapter) {
        // Primary: localStorage
        // Future: conditionally switch to FirebaseAdapter if user is authed
        _adapter = new LocalStorageAdapter();
    }
    return _adapter;
}

/**
 * Convenience: save + sync in one call.
 * Returns the session id.
 */
export async function saveAndSyncAssessment(
    answers:           EngineAnswers,
    triageResult:      TriageResult,
    routing:           RoutingResult,
    resultViewModel:   ResultViewModel,
    carePlanId?:       string,
    tayyibatSnapshot?: AssessmentSession['tayyibatSnapshot'],
): Promise<string> {
    const adapter = getPersistenceAdapter();
    const id = await adapter.saveAssessment(
        answers, triageResult, routing, resultViewModel, carePlanId, tayyibatSnapshot,
    );
    // Non-blocking sync attempt — failure is silent
    adapter.syncAssessmentIfUserLoggedIn(id).catch(() => {});
    return id;
}
