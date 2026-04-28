// lib/tayyibat/scoring-engine.ts — محرك التسجيل والتحليل متعدد الأبعاد
import type { TayyibatAssessmentResult, DimensionScore, WeeklyStep, ClinicalLink, BiomarkerPrediction } from './types';

interface RawAnswers { [key: string]: string }

// ── Scoring dimensions ──
function scoreOilsDimension(a: RawAnswers): DimensionScore {
    let score = 0;
    const oils = a['tay_oils'] ?? '';
    if (oils === 'olive_only')   score = 100;
    else if (oils === 'mixed')   score = 45;
    else if (oils === 'seed_oils') score = 0;
    else score = 20;
    return {
        id:'oils', label:'نوعية الدهون', icon:'🫒', maxScore:100, score,
        feedback: score === 100 ? 'ممتاز — زيت الزيتون يُنتج Oleocanthal (مضاد التهاب طبيعي)'
            : score < 50 ? 'خطر — الزيوت النباتية المكررة ترفع الأوميغا ٦ لمستويات التهابية'
            : 'يمكن تحسينه — قلّل الزيوت المختلطة وزد الزيتون'
    };
}

function scoreSugarDimension(a: RawAnswers): DimensionScore {
    let score = 0;
    const sugar = a['tay_sugar'] ?? '';
    if (sugar === 'none')       score = 100;
    else if (sugar === 'rare')  score = 65;
    else if (sugar === 'weekly') score = 35;
    else if (sugar === 'daily') score = 0;
    else score = 20;
    return {
        id:'sugar', label:'السكر الأبيض', icon:'⛔', maxScore:100, score,
        feedback: score === 100 ? 'ممتاز — غيابه يعيد مناعتك لأقصى كفاءة'
            : score === 0 ? 'حرج — السكر اليومي يُبطل Neutrophils ٤–٦ ساعات لكل جرعة'
            : 'تحتاج تقليلاً أكثر — حتى الكميات الصغيرة اليومية تُراكم الضرر'
    };
}

function scoreProteinDimension(a: RawAnswers): DimensionScore {
    let score = 0;
    const prot = a['tay_protein'] ?? '';
    if (prot === 'every_meal')   score = 100;
    else if (prot === 'twice')   score = 70;
    else if (prot === 'once')    score = 40;
    else if (prot === 'rarely')  score = 10;
    else score = 25;
    return {
        id:'protein', label:'البروتين النظيف', icon:'🥩', maxScore:100, score,
        feedback: score >= 80 ? 'ممتاز — البروتين في كل وجبة يُثبّت سكر الدم ويدعم ناقلات عصبية'
            : score < 40 ? 'نقص حاد — بدون بروتين كافٍ لا بناء عضلي ولا مناعة قوية'
            : 'زِد البروتين لوجبتين على الأقل — الهدف ١.٢ جم/كج وزن جسم'
    };
}

function scoreVegetablesDimension(a: RawAnswers): DimensionScore {
    let score = 0;
    const veg = a['tay_veg'] ?? '';
    if (veg === 'every_meal')   score = 100;
    else if (veg === 'daily')   score = 75;
    else if (veg === 'few')     score = 40;
    else if (veg === 'rarely')  score = 10;
    else score = 20;
    return {
        id:'vegetables', label:'الخضروات والألوان', icon:'🥦', maxScore:100, score,
        feedback: score >= 80 ? 'ممتاز — التنوع النباتي يُغذّي ٣٠+ نوع بكتيريا مفيدة'
            : score < 40 ? 'نقص خطير — الألياف غائبة = ميكروبيوم فقير + مناعة ضعيفة'
            : 'زِد التنوع — كل لون نبات = phytonutrient مختلف'
    };
}

function scoreProcessedDimension(a: RawAnswers): DimensionScore {
    let score = 100;
    const proc = a['tay_processed'] ?? '';
    if (proc === 'daily')   score = 0;
    else if (proc === 'often') score = 20;
    else if (proc === 'rarely') score = 75;
    else if (proc === 'never')  score = 100;
    return {
        id:'processed', label:'بُعد عن المصنّع', icon:'🚫', maxScore:100, score,
        feedback: score === 100 ? 'ممتاز — الطعام الحقيقي = معلومات جينية صحيحة لكل خلية'
            : score <= 20 ? 'خطر — AGEs وEMFs والمواد الحافظة تُلحق ضرراً متراكماً يومياً'
            : 'على الطريق الصحيح — الهدف صفر تجهيز يومياً'
    };
}

