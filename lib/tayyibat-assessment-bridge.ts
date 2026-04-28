// lib/tayyibat-assessment-bridge.ts
// ════════════════════════════════════════════════════════════════
// TIBRAH — Tayyibat ↔ Assessment Bridge (v2)
// ════════════════════════════════════════════════════════════════
// v2 upgrades:
//  - Integrates 6-pattern clinical engine (digestive_burden, sugar_dependency,
//    inflammatory_load, rhythm_disruption, low_readiness, medical_review_first)
//  - Adds confidence scoring (answer coverage + tracker data)
//  - Adds contradiction detection
//  - Adds formal attribution to Dr. Diaa Al-Awadi
//  - Safety gating: red flags suppress lifestyle protocol CTAs
//  - Adaptive relevance: short card if no food signals, full card if signals present
// ════════════════════════════════════════════════════════════════

import type { EngineAnswers, TriageResult, RoutingResult } from '@/components/health-engine/types';
import { TAYYIBAT_SOURCE } from '@/lib/nutrition/tayyibat-source';
import { detectHiddenNonAdherence, correlateSymptomWithFood } from '@/lib/nutrition/tayyibat-engine';
import type { FoodCategory } from '@/lib/nutrition/tayyibat-source';
import { detectPatterns, computeConfidence, detectContradictions, PATTERN_DESCRIPTIONS } from '@/lib/tayyibat/pattern-engine';
import { getMealLogs } from '@/lib/tayyibat/tayyibat-store';
import { TAYYIBAT_ATTRIBUTION } from '@/lib/tayyibat/attribution';
import type { ClinicalPattern } from '@/lib/tayyibat/pattern-engine';

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

export interface TayyibatAssessmentVerdict {
    /** Whether this assessment has any Tayyibat relevance */
    isRelevant: boolean;
    /** Overall adherence signal (legacy) */
    adherenceSignal: 'good' | 'warning' | 'critical' | 'unknown';
    /** Detected forbidden items mentioned in answers */
    detectedViolations: string[];
    /** Symptom-food correlations found */
    symptomFoodLinks: Array<{
        symptom: string;
        suspectedFood: string;
        suggestion: string;
        strength: 'strong' | 'moderate' | 'weak';
    }>;
    /** Specific Tayyibat recommendations based on pathway */
    pathwayRecommendations: string[];
    /** Priority special notes relevant to this case */
    relevantNotes: string[];
    /** Substitution suggestions */
    substitutions: Array<{ forbidden: string; alternatives: string[] }>;
    /** Summary sentence for the result card */
    summaryArabic: string;

    // ── v2: Pattern Engine fields ──────────────────────────
    /** Primary clinical-nutrition pattern */
    primaryPattern:       ClinicalPattern | null;
    /** Primary pattern human-readable label */
    primaryPatternLabel:  string;
    /** Secondary patterns */
    secondaryPatterns:    ClinicalPattern[];
    /** Result confidence 0–100 */
    confidenceScore:      number;
    confidenceLabel:      'low' | 'medium' | 'high';
    confidenceNote:       string;
    /** Contradiction notes (gentle language) */
    contradictionNotes:   string[];
    /** Safety gate active (red flags override lifestyle CTAs) */
    safetyGated:          boolean;
    /** Medical review level: none | recommended | required_first */
    medicalReviewLevel:   'none' | 'recommended' | 'required_first';
    /** Medical review reason (shown when recommended or required_first) */
    medicalReviewReason:  string | null;
    /** Top 3 food/lifestyle gaps from scoring engine */
    topGaps:              string[];
    /** One primary action for today */
    firstStepToday:       string | null;
    /** Whether meal tracker data was used to compute confidence */
    mealLogCountUsed:     number;
    /** Attribution string for display */
    attributionShort:     string;
    /**
     * Educational-only mode (Phase 3).
     * True when user selected "لا أعرفه" / 'none' for Tayyibat knowledge
     * and has no food-symptom signals. Card shows intro only — no score ring,
     * no adherence badge, no "ممتاز".
     */
    isEducationalOnly?:   boolean;
}

/* ══════════════════════════════════════════════════════════
   PATHWAY → FOOD CATEGORY RELEVANCE MAP
   ══════════════════════════════════════════════════════════ */

