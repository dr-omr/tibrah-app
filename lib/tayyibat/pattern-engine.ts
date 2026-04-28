// lib/tayyibat/pattern-engine.ts
// ══════════════════════════════════════════════════════════
// محرك الأنماط الغذائية السريرية — ٦ أنماط + كشف التناقضات
// اللغة: احتمالية — لا ادعاءات قاطعة
// ══════════════════════════════════════════════════════════

import type { TayyibatAnswers } from './tayyibat-scoring-engine';
import type { TayyibatMeal }    from './meal-tracker';

// ── أنواع الأنماط ──
export type ClinicalPattern =
    | 'digestive_burden'
    | 'sugar_dependency'
    | 'inflammatory_load'
    | 'rhythm_disruption'
    | 'low_readiness'
    | 'medical_review_first';

export interface PatternResult {
    primaryPattern:       ClinicalPattern;
    secondaryPatterns:    ClinicalPattern[];
    patternScores:        Record<ClinicalPattern, number>; // 0–100
    patternInsights:      Record<ClinicalPattern, string>;
    routeToProtocol:      string | null;
    safetyGated:          boolean;
    medicalReviewLevel:   MedicalReviewLevel;  // none | recommended | required_first
    medicalReviewReason:  string | null;       // نص يُعرض للمستخدم إذا recommended/required
}

export interface ContradictionResult {
    hasContradictions:  boolean;
    notes:              string[];
    confidenceImpact:   number; // -0 to -30 (يُطرح من الثقة)
}

// ── مستوى العلامات الطبية ──
export type MedicalReviewLevel = 'none' | 'recommended' | 'required_first';

// ── وصف كل نمط ──
export const PATTERN_DESCRIPTIONS: Record<ClinicalPattern, {
    label: string; icon: string; color: string;
    summary: string; protocolId: string | null;
    primaryRecommendation: string;
}> = {
    digestive_burden: {
        label: 'عبء هضمي مرتفع', icon: '🫁', color: 'rgba(217,119,6,0.10)',
        summary: 'أعراض مرتبطة بالجهاز الهضمي قد تُشير إلى حمل غذائي أعلى مما يتحمله القولون حالياً.',
        protocolId: 'gut_reset',
        primaryRecommendation: 'ابدأ بتتبع ما تأكله قبل كل نوبة انتفاخ — المحفز الشخصي أهم من أي قائمة عامة.',
    },
    sugar_dependency: {
        label: 'اعتماد سكري/نشوي', icon: '🍬', color: 'rgba(234,88,12,0.08)',
        summary: 'نمط يشير إلى اعتماد على السكر والنشا كمصدر وقود أساسي، مع احتمال تذبذب في مستوى الطاقة.',
        protocolId: 'core_21',
        primaryRecommendation: 'ابدأ يومك بوجبة بروتينية — هذا التغيير الواحد قد يُقلل الرغبة في السكر خلال الأسبوع.',
    },
    inflammatory_load: {
        label: 'التهاب منخفض الدرجة (محتمل)', icon: '🔥', color: 'rgba(220,38,38,0.07)',
        summary: 'مؤشرات قد ترتبط بنمط التهابي منخفض الدرجة — تحتاج تقييماً طبياً لاستبعاد أسباب أخرى.',
        protocolId: 'anti_inflammation',
        primaryRecommendation: 'احذف الزيوت النباتية المكررة أسبوعاً وراقب الفرق في الأعراض.',
    },
    rhythm_disruption: {
        label: 'اضطراب الإيقاع اليومي', icon: '⏰', color: 'rgba(124,58,237,0.07)',
        summary: 'توقيت الوجبات أو النوم يحتاج إعادة ضبط — الإيقاع المضطرب يُضعف فاعلية أي نظام غذائي.',
        protocolId: 'core_21',
        primaryRecommendation: 'ثبّت وقت الاستيقاظ يومياً وأخّر أول كوب قهوة ٩٠ دقيقة بعد الصحيان.',
    },
    low_readiness: {
        label: 'استعداد منخفض للتغيير', icon: '🧩', color: 'rgba(8,145,178,0.07)',
        summary: 'المعرفة موجودة أحياناً، لكن الالتزام مقيّد بعوامل بيئية أو نفسية أو اجتماعية.',
        protocolId: null,
        primaryRecommendation: 'لا تبدأ ببروتوكول صارم. اختر تغييراً واحداً سهلاً وثبّته أسبوعاً قبل الانتقال.',
    },
    medical_review_first: {
        label: 'تقييم طبي أولاً', icon: '🏥', color: 'rgba(220,38,38,0.10)',
        summary: 'بعض الأعراض التي أشرت إليها تستوجب تقييماً طبياً قبل أي تدخل غذائي.',
        protocolId: null,
        primaryRecommendation: 'استشر طبيباً قبل البدء بأي بروتوكول — علامات الخطر أهم من أي خطة غذائية.',
    },
};

