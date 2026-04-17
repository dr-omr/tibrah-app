/**
 * section-tokens.ts — طِبرَا 4-Domain Healing Architecture
 * ─────────────────────────────────────────────────────────
 * المعمار العلاجي–التجاري الرباعي:
 *
 *   جسدي → نفسي → فكري → روحي
 *
 * كل قسم يحتوي على نفس العمود الفقري الخماسي:
 *   1. تشخيص
 *   2. برامج
 *   3. أدوات
 *   4. مكتبة
 *   5. كورسات مدفوعة
 *
 * نموذج الأرباح: مجاني → عضوية → كورسات → برامج → استشارة
 */

export type ItemType = 'diagnostic' | 'educational' | 'practical' | 'paid';

export interface SectionItem {
    href: string;
    label: string;
    sub: string;
    badge?: string;
    isNew?: boolean;
    type?: ItemType;
}

export interface SectionSubsection {
    id: string;
    title: string;
    icon?: string;
    items: SectionItem[];
}

export interface SectionDefinition {
    id: string;
    slug: string;
    arabicName: string;
    englishName: string;
    tagline: string;
    emoji: string;
    color: string;
    colorAlt: string;
    bg: string;
    iconBg: string;
    subsections: SectionSubsection[];
}

/* ══════════════════════════════════════════════════════════════
   1. جسدي — Physical
══════════════════════════════════════════════════════════════ */
export const JASADI: SectionDefinition = {
    id: 'jasadi',
    slug: 'jasadi',
    arabicName: 'جسدي',
    englishName: 'Physical',
    tagline: 'جسمك · تشخيصك · استعادتك',
    emoji: '🫀',
    color: '#0D9488',
    colorAlt: '#059669',
    bg: 'rgba(13,148,136,0.07)',
    iconBg: 'rgba(13,148,136,0.12)',
    subsections: [
        {
            id: 'jasadi-diagnosis',
            title: 'التشخيص الجسدي',
            icon: '🔬',
            items: [
                { href: '/symptom-checker',      label: 'مدقق الأعراض الذكي',     sub: 'محرك فرز سريري — SOCRATES',     badge: 'رئيسي', type: 'diagnostic' },
                { href: '/intake',               label: 'الاستبيان الأولي الشامل', sub: 'تاريخ مرضي كامل + نظم الجسد',  type: 'diagnostic' },
                { href: '/body-map',             label: 'خريطة الجسم',             sub: 'حدد موقع الألم بدقة تشريحية',  type: 'diagnostic' },
                { href: '/medical-history',      label: 'التاريخ الطبي',            sub: 'تاريخ مرضي، دوائي، عائلي',    type: 'diagnostic' },
                { href: '/diagnosis/face-scan',  label: 'مسح الوجه الذكي',         sub: 'تشخيص بصري بالكاميرا',         badge: 'جديد', isNew: true, type: 'diagnostic' },
                { href: '/health-report',        label: 'التقرير الصحي الشامل',    sub: 'تحليل دوري + توصيات PDF',      type: 'diagnostic' },
            ],
        },
        {
            id: 'jasadi-programs',
            title: 'البرامج الجسدية',
            icon: '💪',
            items: [
                { href: '/programs/movement',    label: 'الحركة العلاجية',         sub: 'رياضة حسب حالتك الصحية تحديداً', type: 'practical' },
                { href: '/programs/nutrition',   label: 'الأكل العلاجي',           sub: 'تغذية حسب المرض والهدف',        type: 'practical' },
                { href: '/programs/hydration',   label: 'السوائل والدعم العشبي',   sub: 'مشروبات وأعشاب حسب مشكلتك',    type: 'practical' },
                { href: '/programs/sleep',       label: 'النوم العلاجي',           sub: 'بروتوكولات الأرق والإرهاق',      type: 'practical' },
                { href: '/meal-planner',         label: 'مخطط الوجبات',            sub: 'خطة غذائية أسبوعية مخصصة',     type: 'practical' },
                { href: '/programs/detox',       label: 'برنامج إعادة الضبط',      sub: 'ديتوكس جسدي ٢١ يوماً',          badge: 'قريباً', type: 'paid' },
            ],
        },
        {
            id: 'jasadi-tools',
            title: 'الأدوات اليومية',
            icon: '📊',
            items: [
                { href: '/health-tracker',       label: 'متابعة الصحة',            sub: 'مؤشراتك اليومية كاملة',         type: 'practical' },
                { href: '/record-health',        label: 'تسجيل القراءات',           sub: 'وزن، ضغط، سكر، ترطيب',         type: 'practical' },
                { href: '/daily-log',            label: 'السجل اليومي',             sub: 'دوّن يومك الصحي بتفصيل',        type: 'practical' },
                { href: '/quick-check-in',       label: 'الفحص السريع',             sub: 'كيف تشعر الآن؟ (٢ دقيقة)',      type: 'diagnostic' },
                { href: '/smart-pharmacy',       label: 'الصيدلية الذكية',          sub: 'مكملات بتوصية طبية لحالتك',     isNew: true, type: 'practical' },
            ],
        },
        {
            id: 'jasadi-library',
            title: 'مكتبة الصحة الجسدية',
            icon: '📚',
            items: [
                { href: '/library?domain=jasadi', label: 'مقالات طبية موثوقة',     sub: 'أبحاث ومراجع علمية مراجعة',    type: 'educational' },
                { href: '/library/movement',      label: 'مكتبة الحركة',           sub: 'كتب وملاحق الحركة العلاجية',   type: 'educational' },
                { href: '/library/nutrition',     label: 'مكتبة التغذية',          sub: 'أعمق محتوى غذائي طبي',         type: 'educational' },
                { href: '/library/symptoms',      label: 'دليل الأعراض',           sub: 'فهم أعراضك بالمنطق السريري',   type: 'educational' },
            ],
        },
        {
            id: 'jasadi-courses',
            title: 'كورسات جسدية مدفوعة',
            icon: '🎓',
            items: [
                { href: '/courses/reset-body',       label: 'كورس إعادة ضبط الجسد',    sub: 'تحول جسدي كامل في ٤٠ يوماً',  badge: '👑 VIP', type: 'paid' },
                { href: '/courses/sleep-energy',     label: 'كورس النوم والطاقة',       sub: 'حل أرق وإرهاق مزمن نهائياً', badge: 'مميز',   type: 'paid' },
                { href: '/courses/healing-nutrition', label: 'كورس التغذية العلاجية',   sub: 'أكل كدواء — بروتوكول متكامل', badge: 'جديد',   type: 'paid' },
                { href: '/courses/understand-symptoms', label: 'كورس فهم أعراضك',       sub: 'قبل الطبيب — افهم جسدك',     type: 'paid' },
            ],
        },
    ],
};