const PATHWAY_FOOD_RELEVANCE: Record<string, {
    categories: FoodCategory[];
    keywords: string[];
    recommendations: string[];
}> = {
    digestion: {
        categories: ['dairy', 'grains', 'protein_other', 'medication'],
        keywords: ['انتفاخ', 'حرقة', 'ارتجاع', 'إمساك', 'إسهال', 'غازات', 'مغص', 'غثيان', 'حموضة'],
        recommendations: [
            'إزالة الألبان والبيض قد تُحسّن أعراض الجهاز الهضمي بشكل ملحوظ خلال أسبوعين',
            'أدوية الحموضة ممنوعة في نظام الطيبات — معالجة السبب الجذري أولى',
            'القمح والذرة من أكثر المسببات الصامتة للانتفاخ — البديل: أرز وفريك',
        ],
    },
    fatigue: {
        categories: ['grains', 'sweets', 'fats'],
        keywords: ['تعب', 'إرهاق', 'طاقة', 'خمول', 'ضبابية'],
        recommendations: [
            'السكر الأبيض يسبب ارتفاعاً مؤقتاً ثم انهياراً في الطاقة — استخدم عسل أبيض أو أسود',
            'الزيوت الصناعية تُرهق الجسم — الدهون الطبيعية (زيت زيتون، سمنة بلدي) أفضل للطاقة',
            'القمح قد يسبب ضبابية ذهنية وتعب — جرّب الأرز والفريك لمدة أسبوع',
        ],
    },
    headache: {
        categories: ['dairy', 'grains', 'protein_other'],
        keywords: ['صداع', 'شقيقة', 'نبضات', 'ضغط'],
        recommendations: [
            'البيض والألبان من المحفزات الصامتة للصداع — حذفها قد يقلل التكرار',
            'القمح يرتبط بالصداع الالتهابي — جرّب حذفه لمدة ١٠ أيام',
        ],
    },
    sleep: {
        categories: ['drinks', 'sweets'],
        keywords: ['أرق', 'نوم', 'استيقاظ', 'ليلي'],
        recommendations: [
            'المشروبات الغازية والسكر الأبيض يعطلان إيقاع النوم — تجنبهما بعد الظهر',
            'الأعشاب المسموحة (ينسون، حلبة، كركديه) تدعم النوم الطبيعي',
        ],
    },
    anxiety: {
        categories: ['drinks', 'sweets', 'grains'],
        keywords: ['قلق', 'توتر', 'خفقان', 'هلع'],
        recommendations: [
            'السكر الأبيض يسبب تقلبات في سكر الدم تُحاكي نوبات القلق',
            'الكافيين مسموح لكن باعتدال — المبالغة تزيد القلق',
        ],
    },
    pain: {
        categories: ['grains', 'fats', 'dairy'],
        keywords: ['ألم', 'التهاب', 'تيبس', 'مفاصل'],
        recommendations: [
            'القمح والزيوت الصناعية من أكبر مسببات الالتهاب الصامت',
            'زيت الزيتون والسمنة البلدي لهما خصائص مضادة للالتهاب',
            'الألبان قد تزيد الألم الالتهابي — جرّب حذفها',
        ],
    },
    hormonal: {
        categories: ['dairy', 'grains', 'fats'],
        keywords: ['هرمون', 'درقية', 'دورة', 'كورتيزول'],
        recommendations: [
            'الألبان التجارية تحتوي هرمونات قد تُربك جهازك الهرموني',
            'الزيوت الصناعية تؤثر على التوازن الهرموني — استبدلها بالطبيعي',
        ],
    },
    immune: {
        categories: ['dairy', 'grains', 'sweets'],
        keywords: ['مناعة', 'عدوى', 'حساسية', 'التهاب'],
        recommendations: [
            'السكر الأبيض يُضعف المناعة بشكل مباشر — العسل بديل مغذّي',
            'الألبان والقمح قد يسببان التهاباً مزمناً يُرهق الجهاز المناعي',
        ],
    },
};

/* ══════════════════════════════════════════════════════════
   MAIN ANALYSIS FUNCTION
   ══════════════════════════════════════════════════════════ */

