// lib/protocol-engine.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Protocol Engine (محرك البروتوكولات العلاجية المتسلسلة)
// ════════════════════════════════════════════════════════════════════════
//
// طبقة فوق domain-routing-map — لا تمس computeRouting أو scoring أبداً.
// تحوّل كل subdomain من "مجموعة أدوات" إلى "رحلة زمنية يومية".
//
// Sprint 1: 3 subdomains × 7 أيام = 21 يوم علاجي منظّم
//   - sleep (جسدي)
//   - anxiety_arousal (نفسي)
//   - energy_fatigue (جسدي)
//
// الفرق الجوهري:
//   adherence = هل فعلت المطلوب؟
//   outcome   = هل تحسّن العرض فعلاً؟
// ════════════════════════════════════════════════════════════════════════

import type { SubdomainId } from '@/components/health-engine/types';

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

export type ProtocolPhase = 'understand' | 'practice' | 'measure' | 'assess';

export interface DayProtocol {
    /** رقم اليوم 1-7 */
    day: number;
    /** المرحلة الحالية من الرحلة */
    phase: ProtocolPhase;
    /** هدف هذا الأسبوع (يتكرر للتأكيد) */
    weekGoal: string;
    /** معرّف الأداة من domain-routing-map */
    toolId: string;
    /** رابط الأداة المباشر */
    toolHref: string;
    /** اسم الأداة بالعربي */
    toolName: string;
    /** ماذا تفعل بالضبط اليوم */
    focus: string;
    /** adherence: هل فعلت المطلوب؟ */
    adherenceCheck: string;
    /** outcome: هل تحسّن العرض فعلاً؟ */
    outcomeCheck: string;
    /** مدة الأداة بالدقائق */
    durationMinutes: number;
    /** ملاحظة اليوم إن وجدت */
    note?: string;
}

export interface ReassessConfig {
    /** time-based: بعد كم يوم يُعرض reassessment */
    afterDay: number;
    /** completion-based: مبكراً إذا أكمل هذه النسبة */
    afterCompletionPercent: number;
    /** symptom-based: إذا لم يكمل شيئاً بحلول هذا اليوم → escalate */
    earlyEscalateIfNoActionByDay: number;
}

export interface SubdomainProtocol {
    subdomainId: SubdomainId;
    /** رقم الإصدار — للتتبع والـ migration مستقبلاً */
    version: number;
    /** Sprint 1: 7 أيام فقط */
    totalDays: 7;
    /** عنوان البروتوكول */
    arabicTitle: string;
    /** هدف الأسبوع الكامل */
    weekGoal: string;
    /** متى يُعاد التقييم؟ */
    reassessAt: ReassessConfig;
    /** بعد كم يوم بدون تقدم → عرض CTA الحجز */
    escalateIfNoProgressByDay: number;
    /** أيام البروتوكول */
    days: DayProtocol[];
}

/* ══════════════════════════════════════════════════════════
   PHASE LABELS
   ══════════════════════════════════════════════════════════ */

export const PHASE_LABELS: Record<ProtocolPhase, { ar: string; en: string; emoji: string }> = {
    understand: { ar: 'الفهم',       en: 'Understand', emoji: '🔍' },
    practice:   { ar: 'التطبيق',    en: 'Practice',   emoji: '⚡' },
    measure:    { ar: 'القياس',      en: 'Measure',    emoji: '📊' },
    assess:     { ar: 'إعادة التقييم', en: 'Assess',  emoji: '🔄' },
};

/* ══════════════════════════════════════════════════════════
   1. بروتوكول النوم — sleep — 7 أيام
   ══════════════════════════════════════════════════════════ */

