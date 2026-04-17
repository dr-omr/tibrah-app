// lib/domain-routing-map.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Domain Routing Map (خريطة التوجيه الرباعية)
// ════════════════════════════════════════════════════════════════════════
//
// ٢٦ فرع فرعي × ٥ أدوات = ١٣٠ عنصر
//
// كل فرع يحتوي على:
//   1. اختبار (test)       — لتضييق الفهم
//   2. تطبيق (practice)    — شيء عملي اليوم
//   3. ورشة (workshop)     — micro-course / فيديو قصير
//   4. بروتوكول (protocol)  — خطة ٣-١٤ يوم
//   5. متابعة (tracker)     — أداة رصد يومية
// ════════════════════════════════════════════════════════════════════════

import type { DomainId, SubdomainId, ToolType, ToolRecommendation } from '@/components/health-engine/types';

/* ══════════════════════════════════════════════════════════
   TOOL RECOMMENDATION STRUCTURE
   ══════════════════════════════════════════════════════════ */

export interface SubdomainDefinition {
    id: SubdomainId;
    domainId: DomainId;
    arabicName: string;
    englishName: string;
    emoji: string;
    description: string;
    tools: ToolRecommendation[];
}

export interface DomainRoutingDefinition {
    id: DomainId;
    arabicName: string;
    englishName: string;
    emoji: string;
    color: string;
    colorAlt: string;
    subdomains: SubdomainDefinition[];
}

/* ══════════════════════════════════════════════════════════
   1. جسدي — JASADI (Physical) — ٨ فروع
   ══════════════════════════════════════════════════════════ */

