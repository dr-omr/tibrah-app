// lib/tayyibat/tayyibat-nutrition-policy.ts
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Tayyibat Unified Nutrition Policy
// ════════════════════════════════════════════════════════════════════
//
// This is the SINGLE SOURCE OF TRUTH for all dietary guidance in Tibrah.
// Every nutrition recommendation, protocol step, and food suggestion
// in the application MUST reference this file — not hardcode values.
//
// Source: نظام الطيبات — د. ضياء العوضي (altayebaat.com)
// Tibrah adds: clinical safety layer, personalization, UX integration.
// ════════════════════════════════════════════════════════════════════

import {
    DR_AWADHI_ALLOWED,
    DR_AWADHI_FORBIDDEN,
    DR_AWADHI_MEAL_RULES,
    SYSTEM_COMPARISON,
} from './dr-awadhi-system';

// ── Re-export canonical lists ────────────────────────────────────────
export { DR_AWADHI_ALLOWED as TAYYIBAT_ALLOWED_GROUPS };
export { DR_AWADHI_FORBIDDEN as TAYYIBAT_FORBIDDEN_GROUPS };
export { DR_AWADHI_MEAL_RULES as TAYYIBAT_MEAL_TIMING_RULES };
export { SYSTEM_COMPARISON as TAYYIBAT_CONFLICT_TABLE };

// ── Attribution (must appear in every Tayyibat-based protocol UI) ────
export const TAYYIBAT_ATTRIBUTION_COPY = {
    short: 'مبادئ الطيبات — د. ضياء العوضي',
    full: 'يعتمد هذا البروتوكول على مبادئ من نظام الطيبات المنسوب إلى د. ضياء العوضي (altayebaat.com)، ويُضيف طِبرا طبقة التقييم السريري والتخصيص والمتابعة. لا يدّعي طِبرا ملكية النظام الأصلي.',
    disclaimer: 'هذا النظام تعليمي وداعم. لا يُغني عن الاستشارة الطبية ولا يُوقف أي دواء مُقرَّر.',
} as const;

// ── Phase Qualifiers ─────────────────────────────────────────────────
// Items that are context-dependent in Tayyibat (not absolute forbidden/allowed)
export const TAYYIBAT_PHASE_QUALIFIERS = {
    leafy_greens: {
        status: 'conditional' as const,
        rule: 'ممنوعة خلال مرحلة التنظيف (أول ٢١ يوم) بسبب الألياف الخشنة. مسموحة بعد تعافي القولون.',
        dr_awadhi_note: 'الخضار الورقية تُهيّج القولون الحساس — تُعاد تدريجياً بعد الشفاء.',
        needs_source_verification: false,
    },
    eggs: {
        status: 'conditional' as const,
        rule: 'مثير للجدل في النظام الكلاسيكي. بعض نسخ النظام تُجيزه بعد أول ٢١ يوم، وبعضها يحذّر من البياض فقط.',
        dr_awadhi_note: 'البياض فيه Avidin (يمنع البيوتين). الصفار أهم وأقل إشكالية.',
        needs_source_verification: true,
    },
    goat_dairy: {
        status: 'conditional' as const,
        rule: 'الزبادي ومنتجات الماعز أقل إشكالية من الألبان البقرية (Casein A2 بدلاً من A1)، لكن النظام الكلاسيكي يُدرجها ضمن الممنوعات في مرحلة العلاج.',
        needs_source_verification: true,
    },
    oats: {
        status: 'avoid' as const,
        rule: 'الشوفان يحتوي Avenin (بروتين قريب من الغلوتين). يُتجنَّب في مرحلة التنظيف.',
        needs_source_verification: false,
    },
    chicken_natural: {
        status: 'conditional' as const,
        rule: 'الدجاج الصناعي ممنوع. الدجاج البلدي الحر السرح أقل إشكالية ومقبول في بعض الحالات.',
        needs_source_verification: true,
    },
} as const;

// ── Protocol Copy Templates ──────────────────────────────────────────
// Use these when writing Tayyibat-aligned protocol text.
// Do NOT hardcode conflicting food lists — import from here.

