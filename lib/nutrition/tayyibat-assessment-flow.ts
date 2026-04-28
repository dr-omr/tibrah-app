// lib/nutrition/tayyibat-assessment-flow.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Tayyibat Assessment Flow (Gated Mandatory + Conditional Deep)
// ════════════════════════════════════════════════════════════════════════
//
// Decision tree:
//   1. MANDATORY gate (2 questions — everyone answers):
//      - "Do you know/follow the Tayyibat system?"
//      - "How adherent are you?"
//
//   2. CONDITIONAL deep sub-flow activates when:
//      a) User says they follow it fully or partially, OR
//      b) Selected pathway has strong food-body relevance
//         (digestive, inflammatory, hormonal, fatigue, skin)
//
//   3. Otherwise: keep flow light — only record gate answers
// ════════════════════════════════════════════════════════════════════════

import { classifyFoodItem as classifyFoodItemLocal } from './tayyibat-engine';

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

export type TayyibatKnowledgeLevel = 'yes_following' | 'yes_partial' | 'know_not_following' | 'dont_know';
export type TayyibatAdherenceLevel = 'full' | 'partial' | 'inconsistent' | 'not_following' | 'unknown';

export interface TayyibatQuestion {
    id: string;
    text: string;
    type: 'single' | 'text' | 'multi';
    options?: Array<{ id: string; label: string; emoji?: string }>;
    /** Which phase: 'gate' (mandatory) or 'deep' (conditional) */
    phase: 'gate' | 'deep';
    /** Help text */
    hint?: string;
}

export interface TayyibatAssessmentResult {
    /** Gate answers */
    knowledgeLevel: TayyibatKnowledgeLevel;
    adherenceLevel: TayyibatAdherenceLevel;
    /** Whether deep sub-flow was triggered */
    deepFlowTriggered: boolean;
    /** Deep flow answers (empty if not triggered) */
    mealAnswers: Record<string, string>;
    /** Violations detected from meal answers */
    detectedViolations: string[];
    /** Symptom-food links detected */
    symptomFoodLinks: string[];
    /** Overall food-relevance signal */
    foodRelevanceScore: number; // 0–10
}

/* ══════════════════════════════════════════════════════════
   GATE QUESTIONS (MANDATORY — 2 questions for everyone)
   ══════════════════════════════════════════════════════════ */

export const TAYYIBAT_GATE_QUESTIONS: TayyibatQuestion[] = [
    {
        id: 'tay_know',
        text: 'هل تعرف نظام الطيبات الغذائي أو تتبعه؟',
        type: 'single',
        phase: 'gate',
        hint: 'نظام الطيبات هو نظام غذائي يحدد الأطعمة المسموحة والممنوعة بناءً على أسس صحية',
        options: [
            { id: 'yes_following',      label: 'نعم، أتبعه حالياً',       emoji: '✅' },
            { id: 'yes_partial',        label: 'أعرفه وألتزم جزئياً',    emoji: '🟡' },
            { id: 'know_not_following', label: 'أعرفه لكن لا ألتزم',     emoji: '🔶' },
            { id: 'dont_know',          label: 'لا أعرفه',               emoji: '❓' },
        ],
    },
    {
        id: 'tay_level',
        text: 'ما مستوى التزامك بنظام الطيبات؟',
        type: 'single',
        phase: 'gate',
        options: [
            { id: 'full',          label: 'التزام كامل — حرفي',          emoji: '💯' },
            { id: 'partial',       label: 'التزام جزئي — أغلب الوقت',   emoji: '🟡' },
            { id: 'inconsistent',  label: 'متقطع — أيام التزام وأيام لا', emoji: '🔄' },
            { id: 'not_following', label: 'غير ملتزم حالياً',            emoji: '⚪' },
            { id: 'unknown',       label: 'لا أعرف النظام',             emoji: '❓' },
        ],
    },
];

/* ══════════════════════════════════════════════════════════
   DEEP FLOW QUESTIONS (CONDITIONAL — meal-by-meal + habits)
   ══════════════════════════════════════════════════════════ */