const JASADI_SUBDOMAINS: SubdomainDefinition[] = [
    {
        id: 'digestive',
        domainId: 'jasadi',
        arabicName: 'هضمي',
        englishName: 'Digestive',
        emoji: '🫁',
        description: 'ارتجاع، انتفاخ، قولون عصبي، حرقة',
        tools: [
            {
                id: 'jasadi_digestive_test',
                type: 'test',
                arabicName: 'اختبار محفزات الهضم',
                englishName: 'GERD/IBS Trigger Screener',
                emoji: '🧪',
                description: 'حدد المحفزات الغذائية والسلوكية لمشكلتك الهضمية',
                href: '/intake',
                durationMinutes: 5,
                isFree: true,
            },
            {
                id: 'jasadi_digestive_practice',
                type: 'practice',
                arabicName: 'تنفس بعد الأكل',
                englishName: 'Post-Meal Breathing',
                emoji: '🫁',
                description: 'تمرين تنفس لتهدئة الجهاز العصبي بعد الوجبات',
                href: '/breathe',
                durationMinutes: 5,
                isFree: true,
            },
            {
                id: 'jasadi_digestive_workshop',
                type: 'workshop',
                arabicName: 'كيف يضخم التوتر أعراض المعدة',
                englishName: 'Stress-Gut Connection',
                emoji: '📹',
                description: 'ورشة ٦ دقائق: العلاقة بين التوتر والجهاز الهضمي',
                href: '/library?domain=jasadi&topic=gut-stress',
                durationMinutes: 6,
                isFree: true,
            },
            {
                id: 'jasadi_digestive_protocol',
                type: 'protocol',
                arabicName: 'بروتوكول المعدة ٧٢ ساعة',
                englishName: '72-Hour Reflux Calming Plan',
                emoji: '📋',
                description: 'خطة ٣ أيام لتهدئة التهيج الهضمي وتقليل المحفزات',
                href: '/programs/nutrition',
                durationMinutes: 0,
                isFree: false,
            },
            {
                id: 'jasadi_digestive_tracker',
                type: 'tracker',
                arabicName: 'سجل الأعراض الهضمية',
                englishName: 'Digestive Symptom Tracker',
                emoji: '📊',
                description: 'سجّل أعراضك اليومية وربطها بالطعام والتوتر',
                href: '/daily-log',
                durationMinutes: 2,
                isFree: true,
            },
        ],
    },
    {
        id: 'hormonal',
        domainId: 'jasadi',
        arabicName: 'هرموني',
        englishName: 'Hormonal',
        emoji: '⚗️',
        description: 'غدة درقية، هرمونات جنسية، كظرية',
        tools: [
            {
                id: 'jasadi_hormonal_test',
                type: 'test',
                arabicName: 'اختبار الخلل الهرموني',
                englishName: 'Hormone Imbalance Screener',
                emoji: '🧪',
                description: 'تقييم أعراض الخلل الهرموني: درقية، كظرية، جنسية',
                href: '/intake',
                durationMinutes: 7,
                isFree: true,
            },
            {
                id: 'jasadi_hormonal_practice',
                type: 'practice',
                arabicName: 'متابعة الطاقة اليومية',
                englishName: 'Daily Energy Tracking',
                emoji: '⚡',
                description: 'سجّل مستوى طاقتك ٣ مرات يومياً لاكتشاف النمط',
                href: '/quick-check-in',
                durationMinutes: 2,
                isFree: true,
            },
            {
                id: 'jasadi_hormonal_workshop',
                type: 'workshop',
                arabicName: 'فهم هرموناتك',
                englishName: 'Understanding Your Hormones',
                emoji: '📹',
                description: 'ورشة ١٢ دقيقة: كيف تعمل هرموناتك وما يخلّها',
                href: '/library?domain=jasadi&topic=hormones',
                durationMinutes: 12,
                isFree: true,
            },
            {
                id: 'jasadi_hormonal_protocol',
                type: 'protocol',
                arabicName: 'بروتوكول إعادة التوازن الهرموني',
                englishName: 'Hormonal Rebalancing Protocol',
                emoji: '📋',
                description: 'خطة ١٤ يوماً: نوم + تغذية + حركة لإعادة التوازن',
                href: '/programs/sleep',
                durationMinutes: 0,
                isFree: false,
            },
            {
                id: 'jasadi_hormonal_tracker',
                type: 'tracker',
                arabicName: 'مراقبة الأعراض الهرمونية',
                englishName: 'Hormonal Symptom Tracker',
                emoji: '📊',
                description: 'تتبعي أعراضك: دورة شهرية، طاقة، مزاج، شعر',
                href: '/health-tracker',
                durationMinutes: 2,
                isFree: true,
            },
        ],
    },
    {
        id: 'inflammatory',
        domainId: 'jasadi',
        arabicName: 'التهابي / مناعي',
        englishName: 'Inflammatory / Immune',
        emoji: '🔥',
        description: 'التهاب مزمن، ضعف مناعة، حساسيات',
        tools: [
            {
                id: 'jasadi_inflammatory_test',
                type: 'test',
                arabicName: 'اختبار الالتهاب الصامت',
                englishName: 'Silent Inflammation Screener',
                emoji: '🧪',
                description: 'هل جسمك في حالة التهاب مزمن دون أن تعرف؟',
                href: '/intake',
                durationMinutes: 5,
                isFree: true,
            },
            {
                id: 'jasadi_inflammatory_practice',
                type: 'practice',
                arabicName: 'سجل الطعام المضاد للالتهاب',
                englishName: 'Anti-Inflammatory Food Log',
                emoji: '🥗',
                description: 'سجّل وجباتك وحدد الأطعمة المحفزة للالتهاب',
                href: '/meal-planner',
                durationMinutes: 3,
                isFree: true,
            },
            {
                id: 'jasadi_inflammatory_workshop',
                type: 'workshop',
                arabicName: 'فهم الالتهاب الصامت',
                englishName: 'Understanding Silent Inflammation',
                emoji: '📹',
                description: 'ورشة ٨ دقائق: الالتهاب الخفي وراء أمراضك',
                href: '/library?domain=jasadi&topic=inflammation',
                durationMinutes: 8,
                isFree: true,
            },
            {
                id: 'jasadi_inflammatory_protocol',
                type: 'protocol',
                arabicName: 'بروتوكول مضاد الالتهاب ٧ أيام',
                englishName: '7-Day Anti-Inflammatory Protocol',
                emoji: '📋',
                description: 'خطة غذائية + حركية لخفض مؤشرات الالتهاب',
                href: '/programs/nutrition',
                durationMinutes: 0,
                isFree: false,
            },
            {
                id: 'jasadi_inflammatory_tracker',
                type: 'tracker',
                arabicName: 'مؤشرات المناعة',
                englishName: 'Immune Markers Tracker',
                emoji: '📊',
                description: 'تتبع أعراض المناعة: عدوى، حساسية، طاقة',
                href: '/health-tracker',
                durationMinutes: 2,
                isFree: true,
            },
        ],
    },
    {
        id: 'energy_fatigue',
        domainId: 'jasadi',
        arabicName: 'طاقة / إرهاق',
        englishName: 'Energy / Fatigue',
        emoji: '🔋',
        description: 'تعب مزمن، إرهاق لا يتحسن بالنوم',
        tools: [
            {
                id: 'jasadi_energy_test',
                type: 'test',
                arabicName: 'اختبار جذر الإرهاق',
                englishName: 'Fatigue Root Screener',
                emoji: '🧪',
                description: 'اكتشف السبب الجذري لإرهاقك: كظرية؟ ميتوكوندريا؟ نقص؟',
                href: '/symptom-checker',
                durationMinutes: 8,
                isFree: true,
            },
            {
                id: 'jasadi_energy_practice',
                type: 'practice',
                arabicName: 'ممارسات الطاقة الصغيرة',
                englishName: 'Energy Micro-Practices',
                emoji: '⚡',
                description: 'تمارين ٣ دقائق لرفع الطاقة خلال اليوم',
                href: '/breathe',
                durationMinutes: 3,
                isFree: true,
            },
            {
                id: 'jasadi_energy_workshop',
                type: 'workshop',
                arabicName: 'فهم الطاقة من الجذر',
                englishName: 'Understanding Energy at the Root',
                emoji: '📹',
                description: 'ورشة ١٠ دقائق: لماذا أنت متعب حقاً؟',
                href: '/library?domain=jasadi&topic=energy',
                durationMinutes: 10,
                isFree: true,
            },
            {
                id: 'jasadi_energy_protocol',
                type: 'protocol',
                arabicName: 'مسار الإرهاق الوظيفي',
                englishName: 'Functional Fatigue Pathway',
                emoji: '📋',
                description: 'بروتوكول ١٤ يوماً لاستعادة الطاقة من الجذر',
                href: '/programs/movement',
                durationMinutes: 0,
                isFree: false,
            },
            {
                id: 'jasadi_energy_tracker',
                type: 'tracker',
                arabicName: 'متابعة الطاقة',
                englishName: 'Energy Tracker',
                emoji: '📊',
                description: 'سجّل طاقتك ٣ مرات يومياً: صباح، ظهر، مساء',
                href: '/quick-check-in',
                durationMinutes: 1,
                isFree: true,
            },
        ],
    },
    {
        id: 'sleep',
        domainId: 'jasadi',
        arabicName: 'نوم',
        englishName: 'Sleep',
        emoji: '🌙',
        description: 'أرق، نوم متقطع، استيقاظ دون راحة',
        tools: [
            {
                id: 'jasadi_sleep_test',
                type: 'test',
                arabicName: 'تقييم إيقاع النوم',
                englishName: 'Sleep Rhythm Assessment',
                emoji: '🧪',
                description: 'حلل نمط نومك واكتشف الخلل',
                href: '/intake',
                durationMinutes: 5,
                isFree: true,
            },
            {
                id: 'jasadi_sleep_practice',
                type: 'practice',
                arabicName: 'روتين المساء',
                englishName: 'Evening Reset Routine',
                emoji: '🌅',
                description: 'بروتوكول ١٠ دقائق قبل النوم لتهدئة الجهاز العصبي',
                href: '/breathe',
                durationMinutes: 10,
                isFree: true,
            },
            {
                id: 'jasadi_sleep_workshop',
                type: 'workshop',
                arabicName: 'استعادة النوم',
                englishName: 'Reclaiming Sleep',
                emoji: '📹',
                description: 'ورشة ٨ دقائق: علم النوم وكيف تستعيده',
                href: '/library?domain=jasadi&topic=sleep',
                durationMinutes: 8,
                isFree: true,
            },
            {
                id: 'jasadi_sleep_protocol',
                type: 'protocol',
                arabicName: 'بروتوكول النوم ٧ أيام',
                englishName: '7-Day Sleep Reset Protocol',
                emoji: '📋',
                description: 'خطة ٧ أيام لإعادة ضبط ساعتك البيولوجية',
                href: '/programs/sleep',
                durationMinutes: 0,
                isFree: false,
            },
            {
                id: 'jasadi_sleep_tracker',
                type: 'tracker',
                arabicName: 'سجل النوم',
                englishName: 'Sleep Log',
                emoji: '📊',
                description: 'سجّل ساعات نومك وجودته يومياً',
                href: '/daily-log',
                durationMinutes: 1,
                isFree: true,
            },
        ],
    },
    {
        id: 'nutrition_deficiency',
        domainId: 'jasadi',
        arabicName: 'تغذية ونواقص',
        englishName: 'Nutrition & Deficiencies',
        emoji: '🧬',
        description: 'نقص فيتامينات، معادن، سوء تغذية',
        tools: [
            {
                id: 'jasadi_nutrition_test',
                type: 'test',
                arabicName: 'اختبار مخاطر النقص',
                englishName: 'Deficiency Risk Screener',
                emoji: '🧪',
                description: 'هل تعاني من نقص فيتامين د؟ ب١٢؟ حديد؟ مغنيسيوم؟',
                href: '/intake',
                durationMinutes: 5,
                isFree: true,
            },
            {
                id: 'jasadi_nutrition_practice',
                type: 'practice',
                arabicName: 'سجل الوجبات',
                englishName: 'Food Diary',
                emoji: '🍽️',
                description: 'دوّن وجباتك اليومية لتحليل التغذية',
                href: '/meal-planner',
                durationMinutes: 3,
                isFree: true,
            },
            {
                id: 'jasadi_nutrition_workshop',
                type: 'workshop',
                arabicName: 'نواقصك الخفية',
                englishName: 'Your Hidden Deficiencies',
                emoji: '📹',
                description: 'ورشة ١٠ دقائق: النواقص التي لا تظهر في التحاليل العادية',
                href: '/library?domain=jasadi&topic=nutrition',
                durationMinutes: 10,
                isFree: true,
            },
            {
                id: 'jasadi_nutrition_protocol',
                type: 'protocol',
                arabicName: 'بروتوكول المكملات الذكي',
                englishName: 'Smart Supplement Protocol',
                emoji: '📋',
                description: 'خطة مكملات مخصصة بناءً على أعراضك',
                href: '/smart-pharmacy',
                durationMinutes: 0,
                isFree: false,
            },
            {
                id: 'jasadi_nutrition_tracker',
                type: 'tracker',
                arabicName: 'متابعة التغذية',
                englishName: 'Nutrition Tracker',
                emoji: '📊',
                description: 'تتبع شرب الماء والوجبات والمكملات',
                href: '/health-tracker',
                durationMinutes: 2,
                isFree: true,
            },
        ],
    },
    {
        id: 'musculoskeletal',
        domainId: 'jasadi',
        arabicName: 'ألم عضلي / هيكلي',
        englishName: 'Musculoskeletal Pain',
        emoji: '🦴',
        description: 'آلام الظهر، الرقبة، المفاصل، العضلات',
        tools: [
            {
                id: 'jasadi_pain_test',
                type: 'test',
                arabicName: 'اختبار نمط الألم',
                englishName: 'Pain Pattern Screener',
                emoji: '🧪',
                description: 'التهابي؟ عصبي؟ عضلي؟ حدد نمط ألمك',
                href: '/body-map',
                durationMinutes: 5,
                isFree: true,
            },
            {
                id: 'jasadi_pain_practice',
                type: 'practice',
                arabicName: 'تمارين حسب موقع الألم',
                englishName: 'Location-Based Exercises',
                emoji: '🤸',
                description: 'تمارين علاجية مخصصة لمنطقة ألمك',
                href: '/programs/movement',
                durationMinutes: 10,
                isFree: true,
            },
            {
                id: 'jasadi_pain_workshop',
                type: 'workshop',
                arabicName: 'فهم ألمك',
                englishName: 'Understanding Your Pain',
                emoji: '📹',
                description: 'ورشة ٨ دقائق: الألم المزمن — جسد أم عقل؟',
                href: '/library?domain=jasadi&topic=pain',
                durationMinutes: 8,
                isFree: true,
            },
            {
                id: 'jasadi_pain_protocol',
                type: 'protocol',
                arabicName: 'بروتوكول تخفيف الألم ٧ أيام',
                englishName: '7-Day Pain Relief Protocol',
                emoji: '📋',
                description: 'حركة + تغذية مضادة للالتهاب + تنفس',
                href: '/programs/movement',
                durationMinutes: 0,
                isFree: false,
            },
            {
                id: 'jasadi_pain_tracker',
                type: 'tracker',
                arabicName: 'يوميات الألم',
                englishName: 'Pain Diary',
                emoji: '📊',
                description: 'سجّل شدة ألمك وموقعه ومحفزاته يومياً',
                href: '/daily-log',
                durationMinutes: 2,
                isFree: true,
            },
        ],
    },
    {
        id: 'skin_hair',
        domainId: 'jasadi',
        arabicName: 'جلد / شعر',
        englishName: 'Skin & Hair',
        emoji: '✨',
        description: 'تساقط شعر، حب شباب، أكزيما، جفاف',
        tools: [
            {
                id: 'jasadi_skin_test',
                type: 'test',
                arabicName: 'تقييم الجلد والشعر',
                englishName: 'Skin & Hair Screener',
                emoji: '🧪',
                description: 'هل مشكلتك هرمونية؟ التهابية؟ نقص غذائي؟',
                href: '/diagnosis/face-scan',
                durationMinutes: 5,
                isFree: true,
            },
            {
                id: 'jasadi_skin_practice',
                type: 'practice',
                arabicName: 'سجل العناية بالبشرة',
                englishName: 'Skincare Log',
                emoji: '🧴',
                description: 'دوّن روتينك وتفاعل بشرتك يومياً',
                href: '/daily-log',
                durationMinutes: 2,
                isFree: true,
            },
            {
                id: 'jasadi_skin_workshop',
                type: 'workshop',
                arabicName: 'الجلد مرآة الداخل',
                englishName: 'Skin as Inner Mirror',
                emoji: '📹',
                description: 'ورشة ٦ دقائق: ماذا يقول جلدك عن صحتك الداخلية',
                href: '/library?domain=jasadi&topic=skin',
                durationMinutes: 6,
                isFree: true,
            },
            {
                id: 'jasadi_skin_protocol',
                type: 'protocol',
                arabicName: 'بروتوكول الجلد والشعر ١٤ يوماً',
                englishName: '14-Day Skin & Hair Protocol',
                emoji: '📋',
                description: 'تغذية + مكملات + عناية خارجية',
                href: '/smart-pharmacy',
                durationMinutes: 0,
                isFree: false,
            },
            {
                id: 'jasadi_skin_tracker',
                type: 'tracker',
                arabicName: 'متابعة البشرة',
                englishName: 'Skin Tracker',
                emoji: '📊',
                description: 'رصد تحسن أو تراجع حالة بشرتك وشعرك',
                href: '/health-tracker',
                durationMinutes: 2,
                isFree: true,
            },
        ],
    },
];