/* ══════════════════════════════════════════════════════════════
   2. نفسي — Psychological
══════════════════════════════════════════════════════════════ */
export const NAFSI: SectionDefinition = {
    id: 'nafsi',
    slug: 'nafsi',
    arabicName: 'نفسي',
    englishName: 'Psychological',
    tagline: 'مشاعرك · علاقاتك · حريتك الداخلية',
    emoji: '🧠',
    color: '#7C3AED',
    colorAlt: '#6D28D9',
    bg: 'rgba(124,58,237,0.07)',
    iconBg: 'rgba(124,58,237,0.10)',
    subsections: [
        {
            id: 'nafsi-diagnosis',
            title: 'التشخيص النفسي',
            icon: '🔍',
            items: [
                { href: '/emotional-medicine',        label: 'الطب الشعوري',             sub: 'تقييم حالتك العاطفية ومساراتها', badge: 'رئيسي', type: 'diagnostic' },
                { href: '/assess/anxiety',            label: 'تقييم القلق',               sub: 'GAD-7 + تحليل سريري عميق',       type: 'diagnostic' },
                { href: '/assess/depression',         label: 'تقييم الاكتئاب',            sub: 'PHQ-9 + مسارات الدعم',           type: 'diagnostic' },
                { href: '/assess/burnout',            label: 'تقييم الاحتراق النفسي',     sub: 'اكتشف مستوى استنزافك',           type: 'diagnostic' },
                { href: '/assess/attachment',         label: 'تقييم نمط التعلّق',         sub: 'علاقاتك + جذورها النفسية',        type: 'diagnostic' },
                { href: '/assess/personality',        label: 'أنماط الشخصية',             sub: 'فهم نفسك بعمق علمي',             type: 'diagnostic' },
                { href: '/assess/awareness',          label: 'خرائط الوعي والأنماط',       sub: 'أنماط الطاقة والوعي الداخلي',    type: 'diagnostic' },
            ],
        },
        {
            id: 'nafsi-programs',
            title: 'برامج تنظيم وتحرير المشاعر',
            icon: '💜',
            items: [
                { href: '/programs/emotions/fear',    label: 'تحرير الخوف',               sub: 'CBT + Somatic + Breathwork',     type: 'practical' },
                { href: '/programs/emotions/anger',   label: 'إدارة الغضب',               sub: 'تنظيم عاطفي عميق',              type: 'practical' },
                { href: '/programs/emotions/grief',   label: 'معالجة الحزن والفقد',        sub: 'بروتوكول شفاء الخسارة',          type: 'practical' },
                { href: '/programs/emotions/guilt',   label: 'تحرير الذنب والعار',         sub: 'إعادة بناء قيمة الذات',          type: 'practical' },
                { href: '/programs/mind-body',        label: 'النفس–جسد',                  sub: 'كيف تتحول المشاعر إلى أعراض',   isNew: true, type: 'practical' },
                { href: '/programs/relationships',    label: 'صحة العلاقات',               sub: 'الحدود · التعلّق · التواصل',     type: 'practical' },
            ],
        },
        {
            id: 'nafsi-tools',
            title: 'أدوات الصحة النفسية اليومية',
            icon: '🛠️',
            items: [
                { href: '/tools/journal',             label: 'الكتابة العلاجية',           sub: 'Journal Prompts يومية',          type: 'practical' },
                { href: '/tools/grounding',           label: 'تمارين التأريض',             sub: '5-4-3-2-1 وأدوات حضور',         type: 'practical' },
                { href: '/tools/reframe',             label: 'إعادة الصياغة المعرفية',     sub: 'Cognitive Reframing Tools',     type: 'practical' },
                { href: '/family',                    label: 'صحة العائلة',                sub: 'إدارة صحة وعلاقات أفراد عائلتك', type: 'practical' },
                { href: '/meditation',                label: 'التأمل والذهن',              sub: 'اليقظة والحضور الكامل',          type: 'practical' },
            ],
        },
        {
            id: 'nafsi-library',
            title: 'مكتبة الصحة النفسية',
            icon: '📖',
            items: [
                { href: '/library?domain=nafsi',       label: 'مقالات نفسية',              sub: 'مكتبة علم النفس والعلاج',        type: 'educational' },
                { href: '/library/emotions',           label: 'دليل المشاعر',              sub: 'فهم كل شعور من جذره',            type: 'educational' },
                { href: '/library/relationships',      label: 'مكتبة العلاقات',            sub: 'علاقات صحية وحدود واضحة',        type: 'educational' },
            ],
        },
        {
            id: 'nafsi-courses',
            title: 'كورسات نفسية مدفوعة',
            icon: '🎓',
            items: [
                { href: '/courses/emotional-regulation', label: 'كورس تنظيم المشاعر',      sub: 'إتقان المشاعر — منهج متكامل',    badge: '👑 VIP', type: 'paid' },
                { href: '/courses/detachment',           label: 'كورس فك التعلّق',          sub: 'التحرر من الارتباطات المؤلمة',   badge: 'مميز', type: 'paid' },
                { href: '/courses/self-reset',           label: 'كورس إعادة ضبط الذات',    sub: 'هوية جديدة من الداخل',           type: 'paid' },
                { href: '/courses/mind-body-course',     label: 'كورس النفس–جسد',          sub: 'الجسر بين مشاعرك وجسدك',        badge: 'جديد', type: 'paid' },
                { href: '/courses/mature-relationships',  label: 'كورس العلاقات الناضجة',  sub: 'بناء علاقات مبنية على الوعي',    type: 'paid' },
            ],
        },
    ],
};

