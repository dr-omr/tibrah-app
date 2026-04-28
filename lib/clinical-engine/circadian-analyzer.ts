// lib/clinical-engine/circadian-analyzer.ts — MODULE C (Orchestrator)
import type { EngineAnswers } from '@/components/health-engine/types';
import type { CircadianInsight } from './types';
import { detectMorningDisruptions } from './circadian-rules-morning';
import { detectNightDisruptions } from './circadian-rules-night';

export function analyzeCircadianDisruption(answers: EngineAnswers): CircadianInsight[] {
    const morning = detectMorningDisruptions(answers);
    const night = detectNightDisruptions(answers);
    return [...morning, ...night].sort((a, b) => b.confidence - a.confidence);
}

export function getMostCriticalCircadian(answers: EngineAnswers): CircadianInsight | null {
    return analyzeCircadianDisruption(answers)[0] ?? null;
}

export function hasNocturnalDisruption(answers: EngineAnswers): boolean {
    return detectNightDisruptions(answers).length > 0;
}
