// lib/domain-scoring-engine.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Domain Scoring & Routing Engine
// ════════════════════════════════════════════════════════════════════════
//
// Rules-based engine that converts assessment answers into a 4-domain
// routing result with primary/secondary domains, subdomains, and
// 5 recommended tools.
//
// المبدأ: ابدأ بنظام rules-based أولاً، ثم أضف الذكاء لاحقاً.
// ════════════════════════════════════════════════════════════════════════

import type {
    DomainId,
    SubdomainId,
    ToolRecommendation,
    RoutingResult,
    EngineAnswers,
    TriageResult,
    FunctionalPattern,
    SomaticTheme,
} from '@/components/health-engine/types';

import { DOMAIN_BY_ID, SUBDOMAIN_BY_ID } from './domain-routing-map';
import {
    detectContradictions,
    computeConfidenceModel,
    identifyKeySignals,
} from './contradiction-engine';
import { PATHWAYS } from '@/components/health-engine/constants';

/* ══════════════════════════════════════════════════════════
   PATHWAY → DOMAIN MAPPING
   كل مسار سريري (pathwayId) يُعطي نقاطاً لأقسام محددة.
   ══════════════════════════════════════════════════════════ */

const PATHWAY_DOMAIN_SCORES: Record<string, Partial<Record<DomainId, number>>> = {
    fatigue:   { jasadi: 12, nafsi: 3, fikri: 1, ruhi: 4 },
    headache:  { jasadi: 7, nafsi: 4, fikri: 2, ruhi: 1 },
    digestion: { jasadi: 9, nafsi: 4, fikri: 1, ruhi: 1 },
    sleep:     { jasadi: 5, nafsi: 3, fikri: 2, ruhi: 7 },
    pain:      { jasadi: 8, nafsi: 3, fikri: 1, ruhi: 2 },
    anxiety:   { jasadi: 2, nafsi: 9, fikri: 4, ruhi: 3 },
    hormonal:  { jasadi: 9, nafsi: 2, fikri: 1, ruhi: 2 },
    immune:    { jasadi: 8, nafsi: 3, fikri: 1, ruhi: 3 },
};

/* ══════════════════════════════════════════════════════════
   PATHWAY → SUBDOMAIN MAPPING
   كل مسار سريري يُلمّح لفروع فرعية محددة.
   ══════════════════════════════════════════════════════════ */

const PATHWAY_SUBDOMAIN_HINTS: Record<string, SubdomainId[]> = {
    fatigue:   ['energy_fatigue', 'nutrition_deficiency', 'hormonal', 'anxiety_arousal', 'rhythm_disruption'],
    headache:  ['musculoskeletal', 'hormonal', 'suppression_chronic_stress', 'overthinking'],
    digestion: ['digestive', 'psychosomatic', 'anxiety_arousal', 'suppression_chronic_stress'],
    sleep:     ['sleep', 'rhythm_disruption', 'sleep_light_quiet', 'anxiety_arousal', 'overthinking'],
    pain:      ['musculoskeletal', 'inflammatory', 'suppression_chronic_stress', 'grief_depletion'],
    anxiety:   ['anxiety_arousal', 'panic', 'psychosomatic', 'overthinking', 'lost_serenity'],
    hormonal:  ['hormonal', 'nutrition_deficiency', 'skin_hair', 'suppression_chronic_stress'],
    immune:    ['inflammatory', 'nutrition_deficiency', 'energy_fatigue', 'grief_depletion'],
};

/* ══════════════════════════════════════════════════════════
   FUNCTIONAL PATTERN → DOMAIN MAPPING
   كل نمط وظيفي (FunctionalPattern) يُعزز أقسام بعينها.
   ══════════════════════════════════════════════════════════ */

const FUNCTIONAL_DOMAIN_BOOST: Record<FunctionalPattern, Partial<Record<DomainId, number>>> = {
    adrenal_exhaustion:    { jasadi: 3, nafsi: 4, ruhi: 3 },
    thyroid_underfunction: { jasadi: 6, nafsi: 1 },
    gut_dysbiosis:         { jasadi: 6, nafsi: 2 },
    blood_sugar_chaos:     { jasadi: 5, nafsi: 1, fikri: 1 },
    nutrient_depletion:    { jasadi: 5, nafsi: 1 },
    inflammatory_load:     { jasadi: 6, nafsi: 1 },
    mitochondrial_drain:   { jasadi: 5, ruhi: 2 },
    hormonal_cascade:      { jasadi: 5, nafsi: 2 },
    nervous_system_dysreg: { jasadi: 2, nafsi: 5, ruhi: 2 },
    toxic_burden:          { jasadi: 5 },
    none:                  {},
};

/* ══════════════════════════════════════════════════════════
   FUNCTIONAL PATTERN → SUBDOMAIN MAPPING
   ══════════════════════════════════════════════════════════ */

const FUNCTIONAL_SUBDOMAIN_HINTS: Record<FunctionalPattern, SubdomainId[]> = {
    adrenal_exhaustion:    ['energy_fatigue', 'anxiety_arousal', 'inner_depletion'],
    thyroid_underfunction: ['hormonal', 'energy_fatigue', 'nutrition_deficiency'],
    gut_dysbiosis:         ['digestive', 'nutrition_deficiency', 'inflammatory'],
    blood_sugar_chaos:     ['digestive', 'energy_fatigue', 'nutrition_deficiency'],
    nutrient_depletion:    ['nutrition_deficiency', 'energy_fatigue', 'skin_hair'],
    inflammatory_load:     ['inflammatory', 'musculoskeletal', 'digestive'],
    mitochondrial_drain:   ['energy_fatigue', 'sleep', 'inner_depletion'],
    hormonal_cascade:      ['hormonal', 'skin_hair', 'suppression_chronic_stress'],
    nervous_system_dysreg: ['anxiety_arousal', 'psychosomatic', 'sleep'],
    toxic_burden:          ['inflammatory', 'energy_fatigue', 'skin_hair'],
    none:                  [],
};

/* ══════════════════════════════════════════════════════════
   SOMATIC THEME → DOMAIN MAPPING
   كل نمط شعوري-جسدي (SomaticTheme) يُعزز أقسام بعينها.
   ══════════════════════════════════════════════════════════ */

const SOMATIC_DOMAIN_BOOST: Record<SomaticTheme, Partial<Record<DomainId, number>>> = {
    suppressed_expression: { nafsi: 5, fikri: 2 },
    hypervigilance:        { nafsi: 6, jasadi: 2 },
    grief_unprocessed:     { nafsi: 5, ruhi: 3 },
    chronic_self_override: { nafsi: 3, fikri: 3, ruhi: 2 },
    worth_and_belonging:   { nafsi: 3, fikri: 4, ruhi: 2 },
    control_and_release:   { nafsi: 4, jasadi: 2 },
    compassion_fatigue:    { nafsi: 4, ruhi: 4 },
    childhood_imprint:     { nafsi: 5, fikri: 2 },
    none:                  {},
};

/* ══════════════════════════════════════════════════════════
   SOMATIC THEME → SUBDOMAIN MAPPING
   ══════════════════════════════════════════════════════════ */

const SOMATIC_SUBDOMAIN_HINTS: Record<SomaticTheme, SubdomainId[]> = {
    suppressed_expression: ['suppression_chronic_stress', 'psychosomatic', 'emotion_symptom_link'],
    hypervigilance:        ['anxiety_arousal', 'panic', 'psychosomatic'],
    grief_unprocessed:     ['grief_depletion', 'lost_meaning', 'inner_depletion'],
    chronic_self_override: ['self_criticism', 'perfectionism', 'inner_depletion'],
    worth_and_belonging:   ['self_criticism', 'limiting_beliefs', 'lost_meaning'],
    control_and_release:   ['digestive', 'suppression_chronic_stress', 'psychosomatic'],
    compassion_fatigue:    ['grief_depletion', 'inner_depletion', 'lost_serenity'],
    childhood_imprint:     ['anxiety_arousal', 'limiting_beliefs', 'emotion_symptom_link'],
    none:                  [],
};

/* ══════════════════════════════════════════════════════════
   EMOTIONAL CONTEXT → DOMAIN BOOSTERS
   ══════════════════════════════════════════════════════════ */

const EMOTIONAL_DOMAIN_BOOST: Record<string, Partial<Record<DomainId, number>>> = {
    work_stress:  { nafsi: 3, fikri: 2 },
    family:       { nafsi: 3, ruhi: 1 },
    loneliness:   { nafsi: 2, ruhi: 4 },
    grief:        { nafsi: 4, ruhi: 3 },
    financial:    { nafsi: 2, fikri: 3 },
    identity:     { fikri: 3, ruhi: 4 },
    anger:        { nafsi: 4, fikri: 1 },
    fear:         { nafsi: 4, fikri: 1 },
    burnout:      { nafsi: 3, ruhi: 3, jasadi: 2 },
    trauma:       { nafsi: 4, jasadi: 1 },
    shame:        { nafsi: 3, fikri: 4 },
    disconnected: { ruhi: 4, nafsi: 2 },
};

/** Maximum total emotional bonus any single domain can receive */
const EMOTIONAL_BONUS_CAP = 10;

/** Physical-dominant pathways that should not be easily overridden */
const PHYSICAL_PATHWAYS = new Set(['fatigue', 'hormonal', 'digestion', 'pain', 'immune', 'headache']);

/* ══════════════════════════════════════════════════════════
   SEVERITY-DURATION INTERACTION MATRIX
   Compound effect: severity + duration together carry more weight
   than either alone. Keys: `${severity_bucket}_${duration}`
   ══════════════════════════════════════════════════════════ */