export const TAYYIBAT_PROTOCOL_COPY = {
    digestive_burden: {
        title: 'بروتوكول تخفيف العبء الهضمي (الطيبات)',
        brief: 'ابدأ بحذف المُثقلات: الدقيق الأبيض، السكر الأبيض، الزيوت النباتية المكررة، والبقوليات. استبدلها بأرز أبيض + سمك بحري + زبدة بلدي.',
        firstStep: 'احذف أي شيء يُسبّب انتفاخاً بعد أكله مباشرةً. سجّل ما أكلته وكيف شعرت بعد ساعتين.',
        link: '/tayyibat',
    },
    sugar_dependency: {
        title: 'خطة التحوّل من وقود السكر لوقود الدهون (الطيبات)',
        brief: 'استبدل الوجبات الغنية بالسكر والنشا المكرر بدهون طبيعية وبروتين. الجسم يحتاج ٣–٦ أسابيع للتكيف على حرق الدهون.',
        firstStep: 'أزِل السكر الأبيض من كل وجباتك اليوم. استبدله بعسل طبيعي بكميات معقولة.',
        link: '/tayyibat/assessment',
    },
    rhythm_disruption: {
        title: 'بروتوكول إيقاع الوجبات (الطيبات)',
        brief: 'الفطور فوراً عند الاستيقاظ، الغداء بين ٢–٥ مساءً، العشاء خفيف جداً قبل النوم بـ٣ ساعات.',
        firstStep: 'اضبط موعد فطورك ثابتاً كل يوم وسجّل طاقتك بعد كل وجبة.',
        link: '/tayyibat/tracker',
    },
    inflammatory_load: {
        title: 'بروتوكول تخفيف الحمل الالتهابي الغذائي (الطيبات)',
        brief: 'الالتهاب الغذائي ينشأ غالباً من الدقيق، السكر، الزيوت المكررة، والبقوليات. أوقفها وراقب الفرق خلال ١٠ أيام.',
        firstStep: 'أزِل الدقيق الأبيض من وجباتك لأسبوع كامل — لاحظ تغيير المزاج والطاقة والألم.',
        link: '/tayyibat',
    },
    low_readiness: {
        title: 'الدخول التدريجي لنظام الطيبات',
        brief: 'لا تبدأ بكل القواعد دفعة واحدة. ابدأ بخطوة صغيرة واحدة فقط. الاستمرارية أهم من الكمال.',
        firstStep: 'هذا الأسبوع: أزِل مشروبًا واحدًا مُضافًا إليه سكر من يومك.',
        link: '/tayyibat',
    },
    medical_review_first: {
        title: 'الأولوية: مراجعة طبية قبل البروتوكول الغذائي',
        brief: 'بناءً على حالتك، ننصح بمراجعة طبية أولاً. التغذية دور داعم مهم، لكن لا تكون خط العلاج الأول هنا.',
        firstStep: 'احجز استشارة طبية. أخبر طبيبك برغبتك في تطبيق مبادئ غذائية داعمة.',
        link: '/book-appointment',
    },
} as const;

// ── Safety Rules ─────────────────────────────────────────────────────
// These override ALL dietary recommendations.
// Never push strict protocol as main CTA when any of these are active.

export interface SafetyRule {
    condition: string;
    override: 'medical_review_first' | 'observation_only' | 'physician_required';
    message: string;
    allowFoodTracking: boolean;
}

export const TAYYIBAT_SAFETY_RULES: SafetyRule[] = [
    {
        condition: 'diabetes_on_medication',
        override: 'physician_required',
        message: 'التعديل الغذائي لمريض السكري على دواء يتطلب إشراف طبي — أي تغيير في الكربوهيدرات يؤثر على الجرعة.',
        allowFoodTracking: true,
    },
    {
        condition: 'pregnancy',
        override: 'physician_required',
        message: 'الحمل يحتاج تخصيصاً دقيقاً. لا يُطبَّق أي بروتوكول حذف دون مراجعة طبية.',
        allowFoodTracking: true,
    },
    {
        condition: 'kidney_disease',
        override: 'physician_required',
        message: 'أمراض الكلى تتطلب قيوداً بروتينية ومعدنية محددة. الطيبات الكلاسيكي قد يتعارض.',
        allowFoodTracking: false,
    },
    {
        condition: 'liver_disease',
        override: 'physician_required',
        message: 'مرض الكبد يؤثر على استقلاب الدهون والبروتين. يتطلب إشراف طبي متخصص.',
        allowFoodTracking: false,
    },
    {
        condition: 'gi_bleeding',
        override: 'medical_review_first',
        message: 'نزيف الجهاز الهضمي حالة طارئة. المتابعة الغذائية كدعم فقط، لا كبروتوكول رئيسي.',
        allowFoodTracking: false,
    },
    {
        condition: 'severe_weight_loss',
        override: 'medical_review_first',
        message: 'فقدان الوزن الشديد غير المقصود يستدعي استبعاد أسباب طبية أولاً.',
        allowFoodTracking: true,
    },
    {
        condition: 'eating_disorder_risk',
        override: 'medical_review_first',
        message: 'بروتوكولات الحذف الغذائي قد تُضر بمن لديه تاريخ مع اضطرابات الأكل. يحتاج متخصصاً.',
        allowFoodTracking: false,
    },
    {
        condition: 'cancer',
        override: 'physician_required',
        message: 'التغذية في السرطان تحتاج فريقاً متخصصاً. الطيبات كدعم فقط، لا علاجاً.',
        allowFoodTracking: true,
    },
    {
        condition: 'anemia',
        override: 'observation_only',
        message: 'فقر الدم قد يتفاقم إذا أُزيلت مصادر حديد غذائية دون بديل. تتبع الأعراض.',
        allowFoodTracking: true,
    },
];

// ── Protocol Modes ────────────────────────────────────────────────────

