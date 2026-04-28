import {
    Search, X, Clock, Compass, Sparkles, Activity,
    BookOpen, Settings, Package, FileText, ShoppingBag,
    Calendar, Heart, Brain, Zap, Stethoscope, ArrowUpRight
} from 'lucide-react';

export interface SearchItem {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    href: string;
    category: 'pages' | 'health' | 'tools' | 'content' | 'pharmacy' | 'library';
    keywords: string[];
    color: string;
    badge?: string;
}

export const staticIndex: SearchItem[] = [
    // === Pages ===
    { id: 'home', title: 'الصفحة الرئيسية', description: 'العودة للصفحة الرئيسية', icon: Compass, href: '/home', category: 'pages', keywords: ['رئيسية', 'home', 'بداية'], color: '#2D9B83' },
    { id: 'services', title: 'خدماتنا', description: 'تصفح جميع خدمات طِبرَا', icon: Sparkles, href: '/services', category: 'pages', keywords: ['خدمات', 'services', 'برامج'], color: '#8B5CF6', badge: 'جديد' },
    { id: 'about', title: 'من نحن', description: 'تعرف على د. عمرو وطِبرَا', icon: Heart, href: '/about', category: 'pages', keywords: ['عنا', 'about', 'دكتور', 'عمرو'], color: '#2D9B83' },
    { id: 'premium', title: 'الباقة المميزة', description: 'ترقية حسابك للميزات المتقدمة', icon: Sparkles, href: '/premium', category: 'pages', keywords: ['ترقية', 'مميز', 'premium', 'اشتراك'], color: '#F59E0B' },
    { id: 'profile', title: 'الملف الشخصي', description: 'تعديل بياناتك', icon: Settings, href: '/profile', category: 'pages', keywords: ['حساب', 'ملف', 'profile', 'بيانات'], color: '#64748B' },

    // === Health Tools ===
    { id: 'tayyibat', title: 'نظام الطيبات الغذائي', description: 'النظام الغذائي الصحي الكامل', icon: Activity, href: '/tayyibat', category: 'health', keywords: ['طيبات', 'غذاء', 'tayyibat', 'أكل', 'طعام', 'حمية', 'صحي'], color: '#10B981', badge: '⭐' },
    { id: 'tayyibat-tracker', title: 'متتبع الطيبات', description: 'سجّل وجباتك اليومية', icon: Calendar, href: '/tayyibat/tracker', category: 'health', keywords: ['يوميات', 'وجبات', 'سجل', 'daily', 'تسجيل', 'متتبع'], color: '#14B8A6' },
    { id: 'tayyibat-assessment', title: 'تقييم الطيبات', description: 'اكتشف مستوى التزامك الغذائي', icon: Activity, href: '/tayyibat/assessment', category: 'health', keywords: ['تقييم', 'التزام', 'طيبات', 'غذائي', 'نتيجة'], color: '#7C3AED' },
    { id: 'health-tracker', title: 'متابعة الصحة', description: 'نوم، ماء، دواء، لياقة، وزن — كل مؤشراتك', icon: Activity, href: '/health-tracker', category: 'health', keywords: ['صحة', 'تتبع', 'health', 'tracker', 'نوم', 'ماء', 'وزن', 'لياقة'], color: '#2563EB', badge: '⭐' },
    { id: 'record-health', title: 'تسجيل المؤشرات الحيوية', description: 'تسجيل السكر، الضغط، والنبض', icon: Activity, href: '/record-health', category: 'health', keywords: ['سكر', 'ضغط', 'قياس', 'مؤشرات'], color: '#F43F5E' },

    { id: 'quick-check-in', title: 'الفحص السريع', description: 'التقييم اليومي لحالتك', icon: Brain, href: '/quick-check-in', category: 'health', keywords: ['فحص', 'سريع', 'check'], color: '#0EA5E9' },
    { id: 'medical-file', title: 'ملفي الطبي', description: 'بياناتك الصحية في مكان واحد', icon: FileText, href: '/medical-file', category: 'health', keywords: ['ملف', 'طبي', 'medical', 'سجل', 'بيانات'], color: '#3B82F6' },

    { id: 'my-care', title: 'خطة العناية', description: 'برنامجك العلاجي الشامل', icon: Heart, href: '/my-care', category: 'health', keywords: ['عناية', 'خطة', 'care', 'علاج'], color: '#8B5CF6' },
    { id: 'symptom-analysis', title: 'تحليل الأعراض', description: 'تحليل ذكي لأعراضك الصحية', icon: Stethoscope, href: '/symptom-analysis', category: 'health', keywords: ['أعراض', 'تحليل', 'symptom', 'تشخيص', 'مرض'], color: '#EF4444' },
    { id: 'body-map', title: 'خريطة الجسم', description: 'حدد مكان الألم بدقة', icon: Heart, href: '/body-map', category: 'health', keywords: ['جسم', 'body', 'ألم', 'map', 'خريطة'], color: '#F43F5E' },
    { id: 'face-scan', title: 'فحص الوجه', description: 'تحليل البشرة بالذكاء الاصطناعي', icon: Zap, href: '/diagnosis/face-scan', category: 'health', keywords: ['وجه', 'face', 'بشرة', 'فحص', 'scan'], color: '#A855F7' },

    // === Treatment Tools ===
    { id: 'breathe', title: 'تمارين التنفس', description: 'تمارين استرخاء وتنفس عميق', icon: Brain, href: '/breathe', category: 'tools', keywords: ['تنفس', 'breathe', 'استرخاء', 'تأمل', 'هدوء'], color: '#6366F1' },
    { id: 'meditation', title: 'التأمل', description: 'جلسات تأمل واستقرار ذهني', icon: Brain, href: '/meditation', category: 'tools', keywords: ['تأمل', 'meditation', 'هدوء', 'استرخاء'], color: '#A855F7' },
    { id: 'frequencies', title: 'الترددات العلاجية', description: 'ترددات شفائية للجسم والروح', icon: Activity, href: '/frequencies', category: 'tools', keywords: ['ترددات', 'frequencies', 'علاج', 'صوت'], color: '#0EA5E9' },
    { id: 'rife-frequencies', title: 'ترددات رايف الموجية', description: 'موجات علاجية متقدمة', icon: Zap, href: '/rife-frequencies', category: 'tools', keywords: ['رايف', 'rife', 'ترددات', 'موجات'], color: '#06B6D4' },
    { id: 'radio', title: 'راديو الشفاء', description: 'بث مستمر للترددات والقرآن', icon: Activity, href: '/radio', category: 'tools', keywords: ['راديو', 'بث', 'قرآن', 'صوت'], color: '#3B82F6' },
    { id: 'emotional', title: 'الطب العاطفي', description: 'علاج المشاعر والعواطف', icon: Heart, href: '/emotional-medicine', category: 'tools', keywords: ['عاطفي', 'emotional', 'مشاعر', 'نفسي'], color: '#EC4899' },

    // === Content ===
    { id: 'shop-main', title: 'الصيدلية والمكملات', description: 'تصفح جميع المنتجات والمكملات', icon: ShoppingBag, href: '/shop', category: 'pharmacy', keywords: ['متجر', 'shop', 'منتجات', 'شراء', 'مكملات', 'صيدلية', 'علاج'], color: '#EC4899' },
    { id: 'smart-pharmacy', title: 'الصيدلية الذكية', description: 'اقتراحات الأدوية الذكية', icon: Settings, href: '/smart-pharmacy', category: 'pharmacy', keywords: ['صيدلية', 'ذكية', 'أدوية', 'pharmacy'], color: '#10B981' },
    { id: 'book-appointment', title: 'حجز موعد', description: 'احجز استشارتك الآن', icon: Calendar, href: '/book-appointment', category: 'content', keywords: ['حجز', 'موعد', 'appointment', 'استشارة', 'book'], color: '#2D9B83', badge: '🏥' },
    { id: 'my-appointments', title: 'مواعيدي', description: 'إدارة مواعيدك السابقة والقادمة', icon: Calendar, href: '/my-appointments', category: 'content', keywords: ['مواعيدي', 'مواعيد', 'appointments', 'استشارات'], color: '#6366F1' },
    { id: 'courses', title: 'الدورات التعليمية', description: 'دورات صحية وتطويرية', icon: BookOpen, href: '/courses', category: 'content', keywords: ['دورات', 'courses', 'تعلم', 'تعليم'], color: '#F59E0B' },
    { id: 'rewards', title: 'المكافآت', description: 'نقاطك ومكافآتك', icon: Sparkles, href: '/rewards', category: 'content', keywords: ['مكافآت', 'rewards', 'نقاط', 'جوائز'], color: '#F59E0B' },
    { id: 'settings', title: 'الإعدادات', description: 'إعدادات التطبيق', icon: Settings, href: '/settings', category: 'pages', keywords: ['إعدادات', 'settings', 'ضبط'], color: '#64748B' },
    { id: 'more', title: 'المزيد', description: 'خيارات التطبيق الإضافية', icon: Compass, href: '/more', category: 'pages', keywords: ['مزيد', 'more', 'خيارات'], color: '#94A3B8' },
];