type SevBucket = 'low' | 'mid' | 'high';
function sevBucket(sev: number): SevBucket { return sev >= 7 ? 'high' : sev >= 4 ? 'mid' : 'low'; }

interface SevDurEffect {
    jasadiBoost: number;
    ruhiBoost: number;
    fikriBoost: number;
    nafsiBoost: number;
    escalationWeight: number;  // 0-10 extra risk points
    confidenceMod: number;     // added to confidence raw score
}

const SEV_DUR_MATRIX: Record<string, SevDurEffect> = {
    // Severe + chronic = highest compound risk
    'high_months':  { jasadiBoost: 4, ruhiBoost: 3, fikriBoost: 1, nafsiBoost: 2, escalationWeight: 8, confidenceMod: -5 },
    'high_weeks':   { jasadiBoost: 3, ruhiBoost: 1, fikriBoost: 0, nafsiBoost: 1, escalationWeight: 5, confidenceMod: 0 },
    'high_days':    { jasadiBoost: 2, ruhiBoost: 0, fikriBoost: 0, nafsiBoost: 0, escalationWeight: 3, confidenceMod: 5 },
    // Moderate + chronic = persistent but not acute
    'mid_months':   { jasadiBoost: 1, ruhiBoost: 3, fikriBoost: 2, nafsiBoost: 1, escalationWeight: 3, confidenceMod: 0 },
    'mid_weeks':    { jasadiBoost: 1, ruhiBoost: 1, fikriBoost: 1, nafsiBoost: 0, escalationWeight: 1, confidenceMod: 5 },
    'mid_days':     { jasadiBoost: 0, ruhiBoost: 0, fikriBoost: 0, nafsiBoost: 0, escalationWeight: 0, confidenceMod: 5 },
    // Low severity = minimal compound effect
    'low_months':   { jasadiBoost: 0, ruhiBoost: 2, fikriBoost: 1, nafsiBoost: 0, escalationWeight: 1, confidenceMod: -3 },
    'low_weeks':    { jasadiBoost: 0, ruhiBoost: 0, fikriBoost: 0, nafsiBoost: 0, escalationWeight: 0, confidenceMod: 0 },
    'low_days':     { jasadiBoost: 0, ruhiBoost: 0, fikriBoost: 0, nafsiBoost: 0, escalationWeight: 0, confidenceMod: 5 },
};

/* ══════════════════════════════════════════════════════════
   CROSS-SYMPTOM CORRELATION MATRIX
   Detects when clinical answers from the current pathway
   hint at involvement of OTHER pathways — boosts relevant domains.
   ══════════════════════════════════════════════════════════ */

interface CrossCorrelation {
    /** Keywords in clinical answers that trigger this correlation */
    keywords: string[];
    /** Domain boosts when correlation is found */
    domainBoost: Partial<Record<DomainId, number>>;
    /** Subdomain hints to add */
    subdomainHints: SubdomainId[];
    /** Clinical note for audit trail */
    note: string;
}

const CROSS_CORRELATIONS: CrossCorrelation[] = [
    {
        keywords: ['نوم', 'أرق', 'استيقاظ', 'ليلي'],
        domainBoost: { ruhi: 2, jasadi: 1 },
        subdomainHints: ['sleep', 'rhythm_disruption'],
        note: 'إشارات اضطراب نوم ضمن مسار غير نومي',
    },
    {
        keywords: ['قلق', 'خوف', 'توتر', 'هلع', 'خفقان'],
        domainBoost: { nafsi: 2 },
        subdomainHints: ['anxiety_arousal', 'panic'],
        note: 'إشارات قلق ضمن مسار غير نفسي',
    },
    {
        keywords: ['هضم', 'بطن', 'انتفاخ', 'إسهال', 'إمساك', 'غثيان'],
        domainBoost: { jasadi: 2 },
        subdomainHints: ['digestive', 'nutrition_deficiency'],
        note: 'إشارات هضمية ضمن مسار غير هضمي',
    },
    {
        keywords: ['طاقة', 'إرهاق', 'تعب', 'إنهاك', 'استنزاف'],
        domainBoost: { jasadi: 2, ruhi: 1 },
        subdomainHints: ['energy_fatigue', 'inner_depletion'],
        note: 'إشارات إرهاق ضمن مسار غير إرهاقي',
    },
    {
        keywords: ['ألم', 'وجع', 'تشنج', 'تيبس'],
        domainBoost: { jasadi: 2 },
        subdomainHints: ['musculoskeletal', 'inflammatory'],
        note: 'إشارات ألم ضمن مسار غير ألمي',
    },
    {
        keywords: ['معنى', 'هدف', 'فراغ', 'اتجاه', 'ضياع'],
        domainBoost: { ruhi: 3, fikri: 1 },
        subdomainHints: ['lost_meaning', 'confusion_directionless'],
        note: 'إشارات وجودية ضمن مسار جسدي',
    },
    {
        keywords: ['كبت', 'صمت', 'حبس', 'مكبوت'],
        domainBoost: { nafsi: 2, fikri: 1 },
        subdomainHints: ['suppression_chronic_stress', 'emotion_symptom_link'],
        note: 'إشارات كبت عاطفي',
    },
];

/* ══════════════════════════════════════════════════════════
   ANSWER-DRIVEN SUBDOMAIN BOOST MAP
   Specific clinical answer strings → subdomain point boosts.
   This ensures the actual patient answers directly influence
   which subdomain ranks highest (not just pathway defaults).
   ══════════════════════════════════════════════════════════ */

const ANSWER_SUBDOMAIN_BOOST: Record<string, { sub: SubdomainId; points: number }[]> = {
    'أستيقظ منهكاً قبل أي مجهود':          [{ sub: 'energy_fatigue', points: 3 }, { sub: 'sleep', points: 2 }],
    'لا أتحمل الكافيين والتوتر (كظرية)':   [{ sub: 'energy_fatigue', points: 3 }, { sub: 'anxiety_arousal', points: 1 }],
    'هبوط طاقة منتصف النهار':               [{ sub: 'nutrition_deficiency', points: 2 }, { sub: 'energy_fatigue', points: 2 }],
    'أشتاق للسكر باستمرار (خلل سكر الدم)':  [{ sub: 'nutrition_deficiency', points: 3 }, { sub: 'digestive', points: 1 }],
    'برود وتساقط شعر وزيادة وزن (الدرقية)': [{ sub: 'hormonal', points: 4 }, { sub: 'skin_hair', points: 2 }],
    'ضبابية ذهنية مع الإرهاق':             [{ sub: 'energy_fatigue', points: 2 }, { sub: 'overthinking', points: 2 }],
    'نبضات من جانب واحد':                  [{ sub: 'musculoskeletal', points: 2 }],
    'العقل يظل نشطاً عند النوم':            [{ sub: 'sleep', points: 3 }, { sub: 'overthinking', points: 2 }],
    'شاشات حتى وقت النوم':                 [{ sub: 'rhythm_disruption', points: 3 }, { sub: 'sleep_light_quiet', points: 2 }],
    'الأمعاء تنفعل في مواقف الإجبار':       [{ sub: 'psychosomatic', points: 3 }, { sub: 'suppression_chronic_stress', points: 2 }],
    'تتحسن في الإجازات':                   [{ sub: 'suppression_chronic_stress', points: 3 }],
    'خفقان متكرر وضيق بلا سبب طبي':       [{ sub: 'anxiety_arousal', points: 3 }, { sub: 'panic', points: 2 }],
    'نوبات مفاجئة من الخوف':               [{ sub: 'panic', points: 4 }],
    'قلق مستمر والتفكير لا يتوقف':          [{ sub: 'anxiety_arousal', points: 3 }, { sub: 'overthinking', points: 2 }],
    'أحمل ثقلاً عاطفياً يسبق التعب':        [{ sub: 'grief_depletion', points: 3 }, { sub: 'psychosomatic', points: 2 }],
    'TSH مرتفع أو منخفض':                  [{ sub: 'hormonal', points: 4 }],
    'اضطراب الدورة الشهرية':               [{ sub: 'hormonal', points: 3 }],
    'اضطراب PCOS':                         [{ sub: 'hormonal', points: 4 }, { sub: 'nutrition_deficiency', points: 1 }],
    'تعلّمت القلق في بيئة غير آمنة':        [{ sub: 'anxiety_arousal', points: 2 }, { sub: 'emotion_symptom_link', points: 2 }],
    'المرض يعني التوقف — أرفض':            [{ sub: 'suppression_chronic_stress', points: 3 }, { sub: 'self_criticism', points: 2 }],
    'الكمالية تجعلني في توتر دائم':         [{ sub: 'perfectionism', points: 4 }, { sub: 'self_criticism', points: 2 }],
    'حرقة أو ارتجاع':                     [{ sub: 'digestive', points: 3 }],
    'انتفاخ بعد الأكل':                    [{ sub: 'digestive', points: 3 }, { sub: 'nutrition_deficiency', points: 1 }],
    'صباحي يتحسن بالحركة (التهاب)':        [{ sub: 'inflammatory', points: 4 }, { sub: 'musculoskeletal', points: 1 }],
    'ألم منتشر مع ضبابية ذهنية':           [{ sub: 'inflammatory', points: 2 }, { sub: 'energy_fatigue', points: 2 }],
    'يتحسن بالتدليك أو اللمس':             [{ sub: 'musculoskeletal', points: 2 }, { sub: 'psychosomatic', points: 2 }],
    'عواطف محبوسة في الصدر':               [{ sub: 'psychosomatic', points: 3 }, { sub: 'suppression_chronic_stress', points: 3 }],
};

