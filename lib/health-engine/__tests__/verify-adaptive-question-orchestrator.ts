// lib/health-engine/__tests__/verify-adaptive-question-orchestrator.ts
// ════════════════════════════════════════════════════════════════
// TIBRAH — Adaptive Question Orchestrator Verifier (Phase 2)
// Run: npm run verify:adaptive
//
// Golden Scenarios (7):
//   1. Fatigue + sugar cravings + post-meal crash → nutrition shown
//   2. Anxiety + caffeine + poor sleep → nutrition shown (signal-based)
//   3. Back pain + constipation + bloating → nutrition shown
//   4. Dental pain only → nutrition hidden/minimal
//   5. Chest pain + severe dyspnea → safety prioritized, nutrition minimal
//   6. Stable mild symptom, no food signals → core only, nutrition hidden
//   7. Chronic moderate symptoms + unclear → deep intake shown
// ════════════════════════════════════════════════════════════════

import { buildAdaptiveQuestionPlan } from '../adaptive-question-orchestrator';
import type { AnswerValue } from '@/components/health-engine/types';

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

function stageShown(plan: ReturnType<typeof buildAdaptiveQuestionPlan>, stage: string): boolean {
    return plan.decisions.find(d => d.stage === stage)?.shouldShow ?? false;
}

function stageReason(plan: ReturnType<typeof buildAdaptiveQuestionPlan>, stage: string): string {
    return plan.decisions.find(d => d.stage === stage)?.reason ?? '';
}

/* ════════════════════════════════════════════════════════════
   SCENARIO 1: Fatigue + sugar cravings + post-meal crash
   ════════════════════════════════════════════════════════════ */

console.log('\n══════════════════════════════════════════════');
console.log('  SCENARIO 1: Fatigue + sugar cravings + post-meal crash');
console.log('══════════════════════════════════════════════\n');

const S1_ANSWERS: Record<string, AnswerValue> = {
    pattern:  ['هبوط طاقة منتصف النهار', 'أشتاق للسكر باستمرار (خلل سكر الدم)'],
    triggers: ['إرهاق بعد الأكل مباشرة'],
};

const plan1 = buildAdaptiveQuestionPlan({
    pathwayId:       'fatigue',
    severity:        6,
    duration:        'weeks',
    existingAnswers: S1_ANSWERS,
    clinicalAnswers: S1_ANSWERS,
});

test('S1: nutrition_tayyibat shown', () => {
    assert(stageShown(plan1, 'nutrition_tayyibat'), `nutrition hidden — reason: ${stageReason(plan1, 'nutrition_tayyibat')}`);
});

test('S1: safety not critical (no red flag)', () => {
    const safety = plan1.decisions.find(d => d.stage === 'safety');
    assert(safety?.priority !== 'critical', 'Safety marked critical without red flags');
});

test('S1: triageRiskHint is stable or urgent_possible', () => {
    assert(
        plan1.triageRiskHint === 'stable' || plan1.triageRiskHint === 'urgent_possible',
        `Expected stable/urgent_possible, got: ${plan1.triageRiskHint}`,
    );
});

test('S1: snapshot.nutritionShown = true', () => {
    assert(plan1.snapshot.nutritionShown === true, 'Snapshot says nutrition not shown');
});

test('S1: nutrition reason mentions سكر or هبوط or food signal', () => {
    const reason = stageReason(plan1, 'nutrition_tayyibat').toLowerCase();
    assert(
        reason.includes('سكر') || reason.includes('هبوط') || reason.includes('إشارات'),
        `Nutrition reason did not mention expected signals: "${reason}"`,
    );
});

/* ════════════════════════════════════════════════════════════
   SCENARIO 2: Anxiety + caffeine + poor sleep
   ════════════════════════════════════════════════════════════ */

console.log('\n══════════════════════════════════════════════');
console.log('  SCENARIO 2: Anxiety + caffeine + poor sleep');
console.log('══════════════════════════════════════════════\n');

const S2_ANSWERS: Record<string, AnswerValue> = {
    triggers: ['خفقان متكرر وضيق بلا سبب طبي'],
    modifiers: ['يسوء قبل النوم'],
    habits: ['قهوة', 'شاي زيادة'],
};

const plan2 = buildAdaptiveQuestionPlan({
    pathwayId:       'anxiety',
    severity:        5,
    duration:        'weeks',
    existingAnswers: S2_ANSWERS,
    clinicalAnswers: S2_ANSWERS,
});

test('S2: nutrition_tayyibat shown for anxiety + caffeine', () => {
    assert(stageShown(plan2, 'nutrition_tayyibat'), `nutrition hidden for anxiety+caffeine — reason: ${stageReason(plan2, 'nutrition_tayyibat')}`);
});

test('S2: not emergency_possible', () => {
    assert(plan2.triageRiskHint !== 'emergency_possible', `Unexpected emergency triage for anxiety with severity 5`);
});

test('S2: snapshot.foodSignalFound = true', () => {
    assert(plan2.snapshot.foodSignalFound === true, 'Food signal not detected for caffeine/sleep answers');
});

/* ════════════════════════════════════════════════════════════
   SCENARIO 3: Back pain + constipation + bloating
   ════════════════════════════════════════════════════════════ */

console.log('\n══════════════════════════════════════════════');
console.log('  SCENARIO 3: Back pain + constipation + bloating');
console.log('══════════════════════════════════════════════\n');

const S3_ANSWERS: Record<string, AnswerValue> = {
    location: ['ظهر', 'أسفل الظهر'],
    pattern:  ['إمساك', 'انتفاخ بعد الأكل'],
};

