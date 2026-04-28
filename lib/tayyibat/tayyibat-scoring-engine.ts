// lib/tayyibat/tayyibat-scoring-engine.ts
// ══════════════════════════════════════════════════════════════
// محرك تسجيل الطيبات — ٦ أبعاد سريرية + مخرجات احتمالية آمنة
// لغة: احتمالية — لا ادعاءات قاطعة — لا أرقام غير مثبتة
// ══════════════════════════════════════════════════════════════

export interface TayyibatAnswers {
    // البُعد ١: الالتزام الغذائي
    oilType:        'olive_only' | 'mixed' | 'seed_oils' | 'unknown';
    sugarLevel:     'none' | 'rare' | 'weekly' | 'daily';
    proteinFreq:    'every_meal' | 'twice' | 'once' | 'rarely';
    vegetableFreq:  'every_meal' | 'daily' | 'few' | 'rarely';
    processedFood:  'never' | 'rarely' | 'often' | 'daily';
    mealTiming:     'structured' | 'partial' | 'random';

    // البُعد ٢: أعراض الهضم
    bloatingFreq:   'never' | 'sometimes' | 'often' | 'always';
    gasFreq:        'never' | 'sometimes' | 'often' | 'always';
    constipation:   'never' | 'sometimes' | 'often' | 'always';
    acidReflux:     'never' | 'sometimes' | 'often' | 'always';

    // البُعد ٣: الطاقة والسكر
    morningFatigue: 'never' | 'sometimes' | 'often' | 'always';
    postMealCrash:  'never' | 'sometimes' | 'often' | 'always';
    sugarCraving:   'none' | 'mild' | 'moderate' | 'strong';
    afternoonSlump: 'never' | 'sometimes' | 'often' | 'always';

    // البُعد ٤: الالتهاب
    jointPain:      'none' | 'mild' | 'moderate' | 'severe';
    headacheFreq:   'never' | 'rarely' | 'weekly' | 'daily';
    skinIssues:     'none' | 'mild' | 'moderate' | 'severe';

    // البُعد ٥: النوم والتركيز
    sleepQuality:   'excellent' | 'good' | 'fair' | 'poor';
    focusLevel:     'excellent' | 'good' | 'fair' | 'poor';

    // البُعد ٦: الاستعداد
    knowledgeLevel: 'expert' | 'basic' | 'little' | 'none';
    currentLevel:   'full' | 'partial' | 'started' | 'none';
    biggestChallenge: string;

    // ── حقل السلامة السريرية ──
    // يُعيَّن بواسطة الـ bridge عندما تكون هناك علامات خطر صريحة
    // (أسئلة domain:'safety' أو triage urgent/emergency)
    // لا يُستنتج من proxy signals مطلقاً
    explicitRedFlagDetected?: boolean;
}

// ── نتيجة الأبعاد الستة ──
export interface DimensionResult {
    id:       string;
    label:    string;
    icon:     string;
    score:    number;           // 0–100
    risk:     'low' | 'moderate' | 'high';
    feedback: string;           // لغة احتمالية آمنة
    tip:      string;
}

// ── النتيجة الكاملة ──
export interface TayyibatScoreOutput {
    overallCompatibility:    number;         // 0–100
    adherenceScore:          number;
    inflammatoryLoadScore:   number;
    digestiveBurdenScore:    number;
    sugarDependencyScore:    number;
    rhythmDisruptionScore:   number;
    readinessScore:          number;

    dimensions:              DimensionResult[];
    topThreeGaps:            string[];
    mainGap:                 string;
    recommendedProtocol:     'core_21' | 'anti_inflammation' | 'gut_reset';
    firstStep24h:            string;
    weeklyPlan:              string[];
    riskNotes:               string[];
    medicalRedFlags:         string[];
    followUpInterval:        string;
    probabilisticSummary:    string;        // لغة احتمالية صريحة
    disclaimer:              string;
}

// ── النتيجة الكاملة الموسّعة (تدمج كل المحركات) ──
export interface TayyibatAssessmentResult extends TayyibatScoreOutput {
    // هوية النمط
    primaryPattern:         import('./pattern-engine').ClinicalPattern;
    secondaryPatterns:      import('./pattern-engine').ClinicalPattern[];
    patternLabel:           string;
    patternSummary:         string;

    // الثقة
    confidenceScore:        number;        // 0–100
    confidenceLabel:        'low' | 'medium' | 'high';
    confidenceExplanation:  string;

    // التناقضات
    hasContradictions:      boolean;
    contradictionNotes:     string[];