/* ══════════════════════════════════════════════════════════
   PRIORITY & WHY TEXT GENERATORS
   ══════════════════════════════════════════════════════════ */

const DOMAIN_NAMES: Record<DomainId, string> = {
    jasadi: 'الجسدي',
    nafsi:  'النفسي',
    fikri:  'الفكري',
    ruhi:   'الروحي والإيقاعي',
};

const SUBDOMAIN_NAMES: Record<SubdomainId, string> = {
    digestive:            'هضمي',
    hormonal:             'هرموني',
    inflammatory:         'التهابي/مناعي',
    energy_fatigue:       'طاقة/إرهاق',
    sleep:                'نوم',
    nutrition_deficiency: 'تغذية ونواقص',
    musculoskeletal:      'ألم عضلي/هيكلي',
    skin_hair:            'جلد/شعر',
    anxiety_arousal:      'قلق/استثارة',
    suppression_chronic_stress: 'كبت/ضغط مزمن',
    grief_depletion:      'حزن/استنزاف',
    psychosomatic:        'نفس-جسدي',
    panic:                'نوبات هلع',
    emotion_symptom_link: 'ربط المشاعر بالأعراض',
    overthinking:         'اجترار فكري',
    limiting_beliefs:     'معتقدات مرضية',
    body_hypermonitor:    'مراقبة جسدية مفرطة',
    self_criticism:       'جلد الذات',
    perfectionism:        'كمالية',
    confusion_directionless: 'تشوش وفقدان اتجاه',
    lost_serenity:        'فقدان السكينة',
    rhythm_disruption:    'انقطاع الإيقاع',
    lost_meaning:         'فقدان المعنى',
    inner_depletion:      'إرهاق داخلي',
    self_disconnection:   'انقطاع عن الذات',
    sleep_light_quiet:    'خلل النوم/البيئة',
};

function generateWhy(
    primary: DomainId,
    secondary: DomainId,
    primarySub: SubdomainId,
    secondarySub: SubdomainId,
): string {
    const pName = DOMAIN_NAMES[primary];
    const sName = DOMAIN_NAMES[secondary];
    const pSub  = SUBDOMAIN_NAMES[primarySub];
    const sSub  = SUBDOMAIN_NAMES[secondarySub];

    // Use clinical context if available for richer, specific text
    const pContext = SUBDOMAIN_CLINICAL_CONTEXT[primarySub];
    if (pContext) {
        return `${pContext}. البُعد ${sName} (${sSub}) يلعب دوراً مساعداً في تضخيم الأعراض.`;
    }

    // Fallback to structured template (deterministic, not random)
    return `أعراضك الحالية تشير إلى نمط ${pSub} واضح في البُعد ${pName}، مع مؤشرات ${sSub} في البُعد ${sName} تزيد من شدته.`;
}

function generatePriority(
    primarySub: SubdomainId,
    secondarySub: SubdomainId,
): string {
    const pSub = SUBDOMAIN_NAMES[primarySub];
    const sSub = SUBDOMAIN_NAMES[secondarySub];

    const actionMap: Partial<Record<SubdomainId, string>> = {
        digestive:            'خفض التهيج الهضمي + تقليل المحفزات',
        hormonal:             'إعادة التوازن الهرموني + دعم الغدد',
        inflammatory:         'خفض مؤشرات الالتهاب + تعديل الغذاء',
        energy_fatigue:       'استعادة الطاقة + دعم الميتوكوندريا',
        sleep:                'إعادة ضبط إيقاع النوم',
        nutrition_deficiency: 'سد النواقص الغذائية + دعم المكملات',
        musculoskeletal:      'تخفيف الألم + حركة علاجية',
        skin_hair:            'معالجة الجلد/الشعر من الجذر',
        anxiety_arousal:      'تهدئة الجهاز العصبي + خفض الاستثارة',
        suppression_chronic_stress: 'تفريغ المشاعر المكبوتة + تنظيم الضغط',
        grief_depletion:      'معالجة الحزن + إعادة الملء العاطفي',
        psychosomatic:        'فهم العلاقة نفس-جسد + تنظيم عصبي',
        panic:                'تأمين من نوبات الهلع + تمارين تأريض',
        emotion_symptom_link: 'رسم خريطة المشاعر-الأعراض',
        overthinking:         'إيقاف الاجترار + تفريغ الأفكار',
        limiting_beliefs:     'تحدي المعتقدات السلبية + إعادة البرمجة',
        body_hypermonitor:    'تقليل سلوك المراقبة + تحويل الانتباه',
        self_criticism:       'بناء الرحمة الذاتية + تهدئة الصوت الداخلي',
        perfectionism:        'التخلي عن المثالية + قبول الجيد',
        confusion_directionless: 'استعادة الوضوح + اكتشاف الاتجاه',
        lost_serenity:        'استعادة السكينة الداخلية',
        rhythm_disruption:    'إعادة ضبط الإيقاع اليومي',
        lost_meaning:         'استكشاف المعنى والرسالة',
        inner_depletion:      'إعادة ملء الخزان الداخلي',
        self_disconnection:   'إعادة الاتصال بالذات والجسد',
        sleep_light_quiet:    'تهيئة بيئة النوم والسكون',
    };

    const primary  = actionMap[primarySub]   || `معالجة ${pSub}`;
    const secondary = actionMap[secondarySub] || `دعم ${sSub}`;

    return `${primary} + ${secondary}`;
}

/* ══════════════════════════════════════════════════════════
   CLINICAL EXPLANATION GENERATOR
   Clinician-grade Arabic explanation of *why* this routing
   ══════════════════════════════════════════════════════════ */

const SUBDOMAIN_CLINICAL_CONTEXT: Partial<Record<SubdomainId, string>> = {
    digestive:            'الأعراض الهضمية التي وصفتها تشير إلى خلل في المحور المعوي العصبي (Gut-Brain Axis)، وهو من أكثر المسارات التي تتأثر بالضغط المزمن والتغذية',
    hormonal:             'المؤشرات الهرمونية التي حددتها تشير إلى خلل في محور الغدد الصماء، والذي يتأثر مباشرة بالإجهاد المزمن والنوم والتغذية',
    inflammatory:         'نمط الأعراض يشير إلى حمل التهابي جهازي صامت (Silent Inflammation)، وهو الجذر الوظيفي لكثير من الأمراض المزمنة',
    energy_fatigue:       'نمط الإرهاق الذي وصفته يتجاوز "التعب العادي" ويشير إلى خلل في إنتاج الطاقة على المستوى الخلوي (ATP/Mitochondria)',
    sleep:                'اضطراب النوم الذي وصفته يشير إلى خلل في إيقاع الكورتيزول-الميلاتونين، وهو انعكاس مباشر لحالة الجهاز العصبي اللاإرادي',
    nutrition_deficiency: 'الأعراض تتوافق مع نقص في المغذيات الدقيقة (Micronutrients) — خاصة فيتامين د، المغنيسيوم، الحديد، أو ب١٢',
    musculoskeletal:      'نمط الألم يشير إلى مزيج من التوتر العضلي المزمن والحساسية المركزية (Central Sensitization)',
    skin_hair:            'التغيرات في الجلد والشعر غالباً ما تكون انعكاساً لخلل هرموني أو التهابي أو نقص غذائي داخلي',
    anxiety_arousal:      'نمط القلق يشير إلى فرط نشاط الجهاز العصبي الودي (Sympathetic Overdrive)، وهو استجابة مزمنة للتهديد',
    suppression_chronic_stress: 'الأعراض تشير إلى نمط كبت عاطفي مزمن يتحول إلى أعراض جسدية — وهو أحد أكثر الأنماط شيوعاً في الطب التكاملي',
    grief_depletion:      'الأعراض تتوافق مع نمط الحزن غير المعالج (Unprocessed Grief) الذي يستنزف الطاقة العاطفية والجسدية',
    psychosomatic:        'العلاقة بين مشاعرك وأعراضك الجسدية واضحة — هذا ليس "تخيلاً" بل آلية عصبية حقيقية (Psychoneuroimmunology)',
    panic:                'نوبات الهلع هي استجابة حادة من الجهاز العصبي اللاإرادي — قابلة للعلاج بالكامل مع الفهم الصحيح',
    emotion_symptom_link: 'جسمك يُترجم المشاعر غير المعبّر عنها إلى أعراض جسدية — وهذه الآلية موثقة علمياً وقابلة للتفكيك',
    overthinking:         'الاجترار الفكري يُرهق الجهاز العصبي ويستنزف الطاقة المعرفية — التدخل المبكر فعّال جداً',
    limiting_beliefs:     'المعتقدات المقيدة تعمل كبرمجة لاشعورية تُبقي الجهاز العصبي في حالة تأهب مزمنة',
    body_hypermonitor:    'المراقبة المفرطة للجسم تُضخّم الإشارات الطبيعية وتُحولها إلى مصدر قلق — وهي قابلة للتعديل',
    self_criticism:       'جلد الذات المزمن يرفع هرمونات الإجهاد باستمرار — التدخل بالرحمة الذاتية له تأثير بيولوجي مباشر',
    perfectionism:        'الكمالية ترفع مستوى الكورتيزول بشكل مزمن وتمنع الجسم من الدخول في وضع التعافي',
    lost_serenity:        'فقدان السكينة يعكس انقطاعاً عن الإيقاع الداخلي — استعادته تبدأ بإعادة ضبط الروتين اليومي',
    rhythm_disruption:    'خلل الإيقاع اليومي (Circadian Disruption) يؤثر على كل هرمون وكل عمليةbiologiche في الجسم',
    lost_meaning:         'فقدان المعنى يُترجم جسدياً إلى إرهاق وانسحاب — وهو من أعمق مسارات الشفاء عند معالجته',
    inner_depletion:      'الإرهاق الداخلي يشير إلى نمط عطاء مزمن بلا تغذية راجعة — الجسم يُطالب بالتوقف',
    self_disconnection:   'الانقطاع عن الذات هو آلية حماية قديمة — إعادة الاتصال تحتاج أماناً وتدرجاً',
    sleep_light_quiet:    'بيئة النوم والسكون تؤثر مباشرة على جودة التعافي الليلي — التعديلات البسيطة فعّالة جداً',
};