/* ══════════════════════════════════════════════════════════
   2. نفسي — NAFSI (Psychological) — ٦ فروع
   ══════════════════════════════════════════════════════════ */

const NAFSI_SUBDOMAINS: SubdomainDefinition[] = [
    {
        id: 'anxiety_arousal',
        domainId: 'nafsi',
        arabicName: 'قلق / استثارة',
        englishName: 'Anxiety / Arousal',
        emoji: '⚠️',
        description: 'قلق مستمر، خفقان، فرط يقظة',
        tools: [
            { id: 'nafsi_anxiety_test', type: 'test', arabicName: 'اختبار فرط الاستثارة', englishName: 'Sympathetic Overload Screener', emoji: '🧪', description: 'هل جهازك العصبي في وضع خطر دائم؟', href: '/assess/anxiety', durationMinutes: 5, isFree: true },
            { id: 'nafsi_anxiety_practice', type: 'practice', arabicName: 'تمرين تنفس + مسح جسدي', englishName: 'Breathing + Body Scan', emoji: '🫁', description: 'تمرين تنفس عميق مع مسح جسدي لتهدئة الجهاز العصبي', href: '/breathe', durationMinutes: 8, isFree: true },
            { id: 'nafsi_anxiety_workshop', type: 'workshop', arabicName: 'كيف يضخم التوتر الأعراض الجسدية', englishName: 'How Stress Amplifies Symptoms', emoji: '📹', description: 'ورشة ٨ دقائق: فهم حلقة التوتر-الأعراض', href: '/library?domain=nafsi&topic=stress-amplification', durationMinutes: 8, isFree: true },
            { id: 'nafsi_anxiety_protocol', type: 'protocol', arabicName: 'برنامج تهدئة ٧ أيام', englishName: '7-Day Calming Program', emoji: '📋', description: 'تنفس + تأمل + حركة يومية لخفض القلق', href: '/programs/emotions/fear', durationMinutes: 0, isFree: false },
            { id: 'nafsi_anxiety_tracker', type: 'tracker', arabicName: 'متابعة صباح / مساء', englishName: 'Morning/Evening Check-in', emoji: '📊', description: 'سجّل مستوى قلقك وأعراضك صباحاً ومساءً', href: '/quick-check-in', durationMinutes: 2, isFree: true },
        ],
    },
    {
        id: 'suppression_chronic_stress',
        domainId: 'nafsi',
        arabicName: 'كبت / ضغط مزمن',
        englishName: 'Suppression / Chronic Stress',
        emoji: '🔇',
        description: 'كبت المشاعر، ضغط عمل، عدم تعبير',
        tools: [
            { id: 'nafsi_suppress_test', type: 'test', arabicName: 'اختبار الكبت العاطفي', englishName: 'Emotional Suppression Test', emoji: '🧪', description: 'هل تكبت مشاعرك؟ اكتشف نمطك', href: '/emotional-medicine', durationMinutes: 6, isFree: true },
            { id: 'nafsi_suppress_practice', type: 'practice', arabicName: 'كتابة علاجية', englishName: 'Therapeutic Journaling', emoji: '✍️', description: 'تمارين كتابة يومية لتفريغ المشاعر', href: '/tools/journal', durationMinutes: 10, isFree: true },
            { id: 'nafsi_suppress_workshop', type: 'workshop', arabicName: 'الجسد يقول ما لا تقوله', englishName: 'Body Speaks What You Cannot', emoji: '📹', description: 'ورشة ١٠ دقائق: كيف تتحول المشاعر لأعراض جسدية', href: '/library?domain=nafsi&topic=body-speaks', durationMinutes: 10, isFree: true },
            { id: 'nafsi_suppress_protocol', type: 'protocol', arabicName: 'بروتوكول التعبير ٧ أيام', englishName: '7-Day Expression Protocol', emoji: '📋', description: 'كتابة + تنفس + حركة تعبيرية يومية', href: '/programs/mind-body', durationMinutes: 0, isFree: false },
            { id: 'nafsi_suppress_tracker', type: 'tracker', arabicName: 'سجل المشاعر', englishName: 'Emotional Log', emoji: '📊', description: 'دوّن مشاعرك وربطها بأعراضك الجسدية', href: '/daily-log', durationMinutes: 2, isFree: true },
        ],
    },
    {
        id: 'grief_depletion',
        domainId: 'nafsi',
        arabicName: 'حزن / استنزاف',
        englishName: 'Grief / Depletion',
        emoji: '🕊️',
        description: 'حزن عميق، فقدان، استنزاف عاطفي',
        tools: [
            { id: 'nafsi_grief_test', type: 'test', arabicName: 'تقييم الحزن والفقد', englishName: 'Grief Assessment', emoji: '🧪', description: 'تقييم مستوى الحزن غير المعالج في حياتك', href: '/assess/depression', durationMinutes: 6, isFree: true },
            { id: 'nafsi_grief_practice', type: 'practice', arabicName: 'كتابة الحزن', englishName: 'Grief Journaling', emoji: '✍️', description: 'تمارين كتابة مصممة لمعالجة الخسارة', href: '/tools/journal', durationMinutes: 10, isFree: true },
            { id: 'nafsi_grief_workshop', type: 'workshop', arabicName: 'معالجة الفقد', englishName: 'Processing Loss', emoji: '📹', description: 'ورشة ١٢ دقيقة: كيف تهضم الخسارة جسدياً وعاطفياً', href: '/library?domain=nafsi&topic=grief', durationMinutes: 12, isFree: true },
            { id: 'nafsi_grief_protocol', type: 'protocol', arabicName: 'بروتوكول الشفاء ١٤ يوماً', englishName: '14-Day Healing Protocol', emoji: '📋', description: 'تأمل + كتابة + حركة لطيفة لمعالجة الحزن', href: '/programs/emotions/grief', durationMinutes: 0, isFree: false },
            { id: 'nafsi_grief_tracker', type: 'tracker', arabicName: 'متابعة المزاج', englishName: 'Mood Tracker', emoji: '📊', description: 'تتبع مزاجك وطاقتك العاطفية يومياً', href: '/quick-check-in', durationMinutes: 1, isFree: true },
        ],
    },
    {
        id: 'psychosomatic',
        domainId: 'nafsi',
        arabicName: 'نفس-جسدي',
        englishName: 'Psychosomatic',
        emoji: '🔗',
        description: 'أعراض جسدية ذات جذر نفسي',
        tools: [
            { id: 'nafsi_psychosom_test', type: 'test', arabicName: 'اختبار النمط النفسي-جسدي', englishName: 'Psychosomatic Pattern Test', emoji: '🧪', description: 'هل أعراضك الجسدية لها جذر عاطفي؟', href: '/emotional-medicine', durationMinutes: 7, isFree: true },
            { id: 'nafsi_psychosom_practice', type: 'practice', arabicName: 'تأمل الجسد الواعي', englishName: 'Body Awareness Meditation', emoji: '🧘', description: 'تأمل ١٠ دقائق للاستماع لرسائل جسدك', href: '/meditation', durationMinutes: 10, isFree: true },
            { id: 'nafsi_psychosom_workshop', type: 'workshop', arabicName: 'العلاقة بين المشاعر والأعراض', englishName: 'Emotions-Symptoms Connection', emoji: '📹', description: 'ورشة ١٠ دقائق: خريطة الجسد العاطفية', href: '/library?domain=nafsi&topic=psychosomatic', durationMinutes: 10, isFree: true },
            { id: 'nafsi_psychosom_protocol', type: 'protocol', arabicName: 'بروتوكول النفس-جسد ٧ أيام', englishName: '7-Day Mind-Body Protocol', emoji: '📋', description: 'دمج التنفس + الحركة + الكتابة', href: '/programs/mind-body', durationMinutes: 0, isFree: false },
            { id: 'nafsi_psychosom_tracker', type: 'tracker', arabicName: 'يوميات الأعراض والمشاعر', englishName: 'Symptom-Emotion Diary', emoji: '📊', description: 'ربط أعراضك الجسدية بحالتك العاطفية', href: '/daily-log', durationMinutes: 3, isFree: true },
        ],
    },
    {
        id: 'panic',
        domainId: 'nafsi',
        arabicName: 'نوبات هلع / خوف جسدي',
        englishName: 'Panic / Physical Fear',
        emoji: '💥',
        description: 'نوبات هلع، خفقان مفاجئ، شعور بالاختناق',
        tools: [
            { id: 'nafsi_panic_test', type: 'test', arabicName: 'تقييم نوبات الهلع', englishName: 'Panic Assessment', emoji: '🧪', description: 'تقييم تكرار وشدة نوبات الهلع', href: '/assess/anxiety', durationMinutes: 5, isFree: true },
            { id: 'nafsi_panic_practice', type: 'practice', arabicName: 'تمرين التأريض ٥-٤-٣-٢-١', englishName: '5-4-3-2-1 Grounding', emoji: '🌍', description: 'تمرين تأريض فوري لإيقاف نوبة الهلع', href: '/tools/grounding', durationMinutes: 5, isFree: true },
            { id: 'nafsi_panic_workshop', type: 'workshop', arabicName: 'فهم نوبة الهلع', englishName: 'Understanding Panic Attacks', emoji: '📹', description: 'ورشة ٦ دقائق: ما يحدث في جسدك أثناء النوبة', href: '/library?domain=nafsi&topic=panic', durationMinutes: 6, isFree: true },
            { id: 'nafsi_panic_protocol', type: 'protocol', arabicName: 'بروتوكول الطوارئ النفسية', englishName: 'Psychological First Aid Protocol', emoji: '📋', description: 'خطة طوارئ + تمارين يومية لمنع النوبات', href: '/programs/emotions/fear', durationMinutes: 0, isFree: false },
            { id: 'nafsi_panic_tracker', type: 'tracker', arabicName: 'سجل نوبات الهلع', englishName: 'Panic Log', emoji: '📊', description: 'سجّل أوقات ومحفزات وشدة النوبات', href: '/daily-log', durationMinutes: 2, isFree: true },
        ],
    },
    {
        id: 'emotion_symptom_link',
        domainId: 'nafsi',
        arabicName: 'علاقة المشاعر بالأعراض',
        englishName: 'Emotion-Symptom Link',
        emoji: '🧩',
        description: 'فهم كيف تتحول المشاعر لأعراض',
        tools: [
            { id: 'nafsi_link_test', type: 'test', arabicName: 'اختبار الربط العاطفي-الجسدي', englishName: 'Emotional-Physical Link Test', emoji: '🧪', description: 'اكتشف أنماط الربط بين مشاعرك وأعراضك', href: '/emotional-medicine', durationMinutes: 7, isFree: true },
            { id: 'nafsi_link_practice', type: 'practice', arabicName: 'عجلة المشاعر', englishName: 'Feeling Wheel Exercise', emoji: '🎡', description: 'تمرين يومي لتسمية مشاعرك بدقة', href: '/tools/journal', durationMinutes: 5, isFree: true },
            { id: 'nafsi_link_workshop', type: 'workshop', arabicName: 'خريطة مشاعرك وأعراضك', englishName: 'Mapping Emotions to Symptoms', emoji: '📹', description: 'ورشة ٨ دقائق: بناء خريطتك الشخصية', href: '/library?domain=nafsi&topic=emotion-mapping', durationMinutes: 8, isFree: true },
            { id: 'nafsi_link_protocol', type: 'protocol', arabicName: 'بروتوكول الربط ٧ أيام', englishName: '7-Day Connection Protocol', emoji: '📋', description: 'تمارين يومية لتعميق الوعي بالعلاقة', href: '/programs/mind-body', durationMinutes: 0, isFree: false },
            { id: 'nafsi_link_tracker', type: 'tracker', arabicName: 'يوميات الاتصال', englishName: 'Connection Diary', emoji: '📊', description: 'سجّل الأحداث العاطفية وردود فعل جسمك', href: '/daily-log', durationMinutes: 3, isFree: true },
        ],
    },
];

