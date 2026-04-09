// components/health-engine/constants.ts
// THIE — Clinical data: pathways, questions, emotional contexts
// All data centralized here for easy maintenance

import type { Pathway, EngineAnswers } from './types';

/* ═══════════════════════════════════════
   CLINICAL PATHWAYS
   ═══════════════════════════════════════ */
export const PATHWAYS: Pathway[] = [
    {
        id: 'fatigue',
        label: 'تعب وإرهاق',
        emoji: '⚡',
        color: '#f59e0b',
        gradient: ['#78350f', '#f59e0b'],
        description: 'إرهاق مستمر وقلة طاقة',
        redFlags: [
            { id: 'rf_fatigue_1', text: 'إرهاق شديد جداً مع ضيق تنفس في الراحة', level: 'emergency', actionMessage: 'قد يشير لمشكلة قلبية — اتصل بالإسعاف فوراً' },
            { id: 'rf_fatigue_2', text: 'فقدان وزن سريع غير مبرر (5 كغ+ في شهر)', level: 'urgent', actionMessage: 'يحتاج فحصاً طبياً عاجلاً هذا الأسبوع' },
        ],
        clinicalQuestions: [
            { id: 'fatigue_onset', text: 'كيف بدأ الإرهاق؟', type: 'single', options: ['فجأة', 'تدريجياً على أسابيع', 'موجود منذ سنوات'] },
            { id: 'fatigue_timing', text: 'متى يكون الإرهاق أشد؟', type: 'multiple', options: ['الصباح المبكر', 'بعد الظهر', 'بعد الطعام', 'مستمر طوال اليوم', 'بعد أي مجهود'] },
            { id: 'fatigue_sleep', text: 'هل النوم يريح؟', type: 'single', options: ['نعم تماماً', 'جزئياً', 'لا — أستيقظ منهكاً'] },
        ],
    },
    {
        id: 'headache',
        label: 'صداع',
        emoji: '🧠',
        color: '#8b5cf6',
        gradient: ['#4c1d95', '#8b5cf6'],
        description: 'صداع أو شقيقة',
        redFlags: [
            { id: 'rf_head_1', text: 'أشد صداع في حياتك — بدأ فجأة كالرعد', level: 'emergency', actionMessage: 'قد يكون نزيفاً دماغياً — الطوارئ فوراً' },
            { id: 'rf_head_2', text: 'صداع مع حمى وتصلب الرقبة والضوء يؤلمك', level: 'emergency', actionMessage: 'أعراض تحسس سحائي — اتصل بالإسعاف الآن' },
            { id: 'rf_head_3', text: 'صداع مع ضعف في وجه أو ذراع أو تعتيم رؤية', level: 'emergency', actionMessage: 'قد يكون جلطة دماغية — الطوارئ فوراً' },
        ],
        clinicalQuestions: [
            { id: 'head_location', text: 'أين يكون الصداع؟', type: 'multiple', options: ['نصف الرأس', 'مقدمة الجبهة', 'خلف العينين', 'مؤخرة الرأس', 'كل الرأس'] },
            { id: 'head_character', text: 'كيف تصف الصداع؟', type: 'single', options: ['نابض مزعج', 'ضاغط كالحزام', 'طاعن حاد', 'ثقيل ومنتشر'] },
            { id: 'head_triggers', text: 'ما الذي يثيره؟', type: 'multiple', options: ['الضوء', 'الضجيج', 'التوتر', 'الجوع', 'النوم المتأخر', 'الرائحة', 'الهرمونات'] },
        ],
    },
    {
        id: 'digestion',
        label: 'مشاكل هضمية',
        emoji: '🌿',
        color: '#10b981',
        gradient: ['#064e3b', '#10b981'],
        description: 'اضطرابات في الجهاز الهضمي',
        redFlags: [
            { id: 'rf_gi_1', text: 'دم في البراز أو قيء دموي', level: 'emergency', actionMessage: 'نزيف داخلي محتمل — الطوارئ فوراً' },
            { id: 'rf_gi_2', text: 'ألم بطن شديد جداً مستمر لأكثر من ساعة', level: 'urgent', actionMessage: 'يحتاج تقييماً طارئاً في نفس اليوم' },
        ],
        clinicalQuestions: [
            { id: 'gi_symptom', text: 'ما أبرز الأعراض؟', type: 'multiple', options: ['انتفاخ', 'إسهال', 'إمساك', 'حرقة', 'غثيان', 'ألم متقطع', 'الأعراض بعد الأكل'] },
            { id: 'gi_trigger', text: 'ما الذي يثير المشكلة؟', type: 'multiple', options: ['الطعام الدسم', 'الحبوب والغلوتين', 'منتجات الألبان', 'التوتر', 'أوقات بعينها'] },
            { id: 'gi_pattern', text: 'نمط المشكلة؟', type: 'single', options: ['يومياً', 'متقطع', 'مرتبط بضغوط', 'مرتبط بالدورة'] },
        ],
    },
    {
        id: 'sleep',
        label: 'اضطراب النوم',
        emoji: '🌙',
        color: '#6366f1',
        gradient: ['#1e1b4b', '#6366f1'],
        description: 'صعوبة في النوم أو نوم غير مريح',
        redFlags: [
            { id: 'rf_sleep_1', text: 'توقف التنفس الليلي (يلاحظه أحد)', level: 'urgent', actionMessage: 'انقطاع التنفس — تقييم عاجل مطلوب' },
        ],
        clinicalQuestions: [
            { id: 'sleep_problem', text: 'ما طبيعة مشكلة النوم؟', type: 'multiple', options: ['صعوبة الدخول للنوم', 'يستطيع النوم لكن يستيقظ', 'نوم كثير لكن غير مريح', 'أحلام مزعجة مستمرة'] },
            { id: 'sleep_impact', text: 'كيف يؤثر على نهارك؟', type: 'single', options: ['نعاس شديد نهاراً', 'تشتت وضعف تركيز', 'مزاج متقلب', 'كلها معاً'] },
        ],
    },
    {
        id: 'pain',
        label: 'آلام الجسد',
        emoji: '🦴',
        color: '#ef4444',
        gradient: ['#7f1d1d', '#ef4444'],
        description: 'آلام في المفاصل أو العضلات أو الظهر',
        redFlags: [
            { id: 'rf_pain_1', text: 'ألم صدر مفاجئ ينتشر للذراع أو الفك', level: 'emergency', actionMessage: 'أعراض نوبة قلبية — الإسعاف الآن' },
            { id: 'rf_pain_2', text: 'ضعف مفاجئ في ساق أو ذراع مع صعوبة كلام', level: 'emergency', actionMessage: 'أعراض جلطة دماغية — الطوارئ فوراً' },
        ],
        clinicalQuestions: [
            { id: 'pain_location', text: 'أين الألم الرئيسي؟', type: 'multiple', options: ['الظهر السفلي', 'الرقبة والكتفين', 'الركبتين', 'المفاصل الصغيرة', 'العضلات العامة', 'منتشر في كل الجسم'] },
            { id: 'pain_character', text: 'طبيعة الألم؟', type: 'single', options: ['مستمر دائم', 'صباحي يزول مع الحركة', 'يظهر بعد المجهود', 'متقطع ومتنقل'] },
        ],
    },
    {
        id: 'anxiety',
        label: 'قلق أو توتر',
        emoji: '💭',
        color: '#f97316',
        gradient: ['#7c2d12', '#f97316'],
        description: 'قلق نفسي، ضغوط، أو مستقرات عاطفية',
        redFlags: [
            { id: 'rf_anx_1', text: 'أفكار بإيذاء النفس', level: 'emergency', actionMessage: 'تواصل مع خط الدعم النفسي فوراً أو اتصل بشخص تثق به' },
        ],
        clinicalQuestions: [
            { id: 'anx_type', text: 'كيف يظهر القلق؟', type: 'multiple', options: ['خفقان وضيق صدر', 'قلق مستمر بلا سبب', 'نوبات مفاجئة', 'تشوش وتفكير مبالغ', 'توتر عضلي مستمر'] },
            { id: 'anx_trigger', text: 'ما الذي يثيره؟', type: 'multiple', options: ['ضغوط العمل', 'المشاكل العائلية', 'الماضي أو المستقبل', 'الأماكن المزدحمة', 'لا أعرف السبب'] },
        ],
    },
    {
        id: 'hormonal',
        label: 'هرمونات',
        emoji: '⚗️',
        color: '#ec4899',
        gradient: ['#831843', '#ec4899'],
        description: 'اضطرابات هرمونية أو الغدة الدرقية',
        redFlags: [
            { id: 'rf_horm_1', text: 'خفقان سريع جداً مع ارتعاش وتعرق مفاجئ', level: 'urgent', actionMessage: 'قد يكون أزمة هرمونية — تقييم عاجل' },
        ],
        clinicalQuestions: [
            { id: 'horm_symptom', text: 'أبرز الأعراض؟', type: 'multiple', options: ['برودة أو حرارة زائدة', 'تغير وزن مفاجئ', 'اضطراب الدورة الشهرية', 'تساقط شعر', 'تغيرات مزاجية حادة', 'جفاف أو تورم'] },
        ],
    },
    {
        id: 'immune',
        label: 'ضعف مناعة',
        emoji: '🛡',
        color: '#0d9488',
        gradient: ['#134e4a', '#0d9488'],
        description: 'عدوى متكررة أو تعافٍ بطيء',
        redFlags: [
            { id: 'rf_imm_1', text: 'حمى فوق 39 مع التهاب شديد أو صعوبة بلع', level: 'emergency', actionMessage: 'التهاب شديد — الطوارئ فوراً' },
        ],
        clinicalQuestions: [
            { id: 'imm_pattern', text: 'ما الأنماط التي تلاحظها؟', type: 'multiple', options: ['نزلات برد متكررة', 'التئام بطيء للجروح', 'حساسيات متعددة ومتزايدة', 'تعب شديد مع أي مرض', 'عدوى فطرية متكررة'] },
        ],
    },
];

