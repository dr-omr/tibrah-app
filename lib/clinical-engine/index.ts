// lib/clinical-engine/index.ts — Full Barrel (Final)
export type {
    ClinicalPrecisionResult, SymptomTimeline, RecurrenceAssessment,
    TriggerRelief, FunctionalImpact, FoodSymptomSignal,
    ReassessmentTrigger, ResultAction, SymptomCluster,
    DifferentialHypothesis, CascadeChain, CircadianInsight,
    EvidenceGrade, SupplementRecommendation,
} from './types';

export {
    flattenAnswersToText, matchSignals, computeConfidence,
    computeOddsFromPrior, oddsToProb, clampConfidence,
    severityBoost, durationBoost, formatConfidence,
    isMetabolicPathway, isNeurologicalPathway,
    computeClinicalBurden, getUrgencyLevel, extractTopKeywords,
    PATHWAY_NAMES, SEVERITY_LABELS,
} from './types';

// Bayesian
export { METABOLIC_HYPOTHESES } from './bayesian-hypotheses-metabolic';
export { HORMONAL_HYPOTHESES } from './bayesian-hypotheses-hormonal';
export { runBayesianDifferential, getHighProbabilityDx,
    getTopDiagnosis, detectRedFlagHypotheses } from './bayesian-differential';

// Cascade
export { NEURO_CASCADES, detectNeuroCascades } from './cascade-chains-neuro';
export { METABOLIC_CASCADES, detectMetabolicCascades } from './cascade-chains-metabolic';
export { detectCascadeChains, getPrimaryCascade, getHighConfidenceCascades } from './cascade-detector';

// Circadian
export { MORNING_RULES, detectMorningDisruptions } from './circadian-rules-morning';
export { NIGHT_RULES, detectNightDisruptions } from './circadian-rules-night';
export { analyzeCircadianDisruption, getMostCriticalCircadian,
    hasNocturnalDisruption } from './circadian-analyzer';

// Evidence
export { gradeRecommendationEvidence, getTopRecommendation,
    getGradeARecommendations } from './evidence-grader';

// Supplements
export { generateSupplementProtocol, getQuickStartStack,
    checkInteraction } from './supplement-engine';
