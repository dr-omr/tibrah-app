// lib/tayyibat/__tests__/tayyibat-integration-golden-scenarios.ts
// ══════════════════════════════════════════════════════════════
// السيناريوهات الذهبية — اختبار تكامل الطيبات مع محرك التقييم
// لا تُشغَّل تلقائياً — للتحقق اليدوي أثناء التطوير
// ══════════════════════════════════════════════════════════════

import { detectPatterns, computeConfidence, detectContradictions, PATTERN_DESCRIPTIONS }
    from '@/lib/tayyibat/pattern-engine';
import type { TayyibatAnswers } from '@/lib/tayyibat/tayyibat-scoring-engine';

// ── helper ──
function expect(label: string, condition: boolean): void {
    if (!condition) {
        console.error(`❌ FAIL: ${label}`);
    } else {
        console.log(`✅ PASS: ${label}`);
    }
}

/* ══════════════════════════════════════════════════════════
   SCENARIO 1: إرهاق + رغبة سكر + هبوط طاقة
   Expected: primaryPattern = sugar_dependency
   ══════════════════════════════════════════════════════════ */
function scenario1_FatigueSugarDependency(): void {
    console.log('\n── Scenario 1: Fatigue + Sugar Cravings ──');
    const answers: TayyibatAnswers = {
        oilType: 'mixed', sugarLevel: 'daily', proteinFreq: 'once',
        vegetableFreq: 'few', processedFood: 'often', mealTiming: 'partial',
        bloatingFreq: 'sometimes', gasFreq: 'never', constipation: 'never', acidReflux: 'never',
        morningFatigue: 'often', postMealCrash: 'often', sugarCraving: 'strong', afternoonSlump: 'often',
        jointPain: 'none', headacheFreq: 'rarely', skinIssues: 'none',
        sleepQuality: 'fair', focusLevel: 'fair',
        knowledgeLevel: 'little', currentLevel: 'none', biggestChallenge: '',
    };
    const patterns = detectPatterns(answers);
    expect('primaryPattern = sugar_dependency', patterns.primaryPattern === 'sugar_dependency');
    expect('safetyGated = false', patterns.safetyGated === false);
    expect('patternScore sugar_dependency >= 60', patterns.patternScores.sugar_dependency >= 60);
    expect('firstStep references protein or sugar', PATTERN_DESCRIPTIONS.sugar_dependency.primaryRecommendation.includes('بروتين') || PATTERN_DESCRIPTIONS.sugar_dependency.primaryRecommendation.includes('سكر'));
    console.log('  Pattern:', patterns.primaryPattern, '| Score:', patterns.patternScores.sugar_dependency);
    console.log('  Step:', PATTERN_DESCRIPTIONS[patterns.primaryPattern].primaryRecommendation);
}

/* ══════════════════════════════════════════════════════════
   SCENARIO 2: انتفاخ + غازات + حموضة
   Expected: primaryPattern = digestive_burden
   ══════════════════════════════════════════════════════════ */
function scenario2_DigestiveBurden(): void {
    console.log('\n── Scenario 2: Bloating + Gas + Reflux ──');
    const answers: TayyibatAnswers = {
        oilType: 'mixed', sugarLevel: 'weekly', proteinFreq: 'twice',
        vegetableFreq: 'daily', processedFood: 'rarely', mealTiming: 'structured',
        bloatingFreq: 'often', gasFreq: 'often', constipation: 'sometimes', acidReflux: 'often',
        morningFatigue: 'sometimes', postMealCrash: 'sometimes', sugarCraving: 'mild', afternoonSlump: 'sometimes',
        jointPain: 'none', headacheFreq: 'rarely', skinIssues: 'none',
        sleepQuality: 'good', focusLevel: 'good',
        knowledgeLevel: 'basic', currentLevel: 'partial', biggestChallenge: '',
    };
    const patterns = detectPatterns(answers);
    expect('primaryPattern = digestive_burden', patterns.primaryPattern === 'digestive_burden');
    expect('safetyGated = false', patterns.safetyGated === false);
    expect('digestive_burden score >= 60', patterns.patternScores.digestive_burden >= 60);
    console.log('  Pattern:', patterns.primaryPattern, '| Score:', patterns.patternScores.digestive_burden);
}

