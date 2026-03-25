import React from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, AlertTriangle, ShoppingBag, Scale, RefreshCw, Mail } from 'lucide-react';

export default function Terms() {
    const lastUpdated = '2026-03-24';

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors mb-6">
                        <ArrowRight className="w-4 h-4" />
                        العودة للرئيسية
                    </Link>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 dark:text-white">الشروط والأحكام</h1>
                            <p className="text-sm text-slate-500">آخر تحديث: {lastUpdated}</p>
                        </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        باستخدامك لتطبيق طِبرَا، فإنك توافق على الشروط والأحكام التالية. يرجى قراءتها بعناية.
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {/* Section 1 — Medical Disclaimer */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">١. إخلاء المسؤولية الطبية</h2>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-3">
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                                <p className="text-red-800 dark:text-red-300 text-xs font-bold leading-relaxed">
                                    ⚠️ تطبيق طِبرَا ليس خدمة طوارئ. في حالات الطوارئ أو الحالات العاجلة، اتصل بخدمات الطوارئ المحلية أو توجّه إلى أقرب قسم طوارئ فوراً.
                                </p>
                            </div>
                            <ul className="list-disc list-inside space-y-2 pr-4 mt-3">
                                <li>تطبيق طِبرَا أداة مساعدة للتوعية الصحية والتقييم الأولي. <strong>لا يُعدّ بديلاً</strong> عن الفحص الطبي المباشر أو التشخيص أو العلاج من قِبل طبيب مختص.</li>
                                <li>أي تحليل أو تقييم يُقدّمه التطبيق هو تقدير أولي وليس تشخيصاً طبياً نهائياً.</li>
                                <li>لا تتخذ قرارات علاجية بناءً على نتائج التطبيق وحده. استشر طبيبك دائماً.</li>
                                <li>تطبيق طِبرَا لا يتحمل أي مسؤولية عن قرارات طبية يتخذها المستخدم بناءً على محتوى التطبيق دون مراجعة طبيب مختص.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 2 — Nature of Service */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <Scale className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">٢. طبيعة الخدمة</h2>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-3">
                            <ul className="list-disc list-inside space-y-2 pr-4">
                                <li>يُقدّم تطبيق طِبرَا خدمات رقمية تشمل: الفحص الذاتي للأعراض، تتبع المؤشرات الصحية، المحتوى التثقيفي الصحي، وحجز المواعيد الطبية.</li>
                                <li>جميع الخدمات الرقمية مُقدّمة من طِبرَا / Dr. Omar Clinic.</li>
                                <li>قد تتغير الخدمات المُتاحة أو تتوسع مع تطور التطبيق.</li>
                                <li>نحتفظ بالحق في تعديل أو إيقاف أي ميزة مع إخطار مسبق عبر التطبيق عند الإمكان.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 3 — User Obligations */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">٣. التزامات المستخدم</h2>
                        <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-3">
                            <ul className="list-disc list-inside space-y-2 pr-4">
                                <li>تقديم معلومات صحيحة ودقيقة عند إنشاء الحساب وعند استخدام أدوات الفحص الذاتي.</li>
                                <li>الحفاظ على سرية بيانات الدخول وعدم مشاركتها مع الآخرين.</li>
                                <li>عدم استخدام التطبيق لأغراض غير مشروعة أو مخالفة لهذه الشروط.</li>
                                <li>إبلاغنا فوراً في حال اكتشاف أي استخدام غير مصرّح به لحسابك.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 4 — Shop & Purchases */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <ShoppingBag className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">٤. الصيدلية والمكملات</h2>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-3">
                            <ul className="list-disc list-inside space-y-2 pr-4">
                                <li>المنتجات المعروضة في الصيدلية هي مكملات صحية وعلاجات مساعدة وليست أدوية وصفية بديلة للطوارئ.</li>
                                <li>الأسعار المعروضة بالريال السعودي وقابلة للتغيير دون إشعار مسبق.</li>
                                <li>سياسة الإرجاع والاستبدال تخضع لطبيعة المنتج وحالته عند الاستلام.</li>
                                <li>طِبرَا ليست مسؤولة عن ردود الفعل الفردية تجاه أي منتج. استشر طبيبك قبل استخدام أي مكمّل غذائي جديد.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 5 — Intellectual Property */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">٥. الملكية الفكرية</h2>
                        <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-3">
                            <ul className="list-disc list-inside space-y-2 pr-4">
                                <li>جميع المحتويات والتصميمات والشعارات والأكواد البرمجية في تطبيق طِبرَا مملوكة لطِبرَا / Dr. Omar Clinic.</li>
                                <li>لا يجوز نسخ أو إعادة توزيع أو استخدام أي محتوى من التطبيق تجارياً دون إذن كتابي مسبق.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 6 — Changes */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <RefreshCw className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">٦. التعديلات على الشروط</h2>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سنُعلمك بأي تغييرات جوهرية عبر التطبيق. استمرارك في استخدام التطبيق بعد التعديل يُعتبر قبولاً للشروط المُحدّثة.
                        </p>
                    </section>

                    {/* Section 7 — Contact */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">٧. التواصل</h2>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-3">
                            <p>لأي استفسار حول هذه الشروط:</p>
                            <ul className="list-disc list-inside space-y-2 pr-4">
                                <li>البريد الإلكتروني: <a href="mailto:dr.omaralemad@gmail.com" className="text-indigo-600 underline" dir="ltr">dr.omaralemad@gmail.com</a></li>
                                <li>صفحة <Link href="/help" className="text-indigo-600 underline">المساعدة والدعم</Link> داخل التطبيق</li>
                            </ul>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-500">
                        طِبرَا / Dr. Omar Clinic — جميع الحقوق محفوظة
                    </p>
                    <Link href="/privacy" className="text-xs text-indigo-600 hover:underline mt-2 inline-block">
                        اقرأ سياسة الخصوصية ←
                    </Link>
                </div>
            </div>
        </div>
    );
}
