// lib/clinical/tayyibat-adaptive-screening.ts
// ══════════════════════════════════════════════════════════════
// الأسئلة الغذائية التكيفية — Signal-Based Gating (v2)
// ══════════════════════════════════════════════════════════════
// القاعدة الجديدة:
//   - لا نمنع الأسئلة بناءً على المسار فقط
//   - نُظهر إذا وُجدت إشارات غذائية في الإجابات (كافيين، انتفاخ، سكر، نوم، إلخ)
//   - القلق (anxiety) يمكن أن يُظهر أسئلة الكافيين/السكر/النوم
//   - ألم الظهر (back) يمكن أن يُظهر أسئلة الانتفاخ/الالتهاب
//   - dental/vision فقط = صارم بلا أسئلة
//   - severity >= 9 = طارئ، لا أسئلة
// ══════════════════════════════════════════════════════════════

import type { AnswerValue } from '@/components/health-engine/types';

// ── نوع السؤال التكيفي ──
export interface AdaptiveFoodQuestion {
    id:           string;
    text:         string;
    subtext?:     string;
    options:      { value: string; label: string; emoji?: string }[];
    triggerKeys:  string[];   // الإشارات التي تُطلق هذا السؤال
    priority:     number;     // 1 = أعلى أولوية
}

// ── الأسئلة الخمسة الغذائية التكيفية ──
export const ADAPTIVE_FOOD_QUESTIONS: AdaptiveFoodQuestion[] = [
    {
        id: 'af_bloating',
        text: 'كم مرة تشعر بالانتفاخ بعد الأكل؟',
        subtext: 'حتى في الأيام العادية',
        priority: 1,
        triggerKeys: ['bloating', 'stomach', 'digestion', 'gas', 'constipation',
                      'انتفاخ', 'هضم', 'معدة', 'غازات', 'إمساك', 'قولون', 'باطن',
                      'ظهر', 'back', 'pain', 'ألم', 'ثقل'],
        options: [
            { value: 'never',     label: 'نادراً أو لا',                emoji: '✅' },
            { value: 'sometimes', label: 'أحياناً (بضع مرات/أسبوع)',    emoji: '🔶' },
            { value: 'often',     label: 'كثيراً بعد معظم الوجبات',     emoji: '⚠️' },
            { value: 'always',    label: 'دائماً تقريباً',               emoji: '⛔' },
        ],
    },
    {
        id: 'af_energy_crash',
        text: 'كيف طاقتك بعد وجبة الغداء؟',
        priority: 2,
        triggerKeys: ['fatigue', 'tiredness', 'energy', 'sleep', 'exhaustion',
                      'تعب', 'إرهاق', 'طاقة', 'نوم', 'نشاط', 'كسل',
                      'قلق', 'anxiety', 'توتر', 'اكتئاب'],
        options: [
            { value: 'never',     label: 'طاقة جيدة — لا هبوط',        emoji: '⚡' },
            { value: 'sometimes', label: 'أحياناً نعاس خفيف',           emoji: '🔶' },
            { value: 'often',     label: 'غالباً أحتاج قهوة أو نوم',   emoji: '⚠️' },
            { value: 'always',    label: 'دائماً ثقيل بعد الأكل',      emoji: '⛔' },
        ],
    },
    {
        id: 'af_sugar_craving',
        text: 'هل تشتهي الحلويات أو المشروبات السكرية يومياً؟',
        priority: 3,
        triggerKeys: ['sugar', 'sweet', 'cravings', 'weight', 'diabetes',
                      'سكر', 'حلوى', 'وزن', 'رغبة', 'شهية', 'رغبة في الحلو',
                      'قلق', 'anxiety', 'توتر', 'مزاج'],
        options: [
            { value: 'none',     label: 'لا — نادراً',                  emoji: '✅' },
            { value: 'mild',     label: 'أحياناً',                       emoji: '🔶' },
            { value: 'moderate', label: 'يومياً وأتحكم بها',            emoji: '⚠️' },
            { value: 'strong',   label: 'يومياً وصعب مقاومتها',        emoji: '⛔' },
        ],
    },
    {
        id: 'af_meal_timing',
        text: 'هل تتناول وجباتك في وقت ثابت يومياً؟',
        priority: 4,
        triggerKeys: ['sleep', 'insomnia', 'rhythm', 'night', 'schedule',
                      'نوم', 'أرق', 'سهر', 'توقيت', 'ليل', 'نمط',
                      'قلق', 'anxiety', 'ضغط', 'stress'],
        options: [
            { value: 'structured', label: 'نعم — وقت ثابت تقريباً',    emoji: '⏰' },
            { value: 'partial',    label: 'أحياناً',                    emoji: '🔶' },
            { value: 'random',     label: 'عشوائي حسب الظروف',         emoji: '⚠️' },
        ],
    },
    {
        id: 'af_oil_type',
        text: 'ما نوع الزيت الذي تطبخ به بشكل رئيسي؟',
        priority: 5,
        triggerKeys: ['joint', 'inflammation', 'skin', 'pain', 'arthritis',
                      'مفاصل', 'التهاب', 'جلد', 'ألم', 'حبوب', 'حكة', 'روماتيزم',
                      'ظهر', 'back', 'وزن', 'weight'],
        options: [
            { value: 'olive_only', label: 'زيت زيتون بكر فقط',          emoji: '🫒' },
            { value: 'mixed',      label: 'زيتون مع زيوت أخرى',         emoji: '🔶' },
            { value: 'seed_oils',  label: 'زيت ذرة / كانولا / نباتي',   emoji: '⛔' },
            { value: 'unknown',    label: 'لا أعرف نوعه',               emoji: '❓' },
        ],
    },
];

