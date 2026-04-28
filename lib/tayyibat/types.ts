// lib/tayyibat/types.ts — المصدر الوحيد لكل أنواع الطيبات
// ═══════════════════════════════════════════════════════════
export type AdherenceLevel = 'elite' | 'good' | 'moderate' | 'poor' | 'critical';
export type FoodStatus     = 'allowed' | 'forbidden_primary' | 'forbidden_secondary' | 'conditional';
export type MealSlot       = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'any';
export type FoodGroup      = 'protein' | 'fat' | 'carb' | 'vegetable' | 'fruit' | 'herb' | 'drink' | 'dairy' | 'grain' | 'legume';
export type InflammationImpact = 'anti' | 'neutral' | 'pro' | 'highly_pro';
export type MicrobiomeImpact   = 'beneficial' | 'neutral' | 'harmful';
export type HormonalImpact     = 'supportive' | 'neutral' | 'disruptive';
export type ClinicalPathway    = 'fatigue' | 'sleep' | 'anxiety' | 'digestion' | 'pain' | 'hormonal' | 'immune' | 'headache' | 'all';

export interface FoodItem {
    id: string;
    name: string;
    nameEn?: string;
    emoji?: string;
    group: FoodGroup;
    status: FoodStatus;
    mealSlots: MealSlot[];
    inflammationImpact: InflammationImpact;
    microbiomeImpact: MicrobiomeImpact;
    hormonalImpact: HormonalImpact;
    keyNutrients: string[];
    clinicalBenefit: string;
    avoidReason?: string;
    conditionalNote?: string;
    relevantPathways: ClinicalPathway[];
    preparationTip?: string;
    alternativeTo?: string;   // what it replaces
    scientificRef?: string;
    priority: number;         // 1–5, higher = more impactful
}

export interface TayyibatMeal {
    id: string;
    slot: MealSlot;
    items: string[];          // FoodItem IDs
    timestamp: number;
    adherenceScore: number;   // 0–100 per meal
    violations: string[];
    notes?: string;
}

export interface DayLog {
    date: string;             // YYYY-MM-DD
    meals: TayyibatMeal[];
    dailyScore: number;
    streak: number;
    topViolation?: string;
    topStrength?: string;
}

export interface TayyibatAssessmentResult {
    score: number;            // 0–100
    level: AdherenceLevel;
    dimension: DimensionScore[];
    strengths: string[];
    gaps: string[];
    topPriority: string;
    weeklyPlan: WeeklyStep[];
    clinicalLinks: ClinicalLink[];
    biomarkerPredictions: BiomarkerPrediction[];
}

export interface DimensionScore {
    id: string;
    label: string;
    score: number;            // 0–100
    maxScore: number;
    icon: string;
    feedback: string;
}

export interface WeeklyStep {
    day: number;              // 1–7
    action: string;
    why: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeRequired: string;
}

export interface ClinicalLink {
    pathway: ClinicalPathway;
    impact: 'high' | 'moderate' | 'low';
    mechanism: string;
    improvementTimeline: string;
}

export interface BiomarkerPrediction {
    marker: string;           // e.g. "hs-CRP"
    currentRisk: 'high' | 'moderate' | 'low';
    afterProtocol: string;
    timeframe: string;
}

export interface TayyibatProtocol {
    id: string;
    name: string;
    targetPathways: ClinicalPathway[];
    durationDays: number;
    phases: ProtocolPhase[];
    successMetrics: string[];
    contraindicatedFor: string[];
}

export interface ProtocolPhase {
    phaseNumber: number;
    name: string;
    durationDays: number;
    allowedExtra: string[];
    eliminateNow: string[];
    dailyFocus: string;
    expectedOutcome: string;
}

export interface ScienceCard {
    id: string;
    question: string;
    shortAnswer: string;
    deepDive: string;
    mechanism: string;
    evidence: string;
    relatedPathways: ClinicalPathway[];
    readingTime: number;      // minutes
}
