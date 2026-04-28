// lib/nutrition/tayyibat-engine.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Tayyibat Analysis Engine
// ════════════════════════════════════════════════════════════════════════
//
// Classifies food items, analyzes meals, detects violations,
// and correlates symptoms with dietary patterns.
//
// Classification rule:
//   - Matches against allowed → 'allowed'
//   - Matches against forbidden → 'forbidden'
//   - No match → 'uncertain' (never auto-approved)
// ════════════════════════════════════════════════════════════════════════

import {
    TAYYIBAT_SOURCE,
    type FoodCategory,
    type MealTag,
    type TayyibatFoodItem,
    type TayyibatForbiddenItem,
} from './tayyibat-source';

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

export type FoodClassification = 'allowed' | 'forbidden' | 'uncertain';

export interface ClassificationResult {
    input: string;
    classification: FoodClassification;
    matchedItem?: string;
    category?: FoodCategory;
    reason?: string;
    confidence: number; // 0–1
}

export interface MealAnalysis {
    items: ClassificationResult[];
    violations: ClassificationResult[];
    allowed: ClassificationResult[];
    uncertain: ClassificationResult[];
    violationCount: number;
    adherenceRatio: number; // 0–1
    hasCriticalViolation: boolean;
}

export interface ViolationPattern {
    item: string;
    count: number;
    mealContexts: MealTag[];
    category: FoodCategory;
}

export interface SymptomFoodCorrelation {
    symptom: string;
    relatedFoods: string[];
    correlationStrength: 'strong' | 'moderate' | 'weak';
    suggestion: string;
}

/* ══════════════════════════════════════════════════════════
   FUZZY MATCHING ENGINE
   ══════════════════════════════════════════════════════════ */

/**
 * Normalizes Arabic text for fuzzy matching:
 * - Removes diacritics
 * - Normalizes alef variants
 * - Trims and lowercases
 */
function normalizeArabic(text: string): string {
    return text
        .replace(/[\u064B-\u065F\u0670]/g, '') // remove tashkeel
        .replace(/[أإآ]/g, 'ا')                 // normalize alef
        .replace(/ة/g, 'ه')                     // ta marbuta → ha
        .replace(/ى/g, 'ي')                     // alef maqsura → ya
        .trim()
        .toLowerCase();
}

/**
 * Checks if a user input fuzzy-matches a source item.
 * Returns confidence 0–1.
 */
function fuzzyMatch(input: string, source: string): number {
    const normInput  = normalizeArabic(input);
    const normSource = normalizeArabic(source);

    // Exact match
    if (normInput === normSource) return 1.0;

    // Input is contained in source or vice versa
    if (normSource.includes(normInput) || normInput.includes(normSource)) return 0.85;

    // Word overlap
    const inputWords  = normInput.split(/\s+/).filter(Boolean);
    const sourceWords = normSource.split(/\s+/).filter(Boolean);
    const overlap = inputWords.filter(w =>
        sourceWords.some(sw => sw.includes(w) || w.includes(sw))
    ).length;
    const overlapRatio = overlap / Math.max(inputWords.length, 1);
    if (overlapRatio >= 0.5) return 0.6 + (overlapRatio * 0.2);

    return 0;
}

/* ══════════════════════════════════════════════════════════
   FOOD CLASSIFICATION
   ══════════════════════════════════════════════════════════ */

/**
 * Classify a single food item against the Tayyibat source.
 *
 * Rule: If no clear match → 'uncertain'. NEVER auto-approve.
 */
export function classifyFoodItem(input: string): ClassificationResult {
    if (!input.trim()) {
        return { input, classification: 'uncertain', confidence: 0 };
    }

    // Check forbidden first (stricter)
    let bestForbiddenMatch = { score: 0, item: null as TayyibatForbiddenItem | null };
    for (const forbidden of [...TAYYIBAT_SOURCE.forbidden_primary, ...TAYYIBAT_SOURCE.forbidden_secondary]) {
        const score = fuzzyMatch(input, forbidden.item);
        if (score > bestForbiddenMatch.score) {
            bestForbiddenMatch = { score, item: forbidden };
        }
    }

    // Check allowed
    let bestAllowedMatch = { score: 0, item: null as TayyibatFoodItem | null };
    for (const allowed of TAYYIBAT_SOURCE.allowed) {
        const score = fuzzyMatch(input, allowed.item);
        if (score > bestAllowedMatch.score) {
            bestAllowedMatch = { score, item: allowed };
        }
    }

    // Decision logic: forbidden takes priority when scores are close
    const THRESHOLD = 0.55;

    if (bestForbiddenMatch.score >= THRESHOLD && bestForbiddenMatch.item) {
        // Forbidden match found
        if (bestAllowedMatch.score > bestForbiddenMatch.score + 0.15) {
            // Allowed is significantly better match
            return {
                input,
                classification: 'allowed',
                matchedItem: bestAllowedMatch.item!.item,
                category: bestAllowedMatch.item!.category,
                confidence: bestAllowedMatch.score,
            };
        }
        return {
            input,
            classification: 'forbidden',
            matchedItem: bestForbiddenMatch.item.item,
            category: bestForbiddenMatch.item.category,
            reason: bestForbiddenMatch.item.reason,
            confidence: bestForbiddenMatch.score,
        };
    }

    if (bestAllowedMatch.score >= THRESHOLD && bestAllowedMatch.item) {
        return {
            input,
            classification: 'allowed',
            matchedItem: bestAllowedMatch.item.item,
            category: bestAllowedMatch.item.category,
            confidence: bestAllowedMatch.score,
        };
    }

    // No confident match → uncertain
    return {
        input,
        classification: 'uncertain',
        confidence: Math.max(bestAllowedMatch.score, bestForbiddenMatch.score),
    };
}

