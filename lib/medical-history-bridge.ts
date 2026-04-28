// lib/medical-history-bridge.ts
// ════════════════════════════════════════════════════════════════
// TIBRAH — Medical History ↔ Assessment Bridge
// ════════════════════════════════════════════════════════════════
// Reads saved medical history from localStorage and extracts
// clinically relevant signals to enrich the assessment result.
// Pure deterministic — no AI dependency.
// ════════════════════════════════════════════════════════════════

import type { EngineAnswers, TriageResult, RoutingResult } from '@/components/health-engine/types';
import type { MedicalHistory } from '@/components/medical-history/medical-history-types';

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

export interface MedicalHistoryVerdict {
    /** Whether medical history data exists */
    hasData: boolean;
    /** Chronic diseases that relate to current symptoms */
    relevantChronicDiseases: string[];
    /** Current medications that may interact with symptoms */
    relevantMedications: Array<{ name: string; concern: string }>;
    /** Family history flags */
    familyRiskFlags: string[];
    /** Lifestyle factors that may sustain symptoms */
    lifestyleFactors: string[];
    /** ROS (Review of Systems) signals that correlate */
    correlatedROSFindings: string[];
    /** Risk score adjustment based on history */
    riskModifier: 'elevated' | 'neutral' | 'protective';
    /** Summary sentence */
    summaryArabic: string;
    /** Recommended lab tests based on history + symptoms */
    suggestedLabs: string[];
}

/* ══════════════════════════════════════════════════════════
   CHRONIC DISEASE → PATHWAY CORRELATION
   ══════════════════════════════════════════════════════════ */

const CHRONIC_PATHWAY_MAP: Record<string, {
    pathways: string[];
    concern: string;
}> = {
    'سكري': { pathways: ['fatigue', 'pain', 'immune'], concern: 'السكري يؤثر على الطاقة والمناعة والأعصاب' },
    'ضغط': { pathways: ['headache', 'anxiety', 'fatigue'], concern: 'ارتفاع الضغط مرتبط بالصداع والقلق' },
    'غدة درقية': { pathways: ['fatigue', 'hormonal', 'sleep'], concern: 'خلل الدرقية يؤثر على الطاقة والنوم والهرمونات' },
    'قولون': { pathways: ['digestion', 'anxiety'], concern: 'القولون العصبي مرتبط بالجهاز الهضمي والقلق' },
    'ربو': { pathways: ['immune', 'anxiety', 'sleep'], concern: 'الربو يؤثر على النوم وقد يحاكي القلق' },
    'روماتيزم': { pathways: ['pain', 'fatigue', 'immune'], concern: 'أمراض المناعة الذاتية تسبب ألماً وإرهاقاً مزمناً' },
    'اكتئاب': { pathways: ['fatigue', 'sleep', 'anxiety'], concern: 'الاكتئاب يؤثر على كل الأبعاد — النوم والطاقة والمزاج' },
    'قلق': { pathways: ['anxiety', 'sleep', 'digestion'], concern: 'القلق المزمن يؤثر على الهضم والنوم' },
    'حساسية': { pathways: ['immune', 'digestion', 'headache'], concern: 'الحساسية قد تسبب صداعاً وأعراضاً هضمية' },
    'أنيميا': { pathways: ['fatigue', 'headache'], concern: 'فقر الدم يسبب إرهاقاً وصداعاً' },
    'كوليسترول': { pathways: ['fatigue'], concern: 'خلل الدهون يؤثر على الطاقة العامة' },
};

/* ══════════════════════════════════════════════════════════
   MEDICATION → SYMPTOM INTERACTION
   ══════════════════════════════════════════════════════════ */

