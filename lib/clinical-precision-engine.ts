// lib/clinical-precision-engine.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Clinical Precision Layer (Public API)
// ════════════════════════════════════════════════════════════════════════
//
// This file is the PUBLIC API for the clinical precision engine.
// Core analysis functions live here. Advanced modules (Bayesian, Cascade,
// Circadian, Evidence, Supplements) are in lib/clinical-engine/*.ts
// and re-exported here for backward compatibility.
//
// ARCHITECTURE:
//   clinical-precision-engine.ts  ← Public API + core analysis
//   clinical-engine/
//     ├── types.ts                ← Shared types + utilities
//     ├── bayesian-differential.ts ← Module A: Bayesian diagnosis
//     ├── cascade-detector.ts      ← Module B: Cross-system cascades
//     ├── circadian-analyzer.ts    ← Module C: Circadian rhythm
//     ├── evidence-grader.ts       ← Module D: Evidence quality
//     ├── supplement-engine.ts     ← Module E: Supplement protocols
//     └── index.ts                 ← Barrel re-exports
// ════════════════════════════════════════════════════════════════════════

import type { EngineAnswers, TriageResult, RoutingResult } from '@/components/health-engine/types';

// Local imports of advanced types (needed by ClinicalPrecisionResult interface)
import type {
    DifferentialHypothesis,
    CascadeChain,
    CircadianInsight,
    EvidenceGrade,
    SupplementRecommendation,
} from './clinical-engine/types';

// Re-export all advanced modules for backward compatibility
export { runBayesianDifferential } from './clinical-engine/bayesian-differential';
export { detectCascadeChains } from './clinical-engine/cascade-detector';
export { analyzeCircadianDisruption } from './clinical-engine/circadian-analyzer';
export { gradeRecommendationEvidence } from './clinical-engine/evidence-grader';
export { generateSupplementProtocol } from './clinical-engine/supplement-engine';

// Re-export advanced types for consumers
export type {
    DifferentialHypothesis,
    CascadeChain,
    CircadianInsight,
    EvidenceGrade,
    SupplementRecommendation,
} from './clinical-engine/types';

// Import functions for use in analyzeClinicalPrecision
import { runBayesianDifferential } from './clinical-engine/bayesian-differential';
import { detectCascadeChains } from './clinical-engine/cascade-detector';
import { analyzeCircadianDisruption } from './clinical-engine/circadian-analyzer';
import { gradeRecommendationEvidence } from './clinical-engine/evidence-grader';
import { generateSupplementProtocol } from './clinical-engine/supplement-engine';


/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

export interface ClinicalPrecisionResult {
    /** Symptom timeline assessment */
    timeline: SymptomTimeline;
    /** Is this recurrent or first episode? */
    recurrence: RecurrenceAssessment;
    /** Identified triggers and relievers */
    triggerMap: TriggerRelief;
    /** Functional impact level */
    functionalImpact: FunctionalImpact;
    /** Food-symptom timing signals */
    foodSymptomSignals: FoodSymptomSignal[];
    /** Whether this is chronic */
    isChronic: boolean;
    /** When to reassess */
    reassessmentTriggers: ReassessmentTrigger[];
    /** Precise result-to-action items */
    resultActions: ResultAction[];
    /** What is most likely sustaining the symptoms */
    sustainingFactors: string[];
    /** What to track for 3-7 days */
    trackingItems: string[];
    /** Detected multi-symptom clusters */
    symptomClusters: SymptomCluster[];
    /** Bayesian differential diagnosis ranking */
    differentialDiagnosis: DifferentialHypothesis[];
    /** Cross-system cascade chains */
    cascadeChains: CascadeChain[];
    /** Circadian rhythm disruption insights */
    circadianInsights: CircadianInsight[];
    /** Evidence quality grades for recommendations */
    evidenceGrades: EvidenceGrade[];
    /** Supplement protocol recommendations */
    supplementProtocol: SupplementRecommendation[];
}

export interface SymptomTimeline {
    /** Duration category */
    duration: 'acute' | 'subacute' | 'chronic';
    /** Duration text */
    durationText: string;
    /** Progression pattern */
    progression: 'stable' | 'worsening' | 'fluctuating' | 'improving';
    /** Time-of-day pattern if any */
    timeOfDayPattern: string | null;
    /** Daily fluctuation description */
    dailyFluctuation: string | null;
}