/* ══════════════════════════════════════════════════════════
   MEAL ANALYSIS
   ══════════════════════════════════════════════════════════ */

/**
 * Analyze a complete meal — classifies each item and detects violations.
 */
export function analyzeMeal(rawItems: string[]): MealAnalysis {
    const items = rawItems
        .map(raw => raw.trim())
        .filter(Boolean)
        .map(classifyFoodItem);

    const violations = items.filter(i => i.classification === 'forbidden');
    const allowed    = items.filter(i => i.classification === 'allowed');
    const uncertain  = items.filter(i => i.classification === 'uncertain');

    const total = items.length || 1;
    const adherenceRatio = allowed.length / total;

    // Critical violations: dairy, eggs, or medication
    const criticalCategories: FoodCategory[] = ['dairy', 'protein_other', 'medication'];
    const hasCriticalViolation = violations.some(v =>
        v.category && criticalCategories.includes(v.category)
    );

    return {
        items,
        violations,
        allowed,
        uncertain,
        violationCount: violations.length,
        adherenceRatio,
        hasCriticalViolation,
    };
}

/* ══════════════════════════════════════════════════════════
   VIOLATION PATTERN DETECTION
   ══════════════════════════════════════════════════════════ */

export interface MealLogEntry {
    date: string;
    mealTag: MealTag;
    items: string[];
}

/**
 * Detect repeated violation patterns across meal logs.
 */
export function detectRepeatedViolations(logs: MealLogEntry[]): ViolationPattern[] {
    const violationMap: Record<string, ViolationPattern> = {};

    for (const log of logs) {
        for (const itemStr of log.items) {
            const result = classifyFoodItem(itemStr);
            if (result.classification === 'forbidden' && result.matchedItem) {
                const key = normalizeArabic(result.matchedItem);
                if (!violationMap[key]) {
                    violationMap[key] = {
                        item: result.matchedItem,
                        count: 0,
                        mealContexts: [],
                        category: result.category || 'other',
                    };
                }
                violationMap[key].count++;
                if (!violationMap[key].mealContexts.includes(log.mealTag)) {
                    violationMap[key].mealContexts.push(log.mealTag);
                }
            }
        }
    }

    return Object.values(violationMap)
        .filter(v => v.count >= 2)
        .sort((a, b) => b.count - a.count);
}

/* ══════════════════════════════════════════════════════════
   HIDDEN NON-ADHERENCE DETECTION
   ══════════════════════════════════════════════════════════ */

/**
 * Detect hidden non-adherence from assessment answers.
 * Looks for signals that the user may not be fully adherent.
 */
export function detectHiddenNonAdherence(answers: Record<string, string>): {
    detected: boolean;
    signals: string[];
    severity: 'mild' | 'moderate' | 'significant';
} {
    const signals: string[] = [];

    // Check if user mentions dairy-related items
    const allAnswerText = Object.values(answers).join(' ');
    const dairyKeywords = ['لبن', 'زبادي', 'حليب', 'يوغرت', 'رايب', 'قريش', 'جبنه بيضا', 'جبنة بيضاء'];
    const eggKeywords   = ['بيض', 'اومليت', 'أومليت', 'بيضه', 'بيضة'];
    const breadKeywords = ['عيش بلدي', 'خبز', 'فينو', 'شامي', 'صامولي'];
    const grainKeywords = ['مكرونه', 'مكرونة', 'باستا', 'شعريه', 'شعرية', 'كسكسي', 'برغل'];

    for (const kw of dairyKeywords) {
        if (allAnswerText.includes(kw)) signals.push(`ذكر "${kw}" — ممنوع في نظام الطيبات`);
    }
    for (const kw of eggKeywords) {
        if (allAnswerText.includes(kw)) signals.push(`ذكر "${kw}" — ممنوع في نظام الطيبات`);
    }
    for (const kw of breadKeywords) {
        if (allAnswerText.includes(kw)) signals.push(`ذكر "${kw}" — الخبز الوحيد المسموح هو توست الردة`);
    }
    for (const kw of grainKeywords) {
        if (allAnswerText.includes(kw)) signals.push(`ذكر "${kw}" — ممنوع (منتج قمح/ذرة)`);
    }

    const detected = signals.length > 0;
    let severity: 'mild' | 'moderate' | 'significant' = 'mild';
    if (signals.length >= 3) severity = 'significant';
    else if (signals.length >= 1) severity = 'moderate';

    return { detected, signals, severity };
}