const SLEEP_PROTOCOL: SubdomainProtocol = {
    subdomainId: 'sleep',
    version: 1,
    totalDays: 7,
    arabicTitle: 'بروتوكول إعادة النوم ٧ أيام',
    weekGoal: 'إعادة ضبط إيقاعك البيولوجي وتحسين جودة النوم',
    reassessAt: {
        afterDay: 7,
        afterCompletionPercent: 71,   // أكمل 5 من 7 أيام → reassess مبكراً
        earlyEscalateIfNoActionByDay: 3, // لا شيء بحلول اليوم 3 → تدخل
    },
    escalateIfNoProgressByDay: 5,
    days: [
        {
            day: 1,
            phase: 'understand',
            weekGoal: 'إعادة ضبط إيقاعك البيولوجي وتحسين جودة النوم',
            toolId: 'jasadi_sleep_test',
            toolHref: '/intake',
            toolName: 'تقييم إيقاع النوم',
            focus: 'حلّل نمط نومك الحالي واكتشف الخلل الأساسي',
            adherenceCheck: 'هل أكملت تقييم النوم؟',
            outcomeCheck: 'ما الذي اكتشفته عن نمطك؟',
            durationMinutes: 5,
            note: 'اليوم الأول هو فهم فقط — لا ضغط على التغيير',
        },
        {
            day: 2,
            phase: 'practice',
            weekGoal: 'إعادة ضبط إيقاعك البيولوجي وتحسين جودة النوم',
            toolId: 'jasadi_sleep_practice',
            toolHref: '/breathe',
            toolName: 'روتين المساء',
            focus: 'طبّق الروتين المسائي الليلة قبل النوم بـ ٣٠ دقيقة',
            adherenceCheck: 'هل طبّقت روتين المساء الليلة؟',
            outcomeCheck: 'كم دقيقة استغرقت حتى نمت؟',
            durationMinutes: 10,
        },
        {
            day: 3,
            phase: 'understand',
            weekGoal: 'إعادة ضبط إيقاعك البيولوجي وتحسين جودة النوم',
            toolId: 'jasadi_sleep_workshop',
            toolHref: '/library?domain=jasadi&topic=sleep',
            toolName: 'ورشة استعادة النوم',
            focus: 'افهم علم النوم: لماذا يتكسّر إيقاعك؟',
            adherenceCheck: 'هل شاهدت الورشة؟',
            outcomeCheck: 'ما الشيء الواحد الجديد الذي فهمته؟',
            durationMinutes: 8,
        },
        {
            day: 4,
            phase: 'measure',
            weekGoal: 'إعادة ضبط إيقاعك البيولوجي وتحسين جودة النوم',
            toolId: 'jasadi_sleep_tracker',
            toolHref: '/daily-log',
            toolName: 'سجل النوم',
            focus: 'سجّل نومك لثلاثة أيام الماضية وابحث عن النمط',
            adherenceCheck: 'هل سجّلت ساعات نومك وجودته؟',
            outcomeCheck: 'هل تحسّن النوم مقارنةً باليوم الأول؟',
            durationMinutes: 2,
        },
        {
            day: 5,
            phase: 'practice',
            weekGoal: 'إعادة ضبط إيقاعك البيولوجي وتحسين جودة النوم',
            toolId: 'jasadi_sleep_practice',
            toolHref: '/breathe',
            toolName: 'روتين المساء',
            focus: 'طبّق الروتين مرة ثانية — الالتزام يبني العادة',
            adherenceCheck: 'هل التزمت بوقت النوم المحدد؟',
            outcomeCheck: 'هل تحسّن وقت الاستغراق في النوم؟',
            durationMinutes: 10,
            note: 'التكرار هو ما يُرسّخ العادة في الدماغ',
        },
        {
            day: 6,
            phase: 'measure',
            weekGoal: 'إعادة ضبط إيقاعك البيولوجي وتحسين جودة النوم',
            toolId: 'jasadi_sleep_tracker',
            toolHref: '/daily-log',
            toolName: 'سجل النوم',
            focus: 'قيس: كمية النوم + الجودة + الاستيقاظ مقارنةً ببداية الأسبوع',
            adherenceCheck: 'هل سجّلت اليوم؟',
            outcomeCheck: 'ما متوسط ساعات نومك هذا الأسبوع؟',
            durationMinutes: 2,
        },
        {
            day: 7,
            phase: 'assess',
            weekGoal: 'إعادة ضبط إيقاعك البيولوجي وتحسين جودة النوم',
            toolId: 'jasadi_sleep_test',
            toolHref: '/intake',
            toolName: 'إعادة تقييم النوم',
            focus: 'هل تحسّن نومك؟ قرر الخطوة التالية',
            adherenceCheck: 'هل أكملت يومي القياس؟',
            outcomeCheck: 'هل ترى تحسناً ملموساً في نومك؟',
            durationMinutes: 5,
            note: 'إذا لم يتحسن النوم — لا بأس، هذا يخبرنا أن الجذر أعمق ويحتاج متخصص',
        },
    ],
};

