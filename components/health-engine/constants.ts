// components/health-engine/constants.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Conscious Integrative Diagnostic System (CIDS) v1.0
// ════════════════════════════════════════════════════════════════════════
//
// Philosophy:
//   "The body does not separate its symptoms from its stories."
//   — Tibrah Medical Intelligence
//
// Architecture:
//   Every question arrives at the patient as a single, empathic inquiry.
//   Silently, the engine reads each selected answer across three dimensions:
//
//   LAYER 1 — Conventional Medicine   → Urgency, red flags, gold-standard triage
//   LAYER 2 — Functional / Orthomlcr  → Root cause clusters, nutrient/system markers
//   LAYER 3 — Somatic-Emotional        → The body's encrypted emotional language
//
//   The final output = integrated pattern fingerprint, not a checklist.
//   رفضنا القائمة. اخترنا البصيرة.
//
// Scientific references:
//   van der Kolk (The Body Keeps the Score)
//   Gabor Maté (When the Body Says No)
//   Jeffrey Bland (The Disease Delusion — Functional Medicine)
//   Amen Clinics (Multi-dimensional brain-body assessment)
//   IFM (Institute for Functional Medicine) matrix
//   UpToDate clinical guidelines (Mayo Clinic, Cleveland Clinic)
// ════════════════════════════════════════════════════════════════════════

import type {
    Pathway, EngineAnswers, TriageResult,
    FunctionalPattern, SomaticTheme,
} from './types';

/* ══════════════════════════════════════════════════════════
   OPTION FINGERPRINT REGISTRY
   Each answer string → its three-dimensional encoding.
   The engine looks up selected options here to compute
   functional patterns and somatic themes silently.
   ══════════════════════════════════════════════════════════ */

interface OptionMeta {
    functional: FunctionalPattern;
    somatic: SomaticTheme | 'none';
    functionalWeight: number; // 1-3
    somaticWeight: number;    // 1-3
    conventionalWeight: number; // 1-3
}

