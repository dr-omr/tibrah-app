// lib/protocol-registry.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Protocol Registry (Sprint 5)
// ════════════════════════════════════════════════════════════════════════
//
// قاموس مركزي لكل بروتوكول في طِبرة.
// يُسهّل توسيع النظام من 3 إلى 26+ subdomain بدون فوضى hardcoded.
//
// البنية:
//   RegisteredProtocol = SubdomainProtocol + حقول إضافية:
//     • reassessmentTemplate  → نص شاشة إعادة التقييم
//     • handoffCopy           → نص كل مسار thandoff
//     • insightHooks          → قواعد tracker insight
//     • completionCopy        → رسالة الإكمال
//     • requiredToolTypes     → الحد الأدنى من أنواع الأدوات
//
// لا تمس: computeRouting، scoring، analytics core.
// ════════════════════════════════════════════════════════════════════════

import type { SubdomainId }        from '@/components/health-engine/types';
import type { SubdomainProtocol }  from '@/lib/protocol-engine';
import { SLEEP_PROTOCOL, ANXIETY_PROTOCOL, ENERGY_PROTOCOL } from '@/lib/protocol-engine';

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

export interface ReassessmentTemplate {
    /** سؤال التحسن الرئيسي */
    improvementQuestion: string;
    /** تسمية العرض المتبقي */
    remainingSymptomLabel: string;
    /** نص إذا لم يتغير شيء */
    noChangeText: string;
    /** نص إذا تراجع الوضع */
    worseText: string;
    /** الخطوة التالية عند التحسن */
    nextStepOnImprovement: string;
    /** الخطوة التالية عند عدم التغيير */
    nextStepOnNoChange: string;
    /** الخطوة التالية عند التراجع */
    nextStepOnWorse: string;
}

export interface HandoffCopy {
    /** عند الاستجابة للبروتوكول */
    responding: string;
    /** عند الاستمرار بلطف */
    repeat_gently: string;
    /** عند الحاجة لإعادة تقييم */
    reassess_now: string;
    /** عند الحاجة لجلسة */
    book_session: string;
}

export type InsightLevel = 'low' | 'medium' | 'high';

export interface InsightHook {
    /** معرّف أداة الـ tracker */
    trackerId: string;
    /** الحقل المقروء من سجل localStorage */
    scoreField: string;
    /** الحدود الفاصلة */
    thresholds: { low: number; high: number };
    /** نصوص كل مستوى */
    messages: Record<InsightLevel, string>;
    /** emoji الأداة */
    emoji: string;
    /** تسمية الحقل */
    label: string;
}

export type RequiredToolType = 'test' | 'practice' | 'workshop' | 'tracker';

export interface RegisteredProtocol extends SubdomainProtocol {
    /** رسالة إكمال البروتوكول */
    completionCopy: string;
    /** نصوص كل مسار Handoff */
    handoffCopy: HandoffCopy;
    /** قالب شاشة إعادة التقييم */
    reassessmentTemplate: ReassessmentTemplate;
    /** قواعد tracker insight */
    insightHooks: InsightHook[];
    /** الأنواع الإلزامية في هذا البروتوكول */
    requiredToolTypes: RequiredToolType[];
}

/* ══════════════════════════════════════════════════════════
   RE-EXPORT EXISTING PROTOCOLS FOR BACKWARD COMPATIBILITY
   الـ 3 بروتوكولات الحالية تُضاف هنا بالحقول الجديدة
   ══════════════════════════════════════════════════════════ */

const SLEEP_REGISTERED: RegisteredProtocol = {
    ...SLEEP_PROTOCOL,
    completionCopy: 'أكملت بروتوكول إعادة النوم! 7 أيام من الانتظام تُرسّخ إيقاعك البيولوجي.',
    handoffCopy: {
        responding:    'النوم يتحسن — كمّل الأسبوع الثاني لترسيخ العادة.',
        repeat_gently: 'كرّر البروتوكول بلطف — النوم يحتاج وقتاً قبل أن يستقر.',
        reassess_now:  'نحتاج نفهم أعمق — أعِد التقييم لنحدد الخطوة الصحيحة.',
        book_session:  'نومك يحتاج دعماً أعمق — جلسة مع متخصص ستُسرّع التعافي.',
    },
    reassessmentTemplate: {
        improvementQuestion: 'كيف تغيّر نومك منذ بدأت البروتوكول؟',
        remainingSymptomLabel: 'صعوبة في النوم',
        noChangeText: 'النوم يحتاج صبراً — الإيقاع البيولوجي يستغرق 3 أسابيع للاستقرار.',
        worseText: 'تراجع النوم قد يشير لسبب أعمق — قلق، ألم، أو توتر مزمن يحتاج تقييم.',
        nextStepOnImprovement: 'رائع! كمّل الأسبوع الثاني للتثبيت.',
        nextStepOnNoChange: 'جرّب إضافة: لا شاشات 45 دقيقة قبل النوم + تبريد الغرفة.',
        nextStepOnWorse: 'اقترح جلسة مع مختص — النوم المتراجع يحتاج تدخلاً مباشراً.',
    },
    insightHooks: [
        {
            trackerId: 'jasadi_sleep_tracker',
            scoreField: 'quality',
            thresholds: { low: 2, high: 4 },
            emoji: '😴',
            label: 'جودة النوم',
            messages: {
                low:    'نوم ضعيف الليلة — بروتوكول المساء سيساعد الليلة القادمة',
                medium: 'نوم مقبول — حاول النوم أبكر 30 دقيقة الليلة',
                high:   'نوم جيد — جسمك يتعافى ✓ الاستمرار هو المفتاح',
            },
        },
    ],
    requiredToolTypes: ['test', 'practice', 'workshop', 'tracker'],
};