/* ═══════════════════════════════════════
   EMOTIONAL CONTEXTS (فريدة لطِبرَا)
   ═══════════════════════════════════════ */
export const EMOTIONAL_CONTEXTS = [
    { id: 'work_stress', label: 'ضغط العمل', emoji: '💼' },
    { id: 'family', label: 'توترات عائلية', emoji: '👨‍👩‍👧' },
    { id: 'loneliness', label: 'وحدة وعزلة', emoji: '🌑' },
    { id: 'grief', label: 'حزن أو خسارة', emoji: '🕊' },
    { id: 'financial', label: 'ضغوط مالية', emoji: '📉' },
    { id: 'identity', label: 'الشعور بالعجز', emoji: '🔒' },
    { id: 'anger', label: 'غضب مكبوت', emoji: '🔥' },
    { id: 'fear', label: 'خوف أو قلق مزمن', emoji: '🌀' },
    { id: 'burnout', label: 'إرهاق عاطفي', emoji: '🪫' },
    { id: 'none', label: 'لا شيء الآن', emoji: '✨' },
];

/* ═══════════════════════════════════════
   DURATION OPTIONS
   ═══════════════════════════════════════ */
export const DURATION_OPTIONS = [
    { id: 'hours', label: 'ساعات', sub: 'أقل من يوم', urgencyBonus: 0 },
    { id: 'days', label: 'أيام', sub: '٢-١٤ يوم', urgencyBonus: 1 },
    { id: 'weeks', label: 'أسابيع', sub: '٢-٨ أسابيع', urgencyBonus: 2 },
    { id: 'months', label: 'أشهر أو سنوات', sub: 'مزمن', urgencyBonus: 3 },
];

