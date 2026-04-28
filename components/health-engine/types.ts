// components/health-engine/types.ts
// THIE v5 — Conscious Integrative Diagnostic System (CIDS)
// World's first three-dimensional health pattern engine

export type TriageLevel = 'emergency' | 'urgent' | 'needs_doctor' | 'review' | 'manageable';
export type StepId = 'welcome' | 'pathway' | 'clinical' | 'emotional' | 'nutrition' | 'analyzing' | 'result';

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
    /** Tayyibat nutrition answers (gate + deep flow) — additive, optional */
    nutritionAnswers?: {
        gateAnswers: Record<string, string>;
        deepAnswers: Record<string, string>;
        deepTriggered: boolean;
    };
    /**
     * Adaptive question orchestrator snapshot — attached right before
     * handleSubmit so the result can explain question selection decisions.
     * Optional: absent in sessions created before Phase 2.
     */
    adaptiveQuestionPlanSnapshot?: {
        nutritionShown:    boolean;
        safetyPrioritized: boolean;
        deepIntakeShown:   boolean;
        foodSignalFound:   boolean;
        burdenMinimized:   boolean;
        reasons:           string[];
        triageRiskHint:    string;
    };
}

export type AnswerValue = string | string[] | number;

/* ══════════════════════════════════════════════════════════
   4-DOMAIN ROUTING ENGINE TYPES
   محرك التوجيه الرباعي — Tibrah Routing System
   ══════════════════════════════════════════════════════════ */

/** The four healing domains */
export type DomainId = 'jasadi' | 'nafsi' | 'fikri' | 'ruhi';

/** All 26 subdomains across 4 domains */
export type SubdomainId =
    // جسدي (8)
    | 'digestive' | 'hormonal' | 'inflammatory' | 'energy_fatigue'
    | 'sleep' | 'nutrition_deficiency' | 'musculoskeletal' | 'skin_hair'
    // نفسي (6)
    | 'anxiety_arousal' | 'suppression_chronic_stress' | 'grief_depletion'
    | 'psychosomatic' | 'panic' | 'emotion_symptom_link'
    // فكري (6)
    | 'overthinking' | 'limiting_beliefs' | 'body_hypermonitor'
    | 'self_criticism' | 'perfectionism' | 'confusion_directionless'
    // روحي (6)
    | 'lost_serenity' | 'rhythm_disruption' | 'lost_meaning'
    | 'inner_depletion' | 'self_disconnection' | 'sleep_light_quiet';

/** Five types of tools available per subdomain */
export type ToolType = 'test' | 'practice' | 'workshop' | 'protocol' | 'tracker';

/** A recommended tool from the routing engine */
export interface ToolRecommendation {
    id: string;
    type: ToolType;
    arabicName: string;
    englishName: string;
    emoji: string;
    description: string;
    href: string;
    durationMinutes: number;
    isFree: boolean;
}

/** Complete routing result after assessment */
export interface RoutingResult {
    /** Highest-scoring domain */
    primary_domain: DomainId;
    /** Second highest domain */
    secondary_domain: DomainId;
    /** Top subdomain within primary domain */
    primary_subdomain: SubdomainId;
    /** Top subdomain within secondary domain (companion module) */
    secondary_subdomain: SubdomainId;
    /** Raw scores for each domain (0–100 scale) */
    domain_scores: Record<DomainId, number>;
    /** Arabic description of this week's priority */
    priority: string;
    /** Arabic explanation of why this routing was chosen */
    why: string;
    /** Up to 5 recommended tools (protocol + practice + test + workshop + tracker) */
    recommended_tools: ToolRecommendation[];
    /** Whether escalation to a doctor is needed */
    escalation_needed: boolean;

    /* ── Precision upgrade fields ── */
    /** How confident the engine is in its routing (based on score gap between domains) */
    confidence: 'high' | 'medium' | 'low';
    /** Clinician-grade Arabic explanation of *why* this routing was chosen, specific to the user's answers */
    clinical_explanation: string;
    /** Specific actionable step for today */
    today_action: string;
    /** 2-4 items to monitor this week */
    monitor_items: string[];
    /** Warning signs that should trigger seeking medical care */
    seek_care_when: string;

    /* ── Sprint A: Contradiction + Confidence Engine ── */
    /** Consistency contradictions detected in the user's answer pattern */
    contradictions: import('@/lib/contradiction-engine').ContradictionFlag[];
    /** 0-100 computed confidence score (5-factor model) */
    confidenceScore: number;
    /** Arabic phrases explaining what drove the confidence level */
    confidenceFactors: string[];
    /** Top 3 high-weight signals that drove the routing decision */
    key_signals: import('@/lib/contradiction-engine').KeySignal[];