export function analyzeTayyibatFromAssessment(
    answers: EngineAnswers,
    triageResult: TriageResult,
    routing: RoutingResult,
): TayyibatAssessmentVerdict {
    // ── Phase 3: Knowledge Guard ─────────────────────────────
    // The Tayyibat gate question is 'tay_know' with possible values:
    //   'yes_following' | 'yes_partial' | 'know_not_following' | 'dont_know'
    // When user selects 'dont_know' (لا أعرفه) AND has no food-symptom signals,
    // return an educational-only verdict — never show scores or "ممتاز".
    const knowledgeAnswer = answers.nutritionAnswers?.gateAnswers?.['tay_know']
        ?? answers.clinicalAnswers?.['tay_know']
        ?? '';
    const knowledgeLevel = String(knowledgeAnswer).toLowerCase();

    // Check for meaningful food signals in the clinical text
    const allClinicalText = Object.values(answers.clinicalAnswers)
        .map(v => Array.isArray(v) ? v.join(' ') : String(v ?? ''))
        .join(' ');
    const hasFoodSignals = [
        'انتفاخ', 'إمساك', 'ارتجاع', 'حموضة', 'إسهال',
        'تعب بعد الأكل', 'هبوط طاقة', 'رغبة في السكر', 'رغبة في الحلو',
        'غازات', 'هضم', 'وجبات سريعة', 'مقلي',
    ].some(kw => allClinicalText.includes(kw));

    // If user explicitly said "لا أعرفه" AND no food signals → educational card only
    const isCompletelyUnknown = knowledgeLevel === 'dont_know';
    if (isCompletelyUnknown && !hasFoodSignals) {
        return {
            isRelevant:            true,
            adherenceSignal:       'unknown',
            detectedViolations:    [],
            symptomFoodLinks:      [],
            pathwayRecommendations: [],
            relevantNotes:         [],
            substitutions:         [],
            summaryArabic:         'اخترت أنك لا تعرف نظام الطيبات بعد، لذلك لا نعرض درجة التزام أو حكمًا غذائيًا. هذه البطاقة تعطيك مدخلًا أوليًا وتساعد طِبرا على تحسين الدقة عندما تضيف بيانات غذائية لاحقًا.',
            primaryPattern:        null,
            primaryPatternLabel:   'رؤية تعريفية',
            secondaryPatterns:     [],
            confidenceScore:       15,
            confidenceLabel:       'low',
            confidenceNote:        'لا توجد بيانات كافية — المستخدم لا يعرف النظام بعد',
            contradictionNotes:    [],
            safetyGated:           false,
            medicalReviewLevel:    'none',
            medicalReviewReason:   null,
            topGaps:               ['تحتاج أولاً إلى فهم مبادئ الطيبات قبل تقييم الالتزام'],
            firstStepToday:        'ابدأ بمدخل بسيط: ما هو نظام الطيبات؟ — يمكنك استكشافه من قسم الطيبات.',
            mealLogCountUsed:      0,
            attributionShort:      TAYYIBAT_ATTRIBUTION.shortCredit,
            isEducationalOnly:     true,
        };
    }

    // Flatten all clinical answers to a single string for signal detection
    const flatAnswers: Record<string, string> = {};
    for (const [k, v] of Object.entries(answers.clinicalAnswers)) {
        flatAnswers[k] = Array.isArray(v) ? v.join(' ') : String(v);
    }
    const allText = [
        ...Object.values(flatAnswers),
        answers.freeText ?? '',
        answers.emotionalNote ?? '',
    ].join(' ');
    const pathway = answers.pathwayId;



    // 1. Detect hidden non-adherence from clinical answers
    const nonAdherence = detectHiddenNonAdherence(flatAnswers);

    // 2. Get pathway-specific food relevance
    const pathwayRelevance = PATHWAY_FOOD_RELEVANCE[pathway];
    const relevantCategories = pathwayRelevance?.categories ?? [];

    // 3. Extract symptoms mentioned in answers
    const symptoms = extractSymptoms(allText, pathwayRelevance?.keywords ?? []);

    // 4. Correlate symptoms with food
    const correlations = correlateSymptomWithFood(symptoms, relevantCategories);

    // 5. Build symptom-food links
    const symptomFoodLinks = correlations.map(c => ({
        symptom: c.symptom,
        suspectedFood: c.relatedFoods.slice(0, 2).join('، '),
        suggestion: c.suggestion,
        strength: c.correlationStrength,
    }));

    // 6. Get relevant special notes
    const relevantNotes = getRelevantNotes(pathway, symptoms);

    // 7. Build substitutions from violations
    const substitutions = buildSubstitutions(nonAdherence.signals);

    // 8. Determine adherence signal
    let adherenceSignal: TayyibatAssessmentVerdict['adherenceSignal'] = 'unknown';
    if (nonAdherence.detected) {
        adherenceSignal = nonAdherence.severity === 'significant' ? 'critical'
            : nonAdherence.severity === 'moderate' ? 'warning' : 'warning';
    } else if (symptomFoodLinks.length > 0) {
        adherenceSignal = 'warning';
    }

    // 9. Determine relevance — show card whenever the pathway has food relevance
    const isRelevant = nonAdherence.detected || symptomFoodLinks.length > 0
        || pathwayRelevance !== undefined;

    // 10. Build summary
    const summaryArabic = buildSummary(adherenceSignal, nonAdherence.signals.length, symptomFoodLinks.length, pathway);

    // ══ v2: Pattern Engine Integration ══
    // Build a lightweight TayyibatAnswers proxy from the clinical text signals
    const isUrgentTriage = triageResult.level === 'urgent' || triageResult.level === 'emergency';
    const tayyibatAnswerProxy = {
        ...buildTayyibatAnswersProxy(allText, pathway),
        // explicitRedFlagDetected يُعيَّن فقط عند triage urgent/emergency
        // أسئلة domain:'safety' يمكنها أيضاً تعيينه (يُمرَّر مستقبلاً)
        explicitRedFlagDetected: isUrgentTriage,
    };
    const patterns       = detectPatterns(tayyibatAnswerProxy);
    const mealLogs       = getMealLogs();
    const contras        = detectContradictions(tayyibatAnswerProxy, mealLogs);
    const conf           = computeConfidence(
        Object.keys(answers.clinicalAnswers).length, 20,
        mealLogs.length, contras
    );

    // Safety gate: ONLY when required_first (explicit red flag or urgent triage)
    const safetyGated = patterns.safetyGated; // already driven by explicitRedFlagDetected

    // Medical review level from pattern engine (already correct after proxy fix)
    const medicalReviewLevel  = patterns.medicalReviewLevel;
    const medicalReviewReason = patterns.medicalReviewReason;

    const primaryPattern = safetyGated ? 'medical_review_first' : patterns.primaryPattern;
    const patternDesc    = PATTERN_DESCRIPTIONS[primaryPattern];

    // First step — for required_first: medical CTA only, no diet push
    // for recommended: diet guidance is primary, medical note is secondary
    const firstStepToday = safetyGated
        ? 'راجع طبيباً قبل أي تغيير غذائي — الأولوية للتقييم الطبي أولاً.'
        : patternDesc.primaryRecommendation;

    // Top gaps from pattern scores
    const topGaps = buildTopGaps(pathway, patterns, symptomFoodLinks);

    // ── Determine if Tayyibat card should be shown at all ──
    const maxPatternScore = Math.max(...Object.values(patterns.patternScores)
        .filter((_, i) => i < 5)); // exclude medical_review_first
    const hasPathwayFoodRelevance = pathwayRelevance !== undefined;
    const isRelevantNow = nonAdherence.detected || symptomFoodLinks.length > 0
        || hasPathwayFoodRelevance || safetyGated
        || maxPatternScore >= 25;

    return {
        isRelevant:           isRelevantNow,
        adherenceSignal,
        detectedViolations:   nonAdherence.signals,
        symptomFoodLinks,
        pathwayRecommendations: safetyGated ? [] : (pathwayRelevance?.recommendations ?? []),
        relevantNotes,
        substitutions,
        summaryArabic,
        // v2 fields
        primaryPattern,
        primaryPatternLabel:  patternDesc.label,
        secondaryPatterns:    safetyGated ? [] : patterns.secondaryPatterns,
        confidenceScore:      conf.score,
        confidenceLabel:      conf.label,
        confidenceNote:       conf.explanation,
        contradictionNotes:   contras.notes,
        safetyGated,
        medicalReviewLevel,
        medicalReviewReason,
        topGaps,
        firstStepToday,
        mealLogCountUsed:     mealLogs.length,
        attributionShort:     TAYYIBAT_ATTRIBUTION.shortCredit,
    };
}