    // البروتوكول — قد يكون null عند وجود red flags
    recommendedProtocolId:  string | null;
    safetyGated:            boolean;       // true = لا نوصي ببروتوكول قبل المراجعة الطبية

    // الأسبوع الأول
    firstStepToday:         string;
    sevenDayPlan:           string[];
    foodTrackerFocus:       string[];

    // الإسناد (دائماً)
    attribution:            typeof import('./attribution').TAYYIBAT_ATTRIBUTION;

    // الوضع (quick vs deep)
    assessmentMode:         'quick' | 'deep';
    answeredCount:          number;
}



// ── مساعد: تحويل خيار لدرجة ──
type FourLevel = 'never'|'sometimes'|'often'|'always'|'none'|'mild'|'moderate'|'severe'|
                 'excellent'|'good'|'fair'|'poor'|'every_meal'|'daily'|'few'|'rarely'|
                 'olive_only'|'mixed'|'seed_oils'|'unknown'|'structured'|'partial'|'random'|
                 'none2'|'rare'|'weekly'|'once'|'twice'|'full'|'started'|'expert'|'basic'|'little'|
                 'strong'|'every_meal2';

const FREQ_SCORE: Record<string, number> = {
    never:0, none:0, excellent:100, full:100, expert:100, olive_only:100, every_meal:100, structured:100,
    sometimes:30, mild:30, good:75, partial:60, basic:50, mixed:40, twice:70, partial2:55,
    often:65, moderate:60, fair:45, started:25, little:20, seed_oils:0, once:35, random:15,
    always:100, severe:100, poor:10, none2:0, rare:70, weekly:40, daily:100, rarely:15,
    unknown:20, strong:90, few:30,
};

function scoreFreq(val: string, higherIsBad = true): number {
    const raw = FREQ_SCORE[val] ?? 50;
    return higherIsBad ? raw : 100 - raw;
}

// ── حساب الأبعاد ──

function scoreAdherence(a: TayyibatAnswers): DimensionResult {
    const pts = [
        scoreFreq(a.oilType, false),
        scoreFreq(a.sugarLevel, true) === 0 ? 100 : 100 - scoreFreq(a.sugarLevel, false),
        scoreFreq(a.proteinFreq, false),
        scoreFreq(a.vegetableFreq, false),
        100 - scoreFreq(a.processedFood, false),
        scoreFreq(a.mealTiming, false),
    ];
    const score = Math.round(pts.reduce((s,v)=>s+v,0)/pts.length);
    return {
        id:'adherence', label:'الالتزام الغذائي', icon:'🥗', score,
        risk: score >= 70 ? 'low' : score >= 45 ? 'moderate' : 'high',
        feedback: score >= 70
            ? 'نمطك الغذائي يتوافق بشكل جيد مع مبادئ الطيبات.'
            : score >= 45
            ? 'هناك فرص لتحسين جودة الغذاء — بعض الخيارات قد تُسهم في تحسين الطاقة والهضم.'
            : 'النمط الغذائي الحالي قد يكون مساهماً في بعض الأعراض التي تلاحظها.',
        tip: score < 70
            ? 'ابدأ بتغيير واحد فقط — استبدال الزيت النباتي بزيت الزيتون هو الأسهل والأكثر أثراً.'
            : 'حافظ على الإيقاع الجيد واضبط توقيت الوجبات.',
    };
}

function scoreDigestiveBurden(a: TayyibatAnswers): DimensionResult {
    const pts = [
        scoreFreq(a.bloatingFreq, true),
        scoreFreq(a.gasFreq, true),
        scoreFreq(a.constipation, true),
        scoreFreq(a.acidReflux, true),
    ];
    const score = Math.round(pts.reduce((s,v)=>s+v,0)/pts.length);
    const burden = 100 - score; // ارتفاع الثقل = سوء
    return {
        id:'digestive', label:'عبء الجهاز الهضمي', icon:'🫁', score: 100 - burden,
        risk: burden >= 60 ? 'high' : burden >= 30 ? 'moderate' : 'low',
        feedback: burden >= 60
            ? 'أعراض الهضم التي تصفها قد ترتبط بنمط الطعام والميكروبيوم — يُفضَّل تقييم متخصص.'
            : burden >= 30
            ? 'بعض أعراض الهضم موجودة وقد تتأثر بتحسين الخيارات الغذائية.'
            : 'الجهاز الهضمي يعمل بشكل مقبول نسبياً.',
        tip: burden >= 40
            ? 'تتبّع ما تأكله قبل كل نوبة انتفاخ لاكتشاف المحفزات الشخصية.'
            : 'استمر في الخيارات الجيدة وأضف تنوعاً نباتياً.',
    };
}

