// contexts/LanguageContext.tsx
// i18n system with Arabic (default) and English support

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// ============================================
// TYPES
// ============================================

export type Language = 'ar' | 'en';
export type TranslationKey = keyof typeof translations.ar;

// ============================================
// TRANSLATIONS
// ============================================

export const translations = {
    ar: {
        // Navigation
        'nav.home': 'الرئيسية',
        'nav.services': 'خدماتنا',
        'nav.shop': 'المتجر',
        'nav.courses': 'الدورات',
        'nav.library': 'المكتبة',
        'nav.profile': 'حسابي',
        'nav.settings': 'الإعدادات',
        'nav.help': 'المساعدة',
        'nav.about': 'من نحن',
        'nav.login': 'تسجيل الدخول',
        'nav.logout': 'تسجيل الخروج',
        'nav.search': 'ابحث عن أي شيء...',

        // Health Tracker
        'health.title': 'المتابع الصحي',
        'health.subtitle': 'تتبع صحتك يومياً',
        'health.water': 'شرب الماء',
        'health.sleep': 'النوم',
        'health.mood': 'المزاج',
        'health.weight': 'الوزن',
        'health.fasting': 'الصيام',
        'health.medication': 'الأدوية',
        'health.breathing': 'تمارين التنفس',
        'health.journal': 'اليوميات',
        'health.analysis': 'تحليل ذكي',
        'health.history': 'السجل',

        // Shop & Checkout
        'shop.title': 'المتجر',
        'shop.subtitle': 'مكملات ومنتجات صحية',
        'shop.search': 'ابحث عن منتج...',
        'shop.addToCart': 'أضف للسلة',
        'shop.cart': 'سلة التسوق',
        'shop.empty': 'السلة فارغة',
        'shop.total': 'الإجمالي',
        'shop.subtotal': 'المجموع الفرعي',
        'shop.shipping': 'الشحن',
        'shop.freeShipping': 'مجاني',
        'shop.coupon': 'عندك كود خصم؟',
        'shop.couponApply': 'تطبيق',
        'shop.couponDiscount': 'خصم الكوبون',
        'shop.checkout': 'إتمام الشراء',
        'shop.whatsapp': 'الدفع عند الاستلام',
        'shop.payOnline': 'دفع إلكتروني',
        'shop.orderComplete': 'تم استلام طلبك!',
        'shop.continueShopping': 'متابعة التسوق',
        'shop.quantity': 'الكمية',
        'shop.noProducts': 'لا توجد منتجات',

        // Courses
        'courses.title': 'الدورات التعليمية',
        'courses.progress': 'تقدمك في الدورة',
        'courses.lessons': 'درس',
        'courses.completed': 'مكتمل',
        'courses.congrats': 'مبروك! أكملت الدورة 🎉',
        'courses.enrolled': 'مسجل',
        'courses.free': 'مجاني',
        'courses.enroll': 'سجل الآن',

        // AI Assistant
        'ai.title': 'مساعد طِبرَا',
        'ai.placeholder': 'اكتب سؤالك هنا...',
        'ai.listening': 'جاري الاستماع...',
        'ai.thinking': '💭 يفكر...',
        'ai.writing': '✍️ يكتب...',
        'ai.available': '🟢 متاح الآن',
        'ai.welcome': 'مرحباً بك! أنا مساعدك الصحي الذكي 🌿',
        'ai.tryQuestions': 'جرّب أحد هذه الأسئلة:',
        'ai.clearChat': 'تم مسح المحادثة.',

        // Appointments
        'appointments.title': 'حجز موعد',
        'appointments.book': 'احجز الآن',
        'appointments.myAppointments': 'مواعيدي',

        // General
        'general.loading': 'جاري التحميل...',
        'general.error': 'حدث خطأ',
        'general.retry': 'إعادة المحاولة',
        'general.save': 'حفظ',
        'general.cancel': 'إلغاء',
        'general.delete': 'حذف',
        'general.edit': 'تعديل',
        'general.back': 'رجوع',
        'general.next': 'التالي',
        'general.sar': 'ر.س',
        'general.noResults': 'لا توجد نتائج',

        // Settings
        'settings.title': 'الإعدادات',
        'settings.language': 'اللغة',
        'settings.arabic': 'العربية',
        'settings.english': 'English',
        'settings.darkMode': 'الوضع الداكن',
        'settings.notifications': 'الإشعارات',
        'settings.account': 'الحساب',
        'settings.privacy': 'الخصوصية',
        'settings.about': 'عن التطبيق',

        // Onboarding
        'onboarding.welcome': 'مرحباً بك في طِبرَا',
        'onboarding.subtitle': 'عيادتك الرقمية المتكاملة — صحتك تبدأ من هنا 💚',
        'onboarding.skip': 'تخطي',
        'onboarding.next': 'التالي',
        'onboarding.start': 'ابدأ تجربتك',
        'onboarding.nameQuestion': 'ما اسمك الجميل؟',
        'onboarding.interestsQuestion': 'ما الذي يهمك صحياً؟',
        'onboarding.ready': 'كل شيء جاهز!',

        // Meal Planner
        'meal.title': 'تخطيط الوجبات 🥗',
        'meal.subtitle': 'خطة غذائية مخصصة',
        'meal.plan': 'الخطة',
        'meal.foods': 'الأطعمة',
        'meal.recipes': 'الوصفات',
        'meal.analytics': 'التحليل',
        'meal.addFood': 'إضافة طعام',
        'meal.addedSuccess': 'تمت إضافة الوجبة',
        'meal.removedSuccess': 'تم حذف الوجبة',
        'meal.breakfast': 'فطور',
        'meal.lunch': 'غداء',
        'meal.dinner': 'عشاء',
        'meal.snack': 'وجبة خفيفة',
        'meal.calories': 'سعرات',
        'meal.protein': 'بروتين',
        'meal.carbs': 'كربوهيدرات',
        'meal.fat': 'دهون',
        'meal.goals': 'الأهداف والحالة الصحية',
        'meal.savedSettings': 'تم حفظ الإعدادات',
        'meal.searchPlaceholder': 'ابحث عن طعام...',
        'meal.noMeals': 'لا توجد وجبات بعد',
        'meal.dailyTip': 'نصيحة اليوم',

        // Medical File
        'medical.title': 'ملفي الطبي',
        'medical.subtitle': 'كل بياناتك الصحية في مكان واحد',
        'medical.personalData': 'البيانات الشخصية',
        'medical.chronicConditions': 'الحالات المزمنة',
        'medical.allergies': 'الحساسية',
        'medical.addCondition': 'إضافة حالة مزمنة',
        'medical.addAllergy': 'إضافة حساسية',
        'medical.uploadDoc': 'إضافة مستند طبي',
        'medical.uploadSubtitle': 'ارفع نتائج التحاليل أو التقارير الطبية',
        'medical.files': 'الملفات',
        'medical.labs': 'المختبر',
        'medical.noFiles': 'لا توجد ملفات مرفقة بعد',
        'medical.bloodType': 'فصيلة الدم',
        'medical.weight': 'الوزن',
        'medical.height': 'الطول',
        'medical.age': 'العمر',
        'medical.enterName': 'أدخل اسمك',
        'medical.saved': 'تم حفظ البيانات',

        // Health Tracker (additions)
        'health.steps': 'الخطوات',
        'health.addEntry': 'إضافة سجل',

        // Fitness
        'fitness.title': 'اختبار اللياقة',
        'fitness.startTest': 'ابدأ الاختبار',
        'fitness.results': 'النتائج',

        // Admin
        'admin.title': 'لوحة القيادة',
        'admin.overview': 'نظرة عامة',
        'admin.welcome': 'مرحباً بك مرة أخرى، د. عمر 👋',
        'admin.users': 'إدارة المستخدمين',
        'admin.products': 'إدارة المنتجات',
        'admin.appointments': 'إدارة المواعيد',
        'admin.latestAppointments': 'آخر المواعيد',
        'admin.viewAll': 'عرض الكل',
        'admin.analytics': 'التحليلات المتقدمة',
        'admin.login': 'تسجيل الدخول الآمن',
        'admin.passcode': 'رمز الدخول السري',

        // Common UI
        'common.search': 'بحث',
        'common.filter': 'تصفية',
        'common.all': 'الكل',
        'common.add': 'إضافة',
        'common.remove': 'حذف',
        'common.confirm': 'تأكيد',
        'common.close': 'إغلاق',
        'common.open': 'فتح',
        'common.yes': 'نعم',
        'common.no': 'لا',
        'common.noData': 'لا توجد بيانات',
        'common.refresh': 'تحديث',
    },

    en: {
        // Navigation
        'nav.home': 'Home',
        'nav.services': 'Services',
        'nav.shop': 'Shop',
        'nav.courses': 'Courses',
        'nav.library': 'Library',
        'nav.profile': 'My Account',
        'nav.settings': 'Settings',
        'nav.help': 'Help',
        'nav.about': 'About Us',
        'nav.login': 'Sign In',
        'nav.logout': 'Sign Out',
        'nav.search': 'Search anything...',

        // Health Tracker
        'health.title': 'Health Tracker',
        'health.subtitle': 'Track your health daily',
        'health.water': 'Water Intake',
        'health.sleep': 'Sleep',
        'health.mood': 'Mood',
        'health.weight': 'Weight',
        'health.fasting': 'Fasting',
        'health.medication': 'Medication',
        'health.breathing': 'Breathing',
        'health.journal': 'Journal',
        'health.analysis': 'AI Analysis',
        'health.history': 'History',

        // Shop & Checkout
        'shop.title': 'Shop',
        'shop.subtitle': 'Health supplements & products',
        'shop.search': 'Search products...',
        'shop.addToCart': 'Add to Cart',
        'shop.cart': 'Shopping Cart',
        'shop.empty': 'Cart is empty',
        'shop.total': 'Total',
        'shop.subtotal': 'Subtotal',
        'shop.shipping': 'Shipping',
        'shop.freeShipping': 'Free',
        'shop.coupon': 'Have a coupon code?',
        'shop.couponApply': 'Apply',
        'shop.couponDiscount': 'Coupon Discount',
        'shop.checkout': 'Checkout',
        'shop.whatsapp': 'Cash on Delivery',
        'shop.payOnline': 'Pay Online',
        'shop.orderComplete': 'Order received!',
        'shop.continueShopping': 'Continue Shopping',
        'shop.quantity': 'Quantity',
        'shop.noProducts': 'No products found',

        // Courses
        'courses.title': 'Courses',
        'courses.progress': 'Your Progress',
        'courses.lessons': 'lessons',
        'courses.completed': 'completed',
        'courses.congrats': 'Congratulations! Course completed 🎉',
        'courses.enrolled': 'Enrolled',
        'courses.free': 'Free',
        'courses.enroll': 'Enroll Now',

        // AI Assistant
        'ai.title': 'Tibrah Assistant',
        'ai.placeholder': 'Ask your question...',
        'ai.listening': 'Listening...',
        'ai.thinking': '💭 Thinking...',
        'ai.writing': '✍️ Writing...',
        'ai.available': '🟢 Available',
        'ai.welcome': 'Hi! I\'m your smart health assistant 🌿',
        'ai.tryQuestions': 'Try one of these questions:',
        'ai.clearChat': 'Chat cleared.',

        // Appointments
        'appointments.title': 'Book Appointment',
        'appointments.book': 'Book Now',
        'appointments.myAppointments': 'My Appointments',

        // General
        'general.loading': 'Loading...',
        'general.error': 'An error occurred',
        'general.retry': 'Retry',
        'general.save': 'Save',
        'general.cancel': 'Cancel',
        'general.delete': 'Delete',
        'general.edit': 'Edit',
        'general.back': 'Back',
        'general.next': 'Next',
        'general.sar': 'SAR',
        'general.noResults': 'No results found',

        // Settings
        'settings.title': 'Settings',
        'settings.language': 'Language',
        'settings.arabic': 'العربية',
        'settings.english': 'English',
        'settings.darkMode': 'Dark Mode',
        'settings.notifications': 'Notifications',
        'settings.account': 'Account',
        'settings.privacy': 'Privacy',
        'settings.about': 'About App',

        // Onboarding
        'onboarding.welcome': 'Welcome to Tibrah',
        'onboarding.subtitle': 'Your digital clinic — your health starts here 💚',
        'onboarding.skip': 'Skip',
        'onboarding.next': 'Next',
        'onboarding.start': 'Get Started',
        'onboarding.nameQuestion': 'What\'s your name?',
        'onboarding.interestsQuestion': 'What are your health interests?',
        'onboarding.ready': 'All set!',

        // Meal Planner
        'meal.title': 'Meal Planning 🥗',
        'meal.subtitle': 'Personalized nutrition plan',
        'meal.plan': 'Plan',
        'meal.foods': 'Foods',
        'meal.recipes': 'Recipes',
        'meal.analytics': 'Analytics',
        'meal.addFood': 'Add Food',
        'meal.addedSuccess': 'Meal added',
        'meal.removedSuccess': 'Meal removed',
        'meal.breakfast': 'Breakfast',
        'meal.lunch': 'Lunch',
        'meal.dinner': 'Dinner',
        'meal.snack': 'Snack',
        'meal.calories': 'Calories',
        'meal.protein': 'Protein',
        'meal.carbs': 'Carbs',
        'meal.fat': 'Fat',
        'meal.goals': 'Goals & Health Status',
        'meal.savedSettings': 'Settings saved',
        'meal.searchPlaceholder': 'Search for food...',
        'meal.noMeals': 'No meals yet',
        'meal.dailyTip': 'Daily Tip',

        // Medical File
        'medical.title': 'Medical File',
        'medical.subtitle': 'All your health data in one place',
        'medical.personalData': 'Personal Data',
        'medical.chronicConditions': 'Chronic Conditions',
        'medical.allergies': 'Allergies',
        'medical.addCondition': 'Add Chronic Condition',
        'medical.addAllergy': 'Add Allergy',
        'medical.uploadDoc': 'Add Medical Document',
        'medical.uploadSubtitle': 'Upload test results or medical reports',
        'medical.files': 'Files',
        'medical.labs': 'Lab Results',
        'medical.noFiles': 'No files attached yet',
        'medical.bloodType': 'Blood Type',
        'medical.weight': 'Weight',
        'medical.height': 'Height',
        'medical.age': 'Age',
        'medical.enterName': 'Enter your name',
        'medical.saved': 'Data saved',

        // Health Tracker (additions)
        'health.steps': 'Steps',
        'health.addEntry': 'Add Entry',

        // Fitness
        'fitness.title': 'Fitness Test',
        'fitness.startTest': 'Start Test',
        'fitness.results': 'Results',

        // Admin
        'admin.title': 'Control Panel',
        'admin.overview': 'Overview',
        'admin.welcome': 'Welcome back, Dr. Omar 👋',
        'admin.users': 'User Management',
        'admin.products': 'Product Management',
        'admin.appointments': 'Appointment Management',
        'admin.latestAppointments': 'Latest Appointments',
        'admin.viewAll': 'View All',
        'admin.analytics': 'Advanced Analytics',
        'admin.login': 'Secure Login',
        'admin.passcode': 'Access Code',

        // Common UI
        'common.search': 'Search',
        'common.filter': 'Filter',
        'common.all': 'All',
        'common.add': 'Add',
        'common.remove': 'Remove',
        'common.confirm': 'Confirm',
        'common.close': 'Close',
        'common.open': 'Open',
        'common.yes': 'Yes',
        'common.no': 'No',
        'common.noData': 'No data available',
        'common.refresh': 'Refresh',
    },
} as const;

// ============================================
// CONTEXT
// ============================================

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
    dir: 'rtl' | 'ltr';
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
    language: 'ar',
    setLanguage: () => { },
    t: (key) => key,
    dir: 'rtl',
    isRTL: true,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('ar');

    // Load saved language
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('tibrah_language') as Language;
            if (saved && (saved === 'ar' || saved === 'en')) {
                setLanguageState(saved);
            }
        }
    }, []);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        if (typeof window !== 'undefined') {
            localStorage.setItem('tibrah_language', lang);
            // Update document direction
            document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = lang;
        }
    }, []);

    const t = useCallback((key: TranslationKey): string => {
        return translations[language][key] || translations['ar'][key] || key;
    }, [language]);

    const dir = language === 'ar' ? 'rtl' : 'ltr';
    const isRTL = language === 'ar';

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dir, isRTL }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}

export default LanguageContext;