const MED_INTERACTION_KEYWORDS: Array<{
    keywords: string[];
    pathways: string[];
    concern: string;
}> = [
    { keywords: ['بريلوسيك', 'نيكسيوم', 'بانتولوك', 'أوميبرازول', 'بانتوبرازول'], pathways: ['digestion', 'fatigue'], concern: 'مثبطات الحموضة تُخفي السبب الجذري وتُضعف الامتصاص — ممنوعة في نظام الطيبات' },
    { keywords: ['باراسيتامول', 'بروفين', 'فولتارين', 'كيتوفان'], pathways: ['pain', 'digestion'], concern: 'المسكنات المزمنة قد تُسبب مشاكل هضمية وتُخفي السبب' },
    { keywords: ['ليكسوتانيل', 'زاناكس', 'ريفوتريل'], pathways: ['anxiety', 'sleep'], concern: 'المهدئات قد تؤثر على جودة النوم العميق' },
    { keywords: ['كونكور', 'تينورمين', 'أتينولول'], pathways: ['fatigue'], concern: 'حاصرات بيتا قد تسبب إرهاقاً' },
    { keywords: ['ثيروكسين', 'إلتروكسين'], pathways: ['fatigue', 'hormonal'], concern: 'جرعة الثيروكسين تحتاج مراجعة دورية' },
    { keywords: ['كورتيزون', 'بريدنيزون', 'ديكساميثازون'], pathways: ['immune', 'hormonal', 'sleep'], concern: 'الكورتيزون يؤثر على المناعة والنوم والهرمونات' },
];

/* ══════════════════════════════════════════════════════════
   LIFESTYLE → SYMPTOM SUSTAINING MAP
   ══════════════════════════════════════════════════════════ */

const LIFESTYLE_FLAGS: Array<{
    check: (h: MedicalHistory) => boolean;
    message: string;
    pathways: string[];
}> = [
    { check: h => h.sleepHours !== '' && parseInt(h.sleepHours) < 6, message: 'نوم أقل من ٦ ساعات — عامل مُبقٍ للأعراض', pathways: ['fatigue', 'headache', 'anxiety', 'immune'] },
    { check: h => h.stressLevel >= 7, message: 'مستوى إجهاد مرتفع (≥٧/١٠) — يُفاقم معظم الأعراض', pathways: ['anxiety', 'digestion', 'sleep', 'pain', 'fatigue', 'hormonal', 'immune', 'headache'] },
    { check: h => h.exercise === 'لا أمارس' || h.exercise === 'نادراً', message: 'قلة الحركة عامل مُبقٍ — حتى المشي ١٥ دقيقة يُحدث فرقاً', pathways: ['fatigue', 'pain', 'anxiety', 'sleep'] },
    { check: h => h.water !== '' && (h.water.includes('قليل') || h.water.includes('١') || h.water.includes('٢')), message: 'شرب ماء غير كافٍ — الجفاف يسبب صداعاً وإرهاقاً', pathways: ['headache', 'fatigue', 'digestion'] },
    { check: h => h.smoking !== '' && h.smoking !== 'لا أدخن', message: 'التدخين يُضعف المناعة ويزيد الالتهاب — التقليل التدريجي مطلوب', pathways: ['immune', 'pain', 'fatigue'] },
    { check: h => h.caffeine !== '' && (h.caffeine.includes('كثير') || h.caffeine.includes('٥') || h.caffeine.includes('٦')), message: 'كافيين مرتفع — يُفاقم القلق وجودة النوم', pathways: ['anxiety', 'sleep'] },
];

/* ══════════════════════════════════════════════════════════
   PATHWAY → SUGGESTED LABS
   ══════════════════════════════════════════════════════════ */

