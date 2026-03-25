export const doctorInfo = {
    name: 'د. عمر العماد',
    title: 'طبيب عام - خبير الطب الوظيفي',
    education: 'خريج كلية الطب - جامعة صنعاء',
    vision: 'أساعدك تفهم جسمك وتتعافى بشكل حقيقي',
    philosophy: 'علاج السبب الجذري وليس الأعراض فقط',
    whatsapp: '967771447111',
    instagram: 'dr.omr369',
    tiktok: 'dr.omr369',
    youtube: 'dr.omr369',
    stats: {
        content_hours: '200+',
        patients: '300+',
        success_rate: '87%'
    }
};

export const mainService = {
    title: 'الجلسة التشخيصية الشاملة',
    duration: '45-60 دقيقة',
    price_yer: '300',
    price_sar: '2.5',
    features: [
        'مراجعة شاملة للتاريخ الصحي',
        'تحليل الأعراض بنهج الطب الوظيفي',
        'خطة علاجية أولية مخصصة',
        'توصيات للتحاليل (إن لزم)'
    ]
};

export const programs = [
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

export const comparisons = [
    { feature: 'مدة الاستشارة', doctor: '45-60 دقيقة', traditional: '10-15 دقيقة' },
    { feature: 'النهج العلاجي', doctor: 'علاج السبب الجذري', traditional: 'علاج الأعراض فقط' },
    { feature: 'المتابعة', doctor: 'دعم مباشر عبر WhatsApp', traditional: 'مواعيد متباعدة' },
    { feature: 'الخطة العلاجية', doctor: 'مخصصة 100% لحالتك', traditional: 'Protocols عامة' },
    { feature: 'المحتوى التعليمي', doctor: 'محتوى مجاني مستمر', traditional: 'غير متوفر' },
];

export const whatsappLink = `https://wa.me/${doctorInfo.whatsapp}?text=مرحباً%20د.%20عمر،%20أريد%20حجز%20جلسة%20تشخيصية`;
