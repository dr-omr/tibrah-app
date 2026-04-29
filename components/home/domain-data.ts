/**
 * domain-data.ts — طِبرَا 4-Domain Data Source
 * ─────────────────────────────────────────────
 * Single source of truth for the 4 healing domains.
 *
 *   جسدي → نفسي → فكري → روحي
 *
 * Each domain card links to /sections/[slug]
 * Score & delta are pulled from real health dashboard.
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
    name: string;       // Arabic
    nameEn: string;     // English
    tagline: string;    // Arabic tagline
    color: string;      // Primary hex
    colorAlt: string;   // Accent hex
    gradient: string;   // CSS gradient
    score: number;      // 0–100 (static fallback; real score from healthDashboard)
    delta: number;      // +/- monthly change
    sectionHref: string;
    quickActions: DomainQuickAction[];
    /* New richness fields */
    stats: { services: number; programs: number; tools: number };
    readinessLabel: string;  // e.g. 'ممتاز' | 'يحتاج عناية'
}

export const DOMAINS: DomainDefinition[] = [
    /* ──────────────────────────────── جسدي ─── */
    {
        id: 'jasadi',
        slug: 'jasadi',
        emoji: '🫀',
        name: 'جسدي',
        nameEn: 'Physical',
        tagline: 'التشخيص · الحركة · التغذية · النوم',
        color: '#0891B2',
        colorAlt: '#0E7490',
        gradient: 'linear-gradient(145deg, #0891B2 0%, #0E7490 100%)',
        score: 78,
        delta: +5,
        sectionHref: '/sections/jasadi',
        quickActions: [
            { label: 'مدقق الأعراض',  sub: 'محرك سريري AI',     href: '/symptom-checker',  isNew: true },
            { label: 'السجل اليومي',   sub: 'دوّن يومك الصحي',   href: '/daily-log'                     },
            { label: 'الحركة العلاجية', sub: 'رياضة حسب حالتك',  href: '/programs/movement'             },
            { label: 'النوم العلاجي',  sub: 'بروتوكولات النوم',  href: '/programs/sleep'                },
        ],
        stats: { services: 6, programs: 6, tools: 5 },
        readinessLabel: 'جيد',
    },
    /* ──────────────────────────────── نفسي ─── */
    {
        id: 'nafsi',
        slug: 'nafsi',
        emoji: '🧠',
        name: 'نفسي',
        nameEn: 'Psychological',
        tagline: 'التشخيص · المشاعر · العلاقات · التحرر',
        color: '#7C3AED',
        colorAlt: '#6D28D9',
        gradient: 'linear-gradient(145deg, #7C3AED 0%, #6D28D9 100%)',
        score: 62,
        delta: -2,
        sectionHref: '/sections/nafsi',
        quickActions: [
            { label: 'الطب الشعوري',  sub: 'تقييم نفسي عميق',    href: '/emotional-medicine', isNew: true },
            { label: 'تحرير المشاعر', sub: 'الخوف · الغضب · الحزن', href: '/programs/emotions/fear'      },
            { label: 'النفس–جسد',     sub: 'مشاعرك في جسدك',      href: '/programs/mind-body'           },
            { label: 'صحة العائلة',   sub: 'إدارة ذويك',           href: '/family'                       },
        ],
        stats: { services: 7, programs: 6, tools: 4 },
        readinessLabel: 'يحتاج عناية',
    },
    /* ──────────────────────────────── فكري ─── */
    {
        id: 'fikri',
        slug: 'fikri',
        emoji: '📚',
        name: 'فكري',
        nameEn: 'Intellectual',
        tagline: 'المعتقدات · هندسة النجاح · مكتبة البصيرة',
        color: '#D97706',
        colorAlt: '#EA580C',
        gradient: 'linear-gradient(145deg, #D97706 0%, #EA580C 100%)',
        score: 85,
        delta: +12,
        sectionHref: '/sections/fikri',
        quickActions: [
            { label: 'المعتقدات المحدِّدة', sub: 'اكسر القيود الخفية', href: '/assess/beliefs'           },
            { label: 'هندسة النجاح',         sub: 'أهداف + عادات + هوية', href: '/programs/success-engineering' },
            { label: 'مكتبة البصيرة',        sub: 'كتب · مقالات · ملخصات', href: '/library'             },
            { label: 'التخطيط الأسبوعي',     sub: 'خطة أسبوعك المتكاملة',  href: '/tools/weekly-plan'   },
        ],
        stats: { services: 5, programs: 4, tools: 5 },
        readinessLabel: 'ممتاز',
    },
    /* ──────────────────────────────── روحي ─── */
    {
        id: 'ruhi',
        slug: 'ruhi',
        emoji: '✨',
        name: 'روحي',
        nameEn: 'Spiritual',
        tagline: 'السكون · الترددات · المعنى · الطقوس',
        color: '#2563EB',
        colorAlt: '#4F46E5',
        gradient: 'linear-gradient(145deg, #2563EB 0%, #4F46E5 100%)',
        score: 70,
        delta: +3,
        sectionHref: '/sections/ruhi',
        quickActions: [
            { label: 'الترددات العلاجية', sub: 'جلسات صوت مباشرة',   href: '/frequencies'              },
            { label: 'تمارين التنفس',     sub: 'سكون 5 دقائق فقط',   href: '/breathe'                  },
            { label: 'راديو الاسترخاء',   sub: 'موسيقى علاجية',       href: '/radio'                    },
            { label: 'اتزاني الداخلي',    sub: 'تقييم روحي شامل',     href: '/assess/inner-balance'     },
        ],
        stats: { services: 4, programs: 4, tools: 4 },
        readinessLabel: 'جيد',
    },
];

/** Map from id → DomainDefinition for O(1) lookup */
export const DOMAIN_BY_ID: Record<string, DomainDefinition> =
    Object.fromEntries(DOMAINS.map(d => [d.id, d]));
