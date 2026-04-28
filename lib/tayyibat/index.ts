// lib/tayyibat/index.ts — Barrel (v4 — explicit exports, no ambiguity)
//
// Strategy:
//   - types.ts is the canonical source for all types
//   - scoring-engine.ts (old) exports computeDetailedScore, scoreMealAdherence, project30DayOutcome
//   - tayyibat-scoring-engine.ts (new) exports TayyibatAnswers interface + computeTayyibatScore
//   - meal-tracker.ts exports meal log functions (uses TayyibatMeal from types.ts)
//   - We do NOT use export * to avoid duplicate-identifier ambiguity

// ── Canonical types ─────────────────────────────────────────
export type {
    AdherenceLevel,
    FoodStatus,
    MealSlot,
    FoodGroup,
    InflammationImpact,
    MicrobiomeImpact,
    HormonalImpact,
    ClinicalPathway,
    FoodItem,
    TayyibatMeal,
    DayLog,
    TayyibatAssessmentResult,
    DimensionScore,
    WeeklyStep,
    ClinicalLink,
    BiomarkerPrediction,
    TayyibatProtocol,
    ProtocolPhase,
    ScienceCard,
} from './types';

// ── Food database ────────────────────────────────────────────
export * from './food-database';

// ── Science cards ────────────────────────────────────────────
export * from './science-cards';

// ── Old scoring engine (computeDetailedScore) ────────────────
export {
    computeDetailedScore,
    scoreMealAdherence,
    project30DayOutcome,
} from './scoring-engine';

// ── New tayyibat scoring engine (TayyibatAnswers + computeTayyibatScore) ────
// TayyibatAnswers is defined here — not in types.ts — so no conflict
export * from './tayyibat-scoring-engine';

// ── Pattern engine ───────────────────────────────────────────
export * from './pattern-engine';

// ── Meal tracker ─────────────────────────────────────────────
// TayyibatMeal is imported from ./types inside meal-tracker, not re-exported
export * from './meal-tracker';

// ── Assessment questions ─────────────────────────────────────
export * from './assessment-questions';

// ── Protocols ────────────────────────────────────────────────
export * from './protocols';

// ── Dr Awadhi system ─────────────────────────────────────────
export * from './dr-awadhi-system';

// ── Attribution ──────────────────────────────────────────────
export * from './attribution';

// ── Tayyibat store ───────────────────────────────────────────
export * from './tayyibat-store';