// ── حساب درجة كل نمط ──
function scoreDigestiveBurden(a: TayyibatAnswers): number {
    let score = 0;
    const freq: Record<string, number> = { never:0, sometimes:30, often:65, always:100 };
    score += freq[a.bloatingFreq] ?? 30;
    score += freq[a.gasFreq]      ?? 30;
    score += freq[a.constipation] ?? 20;
    score += freq[a.acidReflux]   ?? 20;
    return Math.min(100, Math.round(score / 4));
}

function scoreSugarDependency(a: TayyibatAnswers): number {
    let score = 0;
    const sugarMap:   Record<string, number> = { none:0, rare:20, weekly:50, daily:100 };
    const cravingMap: Record<string, number> = { none:0, mild:25, moderate:60, strong:95 };
    const freqMap:    Record<string, number> = { never:0, sometimes:30, often:65, always:100 };
    score += sugarMap[a.sugarLevel]     ?? 40;
    score += cravingMap[a.sugarCraving] ?? 30;
    score += freqMap[a.postMealCrash]   ?? 30;
    score += freqMap[a.afternoonSlump]  ?? 30;
    return Math.min(100, Math.round(score / 4));
}

function scoreInflammatoryLoad(a: TayyibatAnswers): number {
    let score = 0;
    const severity: Record<string, number> = { none:0, mild:25, moderate:60, severe:95 };
    const freq:     Record<string, number> = { never:0, rarely:15, weekly:55, daily:90 };
    score += severity[a.jointPain]      ?? 20;
    score += freq[a.headacheFreq]       ?? 20;
    score += severity[a.skinIssues]     ?? 20;
    return Math.min(100, Math.round(score / 3));
}

function scoreRhythmDisruption(a: TayyibatAnswers): number {
    let score = 0;
    const timingMap:  Record<string, number> = { structured:0, partial:40, random:85 };
    const sleepMap:   Record<string, number> = { excellent:0, good:20, fair:55, poor:90 };
    const fatigueMap: Record<string, number> = { never:0, sometimes:30, often:65, always:100 };
    score += timingMap[a.mealTiming]      ?? 40;
    score += sleepMap[a.sleepQuality]     ?? 40;
    score += fatigueMap[a.morningFatigue] ?? 40;
    return Math.min(100, Math.round(score / 3));
}

function scoreLowReadiness(a: TayyibatAnswers): number {
    const knowledgeMap: Record<string, number> = { expert:0, basic:25, little:65, none:90 };
    const levelMap:     Record<string, number> = { full:0, partial:35, started:65, none:90 };
    const score = (knowledgeMap[a.knowledgeLevel] ?? 50) * 0.4 + (levelMap[a.currentLevel] ?? 50) * 0.6;
    return Math.min(100, Math.round(score));
}