export interface RecurrenceAssessment {
    /** Is this a recurrence? */
    isRecurrent: boolean;
    /** Recurrence pattern text */
    pattern: string;
    /** Relevance to treatment */
    treatmentImplication: string;
}

export interface TriggerRelief {
    /** Identified triggers */
    triggers: string[];
    /** Identified relievers */
    relievers: string[];
    /** Summary */
    summary: string;
}

export interface FunctionalImpact {
    /** Overall level */
    level: 'minimal' | 'moderate' | 'significant' | 'severe';
    /** Text description */
    description: string;
    /** Affected domains */
    affectedDomains: string[];
}

export interface FoodSymptomSignal {
    /** Signal description */
    signal: string;
    /** Strength */
    strength: 'strong' | 'moderate' | 'weak';
    /** Suggested action */
    action: string;
}

export interface ReassessmentTrigger {
    /** Trigger condition */
    condition: string;
    /** When */
    when: string;
    /** Why */
    why: string;
}

export interface ResultAction {
    /** Action type */
    type: 'start_today' | 'stop_today' | 'monitor_3_days' | 'reassess_when' | 'next_tool';
    /** Action text */
    text: string;
    /** Priority */
    priority: 'high' | 'medium' | 'low';
    /** Rationale */
    rationale: string;
}

export interface SymptomCluster {
    /** Cluster ID */
    id: string;
    /** Arabic name */
    name: string;
    /** Clinical significance */
    significance: string;
    /** Matched keywords that activated this cluster */
    matchedSignals: string[];
    /** Confidence in this cluster 0-100 */
    confidence: number;
}

/* ══════════════════════════════════════════════════════════
   MAIN FUNCTION
   ══════════════════════════════════════════════════════════ */

/**
 * Generate clinical precision analysis from assessment data.
 * This is additive — does not modify existing routing.
 */
export function analyzeClinicalPrecision(
    answers: EngineAnswers,
    triageResult: TriageResult,
    routing: RoutingResult,
): ClinicalPrecisionResult {
    const timeline = analyzeTimeline(answers);
    const recurrence = analyzeRecurrence(answers);
    const triggerMap = analyzeTriggers(answers);
    const functionalImpact = assessFunctionalImpact(answers, triageResult);
    const foodSymptomSignals = analyzeFoodSymptomTiming(answers);
    const isChronic = timeline.duration === 'chronic';
    const reassessmentTriggers = generateReassessmentTriggers(answers, triageResult, routing);
    const resultActions = generateResultActions(answers, triageResult, routing, timeline);
    const sustainingFactors = identifySustainingFactors(answers, triageResult, routing);
    const trackingItems = generateTrackingItems(answers, routing);
    const symptomClusters = detectSymptomClusters(answers, triageResult);

    // Advanced clinical intelligence modules
    const differentialDiagnosis = runBayesianDifferential(answers);
    const cascadeChains = detectCascadeChains(answers);
    const circadianInsights = analyzeCircadianDisruption(answers);
    const evidenceGrades = gradeRecommendationEvidence(answers);
    const supplementProtocol = generateSupplementProtocol(answers);

    return {
        timeline,
        recurrence,
        triggerMap,
        functionalImpact,
        foodSymptomSignals,
        isChronic,
        reassessmentTriggers,
        resultActions,
        sustainingFactors,
        trackingItems,
        symptomClusters,
        differentialDiagnosis,
        cascadeChains,
        circadianInsights,
        evidenceGrades,
        supplementProtocol,
    };
}

/* ══════════════════════════════════════════════════════════
   TIMELINE ANALYSIS
   ══════════════════════════════════════════════════════════ */

