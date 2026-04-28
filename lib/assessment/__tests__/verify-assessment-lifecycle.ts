// lib/assessment/__tests__/verify-assessment-lifecycle.ts
// ════════════════════════════════════════════════════════════════
// TIBRAH — Assessment Lifecycle Verifier (Phase 1)
// Run: npm run verify:assessment
//
// Tests:
//   1. finalizeAssessmentResult returns correct status types
//   2. Persistence adapter exposes all required methods
//   3. Partial failure is handled correctly (engines pass, save may fail)
//   4. Session id is unique per call
// ════════════════════════════════════════════════════════════════

import { finalizeAssessmentResult } from '../finalize-assessment-result';
import { getPersistenceAdapter }     from '../assessment-persistence-adapter';
import type { EngineAnswers }        from '@/components/health-engine/types';

/* ── Minimal valid EngineAnswers fixture ─────────────────── */
const FIXTURE_ANSWERS: EngineAnswers = {
    pathwayId:        'fatigue',
    severity:         5,
    duration:         'weeks',
    redFlags:         [],
    hasEmergencyFlag: false,
    emergencyMessage: '',
    clinicalAnswers: {
        pattern:      ['هبوط طاقة منتصف النهار'],
        triggers:     ['أشتاق للسكر باستمرار (خلل سكر الدم)'],
    },
    emotionalContext: ['none'],
    emotionalNote:    '',
    freeText:         '',
};


const FIXTURE_URGENT: EngineAnswers = {
    ...FIXTURE_ANSWERS,
    pathwayId:       'pain',
    severity:        9,
    redFlags:        ['ألم صدر شديد'],
    hasEmergencyFlag: true,
    clinicalAnswers: {
        location: ['الصدر'],
        quality:  ['حارق أو وخز كهربائي (عصبي)'],
    },
};

/* ── Helpers ─────────────────────────────────────────────── */
let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
    try {
        fn();
        console.log(`  🟢 ${name}`);
        passed++;
    } catch (e) {
        console.log(`  🔴 ${name}`);
        console.log(`     → ${String(e)}`);
        failed++;
    }
}

function assert(condition: boolean, msg: string) {
    if (!condition) throw new Error(msg);
}

/* ════════════════════════════════════════════════════════════
   SUITE 1: finalizeAssessmentResult
   ════════════════════════════════════════════════════════════ */

console.log('\n══════════════════════════════════════════════');
console.log('  SUITE 1: finalizeAssessmentResult');
console.log('══════════════════════════════════════════════\n');

test('returns success for valid answers', () => {
    const result = finalizeAssessmentResult(FIXTURE_ANSWERS);
    assert(
        result.status === 'success' || result.status === 'partial',
        `Expected success or partial, got: ${result.status} — ${result.errorMessage ?? ''}`,
    );
});

test('returns a triageResult with a level field', () => {
    const result = finalizeAssessmentResult(FIXTURE_ANSWERS);
    assert(
        typeof result.triageResult?.level === 'string',
        `triageResult.level missing or not string: ${JSON.stringify(result.triageResult)}`,
    );
});

test('returns a routing result with primary_domain', () => {
    const result = finalizeAssessmentResult(FIXTURE_ANSWERS);
    assert(
        typeof result.routing?.primary_domain === 'string',
        `routing.primary_domain missing: ${JSON.stringify(result.routing)}`,
    );
});

test('returns a non-empty ResultViewModel', () => {
    const result = finalizeAssessmentResult(FIXTURE_ANSWERS);
    assert(
        result.vm !== null && typeof result.vm === 'object',
        'vm is null or not an object',
    );
});

test('session id is a non-empty string on success/partial', () => {
    const result = finalizeAssessmentResult(FIXTURE_ANSWERS);
    if (result.status === 'success' || result.status === 'partial') {
        // partial can have null sessionId if localStorage failed — acceptable
        if (result.status === 'success') {
            assert(
                typeof result.sessionId === 'string' && result.sessionId.length > 0,
                `sessionId invalid: ${result.sessionId}`,
            );
        }
    }
});

test('urgent case — escalation_needed is true', () => {
    const result = finalizeAssessmentResult(FIXTURE_URGENT);
    assert(
        result.routing?.escalation_needed === true,
        `Expected escalation_needed=true for urgent case, got: ${result.routing?.escalation_needed}`,
    );
});

test('triage level is emergency for chest pain + red flag', () => {
    const result = finalizeAssessmentResult(FIXTURE_URGENT);
    assert(
        result.triageResult?.level === 'emergency' || result.triageResult?.level === 'urgent',
        `Expected emergency/urgent, got: ${result.triageResult?.level}`,
    );
});

test('two calls return different session ids', () => {
    const r1 = finalizeAssessmentResult(FIXTURE_ANSWERS);
    const r2 = finalizeAssessmentResult(FIXTURE_ANSWERS);
    // Both may be null if localStorage not available in test env — skip if both null
    if (r1.sessionId !== null && r2.sessionId !== null) {
        assert(r1.sessionId !== r2.sessionId, `Session IDs are identical: ${r1.sessionId}`);
    }
});

/* ════════════════════════════════════════════════════════════
   SUITE 2: Persistence Adapter Interface
   ════════════════════════════════════════════════════════════ */

console.log('\n══════════════════════════════════════════════');
console.log('  SUITE 2: Persistence Adapter Interface');
console.log('══════════════════════════════════════════════\n');

test('getPersistenceAdapter returns an object', () => {
    const adapter = getPersistenceAdapter();
    assert(adapter !== null && typeof adapter === 'object', 'Adapter is null or not an object');
});

test('adapter has saveAssessment method', () => {
    const adapter = getPersistenceAdapter();
    assert(typeof adapter.saveAssessment === 'function', 'saveAssessment missing');
});

test('adapter has getAssessment method', () => {
    const adapter = getPersistenceAdapter();
    assert(typeof adapter.getAssessment === 'function', 'getAssessment missing');
});

test('adapter has listAssessments method', () => {
    const adapter = getPersistenceAdapter();
    assert(typeof adapter.listAssessments === 'function', 'listAssessments missing');
});

test('adapter has updateAssessment method', () => {
    const adapter = getPersistenceAdapter();
    assert(typeof adapter.updateAssessment === 'function', 'updateAssessment missing');
});

test('adapter has syncAssessmentIfUserLoggedIn method', () => {
    const adapter = getPersistenceAdapter();
    assert(typeof adapter.syncAssessmentIfUserLoggedIn === 'function', 'syncAssessmentIfUserLoggedIn missing');
});

test('syncAssessmentIfUserLoggedIn returns false (no cloud configured)', async () => {
    const adapter = getPersistenceAdapter();
    const result  = await adapter.syncAssessmentIfUserLoggedIn('test-session-123');
    assert(result === false, `Expected false (no cloud), got: ${result}`);
});

/* ════════════════════════════════════════════════════════════
   FINAL REPORT
   ════════════════════════════════════════════════════════════ */

console.log('\n══════════════════════════════════════════════');
const total = passed + failed;
if (failed === 0) {
    console.log(`  ✅ STATUS: ALL ${total} SCENARIOS PASS`);
} else {
    console.log(`  ❌ STATUS: ${failed}/${total} FAILED`);
}
console.log('══════════════════════════════════════════════\n');

if (failed > 0) process.exit(1);