function generateClinicalExplanation(
    primary: DomainId,
    secondary: DomainId,
    primarySub: SubdomainId,
    secondarySub: SubdomainId,
    severity: number,
    duration: string,
): string {
    const pName = DOMAIN_NAMES[primary];
    const sName = DOMAIN_NAMES[secondary];
    const pContext = SUBDOMAIN_CLINICAL_CONTEXT[primarySub] || `الأعراض تشير إلى نمط ${SUBDOMAIN_NAMES[primarySub]} في البُعد ${pName}`;
    const durText = duration === 'months' ? 'الطبيعة المزمنة لهذه الأعراض' : duration === 'weeks' ? 'استمرار الأعراض لأسابيع' : 'هذه الأعراض';
    const sevText = severity >= 7 ? 'مع شدة مرتفعة تستدعي اهتماماً' : severity >= 4 ? 'بشدة متوسطة' : 'بشدة خفيفة';

    return `${pContext}. ${durText} ${sevText}، مع تأثير ثانوي من البُعد ${sName} (${SUBDOMAIN_NAMES[secondarySub]}) يُعزز النمط الرئيسي.`;
}

/* ══════════════════════════════════════════════════════════
   TODAY ACTION GENERATOR
   ══════════════════════════════════════════════════════════ */

const SUBDOMAIN_TODAY_ACTION: Partial<Record<SubdomainId, string>> = {
    digestive:            'تناول وجبة خفيفة سهلة الهضم اليوم، وسجّل أي أعراض بعد الأكل لمدة ٢٤ ساعة',
    hormonal:             'قس درجة حرارتك صباحاً قبل النهوض (BBT) وسجّلها — هذا مؤشر غير مباشر لنشاط الدرقية',
    inflammatory:         'تجنب السكر والأطعمة المصنّعة اليوم بالكامل — هذا أول خطوة لخفض الالتهاب',
    energy_fatigue:       'خذ قيلولة قصيرة (٢٠ دقيقة) بين ١-٣ ظهراً، وسجّل مستوى طاقتك كل ٣ ساعات',
    sleep:                'اضبط منبهاً قبل النوم بساعة لإيقاف كل الشاشات — ابدأ الليلة',
    nutrition_deficiency: 'اشرب ٨ أكواب ماء اليوم وتناول وجبة غنية بالخضار الورقية الداكنة',
    musculoskeletal:      'طبّق كمادة دافئة على منطقة الألم لمدة ١٥ دقيقة، ومارس ٥ دقائق تمدد خفيف',
    skin_hair:            'اشرب ٢ لتر ماء اليوم وتجنب منتجات الألبان — لاحظ أي تغيير خلال ٣ أيام',
    anxiety_arousal:      'مارس تمرين التنفس ٤-٧-٨ ثلاث مرات اليوم: شهيق ٤ ثوانٍ، حبس ٧، زفير ٨',
    suppression_chronic_stress: 'اكتب في دفتر لمدة ١٠ دقائق عن أي شيء تشعر به الآن — بلا رقابة أو تحرير',
    grief_depletion:      'اسمح لنفسك بـ ١٥ دقيقة هادئة اليوم — بلا مهام، بلا شاشات، فقط وجودك',
    psychosomatic:        'لاحظ اليوم: متى يزداد العرض الجسدي؟ بعد أي موقف أو شعور؟ سجّل ٣ ملاحظات',
    panic:                'حمّل تمرين التأريض (٥-٤-٣-٢-١) واحفظه في هاتفك — استخدمه عند أول إشارة للنوبة',
    emotion_symptom_link: 'ارسم خط زمني بسيط: قائمة بأبرز أحداثك العاطفية وبجانب كل حدث العرض الجسدي المرتبط',
    overthinking:         'عند بدء الاجترار، اكتب الفكرة على ورقة واتركها — هذا يُفرّغ الحلقة من طاقتها',
    limiting_beliefs:     'اكتب أكثر معتقد يُقيّدك الآن، ثم اسأل: من أين جاء؟ هل هو حقيقة أم تفسير؟',
    body_hypermonitor:    'حين تبدأ بمراقبة جسمك، انقل انتباهك لتمرين حسّي خارجي (اشمّ شيئاً، المس شيئاً)',
    self_criticism:       'في كل مرة تلاحظ صوت النقد الداخلي اليوم، ردّ عليه بجملة: "أنا أبذل ما أستطيع"',
    perfectionism:        'أنجز مهمة واحدة اليوم بنسبة ٧٠٪ فقط — تعمّد "الجيد الكافي" بدل الكمال',
    lost_serenity:        'خصص ١٠ دقائق للصمت التام اليوم — بلا موسيقى، بلا تطبيقات، فقط سكون',
    rhythm_disruption:    'نم واستيقظ في نفس الوقت غداً — حتى لو كان عطلة. الإيقاع أهم من عدد الساعات',
    lost_meaning:         'اكتب ٣ أشياء صغيرة أعطتك شعوراً بالمعنى هذا الأسبوع — مهما كانت بسيطة',
    inner_depletion:      'ألغِ التزاماً واحداً غير ضروري اليوم — جسمك يحتاج هذه المساحة',
    self_disconnection:   'ضع يدك على صدرك لدقيقتين وتنفس ببطء — هذا تمرين إعادة اتصال بسيط وفعّال',
    sleep_light_quiet:    'خفّض إضاءة البيت بعد المغرب واستبدل الضوء الأبيض بضوء دافئ — ابدأ الليلة',
};

function generateTodayAction(primarySub: SubdomainId): string {
    return SUBDOMAIN_TODAY_ACTION[primarySub] || 'ابدأ بتسجيل أعراضك اليوم في دفتر — الوعي هو الخطوة الأولى للتعافي';
}

/* ══════════════════════════════════════════════════════════
   MONITOR ITEMS GENERATOR
   ══════════════════════════════════════════════════════════ */

const SUBDOMAIN_MONITOR: Partial<Record<SubdomainId, string[]>> = {
    digestive:            ['انتفاخ بعد الوجبات', 'نوعية البراز وانتظامه', 'علاقة الأعراض بأطعمة محددة'],
    hormonal:             ['درجة الحرارة الصباحية', 'مستوى الطاقة عبر اليوم', 'تغيرات المزاج المرتبطة بالدورة'],
    inflammatory:         ['مستوى الألم الصباحي', 'تيبّس المفاصل عند الاستيقاظ', 'استجابة الجسم للسكر والمصنّع'],
    energy_fatigue:       ['مستوى الطاقة كل ٣ ساعات', 'جودة النوم الليلي', 'تأثير الوجبات على الطاقة'],
    sleep:                ['وقت النوم والاستيقاظ الفعلي', 'عدد مرات الاستيقاظ الليلي', 'مستوى النشاط صباحاً'],
    nutrition_deficiency: ['كمية الماء اليومية', 'تنوع الأطعمة الملونة', 'علامات النقص (تشقق الشفاه، إرهاق)'],
    musculoskeletal:      ['شدة الألم (٠-١٠) صباحاً ومساءً', 'تأثير الحركة على الألم', 'التيبّس الصباحي'],
    anxiety_arousal:      ['عدد نوبات القلق اليومية', 'محفزات القلق (مواقف محددة)', 'فعالية تمارين التنفس'],
    suppression_chronic_stress: ['الأعراض الجسدية بعد مواقف الضغط', 'جودة النوم', 'لحظات الانفجار أو الانسحاب'],
    grief_depletion:      ['مستوى الطاقة العاطفية', 'الرغبة في الانسحاب', 'لحظات الدمع أو الثقل'],
    psychosomatic:        ['توقيت ظهور العرض الجسدي', 'الموقف العاطفي المصاحب', 'تحسّن العرض بعد التعبير'],
    panic:                ['عدد النوبات وشدتها', 'المحفزات المحتملة', 'فعالية تقنيات التأريض'],
    overthinking:         ['مدة حلقات الاجترار', 'المواضيع المتكررة', 'ما الذي يقطع الحلقة'],
    lost_serenity:        ['دقائق السكون اليومية', 'مستوى السلام الداخلي (٠-١٠)', 'الأنشطة التي تعيد الهدوء'],
    rhythm_disruption:    ['انتظام وقت النوم والاستيقاظ', 'التعرض لضوء الشمس صباحاً', 'الطاقة بعد الظهر'],
    inner_depletion:      ['عدد الالتزامات اليومية', 'لحظات الراحة الحقيقية', 'الشعور بالذنب عند التوقف'],
};