function analyzeTimeline(answers: EngineAnswers): SymptomTimeline {
    const dur = answers.duration;
    let duration: SymptomTimeline['duration'] = 'acute';
    let durationText = '';

    if (dur === 'months' || dur === 'years') {
        duration = 'chronic';
        durationText = dur === 'months' ? 'مزمنة — أشهر' : 'مزمنة — سنوات';
    } else if (dur === 'weeks') {
        duration = 'subacute';
        durationText = 'شبه حادة — أسابيع';
    } else {
        duration = 'acute';
        durationText = 'حادة — أيام';
    }

    // Progression from clinical answers
    const clinicalText = Object.values(answers.clinicalAnswers).flat().join(' ');
    let progression: SymptomTimeline['progression'] = 'stable';
    if (clinicalText.includes('تسوء') || clinicalText.includes('تزداد') || clinicalText.includes('تتفاقم')) {
        progression = 'worsening';
    } else if (clinicalText.includes('تتحسن') || clinicalText.includes('تخف')) {
        progression = 'improving';
    } else if (clinicalText.includes('تتغير') || clinicalText.includes('متقطع')) {
        progression = 'fluctuating';
    }

    // Time-of-day patterns
    let timeOfDayPattern: string | null = null;
    if (clinicalText.includes('صباح') || clinicalText.includes('صباحي')) {
        timeOfDayPattern = 'تشتد صباحاً';
    } else if (clinicalText.includes('مساء') || clinicalText.includes('ليل')) {
        timeOfDayPattern = 'تشتد مساءً/ليلاً';
    } else if (clinicalText.includes('بعد الأكل')) {
        timeOfDayPattern = 'مرتبطة بالوجبات';
    }

    // Daily fluctuation
    let dailyFluctuation: string | null = null;
    if (answers.severity >= 7 && progression === 'fluctuating') {
        dailyFluctuation = 'تتذبذب الأعراض بشدة خلال اليوم — قد يشير لمحفز متكرر';
    }

    return { duration, durationText, progression, timeOfDayPattern, dailyFluctuation };
}

/* ══════════════════════════════════════════════════════════
   RECURRENCE
   ══════════════════════════════════════════════════════════ */

function analyzeRecurrence(answers: EngineAnswers): RecurrenceAssessment {
    const dur = answers.duration;
    const clinicalText = Object.values(answers.clinicalAnswers).flat().join(' ');

    const recurrentKeywords = ['ترجع', 'تتكرر', 'كل فترة', 'مرات سابقة', 'من سنوات'];
    const isRecurrent = dur === 'months' || dur === 'years' ||
        recurrentKeywords.some(k => clinicalText.includes(k));

    let pattern = 'هذه المرة الأولى على الأرجح';
    let treatmentImplication = 'التدخل المبكر مناسب — فرصة جيدة للنتائج السريعة';

    if (isRecurrent) {
        pattern = 'نمط متكرر — الأعراض ظهرت أكثر من مرة';
        treatmentImplication = 'التكرار يشير لعامل مستمر (غذاء، ضغط، نقص). البحث عن السبب الجذري أهم من علاج الأعراض';
    }

    return { isRecurrent, pattern, treatmentImplication };
}

/* ══════════════════════════════════════════════════════════
   TRIGGERS & RELIEVERS
   ══════════════════════════════════════════════════════════ */

function analyzeTriggers(answers: EngineAnswers): TriggerRelief {
    const clinicalAnswers = answers.clinicalAnswers || {};
    const triggers: string[] = [];
    const relievers: string[] = [];

    // Extract from trigger/reliever question answers
    for (const [key, values] of Object.entries(clinicalAnswers)) {
        const vals = Array.isArray(values) ? values : [values];
        for (const v of vals) {
            const vStr = String(v);
            if (vStr.includes('تسوء') || vStr.includes('يسوء')) {
                triggers.push(vStr.replace(/تسوء|يسوء/g, '').trim());
            }
            if (vStr.includes('تتحسن') || vStr.includes('يتحسن') || vStr.includes('تخف')) {
                relievers.push(vStr.replace(/تتحسن|يتحسن|تخف/g, '').trim());
            }
        }
    }

    // Stress as trigger
    if (answers.emotionalContext.some(e => ['work_stress', 'burnout', 'trauma'].includes(e))) {
        triggers.push('الضغط النفسي/الإجهاد');
    }

    let summary = '';
    if (triggers.length > 0 && relievers.length > 0) {
        summary = `محفزات واضحة (${triggers.length}) ومهدئات (${relievers.length}) — خريطة مفيدة للتدخل`;
    } else if (triggers.length > 0) {
        summary = `تم تحديد ${triggers.length} محفز — تجنبها قد يُخفف الأعراض`;
    } else {
        summary = 'لم يتم تحديد محفزات واضحة — المراقبة ستكشف المزيد';
    }

    return { triggers, relievers, summary };
}

