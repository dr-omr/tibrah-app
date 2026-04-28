// lib/assessment/finalize-assessment-result.ts
// ════════════════════════════════════════════════════════════════
// TIBRAH — Assessment Result Finalization Layer (Phase 1)
//
// Purpose:
//   Centralizes all computation + persistence that used to be scattered
//   inside StepResult.tsx useEffect. StepResult becomes a thin UI wrapper.
//
// Guarantees:
//   - Runs engines once; returns a typed status object.
//   - If saving fails, returns status:'failed' so UI shows fallback.
//   - /assessment-result can restore result after refresh via session id.
//
// Rules:
//   - No UI imports.
//   - No React imports.
//   - Pure function: same inputs → same outputs (except localStorage side-effect).
// ════════════════════════════════════════════════════════════════

import type { EngineAnswers, TriageResult, RoutingResult, ResultViewModel } from '@/components/health-engine/types';
import { computeTriage } from '@/components/health-engine/constants';
import { computeRouting } from '@/lib/domain-scoring-engine';
import { buildResultViewModel } from '@/lib/result-engine/build-result-view-model';
import { saveCarePlan } from '@/lib/care-plan-store';
import { saveAssessmentSession, clearEditingState } from '@/lib/assessment-session-store';
import type { AssessmentSession } from '@/lib/assessment-session-store';

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

export type FinalizationStatus = 'success' | 'failed' | 'partial';

export interface FinalizationResult {
    status: FinalizationStatus;
    /** The saved session id — present on success and partial */
    sessionId: string | null;
    /** Full session object if saved successfully */
    session: AssessmentSession | null;
    /** The assembled view model */
    vm: ResultViewModel;
    /** Engine intermediaries for UI/analytics consumption */
    triageResult: TriageResult;
    routing: RoutingResult;
    /** Error detail if status is failed/partial */
    errorMessage: string | null;
}

/* ══════════════════════════════════════════════════════════
   MAIN FUNCTION
   ══════════════════════════════════════════════════════════ */

/**
 * finalizeAssessmentResult
 *
 * Called once from StepResult on mount.
 * Runs computeTriage → computeRouting → buildResultViewModel →
 * saveCarePlan → saveAssessmentSession in a safe, sequential pipeline.
 *
 * Returns a typed FinalizationResult so the caller never needs to
 * guess whether data was saved.
 */
export function finalizeAssessmentResult(answers: EngineAnswers): FinalizationResult {
    // ── Step 1: Compute triage ──────────────────────────────────
    let triageResult: TriageResult;
    try {
        triageResult = computeTriage(answers);
    } catch (e) {
        return {
            status: 'failed',
            sessionId: null,
            session: null,
            vm: {} as ResultViewModel, // safe stub; UI shows fallback
            triageResult: {} as TriageResult,
            routing: {} as RoutingResult,
            errorMessage: `computeTriage failed: ${String(e)}`,
        };
    }

    // ── Step 2: Compute routing ────────────────────────────────
    let routing: RoutingResult;
    try {
        routing = computeRouting(answers, triageResult);
    } catch (e) {
        return {
            status: 'failed',
            sessionId: null,
            session: null,
            vm: {} as ResultViewModel,
            triageResult,
            routing: {} as RoutingResult,
            errorMessage: `computeRouting failed: ${String(e)}`,
        };
    }

    // ── Step 3: Build view model ───────────────────────────────
    let vm: ResultViewModel;
    try {
        vm = buildResultViewModel(answers, triageResult, routing);
    } catch (e) {
        return {
            status: 'failed',
            sessionId: null,
            session: null,
            vm: {} as ResultViewModel,
            triageResult,
            routing,
            errorMessage: `buildResultViewModel failed: ${String(e)}`,
        };
    }

    // ── Step 4: Save care plan (non-fatal) ─────────────────────
    try {
        saveCarePlan(routing, triageResult, answers);
    } catch {
        // Care plan save failing is non-fatal — continue
    }

    // ── Step 5: Build tayyibatSnapshot if verdict available ────
    const tayyibatSnap = vm.tayyibatVerdict ? {
        primaryPattern:      vm.tayyibatVerdict.primaryPattern,
        primaryPatternLabel: vm.tayyibatVerdict.primaryPatternLabel,
        confidenceScore:     vm.tayyibatVerdict.confidenceScore,
        confidenceLabel:     vm.tayyibatVerdict.confidenceLabel,
        topGaps:             vm.tayyibatVerdict.topGaps,
        firstStepToday:      vm.tayyibatVerdict.firstStepToday,
        safetyGated:         vm.tayyibatVerdict.safetyGated,
        mealLogCountAtSave:  vm.tayyibatVerdict.mealLogCountUsed,
        computedAt:          new Date().toISOString(),
    } : undefined;

    // ── Step 6: Persist session ────────────────────────────────
    let session: AssessmentSession;
    try {
        session = saveAssessmentSession(
            answers,
            triageResult,
            routing,
            vm,
            undefined,       // carePlanId
            tayyibatSnap,
        );
        clearEditingState();
    } catch (e) {
        // Engines succeeded but persistence failed → partial
        return {
            status: 'partial',
            sessionId: null,
            session: null,
            vm,
            triageResult,
            routing,
            errorMessage: `saveAssessmentSession failed: ${String(e)}`,
        };
    }

    return {
        status: 'success',
        sessionId: session.id,
        session,
        vm,
        triageResult,
        routing,
        errorMessage: null,
    };
}