function generateMonitorItems(primarySub: SubdomainId, secondarySub: SubdomainId): string[] {
    const primary  = SUBDOMAIN_MONITOR[primarySub]  ?? ['شدة الأعراض يومياً', 'جودة النوم', 'مستوى الطاقة'];
    const secondary = SUBDOMAIN_MONITOR[secondarySub] ?? [];
    // Take 2-3 from primary, 1 from secondary for variety
    const items = [...primary.slice(0, 3)];
    if (secondary.length > 0 && items.length < 4) {
        items.push(secondary[0]);
    }
    return items.slice(0, 4);
}

/* ══════════════════════════════════════════════════════════
   SEEK CARE WHEN — Warning signs generator
   ══════════════════════════════════════════════════════════ */

const PATHWAY_SEEK_CARE: Record<string, string> = {
    fatigue:   'إذا ظهر ضيق تنفس مفاجئ، فقدان وزن سريع غير مبرر، أو حمى لا تستجيب للعلاج — راجع طبيباً خلال ٢٤ ساعة',
    headache:  'إذا حدث صداع مفاجئ شديد "كضربة رعد"، أو صداع مع حمى وتصلب رقبة، أو ضعف في طرف — الطوارئ فوراً',
    digestion: 'إذا ظهر دم في البراز، ألم بطن شديد مفاجئ، أو فقدان وزن سريع مع تغير في الإخراج — راجع طبيباً عاجلاً',
    sleep:     'إذا لاحظ شريكك توقف تنفسك أثناء النوم، أو لم تنم لأكثر من ٤٨ ساعة متواصلة — تقييم طبي ضروري',
    pain:      'إذا ظهر ألم صدر مع ضيق تنفس، ضعف مفاجئ في طرف، أو فقدان تحكم في المثانة — الطوارئ فوراً',
    anxiety:   'إذا ظهرت أفكار إيذاء النفس، نوبة هلع لا تهدأ خلال ٢٠ دقيقة، أو عدم القدرة على الأكل لأيام — اتصل بطبيبك الآن',
    hormonal:  'إذا حدث خفقان سريع جداً مع تعرق وارتعاش مفاجئ، أو نزيف غير طبيعي حاد — تقييم عاجل ضروري',
    immune:    'إذا ظهرت حمى فوق ٣٩ مع التهاب شديد، كتلة جديدة في الغدد، أو تعب شديد مع نزيف — الطوارئ فوراً',
};

function generateSeekCareWhen(pathwayId: string): string {
    return PATHWAY_SEEK_CARE[pathwayId] || 'إذا تفاقمت الأعراض بشكل مفاجئ أو ظهرت أعراض جديدة مقلقة — لا تتردد في مراجعة طبيب مختص';
}

/* ══════════════════════════════════════════════════════════
   SPRINT B: PATHWAY PHENOTYPES
   30 subtypes across 8 pathways — inferred from existing answers
   User-facing labels always use pattern language: "يميل إلى…"
   ══════════════════════════════════════════════════════════ */

interface PhenotypeDefinition {
    id: string;
    label: string;        // Arabic pattern label
    description: string;  // 2-sentence Arabic clinical description
    triggers: string[];   // Answer strings that activate this phenotype
}