// ── الكلمات المفتاحية التي تدل على وجود إشارة غذائية/نمط حياة ──
export const FOOD_LIFESTYLE_SIGNAL_KEYWORDS = [
    // هضم
    'انتفاخ', 'bloating', 'غازات', 'gas', 'حموضة', 'ارتجاع', 'reflux',
    'إمساك', 'constipation', 'إسهال', 'diarrhea', 'قولون', 'هضم',
    // طاقة / سكر
    'تعب بعد الأكل', 'هبوط', 'نعاس بعد', 'إرهاق', 'post-meal',
    'رغبة في السكر', 'رغبة في الحلو', 'سكر', 'حلويات', 'sugar cravings',
    // قهوة / كافيين
    'قهوة', 'coffee', 'كافيين', 'caffeine', 'منبّه', 'شاي زيادة',
    // نوم / توقيت
    'نوم سيئ', 'أرق', 'سهر', 'عشاء متأخر', 'وجبة ليلية', 'late dinner',
    'غير منتظم', 'وجبات عشوائية', 'irregular meals',
    // طيبات / التزام
    'طيبات', 'tayyibat', 'ملتزم', 'نظام غذائي',
    // التهاب / وزن
    'وزن', 'weight', 'التهاب', 'inflammation',
] as const;

// ── المسارات ذات الصلة الغذائية المباشرة — دائماً تُظهر أسئلة ──
const INHERENTLY_FOOD_PATHWAYS = new Set([
    'digestion', 'digestive', 'colon', 'fatigue', 'weight',
    'hormonal', 'immune', 'joint', 'pain', 'skin', 'sleep',
]);

// ── المسارات الصارمة — لا أسئلة غذائية حتى مع وجود إشارات ──
const STRICT_MINIMAL_PATHWAYS = new Set(['dental', 'vision', 'optic']);

// ── الإشارات من كل مسار (للـ backward compatibility) ──
const PATHWAY_FOOD_SIGNALS: Record<string, string[]> = {
    digestive: ['bloating', 'stomach', 'digestion', 'gas'],
    colon:     ['bloating', 'gas', 'constipation', 'digestion'],
    fatigue:   ['fatigue', 'tiredness', 'energy'],
    weight:    ['weight', 'sugar', 'cravings'],
    joint:     ['joint', 'inflammation', 'pain'],
    skin:      ['skin', 'inflammation'],
    sleep:     ['sleep', 'rhythm', 'night'],
    hormonal:  ['sugar', 'weight', 'fatigue', 'bloating'],
    // المسارات التي تعتمد على signal-based بالكامل
    back:       [],
    anxiety:    [],
    cardiac:    [],
    respiratory: [],
    vision:     [],
    dental:     [],
};

