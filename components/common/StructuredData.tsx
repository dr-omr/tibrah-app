// components/common/StructuredData.tsx
// مكون البيانات المنظمة (JSON-LD) لتحسين SEO
// يساعد Google على فهم المحتوى وعرض Rich Snippets

import Head from 'next/head';

interface OrganizationData {
    name: string;
    description: string;
    url: string;
    logo: string;
    telephone: string;
    email?: string;
    address: {
        country: string;
        region: string;
    };
    sameAs?: string[];
}

interface ServiceData {
    name: string;
    description: string;
    price: string;
    priceCurrency: string;
    duration?: string;
    provider?: string;
}

interface BreadcrumbItem {
    name: string;
    url: string;
}

// بيانات العيادة الأساسية
const CLINIC_DATA: OrganizationData = {
    name: 'طِبرَا - العيادة الرقمية',
    description: 'عيادة رقمية متخصصة في الطب الوظيفي والتكاملي. نعالج الجذور لا الأعراض مع الدكتور عمر العماد.',
    url: 'https://tibrah.com',
    logo: 'https://tibrah.com/logo.png',
    telephone: '+967771447111',
    email: 'dr.omaralemad@gmail.com',
    address: {
        country: 'YE',
        region: 'Yemen',
    },
    sameAs: [
        'https://instagram.com/dr.omr369',
        'https://tiktok.com/@dr.omr369',
        'https://youtube.com/@dr.omr369',
    ],
};

// Schema للعيادة الطبية
function MedicalBusinessSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'MedicalBusiness',
        '@id': `${CLINIC_DATA.url}/#organization`,
        name: CLINIC_DATA.name,
        description: CLINIC_DATA.description,
        url: CLINIC_DATA.url,
        logo: CLINIC_DATA.logo,
        telephone: CLINIC_DATA.telephone,
        email: CLINIC_DATA.email,
        address: {
            '@type': 'PostalAddress',
            addressCountry: CLINIC_DATA.address.country,
            addressRegion: CLINIC_DATA.address.region,
        },
        sameAs: CLINIC_DATA.sameAs,
        medicalSpecialty: ['Functional Medicine', 'Integrative Medicine'],
        priceRange: '$$',
        openingHours: 'Mo-Sa 10:00-20:00',
        availableLanguage: ['Arabic', 'English'],
        // معلومات الطبيب
        employee: {
            '@type': 'Physician',
            name: 'د. عمر العماد',
            jobTitle: 'استشاري الطب الوظيفي والتكاملي',
            description: 'طبيب عام متخصص في الطب الوظيفي والتكاملي، يركز على علاج جذور الأمراض',
            medicalSpecialty: ['Functional Medicine', 'Integrative Medicine'],
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// Schema للخدمة
function ServiceSchema({ service }: { service: ServiceData }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.name,
        description: service.description,
        provider: {
            '@type': 'MedicalBusiness',
            name: service.provider || CLINIC_DATA.name,
        },
        offers: {
            '@type': 'Offer',
            price: service.price,
            priceCurrency: service.priceCurrency,
            availability: 'https://schema.org/InStock',
        },
        ...(service.duration && {
            duration: service.duration,
        }),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// Schema لمسار التنقل (Breadcrumb)
function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// Schema للـ FAQ
function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// المكون الرئيسي
interface StructuredDataProps {
    type: 'organization' | 'service' | 'breadcrumb' | 'faq';
    service?: ServiceData;
    breadcrumbs?: BreadcrumbItem[];
    faqs?: { question: string; answer: string }[];
}

export default function StructuredData({
    type,
    service,
    breadcrumbs,
    faqs,
}: StructuredDataProps) {
    return (
        <Head>
            {type === 'organization' && <MedicalBusinessSchema />}
            {type === 'service' && service && <ServiceSchema service={service} />}
            {type === 'breadcrumb' && breadcrumbs && <BreadcrumbSchema items={breadcrumbs} />}
            {type === 'faq' && faqs && <FAQSchema faqs={faqs} />}
        </Head>
    );
}

// مكون للصفحة الرئيسية (يتضمن بيانات العيادة + الخدمات الرئيسية)
export function HomeStructuredData() {
    const mainServices: ServiceData[] = [
        {
            name: 'الجلسة التشخيصية الشاملة',
            description: 'جلسة شاملة لتحليل التاريخ الصحي وتحديد جذور المشكلة مع خطة علاجية مخصصة',
            price: '35',
            priceCurrency: 'SAR',
            duration: 'PT60M',
        },
        {
            name: 'برنامج المتابعة 21 يوم',
            description: 'برنامج متابعة شامل لإعادة ضبط الجسم وبناء عادات صحية مستدامة',
            price: '200',
            priceCurrency: 'SAR',
            duration: 'P21D',
        },
    ];

    return (
        <Head>
            <MedicalBusinessSchema />
            {mainServices.map((service, idx) => (
                <ServiceSchema key={idx} service={service} />
            ))}
        </Head>
    );
}

// بيانات الخدمات الجاهزة للاستخدام
export const SERVICES_SCHEMA_DATA = {
    diagnostic: {
        name: 'الجلسة التشخيصية الشاملة',
        description: 'جلسة شاملة لتحليل التاريخ الصحي وتحديد جذور المشكلة الصحية مع خطة علاجية مخصصة',
        price: '35',
        priceCurrency: 'SAR',
        duration: 'PT60M',
    },
    program21: {
        name: 'برنامج التحول 21 يوم',
        description: 'برنامج متابعة شامل لإعادة ضبط الجسم وبناء عادات صحية مستدامة مع دعم يومي',
        price: '200',
        priceCurrency: 'SAR',
        duration: 'P21D',
    },
    program90: {
        name: 'برنامج التحول الشامل 90 يوم',
        description: 'رحلة كاملة للتحول الصحي للحالات المزمنة مع متابعة مستمرة',
        price: '500',
        priceCurrency: 'SAR',
        duration: 'P90D',
    },
};