const PATHWAY_PHENOTYPES: Record<string, PhenotypeDefinition[]> = {
    fatigue: [
        {
            id: 'adrenal_exhaustion_pattern',
            label: 'الصورة الحالية أقرب إلى نمط استنزاف الكظرية',
            description: 'التعب الصباحي قبل أي مجهود مع حساسية للكافيين والضغط يُشير لاستنزاف في نظام الإجهاد-التكيّف. هذا النمط يستجيب للراحة الموجّهة واستعادة إيقاع الكورتيزول.',
            triggers: ['أستيقظ منهكاً قبل أي مجهود', 'لا أتحمل الكافيين والتوتر (كظرية)', 'تسوء بالضغط النفسي', 'لا شيء يُحسّنها'],
        },
        {
            id: 'metabolic_fatigue_pattern',
            label: 'يميل إلى نمط التعب الأيضي',
            description: 'هبوط الطاقة بعد الأكل والشوق للسكر يُشير لخلل في تنظيم سكر الدم أو وظيفة الميتوكوندريا. الفحص الوظيفي للأنسولين والحديد ومؤشرات الطاقة منطقي هنا.',
            triggers: ['هبوط طاقة منتصف النهار', 'أشتاق للسكر باستمرار (خلل سكر الدم)', 'إرهاق بعد الأكل مباشرة', 'تسوء بعد الأكل الثقيل'],
        },
        {
            id: 'thyroid_pattern',
            label: 'نمط شبيه بخلل الدرقية',
            description: 'التعب مع برودة الأطراف وتساقط الشعر وزيادة الوزن يُشكّل مجموعة أعراض متسقة مع خلل الغدة الدرقية. تحليل TSH و T4 الحر خطوة طبيعية هنا.',
            triggers: ['برود وتساقط شعر وزيادة وزن (الدرقية)', 'ضبابية ذهنية مع الإرهاق'],
        },
        {
            id: 'emotional_exhaustion_pattern',
            label: 'يميل إلى الاستنزاف العاطفي',
            description: 'فقدان الدافع وثقل عاطفي يسبق أي مجهود جسدي يُشير لطبقة نفسية-جسدية عميقة. هذا النمط يستجيب للعمل النفسي-الجسدي بجانب الدعم الجسدي.',
            triggers: ['أحمل ثقلاً عاطفياً يسبق التعب', 'فقدان الدافع يسبق الإرهاق الجسدي', 'الإرهاق مرتبط بمواقف الإجبار'],
        },
    ],
    headache: [
        {
            id: 'migraine_like_pattern',
            label: 'نمط شبيه بالصداع النصفي',
            description: 'نبضات أحادية الجانب مع حساسية للضوء والصوت وغثيان تُشكّل صورة كلاسيكية للصداع النصفي. التوثيق الدقيق للمحفّزات والمدة هو الخطوة الأولى.',
            triggers: ['نبضات من جانب واحد', 'تسوء مع الضوء والأصوات', 'غثيان مع الصداع'],
        },
        {
            id: 'tension_somatic_pattern',
            label: 'يميل إلى نمط صداع التوتر والكبت',
            description: 'ضغط حول الرأس يتحسن بالضغط على الصدغين ويظهر أوقات الكبت والصمت يُشير لتوتر عضلي ونفس-جسدي مشترك. تقنيات الإرخاء والتعبير تُخفّفه.',
            triggers: ['ضغط حول الرأس', 'يظهر في أوقات الكبت والصمت', 'تتحسن بالضغط على الصدغين', 'تخف بالظلام والسكون'],
        },
        {
            id: 'cervicogenic_pattern',
            label: 'نمط شبيه بصداع الرقبة',
            description: 'الصداع الذي يبدأ من الرقبة والكتفين ويتحسن بتمارين الرقبة يُشير لمصدر هيكلي-عضلي رقبي. تقييم العمود الفقري العنقي مفيد.',
            triggers: ['يبدأ من الرقبة أو الكتفين', 'تتحسن بتمارين الرقبة'],
        },
        {
            id: 'metabolic_headache_pattern',
            label: 'يميل إلى الصداع الأيضي/الجفاف',
            description: 'الارتباط الواضح بالجوع والجفاف وهبوط الطاقة يُشير لحساسية سكر الدم والإماهة. تنظيم الوجبات وزيادة السوائل يُحسّن هذا النمط بشكل ملحوظ.',
            triggers: ['ترتبط بالجوع أو الجفاف', 'هبوط طاقة منتصف النهار', 'تظهر بعد الشاشات الطويلة'],
        },
    ],
    digestion: [
        {
            id: 'upper_gi_irritation',
            label: 'نمط شبيه بتهيّج المسالك الهضمية العلوية',
            description: 'الحرقة والارتجاع مع تفاقم بعد الأكل والتوتر يُشير لخلل في بوابة المعدة وارتجاع الحمض. تجنب المحفّزات والأكل البطيء يقلل الحملة.', 
            triggers: ['حرقة أو ارتجاع', 'يسوء بعد الأكل مباشرة', 'تسوء في الصباح الباكر'],
        },
        {
            id: 'motility_bloating',
            label: 'يميل إلى نمط الانتفاخ وخلل الحركة',
            description: 'الانتفاخ بعد الأكل مع بطء الهضم وتغيّر الإخراج يُشير لخلل في حركة الأمعاء ونمو بكتيري غير متوازن. تقييم البروبيوتيك والأغذية المخمّرة منطقي.',
            triggers: ['انتفاخ بعد الأكل', 'تغير نمط الإخراج', 'الإمساك يتناوب مع الإسهال'],
        },
        {
            id: 'stress_gut_pattern',
            label: 'يميل إلى نمط الأمعاء المدفوعة بالإجهاد',
            description: 'تحسّن الجهاز الهضمي في الإجازات وتفاقمه في مواقف الإجبار هو علامة كلاسيكية لمحور الأمعاء-الدماغ. معالجة البُعد النفسي موازية للدعم الجسدي.',
            triggers: ['الأمعاء تنفعل في مواقف الإجبار', 'تتحسن في الإجازات', 'تسوء مع السفر أو تغير الروتين'],
        },
        {
            id: 'dysbiosis_pattern',
            label: 'نمط شبيه بخلل الميكروبيوم',
            description: 'التاريخ بالمضادات الحيوية مع عدوى فطرية متكررة وأعراض هضمية يُشير لخلل في توازن البكتيريا المعوية. إعادة بناء الميكروبيوم خطوة منطقية.',
            triggers: ['الغثيان عند التفكير بشيء مرفوض', 'الإمساك — صعوبة التخلي', 'استخدام مضادات حيوية طويلة سابقاً'],
        },
    ],
    sleep: [
        {
            id: 'onset_insomnia_pattern',
            label: 'يميل إلى صعوبة البدء بالنوم',
            description: 'العقل النشط والأفكار التي لا تتوقف عند النوم هو نمط الأرق الأكثر شيوعاً ويرتبط بفرط استثارة الجهاز العصبي. تقنيات هدوء الجهاز العصبي قبل النوم هي الأساس.',
            triggers: ['العقل يظل نشطاً عند النوم', 'أفكار آخر اليوم تُنهيني', 'يسوء قبل النوم'],
        },
        {
            id: 'maintenance_insomnia_pattern',
            label: 'نمط شبيه بالاستيقاظ الليلي',
            description: 'النوم يبدأ ثم يتقطع مرات ومرات يُشير لخلل في إيقاع الكورتيزول الليلي أو نقص المغنيسيوم. فحص هرمونات النوم ومستوى المغنيسيوم منطقي.',
            triggers: ['أنام ثم أستيقظ مرات', 'أستيقظ مبكراً ولا أعود', 'خلل في الميلاتونين أو الكورتيزول', 'نقص المغنيسيوم (تشنج ليلي)'],
        },
        {
            id: 'hypervigilance_sleep_pattern',
            label: 'يميل إلى نمط النوم مع اليقظة المفرطة',
            description: 'الحاجة لصوت أو حضور آمن للنوم هي إشارة لجهاز عصبي متيقّظ باستمرار. العمل على الأمان العصبي والتنظيم هو أعمق مستوى للمعالجة.',
            triggers: ['أحتاج صوتاً أو ضوءاً للنوم', 'النوم يتحسن برفقة شخص آمن', 'المرض يعني التوقف — أرفض'],
        },
        {
            id: 'circadian_disruption_pattern',
            label: 'يميل إلى خلل إيقاع الساعة البيولوجية',
            description: 'الشاشات والكافيين بعد الظهر مع ضوضاء بيئية يُشير لخلل في إشارات الميلاتونين الطبيعية. تطبيق نظافة النوم الأساسية يُصلح هذا النمط في أسابيع.',
            triggers: ['شاشات حتى وقت النوم', 'الكافيين بعد الظهر', 'النوم يتحسن في غرفة باردة ومظلمة'],
        },
    ],
    pain: [
        {
            id: 'inflammatory_pain_pattern',
            label: 'نمط شبيه بالألم الالتهابي',
            description: 'ألم صباحي يتحسن بالحركة ثم يشتد ليلاً مع استراحة الجسم هو نمط التهابي كلاسيكي. التقييم الروماتولوجي وتقليل الحمل الالتهابي في النظام الغذائي منطقيان.',
            triggers: ['صباحي يتحسن بالحركة (التهاب)', 'يشتد ليلاً ويمنع النوم', 'يسوء بالجلوس الطويل'],
        },
        {
            id: 'neuropathic_pain_pattern',
            label: 'يميل إلى نمط الألم العصبي',
            description: 'الإحساس الحارق أو الوخز الكهربائي مع الضبابية الذهنية يُشير لمسار عصبي. تقييم بي-12 وفيتامين د والغلوكوز مفيد في هذا النمط.',
            triggers: ['حارق أو وخز كهربائي (عصبي)', 'ضبابية ذهنية مع الإرهاق', 'ألم منتشر مع ضبابية ذهنية'],
        },
        {
            id: 'tension_myofascial_pattern',
            label: 'يميل إلى نمط التوتر العضلي-اللفافي',
            description: 'ألم مستمر يسوء بالجلوس الطويل ويتحسن بالحركة الخفيفة هو نمط توتر عضلي-لفافي شائع. التمدد والمشي المنتظم والمغنيسيوم فعّالون في هذا النمط.',
            triggers: ['مستمر لا يتوقف', 'يسوء بالجلوس الطويل', 'يتحسن بالحركة الخفيفة', 'يتحسن بالمغنيسيوم أو الحرارة'],
        },
        {
            id: 'somatic_pain_pattern',
            label: 'يميل إلى نمط الألم النفس-جسدي',
            description: 'الألم الذي يتحسن بالتدليك والاعتراف والتقدير ويحمل رسائل عاطفية واضحة يُشير لمعالجة عاطفية محبوسة. العمل الجسدي-النفسي مفتاح هذا النمط.',
            triggers: ['يتحسن بالتدليك أو اللمس', 'الألم يخف بالاعتراف والتقدير', 'أحمل هموم الآخرين (الكتفان)', 'عواطف محبوسة في الصدر'],
        },
    ],
    anxiety: [
        {
            id: 'panic_dominant_pattern',
            label: 'نمط شبيه بنوبات الهلع',
            description: 'نوبات مفاجئة من الخوف مع خفقان وضيق تنفس هي صورة كلاسيكية للقلق الانتيابي. التنفس المتحكّم والتدريب على الاسترخاء العميق يُقلص شدة النوبات.',
            triggers: ['نوبات مفاجئة من الخوف', 'خفقان متكرر وضيق بلا سبب طبي', 'يسوء في الأماكن المزدحمة'],
        },
        {
            id: 'generalized_anxiety_pattern',
            label: 'يميل إلى نمط القلق العام',
            description: 'قلق مستمر مع توتر عضلي لا يتوقف هو نمط القلق المُعمّم الذي يستجيب جيداً للعلاج المعرفي-السلوكي والتقنيات الجسدية.',
            triggers: ['قلق مستمر والتفكير لا يتوقف', 'توتر عضلي مزمن وشد الفك', 'الكمالية تجعلني في توتر دائم'],
        },
        {
            id: 'somatic_anxiety_pattern',
            label: 'نمط شبيه بالقلق الجسدي',
            description: 'القلق يظهر أولاً كأعراض جسدية (خفقان، ضيق، غثيان) قبل أن يكون تفكيراً. العمل على تنظيم الجهاز العصبي اللاإرادي هو الطريق الأمثل.',
            triggers: ['خفقان متكرر وضيق بلا سبب طبي', 'القلق يزداد بعد السكر (سكر الدم)', 'يسوء قبل النوم'],
        },
        {
            id: 'attachment_anxiety_pattern',
            label: 'يميل إلى نمط القلق الارتباطي',
            description: 'القلق الذي يتحسن بوجود شخص آمن ويشتد في المواقف الاجتماعية يُشير لجذور ارتباطية مبكرة. العلاج النفسي الذي يُخاطب نظام التعلّق هو الأعمق تأثيراً.',
            triggers: ['تعلّمت القلق في بيئة غير آمنة', 'الخوف من الرفض والفقدان', 'يتحسن بوجود شخص آمن'],
        },
    ],
    hormonal: [
        {
            id: 'thyroid_dominant_pattern',
            label: 'نمط شبيه بخلل الدرقية',
            description: 'مجموعة البرودة وتساقط الشعر وتغير الوزن مع اضطراب TSH هي أعراض متسقة مع خلل الغدة الدرقية. التحليل الشامل (TSH, T3, T4 free, anti-TPO) يُحدد الصورة.',
            triggers: ['TSH مرتفع أو منخفض', 'برود وتساقط شعر وزيادة وزن (الدرقية)', 'برودة دائمة في اليدين والقدمين'],
        },
        {
            id: 'adrenal_hormonal_pattern',
            label: 'يميل إلى نمط استنزاف الكظرية الهرموني',
            description: 'تفاقم الأعراض الهرمونية بعد فترات الإجهاد مع خلل DHEA والكورتيزول يُشير لتأثير المحور تحت المهاد-النخامية-الكظرية على الهرمونات الجنسية.',
            triggers: ['الاضطراب الهرموني بدأ بعد إجهاد', 'خلل في DHEA أو الكورتيزول', 'الأعراض تسوء مع الإجهاد'],
        },
        {
            id: 'reproductive_hormonal_pattern',
            label: 'يميل إلى نمط الخلل الهرموني التناسلي',
            description: 'اضطراب الدورة الشهرية مع تغيرات مزاجية حادة وانخفاض الرغبة يُشير لخلل في هرمونات المحور التناسلي. تقييم الاستروجين/البروجسترون/الأندروجين ضروري.',
            triggers: ['اضطراب الدورة الشهرية', 'اضطراب PCOS', 'انخفاض الرغبة الجنسية', 'تغيرات مزاجية حادة أو اكتئاب'],
        },
        {
            id: 'metabolic_hormonal_pattern',
            label: 'نمط شبيه بالخلل الهرموني الأيضي',
            description: 'مقاومة الأنسولين مع تغير الوزن وارتباط الأعراض بتغيرات الوزن يُشير لخلل محور الأنسولين-الكورتيزول. فحص مقاومة الأنسولين والسكر التراكمي منطقي.',
            triggers: ['نسبة انسولين مرتفعة أو مقاومة', 'تغير وزن بلا تغير في العادات', 'ترتبط بتغيرات الوزن'],
        },
    ],
    immune: [
        {
            id: 'recurrent_infection_pattern',
            label: 'يميل إلى نمط العدوى المتكررة',
            description: 'نزلات برد وعدوى فطرية متكررة مع التئام بطيء للجروح يُشير لضعف استجابة مناعية خلوية. فيتامين د والزنك والبروبيوتيك أساسية في البروتوكول.',
            triggers: ['نزلات برد وعدوى متكررة', 'عدوى فطرية متكررة (كانديدا)', 'التئام بطيء للجروح'],
        },
        {
            id: 'autoimmune_pattern',
            label: 'نمط شبيه بالاستجابة المناعية الذاتية',
            description: 'أمراض مناعية ذاتية مع حساسيات متعددة وتعب شديد مع أي مرض يُشير لتنشيط مناعي مزمن. التقييم الروماتولوجي والمؤشرات الالتهابية (CRP, ANA) ضروريان.',
            triggers: ['أمراض مناعية ذاتية', 'حساسيات متعددة تزداد', 'تعب شديد مع أي مرض'],
        },
        {
            id: 'burnout_immunity_pattern',
            label: 'يميل إلى نمط انهيار المناعة بعد الإجهاد',
            description: 'المرض بعد كل إجازة أو توقف عن العطاء هو نمط نفس-مناعي كلاسيكي مرتبط بالحاجز العاطفي. معالجة دورة الإجهاد-التوقف من أعمق ما يُساعد.',
            triggers: ['أمرض بعد كل إجازة أو راحة', 'الجسم ينهار حين أتوقف عن العطاء', 'المرض هو الطريقة الوحيدة للراحة'],
        },
    ],
};

