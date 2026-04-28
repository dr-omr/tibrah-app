// lib/tayyibat/__tests__/verify-nutrition-protocols.ts
// ════════════════════════════════════════════════════════════
// npm run verify:nutrition-protocols
// Checks all active dietary protocols comply with Tayyibat policy
// ════════════════════════════════════════════════════════════

import {
    TAYYIBAT_FORBIDDEN_GROUPS,
    TAYYIBAT_ALLOWED_GROUPS,
    TAYYIBAT_ATTRIBUTION_COPY,
    TAYYIBAT_SAFETY_RULES,
    TAYYIBAT_PROTOCOL_MODES,
    TAYYIBAT_PROTOCOL_COPY,
    resolveProtocolMode,
    isTayyibatForbidden,
    getTayyibatReplacement,
} from '../tayyibat-nutrition-policy';

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean, detail?: string): void {
    if (condition) {
        console.log(`  ✅ ${label}`);
        passed++;
    } else {
        console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`);
        failed++;
    }
}

function section(title: string): void {
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`  ${title}`);
    console.log('═'.repeat(50));
}

// ── 1. Central Policy Structure ───────────────────────────
section('1: Central Policy Structure');

check('TAYYIBAT_FORBIDDEN_GROUPS is non-empty', TAYYIBAT_FORBIDDEN_GROUPS.length > 0);
check('TAYYIBAT_ALLOWED_GROUPS is non-empty', TAYYIBAT_ALLOWED_GROUPS.length > 0);
check('Attribution short text exists', typeof TAYYIBAT_ATTRIBUTION_COPY.short === 'string' && TAYYIBAT_ATTRIBUTION_COPY.short.length > 5);
check('Attribution full text exists', TAYYIBAT_ATTRIBUTION_COPY.full.includes('د. ضياء العوضي'));
check('Attribution includes disclaimer', TAYYIBAT_ATTRIBUTION_COPY.disclaimer.length > 10);
check('Safety rules defined', TAYYIBAT_SAFETY_RULES.length >= 5);
check('Protocol modes defined', Object.keys(TAYYIBAT_PROTOCOL_MODES).length === 4);
check('Protocol copy defined', Object.keys(TAYYIBAT_PROTOCOL_COPY).length >= 6);

// ── 2. Safety Rules Override ──────────────────────────────
section('2: Safety Rules Override (Red Flags)');

const diabeticMode = resolveProtocolMode('knows_applies', ['diabetes_on_medication']);
check('Diabetic on medication → medical_review_first', diabeticMode === 'medical_review_first',
    `got: ${diabeticMode}`);

const pregnancyMode = resolveProtocolMode('knows_applies', ['pregnancy']);
check('Pregnancy → medical_review_first', pregnancyMode === 'medical_review_first',
    `got: ${pregnancyMode}`);

const kidneyMode = resolveProtocolMode('knows_partial', ['kidney_disease']);
check('Kidney disease → medical_review_first', kidneyMode === 'medical_review_first',
    `got: ${kidneyMode}`);

const cancerMode = resolveProtocolMode('knows_applies', ['cancer']);
check('Cancer → medical_review_first', cancerMode === 'medical_review_first',
    `got: ${cancerMode}`);

// ── 3. Knowledge Level → Protocol Mode ───────────────────
section('3: Knowledge Level → Protocol Mode');

const strictMode = resolveProtocolMode('knows_applies', []);
check('knows_applies + no safety → strict', strictMode === 'strict', `got: ${strictMode}`);

const guidedMode = resolveProtocolMode('knows_partial', []);
check('knows_partial → guided_entry', guidedMode === 'guided_entry', `got: ${guidedMode}`);

const notApplyMode = resolveProtocolMode('knows_not_apply', []);
check('knows_not_apply → guided_entry', notApplyMode === 'guided_entry', `got: ${notApplyMode}`);

const dontKnowMode = resolveProtocolMode('dont_know', []);
check("dont_know → educational_only (NO SCORE)", dontKnowMode === 'educational_only',
    `got: ${dontKnowMode}`);

// ── 4. dont_know Must Never Show Score ───────────────────
section('4: dont_know — No Score, No Strict Protocol');

const dontKnowConfig = TAYYIBAT_PROTOCOL_MODES['educational_only'];
check('educational_only: showScore = false', dontKnowConfig.showScore === false);
check('educational_only: showStrictProtocol = false', dontKnowConfig.showStrictProtocol === false);
check('educational_only: showAdherenceRing = false', dontKnowConfig.showAdherenceRing === false);
check('educational_only: CTA is educational (not strict)', dontKnowConfig.ctaLabel.includes('تعرّف'));

// ── 5. Forbidden Item Detection ────────────────────────────
section('5: Forbidden Item Detection');

const legumesResult = isTayyibatForbidden('legumes_all');
check('legumes_all detected as forbidden', legumesResult !== null && legumesResult.forbidden === true);
check('legumes_all has reason', !!legumesResult?.reason);

const freshDairyResult = isTayyibatForbidden('fresh_dairy');
check('fresh_dairy detected as forbidden', freshDairyResult !== null && freshDairyResult.forbidden === true);

const whiteFlourResult = isTayyibatForbidden('white_flour_all');
check('white_flour_all detected as forbidden', whiteFlourResult !== null && whiteFlourResult.forbidden === true);

const lambResult = isTayyibatForbidden('lamb_meat');
check('lamb_meat NOT detected as forbidden (it is allowed)', lambResult === null);

// ── 6. Replacement Suggestions ────────────────────────────
section('6: Replacement Suggestions for Conflicts');

const legumeReplacement = getTayyibatReplacement('legumes_all');
check('legumes_all has replacement', legumeReplacement !== null);

const dairyReplacement = getTayyibatReplacement('fresh_dairy');
check('fresh_dairy has replacement', dairyReplacement !== null);

const flourReplacement = getTayyibatReplacement('white_flour_all');
check('white_flour_all has replacement', flourReplacement !== null);

// ── 7. Protocol Copy Templates ────────────────────────────
section('7: Protocol Copy Templates');

check('digestive_burden has title', TAYYIBAT_PROTOCOL_COPY.digestive_burden.title.length > 0);
check('sugar_dependency has firstStep', TAYYIBAT_PROTOCOL_COPY.sugar_dependency.firstStep.length > 0);
check('rhythm_disruption links to tayyibat', TAYYIBAT_PROTOCOL_COPY.rhythm_disruption.link.includes('tayyibat'));
check('medical_review_first links to book-appointment', TAYYIBAT_PROTOCOL_COPY.medical_review_first.link.includes('book-appointment'));
check('low_readiness uses gradual language', TAYYIBAT_PROTOCOL_COPY.low_readiness.brief.includes('خطوة'));
check('inflammatory_load uses cautious language', TAYYIBAT_PROTOCOL_COPY.inflammatory_load.brief.includes('راقب'));

// ── 8. No Medication Stop Language ────────────────────────
section('8: Safety Language — No Medication Claims');

const allCopyTexts = Object.values(TAYYIBAT_PROTOCOL_COPY)
    .map(p => `${p.title} ${p.brief} ${p.firstStep}`)
    .join(' ');

check('No "أوقف الدواء" in protocol copy', !allCopyTexts.includes('أوقف الدواء'));
check('No "دون دواء" claim in copy', !allCopyTexts.includes('دون الحاجة للدواء'));
check('No "علاج كامل" claim in copy', !allCopyTexts.includes('علاج كامل'));
check('Attribution includes disclaimer about medications', TAYYIBAT_ATTRIBUTION_COPY.disclaimer.includes('لا يُغني عن الاستشارة الطبية'));

// ── SUMMARY ───────────────────────────────────────────────
console.log(`\n${'═'.repeat(50)}`);
console.log(`  NUTRITION POLICY VERIFICATION`);
console.log('═'.repeat(50));
console.log(`  PASSED: ${passed}`);
console.log(`  FAILED: ${failed}`);
console.log(`  TOTAL:  ${passed + failed}`);
console.log('═'.repeat(50));

if (failed > 0) {
    console.log('\n⚠️  Some checks failed. Review the central policy file.');
    process.exit(1);
} else {
    console.log('\n✅ All nutrition protocol checks passed!');
    console.log('\n📌 Remaining manual checks:');
    console.log('   A. Open /tayyibat/assessment → select "لا أعرفه" → confirm no score appears');
    console.log('   B. Open any protocol page → confirm attribution appears');
    console.log('   C. Red flag user → confirm "احجز استشارة" shows before diet protocol');
}