/* ══════════════════════════════════════════════════════════════
   3. فكري — Intellectual
══════════════════════════════════════════════════════════════ */
export const FIKRI: SectionDefinition = {
    id: 'fikri',
    slug: 'fikri',
    arabicName: 'فكري',
    englishName: 'Intellectual',
    tagline: 'أفكارك · معتقداتك · هندستك',
    emoji: '📚',
    color: '#D97706',
    colorAlt: '#EA580C',
    bg: 'rgba(217,119,6,0.07)',
    iconBg: 'rgba(217,119,6,0.10)',
    subsections: [
        {
            id: 'fikri-diagnosis',
            title: 'تشخيص الأنماط الفكرية',
            icon: '🧩',
            items: [
                { href: '/assess/beliefs',            label: 'المعتقدات المحدِّدة',        sub: 'اكتشف برمجياتك الداخلية',       badge: 'رئيسي', type: 'diagnostic' },
                { href: '/assess/cognitive',          label: 'التشوهات المعرفية',          sub: 'أنماط تفكير تعيقك بدون أن تعرف', type: 'diagnostic' },
                { href: '/assess/procrastination',    label: 'تقييم التسويف',              sub: 'فهم جذر تأخيرك',                 type: 'diagnostic' },
                { href: '/assess/identity',           label: 'تقييم الهوية والانضباط',     sub: 'من أنت؟ وماذا تريد أن تصبح؟',   type: 'diagnostic' },
                { href: '/assess/inner-speech',       label: 'تقييم الحديث الداخلي',       sub: 'اللغة السرية التي تشكّل حياتك',  type: 'diagnostic' },
            ],
        },
        {
            id: 'fikri-programs',
            title: 'برامج هندسة العقل والنجاح',
            icon: '🏗️',
            items: [
                { href: '/programs/success-engineering', label: 'هندسة النجاح',             sub: 'أهداف · عادات · هوية · إنجاز',  type: 'practical' },
                { href: '/programs/belief-reprogramming', label: 'إعادة برمجة المعتقدات',   sub: 'تغيير البرمجيات الخفية',         isNew: true, type: 'practical' },
                { href: '/programs/word-power',          label: 'هندسة الفكر والكلمة',       sub: 'أثر اللغة على نفسك وواقعك',     type: 'practical' },
                { href: '/programs/discipline',          label: 'الانضباط وبناء العادات',     sub: 'نظام عملي يصمد طويلاً',          type: 'practical' },
            ],
        },
        {
            id: 'fikri-tools',
            title: 'أدوات التطوير الذاتي اليومية',
            icon: '⚙️',
            items: [
                { href: '/tools/weekly-plan',         label: 'التخطيط الأسبوعي',           sub: 'خطة أسبوعك المتكاملة',            type: 'practical' },
                { href: '/tools/annual-plan',         label: 'التخطيط السنوي',              sub: 'رؤيتك للعام القادم',              type: 'practical' },
                { href: '/rewards',                   label: 'التحديات والأهداف',           sub: 'نقاط إنجاز ومتابعة يومية',        type: 'practical' },
                { href: '/tools/vision',              label: 'رؤية الحياة',                 sub: 'وضوح عميق لما تريد',              type: 'practical' },
            ],
        },
        {
            id: 'fikri-library',
            title: 'مكتبة البصيرة',
            icon: '🏛️',
            items: [
                { href: '/library',                   label: 'المكتبة الصحية',              sub: 'مقالات وأبحاث موثوقة',            type: 'educational' },
                { href: '/glass-library',             label: 'Glass Library',               sub: 'تجربة قراءة غامرة ومميزة',        type: 'educational' },
                { href: '/library?domain=fikri',      label: 'ملخصات الكتب',               sub: 'أهم ما في أفضل الكتب',            type: 'educational' },
                { href: '/library/mindmaps',          label: 'خرائط المفاهيم',              sub: 'أفكار معقدة بصياغة بصرية',        type: 'educational' },
            ],
        },
        {
            id: 'fikri-courses',
            title: 'كورسات فكرية مدفوعة',
            icon: '🎓',
            items: [
                { href: '/courses/mind-rebuild',      label: 'كورس إعادة بناء العقل',       sub: 'ثورة في طريقة تفكيرك',           badge: '👑 VIP', type: 'paid' },
                { href: '/courses/kill-procrastination', label: 'كورس قتل التسويف',        sub: 'من المعرفة للتنفيذ الفوري',       badge: 'مميز', type: 'paid' },
                { href: '/courses/limiting-beliefs',  label: 'كورس المعتقدات المحدِّدة',    sub: 'اكسر القيود الخفية',              type: 'paid' },
                { href: '/courses/word-power-course', label: 'كورس قوة الكلمة',             sub: 'الكلمة التي تشفي وتدمر',          badge: 'جديد', type: 'paid' },
                { href: '/courses/discipline-success', label: 'كورس الانضباط والنجاح',     sub: 'منظومة نجاح كاملة',               type: 'paid' },
            ],
        },
    ],
};