// ── تقييم مستوى المراجعة الطبية — منطق سريري صحيح ──
// ══════════════════════════════════════════════════════════════
// required_first: فقط عند علامات خطر صريحة (explicit red flags)
//   — يُعيَّن من domain:'safety' answers أو triage urgent/emergency
//   — لا يُستنتج من proxy symptoms مطلقاً
//
// recommended: أعراض مزمنة/شديدة بدون red flags
//   — التوصيات الغذائية تبقى مرئية مع banner تنبيه
//
// none: لا سبب طبي عاجل
// ══════════════════════════════════════════════════════════════
function assessMedicalReviewLevel(a: TayyibatAnswers): {
    level: MedicalReviewLevel; reason: string | null;
} {
    // ═══ REQUIRED FIRST ═══
    // يُطلَق فقط من حقل explicitRedFlagDetected الذي يُعيَّن من:
    // 1. أسئلة domain:'safety' في assessment-questions.ts (دم، ألم صدري، إغماء، إلخ)
    // 2. triageResult.level === 'urgent' | 'emergency' (يُعيَّن في الـ bridge)
    // أمثلة red flags حقيقية (لا تُستنتج من الأعراض الغذائية):
    //   ألم صدري، ضيق تنفس شديد، إغماء، دم في البراز/البول، فقدان وزن غير مبرر،
    //   قيء متكرر، بلع صعب، حمى مستمرة، صداع شديد مفاجئ جديد، أعراض عصبية بؤرية
    if (a.explicitRedFlagDetected === true) {
        return {
            level: 'required_first',
            reason: 'رُصدت إشارات تستوجب تقييمًا طبيًا مباشرًا قبل البدء بأي بروتوكول غذائي. التوصيات الغذائية تبقى كمعلومة مرجعية فقط.',
        };
    }

    // ═══ RECOMMENDED ═══
    // أعراض مزمنة أو شديدة بدون red flags حقيقية
    // التوصيات الغذائية تبقى مرئية بالكامل + banner تنبيه خفيف
    const hasChronicConcern =
        a.jointPain === 'severe' ||                              // ألم مفاصل شديد مزمن
        (a.headacheFreq === 'daily' && a.focusLevel === 'poor') || // صداع يومي + ضبابية ذهنية
        (a.skinIssues === 'severe' && a.jointPain !== 'none') || // مشاكل جلد شديدة + مفاصل
        (a.morningFatigue === 'always' && a.sleepQuality === 'poor' && a.postMealCrash === 'often'); // إرهاق متعدد المصادر

    if (hasChronicConcern) {
        return {
            level: 'recommended',
            reason: 'بعض الأعراض المزمنة تستحق مراجعة طبية لاستبعاد أسباب أخرى — التوجيه الغذائي يبقى مفيدًا ومتاحًا بالكامل.',
        };
    }

    return { level: 'none', reason: null };
}

// ── الدالة الرئيسية للأنماط ──
export function detectPatterns(a: TayyibatAnswers): PatternResult {
    const medicalReview = assessMedicalReviewLevel(a);
    const safetyGated   = medicalReview.level === 'required_first';

    const patternScores: Record<ClinicalPattern, number> = {
        digestive_burden:    scoreDigestiveBurden(a),
        sugar_dependency:    scoreSugarDependency(a),
        inflammatory_load:   scoreInflammatoryLoad(a),
        rhythm_disruption:   scoreRhythmDisruption(a),
        low_readiness:       scoreLowReadiness(a),
        medical_review_first: safetyGated ? 100 : 0,
    };

    const sorted = (Object.entries(patternScores) as [ClinicalPattern, number][])
        .sort((a, b) => b[1] - a[1]);

    const primaryPattern: ClinicalPattern = safetyGated
        ? 'medical_review_first'
        : sorted[0][0];

    const secondaryPatterns: ClinicalPattern[] = safetyGated
        ? []
        : sorted.slice(1, 3).filter(([_, score]) => score >= 40).map(([p]) => p);

    const patternInsights: Record<ClinicalPattern, string> = {} as Record<ClinicalPattern, string>;
    (Object.keys(patternScores) as ClinicalPattern[]).forEach(pattern => {
        const score = patternScores[pattern];
        patternInsights[pattern] = score >= 70
            ? `مرتفع (${score}٪) — ${PATTERN_DESCRIPTIONS[pattern].summary}`
            : score >= 40
            ? `متوسط (${score}٪) — يحتاج متابعة`
            : `منخفض (${score}٪) — لا مؤشر واضح`;
    });

    const routeToProtocol = safetyGated
        ? null
        : PATTERN_DESCRIPTIONS[primaryPattern].protocolId;

    return {
        primaryPattern, secondaryPatterns, patternScores,
        patternInsights, routeToProtocol, safetyGated,
        medicalReviewLevel: medicalReview.level,
        medicalReviewReason: medicalReview.reason,
    };
}