/* ═══════════════════════════════════════
   TRIAGE ENGINE
   ═══════════════════════════════════════ */
export function computeTriage(answers: EngineAnswers): {
    level: 'emergency' | 'urgent' | 'needs_doctor' | 'review' | 'manageable';
    score: number;
} {
    if (answers.hasEmergencyFlag) return { level: 'emergency', score: 10 };

    let score = answers.severity;

    // Duration bonus
    const dur = DURATION_OPTIONS.find(d => d.id === answers.duration);
    if (dur) score += dur.urgencyBonus;

    // Red flags (non-emergency)
    if (answers.redFlags.length > 0) score += 2;

    // Emotional overload
    if (answers.emotionalContext.length >= 3) score += 1;

    score = Math.min(10, score);

    if (score >= 9) return { level: 'urgent', score };
    if (score >= 7) return { level: 'needs_doctor', score };
    if (score >= 4) return { level: 'review', score };
    return { level: 'manageable', score };
}

/* ═══════════════════════════════════════
   DEFAULT ANSWERS
   ═══════════════════════════════════════ */
export const DEFAULT_ANSWERS: EngineAnswers = {
    pathwayId: '',
    severity: 5,
    duration: 'days',
    redFlags: [],
    hasEmergencyFlag: false,
    emergencyMessage: '',
    clinicalAnswers: {},
    emotionalContext: [],
    emotionalNote: '',
    freeText: '',
};