function scoreTimingDimension(a: RawAnswers): DimensionScore {
    let score = 0;
    const timing = a['tay_timing'] ?? '';
    if (timing === 'structured')  score = 100;
    else if (timing === 'partial') score = 55;
    else if (timing === 'random') score = 15;
    else score = 30;
    return {
        id:'timing', label:'الإيقاع الغذائي', icon:'⏰', maxScore:100, score,
        feedback: score >= 80 ? 'ممتاز — التوقيت المنظم يُزامن إيقاع الكورتيزول والأنسولين والميلاتونين'
            : score < 40 ? 'عشوائي — الأكل العشوائي يُربك الساعة البيولوجية بالكامل'
            : 'بدأت — اضبط وجباتك على نافذة ٨–١٠ ساعات يومياً'
    };
}

// ── Clinical Links ──
function buildClinicalLinks(dimensions: DimensionScore[], answers: RawAnswers): ClinicalLink[] {
    const links: ClinicalLink[] = [];
    const oilScore = dimensions.find(d => d.id === 'oils')?.score ?? 0;
    const sugarScore = dimensions.find(d => d.id === 'sugar')?.score ?? 0;
    const protScore = dimensions.find(d => d.id === 'protein')?.score ?? 0;

    if (oilScore < 50) links.push({
        pathway:'pain', impact:'high',
        mechanism:'الزيوت المكررة تُحوَّل لـ AA → PGE2 = ألم مزمن. التبديل للزيتون يُخفض الألم خلال ٤–٦ أسابيع.',
        improvementTimeline:'٤–٦ أسابيع لانخفاض CRP. ٨–١٢ أسبوع لتحسن ألم المفاصل.'
    });
    if (sugarScore < 50) links.push({
        pathway:'fatigue', impact:'high',
        mechanism:'السكر يُسبب Insulin spike ثم Reactive Hypoglycemia = هبوط طاقة كل ٢–٣ ساعات.',
        improvementTimeline:'٣–٧ أيام بعد حذف السكر الكامل. الطاقة تستقر نهائياً في ٢١ يوم.'
    });
    if (protScore < 50) links.push({
        pathway:'hormonal', impact:'moderate',
        mechanism:'البروتين = مادة خام الناقلات العصبية (سيروتونين من تريبتوفان، دوبامين من تيروزين). نقصه = عدم توازن هرموني.',
        improvementTimeline:'تحسن مزاج ملحوظ بعد ٢–٤ أسابيع من تصحيح البروتين.'
    });
    if (answers['tay_veg'] === 'rarely' || answers['tay_veg'] === 'few') links.push({
        pathway:'immune', impact:'high',
        mechanism:'غياب الألياف = Dysbiosis = انخفاض Butyrate = ضعف Gut Barrier = Leaky Gut = مناعة مشوشة.',
        improvementTimeline:'تحسن الميكروبيوم ملحوظ في ١٤ يوم. مناعة أفضل في ٤–٦ أسابيع.'
    });
    return links;
}

// ── Biomarker Predictions ──
function predictBiomarkers(score: number, dimensions: DimensionScore[]): BiomarkerPrediction[] {
    const oilScore = dimensions.find(d => d.id === 'oils')?.score ?? 50;
    const sugarScore = dimensions.find(d => d.id === 'sugar')?.score ?? 50;

    return [
        {
            marker: 'hs-CRP (مؤشر الالتهاب)',
            currentRisk: oilScore < 50 ? 'high' : oilScore < 75 ? 'moderate' : 'low',
            afterProtocol: 'متوقع انخفاض ٣٣–٤٧٪ خلال ٨–١٢ أسبوع من الطيبات الكاملة',
            timeframe: '٨–١٢ أسبوع'
        },
        {
            marker: 'فيريتين / مخزون الحديد',
            currentRisk: score < 60 ? 'high' : 'moderate',
            afterProtocol: 'البروتين الحيواني يُعزز امتصاص الحديد. توقع تحسن Ferritin خلال ٦ أسابيع.',
            timeframe: '٦–٨ أسابيع'
        },
        {
            marker: 'HOMA-IR (مقاومة الأنسولين)',
            currentRisk: sugarScore < 50 ? 'high' : sugarScore < 75 ? 'moderate' : 'low',
            afterProtocol: 'حذف السكر + مشي بعد الأكل: HOMA-IR ينخفض ٢٠–٢٥٪ في ١٢ أسبوع',
            timeframe: '١٢ أسبوع'
        },
        {
            marker: 'تنوع الميكروبيوم (Shannon Index)',
            currentRisk: score < 50 ? 'high' : 'moderate',
            afterProtocol: '٣٠ نوع نباتي/أسبوع يرفع التنوع ٢٥٪. تحسن مزاج وطاقة.',
            timeframe: '٤–٦ أسابيع'
        },
    ];
}