function scoreSugarDependency(a: TayyibatAnswers): DimensionResult {
    const pts = [
        scoreFreq(a.sugarLevel, true),
        scoreFreq(a.postMealCrash, true),
        scoreFreq(a.sugarCraving, true),
        scoreFreq(a.afternoonSlump, true),
    ];
    const score = Math.round(pts.reduce((s,v)=>s+v,0)/pts.length);
    const dep = 100 - score;
    return {
        id:'sugar', label:'الاعتماد على السكر', icon:'🍬', score: 100 - dep,
        risk: dep >= 60 ? 'high' : dep >= 30 ? 'moderate' : 'low',
        feedback: dep >= 60
            ? 'نمط الاعتماد على السكر واضح — قد يُسهم في تذبذب الطاقة وصعوبة التركيز.'
            : dep >= 30
            ? 'بعض الاعتماد على السكر موجود ويمكن تخفيفه تدريجياً.'
            : 'استجابتك للسكر تبدو مستقرة نسبياً.',
        tip: dep >= 40
            ? 'ابدأ يومك بوجبة بروتينية — قد يُقلّل الرغبة في السكر خلال النهار.'
            : 'حافظ على إيقاع الوجبات المنتظم.',
    };
}

function scoreInflammatoryLoad(a: TayyibatAnswers): DimensionResult {
    const pts = [
        scoreFreq(a.jointPain, true),
        scoreFreq(a.headacheFreq, true),
        scoreFreq(a.skinIssues, true),
    ];
    const score = Math.round(pts.reduce((s,v)=>s+v,0)/pts.length);
    const load = 100 - score;
    return {
        id:'inflammation', label:'العبء الالتهابي المحتمل', icon:'🔥', score: 100 - load,
        risk: load >= 60 ? 'high' : load >= 30 ? 'moderate' : 'low',
        feedback: load >= 60
            ? 'الأعراض التي تصفها قد ترتبط بنمط التهابي — يُفضَّل استشارة طبية لاستبعاد الأسباب الأخرى.'
            : load >= 30
            ? 'بعض المؤشرات الالتهابية المحتملة موجودة وقد تتحسن مع تحسين الغذاء.'
            : 'لا مؤشرات التهاب واضحة في الأعراض الغذائية.',
        tip: load >= 40
            ? 'أضف أوميغا ٣ يومياً (سمك بحري ×٣/أسبوع) وراقب الفرق خلال ٤ أسابيع.'
            : 'خيارات ممتازة — استمر.',
    };
}

function scoreRhythmDisruption(a: TayyibatAnswers): DimensionResult {
    const pts = [
        scoreFreq(a.mealTiming, false),
        scoreFreq(a.sleepQuality, false),
        scoreFreq(a.morningFatigue, true),
    ];
    const score = Math.round(pts.reduce((s,v)=>s+v,0)/pts.length);
    const disruption = 100 - score;
    return {
        id:'rhythm', label:'انتظام الإيقاع اليومي', icon:'⏰', score: 100 - disruption,
        risk: disruption >= 60 ? 'high' : disruption >= 30 ? 'moderate' : 'low',
        feedback: disruption >= 60
            ? 'اضطراب الإيقاع اليومي (وجبات، نوم) قد يُضعف فاعلية أي نظام غذائي.'
            : disruption >= 30
            ? 'الإيقاع يحتاج بعض الضبط لتحسين النتائج الغذائية.'
            : 'إيقاع يومي منتظم — يُعزز فاعلية النظام الغذائي.',
        tip: disruption >= 40
            ? 'ثبّت وقت الاستيقاظ يومياً — هذا وحده قد يُحسّن الطاقة والهضم.'
            : 'انتظام ممتاز — طوّر الجودة لا الكمية.',
    };
}

