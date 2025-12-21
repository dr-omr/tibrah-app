// components/common/SEO.tsx
// مكون SEO موحد لتحسين محركات البحث

import Head from 'next/head';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product';
    noIndex?: boolean;
}

const defaultSEO = {
    siteName: 'طِبرَا',
    title: 'طِبرَا - العيادة الرقمية للطب الوظيفي',
    description: 'اكتشف صحتك مع الدكتور عمر العماد - استشاري الطب الوظيفي والتكاملي. جلسات تشخيصية، برامج متابعة، ترددات شفائية، ودورات تعليمية.',
    keywords: 'طب وظيفي, طب تكاملي, صحة, علاج طبيعي, ترددات شفائية, دكتور عمر, طبرا, اليمن',
    image: '/images/og-image.png',
    url: 'https://tibrah.com',
    themeColor: '#2D9B83',
    locale: 'ar_YE',
};

export default function SEO({
    title,
    description,
    keywords,
    image,
    url,
    type = 'website',
    noIndex = false,
}: SEOProps) {
    const pageTitle = title
        ? `${title} | ${defaultSEO.siteName}`
        : defaultSEO.title;

    const pageDescription = description || defaultSEO.description;
    const pageImage = image || defaultSEO.image;
    const pageUrl = url || defaultSEO.url;
    const pageKeywords = keywords || defaultSEO.keywords;

    return (
        <Head>
            {/* Basic Meta Tags */}
            <title>{pageTitle}</title>
            <meta name="description" content={pageDescription} />
            <meta name="keywords" content={pageKeywords} />

            {/* Robots */}
            {noIndex && <meta name="robots" content="noindex, nofollow" />}

            {/* Canonical URL */}
            <link rel="canonical" href={pageUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={defaultSEO.siteName} />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDescription} />
            <meta property="og:image" content={pageImage} />
            <meta property="og:url" content={pageUrl} />
            <meta property="og:locale" content={defaultSEO.locale} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={pageDescription} />
            <meta name="twitter:image" content={pageImage} />

            {/* Additional SEO */}
            <meta name="author" content="د. عمر العماد" />
            <meta name="geo.region" content="YE" />
            <meta name="geo.placename" content="Yemen" />

            {/* Theme Color (already in _document but good for dynamic pages) */}
            <meta name="theme-color" content={defaultSEO.themeColor} />
        </Head>
    );
}

// بيانات SEO مُعدة مسبقاً للصفحات الرئيسية
export const pageSEO = {
    home: {
        title: 'الصفحة الرئيسية',
        description: 'عيادتك الرقمية للطب الوظيفي - نفهم جسمك ونعالج الجذور مع الدكتور عمر العماد.',
    },
    services: {
        title: 'خدماتنا',
        description: 'اكتشف خدمات طِبرَا: جلسات تشخيصية، برامج متابعة شاملة، واستشارات طب وظيفي مع خصم 90% على جميع الخدمات.',
    },
    bookAppointment: {
        title: 'حجز موعد',
        description: 'احجز جلستك التشخيصية مع الدكتور عمر العماد - استشاري الطب الوظيفي. جلسات أونلاين مع خصم إطلاق 90%.',
    },
    bodyMap: {
        title: 'خريطة الجسم',
        description: 'اكتشف الطب الشعوري - كيف تؤثر مشاعرك على صحتك وكيف يمكنك علاج الجذور النفسية للأمراض.',
    },
    healthTracker: {
        title: 'متتبع الصحة',
        description: 'تتبع صحتك اليومية: الماء، النوم، الطاقة، والأعراض. احصل على تحليل ذكي لحالتك الصحية.',
    },
    frequencies: {
        title: 'الترددات الشفائية',
        description: 'اكتشف قوة الترددات الشفائية (Rife Frequencies) - علاج بالصوت لمختلف الحالات الصحية.',
    },
    courses: {
        title: 'الدورات التعليمية',
        description: 'تعلم الطب الوظيفي مع دورات احترافية من الدكتور عمر العماد.',
    },
    shop: {
        title: 'المتجر',
        description: 'تسوق منتجات صحية موثوقة: مكملات غذائية، أجهزة ترددات، وكتب طبية.',
    },
    profile: {
        title: 'الملف الشخصي',
        description: 'إدارة حسابك وبياناتك الصحية في طِبرَا.',
        noIndex: true,
    },
};
