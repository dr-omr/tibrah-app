// components/navigation/header-menu-data.ts
// ════════════════════════════════════════════════════════════════════
// TIBRAH — HeaderMenu Static Data: pages, sections, quick actions
// ════════════════════════════════════════════════════════════════════

import {
    Settings, ShoppingBag, Gift, HelpCircle, Info,
    LogIn, User, Heart, Radio, Crown,
    Utensils, Wind, Sparkles, Activity, GraduationCap,
    HeartPulse, Calendar, Brain, FileText, Stethoscope,
    Pill, ClipboardList, Zap, BookOpen, Users, Music2,
    BarChart3, ScanLine, Microscope, Play, Search, Smile,
} from 'lucide-react';

export interface AppItem {
    href: string; label: string; sub: string;
    icon: React.ElementType; color: string; bg: string;
    section: string; badge?: string; isNew?: boolean;
}

export const ALL: AppItem[] = [
    /* ── جسدي */
    { href:'/sections/jasadi',     label:'قسم جسدي — نظرة عامة',       sub:'كل ما يخص صحة جسدك',              icon:Stethoscope,  color:'#0D9488', bg:'rgba(13,148,136,0.10)',  section:'جسدي', badge:'📋 قسم' },
    { href:'/symptom-checker',     label:'مدقق الأعراض الذكي',          sub:'استبيان SOCRATES إكلينيكي',       icon:Brain,        color:'#7C3AED', bg:'rgba(124,58,237,0.09)',  section:'جسدي', isNew:true },
    { href:'/body-map',            label:'خريطة الجسم',                 sub:'حدد موقع الألم بدقة',             icon:Stethoscope,  color:'#E11D48', bg:'rgba(225,29,72,0.08)',   section:'جسدي', badge:'متقدم' },
    { href:'/symptom-analysis',    label:'تحليل الأعراض بـ AI',         sub:'تقييم فوري بالذكاء الاصطناعي',   icon:Microscope,   color:'#2563EB', bg:'rgba(37,99,235,0.09)',   section:'جسدي' },
    { href:'/quick-check-in',      label:'الفحص السريع',                sub:'كيف تشعر الآن؟ (٢ دقيقة)',        icon:Zap,          color:'#D97706', bg:'rgba(217,119,6,0.09)',   section:'جسدي' },
    { href:'/diagnosis/face-scan', label:'مسح الوجه الذكي',             sub:'تشخيص بصري بالكاميرا',            icon:ScanLine,     color:'#0891B2', bg:'rgba(8,145,178,0.09)',   section:'جسدي', isNew:true },
    { href:'/intake',              label:'الاستبيان الأولي',            sub:'تقييم شامل لحالتك الصحية',        icon:ScanLine,     color:'#2563EB', bg:'rgba(37,99,235,0.09)',   section:'جسدي', isNew:true },
    { href:'/medical-history',     label:'التاريخ الطبي',               sub:'كل حالاتك الصحية السابقة',        icon:ClipboardList, color:'#7C3AED', bg:'rgba(124,58,237,0.09)', section:'جسدي' },
    { href:'/health-report',       label:'التقرير الصحي الشامل',        sub:'تحليل دوري + توصيات PDF',         icon:BarChart3,    color:'#0D9488', bg:'rgba(13,148,136,0.10)',  section:'جسدي' },
    { href:'/tayyibat',           label:'نظام الطيبات',                sub:'النظام الغذائي الصحي الكامل',    icon:Utensils,     color:'#059669', bg:'rgba(5,150,105,0.09)',   section:'جسدي', isNew:true },
    { href:'/tayyibat/tracker',    label:'متتبع الطيبات',               sub:'سجّل وجباتك اليومية',            icon:ClipboardList, color:'#0D9488', bg:'rgba(13,148,136,0.09)', section:'جسدي' },
    { href:'/tayyibat/assessment', label:'تقييم الطيبات',               sub:'اكتشف مستوى التزامك الغذائي',   icon:Activity,     color:'#7C3AED', bg:'rgba(124,58,237,0.09)', section:'جسدي' },
    { href:'/smart-pharmacy',      label:'الصيدلية الذكية',             sub:'وصفات ومكملات بتوصية طبية',       icon:Pill,         color:'#0D9488', bg:'rgba(13,148,136,0.10)',  section:'جسدي' },
    { href:'/health-tracker',      label:'متابعة الصحة',                sub:'نوم، ماء، دواء، لياقة، وزن',      icon:Activity,     color:'#2563EB', bg:'rgba(37,99,235,0.09)',   section:'جسدي' },
    { href:'/record-health',       label:'تسجيل القراءات',              sub:'وزن، ضغط، سكر، ترطيب',           icon:Activity,     color:'#0891B2', bg:'rgba(8,145,178,0.09)',   section:'جسدي' },

    /* ── نفسي */
    { href:'/sections/nafsi',      label:'قسم نفسي — نظرة عامة',        sub:'كل ما يخص صحتك النفسية',          icon:Heart,        color:'#7C3AED', bg:'rgba(124,58,237,0.09)', section:'نفسي', badge:'📋 قسم' },
    { href:'/emotional-medicine',  label:'الطب الشعوري',                sub:'صحتك النفسية والعاطفية',          icon:Heart,        color:'#E11D48', bg:'rgba(225,29,72,0.08)',   section:'نفسي' },
    { href:'/family',              label:'صحة العائلة',                 sub:'إدارة صحة وعلاقات أفراد عائلتك', icon:Users,        color:'#E11D48', bg:'rgba(225,29,72,0.08)',   section:'نفسي' },
    /* ── فكري */
    { href:'/sections/fikri',      label:'قسم فكري — نظرة عامة',        sub:'كل ما يخص تطورك الفكري',          icon:GraduationCap,color:'#D97706', bg:'rgba(217,119,6,0.09)',  section:'فكري', badge:'📋 قسم' },
    { href:'/library',             label:'المكتبة الصحية',              sub:'مقالات ومراجع علمية موثوقة',      icon:BookOpen,     color:'#059669', bg:'rgba(5,150,105,0.09)',   section:'فكري' },
    { href:'/glass-library',       label:'Glass Library',               sub:'تجربة قراءة غامرة ومميزة',        icon:BookOpen,     color:'#0891B2', bg:'rgba(8,145,178,0.09)',   section:'فكري' },
    { href:'/courses',             label:'الدورات الطبية',              sub:'تعلم من خبراء الطب الوظيفي',     icon:GraduationCap, color:'#EA580C', bg:'rgba(234,88,12,0.09)', section:'فكري' },
    /* ── روحي */
    { href:'/sections/ruhi',       label:'قسم روحي — نظرة عامة',        sub:'كل ما يخص سلامتك الروحية',        icon:Sparkles,     color:'#2563EB', bg:'rgba(37,99,235,0.09)',  section:'روحي', badge:'📋 قسم' },
    { href:'/frequencies',         label:'الترددات العلاجية',           sub:'علاج تكميلي بالموجات الصوتية',    icon:Radio,        color:'#4F46E5', bg:'rgba(79,70,229,0.09)',   section:'روحي' },
    { href:'/rife-frequencies',    label:'ترددات رايف',                 sub:'بروتوكولات RIFE المتخصصة',        icon:Music2,       color:'#7C3AED', bg:'rgba(124,58,237,0.09)',  section:'روحي' },
    { href:'/radio',               label:'راديو الاسترخاء',             sub:'موسيقى علاجية وأصوات طبيعية',     icon:Play,         color:'#0D9488', bg:'rgba(13,148,136,0.10)',  section:'روحي' },
    { href:'/meditation',          label:'التأمل والذهن',               sub:'اليقظة والحضور الكامل',           icon:Smile,        color:'#7C3AED', bg:'rgba(124,58,237,0.09)',  section:'روحي' },
    { href:'/breathe',             label:'تمارين التنفس',               sub:'جلسات تأمل واسترخاء عميق',        icon:Wind,         color:'#0891B2', bg:'rgba(8,145,178,0.09)',   section:'روحي' },
    /* ── أخرى */
    { href:'/sections/other',      label:'قسم أخرى — نظرة عامة',        sub:'الحساب، الخدمات والمواعيد',       icon:Settings,     color:'#475569', bg:'rgba(71,85,105,0.09)',  section:'أخرى', badge:'📋 قسم' },
    { href:'/book-appointment',    label:'احجز موعد',                  sub:'مع الدكتور مباشرة',               icon:Calendar,     color:'#0D9488', bg:'rgba(13,148,136,0.10)',  section:'أخرى', badge:'⚡ أولوية' },
    { href:'/my-care',             label:'رعايتي',                      sub:'خطة علاجك الكاملة',               icon:HeartPulse,   color:'#E11D48', bg:'rgba(225,29,72,0.08)',   section:'أخرى' },
    { href:'/my-appointments',     label:'مواعيدي',                     sub:'القادمة والسابقة',                 icon:Calendar,     color:'#0891B2', bg:'rgba(8,145,178,0.09)',   section:'أخرى' },
    { href:'/medical-file',        label:'الملف الطبي',                 sub:'سجلاتك وتقاريرك الطبية',          icon:FileText,     color:'#4F46E5', bg:'rgba(79,70,229,0.09)',   section:'أخرى' },
    { href:'/shop',                label:'الصيدلية والمكملات',          sub:'منتجات صحية بضمان الجودة',        icon:ShoppingBag,  color:'#059669', bg:'rgba(5,150,105,0.09)',   section:'أخرى', badge:'🌟 مميز' },
    { href:'/premium',             label:'طِبرَا+ المميز',             sub:'اشتراك VIP وبرامج حصرية',         icon:Crown,        color:'#7C3AED', bg:'rgba(124,58,237,0.09)',  section:'أخرى', badge:'👑 حصري' },
    { href:'/services',            label:'الخدمات الطبية',              sub:'قائمة كاملة بالخدمات المتاحة',   icon:Stethoscope,  color:'#0D9488', bg:'rgba(13,148,136,0.10)',  section:'أخرى' },
    { href:'/digital-services',    label:'الخدمات الرقمية',             sub:'الاستشارات والتحاليل الذكية',     icon:Zap,          color:'#2563EB', bg:'rgba(37,99,235,0.09)',   section:'أخرى' },
    { href:'/rewards',             label:'المكافآت والنقاط',            sub:'تحدياتك اليومية وجوائزك',         icon:Gift,         color:'#D97706', bg:'rgba(217,119,6,0.09)',   section:'أخرى' },
    { href:'/profile',             label:'ملفي الشخصي',                 sub:'بياناتك وتفضيلاتك الطبية',       icon:User,         color:'#0D9488', bg:'rgba(13,148,136,0.10)',  section:'أخرى' },
    { href:'/settings',            label:'الإعدادات',                   sub:'الإشعارات، المظهر، الخصوصية',    icon:Settings,     color:'#475569', bg:'rgba(71,85,105,0.09)',   section:'أخرى' },
    { href:'/help',                label:'المساعدة والدعم',             sub:'أسئلة شائعة، تواصل معنا',         icon:HelpCircle,   color:'#2563EB', bg:'rgba(37,99,235,0.09)',   section:'أخرى' },
    { href:'/about',               label:'عن طِبرَا',                  sub:'من نحن ورسالتنا الصحية',         icon:Info,         color:'#475569', bg:'rgba(71,85,105,0.09)',   section:'أخرى' },
];