const PATHWAY_LABS: Record<string, string[]> = {
    fatigue: ['CBC (صورة دم كاملة)', 'فيتامين د', 'فيتامين ب١٢', 'TSH (الغدة الدرقية)', 'حديد ومخزون الحديد (فيريتين)'],
    headache: ['CBC', 'فيتامين د', 'ضغط الدم', 'فحص نظر'],
    digestion: ['H. Pylori (جرثومة المعدة)', 'تحليل براز شامل', 'حساسية القمح (Anti-tTG)'],
    anxiety: ['TSH', 'فيتامين د', 'مغنيسيوم', 'سكر صائم'],
    sleep: ['TSH', 'فيتامين د', 'حديد/فيريتين', 'كورتيزول صباحي'],
    pain: ['ESR (سرعة ترسيب)', 'CRP (بروتين تفاعلي)', 'فيتامين د', 'حمض اليوريك'],
    hormonal: ['TSH + T3 + T4 free', 'كورتيزول صباحي', 'DHEA-S', 'فيتامين د'],
    immune: ['CBC + differential', 'CRP', 'فيتامين د', 'فيريتين', 'ANA (إذا اشتُبه بمناعة ذاتية)'],
};

/* ══════════════════════════════════════════════════════════
   MAIN FUNCTION
   ══════════════════════════════════════════════════════════ */

export function analyzeMedicalHistoryForAssessment(
    answers: EngineAnswers,
    triageResult: TriageResult,
    routing: RoutingResult,
): MedicalHistoryVerdict {
    // Try to load from localStorage
    let history: MedicalHistory | null = null;
    try {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('tibrah_medical_history');
            if (stored) history = JSON.parse(stored);
        }
    } catch { /* ignore */ }

    if (!history) {
        return {
            hasData: false,
            relevantChronicDiseases: [],
            relevantMedications: [],
            familyRiskFlags: [],
            lifestyleFactors: [],
            correlatedROSFindings: [],
            riskModifier: 'neutral',
            summaryArabic: '',
            suggestedLabs: [],
        };
    }

    const pathway = answers.pathwayId;

    // 1. Chronic disease correlation
    const relevantChronicDiseases: string[] = [];
    for (const disease of history.chronicDiseases) {
        for (const [key, mapping] of Object.entries(CHRONIC_PATHWAY_MAP)) {
            if (disease.includes(key) && mapping.pathways.includes(pathway)) {
                relevantChronicDiseases.push(`${disease} — ${mapping.concern}`);
            }
        }
    }

    // 2. Medication interaction
    const relevantMedications: Array<{ name: string; concern: string }> = [];
    for (const med of history.currentMeds) {
        for (const interaction of MED_INTERACTION_KEYWORDS) {
            if (interaction.pathways.includes(pathway) &&
                interaction.keywords.some(kw => med.name.includes(kw))) {
                relevantMedications.push({ name: med.name, concern: interaction.concern });
            }
        }
    }

    // 3. Family risk flags
    const familyRiskFlags: string[] = [];
    for (const [member, diseases] of Object.entries(history.familyDiseases)) {
        for (const disease of diseases) {
            for (const [key, mapping] of Object.entries(CHRONIC_PATHWAY_MAP)) {
                if (disease.includes(key) && mapping.pathways.includes(pathway)) {
                    familyRiskFlags.push(`ال${member}: ${disease}`);
                }
            }
        }
    }

    // 4. Lifestyle factors
    const lifestyleFactors: string[] = [];
    for (const flag of LIFESTYLE_FLAGS) {
        if (flag.pathways.includes(pathway) && flag.check(history)) {
            lifestyleFactors.push(flag.message);
        }
    }

    // 5. ROS correlation
    const correlatedROSFindings: string[] = [];
    const rosMapping: Record<string, string[]> = {
        fatigue: ['عام', 'عصبي', 'نفسي'],
        headache: ['عصبي', 'عيون'],
        digestion: ['جهاز هضمي'],
        anxiety: ['نفسي', 'قلب'],
        sleep: ['نفسي', 'عصبي'],
        pain: ['عضلي', 'عصبي'],
        hormonal: ['غدد', 'تناسلي'],
        immune: ['عام', 'جلد'],
    };
    const relevantSystems = rosMapping[pathway] ?? [];
    for (const [system, findings] of Object.entries(history.rosPositive)) {
        if (relevantSystems.some(rs => system.includes(rs)) && findings.length > 0) {
            correlatedROSFindings.push(`${system}: ${findings.join('، ')}`);
        }
    }

    // 6. Risk modifier
    let riskModifier: MedicalHistoryVerdict['riskModifier'] = 'neutral';
    if (relevantChronicDiseases.length >= 2 || relevantMedications.length >= 2) {
        riskModifier = 'elevated';
    } else if (lifestyleFactors.length === 0 && relevantChronicDiseases.length === 0) {
        riskModifier = 'protective';
    }

    // 7. Suggested labs
    const suggestedLabs = PATHWAY_LABS[pathway] ?? [];

    // 8. Summary
    const totalSignals = relevantChronicDiseases.length + relevantMedications.length + lifestyleFactors.length;
    let summaryArabic = '';
    if (totalSignals >= 3) {
        summaryArabic = 'تاريخك المرضي يحتوي عدة عوامل مرتبطة بأعراضك الحالية — المراجعة الشاملة مهمة';
    } else if (totalSignals >= 1) {
        summaryArabic = 'تم ربط بعض عوامل تاريخك المرضي بأعراضك — مراعاتها تُحسّن خطة العلاج';
    } else if (history.chronicDiseases.length > 0 || history.currentMeds.length > 0) {
        summaryArabic = 'تاريخك المرضي مسجّل — لا ترابط مباشر مع أعراضك الحالية';
    }

    return {
        hasData: true,
        relevantChronicDiseases,
        relevantMedications,
        familyRiskFlags,
        lifestyleFactors,
        correlatedROSFindings,
        riskModifier,
        summaryArabic,
        suggestedLabs,
    };
}

