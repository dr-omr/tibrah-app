/**
 * lib/tayyibat/__tests__/verify-tayyibat-integration.ts
 *
 * STANDALONE VERIFIER — لا يحتاج Jest أو browser
 * يعمل مباشرة: npx tsx lib/tayyibat/__tests__/verify-tayyibat-integration.ts
 *
 * يطبع:
 *   ✅ PASS  — السيناريو + الاختبار
 *   ❌ FAIL  — السيناريو + السبب
 *   ⚠️  SKIP  — إذا الاختبار غير قابل للتشغيل
 *
 * يخرج بكود خطأ ≠ 0 إذا فشل أي اختبار
 */

import { detectPatterns, computeConfidence, detectContradictions } from '../pattern-engine';
import type { TayyibatAnswers } from '../tayyibat-scoring-engine';
import { detectFoodSignalsInAnswers, hasFoodRelevantSignals } from '../../clinical/tayyibat-adaptive-screening';

// ── أدوات الاختبار ──
let totalTests = 0;
let passed     = 0;
let failed     = 0;

function assert(
    scenarioId:  string,
    description: string,
    condition:   boolean,
    actual?:     unknown,
    expected?:   unknown,
): void {
    totalTests++;
    if (condition) {
        passed++;
        console.log(`  ✅ ${description}`);
    } else {
        failed++;
        const msg = actual !== undefined
            ? `\n     Expected: ${JSON.stringify(expected)}\n     Actual  : ${JSON.stringify(actual)}`
            : '';
        console.log(`  ❌ ${description}${msg}`);
    }
}