/* ══════════════════════════════════════════════════════════
   v2 HELPERS
   ══════════════════════════════════════════════════════════ */

/** Map clinical text signals → TayyibatAnswers approximation for pattern engine */
function buildTayyibatAnswersProxy(allText: string, pathway: string): Parameters<typeof import('@/lib/tayyibat/pattern-engine').detectPatterns>[0] {
    const has = (kw: string) => allText.includes(kw);
    return {
        // Adherence proxies
        oilType:        has('زيت زيتون') ? 'olive_only' : has('زيت') ? 'mixed' : 'mixed',
        sugarLevel:     has('سكر أبيض') || has('حلويات') || has('غازية') ? 'daily' : has('سكر') ? 'weekly' : 'rare',
        proteinFreq:    has('لحم') || has('سمك') || has('دجاج') ? 'twice' : 'once',
        vegetableFreq:  has('خضار') || has('سلطة') ? 'daily' : 'few',
        processedFood:  has('وجبات سريعة') || has('مقلي') || has('شيبس') ? 'often' : 'rarely',
        mealTiming:     has('ليلي') || has('سهر') || has('متأخر') ? 'random' : has('منتظم') ? 'structured' : 'partial',
        // Digestive proxies
        bloatingFreq:   has('انتفاخ') ? (has('دائم') || has('كثير') ? 'often' : 'sometimes') : 'never',
        gasFreq:        has('غازات') || has('غاز') ? (has('دائم') ? 'often' : 'sometimes') : 'never',
        constipation:   has('إمساك') || has('إسهال') ? 'often' : 'never',
        acidReflux:     has('حموضة') || has('ارتجاع') || has('حرقة') ? 'sometimes' : 'never',
        // Energy proxies
        morningFatigue: has('إرهاق صباحي') || has('تعب عند الاستيقاظ') ? 'often' : has('تعب') ? 'sometimes' : 'never',
        postMealCrash:  has('تعب بعد الأكل') || has('نعاس بعد') ? 'often' : pathway === 'fatigue' ? 'sometimes' : 'never',
        sugarCraving:   has('رغبة في السكر') || has('شوق للحلو') ? 'strong' : has('سكر') ? 'mild' : 'none',
        afternoonSlump: has('تعب بعد الظهر') || has('كسل نهاري') ? 'often' : 'never',
        // Inflammation proxies
        jointPain:      has('ألم مفاصل') ? (has('شديد') ? 'severe' : 'moderate') : has('مفاصل') ? 'mild' : 'none',
        headacheFreq:   has('صداع') ? (has('يومي') || has('دائم') ? 'daily' : 'weekly') : 'never',
        skinIssues:     has('جلد') || has('حبوب') || has('حكة') ? 'moderate' : 'none',
        // Sleep/rhythm proxies
        sleepQuality:   has('أرق') || has('نوم سيئ') ? 'poor' : has('نوم') ? 'fair' : 'good',
        focusLevel:     has('ضبابية') || has('تركيز') ? 'fair' : 'good',
        // Readiness proxies
        knowledgeLevel: has('طيبات') ? 'basic' : 'little',
        currentLevel:   has('ملتزم') ? 'partial' : 'none',
        biggestChallenge: '',
    };
}