function scoreReadiness(a: TayyibatAnswers): DimensionResult {
    const knowledgeScore = { expert:100, basic:60, little:25, none:0 }[a.knowledgeLevel] ?? 30;
    const levelScore = { full:100, partial:65, started:30, none:5 }[a.currentLevel] ?? 20;
    const score = Math.round((knowledgeScore + levelScore) / 2);
    return {
        id:'readiness', label:'مستوى الاستعداد', icon:'🎯', score,
        risk: score >= 60 ? 'low' : score >= 30 ? 'moderate' : 'high',
        feedback: score >= 70
            ? 'لديك وعي ومعرفة جيدة — التطبيق هو الخطوة التالية.'
            : score >= 40
            ? 'معرفتك بالنظام تحتاج توسيعاً لتطبيق أكثر فاعلية.'
            : 'ابدأ بفهم مبادئ النظام قبل التطبيق — الفهم يُديم الالتزام.',
        tip: score < 60
            ? 'اقرأ قسم "العلم وراء النظام" في طبرا — ١٠ دقائق تُغيّر طريقة تفكيرك بالطعام.'
            : 'معرفتك قوية — وثّقها بسجل يومي.',
    };
}

// ── علامات الخطر السريرية (تظهر في كل نتيجة) ──
export const RED_FLAGS_DIGESTIVE = [
    'دم في البراز أو البول',
    'فقدان وزن غير مبرر (أكثر من ٥٪ من وزن الجسم خلال شهر)',
    'قيء متكرر أو مستمر',
    'ألم بطني شديد أو مفاجئ',
    'صعوبة في البلع',
    'حمى مستمرة مع الأعراض الهضمية',
    'فقر دم غير مفسَّر',
];

export const RED_FLAGS_FATIGUE = [
    'ضيق تنفس غير مبرر',
    'خفقان قلب شديد أو متكرر',
    'دوخة أو إغماء',
    'فقدان وزن سريع بدون سبب',
    'ألم صدري',
    'حمى مستمرة',
    'ضعف شديد مفاجئ في طرف من الجسم',
];

export const RED_FLAG_DISCLAIMER =
    'هذه الخطة لا تغني عن الفحص الطبي. إذا ظهر أي من العلامات التالية، اطلب تقييمًا طبيًا مباشرًا.';

// ── البروتوكول المقترح ──
function pickProtocol(
    digestive: number, inflammatory: number, overall: number
): TayyibatScoreOutput['recommendedProtocol'] {
    if (digestive < 50) return 'gut_reset';
    if (inflammatory < 50) return 'anti_inflammation';
    return 'core_21';
}

// ── خطة ٧ أيام آمنة ──
function buildWeeklyPlan(dims: DimensionResult[]): string[] {
    const plan: string[] = [];
    const digestive = dims.find(d=>d.id==='digestive');
    const sugar     = dims.find(d=>d.id==='sugar');
    const inflam    = dims.find(d=>d.id==='inflammation');
    const rhythm    = dims.find(d=>d.id==='rhythm');

    plan.push('اليوم ١: سجّل كل ما تأكله اليوم بدون تغيير — الوعي أولاً');
    if (sugar?.risk !== 'low')   plan.push('اليوم ٢: استبدل أي مشروب محلّى بماء أو عشبة طبيعية');
    plan.push('اليوم ٣: أضف وجبة بروتينية واحدة على الأقل (بيض، سمك، لحم طازج)');
    if (digestive?.risk !== 'low') plan.push('اليوم ٤: راقب الأطعمة التي تسبّب انتفاخاً — دوّنها فوراً');
    plan.push('اليوم ٥: استبدل الزيت النباتي المكرر بزيت الزيتون في طهيك');
    if (rhythm?.risk !== 'low')   plan.push('اليوم ٦: ثبّت وقت وجبة الفطور على نفس الوقت');
    plan.push('اليوم ٧: راجع سجلك وحدد: ما الذي ارتبط بالانتفاخ أو هبوط الطاقة؟');
    if (inflam?.risk !== 'low')   plan.push('بونص: أضف سمكاً بحرياً مرتين هذا الأسبوع كمصدر للأوميغا ٣');

    return plan.slice(0, 7);
}