function inferPhenotype(
    pathwayId: string,
    answers: EngineAnswers,
): { id: string; label: string; description: string; matchScore: number } {
    const phenotypes = PATHWAY_PHENOTYPES[pathwayId];
    if (!phenotypes || phenotypes.length === 0) {
        return { id: 'unknown', label: '', description: '', matchScore: 0 };
    }

    const allValues = Object.values(answers.clinicalAnswers).flat() as string[];

    // Fix 2: Normalize Arabic strings before matching
    // Strips parenthetical annotations like '(خلل سكر الدم)' so triggers still match
    // even if the option text uses a slightly different form
    const normalize = (s: string) => s.replace(/\s*\([^)]*\)/g, '').trim();
    const normalizedValues = allValues.map(normalize);

    let bestMatch = phenotypes[0];
    let bestScore = 0;

    for (const p of phenotypes) {
        const matches = p.triggers.filter(t => normalizedValues.includes(normalize(t))).length;
        const score = Math.round((matches / Math.max(1, p.triggers.length)) * 100);
        if (score > bestScore) {
            bestScore = score;
            bestMatch = p;
        }
    }

    return {
        id: bestMatch.id,
        label: bestMatch.label,
        description: bestMatch.description,
        matchScore: bestScore,
    };
}

/* ══════════════════════════════════════════════════════════
   MAIN SCORING ENGINE
   ══════════════════════════════════════════════════════════ */