const OPTION_META: Record<string, OptionMeta> = {
    // ── FATIGUE options ──────────────────────────────────
    'فجأة بعد مرض أو صدمة': { functional: 'mitochondrial_drain', somatic: 'hypervigilance', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 2 },
    'تدريجياً على أشهر': { functional: 'adrenal_exhaustion', somatic: 'chronic_self_override', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 1 },
    'موجود منذ سنوات': { functional: 'nutrient_depletion', somatic: 'childhood_imprint', functionalWeight: 3, somaticWeight: 3, conventionalWeight: 1 },
    'تحسّن وعاد للأسوأ': { functional: 'adrenal_exhaustion', somatic: 'hypervigilance', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 1 },

    'أستيقظ منهكاً قبل أي مجهود': { functional: 'adrenal_exhaustion', somatic: 'chronic_self_override', functionalWeight: 3, somaticWeight: 2, conventionalWeight: 2 },
    'هبوط طاقة منتصف النهار': { functional: 'blood_sugar_chaos', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 1 },
    'إرهاق بعد الأكل مباشرة': { functional: 'gut_dysbiosis', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 1 },
    'أي مجهود بسيط يُنهكني': { functional: 'mitochondrial_drain', somatic: 'hypervigilance', functionalWeight: 3, somaticWeight: 2, conventionalWeight: 2 },
    'إرهاق نفسي أكثر من جسدي': { functional: 'adrenal_exhaustion', somatic: 'suppressed_expression', functionalWeight: 2, somaticWeight: 3, conventionalWeight: 1 },

    'أشتاق للسكر باستمرار (خلل سكر الدم)': { functional: 'blood_sugar_chaos', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 1 },
    'برود وتساقط شعر وزيادة وزن (الدرقية)': { functional: 'thyroid_underfunction', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 2 },
    'مرتبط بالدورة الشهرية (هرموني)': { functional: 'hormonal_cascade', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 1 },
    'ضعف مناعة ونزلات (فيتامين د/زنك)': { functional: 'nutrient_depletion', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 2 },
    'لا أتحمل الكافيين والتوتر (كظرية)': { functional: 'adrenal_exhaustion', somatic: 'hypervigilance', functionalWeight: 3, somaticWeight: 2, conventionalWeight: 1 },
    'ضبابية ذهنية مع الإرهاق': { functional: 'mitochondrial_drain', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 2 },

    'التعب يشتد عند التفكير بأشياء بعينها': { functional: 'nervous_system_dysreg', somatic: 'hypervigilance', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 1 },
    'أحمل ثقلاً عاطفياً يسبق التعب': { functional: 'adrenal_exhaustion', somatic: 'compassion_fatigue', functionalWeight: 2, somaticWeight: 3, conventionalWeight: 1 },
    'الإرهاق مرتبط بمواقف الإجبار': { functional: 'nervous_system_dysreg', somatic: 'suppressed_expression', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 1 },
    'فقدان الدافع يسبق الإرهاق الجسدي': { functional: 'adrenal_exhaustion', somatic: 'grief_unprocessed', functionalWeight: 2, somaticWeight: 3, conventionalWeight: 1 },

    // ── HEADACHE options ─────────────────────────────────
    'نصف الرأس فقط (شقيقة)': { functional: 'hormonal_cascade', somatic: 'suppressed_expression', functionalWeight: 2, somaticWeight: 1, conventionalWeight: 2 },
    'جبهة وبين العينين': { functional: 'inflammatory_load', somatic: 'none', functionalWeight: 1, somaticWeight: 0, conventionalWeight: 1 },
    'خلف إحدى العينين': { functional: 'nervous_system_dysreg', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 2 },
    'مؤخرة الرأس والرقبة': { functional: 'nervous_system_dysreg', somatic: 'suppressed_expression', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 1 },
    'ضغط يشمل كل الرأس': { functional: 'adrenal_exhaustion', somatic: 'hypervigilance', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 1 },

    'نابض متزامن مع نبضات القلب': { functional: 'hormonal_cascade', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 2 },
    'ضاغط كالحزام': { functional: 'nervous_system_dysreg', somatic: 'hypervigilance', functionalWeight: 1, somaticWeight: 2, conventionalWeight: 1 },
    'طاعن حاد ومفاجئ': { functional: 'nervous_system_dysreg', somatic: 'none', functionalWeight: 1, somaticWeight: 0, conventionalWeight: 2 },
    'ثقيل مزمن يصعب تحديده': { functional: 'adrenal_exhaustion', somatic: 'chronic_self_override', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 1 },

    'يرتبط بتخطّي وجبة (سكر الدم)': { functional: 'blood_sugar_chaos', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 1 },
    'صباحي عند الاستيقاظ': { functional: 'nervous_system_dysreg', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 2 },
    'ينتهي بالكافيين (withdrawal)': { functional: 'adrenal_exhaustion', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 1 },
    'مرتبط بالدورة الشهرية': { functional: 'hormonal_cascade', somatic: 'worth_and_belonging', functionalWeight: 2, somaticWeight: 1, conventionalWeight: 1 },
    'يتحسن بالمغنيسيوم': { functional: 'nutrient_depletion', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 0 },

    'يظهر في أوقات الكبت والصمت': { functional: 'nervous_system_dysreg', somatic: 'suppressed_expression', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 1 },
    'يزداد حين لا أستطيع التعبير': { functional: 'nervous_system_dysreg', somatic: 'suppressed_expression', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 1 },
    'يخف حين أبكي أو أعبّر': { functional: 'nervous_system_dysreg', somatic: 'grief_unprocessed', functionalWeight: 0, somaticWeight: 3, conventionalWeight: 0 },
    'الكمالية والضغط الداخلي': { functional: 'adrenal_exhaustion', somatic: 'worth_and_belonging', functionalWeight: 2, somaticWeight: 3, conventionalWeight: 1 },

    // ── GUT options ──────────────────────────────────────
    'انتفاخ وغازات مؤلمة': { functional: 'gut_dysbiosis', somatic: 'control_and_release', functionalWeight: 2, somaticWeight: 1, conventionalWeight: 1 },
    'حرقة أو ارتداد حمض': { functional: 'gut_dysbiosis', somatic: 'suppressed_expression', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 1 },
    'إسهال متكرر': { functional: 'gut_dysbiosis', somatic: 'hypervigilance', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 1 },
    'إمساك مزمن': { functional: 'gut_dysbiosis', somatic: 'control_and_release', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 1 },
    'غثيان بعد الأكل': { functional: 'gut_dysbiosis', somatic: 'suppressed_expression', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 1 },
    'ألم تشنجي متقطع': { functional: 'gut_dysbiosis', somatic: 'hypervigilance', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 1 },
    'شعور بعدم اكتمال الإخراج': { functional: 'gut_dysbiosis', somatic: 'control_and_release', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 1 },

    'المواد الدهنية والمقلية': { functional: 'gut_dysbiosis', somatic: 'none', functionalWeight: 1, somaticWeight: 0, conventionalWeight: 1 },
    'الغلوتين والخبز والمعكرونة': { functional: 'inflammatory_load', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 1 },
    'منتجات الألبان': { functional: 'inflammatory_load', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 1 },
    'التوتر والقلق مباشرة': { functional: 'nervous_system_dysreg', somatic: 'hypervigilance', functionalWeight: 2, somaticWeight: 3, conventionalWeight: 1 },
    'وجبات كبيرة أو أكل سريع': { functional: 'gut_dysbiosis', somatic: 'chronic_self_override', functionalWeight: 1, somaticWeight: 1, conventionalWeight: 0 },

    'بياض اللسان ورائحة ونفّاخ (ميكروبيوم)': { functional: 'gut_dysbiosis', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 2 },
    'فطريات متكررة في الجلد (كانديدا)': { functional: 'gut_dysbiosis', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 2 },
    'حساسية طعامية مؤكدة': { functional: 'inflammatory_load', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 1 },
    'قولون عصبي — يشتد مع الضغوط': { functional: 'nervous_system_dysreg', somatic: 'hypervigilance', functionalWeight: 2, somaticWeight: 3, conventionalWeight: 1 },
    'تاريخ مضادات حيوية طويلة': { functional: 'gut_dysbiosis', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 2 },

    'الأمعاء تنفعل في مواقف الإجبار': { functional: 'nervous_system_dysreg', somatic: 'control_and_release', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 0 },
    'الغثيان عند التفكير بشيء مرفوض': { functional: 'nervous_system_dysreg', somatic: 'suppressed_expression', functionalWeight: 0, somaticWeight: 3, conventionalWeight: 0 },
    'الإمساك — صعوبة التخلي': { functional: 'nervous_system_dysreg', somatic: 'control_and_release', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 0 },
    'الإسهال في المواقف المخيفة': { functional: 'nervous_system_dysreg', somatic: 'hypervigilance', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 0 },
    'الهضم يتحسن في الأمان العاطفي': { functional: 'nervous_system_dysreg', somatic: 'hypervigilance', functionalWeight: 0, somaticWeight: 3, conventionalWeight: 0 },

    // ── SLEEP options ────────────────────────────────────
    'العقل يظل نشطاً عند النوم': { functional: 'adrenal_exhaustion', somatic: 'hypervigilance', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 1 },
    'أنام ثم أستيقظ مرات': { functional: 'blood_sugar_chaos', somatic: 'hypervigilance', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 1 },
    'أستيقظ مبكراً ولا أعود': { functional: 'adrenal_exhaustion', somatic: 'grief_unprocessed', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 1 },
    'نوم كثير دون راحة': { functional: 'mitochondrial_drain', somatic: 'grief_unprocessed', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 1 },
    'كوابيس وأحلام مزعجة': { functional: 'nervous_system_dysreg', somatic: 'hypervigilance', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 1 },

    'نقص المغنيسيوم (تشنج ليلي)': { functional: 'nutrient_depletion', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 1 },
    'الكافيين بعد الظهر': { functional: 'adrenal_exhaustion', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 0 },
    'شاشات حتى وقت النوم': { functional: 'nervous_system_dysreg', somatic: 'chronic_self_override', functionalWeight: 1, somaticWeight: 1, conventionalWeight: 0 },
    'خلل في الميلاتونين أو الكورتيزول': { functional: 'adrenal_exhaustion', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 1 },

    'أفكار آخر اليوم تُنهيني': { functional: 'adrenal_exhaustion', somatic: 'hypervigilance', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 1 },
    'كوابيس لتجارب لم أهضمها': { functional: 'nervous_system_dysreg', somatic: 'grief_unprocessed', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 1 },
    'المرض يعني التوقف — أرفض': { functional: 'adrenal_exhaustion', somatic: 'chronic_self_override', functionalWeight: 2, somaticWeight: 3, conventionalWeight: 1 },
    'النوم يتحسن في بيئات أكثر أماناً': { functional: 'nervous_system_dysreg', somatic: 'hypervigilance', functionalWeight: 0, somaticWeight: 3, conventionalWeight: 0 },

    // ── PAIN options ─────────────────────────────────────
    'أسفل الظهر': { functional: 'inflammatory_load', somatic: 'compassion_fatigue', functionalWeight: 1, somaticWeight: 2, conventionalWeight: 1 },
    'الرقبة والكتفان': { functional: 'nervous_system_dysreg', somatic: 'compassion_fatigue', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 1 },
    'أعلى الظهر بين الكتفين': { functional: 'inflammatory_load', somatic: 'grief_unprocessed', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 1 },
    'الركبتان': { functional: 'inflammatory_load', somatic: 'none', functionalWeight: 1, somaticWeight: 0, conventionalWeight: 1 },
    'المفاصل الصغيرة في اليدين': { functional: 'inflammatory_load', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 2 },
    'عضلي منتشر (فيبرومايالجيا)': { functional: 'mitochondrial_drain', somatic: 'hypervigilance', functionalWeight: 3, somaticWeight: 3, conventionalWeight: 2 },

    'مستمر لا يتوقف': { functional: 'inflammatory_load', somatic: 'chronic_self_override', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 2 },
    'صباحي يتحسن بالحركة (التهاب)': { functional: 'inflammatory_load', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 2 },
    'بعد المجهود والتعب': { functional: 'mitochondrial_drain', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 1 },
    'حارق أو وخز كهربائي (عصبي)': { functional: 'nervous_system_dysreg', somatic: 'hypervigilance', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 2 },

    'يتحسن بالمغنيسيوم أو الحرارة': { functional: 'nutrient_depletion', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 0 },
    'ألم يشتد بعد السكر والغلوتين': { functional: 'inflammatory_load', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 1 },
    'نقص فيتامين د مشخّص': { functional: 'nutrient_depletion', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 1 },
    'ألم منتشر مع ضبابية ذهنية': { functional: 'mitochondrial_drain', somatic: 'hypervigilance', functionalWeight: 3, somaticWeight: 2, conventionalWeight: 2 },

    'ثقل المسؤوليات فوق طاقتي': { functional: 'adrenal_exhaustion', somatic: 'compassion_fatigue', functionalWeight: 2, somaticWeight: 3, conventionalWeight: 1 },
    'أحمل هموم الآخرين (الكتفان)': { functional: 'adrenal_exhaustion', somatic: 'compassion_fatigue', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 0 },
    'عواطف محبوسة في الصدر': { functional: 'nervous_system_dysreg', somatic: 'grief_unprocessed', functionalWeight: 0, somaticWeight: 3, conventionalWeight: 0 },
    'كلام مكبوت في الفك': { functional: 'nervous_system_dysreg', somatic: 'suppressed_expression', functionalWeight: 0, somaticWeight: 3, conventionalWeight: 0 },
    'الألم يخف بالاعتراف والتقدير': { functional: 'nervous_system_dysreg', somatic: 'worth_and_belonging', functionalWeight: 0, somaticWeight: 3, conventionalWeight: 0 },

    // ── ANXIETY/MOOD options ─────────────────────────────
    'خفقان متكرر وضيق بلا سبب طبي': { functional: 'adrenal_exhaustion', somatic: 'hypervigilance', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 2 },
    'قلق مستمر والتفكير لا يتوقف': { functional: 'adrenal_exhaustion', somatic: 'hypervigilance', functionalWeight: 2, somaticWeight: 3, conventionalWeight: 1 },
    'نوبات مفاجئة من الخوف': { functional: 'adrenal_exhaustion', somatic: 'hypervigilance', functionalWeight: 2, somaticWeight: 3, conventionalWeight: 2 },
    'حزن عميق وفقدان متعة': { functional: 'adrenal_exhaustion', somatic: 'grief_unprocessed', functionalWeight: 2, somaticWeight: 3, conventionalWeight: 2 },
    'توتر عضلي مزمن وشد الفك': { functional: 'nervous_system_dysreg', somatic: 'suppressed_expression', functionalWeight: 2, somaticWeight: 3, conventionalWeight: 1 },

    'القلق يزداد بعد السكر (سكر الدم)': { functional: 'blood_sugar_chaos', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 1 },
    'ضبابية وبطء مع الانخفاض (الدرقية)': { functional: 'thyroid_underfunction', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 2 },
    'قلق PMS (هرموني)': { functional: 'hormonal_cascade', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 1 },
    'يتحسن بالتمرين والطبيعة': { functional: 'adrenal_exhaustion', somatic: 'hypervigilance', functionalWeight: 1, somaticWeight: 2, conventionalWeight: 0 },

    'تعلّمت القلق في بيئة غير آمنة': { functional: 'nervous_system_dysreg', somatic: 'childhood_imprint', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 0 },
    'الخوف من الرفض والفقدان': { functional: 'nervous_system_dysreg', somatic: 'worth_and_belonging', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 0 },
    'الكمالية تجعلني في توتر دائم': { functional: 'adrenal_exhaustion', somatic: 'worth_and_belonging', functionalWeight: 2, somaticWeight: 3, conventionalWeight: 1 },
    'أخفي مشاعري فتتحول لأعراض': { functional: 'nervous_system_dysreg', somatic: 'suppressed_expression', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 0 },

    // ── HORMONAL options ─────────────────────────────────
    'برودة دائمة في اليدين والقدمين': { functional: 'thyroid_underfunction', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 2 },
    'حرارة زائدة وتعرق ليلي': { functional: 'hormonal_cascade', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 2 },
    'تغير وزن بلا تغير في العادات': { functional: 'thyroid_underfunction', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 2 },
    'تساقط شعر أو ترقق': { functional: 'nutrient_depletion', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 1 },
    'اضطراب الدورة الشهرية': { functional: 'hormonal_cascade', somatic: 'worth_and_belonging', functionalWeight: 2, somaticWeight: 1, conventionalWeight: 2 },
    'انخفاض الرغبة الجنسية': { functional: 'hormonal_cascade', somatic: 'worth_and_belonging', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 1 },
    'تغيرات مزاجية حادة أو اكتئاب': { functional: 'hormonal_cascade', somatic: 'grief_unprocessed', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 2 },

    'TSH مرتفع أو منخفض': { functional: 'thyroid_underfunction', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 2 },
    'نقص الحديد أو الفيريتين': { functional: 'nutrient_depletion', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 2 },
    'خلل في DHEA أو الكورتيزول': { functional: 'adrenal_exhaustion', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 2 },
    'نسبة انسولين مرتفعة أو مقاومة': { functional: 'blood_sugar_chaos', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 2 },
    'اضطراب PCOS': { functional: 'hormonal_cascade', somatic: 'worth_and_belonging', functionalWeight: 3, somaticWeight: 1, conventionalWeight: 2 },

    'الاضطراب الهرموني بدأ بعد إجهاد': { functional: 'adrenal_exhaustion', somatic: 'hypervigilance', functionalWeight: 3, somaticWeight: 3, conventionalWeight: 1 },
    'صورة سلبية عن الجسم': { functional: 'none', somatic: 'worth_and_belonging', functionalWeight: 0, somaticWeight: 3, conventionalWeight: 0 },
    'علاقة غير محلولة مع الأنوثة/الذكورة': { functional: 'hormonal_cascade', somatic: 'worth_and_belonging', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 0 },

    // ── IMMUNE options ───────────────────────────────────
    'نزلات برد وعدوى متكررة': { functional: 'nutrient_depletion', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 2 },
    'التئام بطيء للجروح': { functional: 'nutrient_depletion', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 2 },
    'حساسيات متعددة تزداد': { functional: 'inflammatory_load', somatic: 'hypervigilance', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 1 },
    'عدوى فطرية متكررة (كانديدا)': { functional: 'gut_dysbiosis', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 2 },
    'تعب شديد مع أي مرض': { functional: 'mitochondrial_drain', somatic: 'none', functionalWeight: 2, somaticWeight: 0, conventionalWeight: 2 },
    'أمراض مناعية ذاتية': { functional: 'inflammatory_load', somatic: 'hypervigilance', functionalWeight: 3, somaticWeight: 2, conventionalWeight: 2 },

    'نقص فيتامين د بالتحليل': { functional: 'nutrient_depletion', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 1 },
    'نقص زنك (جروح بطيئة)': { functional: 'nutrient_depletion', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 1 },
    'استخدام مضادات حيوية طويلة سابقاً': { functional: 'gut_dysbiosis', somatic: 'none', functionalWeight: 3, somaticWeight: 0, conventionalWeight: 1 },
    'قلة نوم + ضغط + طعام مصنّع': { functional: 'mitochondrial_drain', somatic: 'chronic_self_override', functionalWeight: 2, somaticWeight: 2, conventionalWeight: 1 },

    'المرض يزداد في الحزن والانهيار': { functional: 'nervous_system_dysreg', somatic: 'grief_unprocessed', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 0 },
    'الجسم ينهار حين أتوقف عن العطاء': { functional: 'adrenal_exhaustion', somatic: 'compassion_fatigue', functionalWeight: 2, somaticWeight: 3, conventionalWeight: 1 },
    'المرض هو الطريقة الوحيدة للراحة': { functional: 'adrenal_exhaustion', somatic: 'chronic_self_override', functionalWeight: 2, somaticWeight: 3, conventionalWeight: 1 },
    'العدوى بعد أحداث مؤلمة': { functional: 'nervous_system_dysreg', somatic: 'grief_unprocessed', functionalWeight: 1, somaticWeight: 3, conventionalWeight: 1 },
};