// ── هل توجد إشارات غذائية في الإجابات؟ ──
export function detectFoodSignalsInAnswers(clinicalAnswers: Record<string, AnswerValue>): boolean {
    const flatText = Object.values(clinicalAnswers)
        .map(v => Array.isArray(v) ? v.join(' ') : String(v ?? ''))
        .join(' ')
        .toLowerCase();

    return (FOOD_LIFESTYLE_SIGNAL_KEYWORDS as readonly string[]).some(
        kw => flatText.includes(kw.toLowerCase())
    );
}

// ── هل يجب إظهار أي أسئلة غذائية لهذا المسار + هذه الإجابات؟ ──
export function hasFoodRelevantSignals(
    pathwayId:       string,
    severity:        number,
    clinicalAnswers?: Record<string, AnswerValue>,
): boolean {
    if (severity >= 9) return false;
    if (STRICT_MINIMAL_PATHWAYS.has(pathwayId)) return false;
    if (INHERENTLY_FOOD_PATHWAYS.has(pathwayId)) return true;

    // باقي المسارات (anxiety, back, cardiac, respiratory):
    // نُظهر فقط إذا وُجدت إشارات غذائية في الإجابات
    if (clinicalAnswers) return detectFoodSignalsInAnswers(clinicalAnswers);
    return false;
}

// ── الأسئلة الغذائية المناسبة لهذه الحالة ──
export function getAdaptiveFoodQuestions(
    pathwayId:       string,
    severity:        number,
    clinicalAnswers: Record<string, AnswerValue>,
    maxQuestions     = 3,
): AdaptiveFoodQuestion[] {
    if (severity >= 9) return [];
    if (STRICT_MINIMAL_PATHWAYS.has(pathwayId)) return [];

    // جمع الإشارات من الإجابات
    const flatText = Object.values(clinicalAnswers)
        .map(v => Array.isArray(v) ? v.join(' ') : String(v ?? ''))
        .join(' ').toLowerCase();

    const signalPool = new Set<string>();
    (FOOD_LIFESTYLE_SIGNAL_KEYWORDS as readonly string[]).forEach(kw => {
        if (flatText.includes(kw.toLowerCase())) signalPool.add(kw.toLowerCase());
    });

    // الإشارات من المسار
    (PATHWAY_FOOD_SIGNALS[pathwayId] ?? []).forEach(s => signalPool.add(s.toLowerCase()));

    // للمسارات غير الغذائية بدون إشارات → لا أسئلة
    if (signalPool.size === 0 && !INHERENTLY_FOOD_PATHWAYS.has(pathwayId)) return [];

    const matched = ADAPTIVE_FOOD_QUESTIONS
        .filter(q => {
            if (clinicalAnswers[q.id]) return false; // لا تُكرر
            if (INHERENTLY_FOOD_PATHWAYS.has(pathwayId)) return true;
            return q.triggerKeys.some(key =>
                [...signalPool].some(signal =>
                    signal.includes(key.toLowerCase()) || key.toLowerCase().includes(signal)
                )
            );
        })
        .sort((a, b) => a.priority - b.priority)
        .slice(0, maxQuestions);

    return matched;
}

// ── هل يجب إخفاء كارد الطيبات في النتيجة؟ ──
export function shouldHideTayyibatCard(
    patternMaxScore: number,
    pathwayId:       string,
    clinicalAnswers?: Record<string, AnswerValue>,
): boolean {
    if (STRICT_MINIMAL_PATHWAYS.has(pathwayId)) return true;
    const hasFoodPath = INHERENTLY_FOOD_PATHWAYS.has(pathwayId);
    const hasSignals  = clinicalAnswers ? detectFoodSignalsInAnswers(clinicalAnswers) : false;
    return !hasFoodPath && !hasSignals && patternMaxScore < 25;
}