/* ══════════════════════════════════════════════════════════
   FUNCTIONAL IMPACT
   ══════════════════════════════════════════════════════════ */

function assessFunctionalImpact(
    answers: EngineAnswers,
    triage: TriageResult,
): FunctionalImpact {
    const severity = answers.severity;
    const affectedDomains: string[] = [];

    if (severity >= 7) affectedDomains.push('القدرة على العمل/الدراسة');
    if (answers.duration === 'months' || answers.duration === 'years') affectedDomains.push('جودة الحياة اليومية');
    if (answers.emotionalContext.some(e => e !== 'none')) affectedDomains.push('الصحة النفسية');
    if (triage.level === 'urgent' || triage.level === 'emergency') affectedDomains.push('السلامة الجسدية');

    let level: FunctionalImpact['level'] = 'minimal';
    if (severity >= 8 || triage.level === 'emergency') level = 'severe';
    else if (severity >= 6) level = 'significant';
    else if (severity >= 4) level = 'moderate';

    const descriptions: Record<string, string> = {
        minimal: 'التأثير على الأداء اليومي محدود',
        moderate: 'التأثير واضح على بعض الأنشطة اليومية',
        significant: 'التأثير كبير على القدرة الوظيفية والحياة اليومية',
        severe: 'التأثير شديد — يمنع الأنشطة الأساسية',
    };

    return { level, description: descriptions[level], affectedDomains };
}

/* ══════════════════════════════════════════════════════════
   FOOD-SYMPTOM TIMING
   ══════════════════════════════════════════════════════════ */

function analyzeFoodSymptomTiming(answers: EngineAnswers): FoodSymptomSignal[] {
    const signals: FoodSymptomSignal[] = [];
    const clinicalText = Object.values(answers.clinicalAnswers).flat().join(' ');
    const pathway = answers.pathwayId;

    // Digestive pathway with food triggers
    if (pathway === 'digestion' && clinicalText.includes('بعد الأكل')) {
        signals.push({
            signal: 'الأعراض تظهر بعد الأكل مباشرة — مؤشر قوي على حساسية غذائية',
            strength: 'strong',
            action: 'سجّل كل وجبة وراقب الأعراض بعدها — خاصة الممنوعات في نظام الطيبات',
        });
    }

    // Fatigue after meals
    if (pathway === 'fatigue' && clinicalText.includes('بعد الأكل')) {
        signals.push({
            signal: 'الإرهاق يشتد بعد الوجبات — مؤشر على خلل سكر الدم أو حساسية غذائية',
            strength: 'moderate',
            action: 'جرّب تقليل القمح والسكر لمدة ٣ أيام وراقب الفرق',
        });
    }

    // Headache with food timing
    if (pathway === 'headache' && (clinicalText.includes('جوع') || clinicalText.includes('جفاف'))) {
        signals.push({
            signal: 'الصداع مرتبط بالجوع أو الجفاف — مؤشر أيضي',
            strength: 'moderate',
            action: 'انتظم في الوجبات واشرب ٨ أكواب ماء يومياً',
        });
    }

    // General food-mood link
    if (answers.emotionalContext.includes('burnout') && clinicalText.includes('سكر')) {
        signals.push({
            signal: 'الإجهاد مع الشوق للسكر — مؤشر على خلل كورتيزول-سكر الدم',
            strength: 'moderate',
            action: 'قلل السكر الأبيض واستبدله بعسل — وراقب الطاقة خلال ٣ أيام',
        });
    }

    return signals;
}

/* ══════════════════════════════════════════════════════════
   REASSESSMENT TRIGGERS
   ══════════════════════════════════════════════════════════ */