/* ══════════════════════════════════════════════════════════
   2. بروتوكول القلق — anxiety_arousal — 7 أيام
   ══════════════════════════════════════════════════════════ */

const ANXIETY_PROTOCOL: SubdomainProtocol = {
    subdomainId: 'anxiety_arousal',
    version: 1,
    totalDays: 7,
    arabicTitle: 'بروتوكول تهدئة القلق ٧ أيام',
    weekGoal: 'خفض استثارة الجهاز العصبي وبناء ساعة الهدوء اليومية',
    reassessAt: {
        afterDay: 7,
        afterCompletionPercent: 71,
        earlyEscalateIfNoActionByDay: 3,
    },
    escalateIfNoProgressByDay: 4,
    days: [
        {
            day: 1,
            phase: 'understand',
            weekGoal: 'خفض استثارة الجهاز العصبي وبناء ساعة الهدوء اليومية',
            toolId: 'nafsi_anxiety_test',
            toolHref: '/assess/anxiety',
            toolName: 'اختبار فرط الاستثارة',
            focus: 'اكتشف: هل جهازك العصبي في وضع خطر دائم؟',
            adherenceCheck: 'هل أكملت الاختبار؟',
            outcomeCheck: 'ما مستوى استثارتك من ١-١٠؟',
            durationMinutes: 5,
            note: 'فهم نمطك هو أول خطوة في التغيير',
        },
        {
            day: 2,
            phase: 'practice',
            weekGoal: 'خفض استثارة الجهاز العصبي وبناء ساعة الهدوء اليومية',
            toolId: 'nafsi_anxiety_practice',
            toolHref: '/breathe',
            toolName: 'تنفس + مسح جسدي',
            focus: 'طبّق جلسة تنفس ٨ دقائق مرتين: صباحاً + قبل النوم',
            adherenceCheck: 'هل تنفّست صباحاً ومساءً؟',
            outcomeCheck: 'كيف شعرت بعد جلسة التنفس؟',
            durationMinutes: 8,
        },
        {
            day: 3,
            phase: 'understand',
            weekGoal: 'خفض استثارة الجهاز العصبي وبناء ساعة الهدوء اليومية',
            toolId: 'nafsi_anxiety_workshop',
            toolHref: '/library?domain=nafsi&topic=stress-amplification',
            toolName: 'كيف يضخم التوتر الأعراض',
            focus: 'افهم حلقة التوتر → أعراض → مزيد من التوتر',
            adherenceCheck: 'هل شاهدت الورشة؟',
            outcomeCheck: 'هل تعرّفت على نمطك في الحلقة؟',
            durationMinutes: 8,
        },
        {
            day: 4,
            phase: 'measure',
            weekGoal: 'خفض استثارة الجهاز العصبي وبناء ساعة الهدوء اليومية',
            toolId: 'nafsi_anxiety_tracker',
            toolHref: '/quick-check-in',
            toolName: 'متابعة صباح / مساء',
            focus: 'سجّل مستوى قلقك صباحاً ومساءً: ما المحفزات؟',
            adherenceCheck: 'هل سجّلت مستوى قلقك اليوم؟',
            outcomeCheck: 'هل انخفض متوسط قلقك مقارنةً باليوم الأول؟',
            durationMinutes: 2,
        },
        {
            day: 5,
            phase: 'practice',
            weekGoal: 'خفض استثارة الجهاز العصبي وبناء ساعة الهدوء اليومية',
            toolId: 'nafsi_anxiety_practice',
            toolHref: '/breathe',
            toolName: 'تنفس + مسح جسدي',
            focus: 'التنفس مجدداً — أضِف: ١٠ دقائق بدون شاشة بعده',
            adherenceCheck: 'هل تنفّست اليوم؟',
            outcomeCheck: 'هل لاحظت فرقاً في جسمك بعد التنفس؟',
            durationMinutes: 8,
            note: 'وقت بدون شاشة هو دعم عصبي لا يُعوَّض',
        },
        {
            day: 6,
            phase: 'measure',
            weekGoal: 'خفض استثارة الجهاز العصبي وبناء ساعة الهدوء اليومية',
            toolId: 'nafsi_anxiety_tracker',
            toolHref: '/quick-check-in',
            toolName: 'متابعة صباح / مساء',
            focus: 'قارن قياساتك: يوم ١ مقابل يوم ٦ — ما الفرق؟',
            adherenceCheck: 'هل سجّلت اليوم؟',
            outcomeCheck: 'هل تحسّن مستوى القلق خلال الأسبوع؟',
            durationMinutes: 2,
        },
        {
            day: 7,
            phase: 'assess',
            weekGoal: 'خفض استثارة الجهاز العصبي وبناء ساعة الهدوء اليومية',
            toolId: 'nafsi_anxiety_test',
            toolHref: '/assess/anxiety',
            toolName: 'إعادة تقييم القلق',
            focus: 'أعد الاختبار وقارن النتيجة باليوم الأول',
            adherenceCheck: 'هل أكملت الأسبوع باستمرار؟',
            outcomeCheck: 'هل انخفض مستواك من ١-١٠ مقارنةً ببداية الأسبوع؟',
            durationMinutes: 5,
            note: 'إذا لم يتحسن القلق — هذا يعني أنك تحتاج دعم أعمق من متخصص',
        },
    ],
};