    /* ── Sprint B: Phenotype Inference ── */
    /** Inferred clinical sub-pattern within the selected pathway */
    phenotype: {
        id: string;
        /** Arabic — always framed as "يميل إلى…" or "نمط شبيه بـ…" */
        label: string;
        /** 2-sentence Arabic clinical description of this pattern */
        description: string;
        /** 0-100: how many trigger answers matched this phenotype */
        matchScore: number;
    };
}

/* ══════════════════════════════════════════════════════════
   RESULT VIEW-MODEL — Sprint E
   Structured contract between engine and UI.
   StepResult consumes ResultViewModel, not raw engine output.
   ══════════════════════════════════════════════════════════ */



/** Hero block — primary result banner */
export interface ResultHeroBlock {
    /** Arabic pathway label e.g. "طاقة وحيوية" */
    pathwayLabel: string;
    pathwayEmoji: string;
    /** Primary domain Arabic name */
    domainArabicName: string;
    domainEmoji: string;
    domainId: DomainId;
    /** Triage badge text e.g. "⚠️ طارئ" */
    triageBadge: string;
    triageLevel: TriageLevel;
    /** Triage score 0-10 */
    score: number;
    /** Severity 1-10 as Arabic fraction e.g. "٧/١٠" */
    severityDisplay: string;
    /** Duration Arabic label e.g. "مزمن" */
    durationDisplay: string;
    /** Integrative insight from triage engine — may be empty */
    integrativeInsight: string;
}

/** Confidence + phenotype inline strip */
export interface ConfidencePhenotypeBlock {
    /** 'high' | 'medium' | 'low' */
    confidenceBand: 'high' | 'medium' | 'low';
    /** 0-100 numeric score */
    confidenceScore: number;
    /** Arabic label for confidence level */
    confidenceLabel: string;
    /** Up to 2 Arabic factor chips */
    confidenceFactors: string[];
    /** Phenotype label (may be empty if no phenotype) */
    phenotypeLabel: string;
    /** Phenotype description */
    phenotypeDescription?: string;
    /** 0-100 match percentage */
    phenotypeMatchScore: number;
    /** whether to show the phenotype row at all */
    showPhenotype: boolean;
}

/** Domain compass — 4-domain scores + why text */
export interface DomainCompassBlock {
    primaryDomainId: DomainId;
    secondaryDomainId: DomainId;
    /** Raw domain scores 0-100 */
    domainScores: Record<DomainId, number>;
    /** Arabic explanation of routing rationale */
    whyText: string;
    /** Arabic priority text for this week */
    priorityText: string;
}

/** Clinical explanation section */
export interface ResultInsightBlock {
    /** Arabic explanation of why this routing was chosen */
    body: string;
    iconKey: 'book' | 'zap' | 'eye' | 'activity';
    /** Section label shown above body */
    sectionLabel: string;
    analyticsKey: string;
}

/** Contradiction / consistency note (only shown if contradictions exist) */
export interface ConsistencyNoteBlock {
    /** Max 2 Arabic contradiction messages */
    notes: string[];
    /** Always 'amber' */
    tone: 'amber';
}

/** Single key signal item */
export interface KeySignalPresentation {
    label: string;
    dimension: 'functional' | 'somatic' | 'progression' | 'severity';
    weight: number;
    /** Emoji for the dimension */
    emoji: string;
}

/** Today-action card */
export interface ResultActionBlock {
    /** Phenotype-aware Arabic action text */
    body: string;
    sectionLabel: string;
    tone: 'green';
    analyticsKey: string;
}

/** Monitor-this-week card */
export interface ResultMonitoringBlock {
    /** 2-4 Arabic monitoring points */
    items: string[];
    sectionLabel: string;
    analyticsKey: string;
}

/** Seek-care / escalation card */
export interface ResultEscalationBlock {
    /** Arabic escalation condition text */
    body: string;
    sectionLabel: string;
    isUrgent: boolean;
    tone: 'red';
    analyticsKey: string;
}

/** Three-dimensional badge data (conventional / functional / somatic scores) */
export interface TriDimBadgeBlock {
    conventionalScore: number;
    functionalScore: number;
    somaticScore: number;
    topFunctionalPatternLabel: string;
    topSomaticThemeLabel: string;
}

/** Ranked recommendation card with enriched metadata */
export interface RankedRecommendation extends ToolRecommendation {
    /** 1 = highest priority */
    priority: number;
    /** Group this card belongs to */
    group: 'primary' | 'tools' | 'tracking';
    /** Arabic rationale: why this recommendation now */
    whyNow: string;
    /** Arabic expected benefit */
    expectedBenefit: string;
    /** Effort level */
    effortLevel: 'low' | 'medium' | 'high';
    /** Arabic effort label */
    effortLabel: string;
    /** Arabic duration hint e.g. "٧ أيام" */
    durationHint: string;
    /** Arabic CTA label e.g. "ابدأ البروتوكول" */
    ctaLabel: string;
    /** Accent color inherited from domain */
    accentColor: string;
}