/* ══════════════════════════════════════════════════════════
   MODULE 2 — SURGICAL HISTORY IMPACT ANALYZER
   سرير: يبحث في السوابق الجراحية عن آثار مزمنة ذات صلة
   ══════════════════════════════════════════════════════════ */

export interface SurgicalImpactSignal {
    surgery: string;
    potentialSequel: string;
    watchSigns: string[];
    recommendedCheck: string;
}

const SURGERY_SEQUEL_MAP: Array<{
    keywords: string[];
    sequel: string;
    watchSigns: string[];
    check: string;
}> = [
    {
        keywords: ['استئصال مرارة', 'مرارة'],
        sequel: 'استئصال المرارة يغيّر هضم الدهون ويسبب إسهالاً مزمناً لدى بعض المرضى',
        watchSigns: ['إسهال دهني', 'انتفاخ بعد الأكل', 'مغص'],
        check: 'تحليل دهون البراز إذا استمر الإسهال',
    },
    {
        keywords: ['استئصال الغدة الدرقية', 'درقية', 'thyroid'],
        sequel: 'استئصال الدرقية يتطلب ثيروكسين مدى الحياة — الجرعة الخاطئة تسبب تعباً أو قلقاً',
        watchSigns: ['تعب', 'برودة', 'اكتساب وزن', 'قلق', 'خفقان'],
        check: 'TSH + T4 free كل ٦ شهور',
    },
    {
        keywords: ['تكميم', 'بايباس', 'عملية تخسيس', 'معدة'],
        sequel: 'عمليات البارياتريك تسبب نقص فيتامين ب١٢، د، حديد، كالسيوم مزمناً',
        watchSigns: ['تنميل أطراف', 'تعب', 'هشاشة عظام', 'شحوب'],
        check: 'CBC + فيتامين ب١٢ + د + حديد + كالسيوم كل ٣–٦ شهور',
    },
    {
        keywords: ['زائدة', 'استئصال زائدة'],
        sequel: 'استئصال الزائدة يُضعف الميكروبيوم في بعض الحالات — أثر طويل الأمد على المناعة',
        watchSigns: ['تكرار الالتهابات', 'ضعف مناعة', 'اضطراب هضمي'],
        check: 'تحليل براز شامل إذا كانت هناك أعراض هضمية',
    },
    {
        keywords: ['قيصرية', 'عملية ولادة'],
        sequel: 'العمليات القيصرية قد تسبب التصاقات حوض تؤثر على الهضم والدورة',
        watchSigns: ['ألم حوض', 'إمساك', 'ألم دورة'],
        check: 'تقييم نسائي إذا استمر ألم الحوض',
    },
    {
        keywords: ['ديسك', 'عمود فقري', 'فقرات'],
        sequel: 'جراحة العمود الفقري قد لا تُنهي الألم كلياً — الإعادة التأهيلية ضرورية',
        watchSigns: ['ألم ممتد', 'تنميل ساق', 'ضعف عضلي'],
        check: 'تقييم فيزيائي + MRI إذا عاد الألم',
    },
];