/* ══════════════════════════════════════════════════════════
   SCENARIO 3: ألم صدري شديد + نظام غذائي سيئ
   Expected: safety_gated = true → medical_review_first
   Tayyibat does NOT become primary treatment
   ══════════════════════════════════════════════════════════ */
function scenario3_RedFlagsOverride(): void {
    console.log('\n── Scenario 3: Red Flags (Medical Review First) ──');
    const answers: TayyibatAnswers = {
        oilType: 'seed_oils', sugarLevel: 'daily', proteinFreq: 'once',
        vegetableFreq: 'rarely', processedFood: 'daily', mealTiming: 'random',
        bloatingFreq: 'often', gasFreq: 'often', constipation: 'often', acidReflux: 'often',
        morningFatigue: 'always', postMealCrash: 'always', sugarCraving: 'strong', afternoonSlump: 'always',
        jointPain: 'severe',  // proxy red flag
        headacheFreq: 'daily', skinIssues: 'severe',
        sleepQuality: 'poor', focusLevel: 'poor',
        knowledgeLevel: 'none', currentLevel: 'none', biggestChallenge: '',
    };
    const patterns = detectPatterns(answers);
    expect('safetyGated = true', patterns.safetyGated === true);
    expect('primaryPattern = medical_review_first', patterns.primaryPattern === 'medical_review_first');
    expect('secondaryPatterns empty (safety gated)', patterns.secondaryPatterns.length === 0);
    console.log('  Pattern:', patterns.primaryPattern, '| SafetyGated:', patterns.safetyGated);
}

/* ══════════════════════════════════════════════════════════
   SCENARIO 4: نوم سيئ + أكل ليلي متأخر + كافيين
   Expected: primaryPattern = rhythm_disruption
   ══════════════════════════════════════════════════════════ */
function scenario4_RhythmDisruption(): void {
    console.log('\n── Scenario 4: Poor Sleep + Late Dinner + Caffeine ──');
    const answers: TayyibatAnswers = {
        oilType: 'olive_only', sugarLevel: 'rare', proteinFreq: 'twice',
        vegetableFreq: 'daily', processedFood: 'rarely', mealTiming: 'random',  // late meals
        bloatingFreq: 'sometimes', gasFreq: 'never', constipation: 'never', acidReflux: 'sometimes',
        morningFatigue: 'often', postMealCrash: 'sometimes', sugarCraving: 'mild', afternoonSlump: 'sometimes',
        jointPain: 'none', headacheFreq: 'rarely', skinIssues: 'none',
        sleepQuality: 'poor', focusLevel: 'fair',  // poor sleep
        knowledgeLevel: 'basic', currentLevel: 'partial', biggestChallenge: '',
    };
    const patterns = detectPatterns(answers);
    expect('rhythm_disruption score >= 50', patterns.patternScores.rhythm_disruption >= 50);
    expect('safetyGated = false', patterns.safetyGated === false);
    console.log('  Pattern:', patterns.primaryPattern, '| RhythmScore:', patterns.patternScores.rhythm_disruption);
    console.log('  Step:', PATTERN_DESCRIPTIONS[patterns.primaryPattern].primaryRecommendation);
}

/* ══════════════════════════════════════════════════════════
   SCENARIO 5: ادعاء التزام كامل + سكر يومي (تناقض)
   Expected: contradictionNotes.length > 0, confidence reduced
   ══════════════════════════════════════════════════════════ */
function scenario5_ContradictionDetected(): void {
    console.log('\n── Scenario 5: Contradiction (High Adherence Claim + Daily Sugar) ──');
    const answers: TayyibatAnswers = {
        oilType: 'olive_only', sugarLevel: 'daily',  // contradiction
        proteinFreq: 'every_meal', vegetableFreq: 'every_meal',
        processedFood: 'never', mealTiming: 'structured',
        bloatingFreq: 'never', gasFreq: 'never', constipation: 'never', acidReflux: 'never',
        morningFatigue: 'never', postMealCrash: 'never', sugarCraving: 'none', afternoonSlump: 'never',
        jointPain: 'none', headacheFreq: 'never', skinIssues: 'none',
        sleepQuality: 'excellent', focusLevel: 'excellent',
        knowledgeLevel: 'expert', currentLevel: 'full',  // contradiction: full + daily sugar
        biggestChallenge: '',
    };
    const contras = detectContradictions(answers, []);
    expect('contradiction detected', contras.hasContradictions === true);
    expect('confidence impact negative', contras.confidenceImpact < 0);
    expect('contradiction notes non-empty', contras.notes.length > 0);

    const conf = computeConfidence(22, 25, 0, contras);
    expect('confidence label is medium or low (not high)', conf.label !== 'high');
    console.log('  Contradictions:', contras.notes[0]?.slice(0, 60));
    console.log('  Confidence:', conf.score, '|', conf.label);
}