/* ══════════════════════════════════════════════════════════
   3. بروتوكول الطاقة — energy_fatigue — 7 أيام
   ══════════════════════════════════════════════════════════ */

const ENERGY_PROTOCOL: SubdomainProtocol = {
    subdomainId: 'energy_fatigue',
    version: 1,
    totalDays: 7,
    arabicTitle: 'بروتوكول استعادة الطاقة ٧ أيام',
    weekGoal: 'فهم جذر الإرهاق وبناء عادات الطاقة اليومية',
    reassessAt: {
        afterDay: 7,
        afterCompletionPercent: 71,
        earlyEscalateIfNoActionByDay: 4,
    },
    escalateIfNoProgressByDay: 5,
    days: [
        {
            day: 1,
            phase: 'understand',
            weekGoal: 'فهم جذر الإرهاق وبناء عادات الطاقة اليومية',
            toolId: 'jasadi_energy_test',
            toolHref: '/symptom-checker',
            toolName: 'اختبار جذر الإرهاق',
            focus: 'اكتشف السبب الحقيقي وراء إرهاقك: كظرية؟ نقص؟ ميتوكوندريا؟',
            adherenceCheck: 'هل أكملت الاختبار؟',
            outcomeCheck: 'ما الجذر الأرجح لإرهاقك؟',
            durationMinutes: 8,
            note: 'الإرهاق له جذور متعددة — الفهم أول الطريق',
        },
        {
            day: 2,
            phase: 'practice',
            weekGoal: 'فهم جذر الإرهاق وبناء عادات الطاقة اليومية',
            toolId: 'jasadi_energy_practice',
            toolHref: '/breathe',
            toolName: 'ممارسات الطاقة الصغيرة',
            focus: 'طبّق تمرين ٣ دقائق في منتصف اليوم لرفع الطاقة',
            adherenceCheck: 'هل طبّقت الممارسة اليوم؟',
            outcomeCheck: 'هل لاحظت فرقاً في طاقتك؟',
            durationMinutes: 3,
        },
        {
            day: 3,
            phase: 'understand',
            weekGoal: 'فهم جذر الإرهاق وبناء عادات الطاقة اليومية',
            toolId: 'jasadi_energy_workshop',
            toolHref: '/library?domain=jasadi&topic=energy',
            toolName: 'فهم الطاقة من الجذر',
            focus: 'تعرّف على لماذا أنت متعب حقاً — علمياً',
            adherenceCheck: 'هل شاهدت الورشة؟',
            outcomeCheck: 'ما الشيء الذي ستغيّر في روتينك اليومي؟',
            durationMinutes: 10,
        },
        {
            day: 4,
            phase: 'measure',
            weekGoal: 'فهم جذر الإرهاق وبناء عادات الطاقة اليومية',
            toolId: 'jasadi_energy_tracker',
            toolHref: '/quick-check-in',
            toolName: 'متابعة الطاقة',
            focus: 'سجّل طاقتك ٣ مرات: صباح + ظهر + مساء',
            adherenceCheck: 'هل سجّلت طاقتك ٣ مرات اليوم؟',
            outcomeCheck: 'ما وقت الذروة وأوقات الانهيار في يومك؟',
            durationMinutes: 1,
        },
        {
            day: 5,
            phase: 'practice',
            weekGoal: 'فهم جذر الإرهاق وبناء عادات الطاقة اليومية',
            toolId: 'jasadi_energy_practice',
            toolHref: '/breathe',
            toolName: 'ممارسات الطاقة الصغيرة',
            focus: 'كرّر الممارسة — أضِف: كوب ماء + ٥ دقائق شمس',
            adherenceCheck: 'هل طبّقت مجموعة الطاقة اليوم؟',
            outcomeCheck: 'هل لاحظت تحسناً في طاقة منتصف اليوم؟',
            durationMinutes: 5,
            note: 'الماء والشمس والحركة ثلاثي الطاقة المجاني',
        },
        {
            day: 6,
            phase: 'measure',
            weekGoal: 'فهم جذر الإرهاق وبناء عادات الطاقة اليومية',
            toolId: 'jasadi_energy_tracker',
            toolHref: '/quick-check-in',
            toolName: 'متابعة الطاقة',
            focus: 'قارن: متوسط طاقتك يوم ١ مقابل يوم ٦',
            adherenceCheck: 'هل سجّلت طاقتك اليوم؟',
            outcomeCheck: 'هل تحسّن متوسط طاقتك خلال الأسبوع؟',
            durationMinutes: 1,
        },
        {
            day: 7,
            phase: 'assess',
            weekGoal: 'فهم جذر الإرهاق وبناء عادات الطاقة اليومية',
            toolId: 'jasadi_energy_test',
            toolHref: '/symptom-checker',
            toolName: 'إعادة تقييم الطاقة',
            focus: 'أعد الاختبار: هل تغيّر جذر إرهاقك؟ هل تحسّنت؟',
            adherenceCheck: 'هل أكملت أيام القياس؟',
            outcomeCheck: 'ما متوسط طاقتك الأسبوعي من ١-١٠ الآن؟',
            durationMinutes: 8,
            note: 'إذا لم تتحسن الطاقة — الجذر قد يكون هرمونياً أو غدياً ويحتاج تحاليل',
        },
    ],
};

