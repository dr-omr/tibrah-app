// data/home-data.ts
// البيانات المستخرجة من مكونات الصفحة الرئيسية
// لتسهيل الصيانة والتحديث بدون تعديل كود الواجهة

import {
    Stethoscope, Calendar, Radio, BookOpen,
    MessageCircle, Gift, Play, BookOpen as BookIcon,
    LucideIcon
} from 'lucide-react';

// ================================
// بيانات الدكتور
// ================================

export const DOCTOR_DATA = {
    name: 'د. عمر العماد',
    title: 'استشاري الطب الوظيفي والتكاملي',
    education: 'خريج كلية الطب - جامعة صنعاء',
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69287e726ff0e068617e81b7/9185440e5_omar.jpg',
    bio: 'يا حياك الله.. أنا هنا عشان أساعدك تفهم جسمك صح، ونعالج المشكلة من جذورها مش بس نسكن الوجع. خبرتي في الطب الوظيفي والترددات الشفائية كلها تحت أمرك عشان ترجع لك عافيتك بإذن الله.',
    philosophy: 'علاج السبب الجذري وليس الأعراض فقط',
    vision: 'أساعدك تفهم جسمك وتتعافى بشكل حقيقي',

    // التواصل
    contact: {
        whatsapp: '967771447111',
        email: 'dr.omaralemad@gmail.com',
    },

    // السوشيال ميديا
    social: {
        instagram: 'dr.omr369',
        tiktok: 'dr.omr369',
        youtube: 'dr.omr369',
    },

    // الإحصائيات
    stats: {
        contentHours: '2000+',
        patients: '300+',
        successRate: '87%',
    },
};

// ================================
// بيانات الخدمات
// ================================

export interface ServiceData {
    id: string;
    icon: LucideIcon;
    titleYemeni: string;
    titleArabic: string;
    description: string;
    longDescription: string;
    features: string[];
    originalPrice?: string;
    promoPrice?: string;
    currency?: string;
    duration?: string;
    gradient: string;
    bgGradient: string;
    shadowColor: string;
    page: string;
    badge?: string;
    badgeColor?: string;
    isNew?: boolean;
    cta: string;
    ctaIcon: LucideIcon;
}

export const SERVICES_DATA: ServiceData[] = [
    {
        id: 'diagnostic',
        icon: Stethoscope,
        titleYemeni: 'أبسر وش عندك',
        titleArabic: 'الجلسة التشخيصية',
        description: 'نشوف السبب الحقيقي مش الظاهر بس',
        longDescription: 'جلسة شاملة نفهم فيها جسمك ونحدد جذور المشكلة الصحية',
        features: ['تحليل شامل', 'خطة علاجية', 'متابعة فورية'],
        originalPrice: '350',
        promoPrice: '35',
        currency: 'ر.س',
        duration: '45-60 دقيقة',
        gradient: 'from-primary to-primary-light',
        bgGradient: 'from-primary/10 to-primary-light/10',
        shadowColor: 'shadow-emerald-200/50',
        page: 'BookAppointment',
        badge: 'عرض إطلاق',
        badgeColor: 'bg-red-500',
        cta: 'احجز الآن',
        ctaIcon: MessageCircle,
    },
    {
        id: 'programs',
        icon: Calendar,
        titleYemeni: 'نمشي معك خطوة خطوة',
        titleArabic: 'برامج المتابعة',
        description: 'متابعة يومية حتى تتعافى بإذن الله',
        longDescription: 'رفقة كاملة في رحلة التعافي - مش بس وصفة وخلاص',
        features: ['متابعة 24/7', 'خطة مخصصة', 'دعم مستمر'],
        badge: '3 أيام مجانية',
        badgeColor: 'bg-amber-500',
        gradient: 'from-purple-500 to-pink-500',
        bgGradient: 'from-purple-500/10 to-pink-500/10',
        shadowColor: 'shadow-purple-200/50',
        page: 'Services',
        cta: 'جرب مجاناً',
        ctaIcon: Gift,
    },
    {
        id: 'frequencies',
        icon: Radio,
        titleYemeni: 'صيدلية الروح',
        titleArabic: 'مكتبة الترددات',
        description: 'ترددات شفائية مجانية لجسمك وروحك',
        longDescription: 'أكثر من 50 تردد علاجي للنوم والاسترخاء والشفاء',
        features: ['متجددة دائماً', 'مجانية 100%', 'بدون إعلانات'],
        badge: 'مجانية',
        badgeColor: 'bg-blue-500',
        gradient: 'from-blue-500 to-cyan-500',
        bgGradient: 'from-blue-500/10 to-cyan-500/10',
        shadowColor: 'shadow-blue-200/50',
        page: 'Frequencies',
        cta: 'استمع الآن',
        ctaIcon: Play,
    },
    {
        id: 'courses',
        icon: BookOpen,
        titleYemeni: 'تعلم وافهم جسمك',
        titleArabic: 'الدورات التعليمية',
        description: 'علم حقيقي ينفعك مش كلام فاضي',
        longDescription: 'دورات من الصفر تخليك تفهم جسمك وكيف تحافظ عليه',
        features: ['محتوى حصري', 'شهادات', 'وصول مدى الحياة'],
        badge: 'جديد',
        badgeColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
        isNew: true,
        gradient: 'from-amber-500 to-orange-500',
        bgGradient: 'from-amber-500/10 to-orange-500/10',
        shadowColor: 'shadow-amber-200/50',
        page: 'Courses',
        cta: 'تصفح الدورات',
        ctaIcon: BookIcon,
    },
];