export const TAYYIBAT_DEEP_QUESTIONS: TayyibatQuestion[] = [
    {
        id: 'tay_since',
        text: 'من متى بدأت نظام الطيبات؟',
        type: 'single',
        phase: 'deep',
        options: [
            { id: 'less_week',   label: 'أقل من أسبوع',    emoji: '🌱' },
            { id: 'weeks',       label: 'أسابيع',          emoji: '🌿' },
            { id: 'months',      label: 'أشهر',            emoji: '🌳' },
            { id: 'year_plus',   label: 'سنة أو أكثر',     emoji: '🏔️' },
        ],
    },
    {
        id: 'tay_breakfast',
        text: 'ماذا تتناول في الفطور عادةً؟',
        type: 'text',
        phase: 'deep',
        hint: 'اكتب ما تأكله صباحاً — مثال: توست بالردة مع جبنة شيدر وشاي',
    },
    {
        id: 'tay_snack1',
        text: 'ماذا تتناول كتصبيرة صباحية؟',
        type: 'text',
        phase: 'deep',
        hint: 'مثال: فاكهة، مكسرات، شوكولاتة...',
    },
    {
        id: 'tay_lunch',
        text: 'ماذا تتناول في الغداء عادةً؟',
        type: 'text',
        phase: 'deep',
        hint: 'مثال: أرز مع فراخ وسلطة',
    },
    {
        id: 'tay_snack2',
        text: 'ماذا تتناول في العصر / تصبيرة المساء؟',
        type: 'text',
        phase: 'deep',
        hint: 'مثال: شيبسي، فاكهة، حلاوة...',
    },
    {
        id: 'tay_dinner',
        text: 'ماذا تتناول في العشاء عادةً؟',
        type: 'text',
        phase: 'deep',
        hint: 'مثال: فول مع توست بالردة',
    },
    {
        id: 'tay_drinks',
        text: 'ماذا تشرب خلال اليوم؟',
        type: 'text',
        phase: 'deep',
        hint: 'مثال: شاي، قهوة، مياه، عصير...',
    },
    {
        id: 'tay_repeat_violation',
        text: 'هل توجد أطعمة ممنوعة تتكرر في يومك رغم معرفتك بأنها ممنوعة؟',
        type: 'text',
        phase: 'deep',
        hint: 'مثال: "أحياناً آكل بيض" أو "أشرب لبن أحياناً"',
    },
    {
        id: 'tay_symptom_food',
        text: 'هل لاحظت أعراضاً تزيد بعد أطعمة معينة؟',
        type: 'text',
        phase: 'deep',
        hint: 'مثال: "انتفاخ بعد الأكل" أو "صداع بعد اللبن"',
    },
    {
        id: 'tay_literal',
        text: 'هل تلتزم بالمسموح حرفياً أم تستبدل من عندك؟',
        type: 'single',
        phase: 'deep',
        options: [
            { id: 'literal',    label: 'ألتزم حرفياً بالمسموح',       emoji: '📋' },
            { id: 'substitute', label: 'أستبدل أحياناً من عندي',      emoji: '🔄' },
            { id: 'flexible',   label: 'مرن جداً — آكل ما أريد غالباً', emoji: '🤷' },
        ],
    },
    {
        id: 'tay_hardest',
        text: 'ما أكثر بند صعب عليك الالتزام به؟',
        type: 'text',
        phase: 'deep',
        hint: 'مثال: "ترك البيض" أو "ترك العيش البلدي"',
    },
];

/* ══════════════════════════════════════════════════════════
   FLOW CONTROL — Should Deep Flow Activate?
   ══════════════════════════════════════════════════════════ */

/** Pathways that have strong food-body relevance (trigger deep flow). */
const FOOD_RELEVANT_PATHWAYS = [
    'digestive',    // هضمي
    'hormonal',     // هرموني
    'inflammatory', // التهابي
    'fatigue',      // إرهاق
    'skin',         // جلدي
    'autoimmune',   // مناعة ذاتية
    'metabolic',    // أيض
    'headache',     // صداع
    'joint_pain',   // مفاصل
    'allergy',      // حساسية
];

/** Symptom keywords that suggest food relevance. */
const FOOD_RELEVANT_SYMPTOM_KEYWORDS = [
    'انتفاخ', 'غازات', 'مغص', 'إسهال', 'إمساك',
    'حموضة', 'ارتجاع', 'غثيان', 'حكة', 'طفح',
    'صداع بعد الأكل', 'تعب بعد الأكل', 'ثقل',
    'حساسية', 'حرقان معدة', 'ألم بطن',
];

/**
 * Determine if the deep Tayyibat sub-flow should activate.
 *
 * Rules:
 * 1. User says they follow it (fully or partially) → YES
 * 2. Pathway is food-relevant → YES
 * 3. Clinical answers contain food-relevant symptoms → YES
 * 4. Otherwise → NO (keep flow light)
 */
