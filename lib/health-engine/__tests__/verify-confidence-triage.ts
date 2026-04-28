// lib/health-engine/__tests__/verify-confidence-triage.ts
// ════════════════════════════════════════════════════════════════
// TIBRAH — Phase 3 Verification: Confidence + Contradictions + Triage
// Run: npm run verify:confidence
//
// 9 Scenarios:
//   1. All required answered + no contradictions + clear red flag negative + strong phenotype → high/medium confidence
//   2. Few answers + no duration + unknown red flags → low confidence + missingData populated
//   3. Severity low (3) + red flag positive answers → major contradiction + penalty
//   4. Chest pain + severe dyspnea → refinedTriage urgent/emergency, nutritionAllowed false
//   5. Chronic joint pain + daily headache + poor sleep, no red flags → needs_doctor, not emergency
//   6. High Tayyibat adherence + sugar/late meals → contradiction detected, confidence reduced
//   7. Meal logs ≥ 14 → nutrition confidence high, global clinical confidence unchanged
//   8. Dental pathway + no food signals → nutrition minimal/hidden
//   9. Dental pathway + explicit bloating + sugar crash signals → optional minimal nutrition allowed
// ════════════════════════════════════════════════════════════════

import { computeAssessmentConfidence } from '../confidence-engine';
import {
    detectAssessmentContradictions,
    totalContradictionPenalty,
    majorContradictionCount,
    fromLegacyContradictions,
} from '../contradiction-engine';
import { refineTriage } from '../triage-refinement';
import { buildAdaptiveQuestionPlan } from '../adaptive-question-orchestrator';

/* ── Test harness ────────────────────────────────────────────── */
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
   SCENARIO 1: All required answered + clear red flag negative + strong phenotype
   ════════════════════════════════════════════════════════════ */
console.log('\n══════════════════════════════════════════════');
console.log('  SCENARIO 1: Complete data → high/medium confidence');
console.log('══════════════════════════════════════════════\n');

const s1 = computeAssessmentConfidence({
    pathwayId:             'fatigue',
    severity:              6,
    duration:              'months',
    answeredRequiredCount: 8,
    totalRequiredCount:    8,
    answeredOptionalCount: 3,
    totalOptionalCount:    4,
    redFlagClarity:        'clear_negative',
    contradictionCount:    0,
    majorContradictionCount: 0,
    phenotypeStrength:     75,
    engineConfidenceScore: 72,
    triageLevel:           'needs_doctor',
});

test('S1: confidence label is high or medium', () => {
    assert(s1.label === 'high' || s1.label === 'medium', `Expected high/medium, got ${s1.label}`);
});
test('S1: score ≥ 65', () => {
    assert(s1.score >= 65, `Score too low: ${s1.score}`);
});
test('S1: no penalty for contradictions', () => {
    assert(!s1.penalties.includes('contradictions_detected_0') && s1.penalties.every(p => !p.startsWith('contradictions')), 'Unexpected contradiction penalty');
});
test('S1: reasons include red flag clarity', () => {
    assert(s1.reasons.some(r => r.includes('علامات الخطر')), 'No red flag clarity bonus in reasons');
});

/* ════════════════════════════════════════════════════════════
   SCENARIO 2: Few answers + no duration + unknown red flags → low confidence
   ════════════════════════════════════════════════════════════ */
console.log('\n══════════════════════════════════════════════');
console.log('  SCENARIO 2: Sparse data → low confidence');
console.log('══════════════════════════════════════════════\n');

const s2 = computeAssessmentConfidence({
    pathwayId:             'headache',
    severity:              4,
    duration:              'unknown',
    answeredRequiredCount: 1,
    totalRequiredCount:    6,
    redFlagClarity:        'unknown',
    contradictionCount:    0,
    majorContradictionCount: 0,
    engineConfidenceScore: 35,
    triageLevel:           'review',
});

test('S2: confidence label is low', () => {
    assert(s2.label === 'low', `Expected low, got ${s2.label}`);
});
test('S2: missingData includes duration', () => {
    assert(s2.missingData.some(m => m.includes('مدة')), `Missing duration not in missingData: ${s2.missingData}`);
});
test('S2: missingData includes red flag clarity', () => {
    assert(s2.missingData.some(m => m.includes('علامات الخطر')), `Missing red flag in missingData: ${s2.missingData}`);
});
test('S2: isPreliminary = true', () => {
    assert(s2.isPreliminary === true, 'Expected isPreliminary=true for low confidence');
});

