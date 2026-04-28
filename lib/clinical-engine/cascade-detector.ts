// lib/clinical-engine/cascade-detector.ts — MODULE B (Orchestrator)
// Combines neuro + metabolic cascade chains into one ranked result
import type { EngineAnswers } from '@/components/health-engine/types';
import type { CascadeChain } from './types';
import { detectNeuroCascades } from './cascade-chains-neuro';
import { detectMetabolicCascades } from './cascade-chains-metabolic';

/**
 * Detects all active cascade chains from both neuro and metabolic banks.
 * Returns top 4 sorted by confidence.
 */
export function detectCascadeChains(answers: EngineAnswers): CascadeChain[] {
    const neuro = detectNeuroCascades(answers);
    const metabolic = detectMetabolicCascades(answers);

    return [...neuro, ...metabolic]
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 4);
}

/**
 * Returns the single most critical cascade (highest confidence).
 */
export function getPrimaryCascade(answers: EngineAnswers): CascadeChain | null {
    return detectCascadeChains(answers)[0] ?? null;
}

/**
 * Returns cascades above a confidence threshold.
 */
export function getHighConfidenceCascades(
    answers: EngineAnswers,
    threshold = 60,
): CascadeChain[] {
    return detectCascadeChains(answers).filter(c => c.confidence >= threshold);
}