export function shouldTriggerDeepFlow(
    gateKnowledge: TayyibatKnowledgeLevel,
    gateAdherence: TayyibatAdherenceLevel,
    pathwayId: string,
    clinicalAnswers: Record<string, unknown>,
): boolean {
    // Rule 1: User follows the system
    if (gateKnowledge === 'yes_following' || gateKnowledge === 'yes_partial') {
        return true;
    }
    if (gateAdherence === 'full' || gateAdherence === 'partial' || gateAdherence === 'inconsistent') {
        return true;
    }

    // Rule 2: Food-relevant pathway
    if (FOOD_RELEVANT_PATHWAYS.includes(pathwayId)) {
        return true;
    }

    // Rule 3: Food-relevant symptoms in clinical answers
    const allAnswerText = Object.values(clinicalAnswers)
        .map(v => Array.isArray(v) ? v.join(' ') : String(v || ''))
        .join(' ');

    for (const keyword of FOOD_RELEVANT_SYMPTOM_KEYWORDS) {
        if (allAnswerText.includes(keyword)) {
            return true;
        }
    }

    return false;
}

/* ══════════════════════════════════════════════════════════
   RESULT ASSEMBLY
   ══════════════════════════════════════════════════════════ */

/**
 * Assemble the Tayyibat assessment result from all collected answers.
 * This is called after the flow completes to produce a structured result.
 */
export function assembleTayyibatResult(
    gateAnswers: Record<string, string>,
    deepAnswers: Record<string, string>,
    deepFlowTriggered: boolean,
): TayyibatAssessmentResult {
    const knowledgeLevel = (gateAnswers['tay_know'] || 'dont_know') as TayyibatKnowledgeLevel;
    const adherenceLevel = (gateAnswers['tay_level'] || 'unknown') as TayyibatAdherenceLevel;

    // Detect violations from meal text answers
    const detectedViolations: string[] = [];
    const mealFields = ['tay_breakfast', 'tay_snack1', 'tay_lunch', 'tay_snack2', 'tay_dinner', 'tay_drinks'];

    for (const field of mealFields) {
        const text = deepAnswers[field];
        if (!text) continue;
        // Split by common delimiters
        const items = text.split(/[،,\n\r]+/).map(s => s.trim()).filter(Boolean);
        for (const item of items) {
            const result = classifyFoodItemLocal(item);
            if (result.classification === 'forbidden' && result.matchedItem) {
                detectedViolations.push(result.matchedItem);
            }
        }
    }

    // Detect symptom-food links
    const symptomFoodLinks: string[] = [];
    const symptomFoodText = deepAnswers['tay_symptom_food'] || '';
    if (symptomFoodText.trim()) {
        symptomFoodLinks.push(symptomFoodText.trim());
    }
    const repeatViolationText = deepAnswers['tay_repeat_violation'] || '';
    if (repeatViolationText.trim()) {
        symptomFoodLinks.push(`مخالفات متكررة: ${repeatViolationText.trim()}`);
    }

    // Calculate food-relevance score (0–10)
    let foodRelevanceScore = 0;

    // Knowledge/adherence contribution
    if (knowledgeLevel === 'yes_following') foodRelevanceScore += 3;
    else if (knowledgeLevel === 'yes_partial') foodRelevanceScore += 2;
    else if (knowledgeLevel === 'know_not_following') foodRelevanceScore += 1;

    // Violations contribution
    foodRelevanceScore += Math.min(4, detectedViolations.length);

    // Symptom-food links contribution
    if (symptomFoodText.trim()) foodRelevanceScore += 2;
    if (repeatViolationText.trim()) foodRelevanceScore += 1;

    foodRelevanceScore = Math.min(10, foodRelevanceScore);

    return {
        knowledgeLevel,
        adherenceLevel,
        deepFlowTriggered,
        mealAnswers: deepAnswers,
        detectedViolations: [...new Set(detectedViolations)],
        symptomFoodLinks,
        foodRelevanceScore,
    };
}

/* ══════════════════════════════════════════════════════════
   ALL QUESTIONS (for iteration)
   ══════════════════════════════════════════════════════════ */

export function getGateQuestions(): TayyibatQuestion[] {
    return TAYYIBAT_GATE_QUESTIONS;
}

export function getDeepQuestions(): TayyibatQuestion[] {
    return TAYYIBAT_DEEP_QUESTIONS;
}

export function getAllQuestions(): TayyibatQuestion[] {
    return [...TAYYIBAT_GATE_QUESTIONS, ...TAYYIBAT_DEEP_QUESTIONS];
}