/* ══════════════════════════════════════════════════════════
   3. فكري — FIKRI (Intellectual / Cognitive) — ٦ فروع
   ══════════════════════════════════════════════════════════ */

const FIKRI_SUBDOMAINS: SubdomainDefinition[] = [
    {
        id: 'overthinking',
        domainId: 'fikri',
        arabicName: 'اجترار فكري',
        englishName: 'Overthinking / Rumination',
        emoji: '🌀',
        description: 'أفكار لا تتوقف، اجترار، أرق فكري',
        tools: [
            { id: 'fikri_overthink_test', type: 'test', arabicName: 'تقييم الاجترار الفكري', englishName: 'Rumination Assessment', emoji: '🧪', description: 'ما مدى سيطرة الأفكار المتكررة على حياتك؟', href: '/assess/cognitive', durationMinutes: 5, isFree: true },
            { id: 'fikri_overthink_practice', type: 'practice', arabicName: 'تفريغ الدماغ', englishName: 'Brain Dump Exercise', emoji: '🧠', description: 'تمرين ٥ دقائق لإخراج الأفكار من رأسك للورق', href: '/tools/journal', durationMinutes: 5, isFree: true },
            { id: 'fikri_overthink_workshop', type: 'workshop', arabicName: 'إيقاف الاجترار الليلي', englishName: 'Stopping Nighttime Rumination', emoji: '📹', description: 'ورشة ٨ دقائق: كيف توقف الأفكار قبل النوم', href: '/library?domain=fikri&topic=rumination', durationMinutes: 8, isFree: true },
            { id: 'fikri_overthink_protocol', type: 'protocol', arabicName: 'بروتوكول إيقاف الاجترار ٧ أيام', englishName: '7-Day Rumination Reset', emoji: '📋', description: 'تقنيات CBT + تأمل + كتابة لكسر الدائرة', href: '/programs/belief-reprogramming', durationMinutes: 0, isFree: false },
            { id: 'fikri_overthink_tracker', type: 'tracker', arabicName: 'سجل تكرار الأفكار', englishName: 'Thought Frequency Log', emoji: '📊', description: 'سجّل أوقات وموضوعات الاجترار', href: '/daily-log', durationMinutes: 2, isFree: true },
        ],
    },
    {
        id: 'limiting_beliefs',
        domainId: 'fikri',
        arabicName: 'معتقدات مرضية',
        englishName: 'Limiting / Pathological Beliefs',
        emoji: '🔒',
        description: 'معتقدات سلبية تُمرض، برمجيات خفية',
        tools: [
            { id: 'fikri_beliefs_test', type: 'test', arabicName: 'اختبار المعتقدات المحدّدة', englishName: 'Limiting Beliefs Screener', emoji: '🧪', description: 'اكتشف البرمجيات الداخلية التي تعيقك', href: '/assess/beliefs', durationMinutes: 7, isFree: true },
            { id: 'fikri_beliefs_practice', type: 'practice', arabicName: 'تحدي المعتقد', englishName: 'Belief Challenging', emoji: '💪', description: 'تمرين يومي لتحدي معتقد واحد محدّد', href: '/tools/reframe', durationMinutes: 8, isFree: true },
            { id: 'fikri_beliefs_workshop', type: 'workshop', arabicName: 'المعتقدات التي تُمرض', englishName: 'Beliefs That Make You Sick', emoji: '📹', description: 'ورشة ١٠ دقائق: كيف تؤثر أفكارك على صحتك', href: '/library?domain=fikri&topic=beliefs', durationMinutes: 10, isFree: true },
            { id: 'fikri_beliefs_protocol', type: 'protocol', arabicName: 'بروتوكول إعادة البرمجة ١٤ يوماً', englishName: '14-Day Reprogramming Protocol', emoji: '📋', description: 'تمارين يومية لاستبدال المعتقدات السلبية', href: '/programs/belief-reprogramming', durationMinutes: 0, isFree: false },
            { id: 'fikri_beliefs_tracker', type: 'tracker', arabicName: 'متابعة المعتقدات', englishName: 'Belief Tracker', emoji: '📊', description: 'سجّل المعتقدات القديمة والجديدة', href: '/daily-log', durationMinutes: 3, isFree: true },
        ],
    },
    {
        id: 'body_hypermonitor',
        domainId: 'fikri',
        arabicName: 'مراقبة جسدية مفرطة',
        englishName: 'Body Hypermonitoring',
        emoji: '🔍',
        description: 'قلق صحي، هوس بالأعراض، checking مستمر',
        tools: [
            { id: 'fikri_monitor_test', type: 'test', arabicName: 'اختبار القلق الصحي', englishName: 'Health Anxiety Tendency Test', emoji: '🧪', description: 'هل تراقب جسدك بشكل مفرط؟', href: '/assess/cognitive', durationMinutes: 5, isFree: true },
            { id: 'fikri_monitor_practice', type: 'practice', arabicName: 'تمرين تحويل الانتباه', englishName: 'Attention Redirection', emoji: '🎯', description: 'تمرين لنقل انتباهك من الأعراض للحياة', href: '/tools/grounding', durationMinutes: 5, isFree: true },
            { id: 'fikri_monitor_workshop', type: 'workshop', arabicName: 'كيف يضخم العقل الإحساس الجسدي', englishName: 'How Mind Amplifies Sensation', emoji: '📹', description: 'ورشة ٨ دقائق: عندما يصبح الانتباه هو المرض', href: '/library?domain=fikri&topic=body-monitoring', durationMinutes: 8, isFree: true },
            { id: 'fikri_monitor_protocol', type: 'protocol', arabicName: 'تحدي ٣ أيام: تقليل المراقبة', englishName: '3-Day Checking Reduction', emoji: '📋', description: 'خطة متدرجة لتقليل سلوك الفحص المتكرر', href: '/programs/success-engineering', durationMinutes: 0, isFree: false },
            { id: 'fikri_monitor_tracker', type: 'tracker', arabicName: 'سجل سلوك المراقبة', englishName: 'Checking Behavior Log', emoji: '📊', description: 'سجّل عدد مرات فحصك لجسدك', href: '/daily-log', durationMinutes: 1, isFree: true },
        ],
    },
    {
        id: 'self_criticism',
        domainId: 'fikri',
        arabicName: 'جلد الذات',
        englishName: 'Self-Criticism',
        emoji: '🗡️',
        description: 'نقد ذاتي حاد، شعور بعدم الكفاية',
        tools: [
            { id: 'fikri_criticism_test', type: 'test', arabicName: 'تقييم النقد الذاتي', englishName: 'Self-Criticism Assessment', emoji: '🧪', description: 'ما مدى قسوة صوتك الداخلي؟', href: '/assess/inner-speech', durationMinutes: 5, isFree: true },
            { id: 'fikri_criticism_practice', type: 'practice', arabicName: 'ممارسة الرحمة الذاتية', englishName: 'Self-Compassion Practice', emoji: '💝', description: 'تمرين يومي لتحويل النقد إلى رحمة', href: '/meditation', durationMinutes: 8, isFree: true },
            { id: 'fikri_criticism_workshop', type: 'workshop', arabicName: 'صوتك الداخلي', englishName: 'Your Inner Voice', emoji: '📹', description: 'ورشة ١٠ دقائق: من يتحدث داخلك؟', href: '/library?domain=fikri&topic=inner-voice', durationMinutes: 10, isFree: true },
            { id: 'fikri_criticism_protocol', type: 'protocol', arabicName: 'بروتوكول الرحمة الذاتية ٧ أيام', englishName: '7-Day Self-Compassion Protocol', emoji: '📋', description: 'تمارين يومية لبناء علاقة أرحم مع نفسك', href: '/programs/discipline', durationMinutes: 0, isFree: false },
            { id: 'fikri_criticism_tracker', type: 'tracker', arabicName: 'سجل الصوت الداخلي', englishName: 'Inner Voice Log', emoji: '📊', description: 'سجّل ما يقوله صوتك الداخلي وحوّله', href: '/tools/journal', durationMinutes: 3, isFree: true },
        ],
    },
    {
        id: 'perfectionism',
        domainId: 'fikri',
        arabicName: 'كمالية',
        englishName: 'Perfectionism',
        emoji: '🎯',
        description: 'كمالية سامة، ضغط الأداء، خوف من الخطأ',
        tools: [
            { id: 'fikri_perfect_test', type: 'test', arabicName: 'مقياس الكمالية', englishName: 'Perfectionism Scale', emoji: '🧪', description: 'ما مدى تأثير الكمالية على صحتك؟', href: '/assess/identity', durationMinutes: 5, isFree: true },
            { id: 'fikri_perfect_practice', type: 'practice', arabicName: 'تمرين "الجيد يكفي"', englishName: '"Good Enough" Exercise', emoji: '✅', description: 'تمرين يومي للتخلي عن المثالية', href: '/tools/reframe', durationMinutes: 5, isFree: true },
            { id: 'fikri_perfect_workshop', type: 'workshop', arabicName: 'الكمالية السامة', englishName: 'Toxic Perfectionism', emoji: '📹', description: 'ورشة ٨ دقائق: لماذا الكمالية تُمرضك', href: '/library?domain=fikri&topic=perfectionism', durationMinutes: 8, isFree: true },
            { id: 'fikri_perfect_protocol', type: 'protocol', arabicName: 'بروتوكول التخفّف ٧ أيام', englishName: '7-Day Letting Go Protocol', emoji: '📋', description: 'تحديات يومية لممارسة عدم الكمال', href: '/programs/discipline', durationMinutes: 0, isFree: false },
            { id: 'fikri_perfect_tracker', type: 'tracker', arabicName: 'متابعة التقدم', englishName: 'Progress Tracker', emoji: '📊', description: 'سجّل مواقف تخليت فيها عن المثالية', href: '/rewards', durationMinutes: 2, isFree: true },
        ],
    },
    {
        id: 'confusion_directionless',
        domainId: 'fikri',
        arabicName: 'تشوش وفقدان اتجاه',
        englishName: 'Confusion & Directionlessness',
        emoji: '🧭',
        description: 'ضبابية الهدف، فقدان البوصلة الداخلية',
        tools: [
            { id: 'fikri_clarity_test', type: 'test', arabicName: 'تقييم الوضوح والاتجاه', englishName: 'Clarity Assessment', emoji: '🧪', description: 'ما مدى وضوح هدفك واتجاهك في الحياة؟', href: '/assess/identity', durationMinutes: 6, isFree: true },
            { id: 'fikri_clarity_practice', type: 'practice', arabicName: 'كتابة الرؤية', englishName: 'Vision Journaling', emoji: '📝', description: 'تمرين كتابة لاكتشاف ما تريده حقاً', href: '/tools/vision', durationMinutes: 10, isFree: true },
            { id: 'fikri_clarity_workshop', type: 'workshop', arabicName: 'استعادة الوضوح', englishName: 'Reclaiming Clarity', emoji: '📹', description: 'ورشة ١٠ دقائق: كيف تعيد تشغيل البوصلة', href: '/library?domain=fikri&topic=clarity', durationMinutes: 10, isFree: true },
            { id: 'fikri_clarity_protocol', type: 'protocol', arabicName: 'بروتوكول البوصلة ٧ أيام', englishName: '7-Day Compass Protocol', emoji: '📋', description: 'تأمل + كتابة + تخطيط لاستعادة الاتجاه', href: '/programs/success-engineering', durationMinutes: 0, isFree: false },
            { id: 'fikri_clarity_tracker', type: 'tracker', arabicName: 'متابعة الوضوح', englishName: 'Clarity Check-in', emoji: '📊', description: 'سجّل مستوى وضوحك وتقدمك الأسبوعي', href: '/tools/weekly-plan', durationMinutes: 3, isFree: true },
        ],
    },
];

