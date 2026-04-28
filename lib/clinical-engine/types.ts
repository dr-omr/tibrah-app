// lib/clinical-engine/types.ts — Shared Types, Interfaces & Utilities
// ════════════════════════════════════════════════════════════════════
// Central type definitions and reusable utility functions for all
// clinical engine modules. Single source of truth for the engine.
// ════════════════════════════════════════════════════════════════════
import type { EngineAnswers } from '@/components/health-engine/types';

/* ══════════════════════════════════════════════════════════
   CORE RESULT INTERFACES
   ══════════════════════════════════════════════════════════ */

export interface SymptomTimeline {
    duration: 'acute' | 'subacute' | 'chronic';
    durationText: string;
    progression: 'stable' | 'worsening' | 'fluctuating' | 'improving';
    timeOfDayPattern: string | null;
    dailyFluctuation: string | null;
    estimatedDaysSinceOnset: number;
    durationConfidence: 'self_reported' | 'inferred';
}

export interface RecurrenceAssessment {
    isRecurrent: boolean;
    pattern: string;
    treatmentImplication: string;
    estimatedEpisodes: number;
    periodicity: string | null;
}

export interface TriggerRelief {
    triggers: string[];
    relievers: string[];
    summary: string;
    dominantTrigger: string | null;
    triggerBurden: number; // 0–10 score
}

export interface FunctionalImpact {
    level: 'minimal' | 'moderate' | 'significant' | 'severe';
    description: string;
    affectedDomains: string[];
    estimatedDaysAffected: number;
    adlImpairment: boolean; // Activities of Daily Living
}

export interface FoodSymptomSignal {
    signal: string;
    strength: 'strong' | 'moderate' | 'weak';
    action: string;
    mechanism: string;
}

export interface ReassessmentTrigger {
    condition: string;
    when: string;
    why: string;
}

export interface ResultAction {
    type: 'start_today' | 'stop_today' | 'monitor_3_days' | 'reassess_when' | 'next_tool';
    text: string;
    priority: 'high' | 'medium' | 'low';
    rationale: string;
}

export interface SymptomCluster {
    id: string;
    name: string;
    significance: string;
    matchedSignals: string[];
    confidence: number; // 0–100
}

/* ══════════════════════════════════════════════════════════
   ADVANCED MODULE TYPES
   ══════════════════════════════════════════════════════════ */

export interface DifferentialHypothesis {
    id: string;
    nameAr: string;
    nameEn: string;
    posteriorProbability: number; // 0–95 (capped for epistemic humility)
    supportingEvidence: string[];
    contradictingEvidence: string[];
    nextBestTest: string;
    clinicalPearl: string;
}

export interface CascadeChain {
    id: string;
    nameAr: string;
    chain: string[]; // Ordered steps in the cascade
    rootCause: string;
    breakpoint: string; // Where to intervene
    confidence: number; // 0–95
}

export interface CircadianInsight {
    disruption: string;
    hormonalAxis: string;
    timePattern: string;
    correction: string;
    confidence: number; // 0–95
}

export interface EvidenceGrade {
    recommendation: string;
    grade: 'A' | 'B' | 'C' | 'D';
    gradeLabel: string;
    evidenceBasis: string;
    sourceType: string;
    confidenceStatement: string;
}

export interface SupplementRecommendation {
    name: string;
    dose: string;
    timing: string;
    duration: string;
    evidenceGrade: 'A' | 'B' | 'C';
    rationale: string;
    contraindications: string[];
    interactions: string[];
    tayyibatNote: string;
}

/* ══════════════════════════════════════════════════════════
   MASTER RESULT TYPE
   ══════════════════════════════════════════════════════════ */

export interface ClinicalPrecisionResult {
    // Core analysis
    timeline: SymptomTimeline;
    recurrence: RecurrenceAssessment;
    triggerMap: TriggerRelief;
    functionalImpact: FunctionalImpact;
    foodSymptomSignals: FoodSymptomSignal[];
    isChronic: boolean;
    reassessmentTriggers: ReassessmentTrigger[];
    resultActions: ResultAction[];
    sustainingFactors: string[];
    trackingItems: string[];
    symptomClusters: SymptomCluster[];
    // Advanced modules
    differentialDiagnosis: DifferentialHypothesis[];
    cascadeChains: CascadeChain[];
    circadianInsights: CircadianInsight[];
    evidenceGrades: EvidenceGrade[];
    supplementProtocol: SupplementRecommendation[];
}

/* ══════════════════════════════════════════════════════════
   PATHWAY METADATA
   ══════════════════════════════════════════════════════════ */

export const PATHWAY_NAMES: Record<string, string> = {
    fatigue: 'الإرهاق والطاقة',
    sleep: 'النوم واليقظة',
    anxiety: 'القلق والتوتر',
    digestion: 'الجهاز الهضمي',
    pain: 'الألم',
    hormonal: 'التوازن الهرموني',
    immune: 'المناعة',
    headache: 'الصداع',
};