const ANXIETY_REGISTERED: RegisteredProtocol = {
    ...ANXIETY_PROTOCOL,
    completionCopy: 'أسبوع من التنفس والوعي! جهازك العصبي يشكرك — الانتظام هو ما يُثبّت التغيير.',
    handoffCopy: {
        responding:    'القلق ينخفض — واصل التنفس اليومي وسجّل الفرق.',
        repeat_gently: 'الجهاز العصبي يحتاج ممارسة متكررة — كرّر البروتوكول بلطف.',
        reassess_now:  'نحتاج نقيّم مجدداً — ما تعيشه قد يكون أعمق من مجرد تقنيات.',
        book_session:  'القلق المستمر يستحق دعماً تخصصياً — جلسة مع معالج ستُسرّع تعافيك.',
    },
    reassessmentTemplate: {
        improvementQuestion: 'منذ بدأت بروتوكول القلق — كيف مستوى استثارتك الآن؟',
        remainingSymptomLabel: 'فرط الاستثارة والقلق',
        noChangeText: 'أحياناً القلق يحتاج أكثر من تقنيات — فكّر في دعم نفسي إضافي.',
        worseText: 'القلق المتصاعد يستحق تقييم متخصص — لا تتردد في طلب المساعدة.',
        nextStepOnImprovement: 'ممتاز! كمّل الأسبوع الثاني مع إضافة أوقات بدون شاشة.',
        nextStepOnNoChange: 'أضف: 10 دقائق مشي يومياً — الحركة تكسر دائرة القلق.',
        nextStepOnWorse: 'اقترح جلسة مع معالج نفسي متخصص في القلق الجسدي.',
    },
    insightHooks: [
        {
            trackerId: 'nafsi_anxiety_tracker',
            scoreField: 'morning_anxiety',
            thresholds: { low: 3, high: 7 },
            emoji: '🧘',
            label: 'قلق الصباح',
            messages: {
                low:    'قلق منخفض صباحاً (يوم جيد 👌) — ابقَ واعياً طوال اليوم',
                medium: 'قلق متوسط — تنفس 4-4-6 الآن قبل أي اجتماع',
                high:   'قلق مرتفع — خذ 5 دقائق بعيداً عن الشاشات',
            },
        },
    ],
    requiredToolTypes: ['test', 'practice', 'workshop', 'tracker'],
};

const ENERGY_REGISTERED: RegisteredProtocol = {
    ...ENERGY_PROTOCOL,
    completionCopy: 'أسبوع من تتبع الطاقة! الآن تعرف متى ذروتك ومتى انهيارك — استثمر هذا المعرفة.',
    handoffCopy: {
        responding:    'الطاقة تتحسن — واصل ثلاثي الطاقة: ماء + حركة + نوم منتظم.',
        repeat_gently: 'الطاقة تحتاج وقتاً — كرّر الممارسات ولاحظ التحسن التراكمي.',
        reassess_now:  'الإرهاق المستمر يحتاج تقييم أعمق — قد يكون له جذر عضوي.',
        book_session:  'الإرهاق المزمن الذي لا يتحسن يحتاج تحاليل ومتخصص.',
    },
    reassessmentTemplate: {
        improvementQuestion: 'مقارنة باليوم الأول — كيف مستوى طاقتك الآن؟',
        remainingSymptomLabel: 'الإرهاق والتعب المزمن',
        noChangeText: 'الطاقة لم تتحسن — قد يكون السبب هرمونياً أو تغذوياً يحتاج تحاليل.',
        worseText: 'تراجع الطاقة مع الوقت يستحق تحاليل دم: D3، B12، هرمون الغدة الدرقية.',
        nextStepOnImprovement: 'الطاقة تتحسن — أضف: 20 دقيقة شمس صباحية.',
        nextStepOnNoChange: 'جرّب: فيتامين D3 1000 وحدة + مغنيسيوم مساءً (استشر طبيبك).',
        nextStepOnWorse: 'اقترح زيارة طبيب لإجراء: TSH، فيريتين، D3، B12.',
    },
    insightHooks: [
        {
            trackerId: 'jasadi_energy_tracker',
            scoreField: 'morning_energy',
            thresholds: { low: 4, high: 7 },
            emoji: '⚡',
            label: 'طاقة الصباح',
            messages: {
                low:    'طاقة منخفضة — لا تُرغم نفسك على الكثير، ماء + شمس أولاً',
                medium: 'طاقة متوسطة — امشِ 10 دقائق لرفع الطاقة طبيعياً',
                high:   'طاقة جيدة — استثمرها في المهام الصعبة صباحاً',
            },
        },
    ],
    requiredToolTypes: ['test', 'practice', 'workshop', 'tracker'],
};

/* ══════════════════════════════════════════════════════════
   WAVE 2 PROTOCOLS — 5 بروتوكولات جديدة
   ══════════════════════════════════════════════════════════ */