/* ══════════════════════════════════════════════════════════
   4. روحي / إيقاعي — RUHI (Spiritual / Rhythmic) — ٦ فروع
   ══════════════════════════════════════════════════════════ */

const RUHI_SUBDOMAINS: SubdomainDefinition[] = [
    {
        id: 'lost_serenity',
        domainId: 'ruhi',
        arabicName: 'فقدان السكينة',
        englishName: 'Lost Serenity',
        emoji: '☁️',
        description: 'قلق وجودي، فقدان السكون الداخلي',
        tools: [
            { id: 'ruhi_peace_test', type: 'test', arabicName: 'تقييم السكينة الداخلية', englishName: 'Inner Peace Assessment', emoji: '🧪', description: 'ما مدى سلامك الداخلي الحقيقي؟', href: '/assess/inner-balance', durationMinutes: 5, isFree: true },
            { id: 'ruhi_peace_practice', type: 'practice', arabicName: 'ممارسة التأريض', englishName: 'Grounding Practice', emoji: '🌿', description: 'تمرين ٥ دقائق للحضور والتأريض', href: '/tools/grounding', durationMinutes: 5, isFree: true },
            { id: 'ruhi_peace_workshop', type: 'workshop', arabicName: 'استعادة السكينة', englishName: 'Restoring Serenity', emoji: '📹', description: 'ورشة ١٠ دقائق: الطريق للسكون الداخلي', href: '/library?domain=ruhi&topic=serenity', durationMinutes: 10, isFree: true },
            { id: 'ruhi_peace_protocol', type: 'protocol', arabicName: 'بروتوكول السكون ٧ أيام', englishName: '7-Day Stillness Protocol', emoji: '📋', description: 'تأمل + تنفس + طبيعة يومياً', href: '/programs/meditation', durationMinutes: 0, isFree: false },
            { id: 'ruhi_peace_tracker', type: 'tracker', arabicName: 'متابعة السكينة', englishName: 'Peace Check-in', emoji: '📊', description: 'سجّل مستوى سلامك الداخلي يومياً', href: '/quick-check-in', durationMinutes: 1, isFree: true },
        ],
    },
    {
        id: 'rhythm_disruption',
        domainId: 'ruhi',
        arabicName: 'انقطاع الإيقاع اليومي',
        englishName: 'Daily Rhythm Disruption',
        emoji: '⏰',
        description: 'فوضى الروتين، عدم انتظام، خلل إيقاعي',
        tools: [
            { id: 'ruhi_rhythm_test', type: 'test', arabicName: 'تقييم الإيقاع اليومي', englishName: 'Circadian Rhythm Assessment', emoji: '🧪', description: 'ما مدى انتظام إيقاعك: نوم، أكل، حركة', href: '/assess/presence', durationMinutes: 5, isFree: true },
            { id: 'ruhi_rhythm_practice', type: 'practice', arabicName: 'روتين المساء', englishName: 'Evening Reset Routine', emoji: '🌅', description: 'بروتوكول مسائي لإعادة ضبط إيقاعك', href: '/programs/morning-ritual', durationMinutes: 10, isFree: true },
            { id: 'ruhi_rhythm_workshop', type: 'workshop', arabicName: 'إيقاعك الطبيعي', englishName: 'Your Natural Rhythm', emoji: '📹', description: 'ورشة ٨ دقائق: اكتشف إيقاعك المثالي', href: '/library?domain=ruhi&topic=rhythm', durationMinutes: 8, isFree: true },
            { id: 'ruhi_rhythm_protocol', type: 'protocol', arabicName: 'بروتوكول إعادة الإيقاع ٧ أيام', englishName: '7-Day Rhythm Reset Protocol', emoji: '📋', description: 'نوم + ضوء + وجبات في مواعيد ثابتة', href: '/programs/sleep', durationMinutes: 0, isFree: false },
            { id: 'ruhi_rhythm_tracker', type: 'tracker', arabicName: 'سجل الإيقاع', englishName: 'Rhythm Log', emoji: '📊', description: 'سجّل أوقات نومك وأكلك وحركتك', href: '/daily-log', durationMinutes: 2, isFree: true },
        ],
    },
    {
        id: 'lost_meaning',
        domainId: 'ruhi',
        arabicName: 'فقدان المعنى',
        englishName: 'Lost Meaning',
        emoji: '❓',
        description: 'فراغ وجودي، غياب الهدف، لا رسالة',
        tools: [
            { id: 'ruhi_meaning_test', type: 'test', arabicName: 'تقييم المعنى والرسالة', englishName: 'Meaning & Purpose Assessment', emoji: '🧪', description: 'هل تشعر بهدف حقيقي لحياتك؟', href: '/assess/meaning', durationMinutes: 6, isFree: true },
            { id: 'ruhi_meaning_practice', type: 'practice', arabicName: 'ممارسة الامتنان والتأمل', englishName: 'Gratitude & Reflection', emoji: '🙏', description: 'تمرين يومي للامتنان وإعادة الاتصال بالمعنى', href: '/tools/gratitude', durationMinutes: 5, isFree: true },
            { id: 'ruhi_meaning_workshop', type: 'workshop', arabicName: 'لماذا تعيش؟', englishName: 'Why Do You Live?', emoji: '📹', description: 'ورشة ١٢ دقيقة: رحلة لاكتشاف رسالتك', href: '/library?domain=ruhi&topic=meaning', durationMinutes: 12, isFree: true },
            { id: 'ruhi_meaning_protocol', type: 'protocol', arabicName: 'بروتوكول المعنى ٧ أيام', englishName: '7-Day Meaning Protocol', emoji: '📋', description: 'تأمل + كتابة + استكشاف القيم', href: '/programs/meaning-journey', durationMinutes: 0, isFree: false },
            { id: 'ruhi_meaning_tracker', type: 'tracker', arabicName: 'يوميات الهدف', englishName: 'Purpose Journal', emoji: '📊', description: 'سجّل لحظات المعنى والهدف في يومك', href: '/tools/journal', durationMinutes: 3, isFree: true },
        ],
    },
    {
        id: 'inner_depletion',
        domainId: 'ruhi',
        arabicName: 'إرهاق داخلي',
        englishName: 'Inner Depletion',
        emoji: '🪫',
        description: 'استنزاف روحي، فراغ داخلي، جفاف معنوي',
        tools: [
            { id: 'ruhi_depletion_test', type: 'test', arabicName: 'اختبار الاستنزاف الداخلي', englishName: 'Inner Depletion Screener', emoji: '🧪', description: 'ما مدى استنزافك الروحي والمعنوي؟', href: '/assess/disconnection', durationMinutes: 5, isFree: true },
            { id: 'ruhi_depletion_practice', type: 'practice', arabicName: 'ممارسة التغذية الداخلية', englishName: 'Inner Nurturing Practice', emoji: '🌱', description: 'تمرين يومي لتغذية روحك وطاقتك', href: '/meditation', durationMinutes: 8, isFree: true },
            { id: 'ruhi_depletion_workshop', type: 'workshop', arabicName: 'التغذية الداخلية', englishName: 'Inner Nourishment', emoji: '📹', description: 'ورشة ١٠ دقائق: كيف تعيد ملء خزانك', href: '/library?domain=ruhi&topic=nourishment', durationMinutes: 10, isFree: true },
            { id: 'ruhi_depletion_protocol', type: 'protocol', arabicName: 'بروتوكول الاستعادة ٧ أيام', englishName: '7-Day Restoration Protocol', emoji: '📋', description: 'صمت + طبيعة + تأمل لإعادة الملء', href: '/programs/meditation', durationMinutes: 0, isFree: false },
            { id: 'ruhi_depletion_tracker', type: 'tracker', arabicName: 'متابعة الطاقة الداخلية', englishName: 'Inner Energy Tracker', emoji: '📊', description: 'سجّل مستوى امتلاءك الداخلي يومياً', href: '/quick-check-in', durationMinutes: 1, isFree: true },
        ],
    },
    {
        id: 'self_disconnection',
        domainId: 'ruhi',
        arabicName: 'انقطاع عن الذات',
        englishName: 'Self-Disconnection',
        emoji: '🌫️',
        description: 'تخدير عاطفي، انفصال عن الجسد والمشاعر',
        tools: [
            { id: 'ruhi_disconnect_test', type: 'test', arabicName: 'تقييم الانفصال الداخلي', englishName: 'Disconnection Assessment', emoji: '🧪', description: 'ما مدى اتصالك بجسدك ومشاعرك؟', href: '/assess/disconnection', durationMinutes: 5, isFree: true },
            { id: 'ruhi_disconnect_practice', type: 'practice', arabicName: 'تأمل الوعي الجسدي', englishName: 'Body Awareness Meditation', emoji: '🧘', description: 'تأمل ١٠ دقائق لإعادة الاتصال بجسدك', href: '/meditation', durationMinutes: 10, isFree: true },
            { id: 'ruhi_disconnect_workshop', type: 'workshop', arabicName: 'العودة للجسد', englishName: 'Coming Home to Your Body', emoji: '📹', description: 'ورشة ١٠ دقائق: إعادة الاتصال بعد الانقطاع', href: '/library?domain=ruhi&topic=reconnection', durationMinutes: 10, isFree: true },
            { id: 'ruhi_disconnect_protocol', type: 'protocol', arabicName: 'بروتوكول إعادة الاتصال ٧ أيام', englishName: '7-Day Reconnection Protocol', emoji: '📋', description: 'حركة واعية + تنفس + تأمل جسدي', href: '/programs/meditation', durationMinutes: 0, isFree: false },
            { id: 'ruhi_disconnect_tracker', type: 'tracker', arabicName: 'سجل الحضور', englishName: 'Presence Log', emoji: '📊', description: 'سجّل لحظات الحضور والانقطاع', href: '/daily-log', durationMinutes: 2, isFree: true },
        ],
    },
    {
        id: 'sleep_light_quiet',
        domainId: 'ruhi',
        arabicName: 'خلل النوم / الضوء / الهدوء',
        englishName: 'Sleep / Light / Quiet Disruption',
        emoji: '🌑',
        description: 'خلل في بيئة النوم والضوء والسكون',
        tools: [
            { id: 'ruhi_env_test', type: 'test', arabicName: 'تقييم بيئة النوم والسكون', englishName: 'Sleep Environment Assessment', emoji: '🧪', description: 'هل بيئتك تدعم نومك وسكونك؟', href: '/assess/presence', durationMinutes: 4, isFree: true },
            { id: 'ruhi_env_practice', type: 'practice', arabicName: 'روتين صحة النوم', englishName: 'Sleep Hygiene Routine', emoji: '🛏️', description: 'خطوات عملية لتحسين بيئة نومك', href: '/programs/sleep', durationMinutes: 5, isFree: true },
            { id: 'ruhi_env_workshop', type: 'workshop', arabicName: 'الظلام والسكون', englishName: 'Darkness & Stillness', emoji: '📹', description: 'ورشة ٦ دقائق: أثر الضوء والصوت على جهازك العصبي', href: '/library?domain=ruhi&topic=environment', durationMinutes: 6, isFree: true },
            { id: 'ruhi_env_protocol', type: 'protocol', arabicName: 'بروتوكول الليل ٧ أيام', englishName: '7-Day Night Protocol', emoji: '📋', description: 'تهيئة بيئة مثالية للنوم والسكون', href: '/programs/sleep', durationMinutes: 0, isFree: false },
            { id: 'ruhi_env_tracker', type: 'tracker', arabicName: 'سجل البيئة', englishName: 'Environment Log', emoji: '📊', description: 'سجّل عوامل بيئتك: ضوء، صوت، درجة حرارة', href: '/daily-log', durationMinutes: 2, isFree: true },
        ],
    },
];