function generateReassessmentTriggers(
    answers: EngineAnswers,
    triage: TriageResult,
    routing: RoutingResult,
): ReassessmentTrigger[] {
    const triggers: ReassessmentTrigger[] = [];

    // Time-based
    if (answers.duration === 'months') {
        triggers.push({
            condition: 'مرور ١٤ يوم على بدء الخطة',
            when: 'بعد أسبوعين',
            why: 'الأنماط المزمنة تحتاج وقتاً أطول لإظهار التحسن',
        });
    } else {
        triggers.push({
            condition: 'مرور ٧ أيام على بدء الخطة',
            when: 'بعد أسبوع',
            why: 'قياس فعالية التدخل الأول',
        });
    }

    // Symptom-based
    triggers.push({
        condition: 'تفاقم الأعراض بشكل ملحوظ',
        when: 'فوراً',
        why: 'التفاقم قد يشير لحاجة تغيير المسار أو مراجعة طبية',
    });

    // Completion-based
    triggers.push({
        condition: 'إكمال ٧٠% من الأدوات المقترحة',
        when: 'عند الإنجاز',
        why: 'تقييم الأثر بعد تطبيق المعظم',
    });

    // Nutrition-based
    triggers.push({
        condition: 'تحسن الالتزام الغذائي دون تحسن الأعراض',
        when: 'بعد ٥ أيام التزام',
        why: 'إذا التزمت بنظام الطيبات ولم تتحسن، قد يحتاج الأمر مراجعة أعمق',
    });

    return triggers;
}

/* ══════════════════════════════════════════════════════════
   RESULT-TO-ACTION PRECISION
   ══════════════════════════════════════════════════════════ */

function generateResultActions(
    answers: EngineAnswers,
    triage: TriageResult,
    routing: RoutingResult,
    timeline: SymptomTimeline,
): ResultAction[] {
    const actions: ResultAction[] = [];

    // Start today
    actions.push({
        type: 'start_today',
        text: routing.today_action,
        priority: 'high',
        rationale: 'أول خطوة مبنية على تحليل أعراضك',
    });

    // Nutrition action
    if (['digestion', 'fatigue', 'hormonal', 'immune', 'headache'].includes(answers.pathwayId)) {
        actions.push({
            type: 'start_today',
            text: 'سجّل وجباتك في نظام الطيبات اليوم — الغذاء مرتبط بأعراضك',
            priority: 'high',
            rationale: 'المسار الذي حددته مرتبط مباشرة بالتغذية',
        });
    }

    // Stop today (if relevant)
    if (answers.severity >= 7) {
        actions.push({
            type: 'stop_today',
            text: 'أوقف أي نشاط يُفاقم أعراضك — لا تتحمل ما يزيد الشدة',
            priority: 'high',
            rationale: 'الشدة مرتفعة — التقليل من المحفزات أولوية',
        });
    }

    // Monitor 3 days
    const monitorItems = routing.monitor_items || [];
    if (monitorItems.length > 0) {
        actions.push({
            type: 'monitor_3_days',
            text: `راقب: ${monitorItems.slice(0, 2).join('، ')} — لمدة ٣ أيام`,
            priority: 'medium',
            rationale: 'المراقبة تكشف الأنماط وتوجه الخطوة التالية',
        });
    }

    // Reassess when
    actions.push({
        type: 'reassess_when',
        text: timeline.duration === 'chronic'
            ? 'أعد التقييم بعد ١٤ يوم أو عند تغير ملحوظ'
            : 'أعد التقييم بعد ٧ أيام أو إذا تفاقمت الأعراض',
        priority: 'medium',
        rationale: 'إعادة التقييم تقيس فعالية التدخل',
    });

    // Next tool
    const firstTool = routing.recommended_tools[0];
    if (firstTool) {
        actions.push({
            type: 'next_tool',
            text: `الأداة التالية: "${firstTool.arabicName}" — ${firstTool.description}`,
            priority: 'medium',
            rationale: `تم اختيارها لأنها الأكثر صلة بنمط "${routing.primary_subdomain}"`,
        });
    }

    return actions;
}

/* ══════════════════════════════════════════════════════════
   SUSTAINING FACTORS
   ══════════════════════════════════════════════════════════ */

function identifySustainingFactors(
    answers: EngineAnswers,
    triage: TriageResult,
    routing: RoutingResult,
): string[] {
    const factors: string[] = [];

    if (answers.duration === 'months' || answers.duration === 'years') {
        factors.push('المدة الطويلة تشير لعامل مستمر يُغذي الأعراض');
    }

    if (answers.emotionalContext.some(e => ['work_stress', 'burnout', 'trauma'].includes(e))) {
        factors.push('الضغط النفسي المزمن يُبقي الجهاز العصبي في حالة تأهب');
    }

    if (['digestion', 'fatigue', 'hormonal'].includes(answers.pathwayId)) {
        factors.push('التغذية غير المناسبة قد تكون العامل الأساسي — مراجعة نظام الطيبات مطلوبة');
    }

    if (answers.severity >= 7 && answers.duration !== 'days') {
        factors.push('الشدة العالية مع الاستمرار تشير لنقص في التدخل المناسب');
    }

    if (triage.topFunctionalPattern !== 'none') {
        factors.push('النمط الوظيفي المحدد يشير لخلل بنيوي يحتاج تدخلاً موجهاً');
    }

    return factors;
}