// ── محرك كشف التناقضات ──
export function detectContradictions(
    a: TayyibatAnswers,
    mealLogs: TayyibatMeal[] = []
): ContradictionResult {
    const notes: string[] = [];
    let confidenceImpact = 0;

    // تناقض ١: يقول ملتزم لكن يأكل سكراً يومياً
    if (a.currentLevel === 'full' && a.sugarLevel === 'daily') {
        notes.push('أشرت إلى التزام كامل بالنظام، لكن تناول السكر اليومي قد لا يتوافق مع ذلك. قد يكون التعريف الشخصي للالتزام يختلف عن المعايير الموضوعة — وهذا يحدث كثيراً.');
        confidenceImpact -= 15;
    }

    // تناقض ٢: لا أعراض هضمية لكن سجلات الانتفاخ عالية
    if (a.bloatingFreq === 'never' && mealLogs.length >= 3) {
        const avgBloating = mealLogs.reduce((s, m) => s + (m.bloatingScore ?? 0), 0) / mealLogs.length;
        if (avgBloating >= 6) {
            notes.push('قلت إن الانتفاخ نادر، لكن سجلات الوجبات تُظهر متوسط انتفاخ مرتفع. يوجد فرق بين الشعور العام والبيانات المسجلة — التتبع يُعطي صورة أدق.');
            confidenceImpact -= 20;
        }
    }

    // تناقض ٣: نوم جيد لكن آخر وجبة قريبة من النوم
    if (a.sleepQuality === 'excellent' && a.mealTiming === 'random') {
        notes.push('ذكرت أن النوم ممتاز مع نمط وجبات عشوائي — هذا ممكن، لكنه غير شائع. قد يتحسن النوم أكثر مع تنظيم توقيت العشاء.');
        confidenceImpact -= 5;
    }

    // تناقض ٤: مستوى معرفة عالٍ لكن تطبيق منعدم
    if (a.knowledgeLevel === 'expert' && a.currentLevel === 'none') {
        notes.push('معرفتك بالنظام عالية لكن التطبيق لم يبدأ بعد. غالباً السبب ليس المعرفة — بل الحواجز العملية (وقت، بيئة، إغراءات اجتماعية). هذا هو المكان المناسب للبدء.');
        confidenceImpact -= 10;
    }

    return {
        hasContradictions: notes.length > 0,
        notes,
        confidenceImpact,
    };
}

// ── درجة الثقة في النتيجة — معايرة محسّنة ──
export function computeConfidence(
    answeredCount:   number,
    totalQuestions:  number,
    mealLogCount:    number,
    contradictions:  ContradictionResult
): { score: number; label: 'low' | 'medium' | 'high'; explanation: string } {
    const answerCoverage = (answeredCount / totalQuestions) * 60; // حتى ٦٠ نقطة

    // ── معايرة الـ tracker bonus ──
    // 0-4  وجبات: بيانات غير كافية — 0 نقطة
    // 5-13 وجبات: أسبوع جزئي — bonus صغير
    // 14-20 وجبات: أسبوعان تقريبًا — bonus متوسط
    // 21+   وجبات: بيانات قوية — bonus قوي
    const trackerBonus =
        mealLogCount < 5   ? 0 :
        mealLogCount < 14  ? Math.round((mealLogCount - 4) * 1.5)  :  // 1.5–15 pts
        mealLogCount < 21  ? 15 + Math.round((mealLogCount - 13) * 2) :  // 15–29 pts
                             Math.min(35, 29 + Math.round((mealLogCount - 20) * 0.5));  // 29–35 pts

    const rawScore = Math.max(0, answerCoverage + trackerBonus + contradictions.confidenceImpact);
    const score = Math.min(100, Math.round(rawScore));

    const label: 'low' | 'medium' | 'high' =
        score >= 65 ? 'high' : score >= 35 ? 'medium' : 'low';

    const explanation =
        mealLogCount < 5 && label !== 'high'
        ? `بيانات الوجبات غير كافية (${mealLogCount} وجبات) — سجّل ٥ وجبات على الأقل لرفع الدقة.`
        : label === 'high'
        ? 'الثقة في النتيجة عالية — أجبت على معظم الأسئلة وسجّلت وجبات كافية.'
        : label === 'medium'
        ? 'الثقة متوسطة — إضافة سجل وجبات يومي لأسبوع ستُحسّن دقة النتيجة.'
        : 'الثقة منخفضة — النتيجة تحتاج مزيداً من البيانات. سجّل وجباتك لأسبوع ثم أعد التقييم.';

    return { score, label, explanation };
}