/* ══════════════════════════════════════════════════════════
   FUNCTIONAL PATTERN NAMES (Doctor-facing)
   ══════════════════════════════════════════════════════════ */
export const FUNCTIONAL_PATTERN_INFO: Record<FunctionalPattern, { label: string; color: string; emoji: string; summary: string }> = {
    adrenal_exhaustion:    { label: 'إجهاد الكظرية (HPA)',     color: '#b45309', emoji: '⚡', summary: 'محور الكورتيزول والإجهاد المزمن' },
    thyroid_underfunction: { label: 'بطء الدرقية',             color: '#7c3aed', emoji: '🦋', summary: 'قصور درقي وظيفي أو مناعي ذاتي' },
    gut_dysbiosis:         { label: 'خلل ميكروبيوم الأمعاء',  color: '#059669', emoji: '🌿', summary: 'خلل التوازن البكتيري والشبكة الهضمية' },
    blood_sugar_chaos:     { label: 'اضطراب سكر الدم',         color: '#d97706', emoji: '📉', summary: 'تذبذب الغلوكوز ومقاومة الأنسولين' },
    nutrient_depletion:    { label: 'نقص المغذيات الجوهرية',  color: '#0d9488', emoji: '🔬', summary: 'فيتامين د، ب١٢، مغنيسيوم، حديد، زنك' },
    inflammatory_load:     { label: 'التهاب جهازي صامت',      color: '#dc2626', emoji: '🔥', summary: 'نظام مناعي نشط بشكل مزمن' },
    mitochondrial_drain:   { label: 'استنزاف الميتوكوندريا',  color: '#6366f1', emoji: '🔋', summary: 'خلل في إنتاج الطاقة الخلوية (ATP)' },
    hormonal_cascade:      { label: 'خلل الهرمونات الجنسية',  color: '#ec4899', emoji: '⚗️', summary: 'أستروجين، بروجستيرون، تستوستيرون' },
    nervous_system_dysreg: { label: 'خلل الجهاز العصبي اللاإرادي', color: '#0ea5e9', emoji: '🧠', summary: 'Vagal tone — التوازن السمبثاوي/باراسمبثاوي' },
    toxic_burden:          { label: 'حمل سُمّي تراكمي',       color: '#64748b', emoji: '☣️', summary: 'معادن ثقيلة وسموم بيئية' },
    none:                  { label: 'لا نمط وظيفي واضح',      color: '#94a3b8', emoji: '—',  summary: '' },
};