/* ══════════════════════════════════════════════════════════
   TRACKING ITEMS
   ══════════════════════════════════════════════════════════ */

function generateTrackingItems(answers: EngineAnswers, routing: RoutingResult): string[] {
    const items: string[] = [];

    // Always track severity
    items.push('سجّل شدة الأعراض (١-١٠) كل يوم صباحاً ومساءً');

    // Monitor items from routing
    const monitors = routing.monitor_items || [];
    for (const m of monitors.slice(0, 2)) {
        items.push(m);
    }

    // Nutrition tracking for relevant pathways
    if (['digestion', 'fatigue', 'hormonal', 'immune', 'headache'].includes(answers.pathwayId)) {
        items.push('سجّل كل وجبة في نظام الطيبات ولاحظ أي أعراض بعدها');
    }

    // Sleep for relevant pathways
    if (['sleep', 'fatigue', 'anxiety'].includes(answers.pathwayId)) {
        items.push('سجّل وقت النوم والاستيقاظ وعدد مرات الاستيقاظ');
    }

    return items.slice(0, 5);
}

/* ══════════════════════════════════════════════════════════
   SYMPTOM CLUSTER DETECTION
   Detects clinically-meaningful multi-symptom patterns
   that carry deeper diagnostic significance than individual symptoms
   ══════════════════════════════════════════════════════════ */

interface ClusterDef {
    id: string;
    name: string;
    significance: string;
    /** All keywords that activate this cluster */
    signals: string[];
    /** Minimum number of signals required to activate */
    minMatch: number;
    /** Pathway restriction (if any) */
    pathways?: string[];
    /** Emotional context that strengthens the cluster */
    emotionalBoost?: string[];
}

