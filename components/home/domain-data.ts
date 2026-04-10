/**
 * domain-data.ts — طِبرَا Home Domain Definitions
 * ────────────────────────────────────────────────
 * Single source of truth for the 5 domains.
 * Each domain card can independently be expanded
 * with rich data, health scores, and API feeds.
 */

export interface DomainQuickAction {
    label: string;
    sub: string;
    href: string;
    isNew?: boolean;
}

export interface DomainDefinition {
    id: string;
    slug: string;
    emoji: string;
    name: string;           // Arabic
    nameEn: string;         // English
    tagline: string;        // Arabic tagline
    color: string;          // Primary hex
    colorAlt: string;       // Secondary hex
    gradient: string;       // CSS gradient string
    score: number;          // 0–100
    delta: number;          // +/- change
    sectionHref: string;    // /sections/[slug]
    quickActions: DomainQuickAction[];
    // future: healthMetrics, streaks, latestLog, etc.
}

export const DOMAINS: DomainDefinition[] = [
    {
        id: 'jasadi',
        slug: 'jasadi',
        emoji: '🫀',
        name: 'جسدي',
        nameEn: 'Physical',
        tagline: 'جسمك · تغذيتك · متابعتك',
        color: '#0D9488',
        colorAlt: '#059669',
        gradient: 'linear-gradient(145deg, #0D9488 0%, #059669 100%)',
        score: 78,
        delta: +5,
        sectionHref: '/sections/jasadi',
        quickActions: [
            { label: 'مدقق الأعراض',   sub: 'AI إكلينيكي',     href: '/symptom-checker',  isNew: true },
            { label: 'متابعة الصحة',   sub: 'مؤشراتك اليومية', href: '/health-tracker'               },
            { label: 'مخطط الوجبات',   sub: 'خطتك الغذائية',   href: '/meal-planner'                 },
            { label: 'تسجيل القراءات', sub: 'أرقامك الحيوية',  href: '/record-health'                },
        ],
    },
    {
        id: 'nafsi',
        slug: 'nafsi',
        emoji: '🧠',
        name: 'نفسي',
        nameEn: 'Psychological',
        tagline: 'مشاعرك · علاقاتك · سلامتك',
        color: '#7C3AED',
        colorAlt: '#6D28D9',
        gradient: 'linear-gradient(145deg, #7C3AED 0%, #6D28D9 100%)',
        score: 62,
        delta: -2,
        sectionHref: '/sections/nafsi',
        quickActions: [
            { label: 'الطب الشعوري', sub: 'تقييم نفسي عميق', href: '/emotional-medicine', isNew: true },
            { label: 'التأمل والذهن', sub: 'اليقظة والحضور',  href: '/meditation'                      },
            { label: 'صحة العائلة',  sub: 'إدارة ذويك',      href: '/family'                          },
        ],
    },
    {
        id: 'fikri',
        slug: 'fikri',
        emoji: '📚',
        name: 'فكري',
        nameEn: 'Intellectual',
        tagline: 'أفكارك · معتقداتك · نموك',
        color: '#D97706',
        colorAlt: '#EA580C',
        gradient: 'linear-gradient(145deg, #D97706 0%, #EA580C 100%)',
        score: 85,
        delta: +12,
        sectionHref: '/sections/fikri',
        quickActions: [
            { label: 'أكاديمية طِبرَا',  sub: 'كورسات حصرية',    href: '/courses' },
            { label: 'المكتبة الصحية',   sub: 'مقالات وأبحاث',   href: '/library' },
            { label: 'التحديات والنقاط', sub: 'مستواك اليومي',   href: '/rewards' },
        ],
    },
    {
        id: 'ruhi',
        slug: 'ruhi',
        emoji: '✨',
        name: 'روحي',
        nameEn: 'Spiritual',
        tagline: 'السكون · الترددات · المعنى',
        color: '#2563EB',
        colorAlt: '#4F46E5',
        gradient: 'linear-gradient(145deg, #2563EB 0%, #4F46E5 100%)',
        score: 70,
        delta: +3,
        sectionHref: '/sections/ruhi',
        quickActions: [
            { label: 'الترددات العلاجية', sub: 'موجات شافية',   href: '/frequencies' },
            { label: 'تمارين التنفس',     sub: 'استرخاء عميق',  href: '/breathe'     },
            { label: 'راديو الاسترخاء',   sub: 'موسيقى علاجية', href: '/radio'        },
        ],
    },
    {
        id: 'other',
        slug: 'other',
        emoji: '⚙️',
        name: 'أخرى',
        nameEn: 'Others',
        tagline: 'مواعيدك · خدماتك · إعداداتك',
        color: '#475569',
        colorAlt: '#334155',
        gradient: 'linear-gradient(145deg, #475569 0%, #334155 100%)',
        score: 91,
        delta: 0,
        sectionHref: '/sections/other',
        quickActions: [
            { label: 'احجز موعداً', sub: 'مع الدكتور',   href: '/book-appointment', isNew: true },
            { label: 'رعايتي',      sub: 'خطة علاجك',    href: '/my-care'                       },
            { label: 'الصيدلية',    sub: 'منتجات صحية',  href: '/shop'                           },
        ],
    },
];

/** Map from id → DomainDefinition for O(1) lookup */
export const DOMAIN_BY_ID: Record<string, DomainDefinition> =
    Object.fromEntries(DOMAINS.map(d => [d.id, d]));

/** Overall score across all domains */
export const overallScore = () =>
    Math.round(DOMAINS.reduce((acc, d) => acc + d.score, 0) / DOMAINS.length);
