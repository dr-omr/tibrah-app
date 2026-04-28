// lib/tayyibat/__tests__/tayyibat-integration.test.ts
// npm run test:tayyibat
// ══════════════════════════════════════════════════════════════
// السيناريوهات الذهبية — Jest v2 (سيناريوهات 1-10)
// ══════════════════════════════════════════════════════════════

import { detectPatterns, computeConfidence, detectContradictions, PATTERN_DESCRIPTIONS }
    from '../pattern-engine';
import type { TayyibatAnswers } from '../tayyibat-scoring-engine';
import { detectFoodSignalsInAnswers, hasFoodRelevantSignals } from '../../clinical/tayyibat-adaptive-screening';

// ── Helper ──
const baseAnswers = (): TayyibatAnswers => ({
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

/* ══════════════════════════════════════════════════════════════
   SCENARIO 1: إرهاق + رغبة سكر = sugar_dependency
   ══════════════════════════════════════════════════════════════ */
describe('Scenario 1 — Fatigue + Sugar Cravings → sugar_dependency', () => {
    const a: TayyibatAnswers = {
        ...baseAnswers(),
        sugarLevel: 'daily', postMealCrash: 'often', sugarCraving: 'strong', afternoonSlump: 'often',
    };
    const result = detectPatterns(a);

    test('primaryPattern = sugar_dependency', () => {
        expect(result.primaryPattern).toBe('sugar_dependency');
    });
    test('safetyGated = false', () => {
        expect(result.safetyGated).toBe(false);
    });
    test('sugar_dependency score >= 60', () => {
        expect(result.patternScores.sugar_dependency).toBeGreaterThanOrEqual(60);
    });
    test('medicalReviewLevel = none', () => {
        expect(result.medicalReviewLevel).toBe('none');
    });
});

/* ══════════════════════════════════════════════════════════════
   SCENARIO 2: انتفاخ + غازات + حموضة = digestive_burden
   ══════════════════════════════════════════════════════════════ */
describe('Scenario 2 — Digestive Burden', () => {
    const a: TayyibatAnswers = {
        ...baseAnswers(),
        bloatingFreq: 'often', gasFreq: 'often', constipation: 'sometimes', acidReflux: 'often',
    };
    const result = detectPatterns(a);

    test('primaryPattern = digestive_burden', () => {
        expect(result.primaryPattern).toBe('digestive_burden');
    });
    test('safetyGated = false', () => {
        expect(result.safetyGated).toBe(false);
    });
    test('medicalReviewLevel = none', () => {
        expect(result.medicalReviewLevel).toBe('none');
    });
});

/* ══════════════════════════════════════════════════════════════
   SCENARIO 3a: ألم مفاصل شديد وحده → recommended فقط (لا gating)
   ══════════════════════════════════════════════════════════════ */
describe('Scenario 3a — Chronic Joint Pain Alone: recommended, NOT safety-gated', () => {
    const a: TayyibatAnswers = {
        ...baseAnswers(),
        jointPain: 'severe',
        headacheFreq: 'rarely',
        sleepQuality: 'good',
        skinIssues: 'none',
        explicitRedFlagDetected: false,
    };
    const result = detectPatterns(a);

    test('safetyGated = false — chronic pain alone is NOT a red flag', () => {
        expect(result.safetyGated).toBe(false);
    });
    test('medicalReviewLevel = recommended (not required_first)', () => {
        expect(result.medicalReviewLevel).toBe('recommended');
    });
    test('primaryPattern !== medical_review_first', () => {
        expect(result.primaryPattern).not.toBe('medical_review_first');
    });
    test('nutrition guidance is NOT blocked', () => {
        expect(result.routeToProtocol).not.toBeNull();
    });
});

/* ══════════════════════════════════════════════════════════════
   SCENARIO 3b: multi-system symptoms (still NOT required_first without explicit flag)
   ══════════════════════════════════════════════════════════════ */
describe('Scenario 3b — Multi-System Chronic Symptoms WITHOUT explicit red flag', () => {
    const a: TayyibatAnswers = {
        ...baseAnswers(),
        jointPain: 'severe',
        headacheFreq: 'daily',
        sleepQuality: 'poor',
        skinIssues: 'severe',
        explicitRedFlagDetected: false, // ← no safety questions triggered
    };
    const result = detectPatterns(a);

    test('safetyGated = false — no explicit red flag set', () => {
        expect(result.safetyGated).toBe(false);
    });
    test('medicalReviewLevel = recommended (chronic, not emergency)', () => {
        expect(result.medicalReviewLevel).toBe('recommended');
    });
    test('primaryPattern !== medical_review_first', () => {
        expect(result.primaryPattern).not.toBe('medical_review_first');
    });
});

/* ══════════════════════════════════════════════════════════════
   SCENARIO 3c: Explicit red flag detected (chest pain / urgent triage)
   ══════════════════════════════════════════════════════════════ */
describe('Scenario 3c — Explicit Red Flag → safety-gated', () => {
    const a: TayyibatAnswers = {
        ...baseAnswers(),
        explicitRedFlagDetected: true, // ← set by bridge from safety questions or urgent triage
    };
    const result = detectPatterns(a);

    test('safetyGated = true', () => {
        expect(result.safetyGated).toBe(true);
    });
    test('medicalReviewLevel = required_first', () => {
        expect(result.medicalReviewLevel).toBe('required_first');
    });
    test('primaryPattern = medical_review_first', () => {
        expect(result.primaryPattern).toBe('medical_review_first');
    });
    test('secondaryPatterns empty when gated', () => {
        expect(result.secondaryPatterns).toHaveLength(0);
    });
    test('routeToProtocol = null when gated', () => {
        expect(result.routeToProtocol).toBeNull();
    });
    test('medicalReviewReason not null', () => {
        expect(result.medicalReviewReason).not.toBeNull();
    });
});

/* ══════════════════════════════════════════════════════════════
   SCENARIO 4: نوم سيئ + وجبات عشوائية = rhythm_disruption
   ══════════════════════════════════════════════════════════════ */
describe('Scenario 4 — Rhythm Disruption', () => {
    const a: TayyibatAnswers = {
        ...baseAnswers(),
        mealTiming: 'random',
        sleepQuality: 'poor',
        morningFatigue: 'often',
    };
    const result = detectPatterns(a);

    test('rhythm_disruption score >= 50', () => {
        expect(result.patternScores.rhythm_disruption).toBeGreaterThanOrEqual(50);
    });
    test('safetyGated = false', () => {
        expect(result.safetyGated).toBe(false);
    });
});

/* ══════════════════════════════════════════════════════════════
   SCENARIO 5: تناقض = الالتزام الكامل + سكر يومي
   ══════════════════════════════════════════════════════════════ */
describe('Scenario 5 — Contradiction Detection', () => {
    const a: TayyibatAnswers = {
        ...baseAnswers(),
        sugarLevel: 'daily',
        currentLevel: 'full',
        knowledgeLevel: 'expert',
    };
    const contras = detectContradictions(a, []);

    test('contradiction detected', () => {
        expect(contras.hasContradictions).toBe(true);
    });
    test('confidenceImpact < 0', () => {
        expect(contras.confidenceImpact).toBeLessThan(0);
    });
    test('notes non-empty', () => {
        expect(contras.notes.length).toBeGreaterThan(0);
    });
    test('confidence label not high when contradiction present', () => {
        const conf = computeConfidence(22, 25, 0, contras);
        expect(conf.label).not.toBe('high');
    });
});

/* ══════════════════════════════════════════════════════════════
   SCENARIO 6: لا أعراض = نمط منخفض
   ══════════════════════════════════════════════════════════════ */
describe('Scenario 6 — No Food Signals (minimal)', () => {
    const a = baseAnswers();
    const result = detectPatterns(a);

    test('all pattern scores < 50', () => {
        const maxScore = Math.max(...Object.values(result.patternScores));
        expect(maxScore).toBeLessThan(50);
    });
    test('safetyGated = false', () => {
        expect(result.safetyGated).toBe(false);
    });
    test('medicalReviewLevel = none', () => {
        expect(result.medicalReviewLevel).toBe('none');
    });
});

/* ══════════════════════════════════════════════════════════════
   SCENARIO 7: ألم مفاصل + صداع يومي + نوم سيئ → recommended ONLY
   Expected: medicalReviewLevel=recommended, safetyGated=false, nutrition visible
   ══════════════════════════════════════════════════════════════ */
describe('Scenario 7 — Severe Joint + Daily Headache + Poor Sleep: recommended NOT required', () => {
    const a: TayyibatAnswers = {
        ...baseAnswers(),
        jointPain: 'severe',
        headacheFreq: 'daily',
        sleepQuality: 'poor',
        explicitRedFlagDetected: false, // no fever, no neuro signs, no blood, no weight loss
    };
    const result = detectPatterns(a);

    test('medicalReviewLevel = recommended (not required_first)', () => {
        expect(result.medicalReviewLevel).toBe('recommended');
    });
    test('safetyGated = false — nutrition guidance remains visible', () => {
        expect(result.safetyGated).toBe(false);
    });
    test('primaryPattern is NOT medical_review_first', () => {
        expect(result.primaryPattern).not.toBe('medical_review_first');
    });
    test('routeToProtocol is not null — nutrition guidance available', () => {
        expect(result.routeToProtocol).not.toBeNull();
    });
});

/* ══════════════════════════════════════════════════════════════
   SCENARIO 8: anxiety + caffeine + poor sleep + sugar cravings
   Expected: Tayyibat screening appears, rhythm or sugar pattern
   ══════════════════════════════════════════════════════════════ */
describe('Scenario 8 — Anxiety Pathway with Food Signals', () => {
    const a: TayyibatAnswers = {
        ...baseAnswers(),
        sugarLevel: 'daily',
        sugarCraving: 'strong',
        sleepQuality: 'poor',
        mealTiming: 'random',
        afternoonSlump: 'often',
    };
    const result = detectPatterns(a);

    // Signal-based screening check
    const answers = {
        symptoms: 'قلق وتوتر وشرب قهوة كثير وسكر',
        sleep: 'نوم سيئ',
    };
    const hasSignals = detectFoodSignalsInAnswers(answers);
    const showFoodQs = hasFoodRelevantSignals('anxiety', 7, answers);

    test('food signals detected in anxiety answers', () => {
        expect(hasSignals).toBe(true);
    });
    test('Tayyibat questions appear for anxiety + food signals', () => {
        expect(showFoodQs).toBe(true);
    });
    test('primaryPattern is sugar or rhythm (not blocked)', () => {
        expect(['sugar_dependency', 'rhythm_disruption', 'low_readiness']).toContain(result.primaryPattern);
    });
    test('safetyGated = false', () => {
        expect(result.safetyGated).toBe(false);
    });
});

/* ══════════════════════════════════════════════════════════════
   SCENARIO 9: back pain + bloating + constipation
   Expected: Tayyibat screening appears, digestive insight as secondary
   ══════════════════════════════════════════════════════════════ */
describe('Scenario 9 — Back Pain with Digestive Signals', () => {
    const a: TayyibatAnswers = {
        ...baseAnswers(),
        bloatingFreq: 'often',
        constipation: 'often',
        gasFreq: 'sometimes',
    };
    const result = detectPatterns(a);

    const clinicalAnswers = {
        symptoms: 'ألم ظهر وانتفاخ',
        bowel: 'إمساك متكرر',
    };
    const showFoodQs = hasFoodRelevantSignals('back', 5, clinicalAnswers);

    test('Tayyibat questions appear for back pain + bloating signals', () => {
        expect(showFoodQs).toBe(true);
    });
    test('digestive_burden in top patterns', () => {
        const topPatterns = [result.primaryPattern, ...result.secondaryPatterns];
        expect(topPatterns).toContain('digestive_burden');
    });
    test('safetyGated = false', () => {
        expect(result.safetyGated).toBe(false);
    });
});

/* ══════════════════════════════════════════════════════════════
   SCENARIO 10: chest pain (explicit red flag) + bad diet
   Expected: required_first, safetyGated=true, nutrition not primary
   ══════════════════════════════════════════════════════════════ */
describe('Scenario 10 — Chest Pain (Explicit Red Flag) + Poor Diet', () => {
    const a: TayyibatAnswers = {
        ...baseAnswers(),
        processedFood: 'daily',
        oilType: 'seed_oils',
        sugarLevel: 'daily',
        explicitRedFlagDetected: true, // ← chest pain / urgent triage
    };
    const result = detectPatterns(a);

    test('safetyGated = true', () => {
        expect(result.safetyGated).toBe(true);
    });
    test('medicalReviewLevel = required_first', () => {
        expect(result.medicalReviewLevel).toBe('required_first');
    });
    test('primaryPattern = medical_review_first', () => {
        expect(result.primaryPattern).toBe('medical_review_first');
    });
    test('secondaryPatterns empty when gated', () => {
        expect(result.secondaryPatterns).toHaveLength(0);
    });
    test('routeToProtocol = null — nutrition is NOT primary', () => {
        expect(result.routeToProtocol).toBeNull();
    });
});

/* ══════════════════════════════════════════════════════════════
   CONFIDENCE CALIBRATION TABLE
   ══════════════════════════════════════════════════════════════ */
describe('Confidence Calibration', () => {
    test('0-4 meal logs: no tracker bonus', () => {
        const conf4 = computeConfidence(7, 7, 4, nullContras);
        const conf0 = computeConfidence(7, 7, 0, nullContras);
        expect(conf4.score).toBe(conf0.score);
    });

    test('5 meal logs: small bonus applied', () => {
        const conf5 = computeConfidence(7, 7, 5, nullContras);
        const conf0 = computeConfidence(7, 7, 0, nullContras);
        expect(conf5.score).toBeGreaterThan(conf0.score);
    });

    test('14 meal logs > 5 meal logs bonus', () => {
        const conf14 = computeConfidence(7, 7, 14, nullContras);
        const conf5  = computeConfidence(7, 7, 5,  nullContras);
        expect(conf14.score).toBeGreaterThan(conf5.score);
    });

    test('21 meal logs > 14 meal logs bonus', () => {
        const conf21 = computeConfidence(7, 7, 21, nullContras);
        const conf14 = computeConfidence(7, 7, 14, nullContras);
        expect(conf21.score).toBeGreaterThan(conf14.score);
    });

    test('full assessment (25q) + 21 logs = high confidence', () => {
        const confDeep = computeConfidence(25, 25, 21, nullContras);
        expect(confDeep.label).toBe('high');
    });

    test('quick assessment (7q) + 0 logs = low confidence', () => {
        const confQuick = computeConfidence(7, 25, 0, nullContras);
        expect(confQuick.label).toBe('low');
    });

    test('5 logs alone does NOT give high confidence', () => {
        const conf5Only = computeConfidence(3, 7, 5, nullContras);
        expect(conf5Only.label).not.toBe('high');
    });

    test('explanation mentions meal count when < 5', () => {
        const conf = computeConfidence(5, 7, 2, nullContras);
        expect(conf.explanation).toContain('وجبات');
    });
});

/* ══════════════════════════════════════════════════════════════
   ADAPTIVE SCREENING — SIGNAL-BASED GATING
   ══════════════════════════════════════════════════════════════ */
describe('Adaptive Screening — Signal-Based Gating', () => {
    test('dental pathway → no food questions regardless of signals', () => {
        const show = hasFoodRelevantSignals('dental', 5, { symptoms: 'انتفاخ وغازات' });
        expect(show).toBe(false);
    });

    test('vision pathway → no food questions', () => {
        const show = hasFoodRelevantSignals('vision', 5, { symptoms: 'تعب' });
        expect(show).toBe(false);
    });

    test('anxiety WITHOUT food signals → no food questions', () => {
        const show = hasFoodRelevantSignals('anxiety', 5, { symptoms: 'خوف وقلق فقط' });
        expect(show).toBe(false);
    });

    test('anxiety WITH caffeine signal → show food questions', () => {
        const show = hasFoodRelevantSignals('anxiety', 5, { symptoms: 'قلق وقهوة زيادة' });
        expect(show).toBe(true);
    });

    test('back pain WITH bloating signal → show food questions', () => {
        const show = hasFoodRelevantSignals('back', 5, { symptoms: 'ألم ظهر وانتفاخ' });
        expect(show).toBe(true);
    });

    test('severity >= 9 → never show food questions', () => {
        const show = hasFoodRelevantSignals('digestion', 9, { symptoms: 'انتفاخ شديد' });
        expect(show).toBe(false);
    });

    test('fatigue pathway → always show food questions (inherently food-related)', () => {
        const show = hasFoodRelevantSignals('fatigue', 5, {});
        expect(show).toBe(true);
    });
});

/* ══════════════════════════════════════════════════════════════
   PATTERN DESCRIPTIONS COMPLETENESS
   ══════════════════════════════════════════════════════════════ */
describe('Pattern Descriptions Completeness', () => {
    const patterns = [
        'digestive_burden', 'sugar_dependency', 'inflammatory_load',
        'rhythm_disruption', 'low_readiness', 'medical_review_first',
    ] as const;

    patterns.forEach(p => {
        test(`${p} has label, icon, summary, primaryRecommendation`, () => {
            const d = PATTERN_DESCRIPTIONS[p];
            expect(d.label).toBeTruthy();
            expect(d.icon).toBeTruthy();
            expect(d.summary).toBeTruthy();
            expect(d.primaryRecommendation).toBeTruthy();
        });
    });
});
