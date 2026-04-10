/**
 * Section Tokens — طِبرَا 5-Domain IA System
 * ─────────────────────────────────────────────
 * Design tokens for the 5 master subscriber sections.
 * All colors, gradients, icons, and metadata live here.
 */

export interface SectionItem {
    href: string;
    label: string;
    sub: string;
    badge?: string;
    isNew?: boolean;
}

export interface SectionSubsection {
    title: string;
    items: SectionItem[];
}

export interface SectionDefinition {
    id: string;
    slug: string;          // URL slug under /sections/
    arabicName: string;
    englishName: string;
    tagline: string;
    emoji: string;
    color: string;         // Primary color
    colorAlt: string;      // Secondary gradient color
    bg: string;            // Background tint
    iconBg: string;        // Icon pill background
    subsections: SectionSubsection[];
}

/* ══════════════════════════════════════════════════
   1. جسدي
══════════════════════════════════════════════════ */
export const JASADI: SectionDefinition = {
    id: 'jasadi',
    slug: 'jasadi',
    arabicName: 'جسدي',
    englishName: 'Physical',
    tagline: 'صحة جسدك من الداخل والخارج',
    emoji: '🫀',
    color: '#0D9488',
    colorAlt: '#059669',
    bg: 'rgba(13,148,136,0.07)',
    iconBg: 'rgba(13,148,136,0.12)',
    subsections: [
        {
            title: 'التشخيص الجسدي',
            items: [
                { href: '/symptom-checker',     label: 'مدقق الأعراض الذكي',    sub: 'استبيان SOCRATES إكلينيكي',      badge: 'جديد' },
                { href: '/body-map',            label: 'خريطة الجسم',            sub: 'حدد موقع الألم بدقة' },
                { href: '/symptom-analysis',    label: 'تحليل الأعراض بـ AI',    sub: 'تقييم فوري بالذكاء الاصطناعي' },
                { href: '/quick-check-in',      label: 'الفحص السريع',           sub: 'كيف تشعر الآن؟ (٢ دقيقة)' },
                { href: '/diagnosis/face-scan', label: 'مسح الوجه الذكي',        sub: 'تشخيص بصري بالكاميرا',          badge: 'جديد' },
                { href: '/intake',              label: 'الاستبيان الأولي الشامل', sub: 'تقييم متكامل لحالتك الصحية' },
                { href: '/medical-history',     label: 'التاريخ الطبي',           sub: 'كل حالاتك الصحية السابقة' },
                { href: '/health-report',       label: 'التقرير الصحي الشامل',   sub: 'تحليل دوري + توصيات PDF' },
            ],
        },
        {
            title: 'الأكل والتغذية',
            items: [
                { href: '/meal-planner',    label: 'مخطط الوجبات',         sub: 'خطتك الغذائية الأسبوعية' },
                { href: '/smart-pharmacy',  label: 'الصيدلية الذكية',       sub: 'مكملات بتوصية طبية لحالتك' },
            ],
        },
        {
            title: 'المتابعة الجسدية اليومية',
            items: [
                { href: '/health-tracker',  label: 'متابعة الصحة',         sub: 'مؤشراتك اليومية كاملة' },
                { href: '/record-health',   label: 'تسجيل القراءات',        sub: 'وزن، ضغط، سكر، ترطيب' },
                { href: '/daily-log',       label: 'السجل اليومي',          sub: 'دوّن يومك الصحي بتفصيل' },
            ],
        },
        {
            title: 'الكورسات الجسدية',
            items: [
                { href: '/courses?domain=jasadi', label: 'الكورسات الجسدية', sub: 'برامج استشفاء الجسم والحركة والتغذية', badge: 'قريباً' },
            ],
        },
    ],
};