// ── Exported constants for protocol-registry.ts imports ──
export { SLEEP_PROTOCOL, ANXIETY_PROTOCOL, ENERGY_PROTOCOL };

const PROTOCOL_MAP: Partial<Record<SubdomainId, SubdomainProtocol>> = {
    sleep:           SLEEP_PROTOCOL,
    anxiety_arousal: ANXIETY_PROTOCOL,
    energy_fatigue:  ENERGY_PROTOCOL,
};

/* ══════════════════════════════════════════════════════════
   PUBLIC API
   ══════════════════════════════════════════════════════════ */

/**
 * Get the protocol for a subdomain.
 * Returns null if no protocol exists yet (Sprint 1: only 3 subdomains).
 */
export function getProtocol(subdomainId: SubdomainId | string): SubdomainProtocol | null {
    return PROTOCOL_MAP[subdomainId as SubdomainId] ?? null;
}

/**
 * Get the DayProtocol for a specific day number (1-7).
 * Clamps to last day if day > totalDays.
 */
export function getDayProtocol(protocol: SubdomainProtocol, day: number): DayProtocol {
    const clamped = Math.max(1, Math.min(day, protocol.totalDays));
    return protocol.days[clamped - 1];
}

/**
 * Check if a subdomain has a protocol in Sprint 1.
 */
export function hasProtocol(subdomainId: SubdomainId | string): boolean {
    return subdomainId in PROTOCOL_MAP;
}