export const SECTIONS_ORDER = ['جسدي', 'نفسي', 'فكري', 'روحي', 'أخرى'];

export const SECTION_META: Record<string, { emoji: string; color: string }> = {
    'جسدي': { emoji: '🫀', color: '#0D9488' },
    'نفسي': { emoji: '🧠', color: '#7C3AED' },
    'فكري': { emoji: '📚', color: '#D97706' },
    'روحي': { emoji: '✨', color: '#2563EB' },
    'أخرى': { emoji: '⚙️', color: '#475569' },
};

export const QUICK: { href: string; icon: React.ElementType; label: string; color: string; glow: string }[] = [
    { href:'/book-appointment', icon:Calendar,     label:'موعد',    color:'#0D9488', glow:'rgba(13,148,136,0.12)' },
    { href:'/tayyibat',         icon:Utensils,     label:'الطيبات', color:'#059669', glow:'rgba(5,150,105,0.10)'  },
    { href:'/tayyibat/tracker', icon:ClipboardList, label:'يومي',  color:'#0891B2', glow:'rgba(8,145,178,0.10)'  },
    { href:'/shop',             icon:ShoppingBag,  label:'صيدلية',  color:'#EA580C', glow:'rgba(234,88,12,0.10)'  },
    { href:'/rewards',          icon:Gift,         label:'نقاطي',   color:'#D97706', glow:'rgba(217,119,6,0.10)'  },
];

export const TODAY_GRADIENTS = [
    'linear-gradient(135deg,#0D9488,#059669)',
    'linear-gradient(135deg,#4F46E5,#7C3AED)',
    'linear-gradient(135deg,#D97706,#EA580C)',
];

export const SP      = { type: 'spring' as const, stiffness: 460, damping: 36 };
export const SP_SLOW = { type: 'spring' as const, stiffness: 300, damping: 32 };