function section(title: string): void {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📋 ${title}`);
    console.log('─'.repeat(60));
}

// ── Base Answers ──
const base = (): TayyibatAnswers => ({
    oilType: 'mixed', sugarLevel: 'rare', proteinFreq: 'twice',
    vegetableFreq: 'daily', processedFood: 'rarely', mealTiming: 'structured',
    bloatingFreq: 'never', gasFreq: 'never', constipation: 'never', acidReflux: 'never',
    morningFatigue: 'never', postMealCrash: 'never', sugarCraving: 'none', afternoonSlump: 'never',
    jointPain: 'none', headacheFreq: 'never', skinIssues: 'none',
    sleepQuality: 'good', focusLevel: 'good',
    knowledgeLevel: 'basic', currentLevel: 'partial', biggestChallenge: '',
    explicitRedFlagDetected: false,
});
const nullContras = { hasContradictions: false, notes: [], confidenceImpact: 0 };

// ════════════════════════════════════════════════════════════════
// SCENARIO 1 — Sugar Dependency
// ════════════════════════════════════════════════════════════════
section('Scenario 1 — Fatigue + Sugar Cravings → sugar_dependency');
{
    const a: TayyibatAnswers = {
        ...base(),
        sugarLevel: 'daily', postMealCrash: 'often',
        sugarCraving: 'strong', afternoonSlump: 'often',
    };
    const r = detectPatterns(a);
    assert('S1', 'primaryPattern = sugar_dependency',           r.primaryPattern === 'sugar_dependency',           r.primaryPattern,          'sugar_dependency');
    assert('S1', 'safetyGated = false',                         r.safetyGated === false,                           r.safetyGated,             false);
    assert('S1', 'medicalReviewLevel = none',                   r.medicalReviewLevel === 'none',                   r.medicalReviewLevel,       'none');
    assert('S1', 'sugar_dependency score >= 60',                r.patternScores.sugar_dependency >= 60,            r.patternScores.sugar_dependency, '>=60');
}

// ════════════════════════════════════════════════════════════════
// SCENARIO 3a — Chronic Joint Pain: recommended ONLY
// ════════════════════════════════════════════════════════════════
section('Scenario 3a — Severe Joint Pain: recommended (NOT required_first)');
{
    const a: TayyibatAnswers = {
        ...base(), jointPain: 'severe',
        headacheFreq: 'rarely', sleepQuality: 'good', explicitRedFlagDetected: false,
    };
    const r = detectPatterns(a);
    assert('S3a', 'safetyGated = false',                        r.safetyGated === false,                           r.safetyGated,             false);
    assert('S3a', 'medicalReviewLevel = recommended',           r.medicalReviewLevel === 'recommended',            r.medicalReviewLevel,       'recommended');
    assert('S3a', 'primaryPattern !== medical_review_first',    r.primaryPattern !== 'medical_review_first',       r.primaryPattern,          '!= medical_review_first');
    assert('S3a', 'routeToProtocol is not null',                r.routeToProtocol !== null,                        r.routeToProtocol,         'not null');
}

// ════════════════════════════════════════════════════════════════
// SCENARIO 7 — Severe Joint + Daily Headache + Poor Sleep → recommended ONLY
// CRITICAL: was incorrectly required_first before fix
// ════════════════════════════════════════════════════════════════
section('Scenario 7 — Severe Joint + Daily Headache + Poor Sleep → recommended NOT required_first');
{
    const a: TayyibatAnswers = {
        ...base(),
        jointPain: 'severe', headacheFreq: 'daily', sleepQuality: 'poor',
        explicitRedFlagDetected: false,
    };
    const r = detectPatterns(a);
    assert('S7', '🔴 CRITICAL: safetyGated = false',           r.safetyGated === false,            r.safetyGated,           false);
    assert('S7', '🔴 CRITICAL: medicalReviewLevel = recommended', r.medicalReviewLevel === 'recommended', r.medicalReviewLevel, 'recommended');
    assert('S7', 'primaryPattern != medical_review_first',      r.primaryPattern !== 'medical_review_first', r.primaryPattern, '!= medical_review_first');
    assert('S7', 'nutrition guidance remains (routeToProtocol not null)', r.routeToProtocol !== null, r.routeToProtocol, 'not null');
}

// ════════════════════════════════════════════════════════════════
// SCENARIO 10 — Explicit Red Flag (chest pain / urgent triage)
// ════════════════════════════════════════════════════════════════
section('Scenario 10 — Explicit Red Flag → required_first + safetyGated');
{
    const a: TayyibatAnswers = {
        ...base(),
        processedFood: 'daily', oilType: 'seed_oils', sugarLevel: 'daily',
        explicitRedFlagDetected: true,
    };
    const r = detectPatterns(a);
    assert('S10', 'safetyGated = true',                        r.safetyGated === true,                            r.safetyGated,             true);
    assert('S10', 'medicalReviewLevel = required_first',       r.medicalReviewLevel === 'required_first',         r.medicalReviewLevel,       'required_first');
    assert('S10', 'primaryPattern = medical_review_first',     r.primaryPattern === 'medical_review_first',       r.primaryPattern,           'medical_review_first');
    assert('S10', 'routeToProtocol = null',                    r.routeToProtocol === null,                        r.routeToProtocol,          null);
    assert('S10', 'secondaryPatterns empty',                   r.secondaryPatterns.length === 0,                  r.secondaryPatterns.length, 0);
}

// ════════════════════════════════════════════════════════════════
// SCENARIO 8 — Anxiety + Food Signals → Tayyibat screening appears
// ════════════════════════════════════════════════════════════════
section('Scenario 8 — Anxiety Pathway + Food Signals → screening ON');
{
    const answersWithSignals = { symptoms: 'قلق وقهوة كثير وسكر', sleep: 'نوم سيئ' };
    const answersNoSignals   = { symptoms: 'خوف وقلق بحت' };

    assert('S8', 'anxiety + caffeine + sugar → signals detected',
        detectFoodSignalsInAnswers(answersWithSignals) === true,
        detectFoodSignalsInAnswers(answersWithSignals), true);

    assert('S8', 'anxiety WITHOUT food signals → no screening',
        hasFoodRelevantSignals('anxiety', 5, answersNoSignals) === false,
        hasFoodRelevantSignals('anxiety', 5, answersNoSignals), false);

    assert('S8', 'anxiety WITH food signals → screening shown',
        hasFoodRelevantSignals('anxiety', 5, answersWithSignals) === true,
        hasFoodRelevantSignals('anxiety', 5, answersWithSignals), true);
}

// ════════════════════════════════════════════════════════════════
// SCENARIO 9 — Back Pain + Bloating → digestive insight appears
// ════════════════════════════════════════════════════════════════
section('Scenario 9 — Back Pain + Bloating → Tayyibat screening ON');
{
    const clinicalAnswers = { symptoms: 'ألم ظهر وانتفاخ وإمساك' };

    assert('S9', 'back + bloating signals → screening shown',
        hasFoodRelevantSignals('back', 5, clinicalAnswers) === true,
        hasFoodRelevantSignals('back', 5, clinicalAnswers), true);

    // Pattern check
    const a: TayyibatAnswers = { ...base(), bloatingFreq: 'often', constipation: 'often', gasFreq: 'sometimes' };
    const r = detectPatterns(a);
    const allPatterns = [r.primaryPattern, ...r.secondaryPatterns];
    assert('S9', 'digestive_burden appears in top patterns',
        allPatterns.includes('digestive_burden'),
        allPatterns, 'includes digestive_burden');
}

// ════════════════════════════════════════════════════════════════
// ADAPTIVE SCREENING — STRICT BLOCKS
// ════════════════════════════════════════════════════════════════
section('Adaptive Screening — Strict Blocks');
{
    assert('SCREEN', 'dental → no food questions',
        hasFoodRelevantSignals('dental', 5, { s: 'انتفاخ' }) === false,
        hasFoodRelevantSignals('dental', 5, { s: 'انتفاخ' }), false);

    assert('SCREEN', 'vision → no food questions',
        hasFoodRelevantSignals('vision', 5, { s: 'تعب' }) === false,
        hasFoodRelevantSignals('vision', 5, { s: 'تعب' }), false);

    assert('SCREEN', 'severity=9 → no food questions even for fatigue',
        hasFoodRelevantSignals('fatigue', 9, {}) === false,
        hasFoodRelevantSignals('fatigue', 9, {}), false);

    assert('SCREEN', 'fatigue pathway → always show (inherent food pathway)',
        hasFoodRelevantSignals('fatigue', 5, {}) === true,
        hasFoodRelevantSignals('fatigue', 5, {}), true);
}

// ════════════════════════════════════════════════════════════════
// CONFIDENCE CALIBRATION
// ════════════════════════════════════════════════════════════════
section('Confidence Calibration');
{
    const c0  = computeConfidence(7, 7, 0,  nullContras);
    const c4  = computeConfidence(7, 7, 4,  nullContras);
    const c5  = computeConfidence(7, 7, 5,  nullContras);
    const c14 = computeConfidence(7, 7, 14, nullContras);
    const c21 = computeConfidence(7, 7, 21, nullContras);
    const cFull = computeConfidence(25, 25, 21, nullContras);

    assert('CONF', '0 and 4 logs give same score (no bonus < 5)',  c0.score === c4.score,   `${c0.score} vs ${c4.score}`, 'equal');
    assert('CONF', '5 logs > 0 logs',                              c5.score > c0.score,     `${c5.score} > ${c0.score}`, 'true');
    assert('CONF', '14 logs > 5 logs',                             c14.score > c5.score,    `${c14.score} > ${c5.score}`, 'true');
    assert('CONF', '21 logs > 14 logs',                            c21.score > c14.score,   `${c21.score} > ${c14.score}`, 'true');
    assert('CONF', 'full(25q+21logs) = high',                      cFull.label === 'high',  cFull.label, 'high');
    assert('CONF', '5 logs alone ≠ high',                          c5.label !== 'high',     c5.label, '!= high');
    assert('CONF', '<5 logs explanation mentions وجبات',           c0.explanation.includes('وجبات'), true, true);
}

// ════════════════════════════════════════════════════════════════
// FINAL REPORT
// ════════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log(`📊 TAYYIBAT INTEGRATION VERIFICATION REPORT`);
console.log('═'.repeat(60));
console.log(`  Total Tests : ${totalTests}`);
console.log(`  ✅ Passed   : ${passed}`);
console.log(`  ❌ Failed   : ${failed}`);
console.log('═'.repeat(60));

if (failed > 0) {
    console.log('\n🔴 STATUS: FAILED — fix the ❌ scenarios above before marking complete\n');
    process.exit(1);
} else {
    console.log('\n🟢 STATUS: ALL SCENARIOS PASS — verified locally\n');
    process.exit(0);
}