/* ══════════════════════════════════════════════════════════
   MASTER DOMAIN ROUTING MAP
   ══════════════════════════════════════════════════════════ */

export const DOMAIN_ROUTING_MAP: DomainRoutingDefinition[] = [
    {
        id: 'jasadi',
        arabicName: 'جسدي',
        englishName: 'Physical',
        emoji: '🫀',
        color: '#0D9488',
        colorAlt: '#059669',
        subdomains: JASADI_SUBDOMAINS,
    },
    {
        id: 'nafsi',
        arabicName: 'نفسي',
        englishName: 'Psychological',
        emoji: '🧠',
        color: '#7C3AED',
        colorAlt: '#6D28D9',
        subdomains: NAFSI_SUBDOMAINS,
    },
    {
        id: 'fikri',
        arabicName: 'فكري',
        englishName: 'Intellectual',
        emoji: '📚',
        color: '#D97706',
        colorAlt: '#EA580C',
        subdomains: FIKRI_SUBDOMAINS,
    },
    {
        id: 'ruhi',
        arabicName: 'السكينة والإيقاع',
        englishName: 'Serenity & Rhythm',
        emoji: '✨',
        color: '#2563EB',
        colorAlt: '#4F46E5',
        subdomains: RUHI_SUBDOMAINS,
    },
];

