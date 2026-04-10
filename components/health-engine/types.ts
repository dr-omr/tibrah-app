// components/health-engine/types.ts
// THIE v5 — Conscious Integrative Diagnostic System (CIDS)
// World's first three-dimensional health pattern engine

export type TriageLevel = 'emergency' | 'urgent' | 'needs_doctor' | 'review' | 'manageable';
export type StepId = 'welcome' | 'pathway' | 'clinical' | 'emotional' | 'analyzing' | 'result';

/* ── Functional Medicine Patterns (Root Causes) ── */
export type FunctionalPattern =
    | 'adrenal_exhaustion'    // Cortisol dysregulation, HPA axis
    | 'thyroid_underfunction' // Hypothyroidism / Hashimoto
    | 'gut_dysbiosis'         // Microbiome imbalance, leaky gut
    | 'blood_sugar_chaos'     // Insulin resistance, reactive hypoglycemia
    | 'nutrient_depletion'    // B12, D, Mg, Fe, Zn deficiencies
    | 'inflammatory_load'     // Systemic inflammation, immune activation
    | 'mitochondrial_drain'   // Energy production failure
    | 'hormonal_cascade'      // Sex hormones imbalance
    | 'nervous_system_dysreg' // Autonomic dysfunction, vagal tone
    | 'toxic_burden'          // Heavy metals, environmental toxins
    | 'none';

/* ── Somatic-Emotional Themes (Body Language) ── */
export type SomaticTheme =
    | 'suppressed_expression' // "I can't say what I need to"
    | 'hypervigilance'        // Trauma-wired threat response
    | 'grief_unprocessed'     // Loss held in the body
    | 'chronic_self_override' // Disconnected from body signals
    | 'worth_and_belonging'   // Identity, shame, not enough
    | 'control_and_release'   // Digestive / letting go patterns
    | 'compassion_fatigue'    // Caregiver collapse
    | 'childhood_imprint'     // Early survival adaptations
    | 'none';

/* ── Integrative Insight — The Third Output ── */
export interface TriageResult {
    level: TriageLevel;
    score: number;
    topFunctionalPattern: FunctionalPattern;
    topSomaticTheme: SomaticTheme;
    functionalScore: number;  // 0-10 functional medicine urgency
    somaticScore: number;     // 0-10 somatic-emotional load
    integrativeInsight: string; // Clinical narrative for the doctor
}

/* ── A Question That Speaks Three Languages Simultaneously ── */
export interface IntegrativeOption {
    text: string;
    // Each option silently encodes its dimensional fingerprint
    conventional: number;     // 0-3: clinical severity signal
    functional: FunctionalPattern;
    somatic: SomaticTheme | 'none';
    weight: number;           // Triage weight of selecting this
}

export interface IntegrativeClinicalQuestion {
    id: string;
    text: string;                // The question as heard by patient
    clinicianNote: string;       // Why we ask this (shown to doctor)
    type: 'single' | 'multiple';
    options: string[];
    // Parallel array — each option's dimensional encoding
    optionMeta: IntegrativeOption[];
}

/* ── Old-style question for backward compat ── */
export interface ClinicalQuestion {
    id: string;
    text: string;
    type: 'single' | 'multiple' | 'scale' | 'text';
    options?: string[];
    min?: number;
    max?: number;
}

export interface RedFlag {
    id: string;
    text: string;
    level: 'emergency' | 'urgent';
    actionMessage: string;
}

export interface Pathway {
    id: string;
    label: string;
    emoji: string;
    color: string;
    gradient: [string, string];
    description: string;
    subtitle: string;           // Clinical description for engagement
    redFlags: RedFlag[];
    clinicalQuestions: ClinicalQuestion[];
}

export interface EngineAnswers {
    pathwayId: string;
    severity: number;
    duration: string;
    redFlags: string[];
    hasEmergencyFlag: boolean;
    emergencyMessage: string;
    clinicalAnswers: Record<string, string | string[] | number>;
    emotionalContext: string[];
    emotionalNote: string;
    freeText: string;
}

export type AnswerValue = string | string[] | number;