/* ════════════════════════════════════════════════════════════
   SCENARIO 3: Severity 3 + red flag positive answers → major contradiction
   ════════════════════════════════════════════════════════════ */
console.log('\n══════════════════════════════════════════════');
console.log('  SCENARIO 3: Low severity + red flag answers → major contradiction');
console.log('══════════════════════════════════════════════\n');

const s3_contradictions = detectAssessmentContradictions({
    pathwayId: 'headache',
    severity:  3,
    duration:  'days',
    answers:   { pattern: ['ألم صدر شديد', 'ضيق تنفس'] },
    triageLevel: 'manageable',
});

test('S3: at least one contradiction detected', () => {
    assert(s3_contradictions.length >= 1, `Expected ≥1 contradiction, got ${s3_contradictions.length}`);
});
test('S3: AC1 (low severity + red flag) is major', () => {
    const ac1 = s3_contradictions.find(c => c.id === 'AC1');
    assert(ac1 !== undefined && ac1.severity === 'major', `AC1 not found or not major: ${JSON.stringify(s3_contradictions)}`);
});
test('S3: confidence penalty ≥ 15', () => {
    assert(totalContradictionPenalty(s3_contradictions) >= 15, `Penalty too low: ${totalContradictionPenalty(s3_contradictions)}`);
});
test('S3: majorContradictionCount ≥ 1', () => {
    assert(majorContradictionCount(s3_contradictions) >= 1, 'No major contradictions');
});

/* ════════════════════════════════════════════════════════════
   SCENARIO 4: Chest pain + severe dyspnea → emergency, no nutrition
   ════════════════════════════════════════════════════════════ */
console.log('\n══════════════════════════════════════════════');
console.log('  SCENARIO 4: Chest pain + dyspnea → emergency triage, no nutrition');
console.log('══════════════════════════════════════════════\n');

const s4_triage = refineTriage({
    baseTriage:       { level: 'urgent', score: 9 },
    pathwayId:        'cardiac',
    severity:         9,
    answers:          { symptoms: ['ألم صدر شديد', 'ضيق تنفس شديد'] },
    explicitRedFlags: ['chest pain', 'ألم صدر'],
    contradictions:   [],
});

test('S4: refinedTriage level is urgent or emergency', () => {
    assert(
        s4_triage.level === 'urgent' || s4_triage.level === 'emergency',
        `Expected urgent/emergency, got ${s4_triage.level}`,
    );
});
test('S4: nutritionAllowed = false', () => {
    assert(s4_triage.nutritionAllowed === false, `nutritionAllowed should be false for ${s4_triage.level}`);
});
test('S4: safetyMessage not null', () => {
    assert(s4_triage.safetyMessage !== null, 'Expected non-null safety message for urgent');
});
test('S4: lifestyleAllowed = false for emergency', () => {
    // lifestyle is only false for emergency, not urgent
    if (s4_triage.level === 'emergency') {
        assert(s4_triage.lifestyleAllowed === false, 'lifestyleAllowed should be false for emergency');
    } else {
        // urgent allows lifestyle
        assert(true, 'urgent: lifestyle check skipped');
    }
});

/* ════════════════════════════════════════════════════════════
   SCENARIO 5: Chronic joint + headache + poor sleep, no red flags → needs_doctor
   ════════════════════════════════════════════════════════════ */
console.log('\n══════════════════════════════════════════════');
console.log('  SCENARIO 5: Chronic multi-symptom, no red flags → needs_doctor, NOT emergency');
console.log('══════════════════════════════════════════════\n');

const s5_triage = refineTriage({
    baseTriage:  { level: 'review', score: 6 },
    pathwayId:   'pain',
    severity:    7,
    answers:     {
        symptoms: ['ألم مفاصل', 'صداع يومي'],
        sleep:    ['نوم سيئ', 'أرق'],
        duration: 'months',
    },
    explicitRedFlags: [],
    contradictions:   [],
});

test('S5: NOT emergency', () => {
    assert(s5_triage.level !== 'emergency', `Should not be emergency for chronic non-red-flag: ${s5_triage.level}`);
});
test('S5: level is needs_doctor or review', () => {
    assert(
        s5_triage.level === 'needs_doctor' || s5_triage.level === 'review',
        `Expected needs_doctor/review, got ${s5_triage.level}`,
    );
});
test('S5: lifestyleAllowed = true', () => {
    assert(s5_triage.lifestyleAllowed === true, 'Lifestyle should be allowed for non-emergency');
});