const DIGESTIVE_REGISTERED: RegisteredProtocol = {
    subdomainId: 'digestive',
    version: 1,
    totalDays: 7,
    arabicTitle: 'بروتوكول دعم الجهاز الهضمي ٧ أيام',
    weekGoal: 'تهدئة الجهاز الهضمي وتحسين العلاقة بين التوتر والهضم',
    reassessAt: {
        afterDay: 7,
        afterCompletionPercent: 71,
        earlyEscalateIfNoActionByDay: 4,
    },
    escalateIfNoProgressByDay: 5,
    days: [
        { day: 1, phase: 'understand', weekGoal: 'تهدئة الجهاز الهضمي وتحسين العلاقة بين التوتر والهضم', toolId: 'jasadi_digestive_test', toolHref: '/tools/test/jasadi_digestive_test', toolName: 'اختبار صحة الجهاز الهضمي', focus: 'اكتشف: هل توترك يؤثر على هضمك؟', adherenceCheck: 'هل أكملت الاختبار؟', outcomeCheck: 'ما الأعراض الهضمية التي تعانيها؟', durationMinutes: 5, note: 'التشخيص الدقيق هو أول خطوة' },
        { day: 2, phase: 'practice', weekGoal: 'تهدئة الجهاز الهضمي', toolId: 'jasadi_digestive_practice', toolHref: '/tools/practice/jasadi_digestive_practice', toolName: 'ممارسات الراحة الهضمية', focus: 'طبّق تمارين تهدئة الجهاز الهضمي', adherenceCheck: 'هل طبّقت الممارسة؟', outcomeCheck: 'هل انخفض توتر البطن؟', durationMinutes: 5 },
        { day: 3, phase: 'understand', weekGoal: 'تهدئة الجهاز الهضمي', toolId: 'jasadi_digestive_workshop', toolHref: '/tools/workshop/jasadi_digestive_workshop', toolName: 'الدماغ الثاني', focus: 'افهم العلاقة بين التوتر والجهاز الهضمي', adherenceCheck: 'هل قرأت الورشة؟', outcomeCheck: 'هل عرفت محفزاتك الهضمية؟', durationMinutes: 8 },
        { day: 4, phase: 'measure', weekGoal: 'تهدئة الجهاز الهضمي', toolId: 'jasadi_digestive_tracker', toolHref: '/tools/tracker/jasadi_digestive_tracker', toolName: 'متابعة الهضم', focus: 'سجّل أعراضك اليومية وربطها بالتوتر', adherenceCheck: 'هل سجّلت اليوم؟', outcomeCheck: 'هل انخفضت الأعراض مقارنةً باليوم الأول؟', durationMinutes: 2 },
        { day: 5, phase: 'practice', weekGoal: 'تهدئة الجهاز الهضمي', toolId: 'jasadi_digestive_practice', toolHref: '/tools/practice/jasadi_digestive_practice', toolName: 'ممارسات الراحة الهضمية', focus: 'كرّر التمارين — أضِف: تنفس قبل كل وجبة', adherenceCheck: 'هل طبّقت اليوم؟', outcomeCheck: 'هل انتبهت للعلاقة بين التوتر والأكل؟', durationMinutes: 5, note: 'الأكل الواعي يحمي الجهاز الهضمي' },
        { day: 6, phase: 'measure', weekGoal: 'تهدئة الجهاز الهضمي', toolId: 'jasadi_digestive_tracker', toolHref: '/tools/tracker/jasadi_digestive_tracker', toolName: 'متابعة الهضم', focus: 'قارن: أسبوع كامل من أعراضك', adherenceCheck: 'هل سجّلت اليوم؟', outcomeCheck: 'ما الأنماط التي اكتشفتها؟', durationMinutes: 2 },
        { day: 7, phase: 'assess', weekGoal: 'تهدئة الجهاز الهضمي', toolId: 'jasadi_digestive_test', toolHref: '/tools/test/jasadi_digestive_test', toolName: 'إعادة تقييم الهضم', focus: 'أعد الاختبار وقارن باليوم الأول', adherenceCheck: 'هل أكملت الأسبوع؟', outcomeCheck: 'هل تحسّنت أعراضك الهضمية؟', durationMinutes: 5, note: 'إذا استمرت الأعراض — استشر طبيباً لاستبعاد أسباب عضوية' },
    ],
    completionCopy: 'أسبوع من الوعي الهضمي! معظم الأعراض الهضمية الوظيفية تتحسن مع انخفاض التوتر.',
    handoffCopy: {
        responding:    'الأعراض الهضمية تتحسن — واصل الأكل الواعي والتنفس قبل الوجبات.',
        repeat_gently: 'الجهاز الهضمي يحتاج وقتاً للتهدئة — كرّر البروتوكول بلطف.',
        reassess_now:  'الأعراض مستمرة — نحتاج تقييم أعمق لمعرفة السبب الحقيقي.',
        book_session:  'الأعراض الهضمية المزمنة تحتاج فحصاً طبياً شاملاً.',
    },
    reassessmentTemplate: {
        improvementQuestion: 'كيف تغيّرت أعراض جهازك الهضمي منذ بدأت البروتوكول؟',
        remainingSymptomLabel: 'الأعراض الهضمية',
        noChangeText: 'الأعراض الهضمية المستمرة تحتاج تقييم — قد تكون حساسية غذائية أو سبب عضوي.',
        worseText: 'تراجع الأعراض يستحق استشارة طبيب لاستبعاد القولون العصبي أو أسباب أخرى.',
        nextStepOnImprovement: 'استمر في الأكل الواعي وتقليل التوتر قبل الوجبات.',
        nextStepOnNoChange: 'جرّب: تجنّب الغلوتين أسبوعاً وانتبه للفرق.',
        nextStepOnWorse: 'اقترح فحص: صورة بطن، تحليل براز، اختبار حساسية الأغذية.',
    },
    insightHooks: [
        {
            trackerId: 'jasadi_digestive_tracker',
            scoreField: 'symptom_level',
            thresholds: { low: 3, high: 6 },
            emoji: '🫁',
            label: 'أعراض الهضم',
            messages: {
                low:    'أعراض هضمية خفيفة — تنفس عميق قبل الأكل يساعد كثيراً',
                medium: 'أعراض هضمية متوسطة — تجنّب الأكل في حالة توتر',
                high:   'أعراض هضمية شديدة — خذ استراحة وطبّق ممارسة الجلسة الآن',
            },
        },
    ],
    requiredToolTypes: ['test', 'practice', 'workshop', 'tracker'],
};