/* ══════════════════════════════════════════════════════════
   SCENARIO 6: لا أعراض غذائية واضحة
   Expected: card shown only if pathway has food relevance, low intensity
   ══════════════════════════════════════════════════════════ */
function scenario6_NoFoodSignals(): void {
    console.log('\n── Scenario 6: No Food Signals → Minimal Tayyibat Section ──');
    const answers: TayyibatAnswers = {
        oilType: 'olive_only', sugarLevel: 'rare',
        proteinFreq: 'every_meal', vegetableFreq: 'every_meal',
        processedFood: 'rarely', mealTiming: 'structured',
        bloatingFreq: 'never', gasFreq: 'never', constipation: 'never', acidReflux: 'never',
        morningFatigue: 'never', postMealCrash: 'never', sugarCraving: 'none', afternoonSlump: 'never',
        jointPain: 'none', headacheFreq: 'rarely', skinIssues: 'none',
        sleepQuality: 'good', focusLevel: 'good',
        knowledgeLevel: 'expert', currentLevel: 'full', biggestChallenge: '',
    };
    const patterns = detectPatterns(answers);
    // All pattern scores should be low
    const maxScore = Math.max(...Object.values(patterns.patternScores));
    expect('all pattern scores < 50 (low intensity)', maxScore < 50);
    expect('safetyGated = false', patterns.safetyGated === false);
    expect('no secondary patterns', patterns.secondaryPatterns.length === 0);
    console.log('  Max pattern score:', maxScore);
    console.log('  Primary:', patterns.primaryPattern);
}

/* ══════════════════════════════════════════════════════════
   CONFIDENCE CALIBRATION
   ══════════════════════════════════════════════════════════ */
function scenarioConf_WithTrackerData(): void {
    console.log('\n── Confidence: With Tracker Data ──');
    const nullContras = { hasContradictions: false, notes: [], confidenceImpact: 0 };
    const confNoData = computeConfidence(7, 25, 0, nullContras);
    const confWith5  = computeConfidence(7, 25, 5, nullContras);
    const confWith25 = computeConfidence(25, 25, 10, nullContras);

    expect('quick (7q, 0 logs) = low', confNoData.label === 'low');
    expect('quick (7q, 5 logs) confidence rises', confWith5.score > confNoData.score);
    expect('deep (25q, 10 logs) = high', confWith25.label === 'high');
    console.log('  7q/0logs:', confNoData.score, confNoData.label);
    console.log('  7q/5logs:', confWith5.score, confWith5.label);
    console.log('  25q/10logs:', confWith25.score, confWith25.label);
}

/* ══════════════════════════════════════════════════════════
   RUN ALL SCENARIOS
   ══════════════════════════════════════════════════════════ */
export function runGoldenScenarios(): void {
    console.log('═══════════════════════════════════════════════');
    console.log('  TAYYIBAT INTEGRATION — GOLDEN SCENARIOS');
    console.log('═══════════════════════════════════════════════');
    scenario1_FatigueSugarDependency();
    scenario2_DigestiveBurden();
    scenario3_RedFlagsOverride();
    scenario4_RhythmDisruption();
    scenario5_ContradictionDetected();
    scenario6_NoFoodSignals();
    scenarioConf_WithTrackerData();
    console.log('\n═══════════════════════════════════════════════');
    console.log('  Done. Fix any ❌ lines above before deploying.');
    console.log('═══════════════════════════════════════════════\n');
}

// Uncomment to run in browser console or Node:
// runGoldenScenarios();