/* ════════════════════════════════════════════════════════════
   SCENARIO 6: High Tayyibat adherence + sugar/late meals → contradiction
   ════════════════════════════════════════════════════════════ */
console.log('\n══════════════════════════════════════════════');
console.log('  SCENARIO 6: Tayyibat adherence claimed + poor habits → AC6 contradiction');
console.log('══════════════════════════════════════════════\n');

const s6_contradictions = detectAssessmentContradictions({
    pathwayId: 'fatigue',
    severity:  5,
    duration:  'weeks',
    answers:   {
        habits: ['عشاء متأخر', 'سكر يومياً', 'مشروبات سكرية'],
    },
    tayyibatVerdict: {
        primaryPattern:     'high_adherence',
        safetyGated:        false,
        contradictionNotes: [],
        confidenceScore:    75,
    },
    triageLevel: 'manageable',
});

test('S6: AC6 (Tayyibat adherence + poor habits) detected', () => {
    const ac6 = s6_contradictions.find(c => c.id === 'AC6');
    assert(ac6 !== undefined, `AC6 not detected: ${JSON.stringify(s6_contradictions)}`);
});
test('S6: AC6 is moderate severity', () => {
    const ac6 = s6_contradictions.find(c => c.id === 'AC6');
    assert(ac6?.severity === 'moderate', `Expected moderate, got ${ac6?.severity}`);
});
test('S6: penalty reduces confidence', () => {
    const s6_conf = computeAssessmentConfidence({
        pathwayId:              'fatigue',
        answeredRequiredCount:  5,
        totalRequiredCount:     8,
        contradictionCount:     s6_contradictions.length,
        majorContradictionCount: majorContradictionCount(s6_contradictions),
        tayyibatVerdict: {
            confidenceScore:    75,
            mealLogCountUsed:   0,
            safetyGated:        false,
            contradictionNotes: ['sugar habits inconsistent'],
        },
        engineConfidenceScore: 60,
        triageLevel:           'manageable',
    });
    assert(s6_conf.score < 65, `Score not reduced enough: ${s6_conf.score}`);
});

/* ════════════════════════════════════════════════════════════
   SCENARIO 7: Meal logs ≥ 14 → nutrition confidence high, NOT global confidence
   ════════════════════════════════════════════════════════════ */
console.log('\n══════════════════════════════════════════════');
console.log('  SCENARIO 7: Meal logs ≥ 14 → nutrition confidence up, global unchanged');
console.log('══════════════════════════════════════════════\n');

const s7_with_logs = computeAssessmentConfidence({
    pathwayId:             'fatigue',
    severity:              5,
    answeredRequiredCount: 3,
    totalRequiredCount:    8,
    engineConfidenceScore: 48,
    mealLogCount:          16,
    tayyibatVerdict: {
        confidenceScore:    60,
        mealLogCountUsed:   16,
        safetyGated:        false,
        contradictionNotes: [],
    },
    triageLevel: 'review',
});

const s7_without_logs = computeAssessmentConfidence({
    pathwayId:             'fatigue',
    severity:              5,
    answeredRequiredCount: 3,
    totalRequiredCount:    8,
    engineConfidenceScore: 48,
    mealLogCount:          0,
    triageLevel:           'review',
});

test('S7: nutritionConfidence ≥ 75 with 16 logs', () => {
    assert(s7_with_logs.nutritionConfidence >= 75, `Nutrition confidence too low: ${s7_with_logs.nutritionConfidence}`);
});
test('S7: global score does not jump to high from meal logs alone', () => {
    assert(s7_with_logs.label !== 'high' || s7_with_logs.score < 85,
        `Global confidence went too high (${s7_with_logs.score}) purely from meal logs`);
});
test('S7: without logs, nutritionConfidence is lower', () => {
    assert(s7_without_logs.nutritionConfidence < s7_with_logs.nutritionConfidence,
        `Expected lower nutritionConfidence without logs: ${s7_without_logs.nutritionConfidence} vs ${s7_with_logs.nutritionConfidence}`);
});

/* ════════════════════════════════════════════════════════════
   SCENARIO 8: Dental pathway + no food signals → nutrition minimal/hidden
   ════════════════════════════════════════════════════════════ */