/* ══════════════════════════════════════════════════
   2. نفسي
══════════════════════════════════════════════════ */
export const NAFSI: SectionDefinition = {
    id: 'nafsi',
    slug: 'nafsi',
    arabicName: 'نفسي',
    englishName: 'Psychological',
    tagline: 'عواطفك، علاقاتك، وسلامتك الداخلية',
    emoji: '🧠',
    color: '#7C3AED',
    colorAlt: '#6D28D9',
    bg: 'rgba(124,58,237,0.07)',
    iconBg: 'rgba(124,58,237,0.10)',
    subsections: [
        {
            title: 'التشخيص النفسي',
            items: [
                { href: '/emotional-medicine', label: 'الطب الشعوري', sub: 'تقييم حالتك العاطفية ومساراتها', badge: 'رئيسي' },
            ],
        },
        {
            title: 'صحة المشاعر',
            items: [
                { href: '/emotional-medicine', label: 'أدوات الشفاء العاطفي', sub: 'الخوف، الغضب، الحزن، التعلق وأكثر' },
            ],
        },
        {
            title: 'صحة العلاقات',
            items: [
                { href: '/family', label: 'صحة العائلة', sub: 'إدارة صحة وعلاقات أفراد عائلتك' },
            ],
        },
        {
            title: 'الكورسات النفسية',
            items: [
                { href: '/courses?domain=nafsi', label: 'الكورسات النفسية', sub: 'العلاج العاطفي، العلاقات والتنظيم النفسي', badge: 'قريباً' },
            ],
        },
    ],
};

/* ══════════════════════════════════════════════════
   3. فكري
══════════════════════════════════════════════════ */
export const FIKRI: SectionDefinition = {
    id: 'fikri',
    slug: 'fikri',
    arabicName: 'فكري',
    englishName: 'Intellectual',
    tagline: 'أفكارك، معتقداتك، ونموك الذاتي',
    emoji: '📚',
    color: '#D97706',
    colorAlt: '#EA580C',
    bg: 'rgba(217,119,6,0.07)',
    iconBg: 'rgba(217,119,6,0.10)',
    subsections: [
        {
            title: 'الكتب والمقالات والمكتبة',
            items: [
                { href: '/library',       label: 'المكتبة الصحية',    sub: 'مقالات ومراجع علمية موثوقة' },
                { href: '/glass-library', label: 'Glass Library',      sub: 'تجربة قراءة غامرة ومميزة' },
            ],
        },
        {
            title: 'التخطيط والتطوير',
            items: [
                { href: '/rewards', label: 'التحديات والأهداف', sub: 'خطط تطويرية ونقاط الإنجاز اليومية' },
            ],
        },
        {
            title: 'الكورسات الفكرية',
            items: [
                { href: '/courses', label: 'أكاديمية طِبرَا',     sub: 'دورات التفكير والمعتقدات والنجاح', badge: 'متاح' },
                { href: '/courses?domain=fikri', label: 'الكورسات الفكرية', sub: 'التخطيط، المعتقدات، الكلمة والتفكير', badge: 'قريباً' },
            ],
        },
    ],
};

/* ══════════════════════════════════════════════════
   4. روحي
══════════════════════════════════════════════════ */
export const RUHI: SectionDefinition = {
    id: 'ruhi',
    slug: 'ruhi',
    arabicName: 'روحي',
    englishName: 'Spiritual',
    tagline: 'السكون، الترددات، والمعنى الأعمق',
    emoji: '✨',
    color: '#2563EB',
    colorAlt: '#4F46E5',
    bg: 'rgba(37,99,235,0.07)',
    iconBg: 'rgba(37,99,235,0.10)',
    subsections: [
        {
            title: 'الترددات والصوت العلاجي',
            items: [
                { href: '/frequencies',      label: 'الترددات العلاجية',  sub: 'علاج تكميلي بالموجات الصوتية' },
                { href: '/rife-frequencies', label: 'ترددات رايف',         sub: 'بروتوكولات RIFE المتخصصة' },
                { href: '/radio',            label: 'راديو الاسترخاء',     sub: 'موسيقى علاجية وأصوات طبيعية' },
            ],
        },
        {
            title: 'السكون والتأمل',
            items: [
                { href: '/meditation', label: 'التأمل والذهن',     sub: 'اليقظة والحضور الكامل' },
                { href: '/breathe',    label: 'تمارين التنفس',     sub: 'جلسات تأمل واسترخاء عميق' },
            ],
        },
        {
            title: 'الكورسات الروحية',
            items: [
                { href: '/courses?domain=ruhi', label: 'الكورسات الروحية', sub: 'السكون، الترددات والمعنى', badge: 'قريباً' },
            ],
        },
    ],
};

