// lib/clinical/deep-intake-questions.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Deep Clinical Intake Questions
// ════════════════════════════════════════════════════════════════════════
// Additive layer: augments existing pathway questions with deeper probes.
// Each question contributes to functional pattern & somatic theme scoring
// WITHOUT changing the existing triage logic.
// ════════════════════════════════════════════════════════════════════════

import type { FunctionalPattern, SomaticTheme } from '@/components/health-engine/types';

export interface DeepOptionMeta {
    functional: FunctionalPattern;
    somatic: SomaticTheme | 'none';
    functionalWeight: number;
    somaticWeight: number;
    conventionalWeight: number;
}

export interface DeepIntakeQuestion {
    id: string;
    text: string;
    type: 'single' | 'multiple';
    /** Which pathways trigger this question */
    pathways: string[];
    options: string[];
    optionMeta: DeepOptionMeta[];
    /** Minimum severity to show (0 = always) */
    minSeverity?: number;
}

/* ══════════════════════════════════════════════════════════
   CROSS-PATHWAY DEEP QUESTIONS
   These fire across multiple pathways for deeper pattern detection.
   ══════════════════════════════════════════════════════════ */

export const DEEP_INTAKE_QUESTIONS: DeepIntakeQuestion[] = [
    // ── النوم العميق (cross-pathway) ──
    {
        id: 'deep_sleep_quality',
        text: 'كيف تصف نومك؟',
        type: 'multiple',
        pathways: ['fatigue', 'headache', 'anxiety', 'pain', 'hormonal'],
        options: [
            'أنام كثيراً لكن أصحى متعباً',
            'أستيقظ بين 2-4 فجراً بشكل متكرر',
            'صعوبة في النوم — ذهني لا يهدأ',
            'أحلام مزعجة أو كوابيس متكررة',
            'نومي جيد عموماً',
        ],
        optionMeta: [
            { functional: 'adrenal_exhaustion', somatic: 'chronic_self_override', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 1 },
            { functional: 'adrenal_exhaustion', somatic: 'hypervigilance', functionalWeight: 3, somaticWeight: 2, conventionalWeight: 1 },
            { functional: 'nervous_system_dysreg', somatic: 'hypervigilance', functionalWeight: 2, somaticWeight: 3, conventionalWeight: 1 },
            { functional: 'nervous_system_dysreg', somatic: 'grief_unprocessed', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 1 },
            { functional: 'none', somatic: 'none', functionalWeight: 0, somaticWeight: 0, conventionalWeight: 0 },
        ],
    },
    // ── الالتهاب الصامت ──
    {
        id: 'deep_inflammation',
        text: 'هل تلاحظ أياً من هذه العلامات؟',
        type: 'multiple',
        pathways: ['fatigue', 'pain', 'digestion', 'immune', 'hormonal'],
        options: [
            'تورم أو احتباس سوائل',
            'ألم مفاصل متنقل',
            'حساسية جلدية أو إكزيما',
            'انتفاخ الوجه الصباحي',
            'لا شيء مما سبق',
        ],
        optionMeta: [
            { functional: 'inflammatory_load', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 2 },
            { functional: 'inflammatory_load', somatic: 'suppressed_expression', functionalWeight: 2, somaticWeight: 1, conventionalWeight: 2 },
            { functional: 'inflammatory_load', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 1 },
            { functional: 'inflammatory_load', somatic: 'none', functionalWeight: 1, somaticWeight: 0, conventionalWeight: 1 },
            { functional: 'none', somatic: 'none', functionalWeight: 0, somaticWeight: 0, conventionalWeight: 0 },
        ],
    },
    // ── النقص الغذائي ──
    {
        id: 'deep_nutrient',
        text: 'هل تعاني من أي من هذه العلامات؟',
        type: 'multiple',
        pathways: ['fatigue', 'headache', 'hormonal', 'immune', 'anxiety'],
        options: [
            'تساقط شعر ملحوظ',
            'أظافر هشة أو مُخدّدة',
            'تشقق زوايا الفم',
            'تنميل أو وخز في الأطراف',
            'رغبة ملحّة في الثلج أو الطين',
        ],
        optionMeta: [
            { functional: 'nutrient_depletion', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 2 },
            { functional: 'nutrient_depletion', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 1 },
            { functional: 'nutrient_depletion', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 1 },
            { functional: 'nutrient_depletion', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 2 },
            { functional: 'nutrient_depletion', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 2 },
        ],
    },
    // ── الجهاز العصبي اللاإرادي ──
    {
        id: 'deep_autonomic',
        text: 'هل تلاحظ أياً من هذه الأعراض؟',
        type: 'multiple',
        pathways: ['anxiety', 'fatigue', 'headache', 'pain'],
        options: [
            'دوخة عند الوقوف فجأة',
            'برودة أطراف دائمة',
            'خفقان بدون سبب واضح',
            'تعرّق مفاجئ أو هبّات حرارة',
            'إحساس بعدم القدرة على أخذ نَفَس عميق',
        ],
        optionMeta: [
            { functional: 'nervous_system_dysreg', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 2 },
            { functional: 'thyroid_underfunction', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 1 },
            { functional: 'nervous_system_dysreg', somatic: 'hypervigilance', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 2 },
            { functional: 'hormonal_cascade', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 1 },
            { functional: 'nervous_system_dysreg', somatic: 'suppressed_expression', functionalWeight: 2, somaticWeight: 3, conventionalWeight: 1 },
        ],
    },
    // ── تاريخ الأدوية والعلاجات ──
    {
        id: 'deep_med_history',
        text: 'هل استخدمت أياً من هذه لفترة طويلة؟',
        type: 'multiple',
        pathways: ['fatigue', 'digestion', 'headache', 'immune', 'hormonal', 'pain', 'anxiety', 'sleep'],
        options: [
            'مضادات حيوية متكررة',
            'مسكنات بشكل يومي أو شبه يومي',
            'أدوية حموضة لأشهر',
            'كورتيزون لفترات',
            'مضادات اكتئاب أو قلق',
            'لا شيء مما سبق',
        ],
        optionMeta: [
            { functional: 'gut_dysbiosis', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 2 },
            { functional: 'inflammatory_load', somatic: 'chronic_self_override', functionalWeight: 2, somaticWeight: 1, conventionalWeight: 2 },
            { functional: 'gut_dysbiosis', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 1 },
            { functional: 'adrenal_exhaustion', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 2 },
            { functional: 'nervous_system_dysreg', somatic: 'suppressed_expression', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 1 },
            { functional: 'none', somatic: 'none', functionalWeight: 0, somaticWeight: 0, conventionalWeight: 0 },
        ],
    },
    // ── الحمل الجسدي العاطفي ──
    {
        id: 'deep_body_emotion',
        text: 'جسمك يحمل مشاعرك أحياناً — أين تشعر بالضغط أكثر؟',
        type: 'multiple',
        pathways: ['fatigue', 'headache', 'digestion', 'pain', 'anxiety'],
        options: [
            'ثقل في الصدر أو ضيق',
            'شدّ الفك أو صرير أسنان',
            'ألم رقبة وأكتاف مزمن',
            'معدة مضطربة مع التوتر',
            'إحساس بكتلة في الحلق',
        ],
        optionMeta: [
            { functional: 'nervous_system_dysreg', somatic: 'grief_unprocessed', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 1 },
            { functional: 'nervous_system_dysreg', somatic: 'suppressed_expression', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 1 },
            { functional: 'nervous_system_dysreg', somatic: 'hypervigilance', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 1 },
            { functional: 'gut_dysbiosis', somatic: 'control_and_release', functionalWeight: 2, somaticWeight: 3, conventionalWeight: 1 },
            { functional: 'nervous_system_dysreg', somatic: 'suppressed_expression', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 1 },
        ],
    },
    // ── الطاقة والأيض ──
    {
        id: 'deep_metabolism',
        text: 'ما الذي يصف علاقتك بالطاقة والوزن؟',
        type: 'multiple',
        pathways: ['fatigue', 'hormonal', 'digestion'],
        options: [
            'وزني يزيد رغم أكلي القليل',
            'أحتاج سكر/كربوهيدرات باستمرار',
            'طاقتي تنهار بعد الأكل',
            'دورة شهرية غير منتظمة',
            'لا مشاكل في هذا الجانب',
        ],
        optionMeta: [
            { functional: 'thyroid_underfunction', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 2 },
            { functional: 'blood_sugar_chaos', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 1 },
            { functional: 'blood_sugar_chaos', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 1 },
            { functional: 'hormonal_cascade', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 2 },
            { functional: 'none', somatic: 'none', functionalWeight: 0, somaticWeight: 0, conventionalWeight: 0 },
        ],
    },
    // ── الصدمات والتجارب ──
    {
        id: 'deep_trauma_screen',
        text: 'أحياناً التجارب القديمة تُبقي الجسم في حالة تأهب — هل ينطبق شيء؟',
        type: 'multiple',
        pathways: ['anxiety', 'fatigue', 'pain', 'digestion', 'sleep'],
        minSeverity: 4,
        options: [
            'أشعر بالخطر حتى في الأمان',
            'جسمي يتجمّد في مواقف بعينها',
            'ذكريات تطفو بدون سبب واضح',
            'أتجنب أماكن أو أشخاصاً بسبب شعور داخلي',
            'لا ينطبق',
        ],
        optionMeta: [
            { functional: 'nervous_system_dysreg', somatic: 'hypervigilance', functionalWeight: 2, somaticWeight: 3, conventionalWeight: 1 },
            { functional: 'nervous_system_dysreg', somatic: 'hypervigilance', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 1 },
            { functional: 'nervous_system_dysreg', somatic: 'childhood_imprint', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 1 },
            { functional: 'nervous_system_dysreg', somatic: 'hypervigilance', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 1 },
            { functional: 'none', somatic: 'none', functionalWeight: 0, somaticWeight: 0, conventionalWeight: 0 },
        ],
    },
];

/* ══════════════════════════════════════════════════════════
   QUERY HELPERS
   ══════════════════════════════════════════════════════════ */

/** Get deep questions applicable to a pathway + severity. */
export function getDeepQuestionsForPathway(
    pathwayId: string,
    severity: number = 5,
): DeepIntakeQuestion[] {
    return DEEP_INTAKE_QUESTIONS.filter(q =>
        q.pathways.includes(pathwayId) &&
        severity >= (q.minSeverity ?? 0)
    );
}

/** Get all deep question IDs. */
export function getDeepQuestionIds(): string[] {
    return DEEP_INTAKE_QUESTIONS.map(q => q.id);
}