export function analyzeSurgicalHistory(
    history: import('@/components/medical-history/medical-history-types').MedicalHistory,
    pathway: string,
): SurgicalImpactSignal[] {
    const signals: SurgicalImpactSignal[] = [];
    if (!history.previousSurgeries) return signals;

    for (const entry of SURGERY_SEQUEL_MAP) {
        const matched = entry.keywords.some(kw =>
            history.previousSurgeries.includes(kw)
        );
        if (matched) {
            signals.push({
                surgery: history.previousSurgeries,
                potentialSequel: entry.sequel,
                watchSigns: entry.watchSigns,
                recommendedCheck: entry.check,
            });
        }
    }
    return signals;
}

/* ══════════════════════════════════════════════════════════
   MODULE 3 — ALLERGY CROSS-REACTIVITY ENGINE
   محرك التفاعل التقاطعي للحساسية
   ══════════════════════════════════════════════════════════ */

export interface AllergyCrossReactivity {
    allergen: string;
    crossReactiveFoods: string[];
    crossReactiveMeds: string[];
    clinicalNote: string;
}

const CROSS_REACTIVITY_MAP: Array<{
    trigger: string;
    foods: string[];
    meds: string[];
    note: string;
}> = [
    {
        trigger: 'بنسلين',
        foods: [],
        meds: ['أموكسيسيلين', 'أمبيسلين', 'كلوكساسيلين', 'بيبراسيلين'],
        note: 'الحساسية من البنسلين تمتد لكل عائلة البيتا لاكتام — أخبر طبيبك قبل أي مضاد حيوي',
    },
    {
        trigger: 'سلفا',
        foods: [],
        meds: ['سيبترين', 'تريمثوبريم', 'سلفاميثوكسازول'],
        note: 'حساسية السلفا تشمل مجموعة واسعة من الأدوية — تحقق دائماً قبل الوصف',
    },
    {
        trigger: 'أسبرين',
        foods: ['فراولة', 'طماطم', 'عنب'],
        meds: ['إيبوبروفين', 'نابروكسين', 'ديكلوفيناك', 'فولتارين'],
        note: 'حساسية الأسبرين تعني غالباً عدم تحمل كل مضادات الالتهاب غير الستيرويدية',
    },
    {
        trigger: 'لاتكس',
        foods: ['موز', 'أفوكادو', 'كيوي', 'طماطم', 'بطاطس'],
        meds: [],
        note: 'حساسية اللاتكس تتقاطع مع عدة فواكه وخضار — تجنبها خلال فترات الحساسية',
    },
    {
        trigger: 'قمح',
        foods: ['شعير', 'جاودار', 'أي منتج يحتوي قمح'],
        meds: [],
        note: 'حساسية القمح أو الداء الزلاقي — نظام الطيبات متوافق تلقائياً (لا قمح ولا شوفان)',
    },
];

export function detectAllergyCrossReactivity(
    history: import('@/components/medical-history/medical-history-types').MedicalHistory,
): AllergyCrossReactivity[] {
    const results: AllergyCrossReactivity[] = [];

    for (const allergy of history.allergies) {
        for (const entry of CROSS_REACTIVITY_MAP) {
            if (allergy.includes(entry.trigger) || entry.trigger.includes(allergy)) {
                results.push({
                    allergen: allergy,
                    crossReactiveFoods: entry.foods,
                    crossReactiveMeds: entry.meds,
                    clinicalNote: entry.note,
                });
            }
        }
    }
    return results;
}