export const SEVERITY_LABELS: Record<number, string> = {
    1: 'خفيف جداً', 2: 'خفيف', 3: 'خفيف-متوسط',
    4: 'متوسط', 5: 'متوسط', 6: 'متوسط-شديد',
    7: 'شديد', 8: 'شديد جداً', 9: 'حرج', 10: 'طارئ',
};

export const DURATION_WEIGHTS: Record<string, number> = {
    days: 1.0, weeks: 1.2, months: 1.5, years: 1.8,
};

/* ══════════════════════════════════════════════════════════
   CORE UTILITY FUNCTIONS
   ══════════════════════════════════════════════════════════ */

/**
 * Flattens all EngineAnswers fields into a single searchable text string.
 * Used by all modules as the primary text corpus for signal detection.
 */
export function flattenAnswersToText(answers: EngineAnswers): string {
    const clinicalParts = Object.values(answers.clinicalAnswers).map(v =>
        Array.isArray(v) ? v.join(' ') : String(v ?? '')
    );
    return [
        ...clinicalParts,
        answers.freeText ?? '',
        answers.emotionalContext?.join(' ') ?? '',
    ].join(' ');
}

/**
 * Checks if at least `min` of `signals` appear in `text`.
 * Returns the matched signals and a boolean pass/fail.
 */
export function matchSignals(
    text: string,
    signals: string[],
    min: number,
): { matched: string[]; pass: boolean } {
    const matched = signals.filter(s => text.includes(s));
    return { matched, pass: matched.length >= min };
}

/**
 * Computes a confidence score (0–95) from match ratio, severity, and duration.
 * This is the standard confidence function used across all modules.
 */
export function computeConfidence(
    matchRatio: number,
    severity: number,
    duration: string,
): number {
    let c = Math.round(matchRatio * 70);
    c += severityBoost(severity);
    c += durationBoost(duration);
    return clampConfidence(c);
}

/**
 * Returns severity-based confidence boost.
 */
export function severityBoost(severity: number): number {
    if (severity >= 8) return 18;
    if (severity >= 7) return 15;
    if (severity >= 5) return 8;
    if (severity >= 3) return 3;
    return 0;
}

/**
 * Returns duration-based confidence boost.
 */
export function durationBoost(duration: string): number {
    return DURATION_WEIGHTS[duration] !== undefined
        ? Math.round((DURATION_WEIGHTS[duration] - 1) * 20)
        : 0;
}

/**
 * Clamps confidence to [0, 95] — we never claim 100% certainty.
 * Epistemic humility is built into the architecture.
 */
export function clampConfidence(value: number): number {
    return Math.max(0, Math.min(95, value));
}

/**
 * Converts prior probability to odds for Bayesian calculations.
 * P → odds = P / (1 - P)
 */
export function computeOddsFromPrior(prior: number): number {
    if (prior <= 0) return 0;
    if (prior >= 1) return Infinity;
    return prior / (1 - prior);
}

/**
 * Converts odds back to probability.
 * odds → P = odds / (1 + odds)
 */
export function oddsToProb(odds: number): number {
    if (odds === Infinity) return 1;
    if (odds <= 0) return 0;
    return odds / (1 + odds);
}

/**
 * Formats a confidence value for display with color-coded label.
 */
export function formatConfidence(confidence: number): {
    value: number; label: string; color: 'green' | 'yellow' | 'red';
} {
    if (confidence >= 70) return { value: confidence, label: 'عالية', color: 'green' };
    if (confidence >= 45) return { value: confidence, label: 'متوسطة', color: 'yellow' };
    return { value: confidence, label: 'أولية', color: 'red' };
}

/**
 * Determines if a pathway is "metabolic" (food/hormone driven).
 */
export function isMetabolicPathway(pathwayId: string): boolean {
    return ['fatigue', 'hormonal', 'digestion', 'immune'].includes(pathwayId);
}

/**
 * Determines if a pathway is "neurological" (brain/nerve driven).
 */
export function isNeurologicalPathway(pathwayId: string): boolean {
    return ['anxiety', 'sleep', 'headache', 'pain'].includes(pathwayId);
}

/**
 * Scores the overall clinical burden from severity + duration + emotional context.
 * Returns a 0–100 score. Used for triage prioritization.
 */
export function computeClinicalBurden(answers: EngineAnswers): number {
    let burden = answers.severity * 7; // max 70
    burden += durationBoost(answers.duration) * 2; // up to +16
    const emotionalLoad = (answers.emotionalContext?.length ?? 0);
    burden += Math.min(14, emotionalLoad * 3); // up to +14
    return Math.min(100, Math.round(burden));
}

/**
 * Returns an urgency level based on clinical burden score.
 */
export function getUrgencyLevel(burden: number): 'low' | 'moderate' | 'high' | 'urgent' {
    if (burden >= 80) return 'urgent';
    if (burden >= 60) return 'high';
    if (burden >= 35) return 'moderate';
    return 'low';
}

/**
 * Extracts top N keywords from clinical text for display.
 */
export function extractTopKeywords(text: string, n: number = 5): string[] {
    const stopWords = new Set(['في','من','على','أن','مع','هذا','إلى','عن','لا','كل']);
    return text
        .split(/\s+/)
        .filter(w => w.length >= 3 && !stopWords.has(w))
        .slice(0, n);
}