/* ══════════════════════════════════════════════════════════
   SOMATIC THEME NAMES (Doctor-facing)
   ══════════════════════════════════════════════════════════ */
export const SOMATIC_THEME_INFO: Record<SomaticTheme, { label: string; color: string; emoji: string; summary: string }> = {
    suppressed_expression: { label: 'كبت التعبير',         color: '#7c3aed', emoji: '🔇', summary: '"الجسم يقول ما لا أستطيع قوله"' },
    hypervigilance:        { label: 'فرط اليقظة (صدمة)',   color: '#dc2626', emoji: '⚠️', summary: 'الجهاز العصبي في وضع خطر دائم' },
    grief_unprocessed:     { label: 'حزن غير مُعالَج',    color: '#94a3b8', emoji: '🕊️', summary: 'خسارة لم تُهضم جسدياً وعاطفياً' },
    chronic_self_override: { label: 'تجاوز الذات المزمن', color: '#d97706', emoji: '🎭', summary: 'قطع الاتصال مع إشارات الجسم' },
    worth_and_belonging:   { label: 'الهوية والانتماء',    color: '#6366f1', emoji: '🫂', summary: '"لا أستحق — لا يهمني"' },
    control_and_release:   { label: 'السيطرة والإفراج',   color: '#059669', emoji: '🌊', summary: 'صراع اللاإرادة والتخلي' },
    compassion_fatigue:    { label: 'استنزاف المعطاء',    color: '#f97316', emoji: '🪫', summary: 'إنهاك من العطاء بلا تغذية راجعة' },
    childhood_imprint:     { label: 'البصمة الطفولية',    color: '#8b5cf6', emoji: '🌱', summary: 'استراتيجيات البقاء المبكرة تعمل الآن' },
    none:                  { label: 'لا نمط شعوري بارز',  color: '#94a3b8', emoji: '—',  summary: '' },
};

/* ══════════════════════════════════════════════════════════
   PATHWAYS — 8 Clinical Pathways
   Questions flow as one narrative — patient hears one voice.
   Engine reads all three layers silently.
   ══════════════════════════════════════════════════════════ */