const plan3 = buildAdaptiveQuestionPlan({
    pathwayId:       'pain',
    severity:        5,
    duration:        'weeks',
    existingAnswers: S3_ANSWERS,
    clinicalAnswers: S3_ANSWERS,
});

test('S3: nutrition_tayyibat shown for back pain + digestive signals', () => {
    assert(stageShown(plan3, 'nutrition_tayyibat'), `nutrition hidden for back+constipation — reason: ${stageReason(plan3, 'nutrition_tayyibat')}`);
});

test('S3: snapshot.foodSignalFound = true', () => {
    assert(plan3.snapshot.foodSignalFound === true, 'Constipation/bloating signal not detected');
});

/* ════════════════════════════════════════════════════════════
   SCENARIO 4: Dental pain only
   ════════════════════════════════════════════════════════════ */

console.log('\n══════════════════════════════════════════════');
console.log('  SCENARIO 4: Dental pain only');
console.log('══════════════════════════════════════════════\n');

const S4_ANSWERS: Record<string, AnswerValue> = {
    location: ['أسنان', 'لثة'],
    pattern:  ['ألم موضعي'],
};

const plan4 = buildAdaptiveQuestionPlan({
    pathwayId:       'dental',
    severity:        4,
    duration:        'days',
    existingAnswers: S4_ANSWERS,
    clinicalAnswers: S4_ANSWERS,
});

test('S4: nutrition_tayyibat hidden for dental pathway', () => {
    assert(!stageShown(plan4, 'nutrition_tayyibat'), 'Nutrition was shown for dental-only case (should be hidden)');
});

test('S4: snapshot.nutritionShown = false', () => {
    assert(plan4.snapshot.nutritionShown === false, 'Snapshot says nutrition shown for dental');
});

/* ════════════════════════════════════════════════════════════
   SCENARIO 5: Chest pain + severe dyspnea
   ════════════════════════════════════════════════════════════ */

console.log('\n══════════════════════════════════════════════');
console.log('  SCENARIO 5: Chest pain + severe shortness of breath (Red Flag)');
console.log('══════════════════════════════════════════════\n');

const S5_ANSWERS: Record<string, AnswerValue> = {
    location: ['صدر', 'ألم صدر'],
    pattern:  ['ضيق تنفس شديد'],
};

const plan5 = buildAdaptiveQuestionPlan({
    pathwayId:        'cardiac',
    severity:         9,
    duration:         'hours',
    existingAnswers:  S5_ANSWERS,
    clinicalAnswers:  S5_ANSWERS,
    hasRedFlagSignal: true,
});

test('S5: triageRiskHint is emergency_possible', () => {
    assert(plan5.triageRiskHint === 'emergency_possible', `Expected emergency_possible, got: ${plan5.triageRiskHint}`);
});

test('S5: nutrition_tayyibat hidden for emergency', () => {
    assert(!stageShown(plan5, 'nutrition_tayyibat'), 'Nutrition was shown for emergency (chest pain)');
});

test('S5: safety shown and critical', () => {
    const safety = plan5.decisions.find(d => d.stage === 'safety');
    assert(safety?.shouldShow === true && safety?.priority === 'critical', `Safety not critical for emergency`);
});

test('S5: shouldMinimizeBurden = true', () => {
    assert(plan5.shouldMinimizeBurden === true, `Expected shouldMinimizeBurden=true for severity 9 + red flag`);
});

test('S5: snapshot.burdenMinimized = true', () => {
    assert(plan5.snapshot.burdenMinimized === true, `Snapshot burdenMinimized not true`);
});

/* ════════════════════════════════════════════════════════════
   SCENARIO 6: Stable mild symptom, no food signals
   ════════════════════════════════════════════════════════════ */

console.log('\n══════════════════════════════════════════════');
console.log('  SCENARIO 6: Stable mild symptom, no food signals');
console.log('══════════════════════════════════════════════\n');

const S6_ANSWERS: Record<string, AnswerValue> = {
    pattern: ['ألم موضعي خفيف'],
    timing:  ['صباحي فقط'],
};

const plan6 = buildAdaptiveQuestionPlan({
    pathwayId:       'headache',
    severity:        2,
    duration:        'days',
    existingAnswers: S6_ANSWERS,
    clinicalAnswers: S6_ANSWERS,
});

test('S6: nutrition hidden for no food signals + mild severity', () => {
    // headache is not in INHERENTLY_FOOD_PATHWAYS and no food keywords → hidden
    const nutritionDecision = plan6.decisions.find(d => d.stage === 'nutrition_tayyibat');
    assert(
        !nutritionDecision?.shouldShow,
        `Nutrition shown for mild headache with no food signals`,
    );
});

test('S6: core_clinical always shown', () => {
    assert(stageShown(plan6, 'core_clinical'), 'Core clinical should always be shown');
});

/* ════════════════════════════════════════════════════════════
   SCENARIO 7: Chronic moderate + unclear answers → deep intake
   ════════════════════════════════════════════════════════════ */

console.log('\n══════════════════════════════════════════════');
console.log('  SCENARIO 7: Chronic moderate symptoms + minimal answers');
console.log('══════════════════════════════════════════════\n');

const S7_ANSWERS: Record<string, AnswerValue> = {};  // minimal answers

const plan7 = buildAdaptiveQuestionPlan({
    pathwayId:       'fatigue',
    severity:        6,
    duration:        'months',
    existingAnswers: S7_ANSWERS,
    clinicalAnswers: S7_ANSWERS,
});

test('S7: deep_intake shown for chronic + moderate severity', () => {
    assert(stageShown(plan7, 'deep_intake'), `Deep intake hidden for chronic months + severity 6`);
});

test('S7: core_clinical shown', () => {
    assert(stageShown(plan7, 'core_clinical'), 'Core clinical should always be shown');
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