/* ══════════════════════════════════════════════════════════
   SYMPTOM–FOOD CORRELATION
   ══════════════════════════════════════════════════════════ */

/** Known correlations between forbidden foods and symptom domains. */
const FOOD_SYMPTOM_CORRELATIONS: Array<{
    categories: FoodCategory[];
    symptoms: string[];
    suggestion: string;
}> = [
    {
        categories: ['dairy'],
        symptoms: ['انتفاخ', 'غازات', 'مغص', 'إسهال', 'إمساك', 'حموضة', 'ارتجاع', 'تقلصات'],
        suggestion: 'الألبان من أكثر الممنوعات تأثيراً على الجهاز الهضمي — إزالتها قد تُحسّن الأعراض بشكل ملحوظ',
    },
    {
        categories: ['protein_other'], // eggs
        symptoms: ['حساسية', 'طفح', 'انتفاخ', 'غثيان', 'صداع'],
        suggestion: 'البيض يمكن أن يكون مثيراً صامتاً للالتهاب — التوقف عنه قد يخفف الأعراض',
    },
    {
        categories: ['grains'],
        symptoms: ['انتفاخ', 'تعب', 'ضبابية', 'صداع', 'إمساك', 'ألم مفاصل'],
        suggestion: 'القمح والذرة قد يسببان التهاباً مزمناً — البديل: أرز وفريك',
    },
    {
        categories: ['medication'],
        symptoms: ['حموضة', 'ارتجاع', 'ألم معدة'],
        suggestion: 'أدوية الحموضة قد تخفي المشكلة الحقيقية — نظام الطيبات يعالج السبب الجذري',
    },
    {
        categories: ['fats'],
        symptoms: ['غثيان', 'ثقل', 'عسر هضم'],
        suggestion: 'الزيوت الصناعية تُرهق الجهاز الهضمي — استخدم زيت زيتون أو سمنة بلدي فقط',
    },
];

/**
 * Correlate reported symptoms with forbidden food consumption.
 */
export function correlateSymptomWithFood(
    reportedSymptoms: string[],
    violatedCategories: FoodCategory[],
): SymptomFoodCorrelation[] {
    const results: SymptomFoodCorrelation[] = [];

    for (const corr of FOOD_SYMPTOM_CORRELATIONS) {
        const categoryMatch = corr.categories.some(c => violatedCategories.includes(c));
        if (!categoryMatch) continue;

        const matchingSymptoms = reportedSymptoms.filter(s =>
            corr.symptoms.some(cs => s.includes(cs) || cs.includes(s))
        );

        if (matchingSymptoms.length > 0) {
            results.push({
                symptom: matchingSymptoms.join('، '),
                relatedFoods: corr.categories.map(c => {
                    const forbidden = TAYYIBAT_SOURCE.forbidden_primary.filter(f => f.category === c);
                    return forbidden.map(f => f.item);
                }).flat(),
                correlationStrength: matchingSymptoms.length >= 3 ? 'strong'
                    : matchingSymptoms.length >= 2 ? 'moderate' : 'weak',
                suggestion: corr.suggestion,
            });
        }
    }

    return results;
}

/* ══════════════════════════════════════════════════════════
   SUBSTITUTION SUGGESTIONS
   ══════════════════════════════════════════════════════════ */

/** Common substitution map: forbidden → allowed alternatives */
const SUBSTITUTION_MAP: Record<string, string[]> = {
    'البيض': ['فول', 'جبنة شيدر', 'لانشون', 'تونة'],
    'اللبن': ['شاي', 'ينسون', 'كاكاو بالماء', 'عصير طازج'],
    'الزبادي': ['فاكهة طازجة', 'حلبة'],
    'العيش البلدي': ['توست بالردة (ريتش بيك)', 'أرز'],
    'المكرونة': ['أرز بكل أشكاله', 'بطاطس', 'فريك'],
    'الشوفان': ['فريك', 'أرز'],
    'الجبنة القريش': ['جبنة شيدر', 'جبنة رومي', 'جبنة مثلثات'],
    'الجبنة البيضاء': ['جبنة شيدر', 'جبنة رومي', 'جبنة فلمنك'],
    'السكر الأبيض': ['عسل أبيض', 'عسل أسود'],
    'المشروبات الغازية': ['عصير طازج', 'كركديه', 'ينسون', 'مياه'],
    'زيت الذرة': ['زيت زيتون', 'سمنة بلدي'],
    'زيت عباد الشمس': ['زيت زيتون', 'زبدة بلدي'],
};

/**
 * Get a substitute suggestion for a violated item.
 */
export function getSubstituteSuggestion(violatedItem: string): string[] {
    const norm = normalizeArabic(violatedItem);
    for (const [key, subs] of Object.entries(SUBSTITUTION_MAP)) {
        if (fuzzyMatch(violatedItem, key) >= 0.55 || normalizeArabic(key).includes(norm) || norm.includes(normalizeArabic(key))) {
            return subs;
        }
    }
    return [];
}