/* ══════════════════════════════════════════════════════════════
   4. روحي — Spiritual
══════════════════════════════════════════════════════════════ */
export const RUHI: SectionDefinition = {
    id: 'ruhi',
    slug: 'ruhi',
    arabicName: 'روحي',
    englishName: 'Spiritual',
    tagline: 'سكونك · معناك · تناسقك الداخلي',
    emoji: '✨',
    color: '#2563EB',
    colorAlt: '#4F46E5',
    bg: 'rgba(37,99,235,0.07)',
    iconBg: 'rgba(37,99,235,0.10)',
    subsections: [
        {
            id: 'ruhi-diagnosis',
            title: 'تقييم الاتزان الداخلي',
            icon: '🌀',
            items: [
                { href: '/assess/inner-balance',      label: 'تقييم اتزانك الداخلي',       sub: 'المعنى · السكون · الاتصال',      badge: 'رئيسي', type: 'diagnostic' },
                { href: '/assess/meaning',            label: 'تقييم المعنى والرسالة',       sub: 'هل تشعر بهدف حقيقي لحياتك؟',   type: 'diagnostic' },
                { href: '/assess/presence',           label: 'تقييم الحضور والانتباه',      sub: 'مدى عيشك في اللحظة الراهنة',     type: 'diagnostic' },
                { href: '/assess/disconnection',      label: 'تقييم الانفصال الداخلي',      sub: 'ضياع · فراغ روحي · تشتت',        type: 'diagnostic' },
            ],
        },
        {
            id: 'ruhi-programs',
            title: 'برامج السكون والحضور',
            icon: '🕊️',
            items: [
                { href: '/programs/frequencies',      label: 'الصوت والترددات',             sub: 'علاج تكميلي بالموجات الصوتية',   isNew: true, type: 'practical' },
                { href: '/programs/meditation',       label: 'برنامج التأمل التدريجي',       sub: 'من المبتدئ للمتعمق',              type: 'practical' },
                { href: '/programs/morning-ritual',   label: 'الطقوس اليومية',              sub: 'روتين صباحي ومسائي روحي',         type: 'practical' },
                { href: '/programs/meaning-journey',  label: 'رحلة المعنى والرسالة',        sub: 'لماذا تعيش؟ ما رسالتك؟',          type: 'practical' },
            ],
        },
        {
            id: 'ruhi-tools',
            title: 'أدوات الروح اليومية',
            icon: '🌿',
            items: [
                { href: '/frequencies',               label: 'الترددات العلاجية',           sub: 'جلسات صوتية مباشرة',              type: 'practical' },
                { href: '/rife-frequencies',          label: 'ترددات رايف',                 sub: 'بروتوكولات RIFE المتخصصة',       type: 'practical' },
                { href: '/radio',                     label: 'راديو الاسترخاء',             sub: 'موسيقى علاجية وأصوات طبيعية',    type: 'practical' },
                { href: '/breathe',                   label: 'تمارين التنفس الواعي',        sub: 'جلسات تأمل واسترخاء عميق',        type: 'practical' },
                { href: '/tools/gratitude',           label: 'ممارسة الامتنان اليومية',     sub: 'إعادة تشغيل طاقة الشكر',          type: 'practical' },
            ],
        },
        {
            id: 'ruhi-library',
            title: 'مكتبة الروح والوعي',
            icon: '🌟',
            items: [
                { href: '/library?domain=ruhi',       label: 'مقالات روحية وفلسفية',        sub: 'فكر · وعي · معنى · تناسق',       type: 'educational' },
                { href: '/library/meaning',           label: 'مكتبة المعنى',                sub: 'كتب وإلهام حول هدف الوجود',       type: 'educational' },
                { href: '/library/frequencies',       label: 'علم الترددات',                sub: 'أبحاث وأثر الصوت العلاجي',        type: 'educational' },
            ],
        },
        {
            id: 'ruhi-courses',
            title: 'كورسات روحية مدفوعة',
            icon: '🎓',
            items: [
                { href: '/courses/back-to-nature',    label: 'كورس العودة للفطرة',           sub: 'اتصال عميق بجوهرك الحقيقي',      badge: '👑 VIP', type: 'paid' },
                { href: '/courses/inner-peace',       label: 'كورس السكينة الداخلية',        sub: 'سكون لا يتزعزع — منهج ٣٠ يوماً', badge: 'مميز', type: 'paid' },
                { href: '/courses/frequencies-course', label: 'كورس الترددات والحضور',      sub: 'أعمق أثر الصوت في الشفاء',        type: 'paid' },
                { href: '/courses/meaning-balance',   label: 'كورس المعنى والاتزان',         sub: 'وضوح الرسالة وهدوء النفس',        badge: 'جديد', type: 'paid' },
            ],
        },
    ],
};

/* ══════════════════════════════════════════════════════════════
   Master exports
══════════════════════════════════════════════════════════════ */
/** 4 domains in sequence: Body → Mind → Intellect → Soul */
export const ALL_SECTIONS: SectionDefinition[] = [JASADI, NAFSI, FIKRI, RUHI];

/** O(1) lookup by slug */
export const SECTION_BY_SLUG: Record<string, SectionDefinition> = {
    jasadi: JASADI,
    nafsi:  NAFSI,
    fikri:  FIKRI,
    ruhi:   RUHI,
};