/** Derive top 3 gaps from pattern + symptom signals */
function buildTopGaps(
    pathway:       string,
    patterns:      ReturnType<typeof import('@/lib/tayyibat/pattern-engine').detectPatterns>,
    symptomLinks:  Array<{ symptom: string }>,
): string[] {
    const gaps: string[] = [];
    const scores = patterns.patternScores;

    if (scores.digestive_burden >= 40)
        gaps.push('هضم مثقل — الانتفاخ أو الغازات قد ترتبط بما تأكله وليس فقط الإجهاد');
    if (scores.sugar_dependency >= 40)
        gaps.push('اعتماد على السكر/النشويات — قد يُفسّر هبوط الطاقة بعد الوجبات');
    if (scores.rhythm_disruption >= 40)
        gaps.push('توقيت وجبات مضطرب — الإيقاع المنتظم يُحسّن جودة أي نظام غذائي');
    if (scores.inflammatory_load >= 40)
        gaps.push('مؤشرات التهاب محتملة — مراجعة نوع الزيوت والأطعمة المصنّعة');
    if (scores.low_readiness >= 60)
        gaps.push('الاستعداد للتغيير يحتاج دعماً — ابدأ بتغيير واحد صغير ومستدام');

    // Add symptom-based gap if not already covered
    if (symptomLinks.length > 0 && gaps.length < 3) {
        gaps.push(`صلة بين أعراض (${symptomLinks[0].symptom}) وبعض الأطعمة — يستحق تتبعاً`);
    }

    return gaps.slice(0, 3);
}

/* ══════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════ */

function extractSymptoms(text: string, keywords: string[]): string[] {
    return keywords.filter(kw => text.includes(kw));
}

function getRelevantNotes(pathway: string, symptoms: string[]): string[] {
    const notes = TAYYIBAT_SOURCE.special_notes;
    const relevant: string[] = [];

    // Always include high-priority notes for digestive pathway
    if (pathway === 'digestion') {
        relevant.push(...notes.filter(n => n.priority === 'high').map(n => n.text));
    } else {
        // For other pathways, only include directly relevant notes
        const noteKeywords: Record<string, string[]> = {
            'لبن': ['dairy', 'hormonal', 'immune', 'pain'],
            'بيض': ['headache', 'immune'],
            'قمح': ['fatigue', 'headache', 'pain', 'digestion'],
            'حموضة': ['digestion'],
            'غازية': ['sleep', 'anxiety'],
        };

        for (const note of notes) {
            for (const [keyword, pathways] of Object.entries(noteKeywords)) {
                if (note.text.includes(keyword) && pathways.includes(pathway)) {
                    relevant.push(note.text);
                    break;
                }
            }
        }
    }

    return [...new Set(relevant)].slice(0, 4);
}

function buildSubstitutions(violations: string[]): Array<{ forbidden: string; alternatives: string[] }> {
    const SUBS: Record<string, string[]> = {
        'لبن': ['شاي', 'ينسون', 'كاكاو بالماء'],
        'زبادي': ['فاكهة طازجة', 'حلبة'],
        'حليب': ['شاي', 'عصير طازج'],
        'بيض': ['فول', 'جبنة شيدر', 'تونة'],
        'عيش': ['توست بالردة (ريتش بيك)'],
        'خبز': ['توست بالردة (ريتش بيك)', 'أرز'],
        'مكرون': ['أرز', 'بطاطس', 'فريك'],
    };

    const results: Array<{ forbidden: string; alternatives: string[] }> = [];
    for (const signal of violations) {
        for (const [key, alts] of Object.entries(SUBS)) {
            if (signal.includes(key)) {
                results.push({ forbidden: key, alternatives: alts });
                break;
            }
        }
    }
    return results.slice(0, 3);
}