export type ProtocolMode = 'strict' | 'guided_entry' | 'educational_only' | 'medical_review_first';

export interface ProtocolModeConfig {
    mode: ProtocolMode;
    label: string;
    description: string;
    showScore: boolean;
    showStrictProtocol: boolean;
    showAdherenceRing: boolean;
    ctaLabel: string;
    ctaLink: string;
}

export const TAYYIBAT_PROTOCOL_MODES: Record<ProtocolMode, ProtocolModeConfig> = {
    strict: {
        mode: 'strict',
        label: 'نظام الطيبات — التطبيق الكامل',
        description: 'للمستخدمين الذين يعرفون النظام ويريدون تطبيقه بدقة.',
        showScore: true,
        showStrictProtocol: true,
        showAdherenceRing: true,
        ctaLabel: 'اعرض بروتوكولي الكامل',
        ctaLink: '/tayyibat',
    },
    guided_entry: {
        mode: 'guided_entry',
        label: 'البداية التدريجية مع الطيبات',
        description: 'للمستخدمين الذين يعرفون النظام لكن لا يطبقونه بعد. خطوة صغيرة واحدة في كل مرة.',
        showScore: false,
        showStrictProtocol: false,
        showAdherenceRing: false,
        ctaLabel: 'ابدأ خطوتك الأولى',
        ctaLink: '/tayyibat',
    },
    educational_only: {
        mode: 'educational_only',
        label: 'تعرّف على نظام الطيبات',
        description: 'لمن لا يعرف النظام بعد. لا أرقام، لا بروتوكول صارم — فقط تعريف وبداية.',
        showScore: false,
        showStrictProtocol: false,
        showAdherenceRing: false,
        ctaLabel: 'تعرّف على نظام الطيبات',
        ctaLink: '/tayyibat',
    },
    medical_review_first: {
        mode: 'medical_review_first',
        label: 'المراجعة الطبية أولاً',
        description: 'حالتك تتطلب استشارة طبية قبل أي بروتوكول غذائي.',
        showScore: false,
        showStrictProtocol: false,
        showAdherenceRing: false,
        ctaLabel: 'احجز استشارة طبية',
        ctaLink: '/book-appointment',
    },
};

// ── Policy Helpers ────────────────────────────────────────────────────

/**
 * Determine the protocol mode for a user based on their Tayyibat knowledge
 * and any active safety concerns.
 */
export function resolveProtocolMode(
    tayyibatKnowledge: 'knows_applies' | 'knows_partial' | 'knows_not_apply' | 'dont_know',
    activeSafetyConditions: string[] = [],
): ProtocolMode {
    // Safety always overrides knowledge level
    const hasMedicalOverride = activeSafetyConditions.some(c =>
        TAYYIBAT_SAFETY_RULES.find(r => r.condition === c && r.override === 'physician_required')
    );
    if (hasMedicalOverride) return 'medical_review_first';

    const hasReviewOverride = activeSafetyConditions.some(c =>
        TAYYIBAT_SAFETY_RULES.find(r => r.condition === c && r.override === 'medical_review_first')
    );
    if (hasReviewOverride) return 'medical_review_first';

    switch (tayyibatKnowledge) {
        case 'knows_applies':   return 'strict';
        case 'knows_partial':   return 'guided_entry';
        case 'knows_not_apply': return 'guided_entry';
        case 'dont_know':       return 'educational_only';
        default:                return 'educational_only';
    }
}

/**
 * Check if a given food item (by ID) is forbidden in the Tayyibat system.
 * Returns the reason if forbidden, null if allowed or unknown.
 */
export function isTayyibatForbidden(foodId: string): { forbidden: true; reason: string } | null {
    const forbidden = DR_AWADHI_FORBIDDEN.find(f => f.id === foodId);
    if (!forbidden) return null;
    return { forbidden: true, reason: forbidden.why };
}

/**
 * Get the Tayyibat-safe replacement for a conflicting food/item.
 * Returns null if no direct replacement exists.
 */
export function getTayyibatReplacement(conflictingFoodId: string): string | null {
    const replacements: Record<string, string> = {
        'legumes_all':       'سمك بحري مشوي أو لحم ضأن',
        'fresh_dairy':       'جبن مطبوخ (شيدر/جودا) أو زبدة بلدي',
        'yogurt':            'جبن مطبوخ أو زبدة بلدي',
        'chicken_industrial':'سمك بحري أو لحم ضأن',
        'white_flour_all':   'أرز أبيض (مع بروتين) أو بطاطس مهروسة',
        'oats':              'أرز أبيض في الفطور أو توست أسمر مجفف',
        'leafy_greens':      'بطاطس + جزر + كوسا (خضار أقل تخميراً) — بعد تعافي القولون',
        'spinach':           'انظر leafy_greens',
        'broccoli':          'انظر leafy_greens',
        'black_tea':         'أعشاب طبيعية (زنجبيل، ينسون، حلبة) أو قهوة بكريمة طبيعية',
    };
    return replacements[conflictingFoodId] ?? null;
}