export const PATHWAYS: Pathway[] = [
    {
        id: 'fatigue',
        label: 'طاقة وحيوية',
        emoji: '⚡',
        color: '#b45309',
        gradient: ['#78350f', '#f59e0b'],
        description: 'إرهاق لا يتحسن بالنوم',
        subtitle: 'التعب المزمن هو من أكثر الأعراض تعقيداً — ودائماً له معنى',
        redFlags: [
            { id: 'rf_fat_1', text: 'ضيق تنفس شديد أو ألم صدر مع الإرهاق في الراحة', level: 'emergency', actionMessage: 'قد يُشير لقصور قلبي أو انسداد رئوي — اتصل بالإسعاف فوراً' },
            { id: 'rf_fat_2', text: 'فقدان ٥ كغ أو أكثر في شهر واحد دون حمية', level: 'urgent', actionMessage: 'فقدان وزن سريع غير مبرر يستلزم فحصاً عاجلاً هذا الأسبوع' },
        ],
        clinicalQuestions: [
            {
                id: 'fat_story',
                text: 'كيف بدأت قصة الإرهاق معك؟',
                type: 'single',
                options: ['فجأة بعد مرض أو صدمة', 'تدريجياً على أشهر', 'موجود منذ سنوات', 'تحسّن وعاد للأسوأ'],
            },
            {
                id: 'fat_signature',
                text: 'أيّ هذه الصور تشبه إرهاقك الآن؟',
                type: 'multiple',
                options: ['أستيقظ منهكاً قبل أي مجهود', 'هبوط طاقة منتصف النهار', 'إرهاق بعد الأكل مباشرة', 'أي مجهود بسيط يُنهكني', 'إرهاق نفسي أكثر من جسدي'],
            },
            {
                id: 'fat_roots',
                text: 'جسمك يُلمّح — ما الذي يبدو مألوفاً لك؟',
                type: 'multiple',
                options: [
                    'أشتاق للسكر باستمرار (خلل سكر الدم)',
                    'برود وتساقط شعر وزيادة وزن (الدرقية)',
                    'مرتبط بالدورة الشهرية (هرموني)',
                    'ضعف مناعة ونزلات (فيتامين د/زنك)',
                    'لا أتحمل الكافيين والتوتر (كظرية)',
                    'ضبابية ذهنية مع الإرهاق',
                ],
            },
            {
                id: 'fat_inner',
                text: 'الإرهاق أحياناً يحمل رسالة — أيها يلامس ما تشعر به؟',
                type: 'multiple',
                options: [
                    'التعب يشتد عند التفكير بأشياء بعينها',
                    'أحمل ثقلاً عاطفياً يسبق التعب',
                    'الإرهاق مرتبط بمواقف الإجبار',
                    'فقدان الدافع يسبق الإرهاق الجسدي',
                ],
            },
        ],
    },
    {
        id: 'headache',
        label: 'صداع وشقيقة',
        emoji: '🧠',
        color: '#7c3aed',
        gradient: ['#4c1d95', '#8b5cf6'],
        description: 'صداع متكرر أو شقيقة مستمرة',
        subtitle: 'الصداع واحد من أكثر الأعراض التي تخبر عن توازن الجسم كله',
        redFlags: [
            { id: 'rf_head_1', text: 'أشد صداع في حياتي — بدأ فجأة كضربة رعد', level: 'emergency', actionMessage: 'نزيف تحت العنكبوتية محتمل — الطوارئ فوراً' },
            { id: 'rf_head_2', text: 'صداع مع حمى وتصلب رقبة ونفور من الضوء', level: 'emergency', actionMessage: 'أعراض التهاب السحايا — الإسعاف الآن' },
            { id: 'rf_head_3', text: 'ضعف في وجه أو طرف أو اضطراب كلام مع الصداع', level: 'emergency', actionMessage: 'أعراض جلطة دماغية — الطوارئ فوراً' },
        ],
        clinicalQuestions: [
            {
                id: 'head_map',
                text: 'الصداع عندك — أين يسكن وكيف يتحرك؟',
                type: 'multiple',
                options: ['نصف الرأس فقط (شقيقة)', 'جبهة وبين العينين', 'خلف إحدى العينين', 'مؤخرة الرأس والرقبة', 'ضغط يشمل كل الرأس'],
            },
            {
                id: 'head_voice',
                text: 'كيف "يتحدث" هذا الصداع؟',
                type: 'single',
                options: ['نابض متزامن مع نبضات القلب', 'ضاغط كالحزام', 'طاعن حاد ومفاجئ', 'ثقيل مزمن يصعب تحديده'],
            },
            {
                id: 'head_clues',
                text: 'جسمك يُعطيك أدلة — ما الذي تلاحظه؟',
                type: 'multiple',
                options: [
                    'يرتبط بتخطّي وجبة (سكر الدم)',
                    'صباحي عند الاستيقاظ',
                    'ينتهي بالكافيين (withdrawal)',
                    'مرتبط بالدورة الشهرية',
                    'يتحسن بالمغنيسيوم',
                ],
            },
            {
                id: 'head_voice2',
                text: 'الصداع في أحيان كثيرة يُترجم ما لا يُقال — أيها يلامسك؟',
                type: 'multiple',
                options: [
                    'يظهر في أوقات الكبت والصمت',
                    'يزداد حين لا أستطيع التعبير',
                    'يخف حين أبكي أو أعبّر',
                    'الكمالية والضغط الداخلي',
                ],
            },
        ],
    },
    {
        id: 'digestion',
        label: 'هضم وأمعاء',
        emoji: '🌿',
        color: '#059669',
        gradient: ['#064e3b', '#10b981'],
        description: 'انتفاخ، حرقة، إمساك، أو إسهال',
        subtitle: 'الأمعاء هي "الدماغ الثاني" — تحمل أكثر من مجرد ما أكلته',
        redFlags: [
            { id: 'rf_gi_1', text: 'دم أحمر في البراز أو قطران أسود', level: 'emergency', actionMessage: 'نزيف هضمي — الطوارئ فوراً' },
            { id: 'rf_gi_2', text: 'ألم بطن شديد ومستمر مفاجئ', level: 'emergency', actionMessage: 'قد يكون التهاباً حاداً — الطوارئ فوراً' },
            { id: 'rf_gi_3', text: 'فقدان وزن سريع مع تغير مستمر في الإخراج', level: 'urgent', actionMessage: 'تقييم عاجل ضروري هذا الأسبوع' },
        ],
        clinicalQuestions: [
            {
                id: 'gi_complaint',
                text: 'ما الذي يزعج جهازك الهضمي أكثر؟',
                type: 'multiple',
                options: ['انتفاخ وغازات مؤلمة', 'حرقة أو ارتداد حمض', 'إسهال متكرر', 'إمساك مزمن', 'غثيان بعد الأكل', 'ألم تشنجي متقطع', 'شعور بعدم اكتمال الإخراج'],
            },
            {
                id: 'gi_trigger',
                text: 'ما الذي يُشعل الأعراض؟',
                type: 'multiple',
                options: ['المواد الدهنية والمقلية', 'الغلوتين والخبز والمعكرونة', 'منتجات الألبان', 'التوتر والقلق مباشرة', 'وجبات كبيرة أو أكل سريع'],
            },
            {
                id: 'gi_pattern',
                text: 'ماذا تلاحظ في نمط المشكلة؟',
                type: 'multiple',
                options: [
                    'بياض اللسان ورائحة ونفّاخ (ميكروبيوم)',
                    'فطريات متكررة في الجلد (كانديدا)',
                    'حساسية طعامية مؤكدة',
                    'قولون عصبي — يشتد مع الضغوط',
                    'تاريخ مضادات حيوية طويلة',
                ],
            },
            {
                id: 'gi_emotion',
                text: 'الأمعاء تتكلم عاطفياً — أيها ينطبق؟',
                type: 'multiple',
                options: [
                    'الأمعاء تنفعل في مواقف الإجبار',
                    'الغثيان عند التفكير بشيء مرفوض',
                    'الإمساك — صعوبة التخلي',
                    'الإسهال في المواقف المخيفة',
                    'الهضم يتحسن في الأمان العاطفي',
                ],
            },
        ],
    },
    {
        id: 'sleep',
        label: 'نوم واسترخاء',
        emoji: '🌙',
        color: '#6366f1',
        gradient: ['#1e1b4b', '#6366f1'],
        description: 'صعوبة نوم أو نوم غير مريح',
        subtitle: 'النوم هو المرآة الأكثر صدقاً لحالة جهازك العصبي وعقلك الباطن',
        redFlags: [
            { id: 'rf_sleep_1', text: 'توقف التنفس الليلي أو شخير شديد يلاحظه الآخرون', level: 'urgent', actionMessage: 'انقطاع التنفس النومي — تقييم عاجل هذا الأسبوع' },
        ],
        clinicalQuestions: [
            {
                id: 'sleep_problem',
                text: 'ما مشكلة نومك تحديداً؟',
                type: 'multiple',
                options: ['العقل يظل نشطاً عند النوم', 'أنام ثم أستيقظ مرات', 'أستيقظ مبكراً ولا أعود', 'نوم كثير دون راحة', 'كوابيس وأحلام مزعجة'],
            },
            {
                id: 'sleep_body',
                text: 'ما الأدلة الجسدية والعادات التي تلاحظها؟',
                type: 'multiple',
                options: [
                    'نقص المغنيسيوم (تشنج ليلي)',
                    'الكافيين بعد الظهر',
                    'شاشات حتى وقت النوم',
                    'خلل في الميلاتونين أو الكورتيزول',
                ],
            },
            {
                id: 'sleep_mind',
                text: 'ما الذي يحدث داخلك قبل النوم؟',
                type: 'multiple',
                options: [
                    'أفكار آخر اليوم تُنهيني',
                    'كوابيس لتجارب لم أهضمها',
                    'المرض يعني التوقف — أرفض',
                    'النوم يتحسن في بيئات أكثر أماناً',
                ],
            },
        ],
    },
    {
        id: 'pain',
        label: 'آلام الجسد',
        emoji: '🦴',
        color: '#dc2626',
        gradient: ['#7f1d1d', '#ef4444'],
        description: 'آلام في العضلات أو المفاصل أو الظهر',
        subtitle: 'الألم المزمن لا يكذب — وله دائماً بُعدان: المادي والمعنوي',
        redFlags: [
            { id: 'rf_pain_1', text: 'ألم صدر ينتشر للذراع الأيسر أو الفك', level: 'emergency', actionMessage: 'احتشاء قلبي محتمل — الإسعاف الآن' },
            { id: 'rf_pain_2', text: 'ضعف مفاجئ في وجه أو طرف مع اضطراب كلام', level: 'emergency', actionMessage: 'أعراض جلطة دماغية — الطوارئ فوراً' },
            { id: 'rf_pain_3', text: 'ألم ظهر مع فقدان إحساس أو تحكم في المثانة', level: 'emergency', actionMessage: 'ضغط على النخاع الشوكي — طوارئ فوراً' },
        ],
        clinicalQuestions: [
            {
                id: 'pain_map',
                text: 'أين يسكن الألم في جسمك بشكل رئيسي؟',
                type: 'multiple',
                options: ['أسفل الظهر', 'الرقبة والكتفان', 'أعلى الظهر بين الكتفين', 'الركبتان', 'المفاصل الصغيرة في اليدين', 'عضلي منتشر (فيبرومايالجيا)'],
            },
            {
                id: 'pain_character',
                text: 'كيف يتحدث هذا الألم؟',
                type: 'single',
                options: ['مستمر لا يتوقف', 'صباحي يتحسن بالحركة (التهاب)', 'بعد المجهود والتعب', 'حارق أو وخز كهربائي (عصبي)'],
            },
            {
                id: 'pain_roots',
                text: 'الجذور الوظيفية — ما الذي يبدو مألوفاً؟',
                type: 'multiple',
                options: [
                    'يتحسن بالمغنيسيوم أو الحرارة',
                    'ألم يشتد بعد السكر والغلوتين',
                    'نقص فيتامين د مشخّص',
                    'ألم منتشر مع ضبابية ذهنية',
                ],
            },
            {
                id: 'pain_message',
                text: 'الألم أحياناً هو رسالة — أيها يلمس حالتك؟',
                type: 'multiple',
                options: [
                    'ثقل المسؤوليات فوق طاقتي',
                    'أحمل هموم الآخرين (الكتفان)',
                    'عواطف محبوسة في الصدر',
                    'كلام مكبوت في الفك',
                    'الألم يخف بالاعتراف والتقدير',
                ],
            },
        ],
    },
    {
        id: 'anxiety',
        label: 'قلق ومزاج',
        emoji: '💭',
        color: '#d97706',
        gradient: ['#7c2d12', '#f97316'],
        description: 'قلق مستمر أو مزاج منخفض',
        subtitle: 'القلق ليس عيباً — هو جهاز إنذار يستحق الفهم، لا الإسكات',
        redFlags: [
            { id: 'rf_anx_1', text: 'أفكار بإيذاء النفس أو الانتحار', level: 'emergency', actionMessage: 'تواصل مع شخص تثق به الآن — أنت لست وحدك' },
            { id: 'rf_anx_2', text: 'نوبة هلع مع ضيق تنفس شديد وشعور بالاحتضار', level: 'urgent', actionMessage: 'نوبة هلع حادة — تحتاج تقييماً اليوم' },
        ],
        clinicalQuestions: [
            {
                id: 'anx_appearance',
                text: 'كيف يظهر القلق أو تقلب المزاج في حياتك؟',
                type: 'multiple',
                options: ['خفقان متكرر وضيق بلا سبب طبي', 'قلق مستمر والتفكير لا يتوقف', 'نوبات مفاجئة من الخوف', 'حزن عميق وفقدان متعة', 'توتر عضلي مزمن وشد الفك'],
            },
            {
                id: 'anx_body',
                text: 'القلق والجسم — ما الروابط الوظيفية التي تلاحظها؟',
                type: 'multiple',
                options: [
                    'القلق يزداد بعد السكر (سكر الدم)',
                    'ضبابية وبطء مع الانخفاض (الدرقية)',
                    'قلق PMS (هرموني)',
                    'يتحسن بالتمرين والطبيعة',
                ],
            },
            {
                id: 'anx_root',
                text: 'جذر القلق — أيها يُشبه قصتك؟',
                type: 'multiple',
                options: [
                    'تعلّمت القلق في بيئة غير آمنة',
                    'الخوف من الرفض والفقدان',
                    'الكمالية تجعلني في توتر دائم',
                    'أخفي مشاعري فتتحول لأعراض',
                ],
            },
        ],
    },
    {
        id: 'hormonal',
        label: 'هرمونات وغدد',
        emoji: '⚗️',
        color: '#db2777',
        gradient: ['#831843', '#ec4899'],
        description: 'اضطرابات الدرقية أو الهرمونات',
        subtitle: 'الهرمونات هي "لغة الجسم السرية" — تعبّر عن كل ما تعيشه',
        redFlags: [
            { id: 'rf_horm_1', text: 'خفقان سريع جداً مع ارتعاش وتعرق وعدم احتمال الحر فجأة', level: 'urgent', actionMessage: 'قد يكون أزمة درقية — تقييم عاجل' },
        ],
        clinicalQuestions: [
            {
                id: 'horm_symptoms',
                text: 'ما الذي يُلمّح لخلل هرموني؟',
                type: 'multiple',
                options: ['برودة دائمة في اليدين والقدمين', 'حرارة زائدة وتعرق ليلي', 'تغير وزن بلا تغير في العادات', 'تساقط شعر أو ترقق', 'اضطراب الدورة الشهرية', 'انخفاض الرغبة الجنسية', 'تغيرات مزاجية حادة أو اكتئاب'],
            },
            {
                id: 'horm_labs',
                text: 'ما الذي تعرفه عن جسمك وظيفياً؟',
                type: 'multiple',
                options: [
                    'TSH مرتفع أو منخفض',
                    'نقص الحديد أو الفيريتين',
                    'خلل في DHEA أو الكورتيزول',
                    'نسبة انسولين مرتفعة أو مقاومة',
                    'اضطراب PCOS',
                ],
            },
            {
                id: 'horm_story',
                text: 'الهرمونات والأحداث الكبرى — ما القصة؟',
                type: 'multiple',
                options: [
                    'الاضطراب الهرموني بدأ بعد إجهاد',
                    'صورة سلبية عن الجسم',
                    'علاقة غير محلولة مع الأنوثة/الذكورة',
                ],
            },
        ],
    },
    {
        id: 'immune',
        label: 'مناعة ومزمنات',
        emoji: '🛡️',
        color: '#0d9488',
        gradient: ['#134e4a', '#0d9488'],
        description: 'ضعف مناعة أو أمراض متكررة',
        subtitle: 'المناعة تتعلم من تجاربك — الجسدية والعاطفية على حد سواء',
        redFlags: [
            { id: 'rf_imm_1', text: 'حمى فوق 39 مع التهاب شديد أو صعوبة بلع', level: 'emergency', actionMessage: 'التهاب حاد — الطوارئ فوراً' },
            { id: 'rf_imm_2', text: 'كتلة أو تضخم غدة لمفاوية جديد بلا سبب', level: 'urgent', actionMessage: 'تحليل دم وتصوير عاجل هذا الأسبوع' },
        ],
        clinicalQuestions: [
            {
                id: 'imm_pattern',
                text: 'ما الأنماط المتكررة في مناعتك؟',
                type: 'multiple',
                options: ['نزلات برد وعدوى متكررة', 'التئام بطيء للجروح', 'حساسيات متعددة تزداد', 'عدوى فطرية متكررة (كانديدا)', 'تعب شديد مع أي مرض', 'أمراض مناعية ذاتية'],
            },
            {
                id: 'imm_nutrients',
                text: 'ما العوامل الوظيفية الموجودة في حياتك؟',
                type: 'multiple',
                options: [
                    'نقص فيتامين د بالتحليل',
                    'نقص زنك (جروح بطيئة)',
                    'استخدام مضادات حيوية طويلة سابقاً',
                    'قلة نوم + ضغط + طعام مصنّع',
                ],
            },
            {
                id: 'imm_emotional',
                text: 'المناعة والمشاعر — ما قصتك؟',
                type: 'multiple',
                options: [
                    'المرض يزداد في الحزن والانهيار',
                    'الجسم ينهار حين أتوقف عن العطاء',
                    'المرض هو الطريقة الوحيدة للراحة',
                    'العدوى بعد أحداث مؤلمة',
                ],
            },
        ],
    },
];