const HORMONAL_REGISTERED: RegisteredProtocol = {
    subdomainId: 'hormonal',
    version: 1,
    totalDays: 7,
    arabicTitle: 'بروتوكول إعادة التوازن الهرموني ٧ أيام',
    weekGoal: 'دعم التوازن الهرموني عبر النوم والتوتر والحركة والتغذية',
    reassessAt: {
        afterDay: 7,
        afterCompletionPercent: 71,
        earlyEscalateIfNoActionByDay: 4,
    },
    escalateIfNoProgressByDay: 5,
    days: [
        { day: 1, phase: 'understand', weekGoal: 'دعم التوازن الهرموني', toolId: 'jasadi_hormonal_test', toolHref: '/tools/test/jasadi_hormonal_test', toolName: 'اختبار التوازن الهرموني', focus: 'اكتشف: ما الأعراض التي تشير لخلل هرموني؟', adherenceCheck: 'هل أكملت الاختبار؟', outcomeCheck: 'ما الأعراض الهرمونية الأكثر تأثيراً؟', durationMinutes: 8, note: 'الهرمونات تتأثر بالتوتر والنوم والغذاء معاً' },
        { day: 2, phase: 'practice', weekGoal: 'دعم التوازن الهرموني', toolId: 'jasadi_hormonal_practice', toolHref: '/tools/practice/jasadi_hormonal_practice', toolName: 'ممارسات دعم الهرمونات', focus: 'طبّق الثلاثي الهرموني: حركة + شمس + نوم مبكر', adherenceCheck: 'هل طبّقت اليوم؟', outcomeCheck: 'هل لاحظت فرقاً في مستوى طاقتك؟', durationMinutes: 5 },
        { day: 3, phase: 'understand', weekGoal: 'دعم التوازن الهرموني', toolId: 'jasadi_hormonal_workshop', toolHref: '/tools/workshop/jasadi_hormonal_workshop', toolName: 'فهم الهرمونات والتوتر', focus: 'افهم كيف يُعطّل الكورتيزول التوازن الهرموني', adherenceCheck: 'هل قرأت الورشة؟', outcomeCheck: 'ما تغيير واحد يمكنك تطبيقه الآن؟', durationMinutes: 10 },
        { day: 4, phase: 'measure', weekGoal: 'دعم التوازن الهرموني', toolId: 'jasadi_hormonal_tracker', toolHref: '/tools/tracker/jasadi_hormonal_tracker', toolName: 'متابعة الأعراض الهرمونية', focus: 'سجّل: الطاقة، المزاج، النوم، والأعراض يومياً', adherenceCheck: 'هل سجّلت اليوم؟', outcomeCheck: 'هل تلاحظ نمطاً في أعراضك؟', durationMinutes: 2 },
        { day: 5, phase: 'practice', weekGoal: 'دعم التوازن الهرموني', toolId: 'jasadi_hormonal_practice', toolHref: '/tools/practice/jasadi_hormonal_practice', toolName: 'ممارسات دعم الهرمونات', focus: 'كرّر — أضِف: تخفيض الكافيين + سكر أقل', adherenceCheck: 'هل طبّقت اليوم؟', outcomeCheck: 'هل لاحظت تغيراً في طاقتك بعد تخفيض الكافيين؟', durationMinutes: 5, note: 'الكافيين يرفع الكورتيزول ويُعطّل الهرمونات الأخرى' },
        { day: 6, phase: 'measure', weekGoal: 'دعم التوازن الهرموني', toolId: 'jasadi_hormonal_tracker', toolHref: '/tools/tracker/jasadi_hormonal_tracker', toolName: 'متابعة الأعراض الهرمونية', focus: 'قارن: اليوم الأول مقابل اليوم السادس', adherenceCheck: 'هل سجّلت اليوم؟', outcomeCheck: 'ما الأعراض التي تحسّنت؟', durationMinutes: 2 },
        { day: 7, phase: 'assess', weekGoal: 'دعم التوازن الهرموني', toolId: 'jasadi_hormonal_test', toolHref: '/tools/test/jasadi_hormonal_test', toolName: 'إعادة تقييم الهرمونات', focus: 'أعد الاختبار وقيّم التغيير', adherenceCheck: 'هل أكملت الأسبوع؟', outcomeCheck: 'هل انخفضت أعراضك الهرمونية؟', durationMinutes: 8, note: 'إذا لم تتحسن الأعراض — تحاليل الدم خطوة ضرورية' },
    ],
    completionCopy: 'أسبوع من دعم الهرمونات! التوازن الهرموني يحتاج 3-6 أسابيع — أنت على الطريق الصحيح.',
    handoffCopy: {
        responding:    'الأعراض تتحسن — الانتظام في النوم والحركة هو المفتاح.',
        repeat_gently: 'الهرمونات تحتاج وقتاً — كرّر البروتوكول واهتم بالنوم والتوتر.',
        reassess_now:  'الأعراض مستمرة — نحتاج مراجعة النمط الكامل لفهم السبب.',
        book_session:  'الاختلال الهرموني المستمر يحتاج فحصاً متخصصاً وربما علاجاً طبياً.',
    },
    reassessmentTemplate: {
        improvementQuestion: 'كيف تغيّرت أعراضك الهرمونية — طاقة، مزاج، دورة — منذ البداية؟',
        remainingSymptomLabel: 'الأعراض الهرمونية',
        noChangeText: 'الهرمونات تحتاج وقتاً أطول من أسبوع واحد — الصبر والانتظام أساسيان.',
        worseText: 'تراجع الأعراض الهرمونية يستحق تحاليل: TSH، E2، Testosterone، Cortisol.',
        nextStepOnImprovement: 'استمر في الثلاثي: نوم منتظم + حركة + تقليل التوتر.',
        nextStepOnNoChange: 'أضف: تناول زنك 15mg وفيتامين D3 مع استشارة طبيبك.',
        nextStepOnWorse: 'زيارة طبيب لإجراء تحاليل هرمونية شاملة ضرورية الآن.',
    },
    insightHooks: [
        {
            trackerId: 'jasadi_hormonal_tracker',
            scoreField: 'energy_level',
            thresholds: { low: 4, high: 7 },
            emoji: '🌙',
            label: 'الطاقة والمزاج',
            messages: {
                low:    'طاقة ومزاج منخفض — الأعراض الهرمونية شديدة اليوم، ارحم نفسك',
                medium: 'أعراض هرمونية متوسطة — حركة خفيفة وشمس ستساعد',
                high:   'أعراض خفيفة — يوم جيد هرمونياً ✓',
            },
        },
    ],
    requiredToolTypes: ['test', 'practice', 'workshop', 'tracker'],
};

