// lib/clinical-engine/bayesian-differential.ts — MODULE A (Orchestrator)
// Uses split hypothesis banks: metabolic + hormonal
import type { EngineAnswers } from '@/components/health-engine/types';
import type { DifferentialHypothesis } from './types';
import { flattenAnswersToText, computeOddsFromPrior, oddsToProb, clampConfidence } from './types';
import type { Hyp } from './bayesian-hypotheses-metabolic';
import { METABOLIC_HYPOTHESES } from './bayesian-hypotheses-metabolic';
import { HORMONAL_HYPOTHESES } from './bayesian-hypotheses-hormonal';

// All hypotheses combined
const ALL_HYPOTHESES: Hyp[] = [...METABOLIC_HYPOTHESES, ...HORMONAL_HYPOTHESES];

// Comorbidity boost pairs: [idA, idB, multiplier]
const COMORBIDITY: Array<[string, string, number]> = [
    ['iron_deficiency', 'thyroid_hypo', 1.3],
    ['iron_deficiency', 'b12_deficiency', 1.4],
    ['vitamin_d', 'iron_deficiency', 1.2],
    ['cortisol_dys', 'insulin_resistance', 1.5],
    ['thyroid_hypo', 'vitamin_d', 1.3],
    ['food_sensitivity', 'magnesium_def', 1.2],
    ['insulin_resistance', 'food_sensitivity', 1.3],
    ['pcos', 'insulin_resistance', 1.6],
    ['pcos', 'thyroid_hypo', 1.4],
    ['estrogen_dom', 'cortisol_dys', 1.3],
    ['adrenal_fatigue', 'cortisol_dys', 1.5],
    ['testosterone_low', 'insulin_resistance', 1.3],
];

/**
 * Applies likelihood ratios to update odds for one hypothesis.
 */
function applyLikelihoodRatios(
    h: Hyp, text: string,
): { odds: number; sup: string[]; con: string[] } {
    let odds = computeOddsFromPrior(h.basePrior);
    const sup: string[] = [];
    const con: string[] = [];

    for (const p of h.pos) {
        if (text.includes(p.s)) { odds *= p.lr; sup.push(p.s); }
    }
    for (const n of h.neg) {
        if (text.includes(n.s)) { odds *= n.lr; con.push(n.s); }
    }
    return { odds, sup, con };
}

/**
 * Applies severity and duration boosts to odds.
 */
function applyClinicalBoosts(odds: number, answers: EngineAnswers): number {
    if (answers.severity >= 8) odds *= 1.4;
    else if (answers.severity >= 7) odds *= 1.3;
    else if (answers.severity >= 5) odds *= 1.1;

    if (answers.duration === 'years') odds *= 1.5;
    else if (answers.duration === 'months') odds *= 1.4;
    else if (answers.duration === 'weeks') odds *= 1.2;

    return odds;
}

/**
 * Checks if red flags are present and boosts accordingly.
 */
function applyRedFlagBoost(odds: number, h: Hyp, text: string): number {
    const activeFlags = h.redFlags.filter(rf => text.includes(rf));
    if (activeFlags.length > 0) odds *= (1 + activeFlags.length * 0.25);
    return odds;
}

/**
 * Main Bayesian Differential Diagnosis function.
 * Processes all hypotheses and returns ranked results.
 */
export function runBayesianDifferential(answers: EngineAnswers): DifferentialHypothesis[] {
    const text = flattenAnswersToText(answers).toLowerCase();
    const results: DifferentialHypothesis[] = [];

    for (const h of ALL_HYPOTHESES) {
        if (!h.pw.includes(answers.pathwayId)) continue;

        let { odds, sup, con } = applyLikelihoodRatios(h, text);
        odds = applyClinicalBoosts(odds, answers);
        odds = applyRedFlagBoost(odds, h, text);

        // Emotional context boost for stress-related hypotheses
        const stressHyps = ['cortisol_dys', 'adrenal_fatigue', 'estrogen_dom'];
        if (stressHyps.includes(h.id)) {
            const hasStress = answers.emotionalContext?.some(e =>
                ['work_stress', 'burnout', 'trauma'].includes(e));
            if (hasStress) odds *= 1.3;
        }

        const posterior = Math.round(oddsToProb(odds) * 100);

        if (posterior >= 15 || sup.length >= 2) {
            results.push({
                id: h.id, nameAr: h.nameAr, nameEn: h.nameEn,
                posteriorProbability: clampConfidence(posterior),
                supportingEvidence: sup,
                contradictingEvidence: con,
                nextBestTest: h.test,
                clinicalPearl: h.pearl,
            });
        }
    }

    // Apply comorbidity boosts
    for (const [a, b, boost] of COMORBIDITY) {
        const rA = results.find(r => r.id === a);
        const rB = results.find(r => r.id === b);
        if (rA && rB) {
            rA.posteriorProbability = clampConfidence(Math.round(rA.posteriorProbability * boost));
            rB.posteriorProbability = clampConfidence(Math.round(rB.posteriorProbability * boost));
        }
    }

    return results
        .sort((a, b) => b.posteriorProbability - a.posteriorProbability)
        .slice(0, 6);
}

/**
 * Returns only hypotheses above a given probability threshold.
 */
export function getHighProbabilityDx(
    answers: EngineAnswers,
    threshold = 50,
): DifferentialHypothesis[] {
    return runBayesianDifferential(answers).filter(
        d => d.posteriorProbability >= threshold,
    );
}

/**
 * Returns the single most likely diagnosis.
 */
export function getTopDiagnosis(answers: EngineAnswers): DifferentialHypothesis | null {
    return runBayesianDifferential(answers)[0] ?? null;
}

/**
 * Returns hypotheses that have red flags present in the clinical text.
 * Used for escalation detection.
 */
export function detectRedFlagHypotheses(answers: EngineAnswers): string[] {
    const text = flattenAnswersToText(answers).toLowerCase();
    const flags: string[] = [];
    for (const h of ALL_HYPOTHESES) {
        const active = h.redFlags.filter(rf => text.includes(rf));
        if (active.length > 0) flags.push(`${h.nameAr}: ${active.join('، ')}`);
    }
    return flags;
}