/* ══════════════════════════════════════════════════════════
   MODULE 4 — AGE-BASED CLINICAL RISK STRATIFIER
   محطم المخاطر بناءً على العمر والجنس
   ══════════════════════════════════════════════════════════ */

export interface AgeRiskProfile {
    ageGroup: string;
    screeningPriorities: string[];
    pathwaySpecificNote: string;
    preventionFocus: string;
}

export function computeAgeRiskProfile(
    history: import('@/components/medical-history/medical-history-types').MedicalHistory,
    pathway: string,
): AgeRiskProfile {
    const year = parseInt(history.birthYear);
    const age = isNaN(year) ? null : new Date().getFullYear() - year;
    const gender = history.gender;

    if (!age) {
        return {
            ageGroup: 'غير محدد',
            screeningPriorities: ['تسجيل العمر في التاريخ المرضي يُحسّن دقة التحليل'],
            pathwaySpecificNote: '',
            preventionFocus: 'الوقاية العامة',
        };
    }

    if (age < 30) {
        return {
            ageGroup: 'الشباب (أقل من ٣٠)',
            screeningPriorities: ['CBC', 'فيتامين د', 'TSH إذا كانت هناك أعراض'],
            pathwaySpecificNote: pathway === 'anxiety'
                ? 'القلق في هذه المرحلة غالباً وظيفي ومرتبط بنمط الحياة — الاستجابة للتغيير سريعة'
                : pathway === 'fatigue' ? 'فقر الدم ونقص الحديد أكثر شيوعاً في هذه الفئة العمرية'
                : 'الجسم في قمة قدرته التعافية — الاستجابة للتدخل التغذوي ممتازة',
            preventionFocus: 'بناء عادات صحية مبكرة، تجنب الأطعمة الالتهابية',
        };
    }

    if (age < 45) {
        return {
            ageGroup: 'منتصف العمر (٣٠–٤٥)',
            screeningPriorities: ['CBC', 'سكر صائم', 'دهون', 'ضغط دم', 'TSH', 'فيتامين د'],
            pathwaySpecificNote: pathway === 'hormonal'
                ? 'بداية التغيرات الهرمونية في هذه المرحلة — مراجعة الهرمونات ضرورية'
                : pathway === 'fatigue' ? 'الإرهاق في الأربعينيات غالباً نقص فيريتين أو درقية — تحقق فوراً'
                : 'مرحلة الذروة المهنية — الإجهاد المزمن وقلة النوم عوامل رئيسية',
            preventionFocus: 'منع الأمراض المزمنة عبر التغذية الطيبة والحركة المنتظمة',
        };
    }

    if (age < 60) {
        return {
            ageGroup: 'ما قبل الشيخوخة (٤٥–٦٠)',
            screeningPriorities: [
                'CBC', 'سكر', 'HbA1c', 'دهون كاملة', 'TSH', 'فيتامين د',
                gender === 'أنثى' ? 'فحص الثدي والعنق السنوي' : 'PSA إذا وجد عوامل خطر',
            ],
            pathwaySpecificNote: pathway === 'pain'
                ? 'الألم المزمن في هذه المرحلة غالباً التهابي أو روماتيزمي — ESR/CRP مهمة'
                : pathway === 'sleep' ? 'توقف التنفس أثناء النوم أكثر شيوعاً بعد ٤٥ — قيّم ذلك'
                : 'مرحلة التحولات الهرمونية — كورتيزول وDHEA-S مؤشران مهمان',
            preventionFocus: 'الحفاظ على كتلة العضلة، الكالسيوم، وصحة القلب',
        };
    }

    return {
        ageGroup: 'كبار السن (فوق ٦٠)',
        screeningPriorities: [
            'CBC', 'كلى + كبد', 'سكر + HbA1c', 'فيتامين د + كالسيوم',
            'TSH', 'ضغط دم', 'قلب (ECG)', 'كثافة العظام',
        ],
        pathwaySpecificNote: pathway === 'fatigue'
            ? 'فقر الدم المزمن والقصور الكلوي الخفيف من أسباب التعب الشائعة في هذه المرحلة'
            : pathway === 'pain' ? 'النقرس وهشاشة العظام أكثر شيوعاً — حمض اليوريك + كثافة العظام مهمة'
            : 'متابعة مستمرة للدواء وجرعاته ضرورية لتجنب التفاعلات',
        preventionFocus: 'الحفاظ على الاستقلالية: عضلات + توازن + إدراك + غذاء',
    };
}

