import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowRight, HelpCircle, Search, ChevronDown, ChevronUp,
    MessageCircle, Phone, Mail, Clock, BookOpen, Calendar,
    CreditCard, Shield, Heart, Sparkles, ExternalLink
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const faqCategories = [
    { id: 'general', label: 'عام', icon: HelpCircle },
    { id: 'appointments', label: 'المواعيد', icon: Calendar },
    { id: 'payments', label: 'الدفع', icon: CreditCard },
    { id: 'health', label: 'الصحة', icon: Heart },
    { id: 'account', label: 'الحساب', icon: Shield },
];

const faqData: FAQItem[] = [
    // General
    {
        question: 'ما هو طِبرَا؟',
        answer: 'طِبرَا هي عيادة رقمية متخصصة في الطب الوظيفي والتكاملي. نقدم استشارات طبية متخصصة، برامج علاجية شخصية، ومتابعة مستمرة لتحقيق الصحة الشاملة.',
        category: 'general'
    },
    {
        question: 'ما هو الطب الوظيفي؟',
        answer: 'الطب الوظيفي هو نهج طبي يركز على معالجة الأسباب الجذرية للأمراض بدلاً من علاج الأعراض فقط. نحلل الجسم ككل متكامل ونضع خطة علاجية شخصية تناسب احتياجاتك.',
        category: 'general'
    },
    {
        question: 'هل الخدمات متاحة لجميع الدول؟',
        answer: 'نعم، جميع الاستشارات تتم عن بُعد عبر مكالمات الفيديو، لذا يمكنك الاستفادة من خدماتنا من أي مكان في العالم.',
        category: 'general'
    },
    // Appointments
    {
        question: 'كيف أحجز موعداً؟',
        answer: 'يمكنك حجز موعد من خلال الذهاب إلى صفحة "حجز موعد" واختيار نوع الجلسة، التاريخ والوقت المناسب، ثم إدخال بياناتك الشخصية وتأكيد الحجز.',
        category: 'appointments'
    },
    {
        question: 'ما هي أنواع الجلسات المتاحة؟',
        answer: '1. الجلسة التشخيصية (45-60 دقيقة): تحليل شامل لحالتك الصحية.\n2. جلسة المتابعة (30 دقيقة): متابعة تقدمك.\n3. استشارة سريعة (15 دقيقة): لسؤال محدد.',
        category: 'appointments'
    },
    {
        question: 'هل يمكنني إلغاء أو تأجيل الموعد؟',
        answer: 'نعم، يمكنك إلغاء أو تأجيل الموعد قبل 24 ساعة على الأقل من خلال التواصل معنا عبر واتساب.',
        category: 'appointments'
    },
    {
        question: 'هل يمكنني الحجز لنفس اليوم؟',
        answer: 'نعم، يمكنك الحجز لنفس اليوم إذا كانت هناك أوقات متاحة. الاستشارة السريعة متاحة عادة في نفس اليوم.',
        category: 'appointments'
    },
    // Payments
    {
        question: 'ما هي طرق الدفع المتاحة؟',
        answer: 'نقبل الدفع عبر التحويل البنكي، الدفع الإلكتروني، أو من خلال خدمات الدفع المحلية. سيتم إرسال تفاصيل الدفع بعد تأكيد الحجز.',
        category: 'payments'
    },
    {
        question: 'ما هي أسعار الجلسات؟',
        answer: 'الجلسة التشخيصية: 350 ر.ي\nجلسة المتابعة: 200 ر.ي\nالاستشارة السريعة: 100 ر.ي',
        category: 'payments'
    },
    {
        question: 'هل يمكنني استرداد المبلغ؟',
        answer: 'يمكن استرداد المبلغ كاملاً إذا تم الإلغاء قبل 24 ساعة من الموعد. بعد ذلك، يتم خصم رسوم إدارية بسيطة.',
        category: 'payments'
    },
    // Health
    {
        question: 'ما هي الحالات التي تعالجونها؟',
        answer: 'نتعامل مع مجموعة واسعة من الحالات منها: مشاكل الجهاز الهضمي، الأمراض المناعية، اختلالات الهرمونات، التعب المزمن، مشاكل النوم، وغيرها.',
        category: 'health'
    },
    {
        question: 'هل تحتاجون تحاليل قبل الجلسة؟',
        answer: 'يفضل إحضار أي تحاليل أو تقارير طبية سابقة إن وجدت، لكنها ليست إلزامية للجلسة الأولى. قد يُطلب منك إجراء تحاليل محددة لاحقاً.',
        category: 'health'
    },
    {
        question: 'هل العلاج طبيعي أم أدوية؟',
        answer: 'نستخدم نهجاً تكاملياً يجمع بين التغذية العلاجية، المكملات الطبيعية، تعديل نمط الحياة، والأدوية عند الضرورة.',
        category: 'health'
    },
    // Account
    {
        question: 'كيف أنشئ حساباً؟',
        answer: 'يمكنك إنشاء حساب من خلال صفحة التسجيل بإدخال بريدك الإلكتروني وكلمة المرور، أو التسجيل بحساب جوجل.',
        category: 'account'
    },
    {
        question: 'هل بياناتي آمنة؟',
        answer: 'نعم، نحن نلتزم بأعلى معايير الأمان والخصوصية. جميع بياناتك الصحية مشفرة ومحمية ولا يتم مشاركتها مع أي جهة خارجية.',
        category: 'account'
    },
    {
        question: 'كيف أغير كلمة المرور؟',
        answer: 'يمكنك تغيير كلمة المرور من خلال الإعدادات > الأمان والخصوصية > تغيير كلمة المرور.',
        category: 'account'
    },
];