const CLUSTER_DEFS: ClusterDef[] = [
    {
        id: 'adrenal_burnout_cluster',
        name: 'نمط استنزاف الكظرية المركّب',
        significance: 'تتداخل إشارات الإرهاق مع القلق واضطراب النوم — مؤشر كلاسيكي لاستنزاف محور الإجهاد (HPA Axis). هذا النمط يستجيب للراحة الموجّهة والأعشاب الأدابتوجينية والمغنيسيوم.',
        signals: ['إرهاق', 'تعب', 'منهك', 'كظرية', 'قلق', 'نوم', 'توتر', 'كافيين', 'استنزاف'],
        minMatch: 3,
        emotionalBoost: ['burnout', 'work_stress'],
    },
    {
        id: 'gut_brain_cluster',
        name: 'نمط محور الأمعاء-الدماغ',
        significance: 'تزامن الأعراض الهضمية مع إشارات نفسية يُشير لخلل في محور الأمعاء-الدماغ (Gut-Brain Axis). ٧٠٪ من السيروتونين يُنتج في الأمعاء — صحة الجهاز الهضمي والمزاج متلازمان.',
        signals: ['هضم', 'بطن', 'انتفاخ', 'قلق', 'كبت', 'إجبار', 'توتر', 'غثيان', 'إمساك', 'إسهال'],
        minMatch: 3,
        pathways: ['digestion', 'anxiety'],
        emotionalBoost: ['work_stress', 'fear'],
    },
    {
        id: 'inflammatory_fatigue_cluster',
        name: 'نمط الالتهاب-الإرهاق',
        significance: 'تزامن الإرهاق مع إشارات التهابية (ألم، تيبس، حساسية غذائية) يُشير لحمل التهابي صامت يستنزف الطاقة الخلوية. خفض الالتهاب الغذائي خطوة أولى منطقية.',
        signals: ['إرهاق', 'تعب', 'التهاب', 'ألم', 'تيبس', 'حساسية', 'مناعة', 'سكر', 'مصنّع'],
        minMatch: 3,
        pathways: ['fatigue', 'pain', 'immune'],
    },
    {
        id: 'psychosomatic_conversion',
        name: 'نمط التحويل النفس-جسدي',
        significance: 'الأعراض الجسدية تتحسن بالتعبير العاطفي وتسوء بالكبت — هذه آلية تحويل نفس-جسدي موثقة علمياً (Psychoneuroimmunology). العمل المزدوج جسدي + نفسي هو الأمثل.',
        signals: ['كبت', 'صمت', 'محبوس', 'عواطف', 'تتحسن', 'تعبير', 'إجبار', 'يخف بالاعتراف', 'نفس-جسدي'],
        minMatch: 2,
        emotionalBoost: ['trauma', 'grief', 'shame'],
    },
    {
        id: 'metabolic_chaos_cluster',
        name: 'نمط الخلل الأيضي المركّب',
        significance: 'تزامن هبوط الطاقة مع اشتياق السكر وضبابية ذهنية يُشير لخلل في تنظيم سكر الدم ومقاومة الأنسولين. تنظيم الوجبات والمكملات (كروميوم، ب-المركب) فعّال.',
        signals: ['سكر', 'أكل', 'طاقة', 'هبوط', 'ضبابية', 'وزن', 'أنسولين', 'درقية', 'أيض'],
        minMatch: 3,
        pathways: ['fatigue', 'hormonal'],
    },
    {
        id: 'sleep_anxiety_loop',
        name: 'حلقة القلق-الأرق',
        significance: 'القلق يمنع النوم، وقلة النوم تُفاقم القلق — حلقة مفرغة كلاسيكية. كسرها يبدأ بتقنيات الجهاز العصبي قبل النوم + خفض المنبهات.',
        signals: ['نوم', 'قلق', 'عقل نشط', 'شاشات', 'خفقان', 'أرق', 'استيقاظ', 'هلع', 'توتر'],
        minMatch: 3,
        pathways: ['sleep', 'anxiety'],
    },
    {
        id: 'existential_depletion',
        name: 'نمط الاستنزاف الوجودي',
        significance: 'فقدان المعنى مع الإرهاق الداخلي والانسحاب يُشير لأزمة وجودية تتجلى جسدياً. هذا النمط يستجيب للعمل على المعنى والغاية أكثر من التدخل الجسدي وحده.',
        signals: ['معنى', 'هدف', 'فراغ', 'استنزاف', 'انسحاب', 'وحدة', 'انقطاع', 'ضياع', 'سكينة'],
        minMatch: 2,
        emotionalBoost: ['loneliness', 'disconnected', 'identity', 'grief'],
    },
];

function detectSymptomClusters(
    answers: EngineAnswers,
    triageResult: TriageResult,
): SymptomCluster[] {
    const clusters: SymptomCluster[] = [];
    const clinicalText = Object.values(answers.clinicalAnswers).flat().join(' ');
    const emotionalTags = new Set(answers.emotionalContext);

    for (const def of CLUSTER_DEFS) {
        // Skip if pathway restriction doesn't match
        if (def.pathways && !def.pathways.includes(answers.pathwayId)) continue;

        // Count matching signals
        const matchedSignals: string[] = [];
        for (const sig of def.signals) {
            if (clinicalText.includes(sig)) {
                matchedSignals.push(sig);
            }
        }

        // Emotional boost: each matching emotional tag counts as a signal
        let emotionalMatches = 0;
        if (def.emotionalBoost) {
            for (const emo of def.emotionalBoost) {
                if (emotionalTags.has(emo)) {
                    emotionalMatches++;
                    matchedSignals.push(`[عاطفي: ${emo}]`);
                }
            }
        }

        const totalMatches = matchedSignals.length;
        if (totalMatches >= def.minMatch) {
            // Confidence: based on match ratio + severity + duration
            let confidence = Math.round((totalMatches / def.signals.length) * 70);
            if (answers.severity >= 7) confidence += 15;
            else if (answers.severity >= 4) confidence += 8;
            if (answers.duration === 'months') confidence += 15;
            else if (answers.duration === 'weeks') confidence += 8;
            confidence = Math.min(100, confidence);

            clusters.push({
                id: def.id,
                name: def.name,
                significance: def.significance,
                matchedSignals,
                confidence,
            });
        }
    }

    // Sort by confidence, cap at 3
    return clusters
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);
}