console.log('\n══════════════════════════════════════════════');
console.log('  SCENARIO 8: Dental + no food signals → nutrition hidden');
console.log('══════════════════════════════════════════════\n');

const s8_plan = buildAdaptiveQuestionPlan({
    pathwayId:       'dental',
    severity:        4,
    duration:        'days',
    existingAnswers: { location: ['أسنان'], pattern: ['ألم موضعي'] },
    clinicalAnswers: { location: ['أسنان'], pattern: ['ألم موضعي'] },
});

const s8_nutrition = s8_plan.decisions.find(d => d.stage === 'nutrition_tayyibat');
test('S8: nutrition hidden for dental with no food signals', () => {
    assert(s8_nutrition?.shouldShow === false, `Nutrition should be hidden for dental+no food signals: ${JSON.stringify(s8_nutrition)}`);
});

/* ════════════════════════════════════════════════════════════
   SCENARIO 9: Dental pathway + explicit sugar crash + bloating → optional minimal
   ════════════════════════════════════════════════════════════ */
console.log('\n══════════════════════════════════════════════');
console.log('  SCENARIO 9: Dental + bloating + sugar crash → optional minimal nutrition');
console.log('══════════════════════════════════════════════\n');

const s9_plan = buildAdaptiveQuestionPlan({
    pathwayId:       'dental',
    severity:        4,
    duration:        'weeks',
    existingAnswers: {
        location:  ['أسنان', 'لثة'],
        symptoms:  ['انتفاخ', 'إرهاق بعد الأكل', 'رغبة في الحلو'],
    },
    clinicalAnswers: {
        location:  ['أسنان', 'لثة'],
        symptoms:  ['انتفاخ', 'إرهاق بعد الأكل', 'رغبة في الحلو'],
    },
});

const s9_nutrition = s9_plan.decisions.find(d => d.stage === 'nutrition_tayyibat');
test('S9: nutrition optionally shown for dental + strong food signals', () => {
    // Should show optional minimal (max 2 questions)
    assert(
        s9_nutrition?.shouldShow === true,
        `Nutrition should be optionally shown for dental+bloating+sugar crash: ${JSON.stringify(s9_nutrition)}`,
    );
});
test('S9: max 2 questions for dental minimal nutrition', () => {
    assert(
        (s9_nutrition?.maxQuestions ?? 0) <= 2,
        `Should be ≤2 questions for dental minimal, got ${s9_nutrition?.maxQuestions}`,
    );
});
test('S9: userFacingLabel is optional/رؤية غذائية اختيارية', () => {
    assert(
        s9_nutrition?.userFacingLabel?.includes('اختياري') ?? false,
        `Expected optional label, got: ${s9_nutrition?.userFacingLabel}`,
    );
});

/* ════════════════════════════════════════════════════════════
   fromLegacyContradictions utility
   ════════════════════════════════════════════════════════════ */
console.log('\n══════════════════════════════════════════════');
console.log('  UTIL: fromLegacyContradictions bridge');
console.log('══════════════════════════════════════════════\n');

const legacyFlags = [
    { id: 'C1', severity: 'medium', message: 'Test', confidenceImpact: 12 },
    { id: 'C3', severity: 'high',   message: 'Test2', confidenceImpact: 20 },
];
const bridged = fromLegacyContradictions(legacyFlags);
test('UTIL: C3 high maps to major', () => {
    assert(bridged.find(c => c.id === 'LEGACY_C3')?.severity === 'major', 'C3 high should map to major');
});
test('UTIL: C1 medium maps to moderate', () => {
    assert(bridged.find(c => c.id === 'LEGACY_C1')?.severity === 'moderate', 'C1 medium should map to moderate');
});

/* ════════════════════════════════════════════════════════════
   FINAL REPORT
   ════════════════════════════════════════════════════════════ */
console.log('\n══════════════════════════════════════════════');
const total = passed + failed;
if (failed === 0) {
    console.log(`  ✅ STATUS: ALL ${total} SCENARIOS PASS`);
    console.log('  Phase 3: Confidence + Contradictions + Triage VERIFIED');
} else {
    console.log(`  ❌ STATUS: ${failed}/${total} FAILED`);
}
console.log('══════════════════════════════════════════════\n');

if (failed > 0) process.exit(1);