/* ══════════════════════════════════════════════════
   5. أخرى
══════════════════════════════════════════════════ */
export const OTHER: SectionDefinition = {
    id: 'other',
    slug: 'other',
    arabicName: 'أخرى',
    englishName: 'Others',
    tagline: 'حسابك، خدماتك، ومواعيدك',
    emoji: '⚙️',
    color: '#475569',
    colorAlt: '#334155',
    bg: 'rgba(71,85,105,0.07)',
    iconBg: 'rgba(71,85,105,0.10)',
    subsections: [
        {
            title: 'الرعاية الطبية',
            items: [
                { href: '/my-care',          label: 'رعايتي',            sub: 'خطة علاجك الكاملة' },
                { href: '/my-appointments',  label: 'مواعيدي',            sub: 'القادمة والسابقة' },
                { href: '/book-appointment', label: 'احجز موعد',          sub: 'مع الدكتور مباشرة', badge: '⚡ أولوية' },
                { href: '/medical-file',     label: 'الملف الطبي',        sub: 'سجلاتك وتقاريرك الطبية' },
            ],
        },
        {
            title: 'الصيدلية والاشتراكات',
            items: [
                { href: '/shop',     label: 'الصيدلية والمكملات',   sub: 'منتجات صحية بضمان الجودة', badge: '🌟 مميز' },
                { href: '/premium',  label: 'طِبرَا+ المميز',        sub: 'اشتراك VIP وبرامج حصرية',  badge: '👑 حصري' },
            ],
        },
        {
            title: 'الخدمات',
            items: [
                { href: '/services',         label: 'الخدمات الطبية',    sub: 'قائمة كاملة بالخدمات المتاحة' },
                { href: '/digital-services', label: 'الخدمات الرقمية',   sub: 'الاستشارات والتحاليل الذكية' },
                { href: '/rewards',          label: 'المكافآت والنقاط',  sub: 'تحدياتك اليومية وجوائزك' },
                { href: '/family',           label: 'صحة العائلة',        sub: 'إدارة صحة أفراد عائلتك' },
            ],
        },
        {
            title: 'الحساب والإعدادات',
            items: [
                { href: '/profile',  label: 'ملفي الشخصي',        sub: 'بياناتك وتفضيلاتك الطبية' },
                { href: '/settings', label: 'الإعدادات',            sub: 'الإشعارات، المظهر، الخصوصية' },
                { href: '/help',     label: 'المساعدة والدعم',      sub: 'أسئلة شائعة، تواصل معنا' },
                { href: '/privacy',  label: 'سياسة الخصوصية',      sub: 'كيف نحمي بياناتك الطبية' },
                { href: '/terms',    label: 'الشروط والأحكام',       sub: 'اتفاقية استخدام المنصة' },
            ],
        },
    ],
};

/* ── Master list (order matters for display) ── */
export const ALL_SECTIONS: SectionDefinition[] = [JASADI, NAFSI, FIKRI, RUHI, OTHER];

/* ── Section by slug ── */
export const SECTION_BY_SLUG: Record<string, SectionDefinition> = {
    jasadi: JASADI,
    nafsi: NAFSI,
    fikri: FIKRI,
    ruhi: RUHI,
    other: OTHER,
};