const PSYCHOSOMATIC_REGISTERED: RegisteredProtocol = {
    subdomainId: 'psychosomatic',
    version: 1,
    totalDays: 7,
    arabicTitle: 'بروتوكول فك ارتباط التوتر-الجسد ٧ أيام',
    weekGoal: 'فهم كيف تتجسّد المشاعر غير المعالجة في أعراض جسدية',
    reassessAt: {
        afterDay: 7,
        afterCompletionPercent: 71,
        earlyEscalateIfNoActionByDay: 3,
    },
    escalateIfNoProgressByDay: 4,
    days: [
        { day: 1, phase: 'understand', weekGoal: 'فهم ارتباط التوتر بالجسد', toolId: 'nafsi_psychosomatic_test', toolHref: '/tools/test/nafsi_psychosomatic_test', toolName: 'اختبار الأعراض النفسجسدية', focus: 'اكتشف: أين يسكن توترك في جسدك؟', adherenceCheck: 'هل أكملت الاختبار؟', outcomeCheck: 'ما الأعراض الجسدية المرتبطة بتوترك؟', durationMinutes: 5, note: 'الأعراض الجسدية بدون سبب عضوي واضح غالباً لها جذر نفسي' },
        { day: 2, phase: 'practice', weekGoal: 'فهم ارتباط التوتر بالجسد', toolId: 'nafsi_psychosomatic_practice', toolHref: '/tools/practice/nafsi_psychosomatic_practice', toolName: 'تقنية المسح الجسدي', focus: 'طبّق مسح جسدي كامل: أين التوتر؟ أين الألم؟', adherenceCheck: 'هل أجريت المسح الجسدي؟', outcomeCheck: 'ما المنطقة التي تحمل أكثر توتراً في جسمك؟', durationMinutes: 8 },
        { day: 3, phase: 'understand', weekGoal: 'فهم ارتباط التوتر بالجسد', toolId: 'nafsi_psychosomatic_workshop', toolHref: '/tools/workshop/nafsi_psychosomatic_workshop', toolName: 'ذاكرة الجسد', focus: 'افهم كيف تخزّن الأحداث العاطفية في جسدك', adherenceCheck: 'هل قرأت الورشة؟', outcomeCheck: 'ما الحدث العاطفي الذي قد يكون خلف أعراضك؟', durationMinutes: 10 },
        { day: 4, phase: 'measure', weekGoal: 'فهم ارتباط التوتر بالجسد', toolId: 'nafsi_psychosomatic_tracker', toolHref: '/tools/tracker/nafsi_psychosomatic_tracker', toolName: 'يومية التوتر-الجسد', focus: 'ربط يومي: ما حدث مساء — ما موضع الألم اليوم', adherenceCheck: 'هل سجّلت ربط اليوم؟', outcomeCheck: 'هل وجدت ارتباطاً بين مشاعرك وأعراضك؟', durationMinutes: 3 },
        { day: 5, phase: 'practice', weekGoal: 'فهم ارتباط التوتر بالجسد', toolId: 'nafsi_psychosomatic_practice', toolHref: '/tools/practice/nafsi_psychosomatic_practice', toolName: 'تقنية المسح الجسدي', focus: 'مسح جسدي مرة ثانية — استمع للجسد بدون حكم', adherenceCheck: 'هل أجريت المسح؟', outcomeCheck: 'هل انخفض مستوى الألم/التوتر مقارنةً باليوم الثاني؟', durationMinutes: 8, note: 'الوعي الجسدي يُضعف الأعراض النفسجسدية' },
        { day: 6, phase: 'measure', weekGoal: 'فهم ارتباط التوتر بالجسد', toolId: 'nafsi_psychosomatic_tracker', toolHref: '/tools/tracker/nafsi_psychosomatic_tracker', toolName: 'يومية التوتر-الجسد', focus: 'راجع ارتباطاتك هذا الأسبوع — ما النمط؟', adherenceCheck: 'هل سجّلت اليوم؟', outcomeCheck: 'هل فهمت العلاقة بين توترك وأعراضك بشكل أوضح؟', durationMinutes: 3 },
        { day: 7, phase: 'assess', weekGoal: 'فهم ارتباط التوتر بالجسد', toolId: 'nafsi_psychosomatic_test', toolHref: '/tools/test/nafsi_psychosomatic_test', toolName: 'إعادة تقييم الأعراض النفسجسدية', focus: 'أعد التقييم وقيّم الفهم الجديد', adherenceCheck: 'هل أكملت الأسبوع؟', outcomeCheck: 'هل انخفضت شدة الأعراض مع الوعي بجذرها؟', durationMinutes: 5, note: 'الوعي وحده يعالج كثيراً من الأعراض النفسجسدية' },
    ],
    completionCopy: 'أسبوع من الاستماع لجسدك! الوعي الجسدي هو أقوى علاج للأعراض النفسجسدية.',
    handoffCopy: {
        responding:    'الأعراض تتحسن مع الوعي — واصل يومية التوتر-الجسد.',
        repeat_gently: 'الأعراض النفسجسدية تحتاج صبراً — كرّر ولا تُعطِ أعراضاً غيابك.',
        reassess_now:  'الأعراض مستمرة — قد تحتاج عمل أعمق مع معالج متخصص في العلاج الجسدي.',
        book_session:  'الأعراض النفسجسدية الشديدة تستفيد كثيراً من العلاج بالتجسيد مع متخصص.',
    },
    reassessmentTemplate: {
        improvementQuestion: 'منذ بدأت — هل انخفضت شدة أعراضك الجسدية غير المفسّرة؟',
        remainingSymptomLabel: 'الأعراض النفسجسدية',
        noChangeText: 'الأعراض النفسجسدية العميقة قد تحتاج عملاً أعمق — لا تيأس، الطريق صحيح.',
        worseText: 'تصاعد الأعراض يحتاج تقييم متخصص في الطب النفسجسدي.',
        nextStepOnImprovement: 'واصل الوعي الجسدي + أضف: 5 دقائق يومية كتابة مشاعر.',
        nextStepOnNoChange: 'أضف: علاج بالتنفس المتمركز على الجسد مع معالج.',
        nextStepOnWorse: 'اقترح جلسة مع معالج متخصص في العلاج النفسجسدي (Somatic Therapy).',
    },
    insightHooks: [
        {
            trackerId: 'nafsi_psychosomatic_tracker',
            scoreField: 'tension_level',
            thresholds: { low: 3, high: 6 },
            emoji: '🧠',
            label: 'توتر الجسد',
            messages: {
                low:    'توتر جسدي خفيف — يوم جيد للوعي الجسدي',
                medium: 'توتر جسدي متوسط — مسح جسدي 5 دقائق سيساعد الآن',
                high:   'توتر جسدي شديد — استمع لجسدك: ما المشاعر غير المعالجة؟',
            },
        },
    ],
    requiredToolTypes: ['test', 'practice', 'workshop', 'tracker'],
};