/* ══════════════════════════════════════════════════════════
   MODULE 5 — OCCUPATIONAL HEALTH RISK DETECTOR
   مُكتشف مخاطر صحة العمل والمهنة
   ══════════════════════════════════════════════════════════ */

export interface OccupationalRisk {
    detected: boolean;
    riskType: string[];
    pathwayLink: string;
    ergonomicTip: string;
}

const OCCUPATIONAL_RISK_MAP: Array<{
    keywords: string[];
    risks: string[];
    pathways: string[];
    tip: string;
}> = [
    {
        keywords: ['مدرس', 'معلم', 'تدريس'],
        risks: ['إجهاد صوتي', 'التهابات تنفسية متكررة', 'ضغط نفسي'],
        pathways: ['immune', 'anxiety', 'fatigue'],
        tip: 'الترطيب المستمر وراحة الصوت أساسية — نظام الطيبات يدعم المناعة',
    },
    {
        keywords: ['مكتبي', 'حاسوب', 'كمبيوتر', 'موظف'],
        risks: ['ألم ظهر', 'إجهاد بصري', 'قلة حركة', 'توتر ذهني'],
        pathways: ['pain', 'fatigue', 'anxiety', 'headache'],
        tip: 'قاعدة ٢٠-٢٠-٢٠: كل ٢٠ دقيقة انظر ٢٠ ثانية لمسافة ٢٠ قدماً، وقف ٥ دقائق',
    },
    {
        keywords: ['طبيب', 'ممرض', 'صحة', 'مستشفى', 'طبية'],
        risks: ['إرهاق عاطفي', 'اضطراب نوم ورديات', 'ضغط مزمن'],
        pathways: ['fatigue', 'sleep', 'anxiety', 'immune'],
        tip: 'ورديات الليل تُربك الساعة البيولوجية — ترتيب الوجبات حسب الوردية ضروري',
    },
    {
        keywords: ['ميكانيكي', 'كيميائي', 'مصنع', 'ورشة', 'صناعي'],
        risks: ['تعرض لمواد كيميائية', 'ضوضاء', 'إجهاد جسدي'],
        pathways: ['immune', 'pain', 'headache'],
        tip: 'الكمامة والقفازات واجبة — السموم البيئية تُثقل كاهل الكبد والمناعة',
    },
    {
        keywords: ['سائق', 'نقل', 'شاحنة'],
        risks: ['جلوس طويل', 'التواء فقرات', 'إجهاد بصري', 'طعام سريع'],
        pathways: ['pain', 'fatigue', 'digestion'],
        tip: 'وقفات ١٠ دقائق كل ساعتين للمشي — التنقل يمنع تصلب الفقرات',
    },
];

export function detectOccupationalRisk(
    history: import('@/components/medical-history/medical-history-types').MedicalHistory,
    pathway: string,
): OccupationalRisk {
    if (!history.occupation) {
        return { detected: false, riskType: [], pathwayLink: '', ergonomicTip: '' };
    }

    for (const entry of OCCUPATIONAL_RISK_MAP) {
        const matched = entry.keywords.some(kw => history.occupation.includes(kw));
        if (matched && entry.pathways.includes(pathway)) {
            return {
                detected: true,
                riskType: entry.risks,
                pathwayLink: `مهنتك كـ${history.occupation} قد تُسهم في أعراضك الحالية`,
                ergonomicTip: entry.tip,
            };
        }
    }

    return { detected: false, riskType: [], pathwayLink: '', ergonomicTip: '' };
}