/* ══════════════════════════════════════════════════════════
   EMOTIONAL CONTEXTS — Tibrah Somatic-Emotional Layer
   ══════════════════════════════════════════════════════════ */
export const EMOTIONAL_CONTEXTS = [
    { id: 'work_stress',  label: 'ضغط العمل',           emoji: '💼' },
    { id: 'family',       label: 'توترات عائلية',        emoji: '👨‍👩‍👧' },
    { id: 'loneliness',   label: 'وحدة وعزلة',           emoji: '🌑' },
    { id: 'grief',        label: 'حزن أو خسارة',         emoji: '🕊️' },
    { id: 'financial',    label: 'ضغوط مالية',           emoji: '📉' },
    { id: 'identity',     label: 'شعور بفقدان الهدف',    emoji: '🔒' },
    { id: 'anger',        label: 'غضب مكبوت',            emoji: '🔥' },
    { id: 'fear',         label: 'خوف أو قلق مزمن',     emoji: '🌀' },
    { id: 'burnout',      label: 'إرهاق عاطفي',          emoji: '🪫' },
    { id: 'trauma',       label: 'تجربة مؤلمة قديمة',    emoji: '🌊' },
    { id: 'shame',        label: 'خجل أو نقد ذاتي',      emoji: '🫣' },
    { id: 'disconnected', label: 'شعور بالانفصال',       emoji: '🌫️' },
    { id: 'none',         label: 'لا شيء مما سبق',       emoji: '✨' },
];