/* ══════════════════════════════════════════════════════════
   LOOKUP HELPERS
   ══════════════════════════════════════════════════════════ */

/** O(1) domain lookup by ID */
export const DOMAIN_BY_ID: Record<DomainId, DomainRoutingDefinition> =
    Object.fromEntries(DOMAIN_ROUTING_MAP.map(d => [d.id, d])) as Record<DomainId, DomainRoutingDefinition>;

/** O(1) subdomain lookup by ID */
export const SUBDOMAIN_BY_ID: Record<string, SubdomainDefinition> =
    Object.fromEntries(
        DOMAIN_ROUTING_MAP.flatMap(d => d.subdomains.map(s => [s.id, s]))
    ) as Record<string, SubdomainDefinition>;

/** Get all subdomains for a domain */
export function getSubdomains(domainId: DomainId): SubdomainDefinition[] {
    return DOMAIN_BY_ID[domainId]?.subdomains ?? [];
}

/** Get tools for a specific subdomain */
export function getSubdomainTools(subdomainId: SubdomainId): ToolRecommendation[] {
    return SUBDOMAIN_BY_ID[subdomainId]?.tools ?? [];
}

/** Get all tools across all domains (for static path generation) */
export function getAllTools(): Array<{
    tool: ToolRecommendation;
    domainId: DomainId;
    subdomainId: string;
}> {
    return DOMAIN_ROUTING_MAP.flatMap(domain =>
        domain.subdomains.flatMap(sub =>
            sub.tools.map(tool => ({
                tool,
                domainId: domain.id,
                subdomainId: sub.id,
            }))
        )
    );
}

/** Get tool recommendation by ID */
export function getToolById(toolId: string): ToolRecommendation | undefined {
    for (const domain of DOMAIN_ROUTING_MAP) {
        for (const sub of domain.subdomains) {
            const found = sub.tools.find(t => t.id === toolId);
            if (found) return found;
        }
    }
    return undefined;
}

/** Get domain ID for a tool ID */
export function getDomainForTool(toolId: string): DomainId | undefined {
    for (const domain of DOMAIN_ROUTING_MAP) {
        for (const sub of domain.subdomains) {
            if (sub.tools.some(t => t.id === toolId)) return domain.id;
        }
    }
    return undefined;
}