export function computeRouting(
    answers: EngineAnswers,
    triageResult: TriageResult,
): RoutingResult {
    // ── Step 1: Initialize domain scores ──
    const scores: Record<DomainId, number> = {
        jasadi: 0,
        nafsi:  0,
        fikri:  0,
        ruhi:   0,
    };

    // ── Step 2: Add pathway base scores ──
    const pathwayBoost = PATHWAY_DOMAIN_SCORES[answers.pathwayId];
    if (pathwayBoost) {
        for (const [d, v] of Object.entries(pathwayBoost)) {
            scores[d as DomainId] += v as number;
        }
    }

    // ── Step 3: Add functional pattern boost ──
    const funcBoost = FUNCTIONAL_DOMAIN_BOOST[triageResult.topFunctionalPattern];
    if (funcBoost) {
        for (const [d, v] of Object.entries(funcBoost)) {
            scores[d as DomainId] += v as number;
        }
    }

    // ── Step 4: Add somatic theme boost ──
    const somBoost = SOMATIC_DOMAIN_BOOST[triageResult.topSomaticTheme];
    if (somBoost) {
        for (const [d, v] of Object.entries(somBoost)) {
            scores[d as DomainId] += v as number;
        }
    }

    // ── Step 5: Add emotional context boost (with cap) ──
    const emotionalAccumulator: Record<DomainId, number> = { jasadi: 0, nafsi: 0, fikri: 0, ruhi: 0 };
    for (const emo of answers.emotionalContext) {
        if (emo === 'none') continue;
        const emoBoost = EMOTIONAL_DOMAIN_BOOST[emo];
        if (emoBoost) {
            for (const [d, v] of Object.entries(emoBoost)) {
                emotionalAccumulator[d as DomainId] += v as number;
            }
        }
    }
    // Apply cap: no domain gets more than EMOTIONAL_BONUS_CAP from emotions
    for (const d of ['jasadi', 'nafsi', 'fikri', 'ruhi'] as DomainId[]) {
        scores[d] += Math.min(emotionalAccumulator[d], EMOTIONAL_BONUS_CAP);
    }

    // ── Step 5a: Severity-Duration Interaction Matrix ──
    // Compound effect — severity + duration together modulate domains
    const sdKey = `${sevBucket(answers.severity)}_${answers.duration}`;
    const sdEffect = SEV_DUR_MATRIX[sdKey];
    let compoundEscalationWeight = 0;
    if (sdEffect) {
        scores.jasadi += sdEffect.jasadiBoost;
        scores.ruhi   += sdEffect.ruhiBoost;
        scores.fikri  += sdEffect.fikriBoost;
        scores.nafsi  += sdEffect.nafsiBoost;
        compoundEscalationWeight = sdEffect.escalationWeight;
    }

    // ── Step 5a2: Cross-Symptom Correlation ──
    // Detect keywords in clinical answers that hint at OTHER pathways
    const allClinicalText = Object.values(answers.clinicalAnswers).flat().join(' ');
    const crossSubdomainHints: SubdomainId[] = [];
    for (const corr of CROSS_CORRELATIONS) {
        // Don't apply correlation for the current pathway's own keywords
        const matchCount = corr.keywords.filter(kw => allClinicalText.includes(kw)).length;
        if (matchCount >= 2) {
            // Strong signal: 2+ keywords matched
            for (const [d, v] of Object.entries(corr.domainBoost)) {
                scores[d as DomainId] += v as number;
            }
            crossSubdomainHints.push(...corr.subdomainHints);
        } else if (matchCount === 1) {
            // Weak signal: 1 keyword — half boost
            for (const [d, v] of Object.entries(corr.domainBoost)) {
                scores[d as DomainId] += Math.ceil((v as number) / 2);
            }
        }
    }

    // ── Step 5b: Physical pathway protection rule ──
    // For physical pathways, emotional context should not override jasadi
    // unless: emotional tags >= 2 AND severity >= 7 AND duration >= weeks
    // EXCEPTION: existential/spiritual contexts (identity, loneliness, disconnected, grief)
    // with chronic duration may allow ruhi to lead — this is "loss of meaning" archetype
    const isPhysicalPathway = PHYSICAL_PATHWAYS.has(answers.pathwayId);
    if (isPhysicalPathway) {
        const emoTagCount = answers.emotionalContext.filter(e => e !== 'none').length;
        const isLongDuration = answers.duration === 'weeks' || answers.duration === 'months';
        const emotionalOverrideAllowed = emoTagCount >= 2 && answers.severity >= 7 && isLongDuration;

        // Existential exception: if dominant non-jasadi is ruhi, and emotional tags
        // are existential, and duration is months → allow ruhi to lead
        const EXISTENTIAL_TAGS = new Set(['identity', 'loneliness', 'disconnected', 'grief']);
        const existentialTags = answers.emotionalContext.filter(e => EXISTENTIAL_TAGS.has(e));
        const isExistentialOverride = existentialTags.length >= 2
            && answers.duration === 'months'
            && scores.ruhi >= scores.nafsi;  // ruhi is the natural leading non-jasadi

        if (!emotionalOverrideAllowed && !isExistentialOverride) {
            // Ensure jasadi stays dominant for physical pathways
            const maxNonJasadi = Math.max(scores.nafsi, scores.fikri, scores.ruhi);
            if (maxNonJasadi > scores.jasadi) {
                // Boost jasadi to at least match the highest competitor
                scores.jasadi = maxNonJasadi + 1;
            }
        }
        // If isExistentialOverride → allow natural scoring (no jasadi protection)
        // The post-sort swap in Step 7 handles promoting ruhi
    }

    // ── Step 6: Severity modulation ──
    // High severity → boost jasadi (physical symptoms are severe)
    if (answers.severity >= 7) {
        scores.jasadi += 2;
    }

    // Long duration → boost ruhi (chronic → rhythmic/spiritual dimension)
    if (answers.duration === 'months') {
        scores.ruhi += 2;
        scores.fikri += 1;
    }

    // ── Step 7: Determine primary & secondary domains ──
    const sortedDomains = (Object.entries(scores) as [DomainId, number][])
        .sort(([, a], [, b]) => b - a);

    let primary   = sortedDomains[0][0];
    let secondary = sortedDomains[1][0];

    // Ensure primary ≠ secondary (should always be true, but guard)
    if (primary === secondary && sortedDomains.length > 1) {
        secondary = sortedDomains[1][0];
    }

    // ── Step 7b: Existential archetype post-sort swap ──
    // If jasadi won but existential override conditions are met,
    // and ruhi is within striking distance (≥80% of jasadi raw score),
    // promote ruhi to primary and jasadi to secondary.
    if (isPhysicalPathway && primary === 'jasadi') {
        const EXISTENTIAL_TAGS_CHECK = new Set(['identity', 'loneliness', 'disconnected', 'grief']);
        const existentialCount = answers.emotionalContext.filter(e => EXISTENTIAL_TAGS_CHECK.has(e)).length;
        const ruhiCloseEnough = scores.ruhi >= scores.jasadi * 0.75;
        if (existentialCount >= 2 && answers.duration === 'months' && ruhiCloseEnough && scores.ruhi >= scores.nafsi) {
            // Swap: ruhi becomes primary, jasadi becomes secondary
            primary = 'ruhi';
            secondary = 'jasadi';
        }
    }

    // ── Step 8: Determine subdomains ──
    const subdomainTally: Record<string, number> = {};

    // Pathway hints
    const pwHints = PATHWAY_SUBDOMAIN_HINTS[answers.pathwayId] ?? [];
    for (const s of pwHints) {
        subdomainTally[s] = (subdomainTally[s] ?? 0) + 3;
    }

    // Functional pattern hints
    const funcHints = FUNCTIONAL_SUBDOMAIN_HINTS[triageResult.topFunctionalPattern] ?? [];
    for (const s of funcHints) {
        subdomainTally[s] = (subdomainTally[s] ?? 0) + 2;
    }

    // Somatic theme hints
    const somHints = SOMATIC_SUBDOMAIN_HINTS[triageResult.topSomaticTheme] ?? [];
    for (const s of somHints) {
        subdomainTally[s] = (subdomainTally[s] ?? 0) + 2;
    }

    // Cross-symptom correlation hints (from Step 5a2)
    for (const s of crossSubdomainHints) {
        subdomainTally[s] = (subdomainTally[s] ?? 0) + 2;
    }

    // Answer-driven subdomain boosts
    // Each specific clinical answer string maps to subdomain point boosts
    const allAnswerValues = Object.values(answers.clinicalAnswers).flat() as string[];
    for (const ans of allAnswerValues) {
        const boosts = ANSWER_SUBDOMAIN_BOOST[ans];
        if (boosts) {
            for (const { sub, points } of boosts) {
                subdomainTally[sub] = (subdomainTally[sub] ?? 0) + points;
            }
        }
    }

    // Filter subdomains by domain, then pick top
    const primarySubdomainIds   = DOMAIN_BY_ID[primary]?.subdomains.map(s => s.id) ?? [];
    const secondarySubdomainIds = DOMAIN_BY_ID[secondary]?.subdomains.map(s => s.id) ?? [];

    const primarySub = pickTopSubdomain(subdomainTally, primarySubdomainIds);
    const secondarySub = pickTopSubdomain(subdomainTally, secondarySubdomainIds);

    // ── Step 9: Select 5 recommended tools ──
    const primaryTools   = SUBDOMAIN_BY_ID[primarySub]?.tools ?? [];
    const secondaryTools = SUBDOMAIN_BY_ID[secondarySub]?.tools ?? [];

    // Pick: 1 protocol, 1 practice, 1 test from primary; 1 workshop, 1 tracker from secondary
    const recommended: ToolRecommendation[] = [];

    const pickByType = (tools: ToolRecommendation[], type: string): ToolRecommendation | undefined =>
        tools.find(t => t.type === type);

    const primaryProtocol = pickByType(primaryTools, 'protocol');
    const primaryPractice = pickByType(primaryTools, 'practice');
    const primaryTest     = pickByType(primaryTools, 'test');
    const primaryWorkshop = pickByType(primaryTools, 'workshop');
    const primaryTracker  = pickByType(primaryTools, 'tracker');

    // Prefer mixing primary + secondary for variety
    const secondaryWorkshop = pickByType(secondaryTools, 'workshop');
    const secondaryTracker  = pickByType(secondaryTools, 'tracker');

    if (primaryProtocol) recommended.push(primaryProtocol);
    if (primaryPractice) recommended.push(primaryPractice);
    if (primaryTest)     recommended.push(primaryTest);
    if (secondaryWorkshop) recommended.push(secondaryWorkshop);
    else if (primaryWorkshop) recommended.push(primaryWorkshop);
    if (secondaryTracker) recommended.push(secondaryTracker);
    else if (primaryTracker) recommended.push(primaryTracker);

    // Cap at 5
    const finalTools = recommended.slice(0, 5);

    // ── Step 10: Normalize scores to 0–100 ──
    const maxScore = Math.max(1, ...Object.values(scores));
    const normalizedScores: Record<DomainId, number> = {
        jasadi: Math.round((scores.jasadi / maxScore) * 100),
        nafsi:  Math.round((scores.nafsi  / maxScore) * 100),
        fikri:  Math.round((scores.fikri  / maxScore) * 100),
        ruhi:   Math.round((scores.ruhi   / maxScore) * 100),
    };

    // ── Step 11: Generate text ──
    const why      = generateWhy(primary, secondary, primarySub, secondarySub);
    const priority = generatePriority(primarySub, secondarySub);

    // ── Step 12: Escalation check (3-tier) ──
    // Tier 1: Emergency — real red flags
    // Tier 2: Urgent — high severity + high triage score
    // Tier 3: Manageable — no escalation
    const scoreGap = normalizedScores[primary] - normalizedScores[secondary];
    const confidence: 'high' | 'medium' | 'low' = scoreGap >= 30 ? 'high' : scoreGap >= 15 ? 'medium' : 'low';

    let escalation_needed = false;
    if (triageResult.level === 'emergency' || answers.hasEmergencyFlag) {
        // Tier 1: Real emergency
        escalation_needed = true;
    } else if (answers.severity >= 7 && triageResult.score >= 8) {
        // Tier 2: High severity + high triage score
        escalation_needed = true;
    } else if (confidence === 'low' && answers.duration === 'months') {
        // Tier 2b: Low confidence with chronic duration
        escalation_needed = true;
    }

    // ── Tier 2c: Progression-aware escalation ──
    const allClinicalValues = Object.values(answers.clinicalAnswers).flat();
    const isWorsening = allClinicalValues.includes('تسوء تدريجياً');
    const isNothingHelps = allClinicalValues.includes('لا شيء يُحسّنها');

    if (!escalation_needed) {
        // Worsening + high severity → escalate
        if (isWorsening && answers.severity >= 7) {
            escalation_needed = true;
        }
        // Nothing helps + chronic → escalate
        if (isNothingHelps && answers.duration === 'months') {
            escalation_needed = true;
        }
        // Worsening + chronic + moderate severity → escalate
        if (isWorsening && answers.duration === 'months' && answers.severity >= 5) {
            escalation_needed = true;
        }
    }

    // ── Tier 2d: Compound Risk Score ──
    // Accumulates multiple moderate risk factors that individually don't escalate
    // but together indicate clinical concern requiring attention
    if (!escalation_needed) {
        let riskScore = compoundEscalationWeight; // from Severity-Duration Matrix
        if (isWorsening) riskScore += 3;
        if (isNothingHelps) riskScore += 3;
        if (answers.redFlags.length > 0) riskScore += 4;
        if (answers.severity >= 6) riskScore += 2;
        if (answers.duration === 'months') riskScore += 2;
        if (triageResult.score >= 6) riskScore += 2;
        const emotionalLoad = answers.emotionalContext.filter(e => e !== 'none').length;
        if (emotionalLoad >= 3) riskScore += 2;
        // Threshold: 10+ compound risk points → escalate
        if (riskScore >= 10) {
            escalation_needed = true;
        }
    }
    // Otherwise: Tier 3 — no escalation

    // ── Step 13: Generate precision fields ──
    const clinical_explanation = generateClinicalExplanation(
        primary, secondary, primarySub, secondarySub,
        answers.severity, answers.duration,
    );
    const today_action   = generateTodayAction(primarySub);
    const monitor_items  = generateMonitorItems(primarySub, secondarySub);
    const seek_care_when = generateSeekCareWhen(answers.pathwayId);

    // ── Step 14: Sprint A — Contradiction + Confidence + Signals ──
    const contradictions = detectContradictions(answers, triageResult);

    // Count how many clinical questions exist for this pathway
    // Fix 4: Cap at 4 — pathways can have 8+ questions total but users
    // realistically answer 3-4 question groups. Using the full count unfairly
    // depresses completeness and biases confidence downward.
    const pathwayDef = PATHWAYS.find(p => p.id === answers.pathwayId);
    const rawQuestionCount = pathwayDef?.clinicalQuestions.length ?? 5;
    const pathwayQuestionCount = Math.min(rawQuestionCount, 4);

    const confidenceModel = computeConfidenceModel(
        answers,
        triageResult,
        normalizedScores[primary],
        normalizedScores[secondary],
        contradictions,
        pathwayQuestionCount,
    );

    const key_signals = identifyKeySignals(answers, triageResult);

    // ── Step 15: Sprint B — Phenotype inference ──
    const phenotype = inferPhenotype(answers.pathwayId, answers);

    return {
        primary_domain:      primary,
        secondary_domain:    secondary,
        primary_subdomain:   primarySub,
        secondary_subdomain: secondarySub,
        domain_scores:       normalizedScores,
        priority,
        why,
        recommended_tools:   finalTools,
        escalation_needed,
        confidence:          confidenceModel.label,
        clinical_explanation,
        today_action,
        monitor_items,
        seek_care_when,
        // Sprint A
        contradictions,
        confidenceScore:    confidenceModel.score,
        confidenceFactors:  confidenceModel.factors,
        key_signals,
        // Sprint B
        phenotype,
    };
}

/* ══════════════════════════════════════════════════════════
   HELPER: Pick top subdomain from a filtered list
   ══════════════════════════════════════════════════════════ */

function pickTopSubdomain(
    tally: Record<string, number>,
    validIds: SubdomainId[],
): SubdomainId {
    let topId    = validIds[0]; // fallback to first
    let topScore = -1;

    for (const id of validIds) {
        const s = tally[id] ?? 0;
        if (s > topScore) {
            topScore = s;
            topId    = id;
        }
    }

    return topId;
}