// ── Weekly Plan ──
function buildWeeklyPlan(gaps: string[], score: number): WeeklyStep[] {
    const plan: WeeklyStep[] = [
        { day:1, action:'أزل كل الزيوت النباتية من مطبخك واستبدلها بزيت الزيتون', why:'الزيوت المكررة هي أكبر مصدر التهاب في النظام الغذائي الحديث', difficulty:'medium', timeRequired:'٣٠ دقيقة' },
        { day:2, action:'فطور ١٠٠٪ بروتين + دهون (بيضتان + أفوكادو + زيتون)', why:'يُثبّت كورتيزول الصباح ويُعيد CAR بشكل صحيح', difficulty:'easy', timeRequired:'١٠ دقائق' },
        { day:3, action:'احذف كل السكر الأبيض والعصائر المصنعة تماماً', why:'السكر اليومي يُبطل مناعتك ويُسبب هبوط الطاقة المتكرر', difficulty:'hard', timeRequired:'قرار فقط' },
        { day:4, action:'أضف ثوماً طازجاً لوجبة واحدة يومياً (وجبة الظهر)', why:'الثوم يُغذّي Lactobacillus ويُنتج أليسين مضاد حيوي طبيعي', difficulty:'easy', timeRequired:'٥ دقائق' },
        { day:5, action:'امشِ ١٥ دقيقة بعد وجبة الغداء مباشرة', why:'GLUT-4 يُفعَّل في العضلات → يُخفض سكر الدم بدون أنسولين', difficulty:'easy', timeRequired:'١٥ دقيقة' },
        { day:6, action:'سجّل كل وجباتك في طبرا — يوم كامل', why:'الوعي بما تأكله هو أول خطوة للتغيير المستدام', difficulty:'easy', timeRequired:'٥ دقائق/وجبة' },
        { day:7, action:'استبدل وجبة واحدة بطعام بحري (سمك أو جمبري)', why:'أوميغا ٣ الحيواني يبدأ تخفيض الالتهاب خلال ٢–٤ أيام من الأكل المنتظم', difficulty:'medium', timeRequired:'٢٠ دقيقة' },
    ];
    return plan;
}

// ── Main Scoring Function ──
export function computeDetailedScore(answers: RawAnswers): TayyibatAssessmentResult {
    const dimensions: DimensionScore[] = [
        scoreOilsDimension(answers),
        scoreSugarDimension(answers),
        scoreProteinDimension(answers),
        scoreVegetablesDimension(answers),
        scoreProcessedDimension(answers),
        scoreTimingDimension(answers),
    ];

    const totalScore = Math.round(
        dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length
    );

    const strengths = dimensions.filter(d => d.score >= 70).map(d => `${d.icon} ${d.label}: ${d.feedback}`);
    const gaps      = dimensions.filter(d => d.score < 70).map(d => `${d.icon} ${d.label}: ${d.feedback}`);

    const level = totalScore >= 85 ? 'elite'
        : totalScore >= 70 ? 'good'
        : totalScore >= 50 ? 'moderate'
        : totalScore >= 30 ? 'poor'
        : 'critical';

    const topPriority = dimensions.reduce((min, d) => d.score < min.score ? d : min, dimensions[0]);

    return {
        score: totalScore,
        level,
        dimension: dimensions,
        strengths: strengths.length ? strengths : ['استمر في تطوير النظام'],
        gaps: gaps.length ? gaps : ['النظام ممتاز — حافظ عليه'],
        topPriority: `${topPriority.icon} ${topPriority.label} — ${topPriority.feedback}`,
        weeklyPlan: buildWeeklyPlan(gaps, totalScore),
        clinicalLinks: buildClinicalLinks(dimensions, answers),
        biomarkerPredictions: predictBiomarkers(totalScore, dimensions),
    };
}

// ── Meal-Level Scorer ──
export function scoreMealAdherence(mealItems: string[], allFoodIds: string[]): number {
    if (!mealItems.length) return 0;
    const forbidden = ['white_sugar','seed_oils','processed_flour','processed_dairy',
                       'fast_food','soft_drinks','artificial_sweeteners','processed_meats'];
    const violations = mealItems.filter(id => forbidden.includes(id)).length;
    const adherence = Math.max(0, 100 - violations * 35);
    return adherence;
}

// ── 30-Day Projection ──
export function project30DayOutcome(score: number): {
    energyChange: string; inflammationChange: string; microbiomeChange: string; weightChange: string;
} {
    if (score >= 80) return {
        energyChange: '+٤٥٪ في الطاقة المستدامة', inflammationChange: 'hs-CRP ↓ ٤٠٪',
        microbiomeChange: 'تنوع ميكروبيوم +٢٥٪', weightChange: 'دهون بطن ↓ ٥–٨٪'
    };
    if (score >= 60) return {
        energyChange: '+٣٠٪ في الطاقة', inflammationChange: 'hs-CRP ↓ ٢٥٪',
        microbiomeChange: 'تحسن ملحوظ في هضم', weightChange: 'استقرار الوزن'
    };
    return {
        energyChange: 'تحسن تدريجي في ٣–٦ أسابيع', inflammationChange: 'انخفاض خفيف في CRP',
        microbiomeChange: 'بداية إعادة التوازن', weightChange: 'تحسن تكوين الجسم'
    };
}