// ================================
// بيانات البرامج العلاجية
// ================================

export interface ProgramData {
    id: string;
    title: string;
    duration: string;
    slogan: string;
    icon: string;
    description: string;
    features: string[];
    color: string;
    bgColor: string;
    popular?: boolean;
    cta?: string;
}

export const PROGRAMS_DATA: ProgramData[] = [
    {
        id: 'weekly',
        title: 'برنامج الأسبوع',
        duration: '7 أيام',
        slogan: '7 Days Transformation',
        icon: '📅',
        description: 'مناسب للحالات البسيطة أو لمن يريد تحسين جانب معين بسرعة (مثل: تحسين الهضم، النوم، الطاقة).',
        features: [
            'خطة غذائية مخصصة لمدة أسبوع',
            'توصيات يومية عبر WhatsApp',
            'متابعة يومية للتقدم',
            'تعديلات فورية عند الحاجة'
        ],
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'from-blue-500/10 to-cyan-500/10'
    },
    {
        id: '21_days',
        title: 'برنامج ال21 يوم',
        duration: '21 يوماً',
        slogan: '3 Weeks Reset',
        icon: '🌱',
        popular: true,
        description: 'البرنامج المثالي لإعادة ضبط الجسم وبناء عادات صحية مستدامة. 21 يوم كافية لتغيير حقيقي يدوم.',
        features: [
            'خطة غذائية وعلاجية متكاملة',
            '3 جلسات متابعة (أسبوعياً)',
            'دعم يومي عبر WhatsApp',
            'تقييم شامل في نهاية البرنامج',
            'محتوى تعليمي مخصص'
        ],
        color: 'from-primary to-primary-light',
        bgColor: 'from-primary/10 to-primary-light/10',
        cta: 'ابدأ التحول الحقيقي'
    },
    {
        id: '3_months',
        title: 'برنامج ال3 أشهر',
        duration: '90 يوماً',
        slogan: '90 Days Complete Transformation',
        icon: '🚀',
        description: 'التحول الشامل - للحالات المزمنة والمعقدة. رحلة كاملة نمشيها سوياً حتى تصل لصحة مستدامة بإذن الله.',
        features: [
            'برنامج علاجي شامل ومتدرج',
            '8-10 جلسات متابعة',
            'دعم مستمر طوال الفترة',
            'تحليل دوري للتقدم',
            'خطة صيانة بعد انتهاء البرنامج',
            'أولوية في الرد والمتابعة'
        ],
        color: 'from-[#D4AF37] to-[#F4D03F]',
        bgColor: 'from-[#D4AF37]/10 to-[#F4D03F]/10',
        cta: 'معك للنهاية ←'
    }
];

// ================================
// روابط مساعدة
// ================================

export const WHATSAPP_LINKS = {
    booking: `https://wa.me/${DOCTOR_DATA.contact.whatsapp}?text=مرحباً%20د.%20عمر،%20أريد%20حجز%20جلسة%20تشخيصية`,
    support: `https://wa.me/${DOCTOR_DATA.contact.whatsapp}?text=مرحباً%20د.%20عمر،%20عندي%20استفسار`,
    programs: `https://wa.me/${DOCTOR_DATA.contact.whatsapp}?text=مرحباً%20د.%20عمر،%20أريد%20الانضمام%20لبرنامج%20المتابعة`,
};

export const SOCIAL_LINKS = {
    instagram: `https://instagram.com/${DOCTOR_DATA.social.instagram}`,
    tiktok: `https://tiktok.com/@${DOCTOR_DATA.social.tiktok}`,
    youtube: `https://youtube.com/@${DOCTOR_DATA.social.youtube}`,
};