function buildSummary(
    signal: TayyibatAssessmentVerdict['adherenceSignal'],
    violationCount: number,
    linkCount: number,
    pathway: string,
): string {
    if (signal === 'critical') {
        return `تم رصد ${violationCount} إشارة لأطعمة ممنوعة في نظام الطيبات قد تكون مرتبطة بأعراضك مباشرة`;
    }
    if (signal === 'warning') {
        if (linkCount > 0) {
            return `أعراضك قد تكون مرتبطة بأطعمة ممنوعة في نظام الطيبات — تعديل التغذية قد يُحدث فرقاً`;
        }
        return `رُصدت إشارات لأطعمة ممنوعة — مراجعة نظام الطيبات قد تُحسّن حالتك`;
    }
    if (PATHWAY_FOOD_RELEVANCE[pathway]) {
        return 'نظام الطيبات قد يدعم تحسّن أعراضك — راجع التوصيات الغذائية';
    }
    return '';
}

/* ══════════════════════════════════════════════════════════
   NUTRITIONAL DEFICIENCY DETECTOR
   ══════════════════════════════════════════════════════════ */

export interface NutritionalDeficiencySignal {
    nutrient: string;
    suspectedSymptoms: string[];
    tayyibatFix: string[];
    severity: 'likely' | 'possible' | 'watch';
}

const DEFICIENCY_SYMPTOM_MAP: Array<{
    nutrient: string;
    symptoms: string[];
    allowedFoods: string[];
    severity: 'likely' | 'possible' | 'watch';
}> = [
    {
        nutrient: 'فيتامين د',
        symptoms: ['تعب', 'ألم عظام', 'ضعف مناعة', 'كآبة', 'إرهاق صباحي'],
        allowedFoods: ['سمك بكل أنواعه', 'جمبري', 'كبدة', 'كل أنواع الفاكهة'],
        severity: 'likely',
    },
    {
        nutrient: 'حديد / فيريتين',
        symptoms: ['تعب', 'شحوب', 'دوخة', 'طنين', 'ضيق تنفس'],
        allowedFoods: ['لحمة حمراء بكل أشكالها', 'كبدة', 'فول', 'عدس', 'خضار ورقي'],
        severity: 'likely',
    },
    {
        nutrient: 'ماغنيسيوم',
        symptoms: ['تشنج', 'أرق', 'قلق', 'صداع', 'عضلات'],
        allowedFoods: ['كل أنواع المكسرات', 'فول', 'فاصوليا', 'بطاطا حلوة'],
        severity: 'possible',
    },
    {
        nutrient: 'أوميغا 3',
        symptoms: ['ضبابية ذهنية', 'التهاب', 'جفاف جلد', 'مزاج متقلب'],
        allowedFoods: ['سمك بكل أنواعه', 'جمبري', 'كاليماري', 'مكسرات'],
        severity: 'possible',
    },
    {
        nutrient: 'زنك',
        symptoms: ['ضعف مناعة', 'جروح بطيئة', 'فقدان شهية', 'شعر هش'],
        allowedFoods: ['لحمة حمراء', 'جمبري', 'كبدة', 'بقوليات', 'مكسرات'],
        severity: 'watch',
    },
    {
        nutrient: 'بوتاسيوم',
        symptoms: ['تشنج ساق', 'إرهاق عضلي', 'خفقان', 'ضعف عام'],
        allowedFoods: ['بطاطا حلوة', 'فاصوليا', 'كل أنواع الفاكهة', 'لوبيا'],
        severity: 'watch',
    },
];

export function detectNutritionalDeficiencies(
    answers: import('@/components/health-engine/types').EngineAnswers,
): NutritionalDeficiencySignal[] {
    const flatText = [
        ...Object.values(answers.clinicalAnswers).map(v =>
            Array.isArray(v) ? v.join(' ') : String(v)
        ),
        answers.freeText ?? '',
    ].join(' ');

    const signals: NutritionalDeficiencySignal[] = [];

    for (const entry of DEFICIENCY_SYMPTOM_MAP) {
        const matchedSymptoms = entry.symptoms.filter(s => flatText.includes(s));
        if (matchedSymptoms.length >= 2) {
            signals.push({
                nutrient: entry.nutrient,
                suspectedSymptoms: matchedSymptoms,
                tayyibatFix: entry.allowedFoods,
                severity: entry.severity,
            });
        } else if (matchedSymptoms.length === 1 && entry.severity === 'likely') {
            signals.push({
                nutrient: entry.nutrient,
                suspectedSymptoms: matchedSymptoms,
                tayyibatFix: entry.allowedFoods,
                severity: 'watch',
            });
        }
    }

    return signals.sort((a, b) => {
        const order = { likely: 0, possible: 1, watch: 2 };
        return order[a.severity] - order[b.severity];
    });
}

/* ══════════════════════════════════════════════════════════
   ANTI-INFLAMMATORY FOOD SCORE
   ══════════════════════════════════════════════════════════ */