/* ══════════════════════════════════════════════════════════
   MODULE 6 — COMPOSITE CLINICAL RISK SCORE (CCRS)
   درجة المخاطرة السريرية المركبة — نظام موحد للتقييم الكلي
   ══════════════════════════════════════════════════════════ */

export interface CompositeClinicalRisk {
    score: number;          // 0–100
    tier: 'low' | 'moderate' | 'high' | 'critical';
    dominantFactors: string[];
    immediateActions: string[];
    followUpTimeline: string;
}

export function computeCompositeClinicalRisk(
    history: import('@/components/medical-history/medical-history-types').MedicalHistory,
    pathway: string,
    relevantChronicDiseases: string[],
    relevantMedications: Array<{ name: string; concern: string }>,
    lifestyleFactors: string[],
    familyRiskFlags: string[],
): CompositeClinicalRisk {
    let score = 0;
    const dominantFactors: string[] = [];

    // Chronic disease burden (max 30 pts)
    score += Math.min(relevantChronicDiseases.length * 10, 30);
    if (relevantChronicDiseases.length > 0) {
        dominantFactors.push(`أمراض مزمنة ذات صلة: ${relevantChronicDiseases.length}`);
    }

    // Medication interactions (max 25 pts)
    score += Math.min(relevantMedications.length * 12, 25);
    if (relevantMedications.length > 0) {
        dominantFactors.push(`تفاعلات دوائية: ${relevantMedications.length}`);
    }

    // Lifestyle burden (max 25 pts)
    score += Math.min(lifestyleFactors.length * 8, 25);
    if (lifestyleFactors.length >= 2) {
        dominantFactors.push('عوامل نمط الحياة متراكمة');
    }

    // Family risk (max 10 pts)
    score += Math.min(familyRiskFlags.length * 5, 10);
    if (familyRiskFlags.length > 0) {
        dominantFactors.push('تاريخ عائلي ذو صلة');
    }

    // Stress amplifier
    if (history.stressLevel >= 8) { score += 10; dominantFactors.push('إجهاد مزمن شديد'); }

    score = Math.min(score, 100);

    let tier: CompositeClinicalRisk['tier'];
    let immediateActions: string[];
    let followUpTimeline: string;

    if (score >= 70) {
        tier = 'critical';
        immediateActions = [
            'استشارة طبيب فورية مطلوبة',
            'فحوصات شاملة بأقرب وقت',
            'مراجعة كل الأدوية مع الطبيب',
            'بدء نظام الطيبات فوراً لدعم الجسم',
        ];
        followUpTimeline = 'خلال أسبوع واحد';
    } else if (score >= 50) {
        tier = 'high';
        immediateActions = [
            'زيارة طبيب خلال أسبوعين',
            'الفحوصات الموصى بها أولوية',
            'تعديل نمط الحياة فوري',
        ];
        followUpTimeline = 'خلال أسبوعين';
    } else if (score >= 25) {
        tier = 'moderate';
        immediateActions = [
            'مراجعة دورية خلال شهر',
            'بدء تعديلات نظام الطيبات',
            'تتبع الأعراض يومياً',
        ];
        followUpTimeline = 'خلال شهر';
    } else {
        tier = 'low';
        immediateActions = [
            'استمر على نهجك الصحي الحالي',
            'فحص دوري سنوي كافٍ',
            'نظام الطيبات للوقاية الاستباقية',
        ];
        followUpTimeline = 'فحص سنوي';
    }

    return { score, tier, dominantFactors, immediateActions, followUpTimeline };
}