// ── الدالة الرئيسية ──
export function computeTayyibatScore(answers: TayyibatAnswers): TayyibatScoreOutput {
    const dimensions: DimensionResult[] = [
        scoreAdherence(answers),
        scoreDigestiveBurden(answers),
        scoreSugarDependency(answers),
        scoreInflammatoryLoad(answers),
        scoreRhythmDisruption(answers),
        scoreReadiness(answers),
    ];

    const adherenceScore        = dimensions.find(d=>d.id==='adherence')!.score;
    const digestiveBurdenScore  = dimensions.find(d=>d.id==='digestive')!.score;
    const sugarDependencyScore  = dimensions.find(d=>d.id==='sugar')!.score;
    const inflammatoryLoadScore = dimensions.find(d=>d.id==='inflammation')!.score;
    const rhythmDisruptionScore = dimensions.find(d=>d.id==='rhythm')!.score;
    const readinessScore        = dimensions.find(d=>d.id==='readiness')!.score;

    // وزن أعلى للالتزام والهضم
    const overallCompatibility = Math.round(
        adherenceScore       * 0.30 +
        digestiveBurdenScore * 0.20 +
        sugarDependencyScore * 0.15 +
        inflammatoryLoadScore* 0.15 +
        rhythmDisruptionScore* 0.10 +
        readinessScore       * 0.10
    );

    const sortedByRisk = [...dimensions].sort((a,b)=>{
        const riskOrder = { high:0, moderate:1, low:2 };
        return riskOrder[a.risk] - riskOrder[b.risk];
    });
    const topThreeGaps = sortedByRisk.slice(0,3).map(d=>d.feedback);
    const mainGap = sortedByRisk[0]?.feedback ?? '';

    const protocol = pickProtocol(digestiveBurdenScore, inflammatoryLoadScore, overallCompatibility);

    // الخطوة الأولى في ٢٤ ساعة
    const firstStep24h = overallCompatibility < 50
        ? 'اليوم: سجّل وجباتك كاملة. لا تغيّر شيئاً بعد — الملاحظة أولاً.'
        : overallCompatibility < 75
        ? 'اليوم: استبدل زيت طهيك بزيت الزيتون — خطوة واحدة كبيرة.'
        : 'اليوم: أضف خضاراً جديداً لم تجربه هذا الأسبوع — تنويع الميكروبيوم.';

    // ملاحظات المخاطر
    const riskNotes: string[] = [];
    if (sugarDependencyScore < 50)
        riskNotes.push('قد يرتبط الاعتماد على السكر بتذبذب الطاقة — يُفضَّل مراقبة الأنماط بسجل يومي.');
    if (digestiveBurdenScore < 50)
        riskNotes.push('أعراض الهضم المتكررة تستحق متابعة — إذا استمرت أكثر من ٤ أسابيع بعد تحسين الغذاء، استشر طبيباً.');
    if (inflammatoryLoadScore < 50)
        riskNotes.push('الأعراض التي قد تشير لالتهاب تحتاج تقييماً طبياً لاستبعاد أسباب أخرى غير غذائية.');

    // ملخص احتمالي آمن
    const probabilisticSummary = overallCompatibility >= 75
        ? 'نمطك الغذائي يتوافق بشكل جيد مع مبادئ الطيبات. بعض التحسينات الدقيقة قد تُعزز النتائج.'
        : overallCompatibility >= 50
        ? 'هناك فجوات غذائية قابلة للتحسين. تحسين هذه الجوانب قد يُسهم في تحسين بعض الأعراض مع الوقت.'
        : 'النمط الغذائي الحالي قد يكون مساهماً في بعض الأعراض التي تلاحظها. التغيير التدريجي أكثر استدامة من التغيير المفاجئ.';

    return {
        overallCompatibility,
        adherenceScore, inflammatoryLoadScore, digestiveBurdenScore,
        sugarDependencyScore, rhythmDisruptionScore, readinessScore,
        dimensions,
        topThreeGaps,
        mainGap,
        recommendedProtocol: protocol,
        firstStep24h,
        weeklyPlan: buildWeeklyPlan(dimensions),
        riskNotes,
        medicalRedFlags: [...RED_FLAGS_DIGESTIVE, ...RED_FLAGS_FATIGUE],
        followUpInterval: overallCompatibility >= 75 ? '٣ أسابيع' : overallCompatibility >= 50 ? 'أسبوعان' : 'أسبوع واحد',
        probabilisticSummary,
        disclaimer: 'هذه النتائج إرشادية وتثقيفية ولا تُعدّ تشخيصاً طبياً. استشر طبيبك عند وجود أعراض مستمرة أو شديدة.',
    };
}

// ── تتبع Analytics (بدون أرقام مخترعة) ──
export const TAYYIBAT_ANALYTICS_EVENTS = {
    ASSESSMENT_STARTED:  'tayyibat_assessment_started',
    QUESTION_ANSWERED:   'tayyibat_question_answered',
    ASSESSMENT_DONE:     'tayyibat_assessment_completed',
    RESULT_VIEWED:       'tayyibat_result_viewed',
    PROTOCOL_STARTED:    'tayyibat_protocol_started',
    MEAL_LOGGED:         'tayyibat_meal_logged',
    WEEKLY_VIEWED:       'tayyibat_weekly_adherence_viewed',
    RED_FLAG_VIEWED:     'tayyibat_red_flag_warning_viewed',
} as const;