export interface AntiInflammatoryScore {
    score: number;
    level: 'excellent' | 'good' | 'moderate' | 'poor';
    proInflammatoryFoods: string[];
    antiInflammatoryFoods: string[];
    guidance: string;
}

const ANTI_INFLAM_ALLOWED: string[] = [
    'زيت زيتون', 'سمك', 'جمبري', 'كاليماري',
    'خضار', 'فاكهة', 'مكسرات', 'عسل أسود',
    'كركديه', 'ينسون', 'حلبة', 'طحينة',
    'فول', 'عدس', 'حمص', 'زبدة بلدي', 'سمنة بلدي',
];

const PRO_INFLAM_FORBIDDEN: string[] = [
    'بيض', 'زبادي', 'لبن', 'حليب',
    'مكرونة', 'عيش بلدي', 'شوفان',
    'زيت ذرة', 'زيت عباد', 'سمن صناعي',
    'مشروبات غازية', 'سكر أبيض',
];

export function computeAntiInflammatoryScore(
    answers: import('@/components/health-engine/types').EngineAnswers,
): AntiInflammatoryScore {
    const flatText = [
        ...Object.values(answers.clinicalAnswers).map(v =>
            Array.isArray(v) ? v.join(' ') : String(v)
        ),
        answers.freeText ?? '',
    ].join(' ');

    const foundAnti = ANTI_INFLAM_ALLOWED.filter(f => flatText.includes(f));
    const foundPro = PRO_INFLAM_FORBIDDEN.filter(f => flatText.includes(f));

    let score = 70 + foundAnti.length * 5 - foundPro.length * 10;
    score = Math.max(0, Math.min(100, score));

    let level: AntiInflammatoryScore['level'] = 'moderate';
    if (score >= 80) level = 'excellent';
    else if (score >= 60) level = 'good';
    else if (score >= 40) level = 'moderate';
    else level = 'poor';

    const guidanceMap: Record<typeof level, string> = {
        excellent: 'تغذيتك مضادة للالتهاب بشكل ممتاز — استمر',
        good: 'تغذيتك جيدة — ضبط بسيط قد يُحسّن النتائج',
        moderate: 'بعض الأطعمة الالتهابية في نظامك — التعديل مطلوب',
        poor: 'نظامك الغذائي يرفع الالتهاب — مراجعة فورية لنظام الطيبات',
    };

    return { score, level, proInflammatoryFoods: foundPro, antiInflammatoryFoods: foundAnti, guidance: guidanceMap[level] };
}

/* ══════════════════════════════════════════════════════════
   WEEKLY ADHERENCE PLAN GENERATOR
   ══════════════════════════════════════════════════════════ */

export interface WeeklyAdherencePlan {
    week1Focus: string;
    week2Focus: string;
    week3Focus: string;
    week4Focus: string;
    criticalSwap: { from: string; to: string };
    trackingItems: string[];
}

const PATHWAY_WEEK1: Record<string, string> = {
    digestion: 'حذف الألبان والبيض ٧ أيام ومراقبة الانتفاخ يومياً',
    fatigue: 'استبدال السكر الأبيض بعسل أبيض أو تمر، ٣ وجبات منتظمة',
    headache: 'إزالة القمح والألبان ١٠ أيام وتسجيل التغير',
    sleep: 'إيقاف الكافيين بعد ٢ ظهراً، كوب حلبة أو ينسون مساءً',
    anxiety: 'وجبات منتظمة كل ٤ ساعات، تقليل الكافيين ٥٠٪',
    pain: 'حذف الزيوت الصناعية كلياً، الاعتماد على زيت زيتون وسمنة بلدي',
    hormonal: 'إزالة الألبان التجارية وزيادة الخضار الصليبية',
    immune: 'تعزيز بالزنك والحديد عبر اللحوم الحمراء والبقوليات يومياً',
};

export function generateWeeklyAdherencePlan(
    pathway: string,
    violations: string[],
): WeeklyAdherencePlan {
    return {
        week1Focus: PATHWAY_WEEK1[pathway] ?? 'مراجعة قائمة الممنوعات والالتزام بنظام الطيبات',
        week2Focus: 'تقييم التحسن، ضبط أي ثغرات، تتبع الطاقة والنوم',
        week3Focus: 'ترسيخ العادات الصحيحة، إضافة أسماك ٣ مرات أسبوعياً',
        week4Focus: 'قياس النتائج، مقارنة الأعراض قبل وبعد، خطة الشهر الثاني',
        criticalSwap: violations.length > 0
            ? { from: violations[0], to: 'بديل مسموح من نظام الطيبات' }
            : { from: 'أطعمة الالتهاب الصامت', to: 'أطعمة الشفاء الطيبة' },
        trackingItems: [
            'مستوى الطاقة يومياً (١–١٠)',
            'جودة النوم',
            'الأعراض الهضمية',
            'مزاجك العام',
            'ما أكلته وقت ظهور الأعراض',
        ],
    };
}