const OVERTHINKING_REGISTERED: RegisteredProtocol = {
    subdomainId: 'overthinking',
    version: 1,
    totalDays: 7,
    arabicTitle: 'بروتوكول تهدئة العقل المفكّر الزائد ٧ أيام',
    weekGoal: 'بناء مسافة صحية بين أفكارك وردود أفعالك',
    reassessAt: {
        afterDay: 7,
        afterCompletionPercent: 71,
        earlyEscalateIfNoActionByDay: 3,
    },
    escalateIfNoProgressByDay: 4,
    days: [
        { day: 1, phase: 'understand', weekGoal: 'بناء مسافة بين أفكارك وردودك', toolId: 'fikri_overthink_test', toolHref: '/tools/test/fikri_overthink_test', toolName: 'اختبار فرط التفكير', focus: 'اكتشف: ما نمط تفكيرك الزائد؟', adherenceCheck: 'هل أكملت الاختبار؟', outcomeCheck: 'ما نوع الأفكار التي تستهلك أكثر طاقتك الذهنية؟', durationMinutes: 5, note: 'فرط التفكير ليس ذكاءً زائداً — هو قلق يلبس ثوب الحكمة' },
        { day: 2, phase: 'practice', weekGoal: 'بناء مسافة بين أفكارك وردودك', toolId: 'fikri_overthink_practice', toolHref: '/tools/practice/fikri_overthink_practice', toolName: 'تمرين وضع الأفكار جانباً', focus: 'طبّق: لاحظ الفكرة → سمّها → ضعها جانباً', adherenceCheck: 'هل مارست التمرين؟', outcomeCheck: 'هل بدأت تلاحظ الأفكار بدل أن تتبعها؟', durationMinutes: 8 },
        { day: 3, phase: 'understand', weekGoal: 'بناء مسافة بين أفكارك وردودك', toolId: 'fikri_overthink_workshop', toolHref: '/tools/workshop/fikri_overthink_workshop', toolName: 'لماذا لا يهدأ عقلك؟', focus: 'افهم الفرق بين التفكير المنتج والتفكير الدائري', adherenceCheck: 'هل قرأت الورشة؟', outcomeCheck: 'هل عرفت الفرق في تفكيرك؟', durationMinutes: 8 },
        { day: 4, phase: 'measure', weekGoal: 'بناء مسافة بين أفكارك وردودك', toolId: 'fikri_overthink_tracker', toolHref: '/tools/tracker/fikri_overthink_tracker', toolName: 'متابعة الأفكار', focus: 'سجّل: عدد مرات الإفراط في التفكير اليوم وموضوعاتها', adherenceCheck: 'هل سجّلت اليوم؟', outcomeCheck: 'ما الموضوعات التي تُسبّب أكثر تفكير لديك؟', durationMinutes: 2 },
        { day: 5, phase: 'practice', weekGoal: 'بناء مسافة بين أفكارك وردودك', toolId: 'fikri_overthink_practice', toolHref: '/tools/practice/fikri_overthink_practice', toolName: 'تمرين وضع الأفكار جانباً', focus: 'كرّر التمرين — أضِف: وقت تفكير محدد ومحدود', adherenceCheck: 'هل مارست التمرين؟', outcomeCheck: 'هل انخفض الوقت الضائع في الأفكار الدائرية؟', durationMinutes: 8, note: '"وقت القلق" المحدد يُحرّر بقية اليوم' },
        { day: 6, phase: 'measure', weekGoal: 'بناء مسافة بين أفكارك وردودك', toolId: 'fikri_overthink_tracker', toolHref: '/tools/tracker/fikri_overthink_tracker', toolName: 'متابعة الأفكار', focus: 'قارن: اليوم الأول مقابل اليوم السادس', adherenceCheck: 'هل سجّلت اليوم؟', outcomeCheck: 'هل انخفضت حدة الأفكار الدائرية؟', durationMinutes: 2 },
        { day: 7, phase: 'assess', weekGoal: 'بناء مسافة بين أفكارك وردودك', toolId: 'fikri_overthink_test', toolHref: '/tools/test/fikri_overthink_test', toolName: 'إعادة تقييم فرط التفكير', focus: 'أعد الاختبار وقارن النتيجة', adherenceCheck: 'هل أكملت الأسبوع؟', outcomeCheck: 'هل بدأت تبني مسافة صحية من أفكارك؟', durationMinutes: 5, note: 'التغيير في فرط التفكير يُلاحَظ أولاً كـ"قدر أقل للاستجابة"' },
    ],
    completionCopy: 'أسبوع من الوعي الذهني! العقل الهادئ لا يعني غياب الأفكار — بل القدرة على عدم الانجراف.',
    handoffCopy: {
        responding:    'الأفكار الدائرية تتراجع — واصل "وقت القلق" المحدد.',
        repeat_gently: 'فرط التفكير عادة عميقة — كرّر البروتوكول بصبر.',
        reassess_now:  'الأفكار لا تزال مستنزفة — نحتاج فهم أعمق لجذرها.',
        book_session:  'فرط التفكير المزمن يستجيب جيداً للعلاج المعرفي مع متخصص.',
    },
    reassessmentTemplate: {
        improvementQuestion: 'كيف تغيّرت علاقتك بالأفكار الدائرية منذ بدأت البروتوكول؟',
        remainingSymptomLabel: 'الأفكار الدائرية المستنزفة',
        noChangeText: 'فرط التفكير العميق يحتاج أكثر من أسبوع — الانتظام هو المعادل.',
        worseText: 'الأفكار المستنزفة بشدة قد تشير لقلق مزمن يحتاج دعم متخصص.',
        nextStepOnImprovement: 'واصل: وقت تفكير محدد + تسجيل الأفكار + مسافة واعية.',
        nextStepOnNoChange: 'أضف: كتابة الأفكار يومياً لتفريغها خارج الرأس.',
        nextStepOnWorse: 'اقترح جلسة CBT مع معالج متخصص في القلق المعرفي.',
    },
    insightHooks: [
        {
            trackerId: 'fikri_overthink_tracker',
            scoreField: 'rumination_count',
            thresholds: { low: 3, high: 7 },
            emoji: '🌀',
            label: 'الأفكار الدائرية',
            messages: {
                low:    'أفكار دائرية خفيفة — يوم ذهني هادئ نسبياً ✓',
                medium: 'أفكار دائرية متوسطة — ضع "وقت قلق" محدد 15 دقيقة',
                high:   'أفكار دائرية كثيفة — إيقاف مؤقت: اشرب ماء + امشِ 5 دقائق',
            },
        },
    ],
    requiredToolTypes: ['test', 'practice', 'workshop', 'tracker'],
};