/* ══════════════════════════════════════════════════════════
   DURATION OPTIONS
   ══════════════════════════════════════════════════════════ */
export const DURATION_OPTIONS = [
    { id: 'hours',  label: 'ساعات',         sub: 'أقل من ٢٤ ساعة',  urgencyBonus: 0 },
    { id: 'days',   label: '٢–١٤ يوماً',    sub: 'أسبوعان فأقل',    urgencyBonus: 1 },
    { id: 'weeks',  label: 'أسابيع',        sub: 'أسبوعان – شهران', urgencyBonus: 2 },
    { id: 'months', label: 'أشهر أو سنوات', sub: 'مزمن – متجذر',    urgencyBonus: 3 },
];

/* ══════════════════════════════════════════════════════════
   INTEGRATIVE TRIAGE ENGINE
   Three-dimensional output:
   1. Urgency level (conventional)
   2. Top functional pattern (root cause)
   3. Top somatic theme (emotional body language)
   + Integrative narrative insight
   ══════════════════════════════════════════════════════════ */
export function computeTriage(answers: EngineAnswers): TriageResult {
    if (answers.hasEmergencyFlag) {
        return {
            level: 'emergency',
            score: 10,
            topFunctionalPattern: 'none',
            topSomaticTheme: 'none',
            functionalScore: 0,
            somaticScore: 0,
            integrativeInsight: 'حالة طارئة تستدعي تدخلاً فورياً.',
        };
    }

    // ── Layer 1: Conventional urgency score ──
    let score = answers.severity;
    const dur = DURATION_OPTIONS.find(d => d.id === answers.duration);
    if (dur) score += dur.urgencyBonus;
    if (answers.redFlags.length > 0) score += Math.min(3, answers.redFlags.length);

    // ── Layer 2: Functional pattern scoring ──
    const functionalTally: Record<string, number> = {};
    // ── Layer 3: Somatic theme scoring ──
    const somaticTally: Record<string, number> = {};

    // Score all selected clinical answers across dimensions
    for (const [, value] of Object.entries(answers.clinicalAnswers)) {
        const values = Array.isArray(value) ? value : value ? [String(value)] : [];
        for (const v of values) {
            const meta = OPTION_META[v];
            if (!meta) continue;
            // Functional
            if (meta.functional !== 'none') {
                functionalTally[meta.functional] = (functionalTally[meta.functional] ?? 0) + meta.functionalWeight;
            }
            // Somatic
            if (meta.somatic !== 'none') {
                somaticTally[meta.somatic] = (somaticTally[meta.somatic] ?? 0) + meta.somaticWeight;
            }
            // Conventional weight adds to urgency score
            score += meta.conventionalWeight * 0.15;
        }
    }

    // Emotional context adds to somatic score and urgency
    const emotionalLoad = answers.emotionalContext.filter(e => e !== 'none').length;
    if (emotionalLoad >= 2) { score += 1; somaticTally['hypervigilance'] = (somaticTally['hypervigilance'] ?? 0) + 1; }
    if (emotionalLoad >= 4) { score += 1; }
    if (answers.emotionalContext.includes('trauma')) {
        somaticTally['childhood_imprint'] = (somaticTally['childhood_imprint'] ?? 0) + 3;
    }
    if (answers.emotionalContext.includes('grief')) {
        somaticTally['grief_unprocessed'] = (somaticTally['grief_unprocessed'] ?? 0) + 2;
    }
    if (answers.emotionalContext.includes('burnout') || answers.emotionalContext.includes('shame')) {
        functionalTally['adrenal_exhaustion'] = (functionalTally['adrenal_exhaustion'] ?? 0) + 2;
    }

    // Chronic + functional = compound score
    if (answers.duration === 'months') {
        const topFuncScore = Math.max(0, ...Object.values(functionalTally));
        if (topFuncScore >= 4) score += 1;
    }

    // Compute top functional pattern
    const topFunctionalPattern = (
        Object.entries(functionalTally).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'none'
    ) as FunctionalPattern;

    // Compute top somatic theme
    const topSomaticTheme = (
        Object.entries(somaticTally).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'none'
    ) as SomaticTheme;

    // Compute dimensional scores (0-10)
    const maxFunctionalScore = Math.max(0, ...Object.values(functionalTally));
    const functionalScore = Math.min(10, Math.round(maxFunctionalScore * 1.5));
    const maxSomaticScore = Math.max(0, ...Object.values(somaticTally));
    const somaticScore = Math.min(10, Math.round(maxSomaticScore * 1.4));

    score = Math.min(10, Math.max(1, Math.round(score)));

    let level: TriageResult['level'];
    if (score >= 9) level = 'urgent';
    else if (score >= 7) level = 'needs_doctor';
    else if (score >= 4) level = 'review';
    else level = 'manageable';

    // Generate integrative insight
    const funcInfo = FUNCTIONAL_PATTERN_INFO[topFunctionalPattern];
    const somInfo  = SOMATIC_THEME_INFO[topSomaticTheme];

    let integrativeInsight = '';
    if (topFunctionalPattern !== 'none' && topSomaticTheme !== 'none') {
        integrativeInsight = `النمط الوظيفي الأبرز: ${funcInfo.label}. البُعد الشعوري: ${somInfo.label}. هذا التقاطع يستحق اهتماماً تكاملياً يجمع الطب الاعتيادي مع الجذر الوظيفي والبُعد النفسي.`;
    } else if (topFunctionalPattern !== 'none') {
        integrativeInsight = `النمط الوظيفي الأبرز: ${funcInfo.label}. يُنصح بالفحص الوظيفي الموجّه: ${funcInfo.summary}.`;
    } else if (topSomaticTheme !== 'none') {
        integrativeInsight = `البُعد الشعوري الأبرز: ${somInfo.label} — ${somInfo.summary}.`;
    } else {
        integrativeInsight = 'الصورة السريرية مستقرة نسبياً مع أهمية المتابعة الدورية.';
    }

    return { level, score, topFunctionalPattern, topSomaticTheme, functionalScore, somaticScore, integrativeInsight };
}

export type { TriageResult } from './types';

/* ══════════════════════════════════════════════════════════
   DEFAULT ANSWERS
   ══════════════════════════════════════════════════════════ */
export const DEFAULT_ANSWERS: EngineAnswers = {
    pathwayId: '', severity: 5, duration: 'days',
    redFlags: [], hasEmergencyFlag: false, emergencyMessage: '',
    clinicalAnswers: {}, emotionalContext: [],
    emotionalNote: '', freeText: '',
};

/* ══════════════════════════════════════════════════════════
   4-DOMAIN ROUTING ENGINE
   Re-export so consumers can import from one place.
   ══════════════════════════════════════════════════════════ */
export { computeRouting } from '@/lib/domain-scoring-engine';
export type { RoutingResult } from './types';