/* ══════════════════════════════════════════════════════════
   MEAL TIMING ANALYSIS
   ══════════════════════════════════════════════════════════ */

export interface MealTimingInsight {
    pattern: string;
    concern: string | null;
    recommendation: string;
}

export function analyzeMealTiming(
    answers: import('@/components/health-engine/types').EngineAnswers,
): MealTimingInsight {
    const text = [
        ...Object.values(answers.clinicalAnswers).map(v =>
            Array.isArray(v) ? v.join(' ') : String(v)
        ),
        answers.freeText ?? '',
    ].join(' ');

    if (text.includes('صيام') || text.includes('متقطع')) {
        return {
            pattern: 'صيام متقطع أو وجبات متباعدة',
            concern: 'الصيام المطوّل قد يفاقم التعب والقلق عبر انخفاض سكر الدم',
            recommendation: '٣ وجبات رئيسية + وجبة خفيفة بين الفطور والغداء',
        };
    }
    if (text.includes('ليلي') || text.includes('سهر') || text.includes('متأخر')) {
        return {
            pattern: 'أكل ليلي أو بعد العشاء',
            concern: 'الأكل بعد ٨ مساءً يرهق الكبد ويؤثر على النوم',
            recommendation: 'آخر وجبة قبل ٨ مساءً — كوب حلبة أو ينسون بعده',
        };
    }
    if (text.includes('وجبة واحدة') || text.includes('مرة واحدة')) {
        return {
            pattern: 'وجبة واحدة أو اثنتان يومياً',
            concern: 'الوجبات القليلة تسبب تذبذب السكر وإرهاقاً',
            recommendation: '٣ وجبات منتظمة — الأرز والبروتين المسموح يُثبّت الطاقة',
        };
    }

    return {
        pattern: 'نمط وجبات منتظم',
        concern: null,
        recommendation: 'حافظ على التوقيت المنتظم — ركّز على نوع الطعام أكثر من توقيته',
    };
}

/* ══════════════════════════════════════════════════════════
   GUT MICROBIOME IMPACT ESTIMATOR
   ══════════════════════════════════════════════════════════ */

export interface GutImpactEstimate {
    dysbiosis_risk: 'high' | 'moderate' | 'low';
    protective_foods_count: number;
    harmful_foods_count: number;
    microbiome_guidance: string[];
}

const GUT_PROTECTIVE: string[] = [
    'فول', 'عدس', 'حمص', 'لوبيا', 'فاصوليا', 'بسلة',
    'خضار', 'فاكهة', 'مكسرات', 'طحينة', 'زيت زيتون',
    'ينسون', 'حلبة', 'كركديه', 'كل الأعشاب',
];

const GUT_HARMFUL: string[] = [
    'مشروبات غازية', 'سكر أبيض', 'مكرونة', 'شوفان',
    'بيض', 'لبن', 'زبادي', 'حليب',
    'زيت ذرة', 'سمن صناعي',
];

export function estimateGutImpact(
    answers: import('@/components/health-engine/types').EngineAnswers,
): GutImpactEstimate {
    const flatText = [
        ...Object.values(answers.clinicalAnswers).map(v =>
            Array.isArray(v) ? v.join(' ') : String(v)
        ),
        answers.freeText ?? '',
    ].join(' ');

    const protective = GUT_PROTECTIVE.filter(f => flatText.includes(f));
    const harmful = GUT_HARMFUL.filter(f => flatText.includes(f));

    let risk: GutImpactEstimate['dysbiosis_risk'] = 'low';
    if (harmful.length >= 4) risk = 'high';
    else if (harmful.length >= 2 || protective.length < 3) risk = 'moderate';

    const guidance: string[] = [];
    if (harmful.includes('مشروبات غازية') || harmful.includes('سكر أبيض')) {
        guidance.push('السكر الأبيض والغازيات يُضاعفان البكتيريا الضارة — استبدلهما فوراً');
    }
    if (harmful.includes('مكرونة') || harmful.includes('شوفان')) {
        guidance.push('القمح يُغذّي البكتيريا الضارة في القولون — الأرز والفريك أفضل للبكتيريا المفيدة');
    }
    if (protective.length < 3) {
        guidance.push('زِد البقوليات والخضار يومياً — أليافها تُغذّي البكتيريا المفيدة');
    }
    if (guidance.length === 0) {
        guidance.push('نمطك الغذائي يدعم صحة الأمعاء — حافظ على البقوليات والخضار');
    }

    return {
        dysbiosis_risk: risk,
        protective_foods_count: protective.length,
        harmful_foods_count: harmful.length,
        microbiome_guidance: guidance,
    };
}