const RHYTHM_DISRUPTION_REGISTERED: RegisteredProtocol = {
    subdomainId: 'rhythm_disruption',
    version: 1,
    totalDays: 7,
    arabicTitle: 'بروتوكول إعادة بناء الإيقاع اليومي ٧ أيام',
    weekGoal: 'إعادة برمجة الساعة البيولوجية بالانتظام والضوء والحركة',
    reassessAt: {
        afterDay: 7,
        afterCompletionPercent: 71,
        earlyEscalateIfNoActionByDay: 3,
    },
    escalateIfNoProgressByDay: 4,
    days: [
        { day: 1, phase: 'understand', weekGoal: 'إعادة برمجة الإيقاع البيولوجي', toolId: 'ruhi_rhythm_test', toolHref: '/tools/test/ruhi_rhythm_test', toolName: 'اختبار الإيقاع اليومي', focus: 'اكتشف: أين فقدت إيقاعك؟', adherenceCheck: 'هل أكملت الاختبار؟', outcomeCheck: 'ما أكثر جانب مختل في إيقاعك اليومي؟', durationMinutes: 5, note: 'الإيقاع اليومي المنتظم = أساس الصحة النفسية والجسدية' },
        { day: 2, phase: 'practice', weekGoal: 'إعادة برمجة الإيقاع البيولوجي', toolId: 'ruhi_rhythm_practice', toolHref: '/tools/practice/ruhi_rhythm_practice', toolName: 'روتين الصباح', focus: 'اليوم: ميعاد ثابت للاستيقاظ + شمس أول 30 دقيقة', adherenceCheck: 'هل استيقظت في ميعاد ثابت؟', outcomeCheck: 'هل شعرت بفرق مع الضوء الصباحي؟', durationMinutes: 30 },
        { day: 3, phase: 'understand', weekGoal: 'إعادة برمجة الإيقاع البيولوجي', toolId: 'ruhi_rhythm_workshop', toolHref: '/tools/workshop/ruhi_rhythm_workshop', toolName: 'علم الإيقاع البيولوجي', focus: 'افهم لماذا الانتظام هو أقوى علاج للإيقاع المكسور', adherenceCheck: 'هل قرأت الورشة؟', outcomeCheck: 'ما العادة الواحدة التي ستُثبتها هذا الأسبوع؟', durationMinutes: 8 },
        { day: 4, phase: 'measure', weekGoal: 'إعادة برمجة الإيقاع البيولوجي', toolId: 'ruhi_rhythm_tracker', toolHref: '/tools/tracker/ruhi_rhythm_tracker', toolName: 'متابعة الإيقاع', focus: 'سجّل: ميعاد النوم والاستيقاظ + ساعات الشاشة', adherenceCheck: 'هل سجّلت اليوم؟', outcomeCheck: 'هل ثبت ميعاد نومك هذا الأسبوع؟', durationMinutes: 2 },
        { day: 5, phase: 'practice', weekGoal: 'إعادة برمجة الإيقاع البيولوجي', toolId: 'ruhi_rhythm_practice', toolHref: '/tools/practice/ruhi_rhythm_practice', toolName: 'روتين الصباح', focus: 'كرّر روتين الصباح — أضِف: روتين ختامي ثابت للنوم', adherenceCheck: 'هل طبّقت روتين الصباح والمساء؟', outcomeCheck: 'هل تشعر بثبات أكبر في إيقاعك؟', durationMinutes: 30, note: 'الروتين يُطمئن الجهاز العصبي — الأمان يؤثر على كل شيء' },
        { day: 6, phase: 'measure', weekGoal: 'إعادة برمجة الإيقاع البيولوجي', toolId: 'ruhi_rhythm_tracker', toolHref: '/tools/tracker/ruhi_rhythm_tracker', toolName: 'متابعة الإيقاع', focus: 'قارن: إيقاعك اليوم مقابل اليوم الأول', adherenceCheck: 'هل سجّلت اليوم؟', outcomeCheck: 'هل انتظم ميعاد نومك هذا الأسبوع؟', durationMinutes: 2 },
        { day: 7, phase: 'assess', weekGoal: 'إعادة برمجة الإيقاع البيولوجي', toolId: 'ruhi_rhythm_test', toolHref: '/tools/test/ruhi_rhythm_test', toolName: 'إعادة تقييم الإيقاع', focus: 'أعد الاختبار: هل تغيّر إيقاعك؟', adherenceCheck: 'هل أكملت الأسبوع؟', outcomeCheck: 'هل بدأ إيقاعك يستقر؟', durationMinutes: 5, note: 'الإيقاع يحتاج 3 أسابيع لإعادة برمجة كاملة — أنت في البداية' },
    ],
    completionCopy: 'أسبوع من الانتظام! الإيقاع المنتظم يُحسّن النوم، الطاقة، والمزاج — استمر.',
    handoffCopy: {
        responding:    'الإيقاع يتحسن — واصل الميعاد الثابت حتى في عطلة نهاية الأسبوع.',
        repeat_gently: 'الإيقاع البيولوجي يحتاج أسابيع — كرّر بانتظام.',
        reassess_now:  'الإيقاع ما زال مضطرباً — نحتاج فهم ما يكسره.',
        book_session:  'اضطراب الإيقاع المزمن قد يكون مرتبطاً بقلق أو اكتئاب — جلسة ستساعد.',
    },
    reassessmentTemplate: {
        improvementQuestion: 'كيف تغيّر إيقاعك اليومي — نوم، طاقة، مزاج — منذ البداية؟',
        remainingSymptomLabel: 'اضطراب الإيقاع اليومي',
        noChangeText: 'الإيقاع يحتاج 3 أسابيع على الأقل — الانتظام أهم من الكمال.',
        worseText: 'تصاعد اضطراب الإيقاع قد يشير لاضطراب مزاج يحتاج تقييم.',
        nextStepOnImprovement: 'واصل الميعاد الثابت + أضف: 20 دقيقة مشي في الشمس.',
        nextStepOnNoChange: 'أضف: لا شاشات أبداً في السرير، وأضِء الغرفة صباحاً فوراً.',
        nextStepOnWorse: 'اقترح تقييم نفسي للاضطراب المزاجي المرتبط بالإيقاع.',
    },
    insightHooks: [
        {
            trackerId: 'ruhi_rhythm_tracker',
            scoreField: 'rhythm_score',
            thresholds: { low: 3, high: 7 },
            emoji: '🌅',
            label: 'انتظام الإيقاع',
            messages: {
                low:    'إيقاع مضطرب — الميعاد الثابت فقط ليلة واحدة سيفرق',
                medium: 'إيقاع متذبذب — حاول النوم قبل منتصف الليل الليلة',
                high:   'إيقاع منتظم — ممتاز! الانتظام يبني نفسه ✓',
            },
        },
    ],
    requiredToolTypes: ['test', 'practice', 'workshop', 'tracker'],
};