export default function Help() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);

    const toggleQuestion = (index: number) => {
        setExpandedQuestions(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const filteredFAQ = faqData.filter(item => {
        const matchesSearch = searchQuery === '' ||
            item.question.includes(searchQuery) ||
            item.answer.includes(searchQuery);
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#2D9B83] via-[#3FB39A] to-[#2D9B83] text-white px-6 py-8 rounded-b-[2.5rem] relative overflow-hidden">
                {/* Decorations */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#D4AF37]/20 rounded-full blur-2xl" />

                {/* Back Button */}
                <Link href="/profile" className="absolute top-6 right-6">
                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full">
                        <ArrowRight className="w-6 h-6" />
                    </Button>
                </Link>

                <div className="relative pt-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <HelpCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">مركز المساعدة</h1>
                    <p className="text-white/80 text-sm">كيف يمكننا مساعدتك؟</p>
                </div>

                {/* Search */}
                <div className="relative mt-6">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث عن سؤالك..."
                        className="w-full h-12 pr-12 rounded-xl bg-white dark:bg-slate-800 border-0 text-slate-800 dark:text-white"
                    />
                </div>
            </div>

            <div className="px-4 -mt-4 relative z-10 space-y-6">

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <a
                        href="https://wa.me/967771447111"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-3"
                    >
                        <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 dark:text-white text-sm">واتساب</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">تواصل مباشر</p>
                        </div>
                    </a>

                    <a
                        href="tel:+967771447111"
                        className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-3"
                    >
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Phone className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 dark:text-white text-sm">اتصال</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">+967 771 447 111</p>
                        </div>
                    </a>
                </div>

                {/* Category Tabs */}
                <div className="overflow-x-auto pb-2 -mx-4 px-4">
                    <div className="flex gap-2 min-w-max">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === 'all'
                                ? 'bg-[#2D9B83] text-white'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            الكل
                        </button>
                        {faqCategories.map(cat => {
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${selectedCategory === cat.id
                                        ? 'bg-[#2D9B83] text-white'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* FAQ List */}
                <div className="space-y-3">
                    <h2 className="font-bold text-slate-800 dark:text-white px-1">الأسئلة الشائعة</h2>

                    {filteredFAQ.length > 0 ? (
                        filteredFAQ.map((item, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleQuestion(index)}
                                    className="w-full p-4 flex items-center justify-between text-right"
                                >
                                    <span className="font-medium text-slate-800 dark:text-white flex-1 pr-2">
                                        {item.question}
                                    </span>
                                    {expandedQuestions.includes(index) ? (
                                        <ChevronUp className="w-5 h-5 text-[#2D9B83] flex-shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                    )}
                                </button>

                                {expandedQuestions.includes(index) && (
                                    <div className="px-4 pb-4 pt-0">
                                        <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-line">
                                                {item.answer}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-500 dark:text-slate-400">لم يتم العثور على نتائج</p>
                            <p className="text-sm text-slate-400 mt-1">جرب البحث بكلمات مختلفة</p>
                        </div>
                    )}
                </div>

                {/* Contact Section */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white">
                    <div className="text-center mb-4">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 text-[#D4AF37]" />
                        <h3 className="font-bold text-lg">لم تجد إجابة لسؤالك؟</h3>
                        <p className="text-sm text-slate-400 mt-1">تواصل معنا مباشرة وسنسعد بمساعدتك</p>
                    </div>

                    <a
                        href="https://wa.me/967771447111?text=مرحباً، لدي سؤال..."
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button className="w-full h-12 bg-green-500 hover:bg-green-600 rounded-xl font-bold">
                            <MessageCircle className="w-5 h-5 ml-2" />
                            تواصل عبر واتساب
                        </Button>
                    </a>
                </div>

                {/* Working Hours */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                        <Clock className="w-5 h-5 text-[#2D9B83]" />
                        <h3 className="font-bold text-slate-800 dark:text-white">أوقات العمل</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">السبت - الخميس</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">9:00 ص - 5:00 م</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">الجمعة</span>
                            <span className="font-medium text-red-500">مغلق</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
