/**
 * PageSEO — Dynamic SEO meta tags for each page
 * Generates proper title, description, OG tags for social sharing
 */

import Head from 'next/head';

interface PageSEOProps {
    title: string;
    description?: string;
    path?: string;
    image?: string;
    noIndex?: boolean;
}

const BASE_URL = 'https://tibrah.com';
const DEFAULT_IMAGE = '/og-image.png';
const SITE_NAME = 'طِبرَا — العيادة الرقمية';

export default function PageSEO({
    title,
    description = 'طِبرَا — عيادتك الرقمية المتكاملة. متابعة صحية ذكية، استشارات طبية، ومنتجات صحية.',
    path = '',
    image = DEFAULT_IMAGE,
    noIndex = false,
}: PageSEOProps) {
    const fullTitle = `${title} | ${SITE_NAME}`;
    const url = `${BASE_URL}${path}`;

    return (
        <Head>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />

            {/* Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={image.startsWith('http') ? image : `${BASE_URL}${image}`} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="ar_SA" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image.startsWith('http') ? image : `${BASE_URL}${image}`} />

            {/* Canonical */}
            <link rel="canonical" href={url} />

            {/* No Index */}
            {noIndex && <meta name="robots" content="noindex, nofollow" />}

            {/* PWA */}
            <meta name="application-name" content="طِبرَا" />
            <meta name="apple-mobile-web-app-title" content="طِبرَا" />

            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'WebApplication',
                        name: 'طِبرَا',
                        url: BASE_URL,
                        description,
                        applicationCategory: 'HealthApplication',
                        operatingSystem: 'Web',
                        offers: {
                            '@type': 'Offer',
                            price: '0',
                            priceCurrency: 'SAR',
                        },
                    }),
                }}
            />
        </Head>
    );
}

/** Pre-built SEO configs for common pages */
export const pageSEOConfigs: Record<string, Omit<PageSEOProps, 'title'> & { title: string }> = {
    home: {
        title: 'الرئيسية',
        description: 'طِبرَا — عيادتك الرقمية المتكاملة. متابعة صحية ذكية بالذكاء الاصطناعي.',
        path: '/',
    },
    shop: {
        title: 'المتجر',
        description: 'مكملات غذائية ومنتجات صحية معتمدة. فيتامينات، بروبيوتيك، ومستحضرات طبيعية.',
        path: '/shop',
    },
    healthTracker: {
        title: 'المتابع الصحي',
        description: 'تتبع شرب الماء، النوم، الوزن، والمزاج يومياً مع تحليلات ذكية.',
        path: '/health-tracker',
    },
    courses: {
        title: 'الدورات التعليمية',
        description: 'تعلم عن الطب الوظيفي، التغذية العلاجية، والصحة الشمولية مع دورات متخصصة.',
        path: '/courses',
    },
    library: {
        title: 'المكتبة الصحية',
        description: 'مقالات ودراسات في الطب الشمولي، التغذية، الأعشاب، والطاقة.',
        path: '/library',
    },
    bookAppointment: {
        title: 'حجز موعد',
        description: 'احجز استشارة طب وظيفي أو جلسة علاج بالترددات مع د. عمر العماد.',
        path: '/book-appointment',
    },
    services: {
        title: 'خدماتنا',
        description: 'استشارات طب وظيفي، علاج بالترددات، ومتابعة دورية مع د. عمر العماد.',
        path: '/services',
    },
    about: {
        title: 'من نحن',
        description: 'تعرف على طِبرَا ورؤيتنا في الطب الشمولي والعيادة الرقمية.',
        path: '/about',
    },
    mealPlanner: {
        title: 'تخطيط الوجبات',
        description: 'خطة غذائية مخصصة مع حساب السعرات والبروتين والدهون والكربوهيدرات.',
        path: '/meal-planner',
    },
};