/* ══════════════════════════════════════════════════════════
   PROTOCOL REGISTRY MAP
   ══════════════════════════════════════════════════════════ */

const REGISTRY: Partial<Record<SubdomainId, RegisteredProtocol>> = {
    // Wave 1 (Sprint 1-4)
    sleep:            SLEEP_REGISTERED,
    anxiety_arousal:  ANXIETY_REGISTERED,
    energy_fatigue:   ENERGY_REGISTERED,
    // Wave 2 (Sprint 5)
    digestive:        DIGESTIVE_REGISTERED,
    hormonal:         HORMONAL_REGISTERED,
    psychosomatic:    PSYCHOSOMATIC_REGISTERED,
    overthinking:     OVERTHINKING_REGISTERED,
    rhythm_disruption: RHYTHM_DISRUPTION_REGISTERED,
};

/* ══════════════════════════════════════════════════════════
   PUBLIC API
   ══════════════════════════════════════════════════════════ */

/** Get a registered protocol with full metadata */
export function getRegisteredProtocol(subdomainId: SubdomainId | string): RegisteredProtocol | null {
    return REGISTRY[subdomainId as SubdomainId] ?? null;
}

/** Check if a subdomain has a registered protocol */
export function hasRegisteredProtocol(subdomainId: SubdomainId | string): boolean {
    return subdomainId in REGISTRY;
}

/** Get all registered protocol IDs (for section integration) */
export function getAllRegisteredIds(): SubdomainId[] {
    return Object.keys(REGISTRY) as SubdomainId[];
}

/** Get insight hooks for a subdomain */
export function getInsightHooks(subdomainId: SubdomainId | string): InsightHook[] {
    return REGISTRY[subdomainId as SubdomainId]?.insightHooks ?? [];
}

/** Get reassessment template */
export function getReassessmentTemplate(subdomainId: SubdomainId | string): ReassessmentTemplate | null {
    return REGISTRY[subdomainId as SubdomainId]?.reassessmentTemplate ?? null;
}

/** Get handoff copy */
export function getHandoffCopy(subdomainId: SubdomainId | string): HandoffCopy | null {
    return REGISTRY[subdomainId as SubdomainId]?.handoffCopy ?? null;
}