/** A grouped set of ranked recommendations */
export interface RecommendationGroup {
    /** Group key */
    key: 'primary' | 'tools' | 'tracking';
    /** Arabic section header */
    header: string;
    recommendations: RankedRecommendation[];
}

/** Plan handoff narrative block — bottom of result */
export interface ResultPlanHandoffModel {
    /** Arabic summary of main direction */
    mainDirection: string;
    /** Arabic start-today step */
    startTodayStep: string;
    /** Arabic revisit note */
    revisitNote: string;
    /** Arabic reassessment condition */
    reassessmentCondition: string;
    /** Whether to show a booking CTA */
    showBookingCta: boolean;
    /** Whether to show reassessment CTA */
    showReassessmentCta: boolean;
}

/** Escalation banner data — shown above hero if escalation needed */
export interface EscalationBannerBlock {
    level: TriageLevel;
    title: string;
    body: string;
    ctaLabel: string;
    ctaHref: string;
    isEmergency: boolean;
}

/** Full ResultViewModel — assembled by build-result-view-model.ts */
export interface ResultViewModel {
    /** ① Banner — only present if escalation_needed */
    escalationBanner: EscalationBannerBlock | null;
    /** ② Hero card */
    hero: ResultHeroBlock;
    /** ③ Domain compass */
    domainCompass: DomainCompassBlock;
    /** ③b Confidence + phenotype strip */
    confidencePhenotype: ConfidencePhenotypeBlock;
    /** ③c Clinical explanation */
    clinicalExplanation: ResultInsightBlock;
    /** ③d Today action */
    todayAction: ResultActionBlock;
    /** ③e Monitor items */
    monitoring: ResultMonitoringBlock;
    /** ③f Seek care */
    seekCare: ResultEscalationBlock;
    /** ③g Consistency note (null if no contradictions) */
    consistencyNote: ConsistencyNoteBlock | null;
    /** ③h Key signals */
    keySignals: KeySignalPresentation[];
    /** ④ 3D badges */
    triDimBadges: TriDimBadgeBlock;
    /** ⑤ Ranked + grouped recommendations */
    recommendationGroups: RecommendationGroup[];
    /** Primary domain visual data needed by UI */
    domainId: DomainId;
    /** Whether escalation is needed (gates CTA logic) */
    escalationNeeded: boolean;
    /** Primary domain section href */
    primarySectionHref: string;
    /** Plan handoff narrative */
    planHandoff: ResultPlanHandoffModel;
    /** Clinical precision analysis (additive layer) */
    clinicalPrecision?: import('@/lib/clinical-precision-engine').ClinicalPrecisionResult;
    /** Tayyibat dietary verdict (additive layer) */
    tayyibatVerdict?: import('@/lib/tayyibat-assessment-bridge').TayyibatAssessmentVerdict;
    /** Medical history correlation (additive layer) */
    medicalHistoryVerdict?: import('@/lib/medical-history-bridge').MedicalHistoryVerdict;

    /* ── Phase 3: Unified Confidence + Contradictions + Triage ── */

    /**
     * Unified confidence explanation (Phase 3).
     * Shows WHY the confidence is what it is, what's missing, and how to improve.
     * Optional: absent in sessions created before Phase 3.
     */
    confidenceExplanation?: {
        score:          number;
        label:          'low' | 'medium' | 'high';
        userNote:       string;
        howToImprove:   string[];
        missingData:    string[];
        nutritionConfidence: number;
        isPreliminary:  boolean;
    };

    /**
     * Contradiction summary (Phase 3).
     * User-safe Arabic notes on answer inconsistencies.
     * Optional: absent when no contradictions detected.
     */
    contradictionSummary?: {
        count:          number;
        majorCount:     number;
        userMessages:   string[];   // Max 2-3 shown in UI
        confidencePenalty: number;
    };

    /**
     * Refined triage (Phase 3).
     * Post-processed triage that ensures safety rules are upheld.
     * Optional: absent in sessions before Phase 3.
     */
    refinedTriage?: {
        level:             string;
        safetyMessage:     string | null;
        lifestyleAllowed:  boolean;
        nutritionAllowed:  boolean;
        recommendedAction: string;
        wasRefined:        boolean;
    };

    /**
     * What we do not know yet (Phase 3).
     * Constructive uncertainty — shown when confidence is low/medium.
     * Phrased as "لرفع الدقة، أجب عن…"
     */
    whatWeDoNotKnowYet?: string[];
}
